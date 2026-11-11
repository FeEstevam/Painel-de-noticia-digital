const NewsModel = require('../model/newsModel');
const NewsView = require('../view/newsView');
const ResponseView = require('../view/responseView');

/**
 * Controller de Notícias
 * Operações: Listar, Criar (create) e Excluir (delete)
 */
class NewsController {
  /**
   * GET /api/news
   * Lista todas as notícias salvas no banco de dados
   */
  static async getAll(req, res) {
    try {
      const activeOnly = req.query.active === 'true';
      const category = req.query.category || null;

      const newsList = await NewsModel.findAll({ activeOnly, category });
      const rendered = NewsView.renderMany(newsList);

      return ResponseView.success(res, rendered);
    } catch (error) {
      console.error('Erro em NewsController.getAll:', error);
      return ResponseView.error(res, 'Erro ao carregar notícias do banco de dados', 500, error.message);
    }
  }

  /**
   * POST /api/news
   * Cria e salva uma nova notícia no banco de dados (CREATE)
   */
  static async create(req, res) {
    try {
      const { type, title, content, imageUrl, category, bgColor, slideDuration, expiresAt, authorId } = req.body;

      // Validação obrigatória
      if (!title || !title.trim()) {
        return ResponseView.error(res, 'O título da notícia é obrigatório', 400);
      }

      if (type === 'image' && (!imageUrl || !imageUrl.trim())) {
        return ResponseView.error(res, 'A URL da imagem é obrigatória para notícias com imagem', 400);
      }

      const created = await NewsModel.create({
        type: type === 'image' ? 'image' : 'text',
        title: title.trim(),
        content: content ? content.trim() : '',
        imageUrl: imageUrl ? imageUrl.trim() : null,
        category: category ? category.trim() : 'Geral',
        bgColor: bgColor || 'from-indigo-600 via-purple-600 to-pink-600',
        slideDuration: slideDuration ? Math.max(2, Number(slideDuration)) : 5,
        expiresAt: expiresAt || null,
        authorId: authorId || null
      });

      return ResponseView.success(
        res,
        NewsView.render(created),
        201,
        'Notícia salva no banco de dados com sucesso'
      );
    } catch (error) {
      console.error('Erro em NewsController.create:', error);
      return ResponseView.error(res, 'Erro ao salvar notícia no banco de dados', 500, error.message);
    }
  }

  /**
   * DELETE /api/news/:id
   * Remove uma notícia do banco de dados (DELETE)
   */
  static async remove(req, res) {
    try {
      const { id } = req.params;
      const existing = await NewsModel.findById(id);

      if (!existing) {
        return ResponseView.notFound(res, 'Notícia');
      }

      await NewsModel.delete(id);
      return ResponseView.success(res, { id: Number(id) }, 200, 'Notícia excluída do banco de dados');
    } catch (error) {
      console.error('Erro em NewsController.remove:', error);
      return ResponseView.error(res, 'Erro ao excluir notícia do banco de dados', 500, error.message);
    }
  }

  /**
   * POST /api/news/seed/demo
   * Popula o banco com notícias iniciais caso esteja vazio
   */
  static async seed(req, res) {
    try {
      const count = await NewsModel.count();
      if (count > 0) {
        const all = await NewsModel.findAll();
        return ResponseView.success(res, NewsView.renderMany(all), 200, 'Banco já contém notícias');
      }

      const initialNews = [
        {
          type: 'image',
          title: 'Novo Campus Tecnológico Inaugurado',
          content: 'Instalações de última geração abertas para a comunidade com laboratórios de IA e robótica.',
          imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
          category: 'Inovação',
          slideDuration: 5,
          bgColor: '#4f46e5',
          expiresAt: null
        },
        {
          type: 'text',
          title: 'COMUNICADO IMPORTANTE: Manutenção Programada',
          content: 'Informamos que o portal passará por atualizações hoje às 23:00. O tempo estimado de indisponibilidade é de 15 minutos.',
          imageUrl: null,
          category: 'Aviso Urgente',
          slideDuration: 8,
          bgColor: 'from-amber-600 via-orange-600 to-red-600',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        },
        {
          type: 'image',
          title: 'Workshop de Design & UX na Sexta-feira',
          content: 'Participe do nosso treinamento prático sobre criação de interfaces acessíveis.',
          imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
          category: 'Eventos',
          slideDuration: 6,
          bgColor: '#0891b2',
          expiresAt: new Date(Date.now() + 120 * 60 * 1000)
        }
      ];

      for (const item of initialNews) {
        await NewsModel.create(item);
      }

      const all = await NewsModel.findAll();
      return ResponseView.success(res, NewsView.renderMany(all), 201, 'Banco de dados populado com sucesso');
    } catch (error) {
      console.error('Erro em NewsController.seed:', error);
      return ResponseView.error(res, 'Erro ao popular notícias', 500, error.message);
    }
  }
}

module.exports = NewsController;
