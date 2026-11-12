const WeatherService = require('../service/weatherService');
const ResponseView = require('../view/responseView');

/**
 * Controller de Previsão do Tempo e Clima
 * Fluxo MVC Padronizado:
 * Rota (weatherRoutes.js) -> Controller (weatherController.js) -> Service (weatherService.js) -> View (responseView.js)
 */
class WeatherController {
  /**
   * GET /api/weather?city=Sao Paulo
   * Obtém os dados meteorológicos e previsão do tempo via WeatherService
   */
  static async getWeather(req, res) {
    try {
      const city = req.query.city || 'São Paulo';
      const weatherData = await WeatherService.getWeather(city);

      return ResponseView.success(
        res,
        weatherData,
        200,
        weatherData.fallback
          ? 'Previsão do tempo local (modo offline/resiliência)'
          : 'Previsão do tempo obtida com sucesso'
      );
    } catch (error) {
      console.error('Erro em WeatherController.getWeather:', error);
      return ResponseView.error(res, 'Erro ao obter dados meteorológicos', 500, error.message);
    }
  }

  /**
   * GET /api/weather/cities
   * Retorna lista de cidades populares pré-configuradas
   */
  static listCities(req, res) {
    try {
      const cities = WeatherService.listCities();
      return ResponseView.success(res, cities, 200, 'Lista de cidades disponíveis');
    } catch (error) {
      console.error('Erro em WeatherController.listCities:', error);
      return ResponseView.error(res, 'Erro ao listar cidades', 500, error.message);
    }
  }
}

module.exports = WeatherController;
