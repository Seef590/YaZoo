<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('animals', function (Blueprint $table): void {
            if (! Schema::hasColumn('animals', 'seller_type')) {
                $table->string('seller_type')->default('individual')->after('accepts_animal_rules');
            }

            if (! Schema::hasColumn('animals', 'origin')) {
                $table->string('origin', 190)->nullable()->after('seller_type');
            }

            if (! Schema::hasColumn('animals', 'identification_number')) {
                $table->string('identification_number', 120)->nullable()->after('origin');
            }

            if (! Schema::hasColumn('animals', 'health_certificate_path')) {
                $table->string('health_certificate_path')->nullable()->after('identification_number');
            }

            if (! Schema::hasColumn('animals', 'vaccination_book_path')) {
                $table->string('vaccination_book_path')->nullable()->after('health_certificate_path');
            }

            if (! Schema::hasColumn('animals', 'onssa_authorization_number')) {
                $table->string('onssa_authorization_number', 100)->nullable()->after('vaccination_book_path');
            }

            if (! Schema::hasColumn('animals', 'legal_status')) {
                $table->string('legal_status')->default('pending_review')->after('onssa_authorization_number');
            }

            if (! Schema::hasColumn('animals', 'moderation_note')) {
                $table->text('moderation_note')->nullable()->after('legal_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('animals', function (Blueprint $table): void {
            foreach ([
                'moderation_note',
                'legal_status',
                'onssa_authorization_number',
                'vaccination_book_path',
                'health_certificate_path',
                'identification_number',
                'origin',
                'seller_type',
            ] as $column) {
                if (Schema::hasColumn('animals', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
