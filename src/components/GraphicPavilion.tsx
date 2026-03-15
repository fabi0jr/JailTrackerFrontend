import { Users } from "lucide-react";
import LoadingModel from "./LoadingModel";

interface PavilionCount {
    _count: { id: number };
    pavilhao: string;
}

interface PavilionParameters {
    pavilions: PavilionCount[];
    countTotal: number
    isLoading: boolean
}

export default function GraphicPavilion({ pavilions, countTotal, isLoading }: PavilionParameters) {
    return (
        isLoading ? <section className="h-[45%] bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                <Users size={18} className="text-gray-400" /> Distribuição de Presos por Pavilhão
            </h2>
            <LoadingModel/>
        </section> : <section className="h-[45%] bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                <Users size={18} className="text-gray-400" /> Distribuição de Presos por Pavilhão
            </h2>
            <div className="flex-1 flex justify-center items-end gap-12 pb-2">
                {pavilions.map((pavilion) => (
                    <div key={pavilion.pavilhao} className="flex flex-col items-center gap-2 w-20 h-full justify-end">
                        <div className="w-full flex-1 flex items-end">
                            <div
                                className="w-full bg-slate-900 rounded-t-lg transition-all duration-700"
                                style={{ height: ((pavilion._count.id / countTotal) * 100).toString() + "%" }}
                            ></div>
                        </div>
                        <span className="text-[11px] font-bold text-gray-600">{pavilion.pavilhao}</span>
                        <span className="text-[10px] text-gray-400">({pavilion._count.id || 0})</span>
                    </div>
                ))}
            </div>
        </section>
    )
}