<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'is_suspended')) {
                $table->boolean('is_suspended')->default(false)->after('is_admin');
            }

            if (! Schema::hasColumn('users', 'suspended_at')) {
                $table->timestamp('suspended_at')->nullable()->after('is_suspended');
            }

            if (! Schema::hasColumn('users', 'suspended_reason')) {
                $table->text('suspended_reason')->nullable()->after('suspended_at');
            }

            if (! Schema::hasColumn('users', 'banned_at')) {
                $table->timestamp('banned_at')->nullable()->after('suspended_reason');
            }

            if (! Schema::hasColumn('users', 'banned_reason')) {
                $table->text('banned_reason')->nullable()->after('banned_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            foreach ([
                'banned_reason',
                'banned_at',
                'suspended_reason',
                'suspended_at',
                'is_suspended',
            ] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
