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
        Schema::create('photos', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('photo_group_id')->unsigned()->nullable();
            $table->bigInteger('post_id')->unsigned();
            $table->string('file_path');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->json('tags')->nullable();
            $table->integer('order_num')->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->foreign('photo_group_id')->references('id')->on('photo_groups')->onDelete('set null');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('photos');
    }
};
