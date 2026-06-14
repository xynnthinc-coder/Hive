<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'data',
        'is_read',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /* ── Static helpers to create notifications ── */

    public static function notify(int $userId, string $type, string $title, string $body, array $data = []): self
    {
        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);
    }

    /**
     * Notify when someone replies to a thread.
     */
    public static function onReply(int $threadOwnerId, string $replierName, string $threadTitle, int $classId, int $threadId): void
    {
        self::notify($threadOwnerId, 'reply', 'Balasan baru', "{$replierName} membalas thread \"{$threadTitle}\"", [
            'class_id' => $classId,
            'thread_id' => $threadId,
        ]);
    }

    /**
     * Notify when a thread/reply gets upvoted.
     */
    public static function onVote(int $ownerId, string $contentTitle, int $voteCount, int $classId, int $threadId): void
    {
        self::notify($ownerId, 'vote', 'Upvote diterima', "Konten \"{$contentTitle}\" mendapat {$voteCount} vote", [
            'class_id' => $classId,
            'thread_id' => $threadId,
        ]);
    }

    /**
     * Notify when a reply is marked as best answer.
     */
    public static function onBestAnswer(int $replyOwnerId, string $threadTitle, int $classId, int $threadId): void
    {
        self::notify($replyOwnerId, 'best_answer', 'Best Answer! ⭐', "Jawabanmu di \"{$threadTitle}\" ditandai sebagai best answer", [
            'class_id' => $classId,
            'thread_id' => $threadId,
        ]);
    }

    /**
     * Notify class teachers when a new member joins.
     */
    public static function onMemberJoin(int $teacherId, string $memberName, string $className, int $classId): void
    {
        self::notify($teacherId, 'join', 'Anggota baru', "{$memberName} bergabung ke kelas {$className}", [
            'class_id' => $classId,
        ]);
    }
}
