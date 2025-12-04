<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Review;
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
            'type' => 'nullable|in:title,author',
        ]);

        $query = $request->input('q');
        $type = $request->input('type', 'title'); // padrão é 'title'
        
        // Constrói a URL baseado no tipo de busca
        $searchParam = $type === 'author' ? 'author' : 'title';
        $url = "https://openlibrary.org/search.json?{$searchParam}=" . urlencode($query) . "&limit=30";

        try {
            $response = Http::get($url);
            
            if (!$response->successful()) {
                return response()->json(['error' => 'Erro ao buscar na OpenLibrary'], 500);
            }

            $data = $response->json();
            $books = [];
            $seenSignatures = []; // Array auxiliar para controlar duplicatas

            if (isset($data['docs']) && is_array($data['docs'])) {
                foreach ($data['docs'] as $doc) {
                    // Filtrar apenas Works (OL...W) e não Editions
                    if (isset($doc['key']) && strpos($doc['key'], '/works/') !== false) {
                        
                        $title = $doc['title'] ?? 'Sem título';
                        $authorName = isset($doc['author_name'][0]) ? $doc['author_name'][0] : 'Desconhecido';

                        // CRIAÇÃO DA CHAVE ÚNICA (Título + Autor)
                        // Removemos espaços e deixamos minúsculo para comparar "Dom Casmurro" com "dom casmurro"
                        $signature = md5(strtolower(trim($title)) . strtolower(trim($authorName)));

                        // Se já vimos essa assinatura, pulamos esse item (Deduplicação)
                        if (isset($seenSignatures[$signature])) {
                            continue;
                        }

                        // Marca como visto
                        $seenSignatures[$signature] = true;

                        $openlibraryId = str_replace('/works/', '', $doc['key']);
                        
                        // Construir URL da capa se cover_i existir
                        $coverUrl = null;
                        if (isset($doc['cover_i']) && $doc['cover_i']) {
                            $coverUrl = "https://covers.openlibrary.org/b/id/{$doc['cover_i']}-L.jpg";
                        }

                        $books[] = [
                            'key' => $doc['key'], // /works/OL123W
                            'openlibrary_id' => $openlibraryId, // OL123W
                            'title' => $title,
                            'author_name' => $doc['author_name'] ?? [],
                            'cover_i' => $doc['cover_i'] ?? null,
                            'cover_url' => $coverUrl,
                            'first_publish_year' => $doc['first_publish_year'] ?? null,
                            'number_of_pages_median' => $doc['number_of_pages_median'] ?? null,
                        ];
                    }
                }
            }

            // Limitamos manualmente para 20 após filtrar as duplicatas
            $books = array_slice($books, 0, 20);

            // Busca contagem de reviews para cada livro pelo openlibrary_id
            $openlibraryIds = array_column($books, 'openlibrary_id');
            
            // Busca contagem de reviews agrupando por openlibrary_id através do relacionamento Book->Review
            $reviewCounts = \App\Models\Review::join('books', 'reviews.book_id', '=', 'books.id')
                ->whereIn('books.openlibrary_id', $openlibraryIds)
                ->selectRaw('books.openlibrary_id, COUNT(reviews.id) as reviews_count')
                ->groupBy('books.openlibrary_id')
                ->pluck('reviews_count', 'openlibrary_id')
                ->toArray();

            // Adiciona a contagem de reviews em cada livro (0 se não tiver reviews)
            foreach ($books as &$book) {
                $book['reviews_count'] = $reviewCounts[$book['openlibrary_id']] ?? 0;
            }

            return response()->json([
                'books' => $books,
                'numFound' => count($books), // Ajustado para refletir o número real exibido
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

    /**
     * Busca ou cria um livro por openlibrary_id, buscando detalhes completos na OpenLibrary se necessário.
     */
    public function getByOpenLibraryId(Request $request, string $openlibraryId)
    {
        // Tenta encontrar no banco primeiro
        $book = Book::where('openlibrary_id', $openlibraryId)->first();

        if (!$book || !$book->description) {
            // Se não existe ou não tem descrição, busca na OpenLibrary
            try {
                $url = "https://openlibrary.org/works/{$openlibraryId}.json";
                $response = Http::get($url);

                if ($response->successful()) {
                    $data = $response->json();

                    // Busca descrição (pode estar em description.value ou description)
                    $description = null;
                    if (isset($data['description'])) {
                        if (is_string($data['description'])) {
                            $description = $data['description'];
                        } elseif (isset($data['description']['value'])) {
                            $description = $data['description']['value'];
                        }
                    }

                    // Busca informações de edição para pegar capa e páginas
                    $coverUrl = $book->cover_url ?? null;
                    $pageCount = $book->page_count ?? null;

                    if (isset($data['covers']) && is_array($data['covers']) && count($data['covers']) > 0) {
                        $coverId = $data['covers'][0];
                        $coverUrl = "https://covers.openlibrary.org/b/id/{$coverId}-L.jpg";
                    }

                    // Tenta buscar primeira edição para pegar número de páginas
                    if (isset($data['first_publish_date'])) {
                        // Já temos o ano
                    }

                    // Atualiza ou cria o livro
                    $bookData = [
                        'title' => $data['title'] ?? $book->title ?? 'Sem título',
                        'description' => $description,
                        'cover_url' => $coverUrl,
                        'published_year' => $book->published_year ?? (isset($data['first_publish_date']) ? (int)substr($data['first_publish_date'], 0, 4) : null),
                    ];

                    if (isset($data['authors']) && is_array($data['authors'])) {
                        $authors = [];
                        foreach ($data['authors'] as $author) {
                            if (isset($author['author']['key'])) {
                                // Busca nome do autor
                                $authorKey = str_replace('/authors/', '', $author['author']['key']);
                                $authorResponse = Http::get("https://openlibrary.org/authors/{$authorKey}.json");
                                if ($authorResponse->successful()) {
                                    $authorData = $authorResponse->json();
                                    $authors[] = $authorData['name'] ?? 'Autor desconhecido';
                                }
                            }
                        }
                        if (!empty($authors)) {
                            $bookData['authors'] = $authors;
                        }
                    }

                    if ($book) {
                        $book->update($bookData);
                    } else {
                        $bookData['openlibrary_id'] = $openlibraryId;
                        $book = Book::create($bookData);
                    }
                }
            } catch (\Exception $e) {
                // Se falhar, retorna o que tem no banco ou erro
                if (!$book) {
                    return response()->json(['error' => 'Livro não encontrado'], 404);
                }
            }
        }

        // Carrega reviews com usuários
        $book->load(['reviews.user']);

        // Busca review do usuário autenticado se existir
        $userReview = null;
        if (auth()->check()) {
            $userReview = Review::where('book_id', $book->id)
                ->where('user_id', auth()->id())
                ->first();
        }

        return response()->json([
            'book' => $book,
            'user_review' => $userReview,
        ]);
    }

}