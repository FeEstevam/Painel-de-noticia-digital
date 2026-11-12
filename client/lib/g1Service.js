import { api } from './api';

/**
 * Busca as principais notícias em tempo real do feed RSS oficial do G1 / Brasil
 * @returns {Promise<Array<{ titulo: string, link: string, data: string, imageUrl?: string, body?: string, subtitle?: string }>>}
 */
export async function buscarNoticiasG1() {
  try {
    const articles = await api.getG1News();
    if (Array.isArray(articles) && articles.length > 0) {
      return articles.slice(0, 5).map((item) => ({
        titulo: item.titulo || item.title,
        link: item.link,
        data: item.data || item.publishedAt,
        imageUrl: item.imageUrl,
        body: item.body || item.summary,
        subtitle: item.subtitle,
        keyPoints: item.keyPoints || []
      }));
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar RSS do G1:', error);
    return [];
  }
}

export default buscarNoticiasG1;

