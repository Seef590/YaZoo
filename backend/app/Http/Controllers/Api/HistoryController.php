<?php

namespace App\Http\Controllers\Api;

use App\DTOs\PaginationData;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $pagination = PaginationData::fromRequest($request, 20, 50);

        $query = ActivityLog::query()
            ->with(['actor:id,name', 'user:id,name'])
            ->where(function ($query) use ($request): void {
                $query
                    ->where('user_id', $request->user()->id)
                    ->orWhere('actor_id', $request->user()->id);
            })
            ->latest('created_at');

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        return ActivityLogResource::collection($query->paginate($pagination->perPage));
    }
}
