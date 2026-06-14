<?php

namespace App\Providers;

use App\Models\ClassRoom;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Explicit route model binding: {class} → ClassRoom
        // Because model is "ClassRoom" not "Class" (PHP reserved word)
        Route::model('class', ClassRoom::class);
    }
}
