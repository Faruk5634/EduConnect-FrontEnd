import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import StudentManagementTab from '../../components/school-admin/StudentManagementTab';
import ClassroomTab from '../../components/school-admin/ClassroomTab';
import TeacherTab from '../../components/school-admin/TeacherTab';
import ParentTab from '../../components/school-admin/ParentTab';
import AnnouncementTab from "../../components/school-admin/AnnouncementTab.tsx";
import ProfileTab from '../../components/shared/ProfileTab';
import ContactTab from '../../components/shared/ContactTab';


const AdminPanel: React.FC = () => {
    const navigate = useNavigate();

    // 🚦 Durum Yönetimleri
    const [activeTab, setActiveTab] = useState('overview');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // 👤 Gerçek Profil ve Kurum Verileri
    const [profileData, setProfileData] = useState({
        name: 'Yükleniyor...',
        email: '',
        roleTitle: 'Yönetici',
        schoolName: 'Kurum Bilgisi Bekleniyor...'
    });

    // 📈 Gerçek İstatistik Verileri
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        parents: 0,
        announcements: 0
    });

    // 🧠 Geri Tuşu İçin Akıllı Hafıza Çipi (Aktif sekmeyi her an hatırlar)
    const activeTabRef = useRef(activeTab);
    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    // 🛡️ GERİ TUŞU KORUMASI VE AKILLI YÖNLENDİRME (Anti-Sızıntı Motoru)
    useEffect(() => {
        window.history.pushState(null, "", window.location.pathname);
        const handlePopState = () => {
            window.history.pushState(null, "", window.location.pathname);

            // Eğer ana sayfada değilsek, önce ana sayfaya dön
            if (activeTabRef.current !== 'overview') {
                setActiveTab('overview');
            } else {
                // Zaten ana sayfadaysak çıkış uyarısı ver
                setShowLogoutModal(true);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // 📡 Verileri Backend'den Çekme Motoru
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Authorization header is provided by api interceptor

                // 1. Kullanıcı ve Kurum Bilgilerini Çek
                try {
                    const userRes = await api.get('/users/me');
                    const user = userRes.data;

                    // Rol ismini akıllıca belirle
                    let roleDisplay = 'Yönetici';
                    const roleStr = String(user.role || '').toUpperCase();
                    if (roleStr.includes('VICE') || roleStr.includes('YARDIMCI')) roleDisplay = 'Müdür Yardımcısı';
                    else if (roleStr.includes('ADMIN') || roleStr.includes('PRINCIPAL') || roleStr.includes('MUDUR')) roleDisplay = 'Kurum Müdürü';

                    setProfileData({
                        name: user.name || user.username || 'İsimsiz Kullanıcı',
                        email: user.email || 'E-posta tanımlı değil',
                        roleTitle: roleDisplay,
                        schoolName: user.schoolName || 'Kurum Ataması Bekleniyor'
                    });
                } catch (err) {
                    console.warn("Kullanıcı bilgileri çekilemedi.");
                }

                // 2. Kuruma Ait İstatistikleri Çek
                try {
                    const statsRes = await api.get('/school/stats');
                    setStats({
                        students: statsRes.data.totalStudents || 0,
                        teachers: statsRes.data.totalTeachers || 0,
                        classes: statsRes.data.totalClasses || 0,
                        parents: statsRes.data.totalParents || 0,
                        announcements: statsRes.data.totalAnnouncements || 0
                    });
                } catch (err) {
                    // EĞER SERVER 500 ATARSA, BİZ SESSİZCE 0 GÖSTERELİM VE KONSOLA YAZALIM
                    console.error("İstatistikler henüz hazır değil veya backend hata döndü:", err);
                    setStats({ students: 0, teachers: 0, classes: 0, parents: 0, announcements: 0 });
                }

            } catch (error) {
                console.error("Dashboard verileri yüklenirken genel bir hata oluştu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [activeTab]);

    // 🚪 Güvenli Çıkış Motoru
    const handleLogoutConfirm = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    // 🔠 İsim Baş harflerini alma
    const getInitials = (name: string) => {
        if (!name || name === 'Yükleniyor...') return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // 🎨 Sol Menü Butonlarının Renk Motoru
    const getTabClass = (tabName: string) => {
        return `w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold ${
            activeTab === tabName
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-700'
        }`;
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex font-sans selection:bg-blue-500/30">

            {/* 🧭 Sol Navigasyon (Sidebar) */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
                <div className="p-8 border-b border-slate-100">
                    <h1 className="text-3xl font-black text-blue-700 tracking-tight">
                        EduConnect
                    </h1>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">
                        Kurum Yönetim Portalı
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveTab('overview')} className={getTabClass('overview')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
                        <span className="tracking-wide">Ana Sayfa</span>
                    </button>
                    <button onClick={() => setActiveTab('students')} className={getTabClass('students')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">🎓</span>
                        <span className="tracking-wide">Öğrenciler</span>
                    </button>
                    <button onClick={() => setActiveTab('parents')} className={getTabClass('parents')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">👨‍👩‍👧</span>
                        <span className="tracking-wide">Veliler</span>
                    </button>
                    <button onClick={() => setActiveTab('teachers')} className={getTabClass('teachers')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">👩‍🏫</span>
                        <span className="tracking-wide">Öğretmenler</span>
                    </button>
                    <button onClick={() => setActiveTab('classes')} className={getTabClass('classes')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">🏫</span>
                        <span className="tracking-wide">Sınıflar</span>
                    </button>
                    <button onClick={() => setActiveTab('announcements')} className={getTabClass('announcements')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">📢</span>
                        <span className="tracking-wide">Duyurular</span>
                    </button>

                    <button onClick={() => setActiveTab('messages')} className={getTabClass('messages')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">✉️</span>
                        <span className="tracking-wide">İletişim & Destek</span>
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={getTabClass('profile')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
                        <span className="tracking-wide">Profil </span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl transition-colors font-bold shadow-sm border border-red-100 hover:border-red-200">
                        <span>🚪</span>
                        <span>Güvenli Çıkış</span>
                    </button>
                </div>
            </aside>

            {/* 📡 Ana İçerik Ekranı */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">

                {/* 👤 ÜST BAŞLIK VE PROFİL ALANI */}
                <header className="bg-white border-b border-slate-200 px-10 py-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{profileData.schoolName}</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">Sayın {profileData.name} - <span className="font-bold text-blue-600">{profileData.roleTitle}</span></p>
                    </div>

                    {/* Sağ Üst Açılır Menü (Dropdown) Z-INDEX DÜZELTİLDİ */}
                    <div className="relative z-30">
                        {isDropdownOpen && <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>}

                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`relative z-50 flex items-center gap-3 bg-white border px-2 py-2 pr-5 rounded-full hover:bg-slate-50 transition-all shadow-sm group ${isDropdownOpen ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black shadow-inner tracking-tighter">
                                {getInitials(profileData.name)}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">{profileData.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5 uppercase flex items-center gap-1">Hesabım <span className="text-[8px]">▼</span></p>
                            </div>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in-down origin-top-right z-50">
                                <div className="p-4 border-b border-slate-100 bg-slate-50">
                                    <p className="text-sm font-bold text-slate-800">{profileData.name}</p>
                                    <p className="text-xs text-slate-500 font-medium truncate">{profileData.email}</p>
                                </div>
                                <div className="py-2">
                                    <button onClick={() => { setIsDropdownOpen(false); setActiveTab('profile'); }} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-3">
                                        <span className="text-lg">👤</span> Profili Görüntüle
                                    </button>
                                </div>
                                <div className="py-2 border-t border-slate-100">
                                    <button onClick={() => { setIsDropdownOpen(false); setActiveTab('messages'); }} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-3">
                                        <span className="text-lg">✉️</span> İletişim & Destek
                                    </button>
                                </div>
                                <div className="py-2 border-t border-slate-100">
                                    <button onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                                        <span className="text-lg">🚪</span> Sistemden Çıkış
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* 🧩 DİNAMİK İÇERİK ALANI */}
                <div className="flex-1 overflow-y-auto flex flex-col p-10">

                    {/* İçerik */}
                    <div className="flex-1">
                        {activeTab === 'overview' && (
                            <div className="animate-fade-in-down max-w-6xl mx-auto">
                                {/* İçerik Başlığı */}
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                        <span>📊</span> Sistem Özeti
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium mt-1">Kurumunuza ait güncel istatistikler ve anlık durum raporu.</p>
                                </div>

                                {loading ? (
                                    <div className="text-center py-10 text-slate-400 font-medium animate-pulse">Veriler yükleniyor...</div>
                                ) : (
                                    <>
                                        {/* İstatistik Kartları */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                            <div onClick={() => setActiveTab('students')} className="cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col items-center justify-center text-center group">
                                                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
                                                <h4 className="text-4xl font-black text-slate-800 mb-1">{stats.students}</h4>
                                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Kayıtlı Öğrenci</p>
                                            </div>
                                            <div onClick={() => setActiveTab('teachers')} className="cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col items-center justify-center text-center group">
                                                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">👩‍🏫</div>
                                                <h4 className="text-4xl font-black text-slate-800 mb-1">{stats.teachers}</h4>
                                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Aktif Öğretmen</p>
                                            </div>
                                            <div onClick={() => setActiveTab('classes')} className="cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col items-center justify-center text-center group">
                                                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🏫</div>
                                                <h4 className="text-4xl font-black text-slate-800 mb-1">{stats.classes}</h4>
                                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Mevcut Sınıf</p>
                                            </div>
                                            <div onClick={() => setActiveTab('parents')} className="cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-400 transition-all flex flex-col items-center justify-center text-center group">
                                                <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">👨‍👩‍👧</div>
                                                <h4 className="text-4xl font-black text-slate-800 mb-1">{stats.parents}</h4>
                                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Sistemdeki Veli</p>
                                            </div>
                                        </div>

                                        {/* Geniş Bilgi Kartı */}
                                        <div onClick={() => setActiveTab('announcements')} className="cursor-pointer bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex items-center justify-between group">
                                            <div className="flex items-start gap-4">
                                                <div className="text-2xl mt-1 group-hover:scale-110 transition-transform">📢</div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 mb-1">İletişim Durumu</h4>
                                                    <p className="text-sm text-slate-600 font-medium">Sistemde şu ana kadar kurumunuza ait toplam <span className="font-bold text-slate-900">{stats.announcements}</span> adet duyuru yayınlandı.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* GELECEKTE EKLENECEK SEKME ALANLARI */}
                        {activeTab === 'students' && <div className="h-full"><StudentManagementTab /></div>}
                        {activeTab === 'parents' && <div className="h-full"><ParentTab /></div>}
                        {activeTab === 'teachers' && <div className="h-full"><TeacherTab /></div>}
                        {activeTab === 'classes' && <div className="h-full"><ClassroomTab /></div>}
                        {activeTab === 'announcements' && <div className="h-full"><AnnouncementTab /></div>}
                        {activeTab === 'profile' && <div className="h-full"><ProfileTab /></div>}
                        {activeTab === 'messages' && <div className="h-full"><ContactTab /></div>}
                    </div>

                    {/* 🦶 FOOTER (Alt Bilgi) */}
                    <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-sm font-medium">
                        © 2026 EduConnect Kurum Yönetim Sistemi. Tüm hakları saklıdır.
                    </footer>
                </div>
            </main>

            {/* 🚨 ÇIKIŞ ONAY PENCERESİ */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-200 relative animate-scale-in z-50">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <span className="text-3xl">🚪</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sistemden Çıkış</h3>
                            <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">Güvenli bir şekilde oturumunuzu sonlandırmak istediğinize emin misiniz?</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-colors">İPTAL</button>
                            <button onClick={handleLogoutConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-red-600/20 transition-all">ÇIKIŞ YAP</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;