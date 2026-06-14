<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    /**
     * Upload an attachment.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120', // 5MB max
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $filename = Str::random(40) . '.' . $extension;

        // Save to storage/app/public/attachments
        $path = $file->storeAs('attachments', $filename, 'public');

        return response()->json([
            'url' => asset('storage/' . $path),
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'type' => $file->getMimeType(),
        ]);
    }
}
