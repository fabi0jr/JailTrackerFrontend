import { BookOpen } from "lucide-react";
import LoadingModel from "./LoadingModel";

interface Visit {
    id: number;
    dataVisita: string;
    visitor: { nome: string };
    prisoner: { nome: string };
}

interface Visits {
    visits: Visit[];
    isLoading: boolean;
}

export default function ListVisitsModel({ visits, isLoading }: Visits) {
    return (
        isLoading ? <section className="col-span-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
                <BookOpen className="text-gray-400" size={18} />
                <h2 className="font-bold text-base">Visitas de Hoje</h2>
            </div>
            <LoadingModel />
        </section> : <section className="col-span-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
                <BookOpen className="text-gray-400" size={18} />
                <h2 className="font-bold text-base">Visitas de Hoje</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {visits.map((visit) => (
                    <div key={visit.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-sm text-slate-800">{visit.prisoner.nome}</h3>
                            <p className="text-[11px] text-gray-400 italic">Visitante: {visit.visitor.nome}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-1">
                                {new Date(visit.dataVisita).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <span className="bg-black text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase">Familiar</span>
                    </div>
                ))}
            </div>
        </section>
    )
}