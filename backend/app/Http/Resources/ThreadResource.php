<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ThreadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'forum_channel_id' => $this->forum_channel_id,
            'title' => $this->title,
            'body' => $this->body,
            'is_pinned' => $this->is_pinned,
            'is_resolved' => $this->is_resolved,
            'vote_count' => $this->vote_count,
            'reply_count' => $this->reply_count,
            'last_activity_at' => $this->last_activity_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'forum_channel' => [
                'id' => $this->whenLoaded('forumChannel', fn() => $this->forumChannel->id),
                'name' => $this->whenLoaded('forumChannel', fn() => $this->forumChannel->name),
                'slug' => $this->whenLoaded('forumChannel', fn() => $this->forumChannel->slug),
                'icon' => $this->whenLoaded('forumChannel', fn() => $this->forumChannel->icon),
                'class_id' => $this->whenLoaded('forumChannel', fn() => $this->forumChannel->class_id),
            ],
            'class_name' => $this->whenLoaded('forumChannel', function () {
                return $this->forumChannel->relationLoaded('classRoom')
                    ? $this->forumChannel->classRoom?->name
                    : null;
            }),
            'my_vote' => $this->whenLoaded('userVote', function () {
                return $this->userVote ? $this->userVote->value : 0;
            }),
            'has_best_answer' => $this->whenLoaded('replies', function () {
                return $this->replies->contains('is_best_answer', true);
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
