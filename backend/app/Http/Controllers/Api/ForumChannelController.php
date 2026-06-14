<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassRoom;
use App\Models\ForumChannel;
use Illuminate\Http\Request;

class ForumChannelController extends Controller
{
    /**
     * List forum channels in a class.
     */
    public function index(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        if (!$user->isMemberOf($class)) {
            return response()->json(['message' => 'Kamu bukan anggota kelas ini.'], 403);
        }

        $channels = $class->forumChannels()
            ->withCount('threads')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'channels' => $channels,
        ]);
    }

    /**
     * Create a new forum channel (teacher in class only).
     */
    public function store(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        if (!$user->isTeacherOf($class)) {
            return response()->json(['message' => 'Hanya guru yang bisa membuat channel.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:10',
        ]);

        $channel = ForumChannel::create([
            'class_id' => $class->id,
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'created_by' => $user->id,
        ]);

        return response()->json([
            'message' => "Channel {$channel->name} berhasil dibuat!",
            'channel' => $channel,
        ], 201);
    }

    /**
     * Update a forum channel (teacher only).
     */
    public function update(Request $request, ClassRoom $class, ForumChannel $channel)
    {
        $user = $request->user();

        if (!$user->isTeacherOf($class)) {
            return response()->json(['message' => 'Hanya guru yang bisa mengedit channel.'], 403);
        }

        if ($channel->class_id !== $class->id) {
            return response()->json(['message' => 'Channel tidak ditemukan di kelas ini.'], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:10',
        ]);

        $channel->update($request->only(['name', 'description', 'icon']));

        return response()->json([
            'message' => "Channel berhasil diperbarui!",
            'channel' => $channel->fresh(),
        ]);
    }

    /**
     * Delete a forum channel (teacher only).
     * Cannot delete the last channel in a class.
     */
    public function destroy(Request $request, ClassRoom $class, ForumChannel $channel)
    {
        $user = $request->user();

        if (!$user->isTeacherOf($class)) {
            return response()->json(['message' => 'Hanya guru yang bisa menghapus channel.'], 403);
        }

        if ($channel->class_id !== $class->id) {
            return response()->json(['message' => 'Channel tidak ditemukan di kelas ini.'], 404);
        }

        // Don't allow deleting the last channel
        $channelCount = ForumChannel::where('class_id', $class->id)->count();
        if ($channelCount <= 1) {
            return response()->json(['message' => 'Tidak bisa menghapus channel terakhir di kelas.'], 422);
        }

        $channel->delete();

        return response()->json(['message' => 'Channel berhasil dihapus.']);
    }
}
