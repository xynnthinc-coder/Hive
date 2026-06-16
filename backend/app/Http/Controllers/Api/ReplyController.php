<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReplyResource;
use App\Models\ClassRoom;
use App\Models\Notification;
use App\Models\Reply;
use App\Models\Thread;
use Illuminate\Http\Request;

class ReplyController extends Controller
{
    /**
     * Create a reply on a thread.
     */
    public function store(Request $request, ClassRoom $class, Thread $thread)
    {
        $user = $request->user();

        if (!$user->isMemberOf($class)) {
            return response()->json(['message' => 'Kamu bukan anggota kelas ini.'], 403);
        }

        // Verify thread belongs to this class
        $channel = $thread->forumChannel;
        if (!$channel || $channel->class_id != $class->id) {
            return response()->json(['message' => 'Thread tidak ditemukan di kelas ini.'], 404);
        }

        $request->validate([
            'body' => 'required|string',
            'parent_id' => 'nullable|exists:replies,id',
        ]);

        // Validate nesting depth (max 3 levels)
        if ($request->parent_id) {
            $parent = Reply::find($request->parent_id);

            // Ensure parent belongs to the same thread
            if ($parent->thread_id !== $thread->id) {
                return response()->json(['message' => 'Parent reply tidak valid.'], 422);
            }

            // Check nesting depth
            $depth = 0;
            $current = $parent;
            while ($current->parent_id) {
                $depth++;
                $current = $current->parent;
                if ($depth >= 2) { // Max 3 levels (0, 1, 2)
                    return response()->json([
                        'message' => 'Balasan maksimal 3 level.',
                    ], 422);
                }
            }
        }

        $reply = Reply::create([
            'thread_id' => $thread->id,
            'user_id' => $user->id,
            'body' => $request->input('body'),
            'parent_id' => $request->parent_id,
        ]);

        // Update thread reply count and activity
        $thread->increment('reply_count');
        $thread->update(['last_activity_at' => now()]);

        // Notify thread owner (if not self)
        if ($thread->user_id !== $user->id) {
            Notification::onReply(
                $thread->user_id,
                $user->display_name,
                $thread->title,
                $channel->class_id,
                $thread->id
            );
        }

        $reply->load('user');

        return response()->json([
            'message' => 'Balasan berhasil diposting!',
            'reply' => new ReplyResource($reply),
        ], 201);
    }

    /**
     * Update a reply (author only).
     */
    public function update(Request $request, Reply $reply)
    {
        $user = $request->user();

        if ($reply->user_id !== $user->id) {
            return response()->json(['message' => 'Kamu tidak bisa mengedit balasan ini.'], 403);
        }

        $request->validate([
            'body' => 'required|string',
        ]);

        $reply->update(['body' => $request->input('body')]);
        $reply->load('user');

        return response()->json([
            'message' => 'Balasan berhasil diperbarui!',
            'reply' => new ReplyResource($reply),
        ]);
    }

    /**
     * Delete a reply (author or teacher).
     */
    public function destroy(Request $request, Reply $reply)
    {
        $user = $request->user();

        $isAuthor = $reply->user_id === $user->id;

        // Check if user is teacher in the class containing this reply's thread
        $thread = $reply->thread;
        $channel = $thread->forumChannel;
        $class = $channel->classRoom;
        $isTeacher = $user->isTeacherOf($class);

        if (!$isAuthor && !$isTeacher) {
            return response()->json(['message' => 'Kamu tidak bisa menghapus balasan ini.'], 403);
        }

        $reply->delete();

        // Update thread reply count
        $thread->decrement('reply_count');

        return response()->json(['message' => 'Balasan berhasil dihapus.']);
    }

    /**
     * Mark reply as best answer (teacher in class only).
     */
    public function bestAnswer(Request $request, Reply $reply)
    {
        $user = $request->user();

        $thread = $reply->thread;
        $channel = $thread->forumChannel;
        $class = $channel->classRoom;

        if (!$user->isTeacherOf($class)) {
            return response()->json(['message' => 'Hanya guru yang bisa menandai jawaban terbaik.'], 403);
        }

        // Unmark any existing best answer on this thread
        Reply::where('thread_id', $thread->id)
            ->where('is_best_answer', true)
            ->update(['is_best_answer' => false]);

        // Toggle: if this was already best, it's now unmarked. Otherwise mark it.
        $newValue = !$reply->is_best_answer;
        $reply->update(['is_best_answer' => $newValue]);

        // Mark thread as resolved if a best answer is set
        $thread->update(['is_resolved' => $newValue]);

        // Notify reply owner (if not self)
        if ($newValue && $reply->user_id !== $user->id) {
            Notification::onBestAnswer(
                $reply->user_id,
                $thread->title,
                $channel->class_id,
                $thread->id
            );
        }

        return response()->json([
            'message' => $newValue ? 'Jawaban terbaik ditandai!' : 'Jawaban terbaik dihapus.',
            'is_best_answer' => $newValue,
        ]);
    }
}
