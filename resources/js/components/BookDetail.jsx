import React, { useState, useEffect } from 'react';
import { 
    BookOpen, Star, StarHalf, ArrowLeft, Loader2, 
    BookCheck, BookOpenText, Bookmark, X, Calendar, FileText 
} from 'lucide-react';

function BookDetail({ openlibraryId, onBack }) {
    const [book, setBook] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    
    // Form state
    const [status, setStatus] = useState('want_to_read');
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    
    // Rating interaction state
    const [hoveredRating, setHoveredRating] = useState(0);
    
    // Other users' reviews
    const [otherReviews, setOtherReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsPagination, setReviewsPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch User
                const userRes = await fetch('/api/me', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setCurrentUser(userData.user);
                }

                // Fetch Book
                const bookRes = await fetch(`/api/books/openlibrary/${openlibraryId}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
                if (!bookRes.ok) throw new Error('Livro não encontrado');
                
                const bookData = await bookRes.json();
                setBook(bookData.book);
                
                if (bookData.user_review) {
                    setUserReview(bookData.user_review);
                    setStatus(bookData.user_review.status);
                    setRating(Number(bookData.user_review.rating) || 0); // Garante número
                    setReviewText(bookData.user_review.review_text || '');
                }
                
                // Busca reviews de outros usuários
                fetchOtherReviews(1);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [openlibraryId]);

    const fetchOtherReviews = async (page = 1) => {
        setReviewsLoading(true);
        try {
            const response = await fetch(`/api/books/openlibrary/${openlibraryId}/reviews?page=${page}&per_page=10`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });

            if (!response.ok) return;

            const data = await response.json();
            setOtherReviews(data.reviews || []);
            setReviewsPagination(data.pagination || {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0,
            });
        } catch (error) {
            console.error('Erro ao buscar reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleSaveReview = async () => {
        if (!currentUser) {
            window.location.href = '/login';
            return;
        }

        setSaving(true);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // Prepara dados do livro caso precise criar
            const bookData = {
                key: `/works/${openlibraryId}`,
                title: book.title,
                author_name: book.authors || [],
                cover_i: book.cover_url ? book.cover_url.match(/\/b\/id\/(\d+)-/)?.[1] : null,
                first_publish_year: book.published_year,
                number_of_pages_median: book.page_count,
            };

            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(token ? { 'X-CSRF-TOKEN': token } : {}),
                },
                body: JSON.stringify({
                    book: bookData,
                    status,
                    rating: rating > 0 ? rating : null,
                    review_text: reviewText || null,
                    read_at: status === 'read' ? new Date().toISOString().split('T')[0] : null,
                }),
            });

            if (!response.ok) throw new Error('Erro ao salvar review');

            const data = await response.json();
            setUserReview(data.review);
            setShowReviewForm(false);
        } catch (error) {
            console.error('Erro:', error);
            // Idealmente usar um toast aqui
        } finally {
            setSaving(false);
        }
    };

    // Lógica para detectar meia estrela no hover
    const handleStarMouseMove = (e, starIndex) => {
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - left;
        const isHalf = mouseX < width / 2;
        setHoveredRating(isHalf ? starIndex - 0.5 : starIndex);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                    <p className="text-[#78716c] font-serif text-sm tracking-widest uppercase">Buscando nos arquivos...</p>
                </div>
            </div>
        );
    }

    if (!book) return null;

    const statusOptions = [
        { value: 'want_to_read', label: 'Quero Ler', icon: Bookmark, color: 'text-amber-400', activeBg: 'bg-amber-950/30', border: 'border-amber-900/50' },
        { value: 'reading', label: 'Lendo', icon: BookOpenText, color: 'text-sky-400', activeBg: 'bg-sky-950/30', border: 'border-sky-900/50' },
        { value: 'read', label: 'Lido', icon: BookCheck, color: 'text-emerald-400', activeBg: 'bg-emerald-950/30', border: 'border-emerald-900/50' },
    ];

    return (
        <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] flex flex-col font-sans selection:bg-amber-900/30">
            {/* Navbar Minimalista */}
            <nav className="w-full p-6 border-b border-[#292524] bg-[#1c1917]/95 sticky top-0 z-50 backdrop-blur-md">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-[#a8a29e] hover:text-amber-500 transition-colors group"
                >
                    <div className="p-1 rounded-full group-hover:bg-[#292524] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Voltar à Estante</span>
                </button>
            </nav>

            <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    
                    {/* Coluna da Esquerda: Capa e Status */}
                    <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-6">
                        {/* Capa com efeito de sombra */}
                        <div className="relative group perspective-1000">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-amber-900/20 to-stone-800/20 blur-lg opacity-75 group-hover:opacity-100 transition duration-500"></div>
                            {book.cover_url ? (
                                <img 
                                    src={book.cover_url} 
                                    alt={book.title} 
                                    className="relative w-full rounded-lg shadow-2xl border border-[#292524] group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                                />
                            ) : (
                                <div className="relative w-full aspect-[2/3] bg-[#292524] rounded-lg border border-[#44403c] flex flex-col items-center justify-center p-6 text-center">
                                    <BookOpen className="w-16 h-16 text-[#44403c] mb-4" />
                                    <span className="text-[#57534e] font-serif text-sm">Capa indisponível</span>
                                </div>
                            )}
                        </div>

                        {/* Botões de Status */}
                        {currentUser && (
                            <div className="bg-[#0c0a09] border border-[#292524] rounded-xl p-4 shadow-lg">
                                <p className="text-xs uppercase tracking-widest text-[#57534e] mb-4 font-bold text-center">Estado de Leitura</p>
                                <div className="flex flex-col gap-2">
                                    {statusOptions.map((option) => {
                                        const Icon = option.icon;
                                        const isActive = status === option.value;
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setStatus(option.value);
                                                    if (!userReview) setShowReviewForm(true);
                                                }}
                                                className={`
                                                    relative px-4 py-3 rounded-lg border transition-all duration-300 flex items-center gap-3 w-full group overflow-hidden
                                                    ${isActive 
                                                        ? `${option.activeBg} ${option.border} ${option.color}` 
                                                        : 'border-transparent hover:bg-[#1c1917] text-[#a8a29e] hover:text-[#e7e5e4]'}
                                                `}
                                            >
                                                <Icon className={`w-4 h-4 ${isActive ? 'fill-current opacity-20' : ''}`} />
                                                <span className="font-medium text-sm">{option.label}</span>
                                                {isActive && <div className="absolute right-3 w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]"></div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Coluna da Direita: Detalhes e Review */}
                    <div className="md:col-span-8 lg:col-span-9 flex flex-col">
                        
                        {/* Header do Livro */}
                        <header className="mb-10 pb-10 border-b border-[#292524]">
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#e7e5e4] mb-4 leading-tight">
                                {book.title}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-6 text-[#a8a29e]">
                                {book.authors?.length > 0 && (
                                    <span className="flex items-center gap-2">
                                        <span className="w-8 h-[1px] bg-amber-700/50"></span>
                                        <span className="text-lg font-light italic text-[#d6d3d1]">
                                            {book.authors.join(', ')}
                                        </span>
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-6 mt-6 text-sm text-[#78716c] font-mono">
                                {book.published_year && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{book.published_year}</span>
                                    </div>
                                )}
                                {book.page_count && (
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>{book.page_count} páginas</span>
                                    </div>
                                )}
                            </div>
                        </header>

                        {/* Review Display (Se existir e não estiver editando) */}
                        {userReview && !showReviewForm && (
                            <div className="bg-[#0c0a09] border border-[#292524] rounded-xl p-8 mb-8 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => setShowReviewForm(true)}
                                        className="text-xs uppercase tracking-widest text-[#57534e] hover:text-amber-500 transition-colors"
                                    >
                                        Editar Registro
                                    </button>
                                </div>
                                
                                <div className="flex items-end gap-4 mb-6">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <span key={i}>
                                                {userReview.rating >= i ? (
                                                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                                                ) : userReview.rating >= i - 0.5 ? (
                                                    <StarHalf className="w-6 h-6 text-amber-500 fill-amber-500" />
                                                ) : (
                                                    <Star className="w-6 h-6 text-[#292524]" />
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-2xl font-serif font-bold text-amber-500 leading-none">
                                        {Number(userReview.rating).toFixed(1)}
                                    </span>
                                </div>

                                {userReview.review_text ? (
                                    <div className="relative">
                                        <span className="absolute -top-4 -left-2 text-6xl text-[#1c1917] font-serif font-bold opacity-50">“</span>
                                        <p className="text-[#d6d3d1] text-lg leading-relaxed font-serif italic relative z-10 pl-6">
                                            {userReview.review_text}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-[#57534e] italic text-sm">Nenhuma resenha escrita.</p>
                                )}
                            </div>
                        )}

                        {/* Botão de Adicionar (Se não tiver review e não estiver no form) */}
                        {!userReview && !showReviewForm && currentUser && (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="w-full py-6 border-2 border-dashed border-[#292524] rounded-xl text-[#57534e] hover:border-amber-900/50 hover:text-amber-600 hover:bg-amber-950/5 transition-all group mb-8"
                            >
                                <span className="text-sm font-bold uppercase tracking-widest group-hover:scale-105 inline-block transition-transform">
                                    + Escrever no Diário
                                </span>
                            </button>
                        )}

                        {/* Formulário de Review */}
                        {showReviewForm && currentUser && (
                            <div className="bg-[#0c0a09] border border-[#292524] rounded-xl p-8 mb-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center mb-8 border-b border-[#1c1917] pb-4">
                                    <h3 className="text-xl font-serif font-bold text-[#e7e5e4]">
                                        Registro de Leitura
                                    </h3>
                                    <button onClick={() => setShowReviewForm(false)} className="text-[#57534e] hover:text-[#e7e5e4]">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* Rating Interativo com Meia Estrela */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[#78716c] mb-3">Avaliação</label>
                                        <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
                                            {[1, 2, 3, 4, 5].map((i) => {
                                                const isFull = (hoveredRating || rating) >= i;
                                                const isHalf = (hoveredRating || rating) >= i - 0.5 && !isFull;
                                                
                                                return (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        className="relative p-1 focus:outline-none transition-transform hover:scale-110"
                                                        onMouseMove={(e) => handleStarMouseMove(e, i)}
                                                        onClick={() => setRating(hoveredRating)}
                                                    >
                                                        {isFull ? (
                                                            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
                                                        ) : isHalf ? (
                                                            <StarHalf className="w-8 h-8 text-amber-500 fill-amber-500" />
                                                        ) : (
                                                            <Star className="w-8 h-8 text-[#292524] fill-[#1c1917]" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                            <span className="ml-4 text-2xl font-serif text-[#a8a29e]">
                                                {(hoveredRating || rating) > 0 ? (hoveredRating || rating).toFixed(1) : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Text Area */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[#78716c] mb-3">Suas impressões</label>
                                        <textarea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="O que você sentiu ao ler este livro? Escreva aqui suas memórias..."
                                            className="w-full bg-[#1c1917] border border-[#292524] rounded-lg px-6 py-4 text-[#e7e5e4] placeholder-[#44403c] focus:outline-none focus:border-amber-700/50 focus:ring-1 focus:ring-amber-900/50 transition-all font-serif leading-relaxed min-h-[150px] resize-y"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-4 pt-4">
                                        <button 
                                            onClick={() => setShowReviewForm(false)}
                                            className="px-6 py-2 text-[#78716c] hover:text-[#e7e5e4] transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSaveReview}
                                            disabled={saving}
                                            className="px-8 py-3 bg-amber-700 hover:bg-amber-600 text-[#e7e5e4] font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-900/20"
                                        >
                                            {saving ? 'Salvando...' : 'Salvar no Diário'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Descrição do Livro */}
                        {book.description && (
                            <div className="mt-4">
                                <h3 className="text-lg font-serif font-bold text-[#e7e5e4] mb-4 flex items-center gap-2">
                                    <BookOpenText className="w-5 h-5 text-amber-700" />
                                    Sinopse
                                </h3>
                                <div className="prose prose-invert prose-stone max-w-none">
                                    <p className="text-[#a8a29e] leading-loose whitespace-pre-wrap font-serif text-lg">
                                        {book.description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews de Outros Usuários */}
                <div className="mt-16 pt-10 border-t border-[#292524]">
                    <h3 className="text-2xl font-serif font-bold text-[#e7e5e4] mb-6 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-amber-700" />
                        Reviews da Comunidade
                        {reviewsPagination.total > 0 && (
                            <span className="text-sm font-normal text-[#78716c] ml-2">
                                ({reviewsPagination.total})
                            </span>
                        )}
                    </h3>

                    {reviewsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-amber-700 animate-spin" />
                        </div>
                    ) : otherReviews.length === 0 ? (
                        <div className="bg-[#0c0a09] border border-[#292524] border-dashed rounded-xl p-12 text-center">
                            <FileText className="w-12 h-12 text-[#44403c] mx-auto mb-4" />
                            <p className="text-[#a8a29e] font-serif">Ainda não há reviews da comunidade para este livro.</p>
                            <p className="text-[#57534e] text-sm mt-2">Seja o primeiro a compartilhar suas impressões!</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-6">
                                {otherReviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="bg-[#0c0a09] border border-[#292524] rounded-xl p-6 hover:border-[#44403c] transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-[#1c1917] font-bold text-sm">
                                                    {review.user?.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-serif font-semibold text-[#e7e5e4]">
                                                        {review.user?.name || 'Usuário anônimo'}
                                                    </p>
                                                    <p className="text-xs text-[#57534e]">
                                                        {new Date(review.created_at).toLocaleDateString('pt-BR', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            {review.rating && (
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-4 h-4 ${
                                                                star <= review.rating
                                                                    ? 'text-amber-500 fill-amber-500'
                                                                    : 'text-[#44403c]'
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="ml-2 text-sm text-[#78716c]">
                                                        {review.rating}/5
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {review.review_text && (
                                            <p className="text-[#a8a29e] leading-relaxed whitespace-pre-wrap font-serif">
                                                {review.review_text}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Paginação */}
                            {reviewsPagination.last_page > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <button
                                        onClick={() => fetchOtherReviews(reviewsPagination.current_page - 1)}
                                        disabled={reviewsPagination.current_page === 1}
                                        className="px-4 py-2 bg-[#292524] text-[#e7e5e4] rounded hover:bg-[#44403c] transition-colors border border-[#44403c] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm text-[#78716c] px-4">
                                        Página {reviewsPagination.current_page} de {reviewsPagination.last_page}
                                    </span>
                                    <button
                                        onClick={() => fetchOtherReviews(reviewsPagination.current_page + 1)}
                                        disabled={reviewsPagination.current_page === reviewsPagination.last_page}
                                        className="px-4 py-2 bg-[#292524] text-[#e7e5e4] rounded hover:bg-[#44403c] transition-colors border border-[#44403c] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default BookDetail;