import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginModel() {
  const navigate = useNavigate();
  function submitForm(event: React.FormEvent){
    event.preventDefault();
    //Logica de autenticação 
    navigate("/dashboard")
  }
  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Card Principal */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
        
        {/* Ícone de Cadeado */}
        <div className="bg-gray-100 p-4 rounded-xl mb-6">
          <Lock className="w-8 h-8 text-slate-500" />
        </div>

        {/* Títulos */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Sistema de Gerenciamento Prisional
        </h1>
        <p className="text-gray-500 text-sm mb-8 text-center font-medium">
          Acesso restrito a inspetores autorizados
        </p>

        {/* Formulário */}
        <form className="w-full space-y-5" onSubmit={submitForm}>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email
            </label>
            <input 
              type="email" 
              placeholder="inspetor@sistema.gov"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Senha
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-600"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#0f172a] text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors mt-2"
          >
            Entrar no Sistema
          </button>
        </form>

        {/* Footer */}
        <footer className="mt-10 text-gray-400 text-xs text-center font-medium">
          Versão 1.0 - Protótipo de Média Fidelidade
        </footer>
      </div>
    </div>
  );
}