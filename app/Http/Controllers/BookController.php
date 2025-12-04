<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class BookController extends Controller
{
    /**
     * Search books in OpenLibrary API
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $query = $request->input('q');
        $url = "https://openlibrary.org/search.json?q=" . urlencode($query) . "&limit=20";

        try {
            $response = Http::get($url);
            
            if (!$response->successful()) {
                return response()->json(['error' => 'Erro ao buscar na OpenLibrary'], 500);
            }

            $data = $response->json();
            $books = [];

            if (isset($data['docs']) && is_array($data['docs'])) {
                foreach ($data['docs'] as $doc) {
                    // Filtrar apenas Works (OL...W) e não Editions
                    if (isset($doc['key']) && strpos($doc['key'], '/works/') !== false) {
                        $openlibraryId = str_replace('/works/', '', $doc['key']);
                        
                        // Construir URL da capa se cover_i existir
                        $coverUrl = null;
                        if (isset($doc['cover_i']) && $doc['cover_i']) {
                            $coverUrl = "https://covers.openlibrary.org/b/id/{$doc['cover_i']}-L.jpg";
                        }

                        $books[] = [
                            'key' => $doc['key'], // /works/OL123W
                            'openlibrary_id' => $openlibraryId, // OL123W
                            'title' => $doc['title'] ?? 'Sem título',
                            'author_name' => $doc['author_name'] ?? [],
                            'cover_i' => $doc['cover_i'] ?? null,
                            'cover_url' => $coverUrl,
                            'first_publish_year' => $doc['first_publish_year'] ?? null,
                            'number_of_pages_median' => $doc['number_of_pages_median'] ?? null,
                        ];
                    }
                }
            }

            return response()->json([
                'books' => $books,
                'numFound' => $data['numFound'] ?? 0,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao buscar livros: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $books = Book::with('reviews')->latest()->paginate(20);
        return response()->json($books);
    }


    /**
     * Display the specified resource.
     */
    public function show(Book $book)
    {
        $book->load(['reviews.user']);
        return response()->json($book);
    }

}

