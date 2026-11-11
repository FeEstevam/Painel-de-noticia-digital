const express = require('express');
const newsRoutes = require('./newsRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Rota de Healthcheck / Status da API
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'API do Painel de Notícias em execução (Arquitetura MVC)',
    timestamp: new Date().toISOString(),
    endpoints: {
      news: '/api/news',
      auth: '/api/auth'
    }
  });
});

// Agrupamento de rotas por módulo
router.use('/news', newsRoutes);
router.use('/auth', authRoutes);

module.exports = router;

