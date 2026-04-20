<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('threads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('forum_channel_id')->constrained('forum_channels')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('body');                        // Markdown content
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_resolved')->default(false);
            $table->integer('vote_count')->default(0);   // Cached count for sorting
            $table->integer('reply_count')->default(0);  // Cached count
            $table->timestamp('last_activity_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            // Indexes for common queries
            $table->index(['forum_channel_id', 'is_pinned', 'last_activity_at']);
            $table->index(['forum_channel_id', 'vote_count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('threads');
    }
};
