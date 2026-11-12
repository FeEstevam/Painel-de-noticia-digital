const UserModel = require('../model/userModel');
const UserView = require('../view/userView');
const ResponseView = require('../view/responseView');

/**
 * Controller de Autenticação e Usuários
 * Fluxo MVC: Rota (authRoutes.js) -> Controller (authController.js) -> Model (userModel.js) -> View (responseView.js)
 */
class AuthController {
  /**
   * POST /api/auth/login
   * Valida credenciais do usuário e suporta conta mock/demo padrão
   */
  static async login(req, res) {
    try {
      const { identifier, email, password } = req.body;
      const userEmail = (identifier || email || '').trim();

      if (!userEmail || !password) {
        return ResponseView.error(res, 'Email/login e senha são obrigatórios', 400);
      }

      const normalizedEmail = userEmail.toLowerCase();

      // Conta Mock / Demonstração Padrão para testes e desenvolvimento
      if (
        (normalizedEmail === 'admin@painel.com' || normalizedEmail === 'admin') &&
        password === 'admin123'
      ) {
        let user = await UserModel.findByEmail('admin@painel.com');
        if (!user) {
          user = await UserModel.create({
            email: 'admin@painel.com',
            name: 'Administrador do Painel',
            password: 'admin123'
          });
        }
        return ResponseView.success(
          res,
          UserView.renderAuth(user),
          200,
          'Autenticação realizada com sucesso (Conta Demonstração/Admin)'
        );
      }

      let user = await UserModel.findByEmail(normalizedEmail);

      if (!user) {
        return ResponseView.error(res, 'Credenciais inválidas ou usuário não cadastrado', 401);
      }

      if (user.password !== password) {
        return ResponseView.error(res, 'Senha incorreta', 401);
      }

      return ResponseView.success(
        res,
        UserView.renderAuth(user),
        200,
        'Autenticação realizada com sucesso'
      );
    } catch (error) {
      console.error('Erro em AuthController.login:', error);
      return ResponseView.error(res, 'Erro ao processar login', 500, error.message);
    }
  }

  /**
   * POST /api/auth/register
   * Cria novo usuário institucional
   */
  static async register(req, res) {
    try {
      const { email, name, password } = req.body;

      if (!email || !password) {
        return ResponseView.error(res, 'Email e senha são obrigatórios', 400);
      }

      const existing = await UserModel.findByEmail(email.trim().toLowerCase());
      if (existing) {
        return ResponseView.error(res, 'Este e-mail já está em uso', 409);
      }

      const created = await UserModel.create({
        email: email.trim().toLowerCase(),
        name: name ? name.trim() : email.split('@')[0],
        password
      });

      return ResponseView.success(
        res,
        UserView.renderAuth(created),
        210,
        'Usuário registrado com sucesso'
      );
    } catch (error) {
      console.error('Erro em AuthController.register:', error);
      return ResponseView.error(res, 'Erro ao registrar usuário', 500, error.message);
    }
  }

  /**
   * GET /api/auth/users
   * Lista usuários cadastrados (sem expor senhas)
   */
  static async listUsers(req, res) {
    try {
      const users = await UserModel.findAll();
      return ResponseView.success(res, UserView.renderMany(users), 200);
    } catch (error) {
      console.error('Erro em AuthController.listUsers:', error);
      return ResponseView.error(res, 'Erro ao listar usuários', 500, error.message);
    }
  }
}

module.exports = AuthController;
