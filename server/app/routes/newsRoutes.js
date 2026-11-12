const express = require('express');
const NewsController = require('../controller/newsController');

const router = express.Router();

// Operações de Notícias: Listagem, Criação (create), Edição (update) e Exclusão (delete)
router.get('/', NewsController.getAll);
router.post('/', NewsController.create);
router.put('/:id', NewsController.update);
router.delete('/:id', NewsController.remove);

// Rota auxiliar para popular dados iniciais se o banco estiver vazio
router.post('/seed/demo', NewsController.seed);

module.exports = router;
