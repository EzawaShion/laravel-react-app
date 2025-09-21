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
        Schema::table('prefectures', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->comment('県庁所在地の緯度');
            $table->decimal('longitude', 11, 8)->nullable()->comment('県庁所在地の経度');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prefectures', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude']);
        });
    }
};
