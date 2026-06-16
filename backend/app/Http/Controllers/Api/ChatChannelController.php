<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use App\Models\ClassMember;
use App\Models\ClassRoom;
use Illuminate\Http\Request;

class ChatChannelController extends Controller
{
    /**
     * List chat channels for a class.
     */
    public function index(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        if (!$user->isMemberOf($class)) {
            return response()->json(['message' => 'Kamu bukan anggota kelas ini.'], 403);
        }

        $channels = $class->chatChannels()->orderBy('created_at', 'asc')->get();

        return response()->json([
            'channels' => $channels,
        ]);
    }

    /**
     * Create a new chat channel (teacher only).
     */
    public function store(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        if (!$user->isTeacherOf($class)) {
            return response()->json(['message' => 'Hanya guru yang bisa membuat chat channel.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'type' => 'sometimes|in:general,announcement,group',
        ]);

        $channel = ChatChannel::create([
            'class_id' => $class->id,
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->input('type', 'general'),
            'created_by' => $user->id,
        ]);

        return response()->json([
            'message' => 'Chat channel berhasil dibuat!',
            'channel' => $channel,
        ], 201);
    }

    /**
     * Delete a chat channel (teacher only).
     * Cannot delete the last channel.
     */
    public function destroy(Request $request, ClassRoom $class, ChatChannel $channel)
    {
        $user = $request->user();

        if (!$user->isTeacherOf($class)) {
            return response()->json(['message' => 'Hanya guru yang bisa menghapus chat channel.'], 403);
        }

        if ($channel->class_id != $class->id) {
            return response()->json(['message' => 'Channel tidak ditemukan di kelas ini.'], 404);
        }

        // Prevent deleting last channel
        $channelCount = $class->chatChannels()->count();
        if ($channelCount <= 1) {
            return response()->json(['message' => 'Tidak bisa menghapus channel terakhir.'], 422);
        }

        $channel->messages()->delete();
        $channel->delete();

        return response()->json(['message' => 'Chat channel berhasil dihapus.']);
    }
}
