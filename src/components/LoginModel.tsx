import React from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function LoginModel() {
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [error, setError] = React.useState("");
  const BACKEND_API = import.meta.env.VITE_BACKEND_API
  const navigate = useNavigate();
  

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(""); 
    if (!email || !senha) {
      setError("Email e senha são obrigatórios");
      return;
    }

    try {
      const payload = { email, senha };

      const response = await fetch(`${BACKEND_API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || data.error || "Erro ao fazer login";
        setError(errorMsg);
        console.error("Erro:", errorMsg);
        return;
      }

      Cookies.set('access_token', data.access_token, { expires: 1, secure: false }); 
      
      if (data.refresh_token) {
        Cookies.set('refresh_token', data.refresh_token, { expires: 7, secure: false });
      }
      navigate('/dashboard');
      
    } catch (err: Error | any) {
      setError("Não foi possível conectar ao servidor." + (err.message ? ` Detalhes: ${err.message}` : ""));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
        
        <div className="bg-gray-100 p-4 rounded-xl mb-6">
          <Lock className="w-8 h-8 text-slate-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Sistema de Gerenciamento Prisional
        </h1>
        <p className="text-gray-500 text-sm mb-6 text-center font-medium">
          Acesso restrito a inspetores autorizados
        </p>

        {error && (
          <div className="w-full p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form className="w-full space-y-5" onSubmit={submitForm}>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              required
              value={email} // Conecta ao estado
              onChange={(e) => setEmail(e.target.value)} // Atualiza o estado
              placeholder="inspetor@sistema.gov"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
            <input 
              type="password" 
              required
              value={senha} // Conecta ao estado
              onChange={(e) => setSenha(e.target.value)} // Atualiza o estado
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-600"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#0f172a] text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors mt-2 cursor-pointer"
          >
            Entrar no Sistema
          </button>
        </form>

        <footer className="mt-10 text-gray-400 text-xs text-center font-medium">
          Versão 1.0 - Protótipo de Média Fidelidade
        </footer>
      </div>
    </div>
  );
}