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
            $table->unsignedBigInteger('capital_city_id')->nullable()->comment('県庁所在地のcity_id');
            $table->foreign('capital_city_id')->references('id')->on('cities')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prefectures', function (Blueprint $table) {
            $table->dropForeign(['capital_city_id']);
            $table->dropColumn('capital_city_id');
        });
    }
};
