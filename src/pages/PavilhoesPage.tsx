import { Building2 } from "lucide-react";
import Header from "../components/Header";
import { useEffect, useState, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import LoadingModel from "../components/LoadingModel";

interface Prisoner {
    id: number;
    nome: string;
    cela: string;
    pavilhao: string;
    naSolitaria: boolean;
}

export default function PavilhoesPage() {
    const BACKEND_API = import.meta.env.VITE_BACKEND_API;
    const navigate = useNavigate();

    const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const pavilhoes = useMemo(() => {
        const groups: Record<string, Prisoner[]> = {};
        prisoners.forEach((p) => {
            if (!groups[p.pavilhao]) groups[p.pavilhao] = [];
            groups[p.pavilhao].push(p);
        });
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [prisoners]);

    const apiFetch = useCallback(async (endpoint: string) => {
        const token = Cookies.get('access_token');

        let response = await fetch(`${BACKEND_API}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
                    headers: { 'Authorization': `Bearer ${data.access_token}`, 'Content-Type': 'application/json' },
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
                setIsLoading(false);
            }
        });
    }, [apiFetch]);

    return (
        <div className="h-screen flex flex-col bg-gray-100 font-sans text-slate-900 overflow-hidden">
            <Header page="pavilion" />
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-hidden">

                <header className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-3 rounded-xl">
                                <Building2 className="text-slate-500" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Pavilhões</h1>
                                <p className="text-sm text-gray-500 font-medium">Visão geral dos presos por pavilhão</p>
                            </div>
                        </div>
                        {!isLoading && (
                            <div className="bg-[#0f172a] text-white text-sm font-bold px-4 py-2 rounded-lg">
                                {pavilhoes.length} {pavilhoes.length === 1 ? 'pavilhão' : 'pavilhões'} · {prisoners.length} {prisoners.length === 1 ? 'preso' : 'presos'}
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <LoadingModel />
                        </div>
                    ) : pavilhoes.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            Nenhum preso cadastrado.
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-6 pb-6">
                            {pavilhoes.map(([nome, presos]) => (
                                <div key={nome} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-[#0f172a] px-5 py-4 flex items-center justify-between">
                                        <span className="text-white font-bold text-base">{nome}</span>
                                        <span className="bg-white text-[#0f172a] text-xs font-bold px-3 py-1 rounded-full">
                                            {presos.length} {presos.length === 1 ? 'preso' : 'presos'}
                                        </span>
                                    </div>
                                    <div className="p-3 flex flex-col gap-2">
                                        {presos.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{p.nome}</p>
                                                    <p className="text-xs text-gray-400">Cela {p.cela}</p>
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.naSolitaria ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {p.naSolitaria ? 'Solitária' : 'Normal'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
