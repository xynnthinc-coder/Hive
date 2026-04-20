<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Vote extends Model
{
    protected $fillable = [
        'user_id',
        'voteable_type',
        'voteable_id',
        'value',
    ];

    /**
     * The item being voted on (Thread or Reply).
     * This is a POLYMORPHIC relationship — one votes table
     * handles votes for multiple model types.
     */
    public function voteable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * The user who cast this vote.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
