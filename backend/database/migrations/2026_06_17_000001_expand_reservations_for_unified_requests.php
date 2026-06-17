<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('category', 40)->nullable()->after('reservable_id');
            $table->timestamp('scheduled_at')->nullable()->after('quantity');
            $table->timestamp('scheduled_end_at')->nullable()->after('scheduled_at');
            $table->string('contact_phone')->nullable()->after('note');
            $table->text('provider_note')->nullable()->after('contact_phone');
            $table->text('admin_note')->nullable()->after('provider_note');
            $table->timestamp('rejected_at')->nullable()->after('approved_at');

            $table->index(['category', 'reservation_status']);
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropIndex(['category', 'reservation_status']);
            $table->dropColumn([
                'category',
                'scheduled_at',
                'scheduled_end_at',
                'contact_phone',
                'provider_note',
                'admin_note',
                'rejected_at',
            ]);
        });
    }
};
