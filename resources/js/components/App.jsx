import React, { useState } from 'react';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        📚 Avalivros
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Seu Letterboxd de Livros
                    </p>
                    
                    <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                        <p className="text-lg text-gray-700 mb-4">
                            React está funcionando! 🎉
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setCount(count - 1)}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                -
                            </button>
                            <span className="text-3xl font-bold text-indigo-600 min-w-[60px]">
                                {count}
                            </span>
                            <button
                                onClick={() => setCount(count + 1)}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="font-semibold text-blue-800 mb-1">✅ React</div>
                            <div className="text-blue-600">Configurado</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="font-semibold text-purple-800 mb-1">✅ Vite</div>
                            <div className="text-purple-600">Funcionando</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="font-semibold text-green-800 mb-1">✅ Tailwind</div>
                            <div className="text-green-600">Estilizado</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;

