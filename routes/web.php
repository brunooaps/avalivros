<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\BookController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\MagicLinkController;

Route::get('/', function () {
    return view('app');
});

Route::view('/login', 'app');
Route::view('/cadastro', 'app');
Route::view('/estante', 'app');
Route::view('/livro/{openlibraryId}', 'app');

// Consome o magic link e autentica
Route::get('/magic-login/{token}', [MagicLinkController::class, 'consumeMagicLink'])->name('magic-login');

// Retorna o usuário autenticado (para o frontend saber se está logado)
Route::get('/api/me', function (Request $request) {
    return response()->json([
        'user' => $request->user(),
    ]);
});

// API Routes para React
Route::prefix('api')->group(function () {
    // Books - rotas públicas
    Route::get('/books/search', [BookController::class, 'search']);
    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/{book}', [BookController::class, 'show']);
    Route::get('/books/openlibrary/{openlibraryId}', [BookController::class, 'getByOpenLibraryId']);
    
    // Endpoints para login e cadastro com magic link
    Route::post('/magic-link', [MagicLinkController::class, 'sendLoginLink']);
    Route::post('/register-magic-link', [MagicLinkController::class, 'registerWithMagicLink']);

    // Reviews - rotas protegidas por autenticação (sessão web)
    Route::middleware('auth')->group(function () {
        Route::post('/reviews', [ReviewController::class, 'store']);
        Route::get('/reviews', [ReviewController::class, 'index']);
        Route::get('/reviews/shelf', [ReviewController::class, 'shelf']);
        Route::get('/reviews/{review}', [ReviewController::class, 'show']);
        Route::put('/reviews/{review}', [ReviewController::class, 'update']);
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
    });
});
