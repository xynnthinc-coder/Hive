<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reply;
use App\Models\Thread;
use App\Models\Vote;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    /**
     * Vote on a thread.
     * value: 1 (upvote), -1 (downvote), 0 (remove vote)
     */
    public function voteThread(Request $request, Thread $thread)
    {
        $user = $request->user();

        $request->validate([
            'value' => 'required|integer|in:-1,0,1',
        ]);

        $value = $request->value;

        // Find existing vote
        $existingVote = Vote::where('user_id', $user->id)
            ->where('voteable_type', Thread::class)
            ->where('voteable_id', $thread->id)
            ->first();

        $oldValue = $existingVote ? $existingVote->value : 0;

        if ($value === 0) {
            // Remove vote
            if ($existingVote) {
                $existingVote->delete();
            }
        } else {
            // Create or update vote
            Vote::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'voteable_type' => Thread::class,
                    'voteable_id' => $thread->id,
                ],
                ['value' => $value]
            );
        }

        // Recalculate vote count
        $thread->update([
            'vote_count' => $thread->votes()->sum('value'),
        ]);

        return response()->json([
            'vote_count' => $thread->vote_count,
            'my_vote' => $value,
        ]);
    }

    /**
     * Vote on a reply.
     */
    public function voteReply(Request $request, Reply $reply)
    {
        $user = $request->user();

        $request->validate([
            'value' => 'required|integer|in:-1,0,1',
        ]);

        $value = $request->value;

        $existingVote = Vote::where('user_id', $user->id)
            ->where('voteable_type', Reply::class)
            ->where('voteable_id', $reply->id)
            ->first();

        if ($value === 0) {
            if ($existingVote) {
                $existingVote->delete();
            }
        } else {
            Vote::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'voteable_type' => Reply::class,
                    'voteable_id' => $reply->id,
                ],
                ['value' => $value]
            );
        }

        $reply->update([
            'vote_count' => $reply->votes()->sum('value'),
        ]);

        return response()->json([
            'vote_count' => $reply->vote_count,
            'my_vote' => $value,
        ]);
    }
}
