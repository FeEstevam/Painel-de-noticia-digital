/**
 * Serviço de Previsão do Tempo e Clima (Open-Meteo)
 * Centraliza a comunicação com a API externa Open-Meteo,
 * tratamento de códigos meteorológicos WMO e cache em memória (TTL: 10 min)
 * para evitar sobrecarga na API externa e garantir alta performance no painel.
 */

// Tabela de coordenadas para capitais e principais cidades brasileiras
const CITIES_COORDS = {
  'sao paulo': { name: 'São Paulo, SP', lat: -23.5505, lon: -46.6333 },
  'rio de janeiro': { name: 'Rio de Janeiro, RJ', lat: -22.9068, lon: -43.1729 },
  'brasilia': { name: 'Brasília, DF', lat: -15.7975, lon: -47.8919 },
  'belo horizonte': { name: 'Belo Horizonte, MG', lat: -19.9245, lon: -43.9352 },
  'curitiba': { name: 'Curitiba, PR', lat: -25.4284, lon: -49.2733 },
  'porto alegre': { name: 'Porto Alegre, RS', lat: -30.0346, lon: -51.2177 },
  'salvador': { name: 'Salvador, BA', lat: -12.9777, lon: -38.5016 },
  'recife': { name: 'Recife, PE', lat: -8.0476, lon: -34.8770 },
  'fortaleza': { name: 'Fortaleza, CE', lat: -3.7319, lon: -38.5267 },
  'goiania': { name: 'Goiânia, GO', lat: -16.6869, lon: -49.2648 },
  'manaus': { name: 'Manaus, AM', lat: -3.1190, lon: -60.0217 },
  'florianopolis': { name: 'Florianópolis, SC', lat: -27.5954, lon: -48.5480 },
  'campinas': { name: 'Campinas, SP', lat: -22.9056, lon: -47.0608 },
  'vitoria': { name: 'Vitória, ES', lat: -20.3155, lon: -40.3128 }
};

// Cache em memória: { [cityKey]: { data: Object, timestamp: number } }
const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos de retenção

/**
 * Traduz os códigos meteorológicos WMO da Open-Meteo para nomes em português e ícones
 * @param {number} code - Código WMO
 * @param {number} isDay - 1 para dia, 0 para noite
 */
function parseWmoWeather(code, isDay = 1) {
  if (code === 0) return { condition: 'Céu Limpo', icon: isDay ? 'sun' : 'moon' };
  if (code === 1 || code === 2) return { condition: 'Parcialmente Nublado', icon: isDay ? 'cloud-sun' : 'cloud-moon' };
  if (code === 3) return { condition: 'Encoberto', icon: 'cloud' };
  if (code >= 45 && code <= 48) return { condition: 'Nevoeiro', icon: 'fog' };
  if (code >= 51 && code <= 55) return { condition: 'Garoa Leve', icon: 'cloud-drizzle' };
  if (code >= 61 && code <= 65) return { condition: 'Chuva', icon: 'cloud-rain' };
  if (code >= 80 && code <= 82) return { condition: 'Pancadas de Chuva', icon: 'cloud-heavy-rain' };
  if (code >= 95 && code <= 99) return { condition: 'Tempestade com Raios', icon: 'cloud-lightning' };
  return { condition: 'Tempo Agradável', icon: 'cloud-sun' };
}

class WeatherService {
  /**
   * Consulta a previsão do tempo para uma cidade com caching em memória
   * @param {string} rawCity - Nome da cidade
   * @returns {Promise<Object>} Dados meteorológicos completos
   */
  static async getWeather(rawCity = 'São Paulo') {
    const cityName = (rawCity || 'São Paulo').trim();
    const normalizedKey = cityName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // 1. Verifica cache em memória
    const cachedEntry = weatherCache.get(normalizedKey);
    const now = Date.now();
    if (cachedEntry && (now - cachedEntry.timestamp < CACHE_TTL_MS)) {
      return { ...cachedEntry.data, cached: true };
    }

    const cityConfig = CITIES_COORDS[normalizedKey] || {
      name: cityName,
      lat: -23.5505,
      lon: -46.6333
    };

    try {
      // 2. Consulta à API externa Open-Meteo
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityConfig.lat}&longitude=${cityConfig.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const current = data.current || {};
        const daily = data.daily || {};

        const weatherInfo = parseWmoWeather(current.weather_code, current.is_day);

        // Dias da semana para previsão de 3 dias
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const forecast = [];

        if (daily.time && Array.isArray(daily.time)) {
          for (let i = 0; i < Math.min(3, daily.time.length); i++) {
            const d = new Date(daily.time[i] + 'T12:00:00');
            const dayName = i === 0 ? 'Hoje' : weekdays[d.getDay()];
            const wInfo = parseWmoWeather(daily.weather_code?.[i] ?? 0, 1);
            forecast.push({
              day: dayName,
              date: daily.time[i],
              tempMax: Math.round(daily.temperature_2m_max?.[i] ?? 26),
              tempMin: Math.round(daily.temperature_2m_min?.[i] ?? 18),
              condition: wInfo.condition,
              icon: wInfo.icon
            });
          }
        }

        const weatherResult = {
          city: cityConfig.name,
          temperature: Math.round(current.temperature_2m ?? 24),
          feelsLike: Math.round(current.apparent_temperature ?? 25),
          humidity: Math.round(current.relative_humidity_2m ?? 65),
          windSpeed: Math.round(current.wind_speed_10m ?? 12),
          precipitation: current.precipitation ?? 0,
          condition: weatherInfo.condition,
          icon: weatherInfo.icon,
          isDay: current.is_day === 1,
          tempMax: forecast[0]?.tempMax ?? 28,
          tempMin: forecast[0]?.tempMin ?? 18,
          forecast,
          updatedAt: new Date().toISOString(),
          cached: false
        };

        // Salva no cache em memória
        weatherCache.set(normalizedKey, { data: weatherResult, timestamp: now });

        return weatherResult;
      }
    } catch (err) {
      console.warn(`[WeatherService] Aviso na consulta Open-Meteo para "${cityName}":`, err.message);
    }

    // 3. Fallback inteligente para garantir exibição contínua ininterrupta em TVs
    const fallbackData = {
      city: cityConfig.name,
      temperature: 24,
      feelsLike: 25,
      humidity: 62,
      windSpeed: 14,
      precipitation: 0,
      condition: 'Parcialmente Nublado',
      icon: 'cloud-sun',
      isDay: true,
      tempMax: 27,
      tempMin: 18,
      forecast: [
        { day: 'Hoje', tempMax: 27, tempMin: 18, condition: 'Parcialmente Nublado', icon: 'cloud-sun' },
        { day: 'Amanhã', tempMax: 29, tempMin: 19, condition: 'Ensolarado', icon: 'sun' },
        { day: 'Depois', tempMax: 25, tempMin: 17, condition: 'Pancadas de Chuva', icon: 'cloud-rain' }
      ],
      updatedAt: new Date().toISOString(),
      cached: false,
      fallback: true
    };

    return fallbackData;
  }

  /**
   * Retorna lista de cidades populares pré-configuradas
   */
  static listCities() {
    return Object.values(CITIES_COORDS).map((c) => c.name);
  }
}

module.exports = WeatherService;
