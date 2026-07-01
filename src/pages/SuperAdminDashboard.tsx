import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CampusManagementTab from '../components/CampusManagementTab';
import AdminManagementTab from '../components/AdminManagementTab';

const SuperAdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    // 🚦 Hangi sekmenin açık olduğunu tutan hafıza
    const [activeTab, setActiveTab] = useState('overview');

    // 🚪 Çıkış Modalının açık/kapalı durumunu tutan hafıza
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // 📈 Gösterge Paneli Verileri (YENİ EKLENDİ)
    const [stats, setStats] = useState({ campuses: 0, admins: 0, totalUsers: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    // 📡 Verileri Arka Plandan Çekme Motoru (YENİ EKLENDİ)
    useEffect(() => {
        const fetchStats = async () => {
            if (activeTab !== 'overview') return; // Sadece genel bakış sekmesindeyken veri çek

            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [schoolsRes, adminsRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/schools', { headers }),
                    axios.get('http://localhost:8080/api/superadmin/admins', { headers })
                ]);

                setStats({
                    campuses: schoolsRes.data.length,
                    admins: adminsRes.data.length,
                    // Henüz öğrenci/veli modülü olmadığı için toplam kullanıcıyı şimdilik simüle ediyoruz:
                    totalUsers: adminsRes.data.length + 1200
                });
                setLoadingStats(false);
            } catch (error) {
                console.error("İstatistik verileri çekilemedi:", error);
                setLoadingStats(false);
            }
        };

        fetchStats();
    }, [activeTab]);

    // 🚪 Güvenli Çıkış Motoru - Kesin Çıkış İşlemi
    const handleLogoutConfirm = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    // 🎨 Sol Menü Butonlarının Renk Motoru
    const getTabClass = (tabName: string) => {
        return `w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group ${
            activeTab === tabName
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                : 'hover:bg-slate-800/50 text-slate-400 hover:text-white border border-transparent'
        }`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 flex font-sans selection:bg-blue-500/30 relative">

            {/* 🧭 Sol Navigasyon (Sidebar) */}
            <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-10">
                <div className="p-6 border-b border-slate-800/60">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-tight">
                        EduConnect
                    </h1>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-[0.2em] font-semibold">
                        Donanma Komutanlığı
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveTab('overview')} className={getTabClass('overview')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
                        <span className="font-semibold tracking-wide">Genel Bakış</span>
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
                </nav>

                <div className="p-4 border-t border-slate-800/60">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-3 rounded-xl transition-colors border border-transparent hover:border-red-500/30"
                    >
                        <span>🚪</span>
                        <span className="font-semibold">Güvenli Çıkış</span>
                    </button>
                </div>
            </aside>

            {/* 📡 Ana Radar Ekranı (Main Content) */}
            <main className="flex-1 overflow-y-auto relative bg-slate-950">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

                {/* 🧩 DİNAMİK İÇERİK ALANI */}
                {activeTab === 'overview' && (
                    <div className="p-10 relative z-10 animate-fade-in-down">
                        <header className="flex justify-between items-center mb-12">
                            <div>
                                <h2 className="text-4xl font-extrabold text-white tracking-tight">Sistem Durumu</h2>
                                <p className="text-slate-400 mt-2 text-lg">Tüm kampüslerin canlı verileri ve sunucu sağlığı</p>
                            </div>
                            <div className="flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700/50 shadow-lg">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
                                <span className="text-sm font-semibold text-emerald-400 tracking-wide">Ana Motorlar Çevrimiçi</span>
                            </div>
                        </header>

                        {/* 📈 Metrik Kartları - GERÇEK VERİLER */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 p-7 rounded-3xl shadow-xl hover:-translate-y-1 transition-transform duration-300 group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase mb-2">Kayıtlı Kampüs</p>
                                        <h3 className="text-5xl font-black text-white">
                                            {loadingStats ? <span className="animate-pulse text-slate-600">...</span> : stats.campuses}
                                        </h3>
                                    </div>
                                    <div className="text-4xl group-hover:scale-110 transition-transform">🏛️</div>
                                </div>
                            </div>
                            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 p-7 rounded-3xl shadow-xl hover:-translate-y-1 transition-transform duration-300 group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase mb-2">Aktif Yönetici</p>
                                        <h3 className="text-5xl font-black text-white">
                                            {loadingStats ? <span className="animate-pulse text-slate-600">...</span> : stats.admins}
                                        </h3>
                                    </div>
                                    <div className="text-4xl group-hover:scale-110 transition-transform">👨‍💼</div>
                                </div>
                            </div>
                            <div className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 p-7 rounded-3xl shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className="text-blue-300 text-sm font-semibold tracking-wide uppercase mb-2">Tahmini Kullanıcı</p>
                                        <h3 className="text-5xl font-black text-white">
                                            {loadingStats ? <span className="animate-pulse text-blue-800">...</span> : stats.totalUsers}
                                        </h3>
                                    </div>
                                    <div className="text-4xl group-hover:scale-110 transition-transform">🌐</div>
                                </div>
                            </div>
                        </div>

                        {/* 📜 Son Sistem Logları */}
                        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <span>📡</span> Canlı Veri Akışı
                            </h3>
                            <div className="space-y-1">
                                {[
                                    { time: '12:42:05', event: 'Sistem arayüzü başarıyla güncellendi.', type: 'success' },
                                    { time: '11:15:22', event: 'Sistem yedeği AWS S3 üzerine başarıyla aktarıldı.', type: 'info' },
                                ].map((log, index) => (
                                    <div key={index} className="flex items-center space-x-4 text-sm hover:bg-slate-800/50 p-3 rounded-lg transition-colors border-l-2 border-transparent hover:border-slate-600 cursor-default">
                                        <span className="text-slate-500 font-mono w-20">{log.time}</span>
                                        <span className={`w-2.5 h-2.5 rounded-full ${log.type === 'info' ? 'bg-blue-500' : log.type === 'success' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                                        <span className="text-slate-300 font-medium">{log.event}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Diğer Sekmeler */}
                {activeTab === 'campuses' && <div className="p-6 relative z-10 animate-fade-in-down h-full bg-slate-100 rounded-tl-3xl"><CampusManagementTab /></div>}
                {activeTab === 'admins' && <div className="h-full"><AdminManagementTab /></div>}
                {activeTab === 'logs' && <div className="p-10 relative z-10 flex items-center justify-center h-full"><div className="text-center"><div className="text-6xl mb-4">⚙️</div><h2 className="text-2xl font-bold text-slate-400">Detaylı Log Ekranı Yapım Aşamasında...</h2></div></div>}
            </main>

            {/* 🚨 ÇIKIŞ ONAY PENCERESİ */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 border border-slate-200 relative animate-scale-in">
                        <div className="flex items-start gap-5 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                            </div>
                            <div className="pt-1">
                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase">Sistemden Çıkış</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1.5 leading-relaxed">
                                    Oturumunuzu sonlandırmak istediğinize emin misiniz?
                                </p>
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