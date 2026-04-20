<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'nickname',
        'email',
        'password',
        'role',
        'avatar',
        'bio',
        'school_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ─── Relationships ───────────────────────────────────

    /**
     * The school this user belongs to.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Classes this user is a member of (through pivot).
     */
    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(ClassRoom::class, 'class_members', 'user_id', 'class_id')
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Class membership records.
     */
    public function classMembers(): HasMany
    {
        return $this->hasMany(ClassMember::class);
    }

    /**
     * Threads created by this user.
     */
    public function threads(): HasMany
    {
        return $this->hasMany(Thread::class);
    }

    /**
     * Replies written by this user.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Reply::class);
    }

    /**
     * Votes cast by this user.
     */
    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    /**
     * Messages sent by this user.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    // ─── Helper Methods ──────────────────────────────────

    /**
     * Get display name (nickname or name).
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->nickname ?? $this->name;
    }

    /**
     * Check if user is a member of a specific class.
     */
    public function isMemberOf(ClassRoom $class): bool
    {
        return $this->classMembers()->where('class_id', $class->id)->exists();
    }

    /**
     * Check if user is a moderator in a specific class.
     */
    public function isModeratorOf(ClassRoom $class): bool
    {
        return $this->classMembers()
            ->where('class_id', $class->id)
            ->where('role', 'moderator')
            ->exists();
    }

    /**
     * Check if user is a teacher in a specific class.
     */
    public function isTeacherOf(ClassRoom $class): bool
    {
        return $this->classMembers()
            ->where('class_id', $class->id)
            ->where('role', 'teacher')
            ->exists();
    }
}
