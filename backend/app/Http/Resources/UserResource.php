<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Consistent response format for web & mobile API.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'nickname' => $this->nickname,
            'display_name' => $this->display_name,
            'email' => $this->email,
            'role' => $this->role,
            'avatar' => $this->avatar,
            'bio' => $this->bio,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
