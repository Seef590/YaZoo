<?php

namespace App\Console\Commands;

use App\Models\ProfessionalVerification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PurgeExpiredProfessionalVerificationDocuments extends Command
{
    protected $signature = 'yazoo:purge-professional-documents {--dry-run : List expired documents without deleting files}';

    protected $description = 'Purge expired professional verification private documents without exposing document contents.';

    public function handle(): int
    {
        $disk = (string) config('professional_verifications.disk', 'private');
        $cutoff = now()->subDays(max(1, (int) config('professional_verifications.retention_days', 365)))->toDateString();
        $dryRun = (bool) $this->option('dry-run');
        $deleted = 0;
        $scanned = 0;

        ProfessionalVerification::query()
            ->whereNotNull('document_path')
            ->whereNotNull('document_expires_at')
            ->whereDate('document_expires_at', '<=', $cutoff)
            ->orderBy('id')
            ->chunkById(100, function ($verifications) use ($disk, $dryRun, &$deleted, &$scanned): void {
                foreach ($verifications as $verification) {
                    $scanned++;
                    $path = (string) $verification->document_path;

                    if (! $this->isSafeDocumentPath($path)) {
                        $this->warn("Skipped unsafe path for verification {$verification->id}.");

                        continue;
                    }

                    if (! $dryRun && Storage::disk($disk)->exists($path)) {
                        Storage::disk($disk)->delete($path);
                        $deleted++;
                    }

                    if (! $dryRun) {
                        $verification->forceFill([
                            'document_path' => null,
                            'document_size' => null,
                        ])->save();
                    }
                }
            });

        $this->info(sprintf(
            'Professional verification document purge %s: scanned=%d deleted=%d disk=%s',
            $dryRun ? 'dry-run' : 'complete',
            $scanned,
            $deleted,
            $disk,
        ));

        return self::SUCCESS;
    }

    private function isSafeDocumentPath(string $path): bool
    {
        $normalized = str_replace('\\', '/', $path);

        return $normalized !== ''
            && ! str_contains($normalized, "\0")
            && ! str_contains($normalized, '../')
            && str_starts_with($normalized, 'professional-verifications/');
    }
}
