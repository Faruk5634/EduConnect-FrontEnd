type Props = {
    schoolName: string;
    name: string;
    roleTitle: string;
    initials: string;
    email: string;
    open: boolean;
    onToggle: () => void;
    onProfile: () => void;
    onMessages: () => void;
    onLogout: () => void;
};

export default function AdminHeader({ schoolName, name, roleTitle, initials, email, open, onToggle, onProfile, onMessages, onLogout }: Props) {
    return (
        <header className="bg-white border-b border-slate-200 px-10 py-6 flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{schoolName}</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Sayın {name} - <span className="font-bold text-blue-600">{roleTitle}</span></p>
            </div>

            <div className="relative z-30">
                {open && <div className="fixed inset-0 z-40 cursor-default" onClick={onToggle}></div>}
                <button onClick={onToggle} className={`relative z-50 flex items-center gap-3 bg-white border px-2 py-2 pr-5 rounded-full hover:bg-slate-50 transition-all shadow-sm group ${open ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black shadow-inner tracking-tighter">
                        {initials}
                    </div>
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">{name}</p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5 uppercase flex items-center gap-1">Hesabım <span className="text-[8px]">▼</span></p>
                    </div>
                </button>

                {open && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in-down origin-top-right z-50">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <p className="text-sm font-bold text-slate-800">{name}</p>
                            <p className="text-xs text-slate-500 font-medium truncate">{email}</p>
                        </div>
                        <div className="py-2">
                            <button onClick={onProfile} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-3">
                                <span className="text-lg">👤</span> Profili Görüntüle
                            </button>
                        </div>
                        <div className="py-2 border-t border-slate-100">
                            <button onClick={onMessages} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-3">
                                <span className="text-lg">✉️</span> İletişim & Destek
                            </button>
                        </div>
                        <div className="py-2 border-t border-slate-100">
                            <button onClick={onLogout} className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                                <span className="text-lg">🚪</span> Sistemden Çıkış
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
