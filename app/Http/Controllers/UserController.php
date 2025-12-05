<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Busca o perfil de um usuário pelo username
     */
    public function show(string $username)
    {
        $user = User::where('username', $username)->first();

        if (!$user) {
            return response()->json(['error' => 'Usuário não encontrado'], 404);
        }

        // Busca todas as reviews do usuário com os livros
        $reviews = Review::with('book')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Formata as reviews para o frontend
        $formattedReviews = $reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'review_text' => $review->review_text,
                'status' => $review->status,
                'read_at' => $review->read_at,
                'created_at' => $review->created_at,
                'book' => [
                    'id' => $review->book->id,
                    'openlibrary_id' => $review->book->openlibrary_id,
                    'title' => $review->book->title,
                    'authors' => $review->book->authors ?? [],
                    'cover_url' => $review->book->cover_url,
                ],
            ];
        });

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'created_at' => $user->created_at,
            ],
            'reviews' => $formattedReviews,
            'total_reviews' => $reviews->count(),
        ]);
    }
}
