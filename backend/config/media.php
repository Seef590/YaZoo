<?php

return [
    'driver' => env('MEDIA_STORAGE_DRIVER', 'filesystem'),
    'filesystem_disk' => env('MEDIA_FILESYSTEM_DISK', 'public'),
    'mongodb' => [
        'enabled' => env('MEDIA_MONGODB_ENABLED', false),
        'uri' => env('MEDIA_MONGODB_URI', 'mongodb://127.0.0.1:27017'),
        'database' => env('MEDIA_MONGODB_DATABASE', 'yazoo_media'),
        'bucket' => env('MEDIA_MONGODB_BUCKET', 'uploads'),
    ],
];
