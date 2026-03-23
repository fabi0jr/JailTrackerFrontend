import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import ListVisitsModel from '../components/ListVisitsModel';
import ListPrisonersInConfinament from '../components/ListPrisonerInConfinament';
import GraphicPavilion from '../components/GraphicPavilion';
import Header from '../components/Header';

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

    const getTotalPrisoners = () => {
        let sum = 0;
        pavilionCount.forEach((p) => {
            sum += p._count.id;
        })
        return sum;
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100 font-sans text-slate-900 overflow-hidden">
            <Header page='home' />

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-hidden">
                <div className="h-[55%] grid grid-cols-12 gap-6">
                    <ListVisitsModel visits={visits} isLoading={isLoadingVisits} />
                    <ListPrisonersInConfinament listPrisoners={prisonersInConfinament} isLoading={isLoadindPrisonersInConfinament} />
                </div>
                <GraphicPavilion pavilions={pavilionCount} countTotal={getTotalPrisoners()} isLoading={isLoadindGraphicData} />
            </main>
        </div>
    );
}

