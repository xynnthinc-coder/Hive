<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatChannel;
use App\Models\ClassMember;
use App\Models\ClassRoom;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request, ClassRoom $class, ChatChannel $channel)
    {
        $user = $request->user();

        if (!$user->isMemberOf($class)) {
            return response()->json(['message' => 'Kamu bukan anggota kelas ini.'], 403);
        }

        if ($channel->class_id != $class->id) {
            return response()->json(['message' => 'Channel tidak ditemukan di kelas ini.'], 404);
        }

        $query = $channel->messages()
            ->with(['user:id,name,nickname,email,role,avatar'])
            ->orderBy('id', 'desc');

        if ($request->has('before_id')) {
            $query->where('id', '<', $request->before_id);
        }

        $perPage = min($request->input('per_page', 30), 50);
        $messages = $query->limit($perPage)->get()->reverse()->values();

        $hasMore = $query->count() > 0;
        if ($messages->isNotEmpty()) {
            $hasMore = $channel->messages()
                ->where('id', '<', $messages->first()->id)
                ->exists();
        }

        return response()->json([
            'messages' => $messages->map(fn ($m) => $this->formatMessage($m, $user)),
            'has_more' => $hasMore,
        ]);
    }

    public function poll(Request $request, ClassRoom $class, ChatChannel $channel)
    {
        $user = $request->user();

        if (!$user->isMemberOf($class)) {
            return response()->json(['message' => 'Kamu bukan anggota kelas ini.'], 403);
        }

        if ($channel->class_id != $class->id) {
            return response()->json(['message' => 'Channel tidak ditemukan di kelas ini.'], 404);
        }

        $afterId = $request->input('after_id', 0);

        $messages = $channel->messages()
            ->with(['user:id,name,nickname,email,role,avatar'])
            ->where('id', '>', $afterId)
            ->orderBy('id', 'asc')
            ->limit(50)
            ->get();

        return response()->json([
            'messages' => $messages->map(fn ($m) => $this->formatMessage($m, $user)),
        ]);
    }

    public function store(Request $request, ClassRoom $class, ChatChannel $channel)
    {
        $user = $request->user();

        if (!$user->isMemberOf($class)) {
            return response()->json(['message' => 'Kamu bukan anggota kelas ini.'], 403);
        }

        if ($channel->class_id != $class->id) {
            return response()->json(['message' => 'Channel tidak ditemukan di kelas ini.'], 404);
        }

        $request->validate([
            'body' => 'required|string|max:2000',
            'type' => 'sometimes|in:text,image,file,code',
        ]);

        $message = Message::create([
            'chat_channel_id' => $channel->id,
            'user_id' => $user->id,
            'body' => $request->input('body'),
            'type' => $request->input('type', 'text'),
        ]);

        $message->load('user:id,name,nickname,email,role,avatar');

        return response()->json([
            'message' => $this->formatMessage($message, $user),
        ], 201);
    }

    public function destroy(Request $request, Message $message)
    {
        $user = $request->user();

        $channel = $message->chatChannel;
        $class = $channel->classRoom;

        $isAuthor = $message->user_id === $user->id;
        $isTeacher = ClassMember::where('class_id', $class->id)
            ->where('user_id', $user->id)
            ->where('role', 'teacher')
            ->exists();

        if (!$isAuthor && !$isTeacher) {
            return response()->json(['message' => 'Kamu tidak punya izin menghapus pesan ini.'], 403);
        }

        $message->delete();

        return response()->json([
            'message' => 'Pesan berhasil dihapus.',
        ]);
    }

    private function formatMessage(Message $message, $currentUser): array
    {
        return [
            'id' => $message->id,
            'chat_channel_id' => $message->chat_channel_id,
            'body' => $message->body,
            'type' => $message->type,
            'metadata' => $message->metadata,
            'is_pinned' => $message->is_pinned,
            'is_own' => $message->user_id === $currentUser->id,
            'user' => $message->user ? [
                'id' => $message->user->id,
                'name' => $message->user->name,
                'nickname' => $message->user->nickname,
                'display_name' => $message->user->nickname ?: $message->user->name,
                'avatar' => $message->user->avatar,
                'role' => $message->user->role,
            ] : null,
            'created_at' => $message->created_at->toISOString(),
            'edited_at' => $message->edited_at?->toISOString(),
        ];
    }
}
