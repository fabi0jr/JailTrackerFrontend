import { ShieldAlert } from "lucide-react";
import LoadingModel from "./LoadingModel";

interface PrisonersInConfinament {
    nome: string;
    cela: string;
    cpf: string;
    dataFimSolitaria: string
}

interface ListPrisoners {
    listPrisoners: PrisonersInConfinament[];
    isLoading: boolean
}

export default function ListPrisonersInConfinament({ listPrisoners, isLoading }: ListPrisoners) {

    return (
        isLoading ? <section className="col-span-6 bg-white rounded-2xl shadow-sm border border-blue-100 p-5 flex flex-col overflow-hidden ring-1 ring-blue-50">
            <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="text-blue-500" size={18} />
                <h2 className="font-bold text-base">Presos em Solitária</h2>
            </div>
            <LoadingModel/>
        </section> : <section className="col-span-6 bg-white rounded-2xl shadow-sm border border-blue-100 p-5 flex flex-col overflow-hidden ring-1 ring-blue-50">
            <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="text-blue-500" size={18} />
                <h2 className="font-bold text-base">Presos em Solitária</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {listPrisoners.map((p, i) => (
                    <div key={i} className="bg-gray-100/50 rounded-xl p-3 flex justify-between items-center text-sm">
                        <div>
                            <h3 className="font-bold text-slate-800">{p.nome}</h3>
                            <p className="text-[10px] text-gray-500">Cela: {p.cela} - {p.cpf}</p>
                            <p className="text-[10px] text-gray-500">Data de saída: {new Date(p.dataFimSolitaria).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <span className="bg-black text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase">Solitária</span>
                    </div>
                ))}
            </div>
        </section>
    );
}