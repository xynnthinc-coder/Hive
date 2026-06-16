<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ClassRoom extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     * We use 'classes' not 'class_rooms' because 'ClassRoom' is just
     * our model name to avoid PHP reserved word 'Class'.
     */
    protected $table = 'classes';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'academic_year',
        'invite_code',
        'created_by',
    ];

    /**
     * Auto-generate slug and invite_code when creating.
     */
    protected static function booted(): void
    {
        static::creating(function (ClassRoom $class) {
            if (empty($class->slug)) {
                $slug = Str::slug($class->name);
                $originalSlug = $slug;
                $count = 1;
                while (ClassRoom::where('slug', $slug)->exists()) {
                    $count++;
                    $slug = "{$originalSlug}-{$count}";
                }
                $class->slug = $slug;
            }
            if (empty($class->invite_code)) {
                $class->invite_code = strtoupper(Str::random(8));
            }
        });
    }


    /**
     * The user who created this class.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Members of this class (through pivot).
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'class_members', 'class_id', 'user_id')
            ->withPivot('role', 'joined_at');
    }

    /**
     * Class member records.
     */
    public function classMembers(): HasMany
    {
        return $this->hasMany(ClassMember::class, 'class_id');
    }

    /**
     * Forum channels in this class.
     */
    public function forumChannels(): HasMany
    {
        return $this->hasMany(ForumChannel::class, 'class_id');
    }

    /**
     * Chat channels in this class.
     */
    public function chatChannels(): HasMany
    {
        return $this->hasMany(ChatChannel::class, 'class_id');
    }
}
