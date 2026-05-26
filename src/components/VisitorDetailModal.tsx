import { useState, useEffect, useCallback } from 'react';
import { X, UserCheck, Link, Trash2, Save, ChevronRight } from 'lucide-react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import VincularPresoModal from './VincularPresoModal';
import ConfirmModal from './ConfirmModal';

interface Relacao {
    prisonerId: number;
    tipoRelacao: string;
    prisoner: { nome: string; pavilhao: string; cela: string };
}

interface VisitorDetail {
    id: number;
    nome: string;
    cpf: string;
    telefone: string;
    relacoes: Relacao[];
}

interface Props {
    visitorId: number;
    backendApi: string;
    onClose: () => void;
    onDeleted: (id: number) => void;
    onUpdated: (updated: { id: number; nome: string; cpf: string; telefone: string }) => void;
}

export default function VisitorDetailModal({ visitorId, backendApi, onClose, onDeleted, onUpdated }: Props) {
    const navigate = useNavigate();
    const [visitor, setVisitor] = useState<VisitorDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [showVincular, setShowVincular] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const apiFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        const token = Cookies.get('access_token');

        let response = await fetch(`${backendApi}${endpoint}`, {
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

            const refreshRes = await fetch(`${backendApi}/auth/refresh`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${refreshToken}`, 'Content-Type': 'application/json' },
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                Cookies.set('access_token', data.access_token, { expires: 1, path: '/' });
                response = await fetch(`${backendApi}${endpoint}`, {
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
    }, [backendApi, navigate]);

    useEffect(() => {
        apiFetch(`/visitors/${visitorId}`).then((data) => {
            if (data) {
                setVisitor(data);
                setNome(data.nome);
                setTelefone(data.telefone);
            }
            setIsLoading(false);
        });
    }, [apiFetch, visitorId]);

    const handleSave = async () => {
        setSaveError(null);
        setIsSaving(true);
        const result = await apiFetch(`/visitors/${visitorId}`, {
            method: 'PATCH',
            body: JSON.stringify({ nome, telefone }),
        });
        if (result !== null) {
            onUpdated({ id: visitorId, nome, cpf: visitor!.cpf, telefone });
            setVisitor((prev) => prev ? { ...prev, nome, telefone } : prev);
        } else {
            setSaveError('Erro ao salvar. Tente novamente.');
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        const result = await apiFetch(`/visitors/${visitorId}`, { method: 'DELETE' });
        if (result !== null) {
            onDeleted(visitorId);
            onClose();
        }
        setShowConfirmDelete(false);
    };

    const handleVinculado = () => {
        setShowVincular(false);
        apiFetch(`/visitors/${visitorId}`).then((data) => {
            if (data) setVisitor(data);
        });
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
                <div
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-100 p-3 rounded-xl">
                                <UserCheck className="text-slate-500" size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Detalhes do Visitante</h2>
                                <p className="text-sm text-gray-400 font-medium">Edite os dados ou gerencie vínculos</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="cursor-pointer p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors">
                            <X size={20} />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Carregando...</div>
                        ) : visitor ? (
                            <div className="flex flex-col gap-8">
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Dados Pessoais</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-gray-700">Nome</label>
                                            <input
                                                value={nome}
                                                onChange={(e) => setNome(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-gray-700">Telefone</label>
                                            <input
                                                value={telefone}
                                                onChange={(e) => setTelefone(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-gray-700">CPF</label>
                                            <input
                                                value={visitor.cpf}
                                                disabled
                                                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    {saveError && <p className="text-xs text-red-600 font-medium">{saveError}</p>}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Presos Vinculados</h3>
                                        <button
                                            onClick={() => setShowVincular(true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                                        >
                                            <Link size={13} /> Vincular Preso
                                        </button>
                                    </div>

                                    {visitor.relacoes.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-6">Nenhum preso vinculado.</p>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {visitor.relacoes.map((rel) => (
                                                <div key={rel.prisonerId} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{rel.prisoner.nome}</p>
                                                        <p className="text-xs text-gray-400">{rel.prisoner.pavilhao} · Cela {rel.prisoner.cela}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{rel.tipoRelacao}</span>
                                                        <ChevronRight size={14} className="text-gray-300" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-32 text-red-400 text-sm">Não foi possível carregar o visitante.</div>
                        )}
                    </div>

                    <footer className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 shrink-0">
                        <button
                            onClick={() => setShowConfirmDelete(true)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <Trash2 size={15} /> Excluir visitante
                        </button>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="cursor-pointer px-5 py-2.5 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-[#0f172a] text-white font-bold px-5 py-2.5 text-sm rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 cursor-pointer"
                            >
                                <Save size={15} />
                                {isSaving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>

            {showVincular && (
                <VincularPresoModal
                    backendApi={backendApi}
                    visitorId={visitorId}
                    visitorNome={visitor?.nome ?? ''}
                    onClose={() => setShowVincular(false)}
                    onVinculado={handleVinculado}
                />
            )}

            {showConfirmDelete && (
                <ConfirmModal
                    message={`Tem certeza que deseja excluir ${visitor?.nome}? Esta ação não pode ser desfeita.`}
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirmDelete(false)}
                />
            )}
        </>
    );
}
