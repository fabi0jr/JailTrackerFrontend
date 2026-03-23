import { PlusCircle, Search, Trash2, UserPlus, Users } from "lucide-react";
import Header from "../components/Header";
import { useState } from "react";

//TIPAGEM DOS DADOS MOCKADOS:
interface Prisoner {
    id: number;
    nome: string;
    nomeMae: string;
    cpf: string;
    delito: string;
    reincidencia: boolean;
    dataNasc: string;
    pavilhao: string;
    cela: string;
    foto: string;
    confinament: boolean
}

export default function RegisterPrisoner() {

    //DADOS MOCKADOS:
    const [prisoners] = useState<Prisoner[]>([
        { id: 1, nome: "Fabio Junior", nomeMae: "Maria Silva", cpf: "911.304.320-09", delito: "Roubo", reincidencia: true, dataNasc: "01/01/1990", pavilhao: "A", cela: "Cela 1", foto: "https://randomuser.me/api/portraits/men/32.jpg", confinament: true },
        { id: 2, nome: "Abinadabe Fontenele Sodre", nomeMae: "Ana Sodre", cpf: "123.456.789-10", delito: "Homicídio", reincidencia: false, dataNasc: "15/05/1985", pavilhao: "A", cela: "Solitária", foto: "https://randomuser.me/api/portraits/men/85.jpg", confinament: false },
        { id: 3, nome: "Kevin Marques", nomeMae: "Clara Marques", cpf: "348.678.901-22", delito: "Tráfico", reincidencia: true, dataNasc: "20/10/1995", pavilhao: "B", cela: "Cela 3", foto: "https://randomuser.me/api/portraits/men/22.jpg", confinament: false },
        { id: 4, nome: "Marcos Vinicius", nomeMae: "Beatriz Santos", cpf: "555.666.777-88", delito: "Furto", reincidencia: false, dataNasc: "05/12/1998", pavilhao: "C", cela: "Cela 12", foto: "https://randomuser.me/api/portraits/men/55.jpg", confinament: false },
    ]);


    return (
        <div className="h-screen flex flex-col bg-gray-100 font-sans text-slate-900 overflow-hidden">
            <Header page="registerPrisorners" />
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-hidden">

                <header className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 shrink-0">
                    <div className="flex items-center justify-between mb-6 gap-6">
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="bg-gray-100 p-3 rounded-xl">
                                <UserPlus className="text-slate-500" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Cadastro de Presos</h1>
                                <p className="text-sm text-gray-500 font-medium whitespace-nowrap">Gerencie o sistema prisional</p>
                            </div>
                        </div>

                        <div className="relative flex-1 max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome ou CPF..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                            />
                        </div>

                        <button className="flex items-center gap-2 bg-[#0f172a] text-white font-bold px-5 py-3 rounded-lg hover:bg-slate-800 transition-colors shrink-0">
                            <PlusCircle size={18} />
                            <span className="whitespace-nowrap">Cadastrar Novo Preso</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">

                        <select className="bg-white px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300">
                            <option>Filtrar por Pavilhão</option>
                            <option>Pavilhão A</option>
                            <option>Pavilhão B</option>
                        </select>
                    </div>
                </header>

                <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col overflow-hidden">
                    <h2 className="font-bold text-lg mb-6 flex items-center gap-2 shrink-0">
                        <Users size={20} className="text-gray-400" /> Lista de Presos Cadastrados
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {prisoners.map((p) => (
                            <div key={p.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex items-center justify-between transition-colors hover:border-gray-200 hover:bg-white group">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={p.foto}
                                        alt={p.nome}
                                        className="w-14 h-14 rounded-full border-2 border-white ring-2 ring-gray-100 shadow-inner object-cover shrink-0"
                                    />

                                    <div>
                                        <h3 className="font-bold text-base text-slate-800">{p.nome}</h3>
                                        <p className="text-xs text-gray-400 font-medium">CPF: {p.cpf}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10 text-right">
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                                        <p className="font-medium text-gray-600">Pavilhão: <span className="font-bold text-slate-900">{p.pavilhao}</span></p>
                                        <p className="font-medium text-gray-600">Cela: <span className="font-bold text-slate-900">{p.cela}</span></p>
                                        <p className="font-medium text-gray-600">Delito: <span className="font-bold text-red-600">{p.delito}</span></p>
                                        <p className="font-medium text-gray-600">Situação: <span className="font-bold text-red-600">{p.confinament ? "Solitária" : "Normal"}</span></p>
                                    </div>

                                    <button className="hover:bg-gray-200 cursor-pointer px-3 py-2 rounded-2xl">
                                        <div className="flex gap-2">
                                            <Search className="text-black" size={18} />
                                            <div>Ver detalhes</div>
                                        </div>
                                    </button>


                                    <button className="text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-red-600 transition-all p-2 rounded-lg hover:bg-red-50">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}