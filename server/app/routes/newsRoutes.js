const express = require('express');
const NewsController = require('../controller/newsController');

const router = express.Router();

// Operações de Notícias: apenas Listagem, Criação (create) e Exclusão (delete)
router.get('/', NewsController.getAll);
router.post('/', NewsController.create);
router.delete('/:id', NewsController.remove);

// Rota auxiliar para popular dados iniciais se o banco estiver vazio
router.post('/seed/demo', NewsController.seed);

module.exports = router;
