<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reply extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'thread_id',
        'user_id',
        'body',
        'is_best_answer',
        'vote_count',
        'parent_id',
    ];

    protected function casts(): array
    {
        return [
            'is_best_answer' => 'boolean',
        ];
    }

    /**
     * The thread this reply belongs to.
     */
    public function thread(): BelongsTo
    {
        return $this->belongsTo(Thread::class);
    }

    /**
     * The author of this reply.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Parent reply (for nested replies).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Reply::class, 'parent_id');
    }

    /**
     * Child replies (nested under this reply).
     */
    public function children(): HasMany
    {
        return $this->hasMany(Reply::class, 'parent_id');
    }

    /**
     * Votes on this reply (polymorphic).
     */
    public function votes(): MorphMany
    {
        return $this->morphMany(Vote::class, 'voteable');
    }

    /**
     * The current user's vote.
     */
    public function userVote()
    {
        return $this->morphOne(Vote::class, 'voteable')
            ->where('user_id', auth()->id());
    }
}
