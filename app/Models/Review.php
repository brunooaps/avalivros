<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id',
        'rating',
        'review_text',
        'status',
        'is_favorite',
        'read_at',
    ];

    protected $casts = [
        'rating' => 'decimal:1',
        'is_favorite' => 'boolean',
        'read_at' => 'date',
    ];

    /**
     * Get the user that wrote the review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the book that was reviewed.
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}

