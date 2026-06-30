import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// İleride bu sekmelerin de içini Tailwind ile yenileyeceğiz
import DashboardTab from '../components/DashboardTab';
import StudentTab from '../components/StudentTab';
import TeacherTab from '../components/TeacherTab';
import ClassroomTab from '../components/ClassroomTab';
import ParentTab from '../components/ParentTab';
import AnnouncementTab from '../components/AnnouncementTab';

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();

    // 🚪 Güvenli Çıkış Motoru
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // 🎨 Sol Menü Buton Tasarımı
    const getTabClass = (tabName: string) => {
        return `w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all font-medium ${
            activeTab === tabName
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
        }`;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 selection:bg-blue-200">

            {/* 🧭 Sol Navigasyon (Sidebar) */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-2xl z-10 relative">
                <div className="p-7 border-b border-slate-100">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                        EduConnect
                    </h1>
                    <p className="text-xs text-slate-400 mt-2 uppercase tracking-[0.15em] font-bold">
                        Müdür Paneli
                    </p>
                </div>

                <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveTab('dashboard')} className={getTabClass('dashboard')}>
                        <span className="text-xl">📊</span>
                        <span>Kaptan Köşkü</span>
                    </button>
                    <button onClick={() => setActiveTab('students')} className={getTabClass('students')}>
                        <span className="text-xl">🎓</span>
                        <span>Öğrenciler</span>
                    </button>
                    <button onClick={() => setActiveTab('parents')} className={getTabClass('parents')}>
                        <span className="text-xl">👨‍👩‍👦</span>
                        <span>Veliler</span>
                    </button>
                    <button onClick={() => setActiveTab('teachers')} className={getTabClass('teachers')}>
                        <span className="text-xl">👨‍🏫</span>
                        <span>Öğretmenler</span>
                    </button>
                    <button onClick={() => setActiveTab('classes')} className={getTabClass('classes')}>
                        <span className="text-xl">🏫</span>
                        <span>Sınıflar</span>
                    </button>
                    <button onClick={() => setActiveTab('announcements')} className={getTabClass('announcements')}>
                        <span className="text-xl">📢</span>
                        <span>Duyurular</span>
                    </button>
                </nav>

                <div className="p-5 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl transition-all font-bold shadow-sm"
                    >
                        <span>🚪</span>
                        <span>Güvenli Çıkış</span>
                    </button>
                </div>
            </aside>

            {/* 📡 Ana İçerik Ekranı (Main Content) */}
            <main className="flex-1 p-10 overflow-y-auto bg-slate-50 relative">

                {/* Üst Karşılama Barı */}
                <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800">Hoş Geldiniz, Müdür Bey</h2>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Kampüsün günlük operasyonlarını buradan yönetebilirsiniz.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">Merkez Kampüs</p>
                            <p className="text-xs text-emerald-500 font-semibold flex items-center justify-end gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Sistem Aktif
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-black shadow-inner">
                            M
                        </div>
                    </div>
                </header>

                {/* 🧩 Dinamik İçerik (Seçilen Sekmeye Göre Değişir) */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8 min-h-[60vh]">
                    {activeTab === 'dashboard' && <DashboardTab />}
                    {activeTab === 'students' && <StudentTab />}
                    {activeTab === 'parents' && <ParentTab />}
                    {activeTab === 'teachers' && <TeacherTab />}
                    {activeTab === 'classes' && <ClassroomTab />}
                    {activeTab === 'announcements' && <AnnouncementTab />}
                </div>

            </main>
        </div>
    );
};

export default AdminPanel;