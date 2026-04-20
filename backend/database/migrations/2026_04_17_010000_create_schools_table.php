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
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');                     // "SMKN 1 Cimahi"
            $table->string('slug')->unique();           // "smkn-1-cimahi"
            $table->string('logo')->nullable();         // Path to logo image
            $table->text('description')->nullable();    // Short description
            $table->string('invite_code')->unique();    // Code to join school
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
