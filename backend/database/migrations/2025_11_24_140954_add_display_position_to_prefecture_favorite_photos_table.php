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
        Schema::table('prefecture_favorite_photos', function (Blueprint $table) {
            $table->string('display_position')->default('center')->nullable()->after('photo_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prefecture_favorite_photos', function (Blueprint $table) {
            $table->dropColumn('display_position');
        });
    }
};
