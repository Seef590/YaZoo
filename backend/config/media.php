<?php

return [
    'driver' => env('MEDIA_STORAGE_DRIVER', 'filesystem'),
    'filesystem_disk' => env('MEDIA_FILESYSTEM_DISK', 'public'),
    'azure_blob' => [
        'enabled' => env('MEDIA_AZURE_BLOB_ENABLED', false),
        'account' => env('MEDIA_AZURE_BLOB_ACCOUNT'),
        'container' => env('MEDIA_AZURE_BLOB_CONTAINER'),
        'endpoint' => env('MEDIA_AZURE_BLOB_ENDPOINT'),
    ],
    'mongodb' => [
        'enabled' => env('MEDIA_MONGODB_ENABLED', false),
        'uri' => env('MEDIA_MONGODB_URI'),
        'database' => env('MEDIA_MONGODB_DATABASE', 'yazoo_media'),
        'bucket' => env('MEDIA_MONGODB_BUCKET', 'uploads'),
    ],
];
