import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Eye,
  SlidersHorizontal,
  CheckCircle2,
  Database,
  Tv,
  LogOut,
  UserCheck
} from 'lucide-react';
import DisplayMode from '../components/DisplayMode';
import NewsManager from '../components/NewsManager';
import { api } from '../../lib/api';
import { isAuthenticated, getUser, logout } from '../../lib/auth';

// Dados iniciais de fallback
const INITIAL_NEWS = [
  {
    id: '1',
    type: 'image',
    title: 'Novo Campus Tecnológico Inaugurado',
    content: 'Instalações de última geração abertas para a comunidade com laboratórios de IA e robótica.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    category: 'Inovação',
    slideDuration: 5,
    expiresAt: null,
    createdAt: Date.now(),
    bgColor: '#4f46e5'
  },
  {
    id: '2',
    type: 'text',
    title: 'COMUNICADO IMPORTANTE: Manutenção Programada',
    content: 'Informamos que o portal passará por atualizações hoje às 23:00. O tempo estimado de indisponibilidade é de 15 minutos.',
    category: 'Aviso Urgente',
    slideDuration: 8,
    expiresAt: Date.now() + 15 * 60 * 1000,
    createdAt: Date.now(),
    bgColor: 'from-amber-600 via-orange-600 to-red-600'
  },
  {
    id: '3',
    type: 'image',
    title: 'Workshop de Design & UX na Sexta-feira',
    content: 'Participe do nosso treinamento prático sobre criação de interfaces acessíveis.',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    category: 'Eventos',
    slideDuration: 6,
    expiresAt: Date.now() + 45 * 60 * 1000,
    createdAt: Date.now(),
    bgColor: '#0891b2'
  },
  {
    id: '4',
    type: 'weather',
    title: 'São Paulo, SP',
    content: 'Previsão meteorológica ao vivo com temperatura, umidade e previsão para os próximos dias.',
    category: 'Clima & Tempo',
    slideDuration: 7,
    expiresAt: null,
    createdAt: Date.now(),
    bgColor: 'from-sky-600 via-blue-700 to-indigo-950'
  },
  {
    id: '5',
    type: 'feed',
    title: 'Giro de Notícias do Dia',
    content: 'Principais manchetes e atualizações em tempo real estilo telejornal.',
    category: 'Geral & Brasil',
    slideDuration: 9,
    expiresAt: null,
    createdAt: Date.now(),
    bgColor: 'from-rose-800 via-red-900 to-neutral-950'
  }
];

export default function NewsPainel() {
  const navigate = useNavigate();

  // Proteção de Rota: se o usuário não estiver autenticado, redireciona para a página index
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const [currentUser, setCurrentUser] = useState(() => getUser());

  const [newsList, setNewsList] = useState(() => {
    try {
      const saved = localStorage.getItem('newsList');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignora erro
    }
    return INITIAL_NEWS;
  });

  const [activeTab, setActiveTab] = useState('manage'); // 'manage' (padrão) ou 'display'
  const [toast, setToast] = useState(null);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Exibir mensagens rápidas (Toast)
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Carrega as notícias diretamente do banco de dados na inicialização
  useEffect(() => {
    async function loadFromDatabase() {
      try {
        const data = await api.getNews();
        if (Array.isArray(data) && data.length > 0) {
          setNewsList(data);
          setIsDbConnected(true);
        } else {
          // Se o banco estiver vazio, popula automaticamente com os dados de demonstração
          const seeded = await api.seedDemo();
          if (Array.isArray(seeded) && seeded.length > 0) {
            setNewsList(seeded);
          }
          setIsDbConnected(true);
        }
      } catch (err) {
        console.warn('Backend SQLite offline no momento, utilizando cache local:', err.message);
        setIsDbConnected(false);
      }
    }

    loadFromDatabase();
  }, []);

  // Mantém sincronizado no localStorage como cache de segurança
  useEffect(() => {
    try {
      localStorage.setItem('newsList', JSON.stringify(newsList));
    } catch {
      // fallback
    }
  }, [newsList]);

  // Sincronização e monitoramento de agendamentos e expirações em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setNewsList((prevList) => [...prevList]);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // OPERAÇÃO 1: CRIAR NOTÍCIA NO BANCO DE DADOS (CREATE)
  const handleAddNews = async (newNews) => {
    try {
      const savedNews = await api.createNews(newNews);
      setNewsList((prev) => [savedNews, ...prev]);
      setIsDbConnected(true);
      showToast('Notícia salva no banco de dados com sucesso!');
    } catch (err) {
      console.warn('Erro ao salvar no banco, armazenando em cache:', err.message);
      setNewsList((prev) => [newNews, ...prev]);
      showToast('Salvo em cache local (inicie o backend para salvar no SQLite)', 'info');
    }
  };

  // OPERAÇÃO 2: EXCLUIR NOTÍCIA DO BANCO DE DADOS (DELETE)
  const handleDeleteNews = async (id) => {
    try {
      await api.deleteNews(id);
      setNewsList((prev) => prev.filter((item) => String(item.id) !== String(id)));
      setIsDbConnected(true);
      showToast('Notícia excluída do banco de dados.');
    } catch (err) {
      console.warn('Erro ao deletar no banco:', err.message);
      setNewsList((prev) => prev.filter((item) => String(item.id) !== String(id)));
      showToast('Notícia removida da lista.', 'info');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Luzes de Fundo Decorativas */}
      <div className="fixed top-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-indigo-600/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-purple-600/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      {/* CABEÇALHO / NAVEGAÇÃO ADMINISTRATIVA RESPONSIVA */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Logo e Título */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent truncate">
                    Painel Administrativo
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                      isDbConnected
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                    title={isDbConnected ? 'Conectado ao Banco SQLite (Prisma)' : 'Aguardando inicialização do backend'}
                  >
                    <Database className="w-3 h-3" />
                    <span>{isDbConnected ? 'Banco Ativo' : 'SQLite Pronto'}</span>
                  </span>
                </div>
                {currentUser && (
                  <p className="text-[11px] sm:text-xs text-indigo-300 truncate flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-indigo-400 inline" />
                    <span>Operador: <strong>{currentUser.name || currentUser.email}</strong></span>
                  </p>
                )}
              </div>
            </div>

            {/* Atalhos Rápidos (Mobile) */}
            <div className="sm:hidden flex items-center gap-1">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                title="Ir para a Tela de Exibição Pública"
              >
                <Tv className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-800 text-red-400 hover:text-red-300 border border-slate-700"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Abas e Ações do Cabeçalho */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Abas: Gerenciador vs Visualização */}
            <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 flex-1 sm:flex-initial">
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'manage'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 shrink-0" />
                <span>Gerenciador</span>
              </button>

              <button
                onClick={() => setActiveTab('display')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'display'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>Pré-visualização</span>
              </button>
            </div>

            {/* Botões de Ação Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all cursor-pointer"
                title="Ir para a Tela Pública / Modo TV"
              >
                <Tv className="w-4 h-4 text-indigo-400" />
                <span>Modo TV (Index)</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 text-slate-400 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
                title="Encerrar sessão"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL COM PADDING ADAPTATIVO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8">
        {activeTab === 'display' ? (
          <DisplayMode
            newsList={newsList}
            onGoToManager={() => setActiveTab('manage')}
          />
        ) : (
          <NewsManager
            newsList={newsList}
            onAddNews={handleAddNews}
            onDeleteNews={handleDeleteNews}
          />
        )}
      </main>

      {/* TOAST FEEDBACK RESPONSIVO */}
      {toast && (
        <div
          className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl animate-bounce ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-500/40 text-red-200'
              : toast.type === 'info'
              ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
              : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
