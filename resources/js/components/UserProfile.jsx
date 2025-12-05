import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, Loader2, Star, Calendar, User as UserIcon } from 'lucide-react';

function UserProfile({ username, onBack }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/users/${username}`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok) {
                    throw new Error('Usuário não encontrado');
                }

                const data = await response.json();
                setProfile(data);
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
        );
    }

    if (!profile) {
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
                        <UserIcon className="w-16 h-16 text-[#44403c] mx-auto mb-4" />
                        <h2 className="text-2xl font-serif font-bold text-[#e7e5e4] mb-2">
                            Usuário não encontrado
                        </h2>
                        <p className="text-[#a8a29e]">
                            O perfil que você está procurando não existe.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] font-sans selection:bg-[#d6d3d1] selection:text-[#1c1917] flex flex-col">
            <nav className="w-full p-6 flex justify-between items-center border-b border-[#44403c] bg-[#1c1917]/95 sticky top-0 z-50 backdrop-blur-sm">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[#a8a29e] hover:text-amber-500 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Voltar</span>
                </button>
            </nav>

            <main className="flex-1 container mx-auto px-4 py-10 md:py-12 max-w-4xl">
                {/* Header do Perfil */}
                <div className="bg-[#0c0a09] border border-[#292524] rounded-2xl p-6 md:p-8 mb-8">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-[#1c1917] font-bold text-2xl">
                            {profile.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#e7e5e4] mb-2">
                                {profile.user.name}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-[#78716c]">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Membro desde {formatDate(profile.user.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{profile.total_reviews} {profile.total_reviews === 1 ? 'review' : 'reviews'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Reviews */}
                <div>
                    <h2 className="text-2xl font-serif font-bold text-[#e7e5e4] mb-6">
                        Reviews ({profile.total_reviews})
                    </h2>

                    {profile.reviews.length === 0 ? (
                        <div className="bg-[#0c0a09] border border-[#292524] border-dashed rounded-xl p-12 text-center">
                            <BookOpen className="w-12 h-12 text-[#44403c] mx-auto mb-4" />
                            <p className="text-[#a8a29e] font-serif">Este usuário ainda não escreveu nenhuma review.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {profile.reviews.map((review) => (
                                <a
                                    key={review.id}
                                    href={`/livro/${review.book.openlibrary_id}`}
                                    className="block bg-[#0c0a09] border border-[#292524] rounded-xl p-6 hover:border-amber-600/50 hover:shadow-xl hover:shadow-[#000000]/50 transition-all group"
                                >
                                    <div className="flex gap-4">
                                        {review.book.cover_url ? (
                                            <img
                                                src={review.book.cover_url}
                                                alt={review.book.title}
                                                className="w-16 h-24 object-cover rounded border border-[#292524] group-hover:scale-105 transition-transform flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-16 h-24 bg-[#292524] rounded border border-[#292524] flex items-center justify-center flex-shrink-0">
                                                <BookOpen className="w-6 h-6 text-[#44403c]" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-serif font-semibold text-lg text-[#e7e5e4] mb-1 group-hover:text-amber-500 transition-colors line-clamp-1">
                                                {review.book.title}
                                            </h3>
                                            {review.book.authors && review.book.authors.length > 0 && (
                                                <p className="text-sm text-[#a8a29e] mb-3 line-clamp-1">
                                                    {review.book.authors.join(', ')}
                                                </p>
                                            )}
                                            
                                            {/* Rating */}
                                            {review.rating && (
                                                <div className="flex items-center gap-2 mb-3">
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
                                                    </div>
                                                    <span className="text-sm text-[#78716c]">
                                                        {review.rating}/5
                                                    </span>
                                                </div>
                                            )}

                                            {/* Review Text */}
                                            {review.review_text && (
                                                <p className="text-[#a8a29e] leading-relaxed line-clamp-3 mb-3 font-serif">
                                                    {review.review_text}
                                                </p>
                                            )}

                                            {/* Data */}
                                            <p className="text-xs text-[#57534e]">
                                                {formatDate(review.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default UserProfile;

