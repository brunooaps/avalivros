import React, { useState, useEffect } from 'react';
import { Mail, Loader2, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

function Login() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setStatus('error');
            setMessage('Por favor, informe um e-mail válido.');
            return;
        }

        try {
            setStatus('loading');
            setMessage('');

            const token = document
                .querySelector('meta[name=\"csrf-token\"]')
                ?.getAttribute('content');

            const response = await fetch('/api/magic-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(token ? { 'X-CSRF-TOKEN': token } : {}),
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar o link mágico.');
            }

            setStatus('success');
            setMessage('Enviamos um link mágico para o seu e-mail. Confira sua caixa de entrada (e o spam também).');
        } catch (error) {
            setStatus('error');
            setMessage('Não foi possível enviar o link mágico. Tente novamente em alguns instantes.');
        }
    };

    return (
        <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] font-sans selection:bg-[#d6d3d1] selection:text-[#1c1917] flex flex-col">
            {/* Navbar minimalista reaproveitando o estilo da landing */}
            <nav className="w-full p-6 flex justify-between items-center border-b border-[#44403c] bg-[#1c1917]/95 sticky top-0 z-50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                    <span className="text-xl font-serif tracking-wider text-[#e7e5e4]">AvaLivros</span>
                </div>
                <div className="flex gap-4 text-sm font-medium text-[#a8a29e]">
                    <a href="/" className="hover:text-amber-500 transition-colors">
                        Início
                    </a>
                    <a href="/estante" className="hover:text-amber-500 transition-colors">
                        Minha Estante
                    </a>
                    {currentUser ? (
                        <div className="px-4 py-2 bg-[#292524] text-[#e7e5e4] rounded border border-[#44403c] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm text-[#e7e5e4] font-semibold">
                                {currentUser.name}
                            </span>
                        </div>
                    ) : null}
                </div>
            </nav>

            {/* Conteúdo principal */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <p className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#292524] border border-[#44403c] text-amber-500 text-xs tracking-widest uppercase">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Login seguro sem senha</span>
                        </p>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-[#e7e5e4]">
                            Entre com um link mágico
                        </h1>
                        <p className="text-sm text-[#a8a29e] max-w-sm mx-auto">
                            Digite seu e-mail e enviaremos um link único para acessar sua estante e seu diário de leituras.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-[#0c0a09] border border-[#292524] rounded-2xl p-6 shadow-xl space-y-4"
                    >
                        <label className="block text-sm font-medium text-[#d6d3d1] mb-1">
                            E-mail
                        </label>
                        <div className="flex items-center gap-3 bg-[#18130f] border border-[#292524] rounded-xl px-4 py-3 focus-within:border-amber-600 transition-colors">
                            <Mail className="w-5 h-5 text-[#a8a29e]" />
                            <input
                                type="email"
                                className="w-full bg-transparent focus:outline-none text-sm text-[#e7e5e4] placeholder-[#78716c]"
                                placeholder="voce@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-70 disabled:cursor-not-allowed text-[#1c1917] font-semibold py-3 rounded-xl transition-colors"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Enviando link mágico...
                                </>
                            ) : (
                                <>
                                    Receber link mágico
                                </>
                            )}
                        </button>

                        {status === 'success' && (
                            <div className="mt-4 flex items-start gap-3 text-emerald-400 text-xs bg-emerald-950/40 border border-emerald-900 rounded-xl px-4 py-3">
                                <CheckCircle2 className="w-4 h-4 mt-0.5" />
                                <p>{message}</p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mt-4 flex items-start gap-3 text-rose-300 text-xs bg-rose-950/40 border border-rose-900 rounded-xl px-4 py-3">
                                <AlertCircle className="w-4 h-4 mt-0.5" />
                                <p>{message}</p>
                            </div>
                        )}

                        <p className="mt-6 text-[10px] text-[#57534e] text-center leading-relaxed">
                            Ao continuar, você concorda em receber um e-mail com um link seguro para entrar.
                            Nenhuma senha será armazenada — apenas pura magia literária.
                        </p>

                        <p className="mt-4 text-[11px] text-center text-[#a8a29e]">
                            Ainda não tem conta?{' '}
                            <a href="/cadastro" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
                                Cadastre-se com link mágico
                            </a>
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default Login;


