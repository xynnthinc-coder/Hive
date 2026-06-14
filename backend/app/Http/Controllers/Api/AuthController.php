<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|in:student,teacher',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->input('role', 'student'),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Login user and create token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginField = $request->email;

        $user = User::where('email', $loginField)
                    ->orWhere('name', $loginField)
                    ->orWhere('nickname', $loginField)
                    ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email/Username atau password salah.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Load relations if any

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Logout user (revoke current token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function user(Request $request)
    {
        $user = $request->user();

        return response()->json(new UserResource($user));
    }

    /**
     * Get user statistics.
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        // Total threads created
        $threadCount = $user->threads()->count();

        // Total upvotes received across all threads
        $threadUpvotes = $user->threads()->sum('vote_count');

        // Total replies written
        $replyCount = $user->replies()->count();

        // Total upvotes received on replies
        $replyUpvotes = \App\Models\Reply::where('user_id', $user->id)->sum('vote_count');

        // Classes joined
        $classCount = $user->classMembers()->count();

        // Best answers received
        $bestAnswerCount = $user->replies()->where('is_best_answer', true)->count();

        return response()->json([
            'thread_count' => $threadCount,
            'reply_count' => $replyCount,
            'total_upvotes' => $threadUpvotes + $replyUpvotes,
            'class_count' => $classCount,
            'best_answer_count' => $bestAnswerCount,
        ]);
    }

    /**
     * Get user's recent activity feed.
     */
    public function activity(Request $request)
    {
        $user = $request->user();

        // Recent threads
        $threads = $user->threads()
            ->with('forumChannel:id,name,icon,class_id', 'forumChannel.classRoom:id,name')
            ->select('id', 'forum_channel_id', 'title', 'vote_count', 'reply_count', 'created_at')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($t) => [
                'type' => 'thread',
                'id' => $t->id,
                'title' => $t->title,
                'class_id' => $t->forumChannel?->class_id,
                'class_name' => $t->forumChannel?->classRoom?->name,
                'channel_name' => $t->forumChannel?->name,
                'vote_count' => $t->vote_count,
                'reply_count' => $t->reply_count,
                'created_at' => $t->created_at,
            ]);

        // Recent replies
        $replies = $user->replies()
            ->with('thread:id,title,forum_channel_id', 'thread.forumChannel:id,class_id', 'thread.forumChannel.classRoom:id,name')
            ->select('id', 'thread_id', 'body', 'is_best_answer', 'vote_count', 'created_at')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'type' => $r->is_best_answer ? 'best_answer' : 'reply',
                'id' => $r->id,
                'title' => $r->thread?->title,
                'body' => \Illuminate\Support\Str::limit($r->body, 80),
                'class_id' => $r->thread?->forumChannel?->class_id,
                'class_name' => $r->thread?->forumChannel?->classRoom?->name,
                'thread_id' => $r->thread_id,
                'vote_count' => $r->vote_count,
                'created_at' => $r->created_at,
            ]);

        // Merge and sort by date
        $activity = $threads->concat($replies)
            ->sortByDesc('created_at')
            ->take(15)
            ->values();

        return response()->json(['activity' => $activity]);
    }

    /**
     * Update authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'nickname' => 'sometimes|nullable|string|max:50|unique:users,nickname,' . $user->id,
            'bio' => 'sometimes|nullable|string|max:500',
        ]);

        $user->update($request->only(['name', 'nickname', 'bio']));

        return response()->json([
            'message' => 'Profil berhasil diperbarui!',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Change authenticated user's password.
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini salah.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json([
            'message' => 'Password berhasil diubah!',
        ]);
    }
}
