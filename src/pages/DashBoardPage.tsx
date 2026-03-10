import { useEffect, useState } from 'react';
import { LogOut, Users, BookOpen, FileText, UserPlus, Home, ShieldAlert, Calendar } from 'lucide-react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

import logo from "../assets/logojail.png";

interface Visit {
    id: number;
    dataVisita: string;
    visitor: { nome: string };
    prisoner: { nome: string };
}

interface Prisoner {
    id: number;
    nome: string;
    pavilhao: string;
}

export default function Dashboard() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
    const BACKEND_API = import.meta.env.VITE_BACKEND_API || "https://jailtracker-backend-dev.onrender.com";
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWithRefresh = async (endpoint: string) => {
            let token = Cookies.get('access_token');

            let response = await fetch(`${BACKEND_API}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                console.log(`Token expirado ao acessar ${endpoint}. Tentando refresh...`);

                const refreshToken = Cookies.get('refresh_token');
                if (!refreshToken) throw new Error("Sem refresh token disponível");

                const refreshRes = await fetch(`${BACKEND_API}/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${refreshToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();

                    const newToken = data.access_token;

                    Cookies.set('access_token', newToken, { expires: 1, path: '/' });

                    response = await fetch(`${BACKEND_API}${endpoint}`, {
                        headers: { 'Authorization': `Bearer ${newToken}` }
                    });
                } else {
                    console.error("Refresh token expirado. Redirecionando para login.");
                    Cookies.remove('access_token', { path: '/' });
                    Cookies.remove('refresh_token', { path: '/' });
                    navigate("/");
                    return null;
                }
            }

            return response.ok ? await response.json() : null;
        };

        const fetchData = async () => {
            try {
                const visitsData = await fetchWithRefresh('/visits');
                if (visitsData) setVisits(visitsData);

                const prisonersData = await fetchWithRefresh('/prisoners');
                if (prisonersData) setPrisoners(prisonersData);
            } catch (error) {
                console.error("Erro crítico na integração:", error);
            }
        };

        fetchData();
    }, [BACKEND_API]);

    const logout = () => {
        Cookies.remove('access_token', { path: '/' });
        Cookies.remove('refresh_token', { path: '/' });
        navigate('/');
    }
    const totalPrisoners = prisoners.length;
    const counts = prisoners.reduce((acc: Record<string, number>, p) => {
        acc[p.pavilhao] = (acc[p.pavilhao] || 0) + 1;
        return acc;
    }, {});

    const pavilions = ["Pavilhão A", "Pavilhão B", "Pavilhão C"];


    const getBarHeight = (name: string) => {
        if (totalPrisoners === 0) return "0%";
        const count = counts[name] || 0;
        return `${(count / totalPrisoners) * 100}%`;
    };
    const solitaryPrisoners = [
        { nome: "Abinadabe Fontenele Sodre", cela: "A - 01", cpf: "123.456.789-10", saida: "05/10/2026" },
        { nome: "Luiz Gonzaga Filho", cela: "A - 02", cpf: "984.561.230-22", saida: "05/10/2026" },
        { nome: "Kevin Marques", cela: "B - 01", cpf: "348.678.901-22", saida: "09/03/2026" },
        { nome: "Abinadabe Fontenele Sodre", cela: "A - 01", cpf: "123.456.789-10", saida: "05/10/2026" },
        { nome: "Luiz Gonzaga Filho", cela: "A - 02", cpf: "984.561.230-22", saida: "05/10/2026" },
        { nome: "Kevin Marques", cela: "B - 01", cpf: "348.678.901-22", saida: "09/03/2026" },
        { nome: "Abinadabe Fontenele Sodre", cela: "A - 01", cpf: "123.456.789-10", saida: "05/10/2026" },
        { nome: "Luiz Gonzaga Filho", cela: "A - 02", cpf: "984.561.230-22", saida: "05/10/2026" },
        { nome: "Kevin Marques", cela: "B - 01", cpf: "348.678.901-22", saida: "09/03/2026" },
        { nome: "Abinadabe Fontenele Sodre", cela: "A - 01", cpf: "123.456.789-10", saida: "05/10/2026" },
        { nome: "Luiz Gonzaga Filho", cela: "A - 02", cpf: "984.561.230-22", saida: "05/10/2026" },
        { nome: "Kevin Marques", cela: "B - 01", cpf: "348.678.901-22", saida: "09/03/2026" },
    ];



    return (

        <div className="h-screen flex flex-col bg-gray-100 font-sans text-slate-900 overflow-hidden">

            <nav className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-8">
                    <img src={logo} alt="Logo" className="h-10" />
                    <div className="flex gap-2">
                        <NavItem icon={<Home size={16} />} label="Início" active />
                        <NavItem icon={<Users size={16} />} label="Pavilhões" />
                        <NavItem icon={<Calendar size={16} />} label="Visitas" />
                        <NavItem icon={<FileText size={16} />} label="Relatórios" />
                        <NavItem icon={<UserPlus size={16} />} label="Cadastro de Presos" />
                    </div>
                </div>
                <button className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold text-xs" onClick={logout}>
                    <LogOut size={18} /> Sair
                </button>
            </nav>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-hidden">

                <div className="h-[55%] grid grid-cols-12 gap-6">
                    <section className="col-span-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col overflow-hidden">
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

                    <section className="col-span-6 bg-white rounded-2xl shadow-sm border border-blue-100 p-5 flex flex-col overflow-hidden ring-1 ring-blue-50">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert className="text-blue-500" size={18} />
                            <h2 className="font-bold text-base">Presos em Solitária</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {solitaryPrisoners.map((p, i) => (
                                <div key={i} className="bg-gray-100/50 rounded-xl p-3 flex justify-between items-center text-sm">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{p.nome}</h3>
                                        <p className="text-[10px] text-gray-500">Cela: {p.cela} - {p.cpf}</p>
                                    </div>
                                    <span className="bg-black text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase">Solitária</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <section className="h-[45%] bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                        <Users size={18} className="text-gray-400" /> Distribuição de Presos por Pavilhão
                    </h2>
                    <div className="flex-1 flex justify-center items-end gap-12 pb-2">
                        {pavilions.map((pavilion) => (
                            <div key={pavilion} className="flex flex-col items-center gap-2 w-20 h-full justify-end">
                                <div className="w-full flex-1 flex items-end">
                                    <div
                                        className="w-full bg-slate-900 rounded-t-lg transition-all duration-700"
                                        style={{ height: getBarHeight(pavilion) }}
                                    ></div>
                                </div>
                                <span className="text-[11px] font-bold text-gray-600">{pavilion}</span>
                                <span className="text-[10px] text-gray-400">({counts[pavilion] || 0})</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <button className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${active ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            {icon}
            {label}
        </button>
    );
}