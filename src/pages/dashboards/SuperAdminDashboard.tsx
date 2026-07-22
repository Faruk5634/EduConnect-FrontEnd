import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import CampusManagementTab from '../../components/super-admin/CampusManagementTab';
import AdminManagementTab from '../../components/super-admin/AdminManagementTab';
import SystemLogsTab from '../../components/super-admin/SystemLogsTab';
import ContactTab from '../../components/shared/ContactTab';
import ProfileTab from '../../components/shared/ProfileTab';

const SuperAdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [headerProfileName, setHeaderProfileName] = useState('Yükleniyor...');
    const [headerProfileEmail, setHeaderProfileEmail] = useState('');

    const [stats, setStats] = useState({ campuses: 0, admins: 0, totalUsers: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    // 🧠 1. ADIM: Sayfanın ana ekranda olup olmadığını takip et
    const isNotHome = activeTab !== 'overview';
    const isNotHomeRef = useRef(isNotHome);

    useEffect(() => {
        // 2. ADIM: Başlangıçta Base (Zemin) ve Trap (Tuzak) state'lerini kur
        window.history.replaceState({ page: 'base' }, "", window.location.href);
        window.history.pushState({ page: 'trap' }, "", window.location.href);

        const handlePopState = () => {
            if (isNotHomeRef.current) {
                // Eğer alt sayfadaysak anasayfaya dön (Tarayıcı Trap state'ine düştü)
                setActiveTab('overview');
            } else {
                // Ana sayfadaysak çıkış sor ve kullanıcıyı sayfada tutmak için Trap'i geri koy
                setShowLogoutModal(true);
                window.history.pushState({ page: 'trap' }, "", window.location.href);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        // 3. ADIM: Kullanıcı sekmelerde gezinirken durumu izle ve gerekirse History'e ekle
        if (isNotHome && !isNotHomeRef.current) {
            // Ana sayfadan ilk defa başka bir sekmeye geçildi, geçmişe iz bırak
            window.history.pushState({ page: 'subpage' }, "", window.location.href);
        }
        isNotHomeRef.current = isNotHome;
    }, [isNotHome]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (activeTab === 'overview') {
                    const [schoolsRes, adminsRes] = await Promise.all([
                        api.get('/schools'),
                        api.get('/superadmin/admins')
                    ]);
                    setStats({ campuses: schoolsRes.data.length, admins: adminsRes.data.length, totalUsers: adminsRes.data.length });
                    setLoadingStats(false);
                }

                try {
                    const userRes = await api.get('/users/me');
                    setHeaderProfileName(userRes.data.name || userRes.data.username || 'Sistem Yöneticisi');
                    setHeaderProfileEmail(userRes.data.email || 'E-posta kayıtlı değil');
                } catch (err) {
                    setHeaderProfileName('Süper Admin');
                }
            } catch (error) {
                setLoadingStats(false);
            }
        };
        fetchDashboardData();
    }, [activeTab]);

    // 🚪 🚀 GÜVENLİ ÇIKIŞ
    const handleLogoutConfirm = () => {
        localStorage.clear();
        navigate('/', { replace: true });
    };

    const getTabClass = (tabName: string) => {
        return `w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group ${
            activeTab === tabName
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                : 'hover:bg-slate-800/50 text-slate-400 hover:text-white border border-transparent'
        }`;
    };

    const getInitials = (name: string) => {
        if (!name || name === 'Yükleniyor...') return 'SA';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 flex font-sans selection:bg-blue-500/30 relative">

            <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-10">
                <div className="p-8 border-b border-slate-800/60">
                    <h1 onClick={() => setActiveTab('overview')} className="text-3xl cursor-pointer font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-tight">
                        EduConnect
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveTab('overview')} className={getTabClass('overview')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
                        <span className="font-semibold tracking-wide">Ana Sayfa</span>
                    </button>
                    <button onClick={() => setActiveTab('campuses')} className={getTabClass('campuses')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">🏛️</span>
                        <span className="font-medium tracking-wide">Kurum Yönetimi</span>
                    </button>
                    <button onClick={() => setActiveTab('admins')} className={getTabClass('admins')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">👨‍💼</span>
                        <span className="font-medium tracking-wide">Yönetici Merkezi</span>
                    </button>
                    <button onClick={() => setActiveTab('logs')} className={getTabClass('logs')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">⚙️</span>
                        <span className="font-medium tracking-wide">Sistem Logları</span>
                    </button>

                    <div className="pt-4 mt-4 border-t border-slate-800/60">
                        <button onClick={() => setActiveTab('profile')} className={getTabClass('profile')}>
                            <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
                            <span className="font-medium tracking-wide">Profil</span>
                        </button>
                    </div>

                    <button onClick={() => setActiveTab('messages')} className={getTabClass('messages')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">✉️</span>
                        <span className="font-medium tracking-wide">İletişim & Destek</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800/60">
                    <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-3 rounded-xl transition-colors border border-transparent hover:border-red-500/30">
                        <span>🚪</span>
                        <span className="font-semibold">Güvenli Çıkış</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto relative bg-slate-950 pb-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                {activeTab === 'overview' && (
                    <div className="absolute top-8 right-10 z-30">
                        {isDropdownOpen && <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)}></div>}
                        <div className="relative z-30">
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`flex items-center gap-3 bg-slate-900/60 backdrop-blur-md border px-2 py-2 pr-5 rounded-full hover:bg-slate-800 transition-all shadow-lg group ${isDropdownOpen ? 'border-blue-500/50' : 'border-slate-700/50'}`}>
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shadow-inner tracking-tighter">
                                    {getInitials(headerProfileName)}
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{headerProfileName}</p>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">Hesabım ▼</p>
                                </div>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in-down origin-top-right">
                                    <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
                                        <p className="text-sm font-bold text-white">{headerProfileName}</p>
                                        <p className="text-xs text-slate-400 truncate">{headerProfileEmail}</p>
                                    </div>
                                    <div className="py-2">
                                        <button onClick={() => { setIsDropdownOpen(false); setActiveTab('profile'); }} className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors flex items-center gap-3">
                                            <span>👤</span> Profili Görüntüle
                                        </button>
                                        <button onClick={() => { setIsDropdownOpen(false); setActiveTab('messages'); }} className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors flex items-center gap-3">
                                            <span>✉️</span> İletişim & Destek
                                        </button>
                                    </div>
                                    <div className="py-2 border-t border-slate-700/50">
                                        <button onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-3">
                                            <span>🚪</span> Sistemden Çıkış
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="p-10 relative z-10 animate-fade-in-down">
                        <header className="flex justify-between items-center mb-12">
                            <div>
                                <h2 className="text-4xl font-extrabold text-white tracking-tight">Sistem Durumu</h2>
                                <p className="text-slate-400 mt-2 text-lg">Tüm kampüslerin canlı verileri ve genel özet</p>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div onClick={() => setActiveTab('campuses')} className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 p-7 rounded-3xl shadow-xl hover:-translate-y-1 transition-transform duration-300 group cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase mb-2">Kayıtlı Kampüs</p>
                                        <h3 className="text-5xl font-black text-white">{loadingStats ? <span className="animate-pulse text-slate-600">...</span> : stats.campuses}</h3>
                                    </div>
                                    <div className="text-4xl group-hover:scale-110 transition-transform">🏛️</div>
                                </div>
                            </div>
                            <div onClick={() => setActiveTab('admins')} className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 p-7 rounded-3xl shadow-xl hover:-translate-y-1 transition-transform duration-300 group cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase mb-2">Aktif Yönetici</p>
                                        <h3 className="text-5xl font-black text-white">{loadingStats ? <span className="animate-pulse text-slate-600">...</span> : stats.admins}</h3>
                                    </div>
                                    <div className="text-4xl group-hover:scale-110 transition-transform">👨‍💼</div>
                                </div>
                            </div>
                            <div onClick={() => setActiveTab('admins')} className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 p-7 rounded-3xl shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden cursor-pointer">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className="text-blue-300 text-sm font-semibold tracking-wide uppercase mb-2">Kayıtlı Kullanıcı</p>
                                        <h3 className="text-5xl font-black text-white">{loadingStats ? <span className="animate-pulse text-blue-800">...</span> : stats.totalUsers}</h3>
                                    </div>
                                    <div className="text-4xl group-hover:scale-110 transition-transform">🌐</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'campuses' && <div className="p-6 relative z-10 animate-fade-in-down h-full bg-slate-100 rounded-tl-3xl"><CampusManagementTab /></div>}
                {activeTab === 'admins' && <div className="h-full"><AdminManagementTab /></div>}
                {activeTab === 'logs' && <div className="h-full"><SystemLogsTab /></div>}
                {activeTab === 'messages' && <div className="h-full"><ContactTab /></div>}
                {activeTab === 'profile' && <div className="h-full"><ProfileTab /></div>}

                <footer className="w-full text-center py-6 text-slate-400 bg-slate-950/30 border-t border-slate-800/30 mt-20 fixed left-72 right-0 bottom-0">
                    <div className="max-w-5xl mx-auto">© {new Date().getFullYear()} EduConnect — Tüm hakları saklıdır.</div>
                </footer>
            </main>

            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-md shadow-2xl w-full max-w-md p-6 border border-slate-200 relative animate-scale-in">
                        <div className="flex items-start gap-5 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                            </div>
                            <div className="pt-1">
                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase">Sistemden Çıkış</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1.5 leading-relaxed">Oturumunuzu sonlandırmak istediğinize emin misiniz?</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                            <button onClick={() => setShowLogoutModal(false)} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-md font-bold text-sm tracking-widest transition-all shadow-sm">İPTAL</button>
                            <button onClick={handleLogoutConfirm} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-bold text-sm tracking-widest shadow-md transition-all">ÇIKIŞ YAP</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;