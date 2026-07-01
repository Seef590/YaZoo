<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ModerationActionResource;
use App\Models\ModerationAction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminModerationActionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $actions = ModerationAction::query()
            ->with('admin:id,name,email')
            ->when($request->filled('action'), fn ($query) => $query->where('action', $request->string('action')->trim()))
            ->when($request->filled('target_type'), fn ($query) => $query->where('target_type', $request->string('target_type')->trim()))
            ->when($request->filled('admin_id'), fn ($query) => $query->where('admin_id', $request->integer('admin_id')))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('created_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('created_at', '<=', $request->date('date_to')))
            ->latest()
            ->limit((int) min(max($request->integer('limit', 100), 1), 200))
            ->get();

        return ModerationActionResource::collection($actions);
    }
}
