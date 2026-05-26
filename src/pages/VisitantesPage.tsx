import { Calendar, PlusCircle, Search, Trash2, UserCheck } from "lucide-react";
import Header from "../components/Header";
import { useEffect, useState, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import LoadingModel from "../components/LoadingModel";
import ConfirmModal from "../components/ConfirmModal";
import RegisterVisitorModal from "../components/RegisterVisitorModal";
import AgendarVisitaModal from "../components/AgendarVisitaModal";
import VisitorDetailModal from "../components/VisitorDetailModal";

interface Visitor {
    id: number;
    nome: string;
    cpf: string;
    telefone: string;
    criadorId: number;
    createdAt: string;
    updatedAt: string;
}

interface Visit {
    id: number;
    dataVisita: string;
    horaEntrada: string;
    horaSaida: string;
    status: boolean;
    visitorId: number;
    prisonerId: number;
    visitor: { nome: string };
    prisoner: { nome: string };
}

type Tab = 'visitantes' | 'visitas';

export default function VisitantesPage() {
    const BACKEND_API = import.meta.env.VITE_BACKEND_API;
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<Tab>('visitantes');

    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [isLoadingVisitors, setIsLoadingVisitors] = useState(true);
    const [visitorSearchTerm, setVisitorSearchTerm] = useState('');
    const [isOpenRegisterModal, setIsOpenRegisterModal] = useState(false);
    const [selectedVisitorId, setSelectedVisitorId] = useState<number | null>(null);

    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoadingVisits, setIsLoadingVisits] = useState(true);
    const [visitSearchTerm, setVisitSearchTerm] = useState('');
    const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
    const [isOpenAgendarModal, setIsOpenAgendarModal] = useState(false);

    const filteredVisitors = useMemo(() => {
        const termo = visitorSearchTerm.toLowerCase();
        return visitors.filter((v) =>
            v.nome.toLowerCase().includes(termo) || v.cpf.includes(termo)
        );
    }, [visitors, visitorSearchTerm]);

    const filteredVisits = useMemo(() => {
        const termo = visitSearchTerm.toLowerCase();
        return visits.filter((v) =>
            v.visitor.nome.toLowerCase().includes(termo) ||
            v.prisoner.nome.toLowerCase().includes(termo)
        );
    }, [visits, visitSearchTerm]);

    const apiFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        const token = Cookies.get('access_token');

        let response = await fetch(`${BACKEND_API}${endpoint}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...(options.headers ?? {}),
            },
        });

        if (response.status === 401) {
            const refreshToken = Cookies.get('refresh_token');
            if (!refreshToken) { navigate('/'); return null; }

            const refreshRes = await fetch(`${BACKEND_API}/auth/refresh`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${refreshToken}`, 'Content-Type': 'application/json' },
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                Cookies.set('access_token', data.access_token, { expires: 1, path: '/' });
                response = await fetch(`${BACKEND_API}${endpoint}`, {
                    ...options,
                    headers: { Authorization: `Bearer ${data.access_token}`, 'Content-Type': 'application/json', ...(options.headers ?? {}) },
                });
            } else {
                Cookies.remove('access_token', { path: '/' });
                Cookies.remove('refresh_token', { path: '/' });
                navigate('/');
                return null;
            }
        }

        return response.ok ? await response.json() : null;
    }, [BACKEND_API, navigate]);

    useEffect(() => {
        apiFetch('/visitors').then((data) => {
            if (data) setVisitors(data);
            setIsLoadingVisitors(false);
        });
        apiFetch('/visits').then((data) => {
            if (data) setVisits(data);
            setIsLoadingVisits(false);
        });
    }, [apiFetch]);

    const handleDeleteVisit = async () => {
        if (!visitToDelete) return;
        const result = await apiFetch(`/visits/${visitToDelete.id}`, { method: 'DELETE' });
        if (result !== null) {
            setVisits((prev) => prev.filter((v) => v.id !== visitToDelete.id));
        }
        setVisitToDelete(null);
    };

    return (
        <>
            <div className="h-screen flex flex-col bg-gray-100 font-sans text-slate-900 overflow-hidden">
                <Header page="visitors" />
                <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-hidden">

                    <header className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 shrink-0">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="bg-gray-100 p-3 rounded-xl">
                                    <UserCheck className="text-slate-500" size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Visitantes & Visitas</h1>
                                    <p className="text-sm text-gray-500 font-medium">Gerencie visitantes e agendamentos</p>
                                </div>
                            </div>

                            <div className="relative flex-1 max-w-xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={activeTab === 'visitantes' ? 'Pesquisar por nome ou CPF...' : 'Pesquisar por visitante ou preso...'}
                                    value={activeTab === 'visitantes' ? visitorSearchTerm : visitSearchTerm}
                                    onChange={(e) => activeTab === 'visitantes' ? setVisitorSearchTerm(e.target.value) : setVisitSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                />
                            </div>

                            {activeTab === 'visitantes' ? (
                                <button
                                    onClick={() => setIsOpenRegisterModal(true)}
                                    className="flex items-center gap-2 bg-[#0f172a] text-white font-bold px-5 py-3 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                                >
                                    <PlusCircle size={18} />
                                    <span className="whitespace-nowrap">Cadastrar Visitante</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsOpenAgendarModal(true)}
                                    className="flex items-center gap-2 bg-[#0f172a] text-white font-bold px-5 py-3 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                                >
                                    <Calendar size={18} />
                                    <span className="whitespace-nowrap">Agendar Visita</span>
                                </button>
                            )}
                        </div>
                    </header>

                    <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                        <div className="flex border-b border-gray-100 shrink-0">
                            <button
                                onClick={() => setActiveTab('visitantes')}
                                className={`px-6 py-4 text-sm font-bold transition-colors cursor-pointer border-b-2 ${activeTab === 'visitantes' ? 'border-slate-900 text-slate-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <UserCheck size={15} /> Visitantes
                                    {!isLoadingVisitors && (
                                        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{visitors.length}</span>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('visitas')}
                                className={`px-6 py-4 text-sm font-bold transition-colors cursor-pointer border-b-2 ${activeTab === 'visitas' ? 'border-slate-900 text-slate-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar size={15} /> Visitas
                                    {!isLoadingVisits && (
                                        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{visits.length}</span>
                                    )}
                                </div>
                            </button>
                        </div>

                        {activeTab === 'visitantes' && (
                            isLoadingVisitors ? (
                                <div className="flex-1 flex items-center justify-center"><LoadingModel /></div>
                            ) : (
                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                            <tr>
                                                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Nome</th>
                                                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">CPF</th>
                                                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Telefone</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredVisitors.map((v) => (
                                                <tr
                                                    key={v.id}
                                                    onClick={() => setSelectedVisitorId(v.id)}
                                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-4 font-medium text-slate-800">{v.nome}</td>
                                                    <td className="px-6 py-4 text-gray-500">{v.cpf}</td>
                                                    <td className="px-6 py-4 text-gray-500">{v.telefone}</td>
                                                </tr>
                                            ))}
                                            {filteredVisitors.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm">
                                                        Nenhum visitante encontrado.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}

                        {activeTab === 'visitas' && (
                            isLoadingVisits ? (
                                <div className="flex-1 flex items-center justify-center"><LoadingModel /></div>
                            ) : (
                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                            <tr>
                                                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Visitante</th>
                                                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Preso</th>
                                                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Data</th>
                                                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Entrada</th>
                                                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Saída</th>
                                                <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Status</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredVisits.map((v) => (
                                                <tr key={v.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4 font-medium text-slate-800">{v.visitor.nome}</td>
                                                    <td className="px-6 py-4 text-gray-600">{v.prisoner.nome}</td>
                                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                        {new Date(v.dataVisita).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">{v.horaEntrada}</td>
                                                    <td className="px-6 py-4 text-gray-500">{v.horaSaida}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${v.status ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                                            {v.status ? 'Encerrada' : 'Ativa'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => setVisitToDelete(v)}
                                                            className="text-gray-300 group-hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredVisits.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                                                        Nenhuma visita encontrada.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                    </section>
                </main>
            </div>

            {isOpenRegisterModal && (
                <RegisterVisitorModal
                    backendApi={BACKEND_API}
                    onClose={() => setIsOpenRegisterModal(false)}
                    onCreated={(visitor) => {
                        setVisitors((prev) => [...prev, visitor]);
                        setIsOpenRegisterModal(false);
                        setSelectedVisitorId(visitor.id);
                    }}
                />
            )}

            {selectedVisitorId !== null && (
                <VisitorDetailModal
                    visitorId={selectedVisitorId}
                    backendApi={BACKEND_API}
                    onClose={() => setSelectedVisitorId(null)}
                    onDeleted={(id) => {
                        setVisitors((prev) => prev.filter((v) => v.id !== id));
                        setSelectedVisitorId(null);
                    }}
                    onUpdated={(updated) => {
                        setVisitors((prev) => prev.map((v) => v.id === updated.id ? { ...v, ...updated } : v));
                    }}
                />
            )}

            {isOpenAgendarModal && (
                <AgendarVisitaModal
                    backendApi={BACKEND_API}
                    onClose={() => setIsOpenAgendarModal(false)}
                    onCreated={(visit) => setVisits((prev) => [visit, ...prev])}
                />
            )}

            {visitToDelete && (
                <ConfirmModal
                    message={`Tem certeza que deseja excluir a visita de ${visitToDelete.visitor.nome} para ${visitToDelete.prisoner.nome}?`}
                    onConfirm={handleDeleteVisit}
                    onCancel={() => setVisitToDelete(null)}
                />
            )}
        </>
    );
}
