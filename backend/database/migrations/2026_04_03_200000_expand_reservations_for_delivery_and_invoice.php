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
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('delivery_method', 20)->default('pickup')->after('quantity');
            $table->string('delivery_status', 30)->default('pending')->after('payment_status');
            $table->string('delivery_contact_name')->nullable()->after('delivery_status');
            $table->string('delivery_phone')->nullable()->after('delivery_contact_name');
            $table->string('delivery_city')->nullable()->after('delivery_phone');
            $table->text('delivery_address')->nullable()->after('delivery_city');
            $table->text('delivery_notes')->nullable()->after('delivery_address');
            $table->decimal('delivery_fee', 10, 2)->default(0)->after('total_price');
            $table->string('invoice_number')->nullable()->unique()->after('delivery_fee');
            $table->timestamp('invoice_issued_at')->nullable()->after('invoice_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropUnique(['invoice_number']);
            $table->dropColumn([
                'delivery_method',
                'delivery_status',
                'delivery_contact_name',
                'delivery_phone',
                'delivery_city',
                'delivery_address',
                'delivery_notes',
                'delivery_fee',
                'invoice_number',
                'invoice_issued_at',
            ]);
        });
    }
};
