<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'description',
        'invite_code',
    ];

    /**
     * Auto-generate slug and invite_code when creating.
     */
    protected static function booted(): void
    {
        static::creating(function (School $school) {
            if (empty($school->slug)) {
                $school->slug = Str::slug($school->name);
            }
            if (empty($school->invite_code)) {
                $school->invite_code = strtoupper(Str::random(8));
            }
        });
    }

    /**
     * Users that belong to this school.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Classes within this school.
     */
    public function classes(): HasMany
    {
        return $this->hasMany(ClassRoom::class);
    }
}
