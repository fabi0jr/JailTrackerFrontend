import { FileText, Home, LogOut, UserCheck, UserPlus, Users } from "lucide-react";
import logo from "../assets/logojail.png";
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

interface Props {
    page: string;
}

export default function Header({ page }: Props) {
    const navigate = useNavigate();
    const logout = () => {
        Cookies.remove('access_token', { path: '/' });
        Cookies.remove('refresh_token', { path: '/' });
        navigate('/');
    }
    return (
        <nav className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-8">
                <img src={logo} alt="Logo" className="h-10" />
                <div className="flex gap-2">
                    <NavItem icon={<Home size={16} />} label="Início" active={page == "home"} destinationURL={"/dashboard"} />
                    <NavItem icon={<Users size={16} />} label="Pavilhões" active={page == "pavilion"} destinationURL={"/pavilhoes"} />
                    <NavItem icon={<UserCheck size={16} />} label="Visitantes" active={page == "visitors"} destinationURL={"/visitantes"} />
                    <NavItem icon={<FileText size={16} />} label="Relatórios" active={page == "registers"} destinationURL={"/relatorios"} />
                    <NavItem icon={<UserPlus size={16} />} label="Cadastro de Presos" active={page == "registerPrisorners"} destinationURL={"/registerPrisoners"} />
                </div>
            </div>
            <button className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold text-xs cursor-pointer" onClick={logout}>
                <LogOut size={18} /> Sair
            </button>
        </nav>
    )
}


function NavItem({ icon, label, active = false, destinationURL = null }: { icon: React.ReactNode, label: string, active?: boolean, destinationURL?: string | null }) {
    const navigator = useNavigate();
    return (
        <button className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${active ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => {
            if (destinationURL != null) {
                navigator(destinationURL);
            }else{
                return;
            }
        }}>
            {icon}
            {label}
        </button>
    );
}