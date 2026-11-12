/**
 * View para formatação e apresentação de dados de Notícias
 */
class NewsView {
  /**
   * Formata uma única notícia para envio ao cliente
   * @param {Object} news
   */
  static render(news) {
    if (!news) return null;

    const expiresAtMs = news.expiresAt ? new Date(news.expiresAt).getTime() : null;
    const publishAtMs = news.publishAt ? new Date(news.publishAt).getTime() : null;
    const nowMs = Date.now();
    const isExpired = expiresAtMs ? expiresAtMs <= nowMs : false;
    const isScheduled = publishAtMs ? publishAtMs > nowMs : false;
    const isLive = !isExpired && !isScheduled;

    return {
      id: String(news.id), // Compatibilidade com frontend (string ID)
      numericId: news.id,
      type: news.type,
      title: news.title,
      content: news.content || '',
      imageUrl: news.imageUrl || '',
      category: news.category || 'Geral',
      bgColor: news.bgColor,
      slideDuration: news.slideDuration ? Number(news.slideDuration) : 5,
      publishAt: publishAtMs, // Início da exibição em timestamp ms
      publishAtIso: news.publishAt ? new Date(news.publishAt).toISOString() : null,
      expiresAt: expiresAtMs, // Término da exibição em timestamp ms
      expiresAtIso: news.expiresAt ? new Date(news.expiresAt).toISOString() : null,
      isScheduled, // Agendada para o futuro
      isExpired,   // Já expirou
      isLive,      // Atualmente visível no painel
      author: news.author ? {
        id: news.author.id,
        name: news.author.name,
        email: news.author.email
      } : null,
      createdAt: news.createdAt ? new Date(news.createdAt).getTime() : null,
      updatedAt: news.updatedAt ? new Date(news.updatedAt).toISOString() : null
    };
  }

  /**
   * Formata uma lista de notícias
   * @param {Array} newsList
   */
  static renderMany(newsList) {
    if (!Array.isArray(newsList)) return [];
    return newsList.map((item) => this.render(item));
  }
}

module.exports = NewsView;

