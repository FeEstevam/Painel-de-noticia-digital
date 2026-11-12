const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 6000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PainelNoticias/1.0'
  }
});

/**
 * Converte data ISO/RFC para formato amigável em português
 */
function formatTimeAgo(dateString) {
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(mins / 60);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `há ${days} dia(s)`;
    }
    if (hours > 0) return `há ${hours}h ${mins % 60}m`;
    if (mins > 0) return `há ${mins} min`;
    return 'agora';
  } catch {
    return 'recente';
  }
}

/**
 * Busca notícias em tempo real diretamente do feed RSS oficial do G1 / Globo
 */
async function buscarNoticiasG1() {
  try {
    // Feed RSS oficial do G1 / Brasil
    const feed = await parser.parseURL('https://g1.globo.com/dynamo/rss2.xml');

    if (!feed?.items || !Array.isArray(feed.items)) {
      return [];
    }

    // Retorna as notícias formatadas com imagem, título e conteúdo limpo
    return feed.items.slice(0, 8).map((item, index) => {
      // Extrai imagem da reportagem contida na tag <img> do content
      let imageUrl = null;
      if (item.content) {
        const match = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match && match[1]) {
          imageUrl = match[1];
        }
      }

      // Limpa tags HTML para obter o texto limpo da notícia
      const rawText = item.contentSnippet || (item.content ? item.content.replace(/<[^>]+>/g, '') : '');
      const cleanText = rawText.replace(/\s+/g, ' ').trim();

      // Divide em frases para gerar subtítulo e pontos-chave
      const sentences = cleanText.split(/\.\s+/).filter((s) => s.length > 15);
      const subtitle = sentences[0] ? `${sentences[0]}.` : '';
      const body = sentences.slice(0, 3).join('. ') + (sentences.length > 0 ? '.' : '');

      return {
        id: `g1-${index}-${Date.now()}`,
        titulo: item.title,
        title: item.title,
        link: item.link,
        data: item.pubDate,
        publishedAt: item.pubDate,
        timeAgo: formatTimeAgo(item.pubDate),
        source: 'G1 Notícias',
        category: 'G1 Brasil',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80',
        subtitle: subtitle || 'Acompanhe as principais informações apuradas pelo portal G1 em tempo real.',
        body: body || cleanText || 'Reportagem em atualização contínua pelo jornalismo do G1.',
        keyPoints: sentences.slice(0, 3).map((s) => s.replace(/\.$/, '')),
        trending: index < 2
      };
    });
  } catch (error) {
    console.error('Erro ao buscar RSS do G1:', error.message);
    return [];
  }
}

module.exports = {
  buscarNoticiasG1
};

