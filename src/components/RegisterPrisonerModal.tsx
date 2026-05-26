import React, { useState } from 'react';
import { X, UserPlus, Image as ImageIcon, PlusCircle } from 'lucide-react';
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
    createdAt: string;
    updatedAt: string;
}

interface Props {
    onClose: () => void;
    onCreated: (prisoner: Prisoner) => void;
}

export default function RegisterPrisonerModal({ onClose, onCreated }: Props) {
    const BACKEND_API = import.meta.env.VITE_BACKEND_API;
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [estadoCivil, setEstadoCivil] = useState('');
    const [nomeMae, setNomeMae] = useState('');
    const [nomePai, setNomePai] = useState('');
    const [cpf, setCpf] = useState('');
    const [dataNasc, setDataNasc] = useState('');
    const [delito, setDelito] = useState('');
    const [reicidencia, setReicidencia] = useState('');
    const [pavilhao, setPavilhao] = useState('');
    const [cela, setCela] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('estadoCivil', estadoCivil);
        formData.append('nomeMae', nomeMae);
        formData.append('nomePai', nomePai);
        formData.append('cpf', cpf);
        formData.append('dataNasc', dataNasc);
        formData.append('delito', delito);
        formData.append('reicidencia', reicidencia);
        formData.append('pavilhao', pavilhao);
        formData.append('cela', cela);
        if (photo) formData.append('file', photo);

        const token = Cookies.get('access_token');

        const doRequest = async (accessToken: string) =>
            fetch(`${BACKEND_API}/prisoners`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
                body: formData,
            });

        let response = await doRequest(token!);

        if (response.status === 401) {
            const refreshToken = Cookies.get('refresh_token');
            if (!refreshToken) { navigate('/'); return; }

            const refreshRes = await fetch(`${BACKEND_API}/auth/refresh`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${refreshToken}`, 'Content-Type': 'application/json' },
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                Cookies.set('access_token', data.access_token, { expires: 1, path: '/' });
                response = await doRequest(data.access_token);
            } else {
                Cookies.remove('access_token', { path: '/' });
                Cookies.remove('refresh_token', { path: '/' });
                navigate('/');
                return;
            }
        }

        if (response.ok) {
            const created: Prisoner = await response.json();
            onCreated(created);
            onClose();
        } else {
            const body = await response.json().catch(() => ({}));
            setError(body.message ?? 'Erro ao cadastrar preso. Verifique os dados e tente novamente.');
        }

        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-xl">
                            <UserPlus className="text-slate-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Cadastrar Novo Preso</h2>
                            <p className="text-sm text-gray-500 font-medium">Preencha todos os campos obrigatórios (*)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="cursor-pointer p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors">
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-12 gap-x-8 gap-y-6">
                        <div className="col-span-12 lg:col-span-4 flex flex-col items-center gap-4 border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50">
                            <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-white ring-4 ring-gray-100 shadow-inner flex items-center justify-center overflow-hidden">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="text-gray-300" size={48} />
                                )}
                            </div>
                            <label className="w-full text-center cursor-pointer">
                                <span className="bg-[#0f172a] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors block">
                                    {photo ? 'Trocar Foto' : 'Selecionar Foto *'}
                                </span>
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                            {photo && <p className="text-[11px] text-gray-500 font-medium text-center truncate w-full">{photo.name}</p>}
                            <p className="text-[11px] text-gray-400 font-medium text-center">Formatos aceitos: JPG, PNG. Máx: 5MB.</p>
                        </div>

                        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-x-6 gap-y-6">
                            <div className="col-span-2">
                                <FormInput label="Nome Completo *" placeholder="Digite o nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
                            </div>

                            <FormInput label="Nome da Mãe *" placeholder="Nome da mãe" value={nomeMae} onChange={(e) => setNomeMae(e.target.value)} required />
                            <FormInput label="Nome do Pai" placeholder="Nome do pai (opcional)" value={nomePai} onChange={(e) => setNomePai(e.target.value)} />

                            <FormInput label="CPF *" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                            <FormInput label="Data de Nascimento *" type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} required />

                            <FormInput label="Delito Principal *" placeholder="Ex: Roubo, Tráfico" value={delito} onChange={(e) => setDelito(e.target.value)} required />

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Estado Civil *</label>
                                <select value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" required>
                                    <option value="">Selecione...</option>
                                    <option value="Solteiro(a)">Solteiro(a)</option>
                                    <option value="Casado(a)">Casado(a)</option>
                                    <option value="Divorciado(a)">Divorciado(a)</option>
                                    <option value="Viúvo(a)">Viúvo(a)</option>
                                    <option value="União Estável">União Estável</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Reincidência? *</label>
                                <select value={reicidencia} onChange={(e) => setReicidencia(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" required>
                                    <option value="">Selecione...</option>
                                    <option value="false">Não</option>
                                    <option value="true">Sim</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Pavilhão *</label>
                                <select value={pavilhao} onChange={(e) => setPavilhao(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" required>
                                    <option value="">Selecione...</option>
                                    <option value="Pavilhão A">Pavilhão A</option>
                                    <option value="Pavilhão B">Pavilhão B</option>
                                    <option value="Pavilhão C">Pavilhão C</option>
                                </select>
                            </div>

                            <FormInput label="Cela *" placeholder="Ex: 01, 02..." type="number" value={cela} onChange={(e) => setCela(e.target.value)} required />
                        </div>
                    </div>
                </form>

                <footer className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="cursor-pointer px-5 py-3 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        onClick={handleSubmit}
                        className="cursor-pointer flex items-center gap-2 bg-[#0f172a] text-white font-bold px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <PlusCircle size={18} />
                        {isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </button>
                </footer>
            </div>
        </div>
    );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

function FormInput({ label, ...props }: FormInputProps) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">{label}</label>
            <input
                {...props}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm text-gray-600"
            />
        </div>
    );
}
