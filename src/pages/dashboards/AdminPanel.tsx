import React, { useState, useEffect, useRef } from 'react';
import { BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentManagementTab from '../../components/school-admin/StudentManagementTab';
import ClassroomTab from '../../components/school-admin/ClassroomTab';
import TeacherTab from '../../components/school-admin/TeacherTab';
import ParentTab from '../../components/school-admin/ParentTab';
import AnnouncementTab from "../../components/school-admin/AnnouncementTab.tsx";
import ProfileTab from '../../components/shared/ProfileTab';
import ContactTab from '../../components/shared/ContactTab';
import AdminSidebar from '../../components/dashboards/AdminSidebar';
import AdminHeader from '../../components/dashboards/AdminHeader';
import AdminOverview from '../../components/dashboards/AdminOverview';
import AdminLogoutModal from '../../components/dashboards/AdminLogoutModal';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

const AdminPanel: React.FC = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { profileData, stats, loading } = useAdminDashboard();

    // 🧠 GERİ TUŞU KORUMASI (Akıllı Durum Tahsisi)
    const isNotHome = activeTab !== 'overview';
    const isNotHomeRef = useRef(isNotHome);

    useEffect(() => {
        window.history.replaceState({ page: 'base' }, "", window.location.href);
        window.history.pushState({ page: 'trap' }, "", window.location.href);

        const handlePopState = () => {
            if (isNotHomeRef.current) {
                setActiveTab('overview');
            } else {
                setShowLogoutModal(true);
                window.history.pushState({ page: 'trap' }, "", window.location.href);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        if (isNotHome && !isNotHomeRef.current) {
            window.history.pushState({ page: 'subpage' }, "", window.location.href);
        }
        isNotHomeRef.current = isNotHome;
    }, [isNotHome]);

    const handleLogoutConfirm = () => {
        localStorage.clear();
        navigate('/', { replace: true });
    };

    const getInitials = (name: string) => {
        if (!name || name === 'Yükleniyor...') return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex font-sans selection:bg-blue-500/30">

            <AdminSidebar activeTab={activeTab} onSelect={setActiveTab} onLogout={() => setShowLogoutModal(true)} onHome={() => setActiveTab('overview')} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent">

                <AdminHeader
                    schoolName={profileData.schoolName}
                    name={profileData.name}
                    roleTitle={profileData.roleTitle}
                    initials={getInitials(profileData.name)}
                    email={profileData.email}
                    open={isDropdownOpen}
                    onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                    onProfile={() => { setIsDropdownOpen(false); setActiveTab('profile'); }}
                    onMessages={() => { setIsDropdownOpen(false); setActiveTab('messages'); }}
                    onLogout={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }}
                />

                <div className="flex-1 overflow-y-auto flex flex-col p-10">

                    <div className="flex-1">
                        {activeTab === 'overview' && (
                            <div className="animate-fade-in-down max-w-6xl mx-auto">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                        <BarChart3 className="w-10 h-10" /> Sistem Özeti
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium mt-1">Kurumunuza ait güncel istatistikler ve anlık durum raporu.</p>
                                </div>

                                <AdminOverview stats={stats} loading={loading} onSelect={setActiveTab} />
                            </div>
                        )}

                        {activeTab === 'students' && <div className="h-full"><StudentManagementTab /></div>}
                        {activeTab === 'parents' && <div className="h-full"><ParentTab /></div>}
                        {activeTab === 'teachers' && <div className="h-full"><TeacherTab /></div>}
                        {activeTab === 'classes' && <div className="h-full"><ClassroomTab /></div>}
                        {activeTab === 'announcements' && <div className="h-full"><AnnouncementTab /></div>}
                        {activeTab === 'profile' && <div className="h-full"><ProfileTab /></div>}
                        {activeTab === 'messages' && <div className="h-full"><ContactTab /></div>}
                    </div>

                    <footer className="mt-12 pt-6 border-t border-white/40 text-center text-slate-400 text-sm font-medium">
                        © 2026 EduConnect Kurum Yönetim Sistemi. Tüm hakları saklıdır.
                    </footer>
                </div>
            </main>

            <AdminLogoutModal open={showLogoutModal} onCancel={() => setShowLogoutModal(false)} onConfirm={handleLogoutConfirm} />
        </div>
    );
};

export default AdminPanel;
