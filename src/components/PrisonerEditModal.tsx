import { useState, useEffect, useCallback } from 'react';
import { X, UserPlus, Save, ShieldAlert, History, User, ChevronDown, ChevronUp } from 'lucide-react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

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
}

interface Movimentacao {
    id: number;
    tipo: string;
    descricao: string;
    dataMovimentacao: string;
    criador: { nome: string };
}

interface Props {
    prisoner: Prisoner;
    onClose: () => void;
    onUpdated: (updated: Prisoner) => void;
}

type Tab = 'dados' | 'historico';

const TIPO_BADGE: Record<string, string> = {
    TRANSFERENCIA: 'bg-yellow-100 text-yellow-800',
    ENTRADA_SOLITARIA: 'bg-red-100 text-red-700',
};

export default function PrisonerEditModal({ prisoner, onClose, onUpdated }: Props) {
    const BACKEND_API = import.meta.env.VITE_BACKEND_API;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('dados');

    const [nome, setNome] = useState(prisoner.nome);
    const [estadoCivil, setEstadoCivil] = useState(prisoner.estadoCivil);
    const [nomeMae, setNomeMae] = useState(prisoner.nomeMae);
    const [nomePai, setNomePai] = useState(prisoner.nomePai);
    const [dataNasc, setDataNasc] = useState(prisoner.dataNasc.split('T')[0]);
    const [delito, setDelito] = useState(prisoner.delito);
    const [reicidencia, setReicidencia] = useState(String(prisoner.reicidencia));
    const [pavilhao, setPavilhao] = useState(prisoner.pavilhao);
    const [cela, setCela] = useState(prisoner.cela);
    const [naSolitaria, setNaSolitaria] = useState(prisoner.naSolitaria);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [historico, setHistorico] = useState<Movimentacao[]>([]);
    const [isLoadingHistorico, setIsLoadingHistorico] = useState(false);

    const [showSolitariaForm, setShowSolitariaForm] = useState(false);
    const [solitariaMotivo, setSolitariaMotivo] = useState('');
    const [solitariaDataFim, setSolitariaDataFim] = useState('');
    const [isSendingSolitaria, setIsSendingSolitaria] = useState(false);
    const [solitariaError, setSolitariaError] = useState<string | null>(null);

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
        if (activeTab === 'historico' && historico.length === 0) {
            setIsLoadingHistorico(true);
            apiFetch(`/movimentacoes/prisoner/${prisoner.id}`).then((data) => {
                if (data) setHistorico(data);
                setIsLoadingHistorico(false);
            });
        }
    }, [activeTab, prisoner.id, apiFetch, historico.length]);

    const handleSave = async () => {
        setSaveError(null);
        setIsSaving(true);

        const pavilhaoMudou = pavilhao !== prisoner.pavilhao;
        const celaMudou = cela !== prisoner.cela;

        const result = await apiFetch(`/prisoners/${prisoner.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                nome,
                estadoCivil,
                nomeMae,
                nomePai,
                dataNasc,
                delito,
                reicidencia: reicidencia === 'true',
                pavilhao,
                cela,
            }),
        });

        if (result !== null) {
            onUpdated({ ...prisoner, nome, estadoCivil, nomeMae, nomePai, dataNasc, delito, reicidencia: reicidencia === 'true', pavilhao, cela });

            if ((pavilhaoMudou || celaMudou) && activeTab === 'historico') {
                setHistorico([]);
            }
        } else {
            setSaveError('Erro ao salvar. Verifique os dados e tente novamente.');
        }

        setIsSaving(false);
    };

    const handleEnviarSolitaria = async () => {
        setSolitariaError(null);
        if (!solitariaMotivo || !solitariaDataFim) {
            setSolitariaError('Preencha o motivo e a data de fim.');
            return;
        }
        setIsSendingSolitaria(true);

        const result = await apiFetch(`/prisoners/${prisoner.id}/solitaria`, {
            method: 'POST',
            body: JSON.stringify({ motivo: solitariaMotivo, dataFim: solitariaDataFim }),
        });

        if (result !== null) {
            setNaSolitaria(true);
            setShowSolitariaForm(false);
            onUpdated({ ...prisoner, nome, estadoCivil, nomeMae, nomePai, dataNasc, delito, reicidencia: reicidencia === 'true', pavilhao, cela, naSolitaria: true, dataFimSolitaria: solitariaDataFim });
            if (activeTab === 'historico') setHistorico([]);
        } else {
            setSolitariaError('Erro ao enviar para solitária.');
        }

        setIsSendingSolitaria(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            {prisoner.foto ? (
                                <img src={prisoner.foto} alt={prisoner.nome} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                            ) : (
                                <div className="bg-gray-100 p-3 rounded-xl">
                                    <User className="text-slate-500" size={22} />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{prisoner.nome}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-sm text-gray-400 font-medium">CPF: {prisoner.cpf}</p>
                                {naSolitaria && (
                                    <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        <ShieldAlert size={11} /> Solitária
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="cursor-pointer p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors">
                        <X size={20} />
                    </button>
                </header>

                <div className="flex border-b border-gray-100 shrink-0">
                    <button
                        onClick={() => setActiveTab('dados')}
                        className={`px-6 py-3.5 text-sm font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${activeTab === 'dados' ? 'border-slate-900 text-slate-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <UserPlus size={14} /> Dados
                    </button>
                    <button
                        onClick={() => setActiveTab('historico')}
                        className={`px-6 py-3.5 text-sm font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${activeTab === 'historico' ? 'border-slate-900 text-slate-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <History size={14} /> Histórico
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {activeTab === 'dados' && (
                        <div className="flex flex-col gap-6">
                            {saveError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-lg">
                                    {saveError}
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Identificação</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <FormField label="Nome Completo">
                                            <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
                                        </FormField>
                                    </div>
                                    <FormField label="CPF">
                                        <input value={prisoner.cpf} disabled className={disabledInputClass} />
                                    </FormField>
                                    <FormField label="Data de Nascimento">
                                        <input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} className={inputClass} />
                                    </FormField>
                                    <FormField label="Nome da Mãe">
                                        <input value={nomeMae} onChange={(e) => setNomeMae(e.target.value)} className={inputClass} />
                                    </FormField>
                                    <FormField label="Nome do Pai">
                                        <input value={nomePai} onChange={(e) => setNomePai(e.target.value)} className={inputClass} />
                                    </FormField>
                                    <FormField label="Estado Civil">
                                        <select value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} className={inputClass}>
                                            <option value="Solteiro(a)">Solteiro(a)</option>
                                            <option value="Casado(a)">Casado(a)</option>
                                            <option value="Divorciado(a)">Divorciado(a)</option>
                                            <option value="Viúvo(a)">Viúvo(a)</option>
                                            <option value="União Estável">União Estável</option>
                                        </select>
                                    </FormField>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Infração</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <FormField label="Delito Principal">
                                            <input value={delito} onChange={(e) => setDelito(e.target.value)} className={inputClass} />
                                        </FormField>
                                    </div>
                                    <FormField label="Reincidência">
                                        <select value={reicidencia} onChange={(e) => setReicidencia(e.target.value)} className={inputClass}>
                                            <option value="false">Não</option>
                                            <option value="true">Sim</option>
                                        </select>
                                    </FormField>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Localização</p>
                                <p className="text-xs text-gray-400 mb-4">Alterar pavilhão ou cela gera automaticamente um registro de transferência no histórico.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Pavilhão">
                                        <select value={pavilhao} onChange={(e) => setPavilhao(e.target.value)} className={inputClass}>
                                            <option value="Pavilhão A">Pavilhão A</option>
                                            <option value="Pavilhão B">Pavilhão B</option>
                                            <option value="Pavilhão C">Pavilhão C</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Cela">
                                        <input type="number" value={cela} onChange={(e) => setCela(e.target.value)} className={inputClass} />
                                    </FormField>
                                </div>
                            </div>

                            {!naSolitaria && (
                                <div className="border border-red-100 rounded-xl p-4 bg-red-50/40">
                                    <button
                                        onClick={() => setShowSolitariaForm((v) => !v)}
                                        className="flex items-center justify-between w-full cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                                            <ShieldAlert size={16} /> Enviar para Solitária
                                        </div>
                                        {showSolitariaForm ? <ChevronUp size={16} className="text-red-400" /> : <ChevronDown size={16} className="text-red-400" />}
                                    </button>

                                    {showSolitariaForm && (
                                        <div className="mt-4 flex flex-col gap-3">
                                            {solitariaError && (
                                                <p className="text-xs text-red-600 font-medium">{solitariaError}</p>
                                            )}
                                            <FormField label="Motivo">
                                                <input
                                                    value={solitariaMotivo}
                                                    onChange={(e) => setSolitariaMotivo(e.target.value)}
                                                    placeholder="Descreva o motivo..."
                                                    className={inputClass}
                                                />
                                            </FormField>
                                            <FormField label="Data de saída prevista">
                                                <input
                                                    type="date"
                                                    value={solitariaDataFim}
                                                    onChange={(e) => setSolitariaDataFim(e.target.value)}
                                                    className={inputClass}
                                                />
                                            </FormField>
                                            <button
                                                onClick={handleEnviarSolitaria}
                                                disabled={isSendingSolitaria}
                                                className="self-end flex items-center gap-2 bg-red-600 text-white font-bold px-4 py-2.5 text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer"
                                            >
                                                <ShieldAlert size={14} />
                                                {isSendingSolitaria ? 'Enviando...' : 'Confirmar'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {naSolitaria && prisoner.dataFimSolitaria && (
                                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                    <ShieldAlert size={18} className="text-red-600 shrink-0" />
                                    <p className="text-sm font-bold text-red-700">
                                        Em solitária até {new Date(prisoner.dataFimSolitaria).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'historico' && (
                        <div className="flex flex-col gap-3">
                            {isLoadingHistorico ? (
                                <div className="text-center text-gray-400 text-sm py-12">Carregando histórico...</div>
                            ) : historico.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-12">Nenhuma movimentação registrada.</div>
                            ) : (
                                historico.map((m) => (
                                    <div key={m.id} className="flex items-start gap-4 bg-gray-50 rounded-xl px-4 py-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIPO_BADGE[m.tipo] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {m.tipo.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs text-gray-400">{new Date(m.dataMovimentacao).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                            <p className="text-sm text-slate-700">{m.descricao}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Responsável: {m.criador.nome}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {activeTab === 'dados' && (
                    <footer className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 shrink-0">
                        <button onClick={onClose} className="cursor-pointer px-5 py-2.5 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-[#0f172a] text-white font-bold px-5 py-2.5 text-sm rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 cursor-pointer"
                        >
                            <Save size={15} />
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">{label}</label>
            {children}
        </div>
    );
}

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-gray-700";
const disabledInputClass = "w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-400 cursor-not-allowed";
