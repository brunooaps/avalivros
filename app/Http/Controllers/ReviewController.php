<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reviews = Review::with(['user', 'book'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(20);
        return response()->json($reviews);
    }

    /**
     * Store a newly created resource in storage.
     * Usa firstOrCreate para o livro e updateOrCreate para a review.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'book' => 'required|array',
            'book.key' => 'required|string', // /works/OL123W
            'book.title' => 'required|string',
            'book.author_name' => 'nullable|array',
            'book.cover_i' => 'nullable|integer',
            'book.first_publish_year' => 'nullable|integer',
            'book.number_of_pages_median' => 'nullable|integer',
            'rating' => 'nullable|numeric|min:1|max:5',
            'review_text' => 'nullable|string',
            'status' => 'required|in:read,reading,want_to_read,dropped',
            'is_favorite' => 'nullable|boolean',
            'read_at' => 'nullable|date',
        ]);

        // Extrair o openlibrary_id da chave (ex: /works/OL123W -> OL123W)
        $bookKey = $validated['book']['key'];
        $openlibraryId = str_replace('/works/', '', $bookKey);

        // Construir URL da capa se cover_i existir
        $coverUrl = null;
        if (isset($validated['book']['cover_i']) && $validated['book']['cover_i']) {
            $coverUrl = "https://covers.openlibrary.org/b/id/{$validated['book']['cover_i']}-L.jpg";
        }

        // 1. Tenta achar o livro no banco, ou cria se não existir
        $book = Book::firstOrCreate(
            ['openlibrary_id' => $openlibraryId],
            [
                'title' => $validated['book']['title'],
                'authors' => $validated['book']['author_name'] ?? [],
                'cover_url' => $coverUrl,
                'published_year' => $validated['book']['first_publish_year'] ?? null,
                'page_count' => $validated['book']['number_of_pages_median'] ?? null,
            ]
        );

        // 2. Cria ou atualiza a review vinculada ao usuário
        $review = Review::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'book_id' => $book->id,
            ],
            [
                'rating' => $validated['rating'] ?? null,
                'review_text' => $validated['review_text'] ?? null,
                'status' => $validated['status'],
                'is_favorite' => $validated['is_favorite'] ?? false,
                'read_at' => $validated['read_at'] ?? ($validated['status'] === 'read' ? now() : null),
            ]
        );

        $review->load(['user', 'book']);

        return response()->json([
            'message' => 'Review salva com sucesso!',
            'review' => $review,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Review $review)
    {
        $review->load(['user', 'book']);
        return response()->json($review);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Review $review)
    {
        $this->authorize('update', $review);

        $validated = $request->validate([
            'rating' => 'nullable|numeric|min:1|max:5',
            'review_text' => 'nullable|string',
            'status' => 'required|in:read,reading,want_to_read,dropped',
            'is_favorite' => 'nullable|boolean',
            'read_at' => 'nullable|date',
        ]);

        $review->update($validated);
        $review->load(['user', 'book']);

        return response()->json([
            'message' => 'Review atualizada com sucesso!',
            'review' => $review,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Review $review)
    {
        $this->authorize('delete', $review);
        $review->delete();

        return response()->json([
            'message' => 'Review removida com sucesso!',
        ]);
    }
}

