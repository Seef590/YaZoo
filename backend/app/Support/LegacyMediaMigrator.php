<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LegacyMediaMigrator
{
    /**
     * @var array<string, string>
     */
    protected static array $pathCache = [];

    /**
     * Migrate legacy local media references into MongoDB and update MySQL rows.
     *
     * @return array<string, array<string, int>>
     */
    public static function migrateFilesystemMediaToMongo(): array
    {
        self::$pathCache = [];

        return [
            'users' => self::migrateUsers(),
            'posts' => self::migratePosts(),
            'animals' => self::migrateAnimals(),
            'products' => self::migrateProducts(),
            'communities' => self::migrateCommunities(),
        ];
    }

    /**
     * Migrate user avatar and cover photo.
     *
     * @return array<string, int>
     */
    protected static function migrateUsers(): array
    {
        $summary = self::baseSummary();

        DB::table('users')
            ->orderBy('id')
            ->get()
            ->each(function ($user) use (&$summary): void {
                $updates = [];

                foreach (['avatar', 'cover_photo'] as $column) {
                    $result = self::migratePathValue($user->{$column});
                    $summary[$result['status']]++;

                    if ($result['updated']) {
                        $updates[$column] = $result['value'];
                    }
                }

                if ($updates !== []) {
                    DB::table('users')->where('id', $user->id)->update($updates);
                }
            });

        return $summary;
    }

    /**
     * Migrate post media paths.
     *
     * @return array<string, int>
     */
    protected static function migratePosts(): array
    {
        $summary = self::baseSummary();

        DB::table('posts')
            ->orderBy('id')
            ->get()
            ->each(function ($post) use (&$summary): void {
                $updates = [];
                $sharedResult = null;

                if ($post->media_path && $post->media_path === $post->image_path) {
                    $sharedResult = self::migratePathValue($post->media_path);
                    $summary[$sharedResult['status']]++;

                    if ($sharedResult['updated']) {
                        $updates['media_path'] = $sharedResult['value'];
                        $updates['image_path'] = $sharedResult['value'];
                    }
                } else {
                    foreach (['image_path', 'media_path'] as $column) {
                        $result = self::migratePathValue($post->{$column});
                        $summary[$result['status']]++;

                        if ($result['updated']) {
                            $updates[$column] = $result['value'];
                        }
                    }
                }

                if ($updates !== []) {
                    DB::table('posts')->where('id', $post->id)->update($updates);
                }
            });

        return $summary;
    }

    /**
     * Migrate marketplace animal media.
     *
     * @return array<string, int>
     */
    protected static function migrateAnimals(): array
    {
        $summary = self::baseSummary();

        DB::table('animals')
            ->orderBy('id')
            ->get()
            ->each(function ($animal) use (&$summary): void {
                $updates = [];

                $main = self::migratePathValue($animal->photo_url);
                $summary[$main['status']]++;

                if ($main['updated']) {
                    $updates['photo_url'] = $main['value'];
                }

                $galleryMigration = self::migrateJsonArrayPaths($animal->gallery_urls);
                self::mergeSummary($summary, $galleryMigration['summary']);

                if ($galleryMigration['updated']) {
                    $updates['gallery_urls'] = json_encode(
                        $galleryMigration['value'],
                        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
                    );
                }

                if ($updates !== []) {
                    DB::table('animals')->where('id', $animal->id)->update($updates);
                }
            });

        return $summary;
    }

    /**
     * Migrate marketplace product media.
     *
     * @return array<string, int>
     */
    protected static function migrateProducts(): array
    {
        $summary = self::baseSummary();

        DB::table('products')
            ->orderBy('id')
            ->get()
            ->each(function ($product) use (&$summary): void {
                $updates = [];

                $main = self::migratePathValue($product->image_url);
                $summary[$main['status']]++;

                if ($main['updated']) {
                    $updates['image_url'] = $main['value'];
                }

                $galleryMigration = self::migrateJsonArrayPaths($product->gallery_urls);
                self::mergeSummary($summary, $galleryMigration['summary']);

                if ($galleryMigration['updated']) {
                    $updates['gallery_urls'] = json_encode(
                        $galleryMigration['value'],
                        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
                    );
                }

                if ($updates !== []) {
                    DB::table('products')->where('id', $product->id)->update($updates);
                }
            });

        return $summary;
    }

    /**
     * Migrate community images when they point to internal files.
     *
     * @return array<string, int>
     */
    protected static function migrateCommunities(): array
    {
        $summary = self::baseSummary();

        DB::table('communities')
            ->orderBy('id')
            ->get()
            ->each(function ($community) use (&$summary): void {
                $result = self::migratePathValue($community->image_url);
                $summary[$result['status']]++;

                if ($result['updated']) {
                    DB::table('communities')
                        ->where('id', $community->id)
                        ->update(['image_url' => $result['value']]);
                }
            });

        return $summary;
    }

    /**
     * Migrate a JSON array of path strings.
     *
     * @return array{value: array<int, string>, updated: bool, summary: array<string, int>}
     */
    protected static function migrateJsonArrayPaths(mixed $value): array
    {
        $paths = self::decodeJsonArray($value);
        $updated = false;
        $summary = self::baseSummary();
        $nextPaths = [];

        foreach ($paths as $path) {
            $result = self::migratePathValue($path);
            $summary[$result['status']]++;
            $updated = $updated || $result['updated'];

            if (is_string($result['value']) && trim($result['value']) !== '') {
                $nextPaths[] = $result['value'];
            }
        }

        return [
            'value' => array_values(array_unique($nextPaths)),
            'updated' => $updated,
            'summary' => $summary,
        ];
    }

    /**
     * Migrate a single media path from filesystem/public URL to MongoDB reference.
     *
     * @return array{value: string|null, status: string, updated: bool}
     */
    protected static function migratePathValue(mixed $path): array
    {
        $normalized = self::normalizePath($path);

        if ($normalized === null) {
            return ['value' => null, 'status' => 'empty', 'updated' => false];
        }

        if (MediaStorage::isMongoReference($normalized)) {
            return ['value' => $normalized, 'status' => 'already_mongodb', 'updated' => false];
        }

        $relativePath = self::extractPublicDiskRelativePath($normalized);

        if ($relativePath === null) {
            return ['value' => $normalized, 'status' => 'external', 'updated' => false];
        }

        if (isset(self::$pathCache[$relativePath])) {
            return ['value' => self::$pathCache[$relativePath], 'status' => 'migrated', 'updated' => true];
        }

        if (! Storage::disk((string) config('media.filesystem_disk', 'public'))->exists($relativePath)) {
            return ['value' => $normalized, 'status' => 'missing_file', 'updated' => false];
        }

        $mongoReference = MediaStorage::importPublicDiskPath($relativePath, dirname($relativePath));
        self::$pathCache[$relativePath] = $mongoReference;

        return ['value' => $mongoReference, 'status' => 'migrated', 'updated' => true];
    }

    /**
     * Normalize an incoming media path.
     */
    protected static function normalizePath(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed !== '' ? $trimmed : null;
    }

    /**
     * Decode a JSON array or return an empty list.
     *
     * @return array<int, string>
     */
    protected static function decodeJsonArray(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter($value, fn ($item) => is_string($item) && trim($item) !== ''));
        }

        if (! is_string($value) || trim($value) === '') {
            return [];
        }

        $decoded = json_decode($value, true);

        if (! is_array($decoded)) {
            return [];
        }

        return array_values(array_filter($decoded, fn ($item) => is_string($item) && trim($item) !== ''));
    }

    /**
     * Try to map a stored value to the configured public disk.
     */
    protected static function extractPublicDiskRelativePath(string $path): ?string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            $appUrl = rtrim((string) config('app.url'), '/');
            $storagePrefix = $appUrl.'/storage/';

            if (str_starts_with($path, $storagePrefix)) {
                return ltrim(substr($path, strlen($storagePrefix)), '/');
            }

            return null;
        }

        $normalized = ltrim(str_replace('\\', '/', $path), '/');

        if (str_starts_with($normalized, 'storage/')) {
            return ltrim(substr($normalized, strlen('storage/')), '/');
        }

        return $normalized;
    }

    /**
     * Base counters for migration summaries.
     *
     * @return array<string, int>
     */
    protected static function baseSummary(): array
    {
        return [
            'migrated' => 0,
            'already_mongodb' => 0,
            'external' => 0,
            'missing_file' => 0,
            'empty' => 0,
        ];
    }

    /**
     * Merge child summary counters into a parent summary.
     *
     * @param  array<string, int>  $target
     * @param  array<string, int>  $source
     */
    protected static function mergeSummary(array &$target, array $source): void
    {
        foreach ($source as $key => $value) {
            $target[$key] = ($target[$key] ?? 0) + $value;
        }
    }
}
