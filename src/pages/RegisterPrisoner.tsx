import { PlusCircle, Search, Trash2, UserPlus, Users } from "lucide-react";
import Header from "../components/Header";
import { useEffect, useState, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import LoadingModel from "../components/LoadingModel";
import RegisterPrisonerModal from "../components/RegisterPrisonerModal";
import PrisonerEditModal from "../components/PrisonerEditModal";
import ConfirmModal from "../components/ConfirmModal";

interface Prisoner {
    id: number;
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

export default function RegisterPrisoner() {
    const BACKEND_API = import.meta.env.VITE_BACKEND_API;
    const navigate = useNavigate();

    const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
    const [isLoadingPrisoners, setIsLoadingPrisoners] = useState(true);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isOpenModalDetailPrisoner, setIsOpenModalDetailPrisoner] = useState(false);
    const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPavilhao, setSelectedPavilhao] = useState('');
    const [prisonerToDelete, setPrisonerToDelete] = useState<Prisoner | null>(null);

    const pavilhoesUnicos = useMemo(() => {
        return Array.from(new Set(prisoners.map((p) => p.pavilhao))).sort();
    }, [prisoners]);

    const filteredPrisoners = useMemo(() => {
        return prisoners.filter((p) => {
            const termoBusca = searchTerm.toLowerCase();
            const bateNome = p.nome.toLowerCase().includes(termoBusca);
            const bateCpf = p.cpf.includes(termoBusca);
            const batePavilhao = selectedPavilhao === '' || p.pavilhao === selectedPavilhao;
            return (bateNome || bateCpf) && batePavilhao;
        });
    }, [prisoners, searchTerm, selectedPavilhao]);

    const apiFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        const token = Cookies.get('access_token');

        let response = await fetch(`${BACKEND_API}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...(options.headers ?? {}),
            },
        });

        if (response.status === 401) {
            const refreshToken = Cookies.get('refresh_token');
            if (!refreshToken) {
                navigate('/');
                return null;
            }

            const refreshRes = await fetch(`${BACKEND_API}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${refreshToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                Cookies.set('access_token', data.access_token, { expires: 1, path: '/' });

                response = await fetch(`${BACKEND_API}${endpoint}`, {
                    ...options,
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`,
                        'Content-Type': 'application/json',
                        ...(options.headers ?? {}),
                    },
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
        apiFetch('/prisoners').then((data) => {
            if (data) {
                setPrisoners(data);
                setIsLoadingPrisoners(false);
            }
        });
    }, [apiFetch]);

    const handleDelete = async () => {
        if (!prisonerToDelete) return;

        const result = await apiFetch(`/prisoners/${prisonerToDelete.id}`, {
            method: 'DELETE',
        });

        if (result !== null) {
            setPrisoners((prev) => prev.filter((p) => p.id !== prisonerToDelete.id));
        }

        setPrisonerToDelete(null);
    };

    return (
        <>
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
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                />
                            </div>

                            <button onClick={() => setIsOpenModal(true)} className="flex items-center gap-2 bg-[#0f172a] text-white font-bold px-5 py-3 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer">
                                <PlusCircle size={18} />
                                <span className="whitespace-nowrap">Cadastrar Novo Preso</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={selectedPavilhao}
                                onChange={(e) => setSelectedPavilhao(e.target.value)}
                                className="bg-white px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300"
                            >
                                <option value="">Filtrar por Pavilhão</option>
                                {pavilhoesUnicos.map((pav) => (
                                    <option key={pav} value={pav}>{pav}</option>
                                ))}
                            </select>
                        </div>
                    </header>

                    <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col overflow-hidden">
                        <h2 className="font-bold text-lg mb-6 flex items-center gap-2 shrink-0">
                            <Users size={20} className="text-gray-400" /> Lista de Presos Cadastrados
                        </h2>

                        {isLoadingPrisoners ? (
                            <LoadingModel />
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {filteredPrisoners.map((p) => (
                                    <div key={p.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex items-center justify-between transition-colors hover:border-gray-200 hover:bg-white group">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={p.foto != null ? p.foto : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShg8keaWuTWemET3-1mWqZae05N8W6SLGgGg&s"}
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
                                                <p className="font-medium text-gray-600">Situação: <span className="font-bold text-red-600">{p.naSolitaria ? "Solitária" : "Normal"}</span></p>
                                            </div>

                                            <button className="hover:bg-gray-200 cursor-pointer px-3 py-2 rounded-2xl" onClick={() => {
                                                setSelectedPrisoner(p);
                                                setIsOpenModalDetailPrisoner(true);
                                            }}>
                                                <div className="flex gap-2">
                                                    <Search className="text-black" size={18} />
                                                    <div>Ver detalhes</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setPrisonerToDelete(p)}
                                                className="text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-red-600 transition-all p-2 rounded-lg hover:bg-red-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>

            {isOpenModalDetailPrisoner && selectedPrisoner != null && (
                <PrisonerEditModal
                    prisoner={selectedPrisoner}
                    onClose={() => setIsOpenModalDetailPrisoner(false)}
                    onUpdated={(updated) => {
                        setPrisoners((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p));
                        setSelectedPrisoner(updated);
                    }}
                />
            )}
            {isOpenModal && (
                <RegisterPrisonerModal
                    onClose={() => setIsOpenModal(false)}
                    onCreated={(prisoner) => {
                        setPrisoners((prev) => [prisoner, ...prev]);
                        setIsOpenModal(false);
                    }}
                />
            )}
            {prisonerToDelete && (
                <ConfirmModal
                    message={`Tem certeza que deseja excluir ${prisonerToDelete.nome}? Esta ação não pode ser desfeita.`}
                    onConfirm={handleDelete}
                    onCancel={() => setPrisonerToDelete(null)}
                />
            )}
        </>
    );
}
