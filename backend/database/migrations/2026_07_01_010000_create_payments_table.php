<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->nullOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('seller_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('provider', 40)->index();
            $table->string('status', 30)->index();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('MAD');
            $table->decimal('commission_amount', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2)->nullable();
            $table->string('provider_reference')->nullable()->index();
            $table->string('internal_reference')->unique();
            $table->string('idempotency_key')->nullable()->unique();
            $table->text('checkout_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['reservation_id', 'provider', 'status'], 'payments_reservation_provider_status_idx');
            $table->index(['buyer_id', 'status', 'created_at'], 'payments_buyer_status_created_idx');
            $table->index(['seller_id', 'status', 'created_at'], 'payments_seller_status_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
