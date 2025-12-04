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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->decimal('rating', 2, 1)->nullable();
            $table->text('review_text')->nullable();
            $table->enum('status', ['read', 'reading', 'want_to_read', 'dropped'])->default('want_to_read');
            $table->boolean('is_favorite')->default(false);
            $table->date('read_at')->nullable();
            $table->timestamps();

            // Um usuário só pode ter uma review por livro
            $table->unique(['user_id', 'book_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};

