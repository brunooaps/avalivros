import React, { useState, useEffect } from 'react';
import { BookOpen, BookCheck, Bookmark, BookOpenText, Library, TrendingUp, Calendar, Star } from 'lucide-react';

function Shelf() {
    const [currentUser, setCurrentUser] = useState(null);
    const [shelfData, setShelfData] = useState({
        reading: [],
        read: [],
        want_to_read: [],
        stats: { read_count: 0, total_pages: 0 },
        recent_activities: [],
        last_activity_date: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('/api/me', {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'include',
                });

                if (!response.ok) return;

                const data = await response.json();
                setCurrentUser(data.user ?? null);
            } catch (error) {
                console.error('Erro ao buscar usuário logado:', error);
            }
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        const fetchShelf = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/reviews/shelf', {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                setShelfData(data);
            } catch (error) {
                console.error('Erro ao buscar estante:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShelf();
    }, [currentUser]);

    return (
        <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] font-sans selection:bg-[#d6d3d1] selection:text-[#1c1917] flex flex-col">
            {/* Navbar (Consistente com a Home) */}
            <nav className="w-full p-6 flex justify-between items-center border-b border-[#292524] bg-[#1c1917]/95 sticky top-0 z-50 backdrop-blur-sm">
                <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                    <div className="p-2 bg-[#292524] rounded-lg group-hover:bg-[#44403c] transition-colors">
                        <BookOpen className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-xl font-serif tracking-wider text-[#e7e5e4]">AvaLivros</span>
                </a>
                
                {/* User Menu */}
                <div className="flex items-center gap-4">
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

            {/* Conteúdo principal */}
            <main className="flex-1 container mx-auto px-4 py-10 md:py-12 max-w-6xl">
                
                {/* Header Section */}
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#292524]">
                        <div>
                            <div className="flex items-center gap-2 text-amber-600 mb-2">
                                <Library className="w-4 h-4" />
                                <span className="text-xs font-bold tracking-[0.2em] uppercase">Biblioteca Pessoal</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#e7e5e4] mb-4">
                                Minha Estante
                            </h1>
                            <p className="text-[#a8a29e] max-w-2xl text-lg font-light leading-relaxed">
                                O registro da sua jornada. Acompanhe seu progresso, revisite memórias e planeje suas próximas aventuras literárias.
                            </p>
                        </div>
                        
                        {/* Mini Stats Dashboard */}
                        <div className="flex gap-8 bg-[#0c0a09] p-4 rounded-xl border border-[#292524] shadow-inner">
                            <div className="text-center px-4">
                                <div className="text-2xl font-serif font-bold text-[#e7e5e4]">{shelfData.stats.read_count}</div>
                                <div className="text-[10px] uppercase tracking-wider text-[#57534e]">Livros Lidos</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Grid das Prateleiras */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    
                    {/* Card: Lendo Agora */}
                    <ShelfCard 
                        icon={<BookOpenText className="w-6 h-6" />}
                        title="Lendo Agora"
                        colorClass="text-sky-400"
                        bgClass="bg-sky-500/10"
                        borderClass="hover:border-sky-500/30"
                        description="Livros que estão na sua cabeceira."
                        emptyText="Você não está lendo nada no momento."
                        actionText="Adicionar leitura atual"
                        books={shelfData.reading}
                    />

                    {/* Card: Lidos */}
                    <ShelfCard 
                        icon={<BookCheck className="w-6 h-6" />}
                        title="Lidos"
                        colorClass="text-emerald-400"
                        bgClass="bg-emerald-500/10"
                        borderClass="hover:border-emerald-500/30"
                        description="Sua coleção de conquistas e resenhas."
                        emptyText="Nenhum livro finalizado ainda."
                        actionText="Registrar livro lido"
                        books={shelfData.read}
                    />

                    {/* Card: Quero Ler */}
                    <ShelfCard 
                        icon={<Bookmark className="w-6 h-6" />}
                        title="Quero Ler"
                        colorClass="text-amber-400"
                        bgClass="bg-amber-500/10"
                        borderClass="hover:border-amber-500/30"
                        description="Sua lista de desejos para o futuro."
                        emptyText="Sua lista está vazia."
                        actionText="Explorar novos títulos"
                        books={shelfData.want_to_read}
                    />

                </div>

                {/* Seção 'Atividade Recente' */}
                <div className="mt-16 pt-10 border-t border-[#292524]">
                    <div className="flex items-center gap-2 mb-6 text-[#78716c]">
                        <TrendingUp className="w-4 h-4" />
                        <h3 className="text-sm font-semibold uppercase tracking-widest">Atividade Recente</h3>
                    </div>
                    
                    {shelfData.recent_activities && shelfData.recent_activities.length > 0 ? (
                        <div className="space-y-3">
                            {shelfData.recent_activities.map((activity) => (
                                <a
                                    key={activity.id}
                                    href={activity.openlibrary_id ? `/livro/${activity.openlibrary_id}` : '#'}
                                    className="flex gap-4 p-4 bg-[#0c0a09] border border-[#292524] rounded-xl hover:border-amber-600/50 hover:shadow-lg transition-all group"
                                >
                                    {activity.book_cover ? (
                                        <img
                                            src={activity.book_cover}
                                            alt={activity.book_title}
                                            className="w-16 h-20 object-cover rounded border border-[#292524] group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-16 h-20 bg-[#292524] rounded border border-[#292524] flex items-center justify-center">
                                            <BookOpen className="w-8 h-8 text-[#44403c]" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-[#e7e5e4] font-serif font-semibold mb-1 group-hover:text-amber-500 transition-colors">
                                            {activity.book_title}
                                        </p>
                                        <p className="text-sm text-[#a8a29e] mb-2">
                                            Você <span className="text-amber-500">{activity.action}</span>
                                        </p>
                                        <p className="text-xs text-[#57534e]">
                                            {new Date(activity.updated_at).toLocaleDateString('pt-BR', {
                                                day: 'numeric',
                                                month: 'long',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#0c0a09] border border-[#292524] border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-[#1c1917] rounded-full flex items-center justify-center mb-4">
                                <Calendar className="w-6 h-6 text-[#44403c]" />
                            </div>
                            {shelfData.last_activity_date ? (
                                <>
                                    <p className="text-[#a8a29e] mb-2 font-serif text-lg">Última atividade há mais de 1 semana</p>
                                    <p className="text-[#57534e] text-sm">
                                        {new Date(shelfData.last_activity_date).toLocaleDateString('pt-BR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-[#a8a29e] mb-2 font-serif text-lg">Tudo quieto por aqui...</p>
                                    <p className="text-[#57534e] text-sm">Suas avaliações e atualizações de leitura aparecerão nesta linha do tempo.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

// Componente auxiliar para os Cards
function ShelfCard({ icon, title, colorClass, bgClass, borderClass, description, emptyText, actionText, books = [] }) {
    return (
        <div className={`bg-[#0c0a09] border border-[#292524] rounded-xl p-6 flex flex-col h-full transition-all duration-300 group ${borderClass} hover:shadow-xl hover:shadow-[#000000]/50 hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-lg ${bgClass} flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                <div className="text-xs text-[#57534e] font-semibold">
                    {books.length} {books.length === 1 ? 'livro' : 'livros'}
                </div>
            </div>
            
            <h2 className="text-xl font-serif font-bold text-[#e7e5e4] mb-2 group-hover:text-white transition-colors">
                {title}
            </h2>
            <p className="text-[#78716c] text-sm mb-6 leading-relaxed">
                {description}
            </p>

            <div className="mt-auto pt-6 border-t border-[#1c1917]">
                {books.length === 0 ? (
                    <div className="text-center py-8 bg-[#1c1917]/30 rounded border border-dashed border-[#292524] group-hover:border-[#44403c] transition-colors">
                        <p className="text-[#57534e] text-sm mb-3">{emptyText}</p>
                        <span className={`text-xs font-bold ${colorClass} opacity-60 hover:opacity-100 cursor-pointer uppercase tracking-widest transition-opacity border-b border-transparent hover:border-current pb-0.5`}>
                            {actionText}
                        </span>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {books.map((book) => (
                            <a
                                key={book.review_id}
                                href={`/livro/${book.openlibrary_id}`}
                                className="flex gap-3 p-3 bg-[#1c1917] rounded-lg border border-[#292524] hover:border-current hover:shadow-lg transition-all group/item"
                            >
                                {book.cover_url ? (
                                    <img
                                        src={book.cover_url}
                                        alt={book.title}
                                        className="w-12 h-16 object-cover rounded border border-[#292524] group-hover/item:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="w-12 h-16 bg-[#292524] rounded border border-[#292524] flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-[#44403c]" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-serif font-semibold text-[#e7e5e4] text-sm mb-1 line-clamp-1 group-hover/item:text-amber-500 transition-colors">
                                        {book.title}
                                    </h3>
                                    {book.authors && book.authors.length > 0 && (
                                        <p className="text-xs text-[#a8a29e] mb-1 line-clamp-1">
                                            {book.authors[0]}
                                        </p>
                                    )}
                                    {book.rating && (
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                            <span className="text-xs text-[#78716c]">{book.rating}</span>
                                        </div>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Shelf;