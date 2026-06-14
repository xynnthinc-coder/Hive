<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ThreadResource;
use App\Models\ClassMember;
use App\Models\ClassRoom;
use App\Models\ForumChannel;
use App\Models\Thread;
use Illuminate\Http\Request;

class ThreadController extends Controller
{
    /**
     * List threads in a class.
     * Supports filtering by forum_channel_id and sorting.
     * Also returns "hot" threads (trending in last 24h).
     */
    public function index(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        if (!$user->isMemberOf($class)) {
            return response()->json(['message' => 'Kamu bukan anggota kelas ini.'], 403);
        }

        $query = Thread::whereHas('forumChannel', function ($q) use ($class) {
            $q->where('class_id', $class->id);
        })->with(['user', 'forumChannel', 'userVote']);

        // Filter by forum channel
        if ($request->has('channel_id')) {
            $query->where('forum_channel_id', $request->channel_id);
        }

        // Sort options
        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'hot':
                $query->where('created_at', '>=', now()->subDay())
                      ->orderByRaw('(vote_count + reply_count * 2) DESC');
                break;
            case 'top':
                $query->orderBy('vote_count', 'desc');
                break;
            case 'latest':
            default:
                $query->orderBy('is_pinned', 'desc')
                      ->orderBy('last_activity_at', 'desc');
                break;
        }

        $threads = $query->paginate($request->get('per_page', 20));

        return ThreadResource::collection($threads);
    }

    /**
     * Get "Hot Today" threads for a class.
     */
    public function hot(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        if (!$user->isMemberOf($class)) {
            return response()->json(['message' => 'Kamu bukan anggota kelas ini.'], 403);
        }

        $threads = Thread::whereHas('forumChannel', function ($q) use ($class) {
            $q->where('class_id', $class->id);
        })
            ->with(['user', 'forumChannel', 'votes'])
            ->where('created_at', '>=', now()->subDay())
            ->orderByRaw('(vote_count + reply_count * 2) DESC')
            ->limit(10)
            ->get();

        return response()->json([
            'threads' => ThreadResource::collection($threads),
        ]);
    }

    /**
     * Show a single thread with nested replies (3 levels).
     */
    public function show(Request $request, ClassRoom $class, Thread $thread)
    {
        $user = $request->user();

        if (!$user->isMemberOf($class)) {
            return response()->json(['message' => 'Kamu bukan anggota kelas ini.'], 403);
        }

        // Verify thread belongs to this class
        $channel = $thread->forumChannel;
        if (!$channel || $channel->class_id !== $class->id) {
            return response()->json(['message' => 'Thread tidak ditemukan di kelas ini.'], 404);
        }

        $thread->load([
            'user',
            'forumChannel',
            'userVote',
            'replies' => function ($q) {
                $q->whereNull('parent_id')
                  ->with([
                      'user', 'userVote',
                      'children' => function ($q2) {
                          $q2->with([
                              'user', 'userVote',
                              'children' => function ($q3) {
                                  $q3->with(['user', 'userVote'])
                                     ->orderBy('created_at', 'asc');
                              },
                          ])->orderBy('created_at', 'asc');
                      },
                  ])
                  ->orderByDesc('is_best_answer')
                  ->orderByDesc('vote_count')
                  ->orderBy('created_at', 'asc');
            },
        ]);

        return response()->json([
            'thread' => new ThreadResource($thread),
            'replies' => \App\Http\Resources\ReplyResource::collection($thread->replies),
        ]);
    }

    /**
     * Create a new thread.
     */
    public function store(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        if (!$user->isMemberOf($class)) {
            return response()->json(['message' => 'Kamu bukan anggota kelas ini.'], 403);
        }

        $request->validate([
            'forum_channel_id' => 'required|exists:forum_channels,id',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        // Verify forum channel belongs to this class
        $channel = ForumChannel::where('id', $request->forum_channel_id)
            ->where('class_id', $class->id)
            ->first();

        if (!$channel) {
            return response()->json(['message' => 'Forum channel tidak ditemukan di kelas ini.'], 404);
        }

        if ($channel->is_locked) {
            return response()->json(['message' => 'Forum channel ini dikunci.'], 403);
        }

        $thread = Thread::create([
            'forum_channel_id' => $channel->id,
            'user_id' => $user->id,
            'title' => $request->title,
            'body' => $request->input('body'),
        ]);

        $thread->load(['user', 'forumChannel']);

        return response()->json([
            'message' => 'Thread berhasil dibuat!',
            'thread' => new ThreadResource($thread),
        ], 201);
    }

    /**
     * Update a thread (author only).
     */
    public function update(Request $request, ClassRoom $class, Thread $thread)
    {
        $user = $request->user();

        if ($thread->user_id !== $user->id) {
            return response()->json(['message' => 'Kamu tidak bisa mengedit thread ini.'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'body' => 'sometimes|string',
        ]);

        $thread->update($request->only(['title', 'body']));
        $thread->load(['user', 'forumChannel']);

        return response()->json([
            'message' => 'Thread berhasil diperbarui!',
            'thread' => new ThreadResource($thread),
        ]);
    }

    /**
     * Delete a thread (author or teacher in class).
     */
    public function destroy(Request $request, ClassRoom $class, Thread $thread)
    {
        $user = $request->user();

        $isAuthor = $thread->user_id === $user->id;
        $isTeacher = $user->isTeacherOf($class);

        if (!$isAuthor && !$isTeacher) {
            return response()->json(['message' => 'Kamu tidak bisa menghapus thread ini.'], 403);
        }

        $thread->delete();

        return response()->json(['message' => 'Thread berhasil dihapus.']);
    }

    /**
     * Pin/unpin a thread (teacher only).
     */
    public function togglePin(Request $request, ClassRoom $class, Thread $thread)
    {
        $user = $request->user();

        if (!$user->isTeacherOf($class)) {
            return response()->json(['message' => 'Hanya guru yang bisa mem-pin thread.'], 403);
        }

        $thread->update(['is_pinned' => !$thread->is_pinned]);

        return response()->json([
            'message' => $thread->is_pinned ? 'Thread di-pin.' : 'Thread di-unpin.',
            'is_pinned' => $thread->is_pinned,
        ]);
    }
}
