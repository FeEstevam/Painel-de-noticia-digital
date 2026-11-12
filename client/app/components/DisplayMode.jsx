import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Clock,
  Tag,
  AlertCircle,
  Maximize2,
  Tv
} from 'lucide-react';
import WeatherScene from './WeatherScene';
import FeedScene from './FeedScene';

export default function DisplayMode({ newsList, onGoToManager }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [now, setNow] = useState(Date.now());

  const carouselRef = useRef(null);

  // Relógio interno para reavaliar agendamentos e expirações em tempo real
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtra apenas as notícias que estão ATUALMENTE no ar (início atingido e não expiradas)
  const liveNewsList = newsList.filter((item) => {
    const publishAtMs = item.publishAt ? new Date(item.publishAt).getTime() : null;
    const expiresAtMs = item.expiresAt ? new Date(item.expiresAt).getTime() : null;
    const isStarted = !publishAtMs || publishAtMs <= now;
    const isNotExpired = !expiresAtMs || expiresAtMs > now;
    return isStarted && isNotExpired;
  });

  // Quantidade de conteúdos com agendamento futuro
  const scheduledCount = newsList.filter((item) => {
    const publishAtMs = item.publishAt ? new Date(item.publishAt).getTime() : null;
    return publishAtMs && publishAtMs > now;
  }).length;

  // Garante que o índice permanece válido se itens forem removidos ou adicionados
  useEffect(() => {
    if (liveNewsList.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= liveNewsList.length) {
      setCurrentIndex(0);
    }
  }, [liveNewsList.length, currentIndex]);

  const currentNews = liveNewsList[currentIndex];

  // Avançar Carrossel sempre para a direita
  const nextSlide = () => {
    if (liveNewsList.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % liveNewsList.length);
    setProgress(0);
  };

  // Voltar para o Slide anterior
  const prevSlide = () => {
    if (liveNewsList.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + liveNewsList.length) % liveNewsList.length);
    setProgress(0);
  };

  // Loop principal do Carrossel e Animação de Progresso dinâmico
  useEffect(() => {
    if (!isPlaying || liveNewsList.length <= 1) {
      setProgress(0);
      return;
    }

    const currentDuration = Math.max(2, currentNews?.slideDuration ? Number(currentNews.slideDuration) : 5);
    const stepMs = 50; // atualiza barra de progresso a cada 50ms
    const totalMs = currentDuration * 1000;
    const increment = (stepMs / totalMs) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, liveNewsList.length, currentNews?.slideDuration]);

  // Alternar Tela Cheia (usando Fullscreen API com fallback de estado)
  const toggleFullScreen = () => {
    if (!document.fullscreenElement && !isFullscreen) {
      if (carouselRef.current?.requestFullscreen) {
        carouselRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Listener nativo para mudanças de tela cheia (ex: tecla ESC do usuário)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, newsList.length]);

  // Formatação do tempo restante de validade da notícia
  const formatTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expirado';

    const mins = Math.floor(diff / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (mins > 60) {
      const hours = Math.floor(mins / 60);
      return `${hours}h ${mins % 60}m restantes`;
    }
    return `${mins}m ${secs}s restantes`;
  };

  return (
    <section className="flex flex-col gap-4 sm:gap-6 w-full">
      {/* Barra de Controles Superior Responsiva */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-slate-900/60 border border-slate-800/80 p-3 sm:p-4 rounded-2xl backdrop-blur-md">
          {/* Controles de Reprodução */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
              title={isPlaying ? 'Pausar giro automático' : 'Iniciar giro automático'}
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
            </button>

            <button
              onClick={prevSlide}
              disabled={liveNewsList.length <= 1}
              className="flex-1 sm:flex-initial px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
              title="Notícia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              onClick={nextSlide}
              disabled={liveNewsList.length <= 1}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
              title="Próxima notícia"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Info do tempo da notícia atual e Botão de Tela Cheia */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-wrap">
            {currentNews && (
              <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] sm:text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="hidden xs:inline">Tempo:</span>
                <span className="font-semibold text-indigo-300">
                  {currentNews.slideDuration || 5}s
                </span>
              </div>
            )}

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{liveNewsList.length} no ar</span>
              {scheduledCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {scheduledCount} agendada(s)
                </span>
              )}
            </div>

            {/* BOTÃO PRINCIPAL DE TELA CHEIA */}
            <button
              onClick={toggleFullScreen}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
              title="Abrir notícia em Tela Cheia (Full Screen)"
            >
              <Tv className="w-4 h-4" />
              <span className="font-semibold">Tela Cheia</span>
            </button>
          </div>
        </div>
      )}

      {/* O PAINEL DE NOTÍCIA (PROPORÇÃO ADAPTATIVA MOBILE/DESKTOP/TV) */}
      <div
        ref={carouselRef}
        onDoubleClick={isFullscreen ? toggleFullScreen : undefined}
        title={isFullscreen ? "Pressione ESC ou dê duplo clique para sair da tela cheia" : undefined}
        className={`transition-all duration-300 flex flex-col group select-none ${
          isFullscreen
            ? 'fixed inset-0 z-50 w-screen h-screen bg-slate-950 overflow-hidden cursor-default'
            : 'relative w-full aspect-[4/5] xs:aspect-[1/1] sm:aspect-[16/10] lg:aspect-[21/9] min-h-[400px] sm:min-h-[440px] bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-2xl'
        }`}
      >
        {liveNewsList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 text-slate-500">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mb-4 stroke-[1.5] text-amber-400/90" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-200 mb-1">
              {scheduledCount > 0 ? 'Conteúdos aguardando horário agendado' : 'Nenhuma notícia no ar no momento'}
            </h3>
            <p className="text-xs sm:text-sm max-w-md text-slate-400">
              {scheduledCount > 0
                ? `Existem ${scheduledCount} notícia(s) ou cena(s) agendada(s) que entrarão em exibição automaticamente na data e hora programadas.`
                : 'Cadastre ou agende novos conteúdos no Gerenciador para preencher o carrossel.'}
            </p>
            {onGoToManager && (
              <button
                onClick={onGoToManager}
                className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Ir para o Gerenciador
              </button>
            )}
          </div>
        ) : (
          <>
            {/* WRAPPER COM TRANSIÇÃO SUAVE E ANIMAÇÃO ENTRE NOTÍCIAS */}
            <div
              key={currentNews.id}
              className="relative w-full h-full flex-1 flex flex-col justify-center items-center overflow-hidden animate-carousel-fade"
            >
              {currentNews.type === 'weather' ? (
                <WeatherScene item={currentNews} isFullscreen={isFullscreen} />
              ) : currentNews.type === 'feed' ? (
                <FeedScene item={currentNews} isFullscreen={isFullscreen} />
              ) : (
                /* Notícia Convencional (Imagem ou Texto) com Conteúdo Centralizado */
                <div className="relative w-full h-full flex-1 flex flex-col justify-center items-center text-center overflow-hidden">
                  {/* Notícia com Imagem */}
                  {currentNews.type === 'image' ? (
                    <>
                      <img
                        src={currentNews.imageUrl}
                        alt={currentNews.title}
                        className="absolute inset-0 w-full h-full object-cover animate-ken-burns transition-transform duration-1000 scale-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1920&q=80';
                        }}
                      />
                      {/* Gradiente e escurecimento central para contraste e legibilidade */}
                      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70 pointer-events-none" />
                    </>
                  ) : (
                    /* Notícia apenas Texto com Gradiente de Fundo */
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        currentNews.bgColor || 'from-indigo-600 via-purple-600 to-pink-600'
                      } flex flex-col justify-center p-6 sm:p-14 lg:p-24`}
                    >
                      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
                    </div>
                  )}

                  {/* CONTEÚDO DA NOTÍCIA CENTRALIZADO E RESPONSIVO */}
                  <div
                    className={`relative z-10 space-y-3 sm:space-y-4 md:space-y-6 flex flex-col items-center text-center ${
                      isFullscreen
                        ? 'p-6 sm:p-14 lg:p-24 max-w-6xl pb-12 sm:pb-16'
                        : 'p-5 sm:p-8 lg:p-12 max-w-4xl'
                    }`}
                  >
                    {/* Categoria e Tempo de Expiração */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-lg ${
                          isFullscreen ? 'px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm' : 'px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs'
                        }`}
                      >
                        <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {currentNews.category}
                      </span>

                      {currentNews.expiresAt && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-amber-500/30 border border-amber-400/40 text-amber-200 backdrop-blur-md animate-pulse ${
                            isFullscreen ? 'px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm' : 'px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs'
                          }`}
                        >
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                          {formatTimeRemaining(currentNews.expiresAt)}
                        </span>
                      )}
                    </div>

                    {/* Título da Notícia */}
                    <h1
                      className={`font-black text-white leading-tight drop-shadow-2xl ${
                        isFullscreen
                          ? 'text-2xl sm:text-5xl lg:text-7xl xl:text-8xl tracking-tight'
                          : 'text-xl sm:text-3xl md:text-4xl lg:text-5xl'
                      }`}
                    >
                      {currentNews.title}
                    </h1>

                    {/* Conteúdo / Detalhes */}
                    {currentNews.content && (
                      <p
                        className={`text-slate-100 leading-relaxed drop-shadow-lg text-center ${
                          isFullscreen
                            ? 'text-sm sm:text-xl lg:text-2xl line-clamp-4 sm:line-clamp-6 max-w-5xl font-normal text-slate-200'
                            : 'text-xs sm:text-base lg:text-lg line-clamp-3 sm:line-clamp-4 text-slate-200'
                        }`}
                      >
                        {currentNews.content}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* BARRA DE PROGRESSO VISUAL NO TOPO */}
            {liveNewsList.length > 1 && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 z-30 pointer-events-none">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-75 ease-linear shadow-lg"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* ELEMENTOS VISÍVEIS APENAS FORA DA TELA CHEIA */}
            {!isFullscreen && (
              <>
                {/* Botão de Maximizar no canto superior direito do slide */}
                <button
                  onClick={toggleFullScreen}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 rounded-xl bg-black/50 hover:bg-black/75 text-white backdrop-blur-md border border-white/15 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg"
                  title="Maximizar para Tela Cheia"
                >
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Indicadores de Paginação (Dots) no canto inferior direito */}
                {liveNewsList.length > 1 && (
                  <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-30 flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border border-white/15">
                    {liveNewsList.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentIndex(index);
                          setProgress(0);
                        }}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          index === currentIndex
                            ? 'w-5 sm:w-7 h-1.5 sm:h-2 bg-indigo-400'
                            : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/80'
                        }`}
                        title={`Ir para notícia ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Botões Laterais de Navegação (Anterior / Próximo) */}
                {liveNewsList.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-2xl bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Notícia anterior (Seta Esquerda)"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <button
                      onClick={nextSlide}
                      className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-2xl bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Próxima notícia (Seta Direita)"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
