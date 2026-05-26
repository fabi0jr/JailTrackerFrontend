import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface Prisoner {
    id: number;
    nome: string;
    pavilhao: string;
    cela: string;
}

interface Props {
    backendApi: string;
    visitorId: number;
    visitorNome: string;
    onClose: () => void;
    onVinculado: () => void;
}

const TIPOS_RELACAO = [
    'Familiar',
    'Cônjuge / Companheiro(a)',
    'Advogado',
    'Amigo',
    'Outro',
];

export default function VincularPresoModal({ backendApi, visitorId, visitorNome, onClose, onVinculado }: Props) {
    const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
    const [prisonerId, setPrisonerId] = useState('');
    const [tipoRelacao, setTipoRelacao] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingPrisoners, setIsFetchingPrisoners] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = Cookies.get('access_token');
        fetch(`${backendApi}/prisoners`, {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                setPrisoners(data);
                setIsFetchingPrisoners(false);
            });
    }, [backendApi]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const token = Cookies.get('access_token');
        const response = await fetch(`${backendApi}/visitors/${visitorId}/vincular-preso`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prisonerId: Number(prisonerId), tipoRelacao }),
        });

        if (response.ok) {
            onVinculado();
            onClose();
        } else if (response.status === 409) {
            setError('Este visitante já está vinculado a este preso.');
        } else {
            setError('Erro ao vincular. Tente novamente.');
        }

        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Vincular a Preso</h2>
                <p className="text-sm text-gray-500 mb-6">Visitante: <span className="font-bold text-slate-700">{visitorNome}</span></p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Preso</label>
                        <select
                            value={prisonerId}
                            onChange={(e) => setPrisonerId(e.target.value)}
                            required
                            disabled={isFetchingPrisoners}
                            className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">
                                {isFetchingPrisoners ? 'Carregando presos...' : 'Selecione o preso...'}
                            </option>
                            {prisoners.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nome} — {p.pavilhao}, Cela {p.cela}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tipo de Relação</label>
                        <select
                            value={tipoRelacao}
                            onChange={(e) => setTipoRelacao(e.target.value)}
                            required
                            className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecione...</option>
                            {TIPOS_RELACAO.map((tipo) => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                        </select>
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
                            disabled={isLoading || isFetchingPrisoners}
                            className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 cursor-pointer transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Vinculando...' : 'Vincular'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
