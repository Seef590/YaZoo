<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('animals', function (Blueprint $table): void {
            $table->string('contact_phone', 50)->nullable()->after('location');
            $table->boolean('accepts_animal_rules')->default(false)->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('animals', function (Blueprint $table): void {
            $table->dropColumn(['contact_phone', 'accepts_animal_rules']);
        });
    }
};
