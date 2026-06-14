<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ThreadResource;
use App\Models\Thread;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Search threads across all classes the user is a member of.
     */
    public function threads(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $user = $request->user();
        $query = $request->input('q');

        // Get class IDs this user is a member of
        $classIds = $user->classMembers()->pluck('class_id');

        // Threads link to classes via forum_channels
        $threads = Thread::whereHas('forumChannel', function ($q) use ($classIds) {
                $q->whereIn('class_id', $classIds);
            })
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('body', 'like', "%{$query}%");
            })
            ->with(['user:id,name,nickname,avatar,role', 'forumChannel:id,name,slug,icon,class_id', 'forumChannel.classRoom:id,name,slug'])
            ->withCount('replies')
            ->orderByDesc('last_activity_at')
            ->limit(20)
            ->get();

        return response()->json([
            'threads' => $threads->map(function ($thread) {
                return [
                    'id' => $thread->id,
                    'class_id' => $thread->forumChannel?->class_id,
                    'class_name' => $thread->forumChannel?->classRoom?->name,
                    'title' => $thread->title,
                    'body' => \Illuminate\Support\Str::limit($thread->body, 120),
                    'vote_count' => $thread->vote_count,
                    'reply_count' => $thread->replies_count,
                    'is_pinned' => $thread->is_pinned,
                    'user' => $thread->user ? [
                        'id' => $thread->user->id,
                        'name' => $thread->user->name,
                        'display_name' => $thread->user->display_name,
                        'avatar' => $thread->user->avatar,
                    ] : null,
                    'forum_channel' => $thread->forumChannel ? [
                        'name' => $thread->forumChannel->name,
                        'icon' => $thread->forumChannel->icon,
                    ] : null,
                    'created_at' => $thread->created_at,
                ];
            }),
            'query' => $query,
            'count' => $threads->count(),
        ]);
    }
}
