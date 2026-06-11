<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('likes', function (Blueprint $table): void {
            if (! Schema::hasColumn('likes', 'reaction')) {
                $table->string('reaction', 24)->default('like')->after('user_id');
            }
        });

        Schema::table('comments', function (Blueprint $table): void {
            if (! Schema::hasColumn('comments', 'parent_id')) {
                $table->foreignId('parent_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('comments')
                    ->cascadeOnDelete();
            }

            if (! Schema::hasColumn('comments', 'reaction')) {
                $table->string('reaction', 24)->nullable()->after('body');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table): void {
            if (Schema::hasColumn('comments', 'parent_id')) {
                $table->dropConstrainedForeignId('parent_id');
            }

            if (Schema::hasColumn('comments', 'reaction')) {
                $table->dropColumn('reaction');
            }
        });

        Schema::table('likes', function (Blueprint $table): void {
            if (Schema::hasColumn('likes', 'reaction')) {
                $table->dropColumn('reaction');
            }
        });
    }
};
