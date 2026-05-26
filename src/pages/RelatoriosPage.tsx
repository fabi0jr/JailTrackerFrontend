import { FileText, Search } from "lucide-react";
import Header from "../components/Header";
import { useEffect, useState, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import LoadingModel from "../components/LoadingModel";

interface Movimentacao {
    id: number;
    tipo: string;
    descricao: string;
    dataMovimentacao: string;
    prisoner: { nome: string; cpf: string };
    criador: { nome: string };
}

const BADGE: Record<string, string> = {
    TRANSFERENCIA: 'bg-yellow-100 text-yellow-800',
    ENTRADA_SOLITARIA: 'bg-red-100 text-red-800',
};

const BADGE_LABEL: Record<string, string> = {
    TRANSFERENCIA: 'Transferência',
    ENTRADA_SOLITARIA: 'Solitária',
};

export default function RelatoriosPage() {
    const BACKEND_API = import.meta.env.VITE_BACKEND_API;
    const navigate = useNavigate();

    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMovimentacoes = useMemo(() => {
        const termo = searchTerm.toLowerCase();
        return movimentacoes.filter((m) =>
            m.prisoner.nome.toLowerCase().includes(termo) ||
            m.prisoner.cpf.includes(termo)
        );
    }, [movimentacoes, searchTerm]);

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
            if (!refreshToken) { navigate('/'); return null; }

            const refreshRes = await fetch(`${BACKEND_API}/auth/refresh`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${refreshToken}`, 'Content-Type': 'application/json' },
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                Cookies.set('access_token', data.access_token, { expires: 1, path: '/' });
                response = await fetch(`${BACKEND_API}${endpoint}`, {
                    ...options,
                    headers: { 'Authorization': `Bearer ${data.access_token}`, 'Content-Type': 'application/json', ...(options.headers ?? {}) },
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
        apiFetch('/movimentacoes').then((data) => {
            if (data) {
                setMovimentacoes(data);
                setIsLoading(false);
            }
        });
    }, [apiFetch]);

    return (
        <div className="h-screen flex flex-col bg-gray-100 font-sans text-slate-900 overflow-hidden">
            <Header page="registers" />
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-hidden">

                <header className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 shrink-0">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="bg-gray-100 p-3 rounded-xl">
                                <FileText className="text-slate-500" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Relatórios de Movimentações</h1>
                                <p className="text-sm text-gray-500 font-medium">Histórico de transferências e solitária</p>
                            </div>
                        </div>

                        <div className="relative flex-1 max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome ou CPF do preso..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                            />
                        </div>
                    </div>
                </header>

                <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <LoadingModel />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                    <tr>
                                        <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Tipo</th>
                                        <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Preso</th>
                                        <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">CPF</th>
                                        <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Descrição</th>
                                        <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Responsável</th>
                                        <th className="text-left px-6 py-4 font-bold text-gray-500 uppercase text-xs tracking-wide">Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredMovimentacoes.map((m) => (
                                        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${BADGE[m.tipo] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {BADGE_LABEL[m.tipo] ?? m.tipo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">{m.prisoner.nome}</td>
                                            <td className="px-6 py-4 text-gray-500">{m.prisoner.cpf}</td>
                                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{m.descricao}</td>
                                            <td className="px-6 py-4 text-gray-500">{m.criador.nome}</td>
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                {new Date(m.dataMovimentacao).toLocaleDateString('pt-BR')}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredMovimentacoes.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                                                Nenhuma movimentação encontrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
