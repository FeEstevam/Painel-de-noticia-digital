const express = require('express');
const WeatherController = require('../controller/weatherController');

const router = express.Router();

// GET /api/weather?city=Sao Paulo
router.get('/', WeatherController.getWeather);

// GET /api/weather/cities
router.get('/cities', WeatherController.listCities);

module.exports = router;

