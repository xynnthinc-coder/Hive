<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ThreadResource;
use App\Models\ForumChannel;
use App\Models\Thread;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    /**
     * Global feed — threads from all classes the user has joined.
     * Supports filtering by class_id.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Get all class IDs this user is a member of
        $classIds = $user->classMembers()->pluck('class_id');

        // Get all forum channel IDs that belong to those classes
        $channelIds = ForumChannel::whereIn('class_id', $classIds)->pluck('id');

        $query = Thread::whereIn('forum_channel_id', $channelIds)
            ->with(['user', 'forumChannel', 'forumChannel.classRoom:id,name', 'userVote']);

        // Optional: filter by class
        if ($request->has('class_id')) {
            $filterChannelIds = ForumChannel::where('class_id', $request->class_id)->pluck('id');
            $query->whereIn('forum_channel_id', $filterChannelIds);
        }

        $query->orderBy('is_pinned', 'desc')
              ->orderBy('last_activity_at', 'desc');

        $threads = $query->paginate($request->get('per_page', 20));

        // Add class_name to each thread resource
        $threadsData = ThreadResource::collection($threads);

        return response()->json([
            'threads' => $threadsData,
            'meta' => [
                'current_page' => $threads->currentPage(),
                'last_page' => $threads->lastPage(),
                'total' => $threads->total(),
            ],
        ]);
    }

    /**
     * Hot threads across all classes the user has joined (last 24h).
     */
    public function hot(Request $request)
    {
        $user = $request->user();

        $classIds = $user->classMembers()->pluck('class_id');
        $channelIds = ForumChannel::whereIn('class_id', $classIds)->pluck('id');

        $threads = Thread::whereIn('forum_channel_id', $channelIds)
            ->with(['user', 'forumChannel', 'forumChannel.classRoom:id,name', 'userVote'])
            ->where('created_at', '>=', now()->subDay())
            ->whereRaw('(vote_count + reply_count) > 0')
            ->orderByRaw('(vote_count + reply_count * 2) DESC')
            ->limit(10)
            ->get();

        return response()->json([
            'threads' => ThreadResource::collection($threads),
        ]);
    }
}
