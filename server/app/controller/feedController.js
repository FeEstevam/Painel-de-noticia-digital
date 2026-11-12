const ResponseView = require('../view/responseView');
const { buscarNoticiasG1 } = require('../service/g1Service');

/**
 * Banco de notícias jornalísticas completas, aprofundadas e contextualizadas
 */
const NEWS_FEEDS = {
  geral: [
    {
      id: 'g-1',
      source: 'Agência Brasil',
      category: 'Cidades & Transporte',
      title: 'Plano Nacional de Mobilidade Urbana destina R$ 14,8 bilhões para renovação de frotas elétricas nas capitais',
      subtitle: 'Medida autoriza a substituição gradual de 4.200 ônibus a diesel por veículos 100% elétricos e modernização de linhas de metrô em dez estados.',
      body: 'O governo federal homologou nesta semana o novo pacote de investimentos voltado ao transporte coletivo sustentável. O programa abrange obras de expansão de corredores exclusivos de BRT, integração tarifária inteligente e instalação de pontos de recarga ultrarrápida em terminais públicos. Estudos técnicos apontam que a eletrificação da frota reduzirá em até 40% a emissão de poluentes nos grandes centros urbanos já nos primeiros dois anos de operação.',
      keyPoints: [
        'R$ 14,8 bilhões em investimentos em 10 capitais brasileiras',
        'Substituição de 4.200 ônibus poluentes por modelos 100% elétricos',
        'Previsão de beneficiar mais de 6 milhões de passageiros diariamente'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80',
      timeAgo: 'há 10 minutos',
      trending: true
    },
    {
      id: 'g-2',
      source: 'Ministério da Saúde / Fiocruz',
      category: 'Saúde Pública & Ciência',
      title: 'Inauguração de complexo biotecnológico amplia produção nacional de vacinas e terapias avançadas',
      subtitle: 'Nova unidade no polo industrial terá capacidade para produzir 100 milhões de doses anuais de imunizantes com tecnologia 100% nacional.',
      body: 'A Fundação Oswaldo Cruz (Fiocruz) concluiu a primeira fase de testes operacionais do novo Centro Integrado de Biotecnologia Médica. A infraestrutura conta com biorreatores modernos capazes de produzir vacinas de RNA mensageiro e tratamentos oncológicos sem depender de insumos importados. A iniciativa visa garantir soberania sanitária e reduzir os custos de aquisição do Sistema Único de Saúde (SUS) em medicamentos de alta complexidade.',
      keyPoints: [
        'Capacidade de 100 milhões de doses de vacinas por ano',
        'Produção própria de insumos sem dependência externa',
        'Abastecimento prioritário da rede pública em todo o território nacional'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1600&q=80',
      timeAgo: 'há 25 minutos',
      trending: false
    },
    {
      id: 'g-3',
      source: 'Globo Notícias',
      category: 'Meio Ambiente & Energia',
      title: 'Cúpula ambiental aprova aporte de US$ 2,8 bilhões para recuperação de bacias hidrográficas e usinas solares',
      subtitle: 'Projetos comunitários no Nordeste e Sudeste receberão recursos para restauração de mananciais e geração de energia limpa descentralizada.',
      body: 'Representantes de 35 países assinaram em Brasília um acordo histórico de cooperação financeira climática. Os recursos serão geridos por bancos de desenvolvimento e aplicados no reflorestamento de margens de rios estratégicos, além da instalação de parques fotovoltaicos em comunidades rurais e cooperativas agrícolas familiares, gerando energia limpa e barata.',
      keyPoints: [
        'US$ 2,8 bilhões liberados por fundos internacionais de cooperação',
        'Recuperação de 85 mil hectares de matas ciliares e bacias fluviais',
        'Energia solar para mais de 180 mil famílias rurais de baixa renda'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1600&q=80',
      timeAgo: 'há 45 minutos',
      trending: false
    }
  ],

  tecnologia: [
    {
      id: 't-1',
      source: 'Tech Radar & Inovação',
      category: 'Inteligência Artificial',
      title: 'Hospitais começam a utilizar IA clínica para diagnóstico precoce de doenças com 98% de precisão',
      subtitle: 'Modelos neurais treinados com milhões de tomografias auxiliam médicos no diagnóstico rápido de anomalias vasculares e pulmonares.',
      body: 'Uma rede com mais de trinta hospitais universitários no Brasil passou a integrar algoritmos avançados de visão computacional em suas centrais de imagem. O sistema analisa exames de raio-X e ressonância magnética em menos de 40 segundos, alertando os especialistas sobre pequenas lesões imperceptíveis a olho nu. Os primeiros resultados demonstram queda de 65% no tempo de espera entre a triagem e o início do tratamento.',
      keyPoints: [
        'Resultados e triagem analisados em menos de 40 segundos',
        'Precisão clínica aferida de 98,4% em exames preventivos',
        'Redução média de 65% no tempo de espera do paciente na rede pública'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80',
      timeAgo: 'há 15 minutos',
      trending: true
    },
    {
      id: 't-2',
      source: 'CanalTech',
      category: 'Infraestrutura & Redes',
      title: 'Brasil conclui conexão com novo cabo submarino de fibra óptica de 120 Tbps ligando o país à Europa',
      subtitle: 'Infraestrutura amplia velocidade de conexão internacional em 300% e viabiliza expansão de novos data centers sustentáveis.',
      body: 'Foi concluída a amarração final do consórcio internacional de telecomunicações no litoral de Fortaleza e Santos. A nova rota submarina possui capacidade de tráfego de 120 Terabits por segundo, reduzindo a latência média entre a América do Sul e os centros computacionais europeus para menos de 60 milissegundos. Especialistas destacam que o avanço atrai novos investimentos em nuvem e processamento de alta densidade.',
      keyPoints: [
        'Capacidade recorde de 120 Terabits de dados por segundo',
        'Latência reduzida para menos de 60 milissegundos',
        'Fortalece a infraestrutura nacional para data centers ecológicos'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80',
      timeAgo: 'há 35 minutos',
      trending: false
    },
    {
      id: 't-3',
      source: 'Cyber Security Post',
      category: 'Cibersegurança',
      title: 'Adoção em massa de passkeys e biometria reduz ataques de phishing em 85% no meio corporativo',
      subtitle: 'Grandes organizações aceleram a eliminação definitiva de senhas de texto em favor de chaves criptográficas integradas a celulares.',
      body: 'O relatório anual de segurança digital da Federação de Bancos e Empresas de Tecnologia revelou uma queda histórica em fraudes corporativas com o abandono de senhas tradicionais. A migração para o padrão FIDO2 com reconhecimento facial e impressão digital impediu mais de 1,2 milhão de tentativas de sequestro de dados no último semestre.',
      keyPoints: [
        'Queda de 85% em tentativas bem-sucedidas de phishing e clonagem',
        'Mais de 4 milhões de contas corporativas já operam sem senhas',
        'Autenticação instantânea por biometria e chaves criptográficas'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80',
      timeAgo: 'há 1 hora',
      trending: false
    }
  ],

  economia: [
    {
      id: 'e-1',
      source: 'Valor Econômico',
      category: 'Macroeconomia & Mercado',
      title: 'Índice de inflação desacelera e mercado financeiro projeta novo ciclo de redução nas taxas de juros',
      subtitle: 'Preços de alimentos e energia elétrica recuam no mês, fortalecendo o poder de compra das famílias e a confiança empresarial.',
      body: 'O Instituto Brasileiro de Geografia e Estatística (IBGE) divulgou os indicadores econômicos do período, confirmando deflação no grupo de alimentos básicos e combustíveis. O bom desempenho fiscal e a estabilização do câmbio abrem espaço para novas reduções na taxa Selic, estimulando o crédito para o comércio, compra de imóveis e investimentos em pequenas e médias empresas.',
      keyPoints: [
        'Inflação fecha o mês abaixo das expectativas do mercado',
        'Queda consistente nos preços da cesta básica e energia',
        'Expectativa de aquecimento do comércio e crédito para empresas'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80',
      timeAgo: 'há 20 minutos',
      trending: true
    },
    {
      id: 'e-2',
      source: 'Exame & Negócios',
      category: 'Emprego & Indústria',
      title: 'Setor de energia limpa e tecnologia verde cria mais de 130 mil postos de trabalho no país',
      subtitle: 'Instalação de usinas eólicas no Nordeste e fábricas de painéis solares no Sul e Sudeste impulsionam contratações com carteira assinada.',
      body: 'O Cadastro Geral de Empregados e Desempregados apontou forte saldo positivo de novos postos formais no segmento da economia circular. Técnicos em eletrotécnica, instaladores solares e engenheiros de automação estão entre as profissões mais requisitadas, com salários médios 25% superiores aos da indústria convencional.',
      keyPoints: [
        '130 mil novos empregos com carteira assinada no trimestre',
        'Salários médios no setor 25% superiores à média nacional',
        'Forte expansão no Nordeste, interior de São Paulo e Minas Gerais'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
      timeAgo: 'há 50 minutos',
      trending: false
    }
  ],

  esportes: [
    {
      id: 's-1',
      source: 'Globo Esporte / ESPN',
      category: 'Futebol Continental',
      title: 'Fase eliminatória dos torneios continentais define clássicos com arenas modernizadas e público recorde',
      subtitle: 'Equipes brasileiras garantem vagas nas oitavas de final com futebol ofensivo e média superior a 48 mil torcedores por estádio.',
      body: 'A rodada decisiva dos torneios sul-americanos movimentou as principais arenas do país com partidas de alta intensidade e novos recordes de arrecadação. Clubes investiram em gramados híbridos de padrão europeu e sistemas de reconhecimento facial nos acessos, proporcionando mais segurança e fluidez para as famílias nas arquibancadas.',
      keyPoints: [
        'Média histórica de 48.500 torcedores presentes por partida',
        'Zero incidentes graves registrados nas arenas com biometria facial',
        'Premiação recorde para os clubes classificados à fase seguinte'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80',
      timeAgo: 'há 30 minutos',
      trending: true
    },
    {
      id: 's-2',
      source: 'Comitê Olímpico',
      category: 'Poliesportivo',
      title: 'Ginástica e atletismo brasileiros conquistam sete medalhas e quebram recordes sul-americanos',
      subtitle: 'Delegação nacional brilha na Copa do Mundo em Paris e assegura classificação antecipada para as finais mundiais.',
      body: 'Os atletas brasileiros subiram ao pódio em etapas simultâneas na Europa, com destaque para a prova de salto e o revezamento 4x100 metros. A comissão técnica ressaltou a evolução física e psicológica da equipe, fruto de investimentos contínuos em centros de alto rendimento e fisiologia esportiva de ponta.',
      keyPoints: [
        'Sete medalhas conquistadas (4 ouros, 2 pratas e 1 bronze)',
        'Quebra de dois recordes sul-americanos no atletismo de velocidade',
        'Classificação antecipada garantida para o campeonato mundial'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80',
      timeAgo: 'há 1 hora',
      trending: false
    }
  ]
};

/**
 * Controller de Feed Geral de Notícias
 */
class FeedController {
  /**
   * GET /api/feed/general?category=geral
   */
  static async getGeneralNews(req, res) {
    try {
      const category = (req.query.category || 'geral').toLowerCase().trim();

      // Se for a categoria G1, busca direto do RSS oficial
      if (category === 'g1') {
        const g1Articles = await buscarNoticiasG1();
        if (g1Articles && g1Articles.length > 0) {
          return ResponseView.success(
            res,
            {
              category: 'G1 BRASIL (AO VIVO)',
              total: g1Articles.length,
              lastUpdated: new Date().toISOString(),
              articles: g1Articles
            },
            200,
            'Feed oficial do G1 obtido com sucesso'
          );
        }
      }

      const articles = NEWS_FEEDS[category] || NEWS_FEEDS.geral;

      // Junta com artigos de outras categorias se for "geral" para dar variedade completa
      let combined = [...articles];
      if (category === 'geral') {
        // Tenta incluir as notícias mais recentes do G1 em tempo real
        try {
          const g1Live = await buscarNoticiasG1();
          if (g1Live && g1Live.length > 0) {
            combined = [g1Live[0], g1Live[1], ...combined];
          }
        } catch {
          // fallback para lista local
        }
      }

      return ResponseView.success(
        res,
        {
          category: category.toUpperCase(),
          total: combined.length,
          lastUpdated: new Date().toISOString(),
          articles: combined
        },
        200,
        'Feed de notícias completas e aprofundadas obtido com sucesso'
      );
    } catch (error) {
      console.error('Erro em FeedController.getGeneralNews:', error);
      return ResponseView.error(res, 'Erro ao carregar notícias do feed', 500, error.message);
    }
  }

  /**
   * GET /api/feed/g1
   * Retorna as principais notícias em tempo real diretamente do RSS oficial do G1
   */
  static async getG1News(req, res) {
    try {
      const news = await buscarNoticiasG1();
      return ResponseView.success(
        res,
        {
          source: 'G1 Globo',
          url: 'https://g1.globo.com/dynamo/rss2.xml',
          total: news.length,
          articles: news
        },
        200,
        'Notícias do G1 obtidas com sucesso via RSS'
      );
    } catch (error) {
      console.error('Erro em FeedController.getG1News:', error);
      return ResponseView.error(res, 'Erro ao buscar notícias do G1', 500, error.message);
    }
  }

  /**
   * GET /api/feed/categories
   */
  static getCategories(req, res) {
    return ResponseView.success(
      res,
      [
        { key: 'g1', label: 'G1 Globo (Ao Vivo)', icon: 'newspaper' },
        { key: 'geral', label: 'Geral & Brasil', icon: 'globe' },
        { key: 'tecnologia', label: 'Tecnologia & IA', icon: 'cpu' },
        { key: 'economia', label: 'Economia & Negócios', icon: 'trending-up' },
        { key: 'esportes', label: 'Esportes & Competições', icon: 'trophy' }
      ],
      200,
      'Categorias de feed disponíveis'
    );
  }
}

module.exports = FeedController;
