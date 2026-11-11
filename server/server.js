require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./app/swagger/swagger-jsdoc.json');
const apiRoutes = require('./app/routes');
const ResponseView = require('./app/view/responseView');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log simplificado de requisições em desenvolvimento
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Documentação Interativa Swagger (OpenAPI 3.0)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/swagger.json', (req, res) => res.json(swaggerDocument));

// Rotas da API (Prefixadas com /api)
app.use('/api', apiRoutes);

// Rota raiz para verificação rápida
app.get('/', (req, res) => {
  res.json({
    name: 'Painel de Notícias API',
    version: '1.0.0',
    architecture: 'MVC (Model-View-Controller)',
    docs: `http://localhost:${PORT}/docs`,
    swaggerJson: `http://localhost:${PORT}/api/swagger.json`,
    status: `http://localhost:${PORT}/api/status`
  });
});

// Tratamento de Rota Não Encontrada (404)
app.use((req, res) => {
  ResponseView.error(res, `Rota '${req.originalUrl}' não encontrada neste servidor`, 404);
});

// Tratamento Global de Erros (500)
app.use((err, req, res, next) => {
  console.error('Erro não tratado na aplicação:', err);
  ResponseView.error(res, 'Erro interno do servidor', 500, err.message);
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor API (MVC) rodando na porta ${PORT}`);
  console.log(`📖 Documentação Swagger: http://localhost:${PORT}/docs`);
  console.log(`📡 URL base da API: http://localhost:${PORT}/api`);
  console.log(`📰 Notícias: http://localhost:${PORT}/api/news`);
  console.log(`🔐 Autenticação: http://localhost:${PORT}/api/auth`);
  console.log(`===============================================`);
});

module.exports = app;
