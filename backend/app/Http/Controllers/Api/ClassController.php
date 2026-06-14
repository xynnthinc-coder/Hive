<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JoinClassRequest;
use App\Http\Requests\StoreClassRequest;
use App\Http\Resources\ClassResource;
use App\Http\Resources\UserResource;
use App\Models\ClassMember;
use App\Models\ClassRoom;
use App\Models\ChatChannel;
use App\Models\Notification;
use App\Models\ForumChannel;
use Illuminate\Http\Request;

class ClassController extends Controller
{


    /**
     * Get classes the current user has joined.
     */
    public function myClasses(Request $request)
    {
        $user = $request->user();

        $classes = $user->classes()
            ->withCount(['members', 'forumChannels', 'chatChannels'])
            ->withPivot('role', 'joined_at')
            ->latest()
            ->get();

        return response()->json([
            'classes' => ClassResource::collection($classes),
        ]);
    }

    /**
     * Get a single class by ID with details.
     */
    public function show(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        // Check membership
        if (!$user->isMemberOf($class)) {
            return response()->json([
                'message' => 'Kamu bukan anggota kelas ini.',
            ], 403);
        }

        $class->load(['creator', 'forumChannels', 'chatChannels'])
              ->loadCount('members');

        // Get current user's role in this class
        $membership = ClassMember::where('class_id', $class->id)
            ->where('user_id', $user->id)
            ->first();

        return response()->json([
            'class' => new ClassResource($class),
            'my_role' => $membership?->role,
            'forum_channels' => $class->forumChannels,
            'chat_channels' => $class->chatChannels,
        ]);
    }

    /**
     * Create a new class (teacher/moderator only).
     */
    public function store(StoreClassRequest $request)
    {
        $user = $request->user();

        $class = ClassRoom::create([
            'name' => $request->name,
            'description' => $request->description,
            'academic_year' => $request->academic_year,
            'created_by' => $user->id,
        ]);

        // Auto-join creator as teacher of this class
        ClassMember::create([
            'class_id' => $class->id,
            'user_id' => $user->id,
            'role' => 'teacher',
        ]);

        // Create default channels
        ForumChannel::create([
            'class_id' => $class->id,
            'name' => 'General',
            'description' => 'Diskusi umum kelas',
            'icon' => '💬',
            'created_by' => $user->id,
        ]);

        ChatChannel::create([
            'class_id' => $class->id,
            'name' => 'General',
            'description' => 'Obrolan santai kelas',
            'type' => 'general',
            'created_by' => $user->id,
        ]);

        ChatChannel::create([
            'class_id' => $class->id,
            'name' => 'Pengumuman',
            'description' => 'Pengumuman penting',
            'type' => 'announcement',
            'created_by' => $user->id,
        ]);

        $class->loadCount('members');

        return response()->json([
            'message' => "Kelas {$class->name} berhasil dibuat!",
            'class' => new ClassResource($class),
        ], 201);
    }

    /**
     * Join a class using invite code.
     */
    public function join(JoinClassRequest $request)
    {
        $user = $request->user();
        $class = ClassRoom::where('invite_code', $request->invite_code)->firstOrFail();


        // Check if already a member
        if ($user->isMemberOf($class)) {
            return response()->json([
                'message' => 'Kamu sudah menjadi anggota kelas ini.',
            ], 422);
        }

        ClassMember::create([
            'class_id' => $class->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        // Notify all teachers in this class
        $teacherIds = ClassMember::where('class_id', $class->id)
            ->where('role', 'teacher')
            ->where('user_id', '!=', $user->id)
            ->pluck('user_id');
        foreach ($teacherIds as $teacherId) {
            Notification::onMemberJoin($teacherId, $user->display_name, $class->name, $class->id);
        }

        $class->loadCount('members');

        return response()->json([
            'message' => "Berhasil bergabung ke kelas {$class->name}!",
            'class' => new ClassResource($class),
        ]);
    }

    /**
     * Leave a class.
     */
    public function leave(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        $membership = ClassMember::where('class_id', $class->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$membership) {
            return response()->json([
                'message' => 'Kamu bukan anggota kelas ini.',
            ], 422);
        }

        $membership->delete();

        return response()->json([
            'message' => "Berhasil keluar dari kelas {$class->name}.",
        ]);
    }

    /**
     * List members of a class.
     */
    public function members(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        if (!$user->isMemberOf($class)) {
            return response()->json([
                'message' => 'Kamu bukan anggota kelas ini.',
            ], 403);
        }

        $members = $class->members()
            ->withPivot('role', 'joined_at')
            ->get();

        return response()->json([
            'members' => UserResource::collection($members),
        ]);
    }

    /**
     * Update class details (teacher only).
     */
    public function update(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        if (!$user->isTeacherOf($class)) {
            return response()->json([
                'message' => 'Hanya guru yang bisa mengedit kelas.',
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string|max:1000',
            'academic_year' => 'sometimes|string|max:20',
        ]);

        $class->update($request->only(['name', 'description', 'academic_year']));

        return response()->json([
            'message' => 'Kelas berhasil diperbarui!',
            'class' => new ClassResource($class->fresh()),
        ]);
    }

    /**
     * Delete a class (creator only).
     */
    public function destroy(Request $request, ClassRoom $class)
    {
        $user = $request->user();

        if ($class->created_by !== $user->id) {
            return response()->json([
                'message' => 'Hanya pembuat kelas yang bisa menghapus kelas ini.',
            ], 403);
        }

        $class->delete();

        return response()->json([
            'message' => 'Kelas berhasil dihapus.',
        ]);
    }

    /**
     * Kick a member from class (teacher only).
     */
    public function kickMember(Request $request, ClassRoom $class, $memberId)
    {
        $user = $request->user();

        if (!$user->isTeacherOf($class)) {
            return response()->json([
                'message' => 'Hanya guru yang bisa mengeluarkan anggota.',
            ], 403);
        }

        // Can't kick yourself
        if ($memberId == $user->id) {
            return response()->json([
                'message' => 'Kamu tidak bisa mengeluarkan diri sendiri.',
            ], 422);
        }

        $membership = ClassMember::where('class_id', $class->id)
            ->where('user_id', $memberId)
            ->first();

        if (!$membership) {
            return response()->json([
                'message' => 'User bukan anggota kelas ini.',
            ], 404);
        }

        $membership->delete();

        return response()->json([
            'message' => 'Anggota berhasil dikeluarkan.',
        ]);
    }

    /**
     * Update member role (teacher only).
     */
    public function updateMemberRole(Request $request, ClassRoom $class, $memberId)
    {
        $user = $request->user();

        if (!$user->isTeacherOf($class)) {
            return response()->json([
                'message' => 'Hanya guru yang bisa mengubah role.',
            ], 403);
        }

        $request->validate([
            'role' => 'required|in:member,teacher',
        ]);

        $membership = ClassMember::where('class_id', $class->id)
            ->where('user_id', $memberId)
            ->first();

        if (!$membership) {
            return response()->json([
                'message' => 'User bukan anggota kelas ini.',
            ], 404);
        }

        $membership->update(['role' => $request->role]);

        return response()->json([
            'message' => 'Role berhasil diperbarui!',
        ]);
    }
}
