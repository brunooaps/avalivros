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
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('openlibrary_id')->unique();
            $table->string('title');
            $table->json('authors');
            $table->string('cover_url')->nullable();
            $table->integer('page_count')->nullable();
            $table->integer('published_year')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            // Index para busca rápida por openlibrary_id
            $table->index('openlibrary_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};

