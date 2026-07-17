<?php

return [
    'disk' => env('PROFESSIONAL_VERIFICATIONS_DISK', 'private'),
    'retention_days' => (int) env('PROFESSIONAL_VERIFICATION_DOCUMENT_RETENTION_DAYS', 365),
];
