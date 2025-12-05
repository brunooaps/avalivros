import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Star, Feather, Book, Coffee, Bookmark } from 'lucide-react';
import SearchResults from './SearchResults';

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('/api/me', {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'include', // garante envio de cookies de sessão
                });

                if (!response.ok) return;

                const data = await response.json();
                setCurrentUser(data.user ?? null);
            } catch (error) {
                // silencioso por enquanto
                console.error('Erro ao buscar usuário logado:', error);
            }
        };

        fetchCurrentUser();
    }, []);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setSearchLoading(true);
        try {
            const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar livros');
            }

            const data = await response.json();
            setSearchResults(data.books || []);
        } catch (error) {
            console.error('Erro ao buscar:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleBookClick = (openlibraryId) => {
        window.location.href = `/livro/${openlibraryId}`;
    };

    const handleBackFromSearch = () => {
        setSearchResults(null);
        setSearchTerm('');
    };

    const handleSearchFromResults = async (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
        setSearchLoading(true);
        try {
            const response = await fetch(`/api/books/search?q=${encodeURIComponent(newSearchTerm)}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar livros');
            }

            const data = await response.json();
            setSearchResults(data.books || []);
        } catch (error) {
            console.error('Erro ao buscar:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Se há resultados de busca, mostra a tela de resultados
    if (searchResults !== null) {
        return (
            <SearchResults
                searchTerm={searchTerm}
                results={searchResults}
                loading={searchLoading}
                onBookClick={handleBookClick}
                onBack={handleBackFromSearch}
                onSearch={handleSearchFromResults}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] font-sans selection:bg-[#d6d3d1] selection:text-[#1c1917]">
            {/* Background Texture Overlay (Optional subtle grain could go here) */}
            
            {/* Navbar Minimalista */}
            <nav className="w-full p-6 flex justify-between items-center border-b border-[#44403c] bg-[#1c1917]/95 sticky top-0 z-50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                    <span className="text-xl font-serif tracking-wider text-[#e7e5e4]">AvaLivros</span>
                </div>
                <div className="flex gap-6 text-sm font-medium text-[#a8a29e]">
                    <button className="hover:text-amber-500 transition-colors" onClick={() => window.location.href = '/estante'}>Minha Estante</button>
                    {currentUser ? (
                        <div className="px-4 py-2 bg-[#292524] text-[#e7e5e4] rounded border border-[#44403c] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm text-[#e7e5e4] font-semibold">
                                {currentUser.name}
                            </span>
                        </div>
                    ) : (
                        <a
                            href="/login"
                            className="px-4 py-2 bg-[#292524] text-[#e7e5e4] rounded hover:bg-[#44403c] transition-colors border border-[#44403c]"
                        >
                            Entrar
                        </a>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
                <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-[#e7e5e4] leading-tight">
                    O seu diário de <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 italic pr-2">
                        jornadas literárias
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-[#a8a29e] max-w-2xl mb-10 font-light leading-relaxed">
                    Descubra, avalie e preserve as memórias de cada livro lido. 
                    Conectado diretamente à <strong>OpenLibrary</strong> para encontrar clássicos e contemporâneos.
                </p>

                {/* Barra de Pesquisa "Hero" */}
                <div className="w-full max-w-2xl relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex items-center bg-[#f5f5f4] rounded-lg shadow-2xl overflow-hidden p-1">
                        <div className="pl-4 text-[#78716c]">
                            <Search className="w-5 h-5" />
                        </div>
                        <input 
                            type="text"
                            placeholder="Busque por título, autor ou assunto..."
                            className="w-full p-4 bg-transparent text-[#1c1917] placeholder-[#78716c] focus:outline-none text-lg font-serif"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && searchTerm.trim()) {
                                    handleSearch();
                                }
                            }}
                        />
                        <button 
                            onClick={handleSearch}
                            disabled={searchLoading || !searchTerm.trim()}
                            className="bg-[#1c1917] text-[#e7e5e4] px-6 py-3 rounded hover:bg-[#44403c] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {searchLoading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                    <div className="text-left mt-2 pl-2 text-xs text-[#57534e]">
                        * Pesquisa alimentada por OpenLibrary.org
                    </div>
                </div>

            </main>

            {/* Features / "Why" Section */}
            <section className="border-t border-[#292524] bg-[#0c0a09]">
                <div className="container mx-auto px-4 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="group p-6 rounded-xl hover:bg-[#1c1917] transition-all duration-300 border border-transparent hover:border-[#292524]">
                            <div className="w-12 h-12 bg-[#292524] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-amber-600">
                                <Book className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-serif font-semibold mb-3 text-[#e7e5e4]">Biblioteca Infinita</h3>
                            <p className="text-[#a8a29e] leading-relaxed">
                                Acesso instantâneo a milhões de obras. Se foi escrito, você pode encontrar e adicionar à sua estante virtual.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-6 rounded-xl hover:bg-[#1c1917] transition-all duration-300 border border-transparent hover:border-[#292524]">
                            <div className="w-12 h-12 bg-[#292524] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-amber-600">
                                <Star className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-serif font-semibold mb-3 text-[#e7e5e4]">Avalie com Alma</h3>
                            <p className="text-[#a8a29e] leading-relaxed">
                                Dê notas, escreva resenhas detalhadas e marque seus favoritos. Transforme sua opinião em um guia para outros leitores.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-6 rounded-xl hover:bg-[#1c1917] transition-all duration-300 border border-transparent hover:border-[#292524]">
                            <div className="w-12 h-12 bg-[#292524] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-amber-600">
                                <Bookmark className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-serif font-semibold mb-3 text-[#e7e5e4]">Acompanhe o Progresso</h3>
                            <p className="text-[#a8a29e] leading-relaxed">
                                Marque como "Lido", "Lendo" ou "Quero Ler". O controle total da sua vida literária em um só lugar.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer com citação */}
            <footer className="border-t border-[#292524] py-12 text-center bg-[#1c1917]">
                <div className="max-w-2xl mx-auto px-6">
                    <Coffee className="w-8 h-8 mx-auto text-[#44403c] mb-6" />
                    <blockquote className="font-serif text-2xl italic text-[#78716c] mb-6">
                        "Um quarto sem livros é como um corpo sem alma."
                    </blockquote>
                    <cite className="text-sm text-[#57534e] not-italic uppercase tracking-widest block font-semibold">
                        — Cícero
                    </cite>
                    
                    <div className="mt-12 text-xs text-[#44403c]">
                        &copy; 2025 AvaLivros. Feito com paixão por leitura e código.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;