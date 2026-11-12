/**
 * SSE Service — Gerencia conexões Server-Sent Events
 *
 * Responsabilidades:
 *   - Mantém o Set de clientes conectados (responses HTTP abertas)
 *   - Envia heartbeats a cada 30s para manter a conexão viva em proxies
 *   - Faz broadcast de eventos para todos os clientes conectados
 */

const clients = new Set();

// Heartbeat: envia um comentário SSE (:keepalive) a cada 30s
// para evitar que proxies/firewalls fechem a conexão por inatividade
const HEARTBEAT_MS = 30_000;
const heartbeat = setInterval(() => {
  for (const res of clients) {
    res.write(':keepalive\n\n');
  }
}, HEARTBEAT_MS);

// Evita que o setInterval impeça o processo de encerrar
heartbeat.unref();

const sseService = {
  /**
   * Registra um novo cliente SSE.
   * Deve ser chamado no handler da rota GET /api/news/events
   */
  addClient(req, res) {
    // Headers obrigatórios para SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Desabilita buffering em Nginx
    });

    // Evento inicial confirmando a conexão
    res.write(`event: CONNECTED\ndata: ${JSON.stringify({ message: 'Conexão SSE estabelecida', clients: clients.size + 1 })}\n\n`);

    clients.add(res);
    console.log(`[SSE] Cliente conectado — total: ${clients.size}`);

    // Quando o cliente desconecta (fechou a aba, perdeu Wi-Fi etc.)
    req.on('close', () => {
      clients.delete(res);
      console.log(`[SSE] Cliente desconectado — total: ${clients.size}`);
    });
  },

  /**
   * Envia um evento para TODOS os clientes conectados.
   * @param {string} eventType — nome do evento (ex: NEWS_CREATED)
   * @param {*} data — payload serializado em JSON
   */
  broadcast(eventType, data) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const res of clients) {
      res.write(payload);
    }

    if (clients.size > 0) {
      console.log(`[SSE] Broadcast "${eventType}" para ${clients.size} cliente(s)`);
    }
  },

  /**
   * Retorna a quantidade de clientes conectados no momento.
   */
  getClientCount() {
    return clients.size;
  }
};

module.exports = sseService;

