<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AttachmentController;

Route::get('/', function () {
    return view('welcome');
});

// Catch old /storage/attachments/... URLs that were stored in DB before
// the upload method was changed to save to public/uploads/
Route::get('/storage/attachments/{filename}', [AttachmentController::class, 'show']);
