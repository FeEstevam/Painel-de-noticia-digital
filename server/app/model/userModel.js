const prisma = require('./database');

/**
 * Model de Usuários
 */
class UserModel {
  /**
   * Busca usuário por e-mail
   * @param {string} email
   */
  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
  }

  /**
   * Busca usuário pelo ID
   * @param {number} id
   */
  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id: Number(id) }
    });
  }

  /**
   * Cria um novo usuário
   * @param {Object} data
   */
  static async create({ email, name, password }) {
    return await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name || null,
        password: password // Em produção, utilize bcrypt para hash
      }
    });
  }

  /**
   * Lista todos os usuários
   */
  static async findAll() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = UserModel;

