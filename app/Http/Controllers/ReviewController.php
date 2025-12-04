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
     * Retorna as reviews do usuário agrupadas por status para a estante.
     */
    public function shelf()
    {
        $userId = Auth::id();
        
        // Busca todas as reviews do usuário com os livros
        $reviews = Review::with('book')
            ->where('user_id', $userId)
            ->get();

        // Agrupa por status
        $grouped = [
            'reading' => [],
            'read' => [],
            'want_to_read' => [],
        ];

        $totalPages = 0;
        $readCount = 0;

        foreach ($reviews as $review) {
            if ($review->book) {
                $bookData = [
                    'review_id' => $review->id,
                    'book_id' => $review->book->id,
                    'openlibrary_id' => $review->book->openlibrary_id,
                    'title' => $review->book->title,
                    'authors' => $review->book->authors ?? [],
                    'cover_url' => $review->book->cover_url,
                    'page_count' => $review->book->page_count,
                    'rating' => $review->rating,
                    'status' => $review->status,
                    'read_at' => $review->read_at,
                ];

                if (isset($grouped[$review->status])) {
                    $grouped[$review->status][] = $bookData;
                }

                // Estatísticas
                if ($review->status === 'read') {
                    $readCount++;
                    if ($review->book->page_count) {
                        $totalPages += $review->book->page_count;
                    }
                }
            }
        }

        // Busca atividades da última semana (criadas ou atualizadas)
        $oneWeekAgo = now()->subWeek();
        $recentActivities = Review::with('book')
            ->where('user_id', $userId)
            ->where(function ($query) use ($oneWeekAgo) {
                $query->where('created_at', '>=', $oneWeekAgo)
                      ->orWhere('updated_at', '>=', $oneWeekAgo);
            })
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'book_title' => $review->book->title ?? 'Livro desconhecido',
                    'book_cover' => $review->book->cover_url ?? null,
                    'openlibrary_id' => $review->book->openlibrary_id ?? null,
                    'status' => $review->status,
                    'rating' => $review->rating,
                    'action' => $this->getActivityAction($review),
                    'created_at' => $review->created_at,
                    'updated_at' => $review->updated_at,
                ];
            })
            ->toArray();

        // Busca última atividade geral (para mensagem se não houver na semana)
        $lastActivity = Review::where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->first();

        return response()->json([
            'reading' => $grouped['reading'],
            'read' => $grouped['read'],
            'want_to_read' => $grouped['want_to_read'],
            'stats' => [
                'read_count' => $readCount,
                'total_pages' => $totalPages,
            ],
            'recent_activities' => $recentActivities,
            'last_activity_date' => $lastActivity ? $lastActivity->updated_at : null,
        ]);
    }

    /**
     * Retorna a ação descritiva da atividade.
     */
    private function getActivityAction($review)
    {
        $actions = [
            'read' => 'finalizou a leitura',
            'reading' => 'começou a ler',
            'want_to_read' => 'adicionou à lista',
        ];

        $action = $actions[$review->status] ?? 'atualizou';

        if ($review->rating) {
            $action .= ' e avaliou com ' . $review->rating . ' estrelas';
        }

        return $action;
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

