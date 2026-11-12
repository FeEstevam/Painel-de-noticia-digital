const express = require('express');
const newsRoutes = require('./newsRoutes');
const authRoutes = require('./authRoutes');
const weatherRoutes = require('./weatherRoutes');
const feedRoutes = require('./feedRoutes');

const router = express.Router();

// Rota de Healthcheck / Status da API
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'API do Painel de Notícias em execução (Arquitetura MVC)',
    timestamp: new Date().toISOString(),
    endpoints: {
      news: '/api/news',
      auth: '/api/auth',
      weather: '/api/weather',
      feed: '/api/feed'
    }
  });
});

// Agrupamento de rotas por módulo
router.use('/news', newsRoutes);
router.use('/auth', authRoutes);
router.use('/weather', weatherRoutes);
router.use('/feed', feedRoutes);

module.exports = router;

