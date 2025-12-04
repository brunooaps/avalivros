<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'openlibrary_id',
        'title',
        'authors',
        'cover_url',
        'page_count',
        'published_year',
        'description',
    ];

    protected $casts = [
        'authors' => 'array',
    ];

    /**
     * Get the reviews for the book.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}

