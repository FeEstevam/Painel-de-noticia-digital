/**
 * View para padronização de respostas JSON da API
 */
class ResponseView {
  /**
   * Resposta de sucesso padronizada
   * @param {import('express').Response} res
   * @param {any} data
   * @param {number} [status=200]
   * @param {string} [message]
   */
  static success(res, data, status = 200, message = null) {
    const payload = {
      success: true
    };

    if (message) payload.message = message;
    if (data !== undefined) payload.data = data;

    return res.status(status).json(payload);
  }

  /**
   * Resposta de erro padronizada
   * @param {import('express').Response} res
   * @param {string} message
   * @param {number} [status=400]
   * @param {any} [details=null]
   */
  static error(res, message, status = 400, details = null) {
    const payload = {
      success: false,
      error: message
    };

    if (details) payload.details = details;

    return res.status(status).json(payload);
  }

  /**
   * Resposta para recurso não encontrado (404)
   * @param {import('express').Response} res
   * @param {string} [resource='Recurso']
   */
  static notFound(res, resource = 'Recurso') {
    return this.error(res, `${resource} não encontrado(a)`, 404);
  }
}

module.exports = ResponseView;

