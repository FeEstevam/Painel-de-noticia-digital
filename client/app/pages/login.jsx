import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Login submetido:", { login, senha });
    alert(`Tentativa de login:\nUsuário: ${login}`);
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-3 sm:p-6">
      {/* Painel de Login Responsivo */}
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-8 shadow-2xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Painel de Acesso</h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">Entre com seu usuário e senha</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Campo de Login */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-neutral-300 block">
              Login
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Digite seu login ou e-mail"
                required
                className="w-full h-11 pl-10 sm:pl-11 pr-4 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Campo de Senha */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-neutral-300 block">
              Senha
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <input
                type={verSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full h-11 pl-10 sm:pl-11 pr-11 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer p-1"
                title={verSenha ? "Ocultar senha" : "Ver senha"}
              >
                {verSenha ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs sm:text-sm transition-all mt-2 cursor-pointer shadow-lg shadow-blue-600/20 active:scale-[0.99]"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
