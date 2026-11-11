/**
 * View para formatação e apresentação de dados de Usuários
 */
class UserView {
  /**
   * Formata os dados de um usuário omitindo senhas e dados sensíveis
   * @param {Object} user
   */
  static render(user) {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null
    };
  }

  /**
   * Formata resposta de autenticação / login bem-sucedido
   * @param {Object} user
   * @param {string} [token]
   */
  static renderAuth(user, token = null) {
    return {
      user: this.render(user),
      token: token || `mock-jwt-token-${user.id}-${Date.now()}` // Token simples/demonstrativo
    };
  }

  /**
   * Formata lista de usuários
   * @param {Array} users
   */
  static renderMany(users) {
    if (!Array.isArray(users)) return [];
    return users.map((u) => this.render(u));
  }
}

module.exports = UserView;

