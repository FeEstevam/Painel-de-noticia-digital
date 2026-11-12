import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DisplayIndex from './pages/DisplayIndex.jsx';
import Login from './pages/login.jsx';
import NewsPainel from './pages/newspainel.jsx';
import './style/login.css';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        {/* ROTA PÚBLICA PRINCIPAL (INDEX): Modo de Exibição / Mural de Notícias Digital */}
        <Route path="/" element={<DisplayIndex />} />

        {/* ROTA DE AUTENTICAÇÃO */}
        <Route path="/login" element={<Login />} />

        {/* ROTA PROTEGIDA DE GERENCIAMENTO (Exige Login com conta; se deslogado, redireciona para index) */}
        <Route path="/painel" element={<NewsPainel />} />

        {/* Qualquer outra rota redireciona para a página de index (Display Mode) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
