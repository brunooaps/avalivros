import React from 'react';
import { BookOpen, BookMarked, BookOpenCheck, Bookmark, BookOpenText } from 'lucide-react';

function Shelf() {
    return (
        <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] font-sans selection:bg-[#d6d3d1] selection:text-[#1c1917] flex flex-col">
            {/* Navbar */}
            <nav className="w-full p-6 flex justify-between items-center border-b border-[#44403c] bg-[#1c1917]/95 sticky top-0 z-50 backdrop-blur-sm">
                <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                    <span className="text-xl font-serif tracking-wider text-[#e7e5e4]">AvaLivros</span>
                </a>
            </nav>

            {/* Conteúdo principal */}
            <main className="flex-1 container mx-auto px-4 py-10 md:py-16">
                <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#292524] border border-[#44403c] text-amber-500 text-xs tracking-widest uppercase mb-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Sua biblioteca pessoal</span>
                        </p>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#e7e5e4]">
                            Minha Estante
                        </h1>
                        <p className="mt-2 text-sm text-[#a8a29e] max-w-xl">
                            Aqui é onde vivem os livros que você já leu, está lendo e ainda quer descobrir. Em breve,
                            você poderá ver suas avaliações, resenhas e progresso detalhado.
                        </p>
                    </div>
                </header>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lendo */}
                    <div className="bg-[#0c0a09] border border-[#292524] rounded-2xl p-6 shadow-lg flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#292524] flex items-center justify-center text-sky-400">
                                <BookOpenText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-serif font-semibold text-[#e7e5e4]">Lendo agora</h2>
                                <p className="text-xs uppercase tracking-widest text-[#78716c]">Sessão em andamento</p>
                            </div>
                        </div>
                        <p className="text-sm text-[#a8a29e] flex-1">
                            Em breve, os livros que você marcar como <span className="text-sky-300">“Lendo”</span> vão
                            aparecer aqui, com seu progresso e últimas notas.
                        </p>
                        <div className="mt-6 text-xs text-[#57534e]">
                            Nenhum livro marcado como <span className="text-sky-300">Lendo</span> ainda.
                        </div>
                    </div>

                    {/* Lidos */}
                    <div className="bg-[#0c0a09] border border-[#292524] rounded-2xl p-6 shadow-lg flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#292524] flex items-center justify-center text-emerald-400">
                                <BookOpenCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-serif font-semibold text-[#e7e5e4]">Lidos</h2>
                                <p className="text-xs uppercase tracking-widest text-[#78716c]">Memórias registradas</p>
                            </div>
                        </div>
                        <p className="text-sm text-[#a8a29e] flex-1">
                            Aqui ficará o histórico dos livros que você já terminou, com suas{' '}
                            <span className="text-emerald-300">notas</span> e <span className="text-emerald-300">reviews</span>.
                        </p>
                        <div className="mt-6 text-xs text-[#57534e]">
                            Nenhum livro marcado como <span className="text-emerald-300">Lido</span> ainda.
                        </div>
                    </div>

                    {/* Quero ler / Wishlist */}
                    <div className="bg-[#0c0a09] border border-[#292524] rounded-2xl p-6 shadow-lg flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#292524] flex items-center justify-center text-amber-400">
                                <Bookmark className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-serif font-semibold text-[#e7e5e4]">Quero ler</h2>
                                <p className="text-xs uppercase tracking-widest text-[#78716c]">Lista de desejos</p>
                            </div>
                        </div>
                        <p className="text-sm text-[#a8a29e] flex-1">
                            Salve aqui os livros que você ainda não começou, mas não quer esquecer. Sua lista de
                            <span className="text-amber-300"> “Quero ler”</span> vai nascer neste espaço.
                        </p>
                        <div className="mt-6 text-xs text-[#57534e]">
                            Nenhum livro marcado como <span className="text-amber-300">Quero ler</span> ainda.
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Shelf;


