<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 40);
            $table->string('title');
            $table->text('description');
            $table->json('animal_types')->nullable();
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('price_type', 40)->default('negotiable');
            $table->json('availability')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->boolean('whatsapp_enabled')->default(true);
            $table->string('status', 40)->default('active');
            $table->json('media')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('reservations_count')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['type', 'status']);
            $table->index(['user_id', 'status']);
            $table->index('city');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_listings');
    }
};
