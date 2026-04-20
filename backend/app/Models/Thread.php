<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Thread extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'forum_channel_id',
        'user_id',
        'title',
        'body',
        'is_pinned',
        'is_resolved',
        'vote_count',
        'reply_count',
        'last_activity_at',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'is_resolved' => 'boolean',
            'last_activity_at' => 'datetime',
        ];
    }

    /**
     * The forum channel this thread belongs to.
     */
    public function forumChannel(): BelongsTo
    {
        return $this->belongsTo(ForumChannel::class);
    }

    /**
     * The author of this thread.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Replies to this thread.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Reply::class);
    }

    /**
     * Votes on this thread (polymorphic).
     */
    public function votes(): MorphMany
    {
        return $this->morphMany(Vote::class, 'voteable');
    }
}
