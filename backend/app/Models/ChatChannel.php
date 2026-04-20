<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ChatChannel extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_id',
        'name',
        'slug',
        'description',
        'type',
        'created_by',
    ];

    protected static function booted(): void
    {
        static::creating(function (ChatChannel $channel) {
            if (empty($channel->slug)) {
                $channel->slug = Str::slug($channel->name);
            }
        });
    }

    /**
     * The class this channel belongs to.
     */
    public function classRoom(): BelongsTo
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }

    /**
     * The user who created this channel.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Messages in this channel.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
