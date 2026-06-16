<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class AttachmentController extends Controller
{
    /**
     * Upload an attachment.
     * Saves directly to public/uploads/attachments/ so it works
     * on cPanel without needing php artisan storage:link.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120', // 5MB max
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $filename = Str::random(40) . '.' . $extension;

        // Capture metadata BEFORE moving the file
        $originalName = $file->getClientOriginalName();
        $size = $file->getSize();
        $type = $file->getMimeType();

        // Save directly to public directory (works on any hosting)
        $destPath = public_path('uploads/attachments');
        if (!File::isDirectory($destPath)) {
            File::makeDirectory($destPath, 0755, true);
        }
        $file->move($destPath, $filename);

        return response()->json([
            'url' => $request->getSchemeAndHttpHost() . '/api/attachments/' . $filename,
            'name' => $originalName,
            'size' => $size,
            'type' => $type,
        ]);
    }

    /**
     * Serve an attachment file.
     * Checks public/uploads first, then falls back to storage/app/public
     * for backward compatibility with older uploads.
     */
    public function show($filename)
    {
        // 1. Check public/uploads/attachments/ (new location)
        $publicFile = public_path('uploads/attachments/' . $filename);
        if (file_exists($publicFile)) {
            return response()->file($publicFile);
        }

        // 2. Fallback: check storage/app/public/attachments/ (old location)
        $storagePath = 'attachments/' . $filename;
        if (Storage::disk('public')->exists($storagePath)) {
            $content = Storage::disk('public')->get($storagePath);
            $type = Storage::disk('public')->mimeType($storagePath);
            return response($content, 200)
                ->header('Content-Type', $type)
                ->header('Cache-Control', 'public, max-age=31536000');
        }

        return response()->json(['message' => 'File not found.'], 404);
    }
}
