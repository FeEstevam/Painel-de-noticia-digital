const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Cliente de integração da API do backend
 */
export const api = {
  /**
   * Busca lista de notícias do servidor
   * @param {boolean} [activeOnly=false]
   */
  async getNews(activeOnly = false) {
    const url = `${API_BASE_URL}/news${activeOnly ? '?active=true' : ''}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Erro ao carregar notícias da API');
    }
    return json.data;
  },

  /**
   * Cadastra uma nova notícia no backend
   * @param {Object} newsData
   */
  async createNews(newsData) {
    const res = await fetch(`${API_BASE_URL}/news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsData)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Erro ao criar notícia na API');
    }
    return json.data;
  },

  /**
   * Exclui uma notícia por ID
   * @param {string|number} id
   */
  async deleteNews(id) {
    const res = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Erro ao excluir notícia na API');
    }
    return json.data;
  },

  /**
   * Popula banco com dados de teste
   */
  async seedDemo() {
    const res = await fetch(`${API_BASE_URL}/news/seed/demo`, {
      method: 'POST'
    });
    const json = await res.json();
    return json.data;
  }
};

