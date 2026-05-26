import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface Visitor {
    id: number;
    nome: string;
}

interface LinkedPrisoner {
    prisonerId: number;
    tipoRelacao: string;
    prisoner: { nome: string; pavilhao: string; cela: string };
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
    criador: { nome: string };
}

interface Props {
    backendApi: string;
    onClose: () => void;
    onCreated: (visit: Visit) => void;
}

export default function AgendarVisitaModal({ backendApi, onClose, onCreated }: Props) {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [linkedPrisoners, setLinkedPrisoners] = useState<LinkedPrisoner[]>([]);
    const [visitorId, setVisitorId] = useState('');
    const [prisonerId, setPrisonerId] = useState('');
    const [dataVisita, setDataVisita] = useState('');
    const [horaEntrada, setHoraEntrada] = useState('');
    const [horaSaida, setHoraSaida] = useState('');
    const [isLoadingVisitors, setIsLoadingVisitors] = useState(true);
    const [isLoadingPrisoners, setIsLoadingPrisoners] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = Cookies.get('access_token');
        fetch(`${backendApi}/visitors`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                setVisitors(data);
                setIsLoadingVisitors(false);
            });
    }, [backendApi]);

    const handleVisitorChange = async (id: string) => {
        setVisitorId(id);
        setPrisonerId('');
        setLinkedPrisoners([]);

        if (!id) return;

        setIsLoadingPrisoners(true);
        const token = Cookies.get('access_token');
        const response = await fetch(`${backendApi}/visitors/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
            const data = await response.json();
            setLinkedPrisoners(data.relacoes ?? []);
        }

        setIsLoadingPrisoners(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const token = Cookies.get('access_token');
        const response = await fetch(`${backendApi}/visits`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                visitorId: Number(visitorId),
                prisonerId: Number(prisonerId),
                dataVisita,
                horaEntrada,
                horaSaida,
            }),
        });

        if (response.ok) {
            const visit = await response.json();
            onCreated(visit);
            onClose();
        } else if (response.status === 404) {
            setError('Visitante não possui vínculo com este preso.');
        } else {
            setError('Erro ao agendar visita. Tente novamente.');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full mx-4">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Agendar Visita</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Visitante</label>
                        <select
                            value={visitorId}
                            onChange={(e) => handleVisitorChange(e.target.value)}
                            required
                            disabled={isLoadingVisitors}
                            className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">
                                {isLoadingVisitors ? 'Carregando visitantes...' : 'Selecione o visitante...'}
                            </option>
                            {visitors.map((v) => (
                                <option key={v.id} value={v.id}>{v.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Preso</label>
                        <select
                            value={prisonerId}
                            onChange={(e) => setPrisonerId(e.target.value)}
                            required
                            disabled={!visitorId || isLoadingPrisoners}
                            className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            <option value="">
                                {!visitorId
                                    ? 'Selecione o visitante primeiro...'
                                    : isLoadingPrisoners
                                    ? 'Carregando...'
                                    : linkedPrisoners.length === 0
                                    ? 'Nenhum preso vinculado'
                                    : 'Selecione o preso...'}
                            </option>
                            {linkedPrisoners.map((rel) => (
                                <option key={rel.prisonerId} value={rel.prisonerId}>
                                    {rel.prisoner.nome} — {rel.prisoner.pavilhao}, Cela {rel.prisoner.cela} ({rel.tipoRelacao})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Data da visita</label>
                        <input
                            type="date"
                            value={dataVisita}
                            onChange={(e) => setDataVisita(e.target.value)}
                            required
                            className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hora de entrada</label>
                            <input
                                type="time"
                                value={horaEntrada}
                                onChange={(e) => setHoraEntrada(e.target.value)}
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hora de saída</label>
                            <input
                                type="time"
                                value={horaSaida}
                                onChange={(e) => setHoraSaida(e.target.value)}
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-3 justify-end mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 cursor-pointer transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Agendando...' : 'Agendar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
