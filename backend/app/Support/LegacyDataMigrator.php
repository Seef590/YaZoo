<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use RuntimeException;
use Throwable;

class LegacyDataMigrator
{
    /**
     * Table migration order and normalization hints.
     *
     * @var array<int, array<string, mixed>>
     */
    protected const TABLES = [
        ['name' => 'users', 'primary' => 'id', 'order_by' => 'id', 'booleans' => ['is_admin']],
        ['name' => 'personal_access_tokens', 'primary' => 'id', 'order_by' => 'id', 'json' => ['abilities']],
        ['name' => 'posts', 'primary' => 'id', 'order_by' => 'id', 'json' => ['tags']],
        ['name' => 'comments', 'primary' => 'id', 'order_by' => 'id'],
        ['name' => 'likes', 'primary' => 'id', 'order_by' => 'id'],
        ['name' => 'animals', 'primary' => 'id', 'order_by' => 'id', 'booleans' => ['is_for_adoption'], 'json' => ['gallery_urls']],
        ['name' => 'products', 'primary' => 'id', 'order_by' => 'id', 'json' => ['gallery_urls']],
        ['name' => 'communities', 'primary' => 'id', 'order_by' => 'id', 'booleans' => ['is_private']],
        ['name' => 'community_members', 'primary' => 'id', 'order_by' => 'id'],
        ['name' => 'conversations', 'primary' => 'id', 'order_by' => 'id'],
        ['name' => 'messages', 'primary' => 'id', 'order_by' => 'id'],
        ['name' => 'notifications', 'primary' => 'id', 'order_by' => 'created_at', 'json' => ['data']],
        ['name' => 'reservations', 'primary' => 'id', 'order_by' => 'id'],
    ];

    /**
     * Import legacy SQLite data into the active MySQL database.
     *
     * @return array{legacy_database:string, migrated: array<string, int>}
     */
    public static function migrateSqliteToMysql(): array
    {
        $legacyPath = (string) config('database.connections.sqlite_legacy.database');

        if ($legacyPath === '' || ! File::exists($legacyPath)) {
            throw new RuntimeException("Base SQLite legacy introuvable: {$legacyPath}");
        }

        $source = DB::connection('sqlite_legacy');
        $target = DB::connection('mysql');
        $summary = [];

        $target->statement('SET FOREIGN_KEY_CHECKS=0');

        try {
            foreach (self::TABLES as $tableConfig) {
                $table = (string) $tableConfig['name'];
                $primary = (string) $tableConfig['primary'];
                $orderBy = (string) ($tableConfig['order_by'] ?? $primary);

                if (! self::legacyTableExists($table)) {
                    $summary[$table] = 0;

                    continue;
                }

                $rows = $source
                    ->table($table)
                    ->orderBy($orderBy)
                    ->get()
                    ->map(function ($row) use ($tableConfig) {
                        return self::normalizeRow((array) $row, $tableConfig);
                    })
                    ->all();

                if ($rows === []) {
                    $summary[$table] = 0;

                    continue;
                }

                $updateColumns = array_values(array_diff(array_keys($rows[0]), [$primary]));
                $target->table($table)->upsert($rows, [$primary], $updateColumns);
                $summary[$table] = count($rows);
            }
        } catch (Throwable $exception) {
            throw new RuntimeException(
                'Echec de migration SQLite vers MySQL: '.$exception->getMessage(),
                previous: $exception,
            );
        } finally {
            $target->statement('SET FOREIGN_KEY_CHECKS=1');
        }

        return [
            'legacy_database' => $legacyPath,
            'migrated' => $summary,
        ];
    }

    /**
     * Check if the legacy SQLite table exists.
     */
    protected static function legacyTableExists(string $table): bool
    {
        $row = DB::connection('sqlite_legacy')
            ->selectOne(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
                [$table],
            );

        return $row !== null;
    }

    /**
     * Normalize booleans and JSON payloads before importing them into MySQL.
     *
     * @param  array<string, mixed>  $row
     * @param  array<string, mixed>  $tableConfig
     * @return array<string, mixed>
     */
    protected static function normalizeRow(array $row, array $tableConfig): array
    {
        foreach ($tableConfig['booleans'] ?? [] as $column) {
            if (array_key_exists($column, $row) && $row[$column] !== null) {
                $row[$column] = (int) (bool) $row[$column];
            }
        }

        foreach ($tableConfig['json'] ?? [] as $column) {
            if (! array_key_exists($column, $row)) {
                continue;
            }

            $row[$column] = self::normalizeJsonColumn($row[$column]);
        }

        return $row;
    }

    /**
     * Ensure JSON-like text remains valid for MySQL JSON columns.
     */
    protected static function normalizeJsonColumn(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        if (! is_string($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        json_decode($value, true);

        if (json_last_error() === JSON_ERROR_NONE) {
            return $value;
        }

        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
