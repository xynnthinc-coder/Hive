<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'chat_channel_id',
        'user_id',
        'body',
        'type',
        'metadata',
        'is_pinned',
        'edited_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'is_pinned' => 'boolean',
            'edited_at' => 'datetime',
        ];
    }

    /**
     * The chat channel this message belongs to.
     */
    public function chatChannel(): BelongsTo
    {
        return $this->belongsTo(ChatChannel::class);
    }

    /**
     * The author of this message.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
