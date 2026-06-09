<?php

namespace App\Http\Controllers\Api;

use App\DTOs\PaginationData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Community\StoreCommunityRequest;
use App\Http\Requests\Community\UpdateCommunityRequest;
use App\Http\Resources\Community\CommunityMembershipRequestResource;
use App\Http\Resources\Community\CommunityResource;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Notifications\CommunityRequestApprovedNotification;
use App\Notifications\CommunityRequestRejectedNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    /**
     * Display a listing of communities.
     */
    public function index(Request $request)
    {
        $pagination = PaginationData::fromRequest($request, 12, 50);

        $communities = Community::query()
            ->with([
                'user:id,name,avatar',
                'memberships' => fn ($query) => $query->where('user_id', $request->user()->id),
            ])
            ->withCount([
                'approvedMemberships as members_count',
                'pendingMemberships as pending_requests_count',
            ])
            ->when($request->filled('q'), function ($query) use ($request) {
                $this->applySearch($query, (string) $request->string('q')->trim());
            })
            ->latest()
            ->paginate($pagination->perPage);

        return CommunityResource::collection($communities);
    }

    /**
     * Display a single community.
     */
    public function show(Request $request, Community $community): CommunityResource
    {
        $this->authorize('view', $community);
        $this->loadCommunityState($community, $request->user()->id);

        return CommunityResource::make($community);
    }

    /**
     * Store a newly created community.
     */
    public function store(StoreCommunityRequest $request): JsonResponse
    {
        $this->authorize('create', Community::class);

        $community = $request->user()->createdCommunities()->create($request->validated());

        $community->memberships()->create([
            'user_id' => $request->user()->id,
            'role' => 'admin',
            'status' => 'approved',
        ]);

        $this->loadCommunityState($community, $request->user()->id);

        return CommunityResource::make($community)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing community.
     */
    public function update(UpdateCommunityRequest $request, Community $community): CommunityResource
    {
        $this->authorize('update', $community);
        $community->update($request->validated());
        $this->loadCommunityState($community, $request->user()->id);

        return CommunityResource::make($community);
    }

    /**
     * Join a public community or request access to a private community.
     */
    public function join(Request $request, Community $community): JsonResponse
    {
        $this->authorize('join', $community);

        $membership = $community->memberships()->firstOrNew([
            'user_id' => $request->user()->id,
        ]);

        if ($membership->exists && $membership->status === 'approved') {
            $message = 'Vous etes deja membre de cette communaute.';
        } elseif ($community->is_private) {
            $membership->fill([
                'role' => $membership->role ?: 'member',
                'status' => 'pending',
            ])->save();

            $message = "Demande d'adhesion envoyee. En attente d'approbation.";
        } else {
            $membership->fill([
                'role' => $membership->role ?: 'member',
                'status' => 'approved',
            ])->save();

            $message = 'Vous avez rejoint la communaute.';
        }

        $this->loadCommunityState($community, $request->user()->id);

        return response()->json([
            'message' => $message,
            'data' => CommunityResource::make($community)->resolve(),
        ]);
    }

    /**
     * Leave a community.
     */
    public function leave(Request $request, Community $community): JsonResponse
    {
        $this->authorize('leave', $community);

        $membership = $community->memberships()
            ->where('user_id', $request->user()->id)
            ->first();

        abort_unless($membership, 404);

        if ($membership->role === 'admin' && $membership->status === 'approved') {
            $approvedAdminsCount = $community->memberships()
                ->where('status', 'approved')
                ->where('role', 'admin')
                ->count();

            abort_if($approvedAdminsCount <= 1, 422, 'Le dernier admin ne peut pas quitter la communaute.');
        }

        $membership->delete();
        $this->loadCommunityState($community, $request->user()->id);

        return response()->json([
            'message' => 'Vous avez quitte la communaute.',
            'data' => CommunityResource::make($community)->resolve(),
        ]);
    }

    /**
     * Display pending requests for a private community admin.
     */
    public function pendingRequests(Request $request, Community $community)
    {
        $this->authorize('manageRequests', $community);
        $pagination = PaginationData::fromRequest($request, 20, 50);

        $pendingRequests = $community->pendingMemberships()
            ->with('user:id,name,email,avatar,city,country')
            ->latest()
            ->paginate($pagination->perPage);

        return CommunityMembershipRequestResource::collection($pendingRequests);
    }

    /**
     * Approve a pending community request.
     */
    public function approveRequest(
        Request $request,
        Community $community,
        CommunityMember $membership,
    ): JsonResponse {
        $this->authorize('manageRequests', $community);
        $this->ensurePendingMembership($community, $membership);

        $membership->loadMissing('user');
        $membership->update([
            'status' => 'approved',
            'role' => $membership->role ?: 'member',
        ]);

        if ($membership->user) {
            $membership->user->notify(new CommunityRequestApprovedNotification($community));
        }

        $this->loadCommunityState($community, $request->user()->id);
        $membership->refresh()->load('user:id,name,email,avatar,city,country');

        return response()->json([
            'message' => 'Demande approuvee avec succes.',
            'data' => CommunityMembershipRequestResource::make($membership)->resolve(),
            'community' => CommunityResource::make($community)->resolve(),
        ]);
    }

    /**
     * Reject a pending community request.
     */
    public function rejectRequest(
        Request $request,
        Community $community,
        CommunityMember $membership,
    ): JsonResponse {
        $this->authorize('manageRequests', $community);
        $this->ensurePendingMembership($community, $membership);

        $membership->loadMissing('user:id,name,email,avatar,city,country');
        $membershipData = CommunityMembershipRequestResource::make($membership)->resolve();

        if ($membership->user) {
            $membership->user->notify(new CommunityRequestRejectedNotification($community));
        }

        $membership->delete();
        $this->loadCommunityState($community, $request->user()->id);

        return response()->json([
            'message' => 'Demande refusee.',
            'data' => $membershipData,
            'community' => CommunityResource::make($community)->resolve(),
        ]);
    }

    /**
     * Load the relations and counters needed by the frontend.
     */
    protected function loadCommunityState(Community $community, int $userId): void
    {
        $community->load([
            'user:id,name,avatar',
            'memberships' => fn ($query) => $query->where('user_id', $userId),
        ])->loadCount([
            'approvedMemberships as members_count',
            'pendingMemberships as pending_requests_count',
        ]);
    }

    /**
     * Apply an indexed community search.
     *
     * @param  Builder<Community>  $query
     */
    protected function applySearch(Builder $query, string $search): void
    {
        if ($search === '') {
            return;
        }

        $driver = $query->getModel()->getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            $query->whereFullText(
                ['name', 'description'],
                $this->booleanFullTextQuery($search),
                ['mode' => 'boolean'],
            );

            return;
        }

        $prefixSearch = $this->prefixSearchTerm($search);
        $query->where(function (Builder $innerQuery) use ($prefixSearch): void {
            $innerQuery
                ->where('name', 'like', $prefixSearch)
                ->orWhere('description', 'like', $prefixSearch);
        });
    }

    protected function booleanFullTextQuery(string $search): string
    {
        $terms = preg_split('/\s+/', trim($search)) ?: [];

        return collect($terms)
            ->map(fn (string $term): string => trim($term, '+-~*<>()"'))
            ->filter()
            ->map(fn (string $term): string => '+'.$term.'*')
            ->implode(' ');
    }

    protected function prefixSearchTerm(string $value): string
    {
        return addcslashes($value, '\\%_').'%';
    }

    /**
     * Ensure the pending membership belongs to the given community.
     */
    protected function ensurePendingMembership(
        Community $community,
        CommunityMember $membership,
    ): void {
        abort_if(
            $membership->community_id !== $community->id || $membership->status !== 'pending',
            404,
            'Demande introuvable.',
        );
    }
}
