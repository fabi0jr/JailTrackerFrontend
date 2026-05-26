import { X, ShieldAlert, User, FileText } from 'lucide-react';
import { useEffect } from 'react';

interface Prisoner {
  nome: string;
  estadoCivil: string;
  nomePai: string;
  nomeMae: string;
  cpf: string;
  delito: string;
  reicidencia: boolean;
  dataNasc: string;
  pavilhao: string;
  cela: string;
  foto: string | null;
  naSolitaria: boolean;
  dataFimSolitaria: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  prisoner: Prisoner;
  onClose: () => void;
}

export default function PrisonerDetailsModal({ prisoner, onClose }: Props) {
  
  // Bloqueia o scroll do fundo ao abrir o modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    // Fundo (Overlay) - Ocupa 100% da tela sem travas de altura
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
      
      {/* Modal - Ajustado para ser responsivo e ter scroll interno */}
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 cursor-pointer">
          <X size={24} className="text-gray-400" />
        </button>

        {/* Div com Scroll Interno (O segredo para notebooks) */}
        <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
          
          {/* Cabeçalho: Foto e Info Principal */}
          <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
            <div className="relative shrink-0 mx-auto md:mx-0">
              <img 
                src={prisoner.foto || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShg8keaWuTWemET3-1mWqZae05N8W6SLGgGg&s"} 
                alt={prisoner.nome}
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-lg border-4 border-white"
              />
              {prisoner.naSolitaria && (
                <div className="absolute -bottom-3 -right-3 bg-red-600 text-white p-2 rounded-lg shadow-xl">
                  <ShieldAlert size={20} />
                </div>
              )}
            </div>

            <div className="flex-1 pt-2 text-center md:text-left w-full">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-1">{prisoner.nome}</h2>
              <p className="text-gray-500 font-bold text-lg">CPF: {prisoner.cpf}</p>
              
              <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${prisoner.naSolitaria ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                {prisoner.naSolitaria ? "Em Solitária" : "Regime Normal"}
              </div>
            </div>
          </div>

          {/* Grid de Dados Pessoais */}
          <div className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 border-b pb-2">Dados Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-y-8 gap-x-12 bg-gray-50/50 p-6 md:p-8 rounded-3xl border border-gray-100">
              <DataField label="Idade" value="22 Anos" />
              <DataField label="Estado Civil" value={prisoner.estadoCivil} />
              
              <DataField 
                label="Data de Nascimento" 
                value={new Date(prisoner.dataNasc).toLocaleDateString('pt-BR')} 
              />
              
              <DataField 
                label="Pavilhão e Cela" 
                value={`${prisoner.pavilhao} - ${prisoner.cela}`} 
                highlight 
              />

              <div className="col-span-1 md:col-span-2 space-y-4">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Filiação</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <p className="text-sm font-bold text-slate-800">Mãe: <span className="font-medium text-gray-600">{prisoner.nomeMae}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <p className="text-sm font-bold text-slate-800">Pai: <span className="font-medium text-gray-600">{prisoner.nomePai}</span></p>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Histórico</p>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-red-500" />
                    <p className="text-sm font-bold text-slate-800">Delito: <span className="font-medium text-red-600">{prisoner.delito}</span></p>
                  </div>
                  {prisoner.reicidencia && (
                    <span className="w-fit text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-black uppercase">Reincidente</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Datas de Sistema */}
          <div className="mt-10 flex flex-col md:flex-row justify-between gap-2 text-[10px] font-medium text-gray-400 uppercase tracking-widest border-t pt-4">
            <span>Registrado em: {new Date(prisoner.createdAt).toLocaleDateString('pt-BR')}</span>
            <span>Última atualização: {new Date(prisoner.updatedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataField({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</p>
      <p className={`text-sm font-black ${highlight ? 'text-slate-900 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm inline-block' : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  );
}