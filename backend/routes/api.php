<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatChannelController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\ForumChannelController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReplyController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\ThreadController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\VoteController;
use App\Http\Controllers\Api\AttachmentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ─── Public Routes ───────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Serve attachments publicly (for img tags in markdown)
Route::get('/attachments/{filename}', [AttachmentController::class, 'show']);

// ─── Protected Routes ────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth / Profile
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/user/stats', [AuthController::class, 'stats']);
    Route::get('/user/activity', [AuthController::class, 'activity']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Attachments
    Route::post('/attachments/upload', [AttachmentController::class, 'upload']);

    // Search
    Route::get('/search/threads', [SearchController::class, 'threads']);

    // Global Feed
    Route::get('/feed', [FeedController::class, 'index']);
    Route::get('/feed/hot', [FeedController::class, 'hot']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // Classes
    Route::get('/classes/my', [ClassController::class, 'myClasses']);
    Route::post('/classes', [ClassController::class, 'store']);
    Route::post('/classes/join', [ClassController::class, 'join']);
    Route::get('/classes/{class}', [ClassController::class, 'show']);
    Route::put('/classes/{class}', [ClassController::class, 'update']);
    Route::delete('/classes/{class}', [ClassController::class, 'destroy']);
    Route::post('/classes/{class}/leave', [ClassController::class, 'leave']);
    Route::get('/classes/{class}/members', [ClassController::class, 'members']);
    Route::delete('/classes/{class}/members/{member}', [ClassController::class, 'kickMember']);
    Route::put('/classes/{class}/members/{member}/role', [ClassController::class, 'updateMemberRole']);

    // Forum Channels (inside a class)
    Route::get('/classes/{class}/channels', [ForumChannelController::class, 'index']);
    Route::post('/classes/{class}/channels', [ForumChannelController::class, 'store']);
    Route::put('/classes/{class}/channels/{channel}', [ForumChannelController::class, 'update']);
    Route::delete('/classes/{class}/channels/{channel}', [ForumChannelController::class, 'destroy']);

    // Threads (inside a class)
    Route::get('/classes/{class}/threads', [ThreadController::class, 'index']);
    Route::get('/classes/{class}/threads/hot', [ThreadController::class, 'hot']);
    Route::post('/classes/{class}/threads', [ThreadController::class, 'store']);
    Route::get('/classes/{class}/threads/{thread}', [ThreadController::class, 'show']);
    Route::put('/classes/{class}/threads/{thread}', [ThreadController::class, 'update']);
    Route::delete('/classes/{class}/threads/{thread}', [ThreadController::class, 'destroy']);
    Route::post('/classes/{class}/threads/{thread}/pin', [ThreadController::class, 'togglePin']);

    // Replies (on a thread)
    Route::post('/classes/{class}/threads/{thread}/replies', [ReplyController::class, 'store']);
    Route::put('/replies/{reply}', [ReplyController::class, 'update']);
    Route::delete('/replies/{reply}', [ReplyController::class, 'destroy']);
    Route::post('/replies/{reply}/best-answer', [ReplyController::class, 'bestAnswer']);

    // Votes
    Route::post('/threads/{thread}/vote', [VoteController::class, 'voteThread']);
    Route::post('/replies/{reply}/vote', [VoteController::class, 'voteReply']);

    // Chat Channels (CRUD)
    Route::get('/classes/{class}/chat-channels', [ChatChannelController::class, 'index']);
    Route::post('/classes/{class}/chat-channels', [ChatChannelController::class, 'store']);
    Route::delete('/classes/{class}/chat-channels/{channel}', [ChatChannelController::class, 'destroy']);

    // Chat Messages (inside a class channel)
    Route::get('/classes/{class}/chat-channels/{channel}/messages', [MessageController::class, 'index']);
    Route::get('/classes/{class}/chat-channels/{channel}/messages/poll', [MessageController::class, 'poll']);
    Route::post('/classes/{class}/chat-channels/{channel}/messages', [MessageController::class, 'store']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
});