<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('likes_visibility')->default('public')->after('privacy_settings');
            $table->string('map_visibility')->default('public')->after('likes_visibility');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['likes_visibility', 'map_visibility']);
        });
    }
};
