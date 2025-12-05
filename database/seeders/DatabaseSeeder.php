<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Cria alguns usuários
        $users = User::factory(20)->create();

        // Cria um usuário de teste específico
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Cria livros
        $books = Book::factory(50)->create();

        // Cria reviews para os livros
        foreach ($books as $book) {
            // Cada livro recebe entre 0 e 8 reviews
            $reviewCount = fake()->numberBetween(0, 8);
            
            Review::factory($reviewCount)
                ->state([
                    'book_id' => $book->id,
                    'user_id' => fake()->randomElement($users)->id,
                ])
                ->create();
        }

        // Cria algumas reviews para o usuário de teste
        $testUserBooks = $books->shuffle()->take(min(10, $books->count()));
        foreach ($testUserBooks as $book) {
            $status = fake()->randomElement(['read', 'reading', 'want_to_read']);
            
            Review::factory()
                ->state([
                    'book_id' => $book->id,
                    'user_id' => $testUser->id,
                    'status' => $status,
                    'read_at' => $status === 'read' ? fake()->dateTimeBetween('-6 months', 'now') : null,
                ])
                ->create();
        }

        $this->command->info('Seed concluído!');
        $this->command->info('- ' . User::count() . ' usuários criados');
        $this->command->info('- ' . Book::count() . ' livros criados');
        $this->command->info('- ' . Review::count() . ' reviews criadas');
    }
}
