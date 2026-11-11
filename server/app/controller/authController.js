const UserModel = require('../model/userModel');
const UserView = require('../view/userView');
const ResponseView = require('../view/responseView');

/**
 * Controller de Autenticação e Usuários
 */
class AuthController {
  /**
   * POST /api/auth/login
   * Valida credenciais do usuário
   */
  static async login(req, res) {
    try {
      const { identifier, email, password } = req.body;
      const userEmail = identifier || email;

      if (!userEmail || !password) {
        return ResponseView.error(res, 'Email/login e senha são obrigatórios', 400);
      }

      let user = await UserModel.findByEmail(userEmail);

      // Se não existir, para efeito de demonstração ou primeiro acesso, cria um se desejado
      // ou valida a senha:
      if (!user) {
        // Validação padrão: usuário não encontrado
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

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return ResponseView.error(res, 'Este e-mail já está cadastrado', 409);
      }

      const user = await UserModel.create({ email, name, password });
      return ResponseView.success(res, UserView.render(user), 201, 'Usuário cadastrado com sucesso');
    } catch (error) {
      console.error('Erro em AuthController.register:', error);
      return ResponseView.error(res, 'Erro ao registrar usuário', 500, error.message);
    }
  }

  /**
   * GET /api/auth/users
   * Lista usuários cadastrados
   */
  static async listUsers(req, res) {
    try {
      const users = await UserModel.findAll();
      return ResponseView.success(res, UserView.renderMany(users));
    } catch (error) {
      console.error('Erro em AuthController.listUsers:', error);
      return ResponseView.error(res, 'Erro ao listar usuários', 500, error.message);
    }
  }
}

module.exports = AuthController;

