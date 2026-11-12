const prisma = require('./database');

/**
 * Model de Notícias (Data Access Object / Abstração de Banco)
 */
class NewsModel {
  /**
   * Busca todas as notícias com filtros opcionais
   * @param {Object} options
   * @param {boolean} [options.activeOnly=false] - Retorna apenas notícias válidas (não expiradas)
   * @param {string} [options.category] - Filtro por categoria
   */
  static async findAll({ activeOnly = false, category = null } = {}) {
    const where = {};

    if (activeOnly) {
      const now = new Date();
      where.AND = [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        },
        {
          OR: [
            { publishAt: null },
            { publishAt: { lte: now } }
          ]
        }
      ];
    }

    if (category) {
      where.category = {
        equals: category
      };
    }

    return await prisma.news.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  /**
   * Busca uma notícia pelo ID
   * @param {number} id
   */
  static async findById(id) {
    return await prisma.news.findUnique({
      where: { id: Number(id) },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  /**
   * Cria uma nova notícia
   * @param {Object} data
   */
  static async create(data) {
    return await prisma.news.create({
      data: {
        type: data.type || 'text',
        title: data.title,
        content: data.content || '',
        imageUrl: data.imageUrl || null,
        category: data.category || 'Geral',
        bgColor: data.bgColor || 'from-indigo-600 via-purple-600 to-pink-600',
        slideDuration: data.slideDuration ? Number(data.slideDuration) : 5,
        publishAt: data.publishAt ? new Date(data.publishAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        authorId: data.authorId ? Number(data.authorId) : null
      }
    });
  }

  /**
   * Atualiza uma notícia existente
   * @param {number} id
   * @param {Object} data
   */
  static async update(id, data) {
    const updateData = { ...data };

    if (updateData.publishAt !== undefined) {
      updateData.publishAt = updateData.publishAt ? new Date(updateData.publishAt) : null;
    }
    if (updateData.expiresAt !== undefined) {
      updateData.expiresAt = updateData.expiresAt ? new Date(updateData.expiresAt) : null;
    }
    if (updateData.authorId !== undefined) {
      updateData.authorId = updateData.authorId ? Number(updateData.authorId) : null;
    }

    return await prisma.news.update({
      where: { id: Number(id) },
      data: updateData
    });
  }

  /**
   * Remove uma notícia pelo ID
   * @param {number} id
   */
  static async delete(id) {
    return await prisma.news.delete({
      where: { id: Number(id) }
    });
  }

  /**
   * Conta total de notícias
   */
  static async count() {
    return await prisma.news.count();
  }
}

module.exports = NewsModel;

