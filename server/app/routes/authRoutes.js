const express = require('express');
const AuthController = require('../controller/authController');

const router = express.Router();

// Rotas de Autenticação e Usuários
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/users', AuthController.listUsers);

module.exports = router;

