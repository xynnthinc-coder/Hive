<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'academic_year' => $this->academic_year,
            'invite_code' => $this->invite_code,
            'created_by' => $this->created_by,
            'creator' => new UserResource($this->whenLoaded('creator')),
            'members_count' => $this->whenCounted('members'),
            'forum_channels_count' => $this->whenCounted('forumChannels'),
            'chat_channels_count' => $this->whenCounted('chatChannels'),
            'current_user_role' => $this->whenPivotLoaded('class_members', function () {
                return $this->pivot->role;
            }),
            'created_at' => $this->created_at,
        ];
    }
}
