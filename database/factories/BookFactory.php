<?php

namespace Database\Factories;

use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $authors = [];
        $authorCount = fake()->numberBetween(1, 3);
        for ($i = 0; $i < $authorCount; $i++) {
            $authors[] = fake()->name();
        }

        return [
            'openlibrary_id' => 'OL' . fake()->unique()->numberBetween(1000000, 9999999) . 'W',
            'title' => fake()->sentence(fake()->numberBetween(2, 6)),
            'authors' => $authors,
            'cover_url' => fake()->optional(0.7)->randomElement([
                null,
                'https://covers.openlibrary.org/b/id/8739161-L.jpg', // Exemplo de capa válida
                'https://covers.openlibrary.org/b/id/8739162-L.jpg',
                'https://covers.openlibrary.org/b/id/8739163-L.jpg',
            ]),
            'page_count' => fake()->optional(0.8)->numberBetween(100, 800),
            'published_year' => fake()->optional(0.9)->numberBetween(1900, now()->year),
            'description' => fake()->optional(0.6)->paragraphs(fake()->numberBetween(2, 5), true),
        ];
    }
}

