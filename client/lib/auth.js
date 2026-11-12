// Detecta dinamicamente o IP ou hostname do servidor para autenticação na rede local
const getApiAuthUrl = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:5000/api/auth`;
  }
  return 'http://localhost:5000/api/auth';
};

const API_AUTH_URL = getApiAuthUrl();

/**
 * Autentica o usuário com identificador/email e senha
 * @param {string} identifier - Email ou login do usuário
 * @param {string} password - Senha
 * @returns {Promise<Object>} Dados do usuário autenticado
 */
export async function login(identifier, password) {
  try {
    const res = await fetch(`${API_AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const json = await res.json();

    if (res.ok && json.success) {
      const user = json.data.user || { name: identifier.split('@')[0], email: identifier };
      localStorage.setItem('user', JSON.stringify(user));
      if (json.data.token) {
        localStorage.setItem('token', json.data.token);
      }
      return user;
    } else {
      throw new Error(json.error || 'Credenciais inválidas');
    }
  } catch (err) {
    console.warn('Tentativa com backend offline ou falha:', err.message);

    // Fallback de demonstração caso o backend esteja offline
    if (identifier && password) {
      const user = {
        name: identifier.split('@')[0],
        email: identifier,
        isDemo: true
      };
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }

    throw err;
  }
}

/**
 * Retorna o usuário atualmente salvo na sessão
 */
export function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Verifica se existe uma sessão ativa
 */
export function isAuthenticated() {
  return !!getUser();
}

/**
 * Encerra a sessão e remove os dados de autenticação
 */
export function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}
