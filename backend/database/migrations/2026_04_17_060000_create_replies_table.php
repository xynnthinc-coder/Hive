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
        Schema::create('replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained('threads')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');                        // Markdown content
            $table->boolean('is_best_answer')->default(false);
            $table->integer('vote_count')->default(0);   // Cached count
            $table->foreignId('parent_id')               // For nested replies
                ->nullable()
                ->constrained('replies')
                ->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['thread_id', 'vote_count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('replies');
    }
};
