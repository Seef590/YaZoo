<?php

require_once __DIR__.'/vendor/autoload.php';

use Dotenv\Dotenv;
use MongoDB\Client;

/**
 * Database identifiers cannot be bound as prepared-statement parameters.
 * Keep the cleanup target fixed and whitelist before using it in SQL.
 */
function safeDatabaseIdentifier(string $identifier): string
{
    // PCRE \w stays ASCII-only here because the pattern has no unicode/UCP flag.
    if (! preg_match('/\A\w{1,64}\z/', $identifier)) {
        throw new InvalidArgumentException('Unsafe database identifier.');
    }

    return $identifier;
}

function quoteMysqlIdentifier(string $identifier): string
{
    return '`'.safeDatabaseIdentifier($identifier).'`';
}

Dotenv::createImmutable(__DIR__)->safeLoad();

$mysqlHost = $_ENV['DB_HOST'] ?? '127.0.0.1';
$mysqlPort = $_ENV['DB_PORT'] ?? '3306';
$mysqlUser = $_ENV['DB_USERNAME'] ?? 'root';
$mysqlPass = $_ENV['DB_PASSWORD'] ?? '';
$mongoUri = $_ENV['MEDIA_MONGODB_URI'] ?? 'mongodb://127.0.0.1:27017';

$legacyMysqlDatabase = 'yazoo2';
$legacyMongoDatabase = 'yazoo_media';

$pdo = new PDO(
    "mysql:host={$mysqlHost};port={$mysqlPort};charset=utf8mb4",
    $mysqlUser,
    $mysqlPass,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$pdo->exec(sprintf('DROP DATABASE IF EXISTS %s', quoteMysqlIdentifier($legacyMysqlDatabase)));
echo "MySQL legacy database removed if present: {$legacyMysqlDatabase}".PHP_EOL;

$mongoClient = new Client($mongoUri);
$mongoClient->dropDatabase(safeDatabaseIdentifier($legacyMongoDatabase));
echo "MongoDB legacy database removed if present: {$legacyMongoDatabase}".PHP_EOL;
