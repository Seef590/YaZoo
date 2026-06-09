<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\MediaStorage;
use Illuminate\Http\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class MediaController extends Controller
{
    /**
     * Stream a media file stored in MongoDB GridFS.
     */
    public function show(string $fileId): StreamedResponse
    {
        try {
            $file = MediaStorage::openMongoDownload($fileId);
        } catch (RuntimeException|Throwable) {
            abort(Response::HTTP_NOT_FOUND);
        }

        return response()->stream(
            function () use ($file): void {
                stream_copy_to_stream($file['stream'], fopen('php://output', 'wb'));
                fclose($file['stream']);
            },
            Response::HTTP_OK,
            array_filter([
                'Content-Type' => $file['mime_type'],
                'Content-Length' => $file['size'],
                'Content-Disposition' => 'inline; filename="'.$file['filename'].'"',
            ]),
        );
    }
}
