const express = require('express');
const NewsController = require('../controller/newsController');
const sseService = require('../service/sseService');

const router = express.Router();

// ── SSE: endpoint de tempo real (DEVE vir ANTES de /:id para não conflitar) ──
router.get('/events', (req, res) => sseService.addClient(req, res));

// Operações de Notícias: Listagem, Criação (create), Edição (update) e Exclusão (delete)
router.get('/', NewsController.getAll);
router.post('/', NewsController.create);
router.put('/:id', NewsController.update);
router.delete('/:id', NewsController.remove);

// Rota auxiliar para popular dados iniciais se o banco estiver vazio
router.post('/seed/demo', NewsController.seed);

module.exports = router;
