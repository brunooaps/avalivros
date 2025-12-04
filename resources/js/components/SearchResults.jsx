import React, { useState } from 'react';
import { BookOpen, ArrowLeft, Loader2, Search, Star, User } from 'lucide-react';

function SearchResults({ searchTerm, searchType, results, loading, onBookClick, onBack, onSearch, onSearchTypeChange }) {
    const [newSearchTerm, setNewSearchTerm] = useState('');
    if (loading) {
        return (
            <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                    <p className="text-[#a8a29e]">Buscando livros...</p>
                </div>
            </div>
        );
    }

    if (!results || results.length === 0) {
        return (
            <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] flex flex-col">
                <nav className="w-full p-6 flex justify-between items-center border-b border-[#44403c] bg-[#1c1917]/95 sticky top-0 z-50 backdrop-blur-sm">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-[#a8a29e] hover:text-amber-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Voltar</span>
                    </button>
                </nav>
                <main className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="text-center">
                        <BookOpen className="w-16 h-16 text-[#44403c] mx-auto mb-4" />
                        <h2 className="text-2xl font-serif font-bold text-[#e7e5e4] mb-2">
                            Nenhum resultado encontrado
                        </h2>
                        <p className="text-[#a8a29e]">
                            Tente buscar com outros termos ou verifique a ortografia.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    const handleNewSearch = () => {
        if (newSearchTerm.trim()) {
            onSearch(newSearchTerm.trim());
        }
    };

    return (
        <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] flex flex-col">
            <nav className="w-full p-6 flex justify-between items-center border-b border-[#44403c] bg-[#1c1917]/95 sticky top-0 z-50 backdrop-blur-sm">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[#a8a29e] hover:text-amber-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Voltar</span>
                </button>
                <div className="text-sm text-[#78716c]">
                    {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                </div>
            </nav>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                {/* Input de pesquisa */}
                <div className="mb-8">
                    <div className="w-full max-w-2xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center bg-[#f5f5f4] rounded-lg shadow-2xl overflow-hidden p-1">
                            {/* Seletor de tipo de busca */}
                            <div className="flex items-center gap-1 px-2 border-r border-[#d6d3d1]">
                                <button
                                    onClick={() => onSearchTypeChange('title')}
                                    className={`px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                                        searchType === 'title'
                                            ? 'bg-[#1c1917] text-[#e7e5e4]'
                                            : 'text-[#78716c] hover:text-[#1c1917]'
                                    }`}
                                    title="Buscar por título"
                                >
                                    <BookOpen className="w-3 h-3" />
                                    <span>Título</span>
                                </button>
                                <button
                                    onClick={() => onSearchTypeChange('author')}
                                    className={`px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                                        searchType === 'author'
                                            ? 'bg-[#1c1917] text-[#e7e5e4]'
                                            : 'text-[#78716c] hover:text-[#1c1917]'
                                    }`}
                                    title="Buscar por autor"
                                >
                                    <User className="w-3 h-3" />
                                    <span>Autor</span>
                                </button>
                            </div>
                            <div className="pl-4 text-[#78716c]">
                                <Search className="w-5 h-5" />
                            </div>
                            <input 
                                type="text"
                                placeholder={searchType === 'title' ? 'Busque por título do livro...' : 'Busque por nome do autor...'}
                                className="w-full p-4 bg-transparent text-[#1c1917] placeholder-[#78716c] focus:outline-none text-lg font-serif"
                                value={newSearchTerm}
                                onChange={(e) => setNewSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleNewSearch();
                                    }
                                }}
                            />
                            <button 
                                onClick={handleNewSearch}
                                disabled={loading || !newSearchTerm.trim()}
                                className="bg-[#1c1917] text-[#e7e5e4] px-6 py-3 rounded hover:bg-[#44403c] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-serif font-bold mb-6 text-[#e7e5e4]">
                    Resultados para "{searchTerm}"
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((book) => (
                        <div
                            key={book.openlibrary_id}
                            onClick={() => onBookClick(book.openlibrary_id)}
                            className="bg-[#0c0a09] border border-[#292524] rounded-xl p-4 hover:border-amber-600/50 hover:shadow-xl hover:shadow-[#000000]/50 transition-all cursor-pointer group"
                        >
                            <div className="flex gap-4">
                                {book.cover_url ? (
                                    <img
                                        src={book.cover_url}
                                        alt={book.title}
                                        className="w-20 h-28 object-cover rounded border border-[#292524] group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="w-20 h-28 bg-[#292524] rounded border border-[#292524] flex items-center justify-center">
                                        <BookOpen className="w-8 h-8 text-[#44403c]" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-serif font-semibold text-[#e7e5e4] mb-1 line-clamp-2 group-hover:text-amber-500 transition-colors">
                                        {book.title}
                                    </h3>
                                    {book.author_name && book.author_name.length > 0 && (
                                        <p className="text-sm text-[#a8a29e] mb-2 line-clamp-1">
                                            {book.author_name[0]}
                                            {book.author_name.length > 1 && ` +${book.author_name.length - 1}`}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {book.first_publish_year && (
                                            <p className="text-xs text-[#57534e]">
                                                {book.first_publish_year}
                                            </p>
                                        )}
                                        {book.reviews_count > 0 && (
                                            <div className="flex items-center gap-1 text-[#57534e]">
                                                <Star className="w-3 h-3 fill-amber-500/30 text-amber-500/30" />
                                                <span className="text-[10px] text-[#57534e]">
                                                    {book.reviews_count} {book.reviews_count === 1 ? 'review' : 'reviews'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default SearchResults;

