<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('professional_verifications', function (Blueprint $table): void {
            if (! Schema::hasColumn('professional_verifications', 'document_type')) {
                $table->string('document_type', 80)->nullable()->after('document_path');
            }

            if (! Schema::hasColumn('professional_verifications', 'document_original_name')) {
                $table->string('document_original_name', 255)->nullable()->after('document_type');
            }

            if (! Schema::hasColumn('professional_verifications', 'document_mime')) {
                $table->string('document_mime', 120)->nullable()->after('document_original_name');
            }

            if (! Schema::hasColumn('professional_verifications', 'document_size')) {
                $table->unsignedBigInteger('document_size')->nullable()->after('document_mime');
            }

            if (! Schema::hasColumn('professional_verifications', 'document_expires_at')) {
                $table->date('document_expires_at')->nullable()->after('document_size');
            }

            if (! Schema::hasColumn('professional_verifications', 'review_reason')) {
                $table->text('review_reason')->nullable()->after('admin_note');
            }

            if (! Schema::hasColumn('professional_verifications', 'reviewed_by')) {
                $table->foreignId('reviewed_by')->nullable()->after('review_reason')->constrained('users')->nullOnDelete();
            }

            if (! Schema::hasColumn('professional_verifications', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('professional_verifications', function (Blueprint $table): void {
            if (Schema::hasColumn('professional_verifications', 'reviewed_by')) {
                $table->dropConstrainedForeignId('reviewed_by');
            }

            foreach ([
                'document_type',
                'document_original_name',
                'document_mime',
                'document_size',
                'document_expires_at',
                'review_reason',
                'reviewed_at',
            ] as $column) {
                if (Schema::hasColumn('professional_verifications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
