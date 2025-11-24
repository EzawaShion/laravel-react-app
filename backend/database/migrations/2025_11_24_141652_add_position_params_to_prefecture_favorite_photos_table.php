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
            $table->integer('position_x')->default(50)->nullable()->after('display_position')->comment('X position percentage (0-100)');
            $table->integer('position_y')->default(50)->nullable()->after('position_x')->comment('Y position percentage (0-100)');
            $table->decimal('scale', 5, 2)->default(1.0)->nullable()->after('position_y')->comment('Zoom scale');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prefecture_favorite_photos', function (Blueprint $table) {
            $table->dropColumn(['position_x', 'position_y', 'scale']);
        });
    }
};
