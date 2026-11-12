import React, { useState, useEffect } from 'react';
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { api } from '../../lib/api';

// Mapeamento dinâmico de ícones de clima
function renderWeatherIcon(iconName, className = 'w-10 h-10') {
  switch (iconName) {
    case 'sun':
      return <Sun className={`${className} text-amber-400 animate-spin-slow`} />;
    case 'cloud-sun':
      return <CloudSun className={`${className} text-amber-300`} />;
    case 'cloud':
      return <Cloud className={`${className} text-slate-300`} />;
    case 'cloud-rain':
    case 'cloud-heavy-rain':
      return <CloudRain className={`${className} text-cyan-400`} />;
    case 'cloud-lightning':
      return <CloudLightning className={`${className} text-yellow-300 animate-bounce`} />;
    case 'cloud-drizzle':
      return <CloudDrizzle className={`${className} text-blue-300`} />;
    default:
      return <CloudSun className={`${className} text-amber-300`} />;
  }
}

// Retorna o período do dia com nome, ícone correspondente e cor
function getPeriodoDoDia(data = new Date()) {
  const horas = data.getHours();

  if (horas >= 0 && horas < 6) {
    return {
      nome: 'Madrugada',
      icone: Moon,
      cor: 'text-indigo-300'
    };
  }
  if (horas >= 6 && horas < 12) {
    return {
      nome: 'Manhã',
      icone: Sunrise,
      cor: 'text-amber-300'
    };
  }
  if (horas >= 12 && horas < 18) {
    return {
      nome: 'Tarde',
      icone: Sunset,
      cor: 'text-orange-400'
    };
  }
  return {
    nome: 'Noite',
    icone: Moon,
    cor: 'text-purple-300'
  };
}

export default function WeatherScene({ item, isFullscreen }) {
  const cityName = item.title || 'São Paulo, SP';
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Relógio em tempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Busca dados de previsão do tempo
  useEffect(() => {
    let isMounted = true;
    async function fetchWeatherData() {
      try {
        setLoading(true);
        const data = await api.getWeather(cityName);
        if (isMounted) setWeather(data);
      } catch (err) {
        console.error('Erro ao buscar clima:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchWeatherData();
    // Atualiza a cada 5 minutos
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [cityName]);

  const formattedDate = currentTime.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const formattedTime = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const periodoAtual = getPeriodoDoDia(currentTime);
  const IconePeriodo = periodoAtual.icone;

  const gradientBg = item.bgColor || 'from-sky-600 via-blue-700 to-indigo-950';

  return (
    <div className={`relative w-full h-full flex flex-col justify-center items-center text-center p-4 sm:p-8 lg:p-14 overflow-hidden bg-gradient-to-br ${gradientBg} select-none`}>
      {/* Luz ambiente e textura */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Conteúdo centralizado */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center space-y-4 sm:space-y-6 lg:space-y-8 animate-fadeIn">
        {/* Cabeçalho de Cidade e Relógio */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-lg text-xs sm:text-sm font-semibold">
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>{weather?.city || cityName}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-slate-200 shadow-lg text-xs sm:text-sm font-mono">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Data completa */}
        <p className="text-xs sm:text-sm md:text-base text-cyan-200/90 font-medium capitalize tracking-wide flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-cyan-300" />
          {formattedDate}
        </p>

        {/* Bloco Principal de Temperatura */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 lg:gap-12 my-2">
          {/* Ícone de Clima em destaque */}
          <div className="p-4 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/30">
            {renderWeatherIcon(weather?.icon, isFullscreen ? 'w-20 h-20 sm:w-28 sm:h-28' : 'w-16 h-16 sm:w-20 sm:h-20')}
          </div>

          {/* Valor da Temperatura e Condição */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-baseline gap-1">
              <span className={`font-black text-white tracking-tighter drop-shadow-2xl ${
                isFullscreen ? 'text-6xl sm:text-8xl lg:text-9xl' : 'text-5xl sm:text-7xl lg:text-8xl'
              }`}>
                {weather ? weather.temperature : '--'}
              </span>
              <span className={`font-light text-cyan-300 ${isFullscreen ? 'text-4xl sm:text-6xl' : 'text-3xl sm:text-4xl'}`}>
                °C
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-1">
              <span className="text-base sm:text-xl lg:text-2xl font-bold text-white drop-shadow-md">
                {weather?.condition || 'Carregando previsão...'}
              </span>

              {weather && (
                <span className="text-xs sm:text-sm text-cyan-200/80 font-medium">
                  • Sensação {weather.feelsLike}°C
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cartões de Métricas (Máx, Mín, Umidade, Vento, Período) */}
        {weather && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-3xl">
            {/* Máxima e Mínima */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mb-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>Extremos</span>
              </div>
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-white">
                <span className="text-rose-400 flex items-center">
                  <ArrowUp className="w-3 h-3" />
                  {weather.tempMax}°
                </span>
                <span className="text-cyan-400 flex items-center">
                  <ArrowDown className="w-3 h-3" />
                  {weather.tempMin}°
                </span>
              </div>
            </div>

            {/* Umidade */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Umidade</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-white">
                {weather.humidity}%
              </span>
            </div>

            {/* Vento */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mb-1">
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vento</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-white">
                {weather.windSpeed} km/h
              </span>
            </div>

            {/* Status do Período do Dia */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mb-1">
                <IconePeriodo className={`w-3.5 h-3.5 ${periodoAtual.cor}`} />
                <span>Período</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-white">
                {periodoAtual.nome}
              </span>
            </div>
          </div>
        )}

        {/* Faixa com previsão dos próximos dias */}
        {weather?.forecast && weather.forecast.length > 0 && (
          <div className="hidden xs:flex items-center justify-center gap-3 sm:gap-6 pt-1 sm:pt-3">
            {weather.forecast.map((dayItem, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm text-white"
              >
                <span className="font-semibold text-cyan-200">{dayItem.day}</span>
                {renderWeatherIcon(dayItem.icon, 'w-4 h-4 sm:w-5 sm:h-5')}
                <span className="font-bold">{dayItem.tempMax}°</span>
                <span className="text-cyan-300/70 text-[11px] sm:text-xs">{dayItem.tempMin}°</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
