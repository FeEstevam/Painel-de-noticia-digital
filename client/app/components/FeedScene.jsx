import React, { useState, useEffect } from 'react';
import {
  Globe,
  Radio,
  Clock,
  Sparkles,
  TrendingUp,
  Tag,
  ChevronRight,
  ChevronLeft,
  Flame,
  Newspaper,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { api } from '../../lib/api';
import { buscarNoticiasG1 } from '../../lib/g1Service';

export default function FeedScene({ item, isFullscreen }) {
  const category = (item.category || 'geral').toLowerCase();
  const [feedData, setFeedData] = useState(null);
  const [activeArticleIndex, setActiveArticleIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Busca notícias completas do feed
  useEffect(() => {
    let isMounted = true;
    async function loadFeed() {
      try {
        setLoading(true);

        // Se for canal G1, utiliza a função direta do G1 RSS
        if (category === 'g1' || category.includes('g1')) {
          const g1News = await buscarNoticiasG1();
          if (isMounted && g1News && g1News.length > 0) {
            setFeedData({
              category: 'G1 GLOBO (AO VIVO)',
              articles: g1News
            });
            return;
          }
        }

        const data = await api.getGeneralFeed(category);
        if (isMounted) setFeedData(data);
      } catch (err) {
        console.error('Erro ao carregar feed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFeed();
    const interval = setInterval(loadFeed, 3 * 60 * 1000); // atualiza a cada 3 min
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [category]);

  const articles = feedData?.articles || [];

  // Rotaciona automaticamente entre os artigos a cada 12 segundos para dar tempo de leitura confortável
  useEffect(() => {
    if (articles.length <= 1) return;

    const interval = setInterval(() => {
      setActiveArticleIndex((prev) => (prev + 1) % articles.length);
    }, 12000);

    return () => clearInterval(interval);
  }, [articles.length]);

  const currentArticle = articles[activeArticleIndex] || {
    title: item.title || 'Notícias em Tempo Real',
    subtitle: 'Acompanhe as principais manchetes, apurações e análises dos principais acontecimentos.',
    body: item.content || 'Os principais fatos do Brasil e do mundo reunidos com profundidade e cobertura contínua dos setores de economia, cidades, saúde e tecnologia.',
    keyPoints: [
      'Cobertura contínua e apurada com as principais fontes',
      'Análise de impacto e desdobramentos práticos',
      'Atualizações em tempo real ao longo de todo o dia'
    ],
    source: 'Redação Central',
    category: 'Geral',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80',
    timeAgo: 'agora',
    trending: true
  };

  const nextArticle = () => {
    if (articles.length <= 1) return;
    setActiveArticleIndex((prev) => (prev + 1) % articles.length);
  };

  const prevArticle = () => {
    if (articles.length <= 1) return;
    setActiveArticleIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const gradientBg = item.bgColor || 'from-rose-950 via-neutral-900 to-black';

  return (
    <div className={`relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-br ${gradientBg} select-none`}>
      {/* Imagem de fundo jornalística da reportagem atual com efeito cinematográfico */}
      {currentArticle.imageUrl ? (
        <>
          <img
            key={currentArticle.id || activeArticleIndex}
            src={currentArticle.imageUrl}
            alt={currentArticle.title}
            className="absolute inset-0 w-full h-full object-cover animate-ken-burns transition-transform duration-1000 scale-100"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80';
            }}
          />
          {/* Múltiplos gradientes para legibilidade editorial impecável */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          <div className="absolute -top-40 right-10 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 left-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* 1. BARRA SUPERIOR EDITORIAL (CHAPEÚ DA NOTÍCIA) */}
      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6 flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 pb-3 sm:pb-4">
        {/* Identificação da transmissão */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-red-600 text-white font-black uppercase tracking-wider text-[10px] sm:text-xs shadow-lg shadow-red-600/40 border border-red-400/30">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <Radio className="w-3.5 h-3.5 text-white" />
            <span>NOTÍCIA AO VIVO</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentArticle.source}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Tag className="w-3 h-3 text-amber-400" />
            <span>{currentArticle.category}</span>
          </div>
        </div>

        {/* Timestamp e Contador de Notícias */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-300">
          <div className="inline-flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/10 text-[11px] sm:text-xs">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{currentArticle.timeAgo}</span>
          </div>

          {articles.length > 1 && (
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
              <span className="font-bold text-white">{activeArticleIndex + 1}</span>
              <span>de</span>
              <span>{articles.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. ÁREA CENTRAL: CONTEÚDO EDITORIAL APROFUNDADO */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-6 flex flex-col justify-center text-left space-y-3 sm:space-y-4 lg:space-y-5 animate-fadeIn">
        {/* Título / Manchete Principal da Reportagem */}
        <h1
          className={`font-black text-white leading-tight drop-shadow-2xl tracking-tight text-left ${
            isFullscreen
              ? 'text-xl sm:text-3xl md:text-4xl lg:text-5xl'
              : 'text-lg sm:text-2xl md:text-3xl lg:text-4xl'
          }`}
        >
          {currentArticle.title}
        </h1>

        {/* Linha Fina / Subtítulo Jornalístico (O Que Aconteceu) */}
        {currentArticle.subtitle && (
          <p className="text-amber-300/95 font-medium text-xs sm:text-sm md:text-base lg:text-lg leading-snug drop-shadow-md border-l-4 border-amber-400 pl-3">
            {currentArticle.subtitle}
          </p>
        )}

        {/* Corpo da Reportagem (Explicação Completa) */}
        {currentArticle.body && (
          <p className="text-slate-100 text-xs sm:text-sm md:text-base leading-relaxed font-normal drop-shadow-lg text-justify sm:text-left line-clamp-4 sm:line-clamp-5">
            {currentArticle.body}
          </p>
        )}

        {/* Caixa de Destaques / Pontos-Chave da Notícia */}
        {currentArticle.keyPoints && currentArticle.keyPoints.length > 0 && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 mt-1 sm:mt-2">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pontos Principais da Notícia</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {currentArticle.keyPoints.map((point, pIdx) => (
                <div
                  key={pIdx}
                  className="flex items-start gap-2 bg-black/40 border border-white/10 p-2 sm:p-2.5 rounded-xl"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] sm:text-xs text-slate-200 font-medium leading-snug">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. BARRA INFERIOR / NEWS TICKER (ROTAÇÃO E PRÓXIMAS MANCHETES) */}
      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 pb-3 sm:pb-5">
        {articles.length > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-black/60 backdrop-blur-md border border-white/15 px-3 sm:px-4 py-2 rounded-2xl">
            {/* Ticker com outras notícias */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 whitespace-nowrap flex items-center gap-1">
                <Newspaper className="w-3.5 h-3.5 text-red-400" />
                <span>Giro:</span>
              </span>
              <div className="flex items-center gap-2">
                {articles.map((art, idx) => (
                  <button
                    key={art.id || idx}
                    onClick={() => setActiveArticleIndex(idx)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap ${
                      idx === activeArticleIndex
                        ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-white/10'
                    }`}
                  >
                    {art.trending && <Flame className="w-3 h-3 text-amber-300 shrink-0" />}
                    <span className="max-w-[140px] sm:max-w-[200px] truncate">{art.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Botões de navegação rápida manual */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <button
                onClick={prevArticle}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition-all cursor-pointer"
                title="Notícia anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={nextArticle}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition-all cursor-pointer"
                title="Próxima notícia"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
