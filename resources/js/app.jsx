import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import Login from './components/Login';
import Register from './components/Register';
import Shelf from './components/Shelf';
import BookDetail from './components/BookDetail';

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);

    const path = window.location.pathname;
    let Screen = App;
    let props = {};

    if (path === '/login') {
        Screen = Login;
    } else if (path === '/cadastro') {
        Screen = Register;
    } else if (path === '/estante') {
        Screen = Shelf;
    } else if (path.startsWith('/livro/')) {
        Screen = BookDetail;
        const openlibraryId = path.replace('/livro/', '');
        props = {
            openlibraryId,
            onBack: () => {
                window.location.href = '/';
            },
        };
    }

    root.render(
        <React.StrictMode>
            <Screen {...props} />
        </React.StrictMode>
    );
}
