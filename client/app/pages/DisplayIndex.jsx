import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Database, Lock, LogIn, SlidersHorizontal, User, LogOut } from 'lucide-react';
import DisplayMode from '../components/DisplayMode';
import { api } from '../../lib/api';
import { isAuthenticated, getUser, logout } from '../../lib/auth';

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

export default function DisplayIndex() {
  const navigate = useNavigate();
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

  const [isDbConnected, setIsDbConnected] = useState(false);
  const [user, setUser] = useState(() => getUser());

  // Carrega notícias do banco de dados na inicialização
  useEffect(() => {
    async function loadNews() {
      try {
        const data = await api.getNews();
        if (Array.isArray(data) && data.length > 0) {
          setNewsList(data);
          setIsDbConnected(true);
        } else {
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

    loadNews();
    const interval = setInterval(loadNews, 30 * 1000); // sincroniza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  // Monitoramento suave para ativação automática de notícias agendadas
  useEffect(() => {
    const timer = setInterval(() => {
      setNewsList((prev) => [...prev]);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Redireciona para o Gerenciador (se autenticado vai para /painel, senão vai para /login)
  const handleAccessManager = () => {
    if (isAuthenticated()) {
      navigate('/painel');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Luzes de Fundo Decorativas */}
      <div className="fixed top-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-indigo-600/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-purple-600/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      {/* CABEÇALHO PÚBLICO DISCRETO E RESPONSIVO */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo e Identificação */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Painel Digital de Notícias
                </h1>
                <span
                  className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isDbConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                  title={isDbConnected ? 'Conectado ao Banco SQLite' : 'Operando em modo local'}
                >
                  <Database className="w-3 h-3" />
                  <span>{isDbConnected ? 'Banco Ativo' : 'Offline / Cache'}</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Mural informativo digital ao vivo
              </p>
            </div>
          </div>

          {/* Acesso ao Gerenciador / Login */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/painel')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                  title="Acessar o Painel de Gerenciamento"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Gerenciar</span>
                  <span className="xs:hidden">Painel</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-300 text-slate-400 text-xs transition-all cursor-pointer border border-slate-700"
                  title="Sair da conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-all cursor-pointer shadow-sm"
                title="Acesso de operadores e administradores"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xs:inline">Acesso Restrito</span>
                <span className="xs:hidden">Entrar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL DO DISPLAY (CARROSSEL) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col justify-center">
        <DisplayMode
          newsList={newsList}
          onGoToManager={handleAccessManager}
        />
      </main>
    </div>
  );
}
