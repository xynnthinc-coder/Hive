<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReplyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'thread_id' => $this->thread_id,
            'parent_id' => $this->parent_id,
            'body' => $this->body,
            'is_best_answer' => $this->is_best_answer,
            'vote_count' => $this->vote_count,
            'user' => new UserResource($this->whenLoaded('user')),
            'my_vote' => $this->whenLoaded('userVote', function () {
                return $this->userVote ? $this->userVote->value : 0;
            }),
            'children' => ReplyResource::collection($this->whenLoaded('children')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
