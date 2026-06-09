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
        Schema::table('animals', function (Blueprint $table) {
            $table->string('category', 50)->default('other')->after('name');
            $table->json('gallery_urls')->nullable()->after('photo_url');
            $table->string('listing_status', 20)->default('available')->after('is_for_adoption');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('category', 50)->default('other')->after('name');
            $table->json('gallery_urls')->nullable()->after('image_url');
            $table->string('listing_status', 20)->default('available')->after('stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            $table->dropColumn(['category', 'gallery_urls', 'listing_status']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['category', 'gallery_urls', 'listing_status']);
        });
    }
};
