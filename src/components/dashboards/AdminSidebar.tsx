import { LogOut, Megaphone } from 'lucide-react';
type Props = {
    activeTab: string;
    onSelect: (tab: string) => void;
    onLogout: () => void;
    onHome: () => void;
};

const tabs = [
    ['overview', '📊', 'Ana Sayfa'],
    ['students', '🎓', 'Öğrenciler'],
    ['parents', '👨‍👩‍👧', 'Veliler'],
    ['teachers', '👩‍🏫', 'Öğretmenler'],
    ['classes', '🏫', 'Sınıflar'],
    ['announcements', <Megaphone className="w-4 h-4" />, 'Duyurular'],
    ['messages', '✉️', 'İletişim & Destek'],
    ['profile', '👤', 'Profil']
] as const;

export default function AdminSidebar({ activeTab, onSelect, onLogout, onHome }: Props) {
    const tabClass = (tabName: string) =>
        `w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold ${
            activeTab === tabName ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-700'
        }`;

    return (
        <aside className="w-72 glass-panel border-r border-white/40 flex flex-col shadow-lg z-10">
            <div className="p-8 border-b border-slate-100 cursor-pointer hover:bg-transparent transition-colors group" onClick={onHome}>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 text-blue-700 tracking-tight group-hover:scale-105 transition-transform origin-left">EduConnect</h1>
                <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">Kurum Yönetim Portalı</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {tabs.map(([tab, icon, label]) => (
                    <button key={tab} onClick={() => onSelect(tab)} className={tabClass(tab)}>
                        <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
                        <span className="tracking-wide">{label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl transition-colors font-bold shadow-lg border border-red-100 hover:border-red-200">
                    <span><LogOut className="w-6 h-6" /></span>
                    <span>Güvenli Çıkış</span>
                </button>
            </div>
        </aside>
    );
}
