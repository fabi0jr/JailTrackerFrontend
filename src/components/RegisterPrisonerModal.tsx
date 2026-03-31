import React, { useEffect, useState } from 'react';
import { X, UserPlus, Image as ImageIcon, PlusCircle } from 'lucide-react';

interface RegisterPrisonerModalProps {
    onClose: () => void;
}

export default function RegisterPrisonerModal({ onClose }: RegisterPrisonerModalProps) {
    const [fullNam, setFullName] = useState<string>("");
    const [motherName, setMotherName] = useState<string>("");
    const [fatherName, setFatherName] = useState<string>("");
    const [cpf, setCpf] = useState<string>("");
    const [dateBirth, setDateBirth] = useState<string>("");
    const [crime, setCrime] = useState<string>("");
    const [recidivism, setRecidivism] = useState<string>("");
    const [pavilion, setPavilion] = useState<string>("");
    const [cell, setCell] = useState<string>("");
    const [photo, setPhoto] = useState<File>();


    return (
        // Overlay escuro com animação de fade (bg-black/60)
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>

            {/* Container do Modal com animação de escala e altura máxima */}
            <div
                className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 transform scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()} // Impede que o clique no modal feche-o
            >
                {/* 1. Cabeçalho do Modal (Fixo) */}
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

                {/* 2. Corpo do Modal (Conteúdo com Scroll Interno) */}
                <form className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-12 gap-x-8 gap-y-6">

                        {/* Seção da Foto (Esquerda) - Baseada no estilo da imagem */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col items-center gap-4 border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50/50">
                            <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-white ring-4 ring-gray-100 shadow-inner flex items-center justify-center overflow-hidden">
                                <ImageIcon className="text-gray-300" size={48} />
                            </div>
                            <label className="w-full text-center">
                                <span className="bg-[#0f172a] text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors block">
                                    {"Selecionar Foto *"}
                                </span>
                                <input type="file" accept="image/*" className="hidden" required />
                            </label>
                            <p className="text-[11px] text-gray-400 font-medium text-center">Formatos aceitos: JPG, PNG. Máx: 5MB.</p>
                        </div>

                        {/* Seção dos Campos de Texto (Direita) - Organização em Colunas */}
                        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-x-6 gap-y-6">

                            <div className="col-span-2">
                                <FormInput onChange={(e) => setFullName(e.target.value)} label="Nome Completo *" name="nome" placeholder="Digite o nome completo" required />
                            </div>

                            <FormInput onChange={(e) => setMotherName(e.target.value)} label="Nome da Mãe *" name="nomeMae" placeholder="Nome da mãe" required />
                            <FormInput onChange={(e) => setFatherName(e.target.value)} label="Nome do Pai" name="nomePai" placeholder="Nome do pai (opcional)" />

                            <FormInput onChange={(e) => setCpf(e.target.value)} label="CPF *" name="cpf" placeholder="000.000.000-00" required />
                            <FormInput label="Data de Nascimento *" name="dataNasc" type="date" required />

                            <FormInput onChange={(e) => setCrime(e.target.value)} label="Delito Principal *" name="delito" placeholder="Ex: Roubo, Tráfico" required />
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Reincidência? *</label>
                                <select onChange={(e) => setRecidivism(e.target.value)} name="reincidencia" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" required>
                                    <option value="">Selecione...</option>
                                    <option value="false">Não</option>
                                    <option value="true">Sim</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700">Pavilhão *</label>
                                <select onChange={(e) => setPavilion(e.target.value)} name="reincidencia" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" required>
                                    <option selected disabled>Selecione...</option>
                                    <option value="Pavilhão A">Pavilhão A</option>
                                    <option value="Pavilhão B">Pavilhão B</option>
                                    <option value="Pavilhão C">Pavilhão C</option>
                                </select>
                            </div>

                            
                            <FormInput label="Cela" name="cela" placeholder="Ex: 01,02.." type='number'/>

                        </div>
                    </div>
                </form>

                {/* 3. Rodapé do Modal (Fixo) */}
                <footer className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="cursor-pointer px-5 py-3 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" className="cursor-pointer flex items-center gap-2 bg-[#0f172a] text-white font-bold px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                        <PlusCircle size={18} />
                        Finalizar Cadastro
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