<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['read', 'reading', 'want_to_read', 'dropped'];
        $status = fake()->randomElement($statuses);

        return [
            'user_id' => User::factory(),
            'book_id' => Book::factory(),
            'rating' => fake()->optional(0.8)->randomFloat(1, 1, 5), // 80% chance de ter rating
            'review_text' => fake()->optional(0.7)->paragraphs(fake()->numberBetween(1, 4), true), // 70% chance de ter texto
            'status' => $status,
            'is_favorite' => fake()->boolean(20), // 20% chance de ser favorito
            'read_at' => $status === 'read' ? fake()->dateTimeBetween('-1 year', 'now') : null,
        ];
    }

    /**
     * Indicate that the review is for a read book.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'read',
            'read_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'rating' => fake()->optional(0.9)->randomFloat(1, 1, 5),
        ]);
    }

    /**
     * Indicate that the review is for a currently reading book.
     */
    public function reading(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'reading',
            'read_at' => null,
        ]);
    }

    /**
     * Indicate that the review is for a want to read book.
     */
    public function wantToRead(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'want_to_read',
            'read_at' => null,
            'rating' => null,
        ]);
    }
}

