import React, { useEffect, useState } from 'react';
import { LogOut, Users, FileText, UserPlus, Home, Calendar } from 'lucide-react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

import logo from "../assets/logojail.png";
import ListVisitsModel from '../components/ListVisitsModel';
import ListPrisonersInConfinament from '../components/ListPrisonerInConfinament';
import GraphicPavilion from '../components/GraphicPavilion';

interface Visit {
    id: number;
    dataVisita: string;
    visitor: { nome: string };
    prisoner: { nome: string };
}

interface PrisonersInConfinament {
    nome: string;
    cela: string;
    cpf: string;
    dataFimSolitaria: string
}

interface PavilionCount {
    _count: { id: number };
    pavilhao: string;
}

export default function Dashboard() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [prisonersInConfinament, setPrisonersInConfinament] = useState<PrisonersInConfinament[]>([]);
    const [pavilionCount, setPavilionCount] = useState<PavilionCount[]>([]);

    const [isLoadingVisits, setIsLoadingVisits] = useState<boolean>(true);
    const [isLoadindPrisonersInConfinament, setIsLoadingPrisonerInConfinament] = useState<boolean>(true);
    const [isLoadindGraphicData, setIsLoadingGraphicData] = useState<boolean>(true);


    const BACKEND_API = import.meta.env.VITE_BACKEND_API || "https://jailtracker-backend-dev.onrender.com";
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWithRefresh = async (endpoint: string) => {
            const token = Cookies.get('access_token');

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

        const fetchData = () => {
            try {
                fetchWithRefresh('/visits').then((valueData) => {
                    if (valueData) {
                        setVisits(valueData);
                        setIsLoadingVisits(false);
                    }
                });


                fetchWithRefresh("/prisoners/solitaria").then((valueData) => {
                    if (valueData) {
                        setPrisonersInConfinament(valueData);
                        setIsLoadingPrisonerInConfinament(false);
                    }
                });


                fetchWithRefresh("/prisoners/ocupation-pavilhao").then((valueData) => {
                    if (valueData) {
                        setPavilionCount(valueData);
                        setIsLoadingGraphicData(false);
                    }
                });

            } catch (error: unknown) {
                console.error("Erro crítico na integração:", error instanceof Error ? error.message : error);
            }
        };
        fetchData();
    }, [BACKEND_API, navigate]);

    const logout = () => {
        Cookies.remove('access_token', { path: '/' });
        Cookies.remove('refresh_token', { path: '/' });
        navigate('/');
    }
    const getTotalPrisoners = () => {
        let sum = 0;
        pavilionCount.forEach((p) => {
            sum += p._count.id;
        })
        return sum;
    };

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
                <button className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold text-xs cursor-pointer" onClick={logout}>
                    <LogOut size={18} /> Sair
                </button>
            </nav>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-hidden">
                <div className="h-[55%] grid grid-cols-12 gap-6">
                    <ListVisitsModel visits={visits} isLoading={isLoadingVisits} />
                    <ListPrisonersInConfinament listPrisoners={prisonersInConfinament} isLoading={isLoadindPrisonersInConfinament}/>
                </div>
                <GraphicPavilion pavilions={pavilionCount} countTotal={getTotalPrisoners()} isLoading={isLoadindGraphicData} />
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${active ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            {icon}
            {label}
        </button>
    );
}