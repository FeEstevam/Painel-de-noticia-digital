import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, ArrowLeft, AlertCircle, Sparkles, KeyRound } from "lucide-react";
import { login as authLogin, isAuthenticated } from "../../lib/auth";

export default function Login() {
  const navigate = useNavigate();

  // Dados mockados pré-preenchidos por padrão para facilitar o teste
  const [identificador, setIdentificador] = useState("admin@painel.com");
  const [senha, setSenha] = useState("admin123");
  const [verSenha, setVerSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Se já estiver logado, redireciona diretamente para o painel de gerenciamento
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/painel", { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      await authLogin(identificador, senha);
      navigate("/painel");
    } catch (err) {
      console.error("Erro no login:", err);
      setErro(err.message || "Credenciais inválidas. Verifique seu usuário e senha.");
    } finally {
      setLoading(false);
    }
  }

  // Preenche rapidamente com a conta mock de demonstração
  function handleFillDemo() {
    setIdentificador("admin@painel.com");
    setSenha("admin123");
    setErro("");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden font-sans">
      {/* Luzes de Fundo Decorativas */}
      <div className="fixed top-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-indigo-600/15 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-purple-600/15 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      {/* Cartão de Login Responsivo */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Botão de Retorno à Página Index */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Modo Exibição</span>
        </button>

        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center shadow-lg shadow-indigo-500/25 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Painel de Acesso</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Entre com suas credenciais para gerenciar notícias
          </p>
        </div>

        {/* Caixa com Dados Mockados de Demonstração */}
        <div className="mb-5 p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Acesso Demo / Mock</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-200 underline cursor-pointer"
            >
              Preencher dados
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Usuário:</span>
              <strong className="text-indigo-200 font-mono text-[11px]">admin@painel.com</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Senha:</span>
              <strong className="text-indigo-200 font-mono text-[11px]">admin123</strong>
            </div>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="mb-5 flex items-center gap-2 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Campo de Login / Identificador */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-300 block">
              Usuário ou E-mail
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Ex: admin@painel.com"
                required
                className="w-full h-11 pl-10 sm:pl-11 pr-4 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors font-medium"
              />
            </div>
          </div>

          {/* Campo de Senha */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-300 block">
              Senha
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <input
                type={verSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full h-11 pl-10 sm:pl-11 pr-11 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors font-medium"
              />
              <button
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer p-1"
                title={verSenha ? "Ocultar senha" : "Ver senha"}
              >
                {verSenha ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl text-xs sm:text-sm transition-all mt-2 cursor-pointer shadow-lg shadow-indigo-600/25 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Autenticando..." : "Entrar no Painel"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
          <p className="text-[11px] text-slate-500">
            Acesso exclusivo para administradores e operadores do mural digital.
          </p>
        </div>
      </div>
    </div>
  );
}
