import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';
import { useTeacherProfile } from '../../hooks/useProfile';
import { useMessages } from '../../hooks/useMessages';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { API_BASE } from '../../services/api';
import SharedMessagingModule from '../../components/shared/SharedMessagingModule';
import TeacherAnnouncementManager from '../../components/teacher/TeacherAnnouncementManager';
import SharedProfileModule from '../../components/shared/SharedProfileModule';
import type { ClassroomInfo, Announcement } from '../../types/panelTypes';
import {
    Megaphone, MessageSquare, UserCircle, LogOut, GraduationCap,
    LayoutDashboard, Bell, History, Trash2, Folder, ChevronDown
} from 'lucide-react';

type TabId = 'overview' | 'announcements' | 'past-announcements' | 'messages' | 'profile';

export default function TeacherPanel() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const { profile, loading: profileLoading, setProfile } = useTeacherProfile();
    const [allClassrooms, setAllClassrooms] = useState<ClassroomInfo[]>([]);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { messages, loading: messagesLoading, fetchAll: fetchMessages, send: sendMessage, markRead } = useMessages();
    const { announcements, loading: announcementsLoading, fetchAll: fetchAllAnnouncements, create: createAnnouncement, remove: removeAnnouncement } = useAnnouncements();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loading = profileLoading || messagesLoading || announcementsLoading;

    // ─── History API: Geri/İleri Tuşu Koruması ─────────────────────────────
    const handleTabChange = useCallback((tab: TabId) => {
        setActiveTab(tab);
        // Her sekme değişiminde history stack'e state bas
        window.history.pushState({ tab }, '', window.location.pathname);
    }, []);

    useEffect(() => {
        // Başlangıçta overview için history entry oluştur
        window.history.replaceState({ tab: 'overview' }, '', window.location.pathname);

        const handlePopState = (event: PopStateEvent) => {
            const previousTab = event.state?.tab as TabId | undefined;

            if (!previousTab || previousTab === 'overview') {
                // Ana ekrana dönülüyorsa veya daha ileriye gidemiyorsak → çıkış modalı
                setActiveTab('overview');
                setShowLogoutModal(true);
                // Geri gidilmesini önlemek için tekrar state ekle
                window.history.pushState({ tab: 'overview' }, '', window.location.pathname);
            } else {
                setActiveTab(previousTab);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (activeTab === 'announcements' || activeTab === 'past-announcements') {
            fetchAllAnnouncements();
        }
    }, [activeTab, fetchAllAnnouncements]);

    const fetchInitialData = async () => {
        try {
            const profileRes = await api.get('/teachers/me');
            setProfile(profileRes.data);
            const classesRes = await api.get('/classrooms');
            setAllClassrooms(classesRes.data);
            await fetchMessages();
        } catch (error) {
            showToast('Bilgiler yüklenirken bir hata oluştu.', 'error');
        }
    };

    const handleProfileUpdate = async (mode: string, formData: any) => {
        try {
            if (mode === 'editPassword') {
                if (!formData.currentPassword || !formData.newPassword) return showToast('Lütfen şifreleri girin.', 'error');
                await api.put('/users/me', { password: formData.newPassword, currentPassword: formData.currentPassword });
            } else {
                await api.put('/users/me', {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone
                });
            }
            showToast('Profiliniz başarıyla güncellendi.', 'success');
            const profileRes = await api.get('/teachers/me');
            setProfile(profileRes.data);
        } catch (error) {
            showToast('Profil güncellenemedi.', 'error');
        }
    };

    const handleLogoutConfirm = () => {
        localStorage.clear();
        navigate('/', { replace: true });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600 font-bold animate-pulse text-xl">
            Öğretmen Paneli Yükleniyor...
        </div>
    );

    const unreadCount = messages.filter(m => m.type === 'INBOX' && !m.isRead).length;
    const thisMonthAnnouncements = announcements.filter(a => {
        const d = new Date(a.createdDate || a.date || '');
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    // Öğretmenin sorumlu olduğu sınıflar (homeroomClasses), tüm sınıflar değil
    const myClassCount = profile?.homeroomClasses?.length ?? 0;

    const navItems: Array<{ id: TabId; label: string; icon: React.ElementType; badge?: number }> = [
        { id: 'overview', label: 'Ana Ekran', icon: LayoutDashboard },
        { id: 'announcements', label: 'Duyuru Fırlat', icon: Megaphone },
        { id: 'past-announcements', label: 'Geçmiş Duyurular', icon: History },
        { id: 'messages', label: 'Mesaj Merkezi', icon: MessageSquare, badge: unreadCount },
        { id: 'profile', label: 'Profilim', icon: UserCircle },
    ];

    return (
        <div className="font-sans min-h-screen bg-slate-50 flex overflow-hidden text-slate-800">

            {/* SOL MENÜ (Sidebar) */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20 flex-shrink-0">
                {/* Tıklanabilir Logo */}
                <button
                    onClick={() => handleTabChange('overview')}
                    className="h-20 flex items-center px-6 border-b border-slate-100 w-full text-left hover:bg-emerald-50/50 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:bg-emerald-700 transition-colors">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">EduConnect</h1>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Öğretmen Paneli</p>
                        </div>
                    </div>
                </button>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        // "Geçmiş Duyurular" sekmesi "Duyuru Fırlat" altında görsel olarak içeriye girintili
                        const isSubItem = item.id === 'past-announcements';
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                                    isActive
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'} ${isSubItem ? 'w-4 h-4' : ''}`} />
                                    <span className={isSubItem ? 'text-sm' : ''}>{item.label}</span>
                                </div>
                                {item.badge && item.badge > 0 ? (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                    >
                        <LogOut className="w-5 h-5" />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* SAĞ KISIM (Header + Content) */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* ÜST BAR (Navbar) */}
                <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-end shadow-sm z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        
                        <div className="relative cursor-pointer hidden sm:block">
                            <div className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 transition-colors">
                                <Bell className="w-5 h-5 text-slate-600" />
                            </div>
                            {unreadCount > 0 && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                            )}
                        </div>
                        <div className="relative">
                            <div
                                className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-700">{profile?.firstName} {profile?.lastName}</p>
                                <p className="text-[11px] font-semibold text-slate-500">{profile?.branch || 'Öğretmen'} • {profile?.schoolName || 'Okul'}</p>
                            </div>
                            <div className="relative">
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg border border-emerald-200 shadow-sm">
                                    {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                                </div>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isDropdownOpen && (
                            <div
                                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in"
                                onMouseLeave={() => setIsDropdownOpen(false)}
                            >
                                <div className="p-4 border-b border-slate-100 bg-slate-50">
                                    <p className="font-bold text-slate-700">{profile?.firstName} {profile?.lastName}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{profile?.branch} • {profile?.schoolName}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">@{profile?.username}</p>
                                </div>
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => { handleTabChange('profile'); setIsDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <UserCircle className="w-4 h-4" /> Profilimi Görüntüle
                                    </button>
                                    <button
                                        onClick={() => { handleTabChange('messages'); setIsDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors flex items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4" /> Bildirimler
                                        </div>
                                        {unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </div>
                                <div className="p-2 border-t border-slate-100">
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" /> Çıkış Yap
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    </div>

                </header>

                {/* ANA İÇERİK ALANI */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-6xl mx-auto h-full flex flex-col">

                        {/* ANA EKRAN (Overview) */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                                        Hoş Geldiniz, {profile?.firstName} {profile?.lastName} 👋
                                    </h2>
                                    <p className="text-slate-500 mt-2 text-lg">Bugün okulda harika işler başarmak için güzel bir gün!</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Sorumlu Olduğum Sınıflar */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer" onClick={() => handleTabChange('past-announcements')}>
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <GraduationCap className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Sorumlu Olduğum Sınıflar</p>
                                            <p className="text-3xl font-black text-slate-800">{myClassCount}</p>
                                        </div>
                                    </div>
                                    {/* Okunmamış Mesajlar */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => handleTabChange('messages')}>
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                            <MessageSquare className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Okunmamış Mesajlar</p>
                                            <p className="text-3xl font-black text-slate-800">{unreadCount}</p>
                                        </div>
                                    </div>
                                    {/* Bu Ayki Duyurular */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer" onClick={() => handleTabChange('announcements')}>
                                        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                                            <Megaphone className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Bu Ayki Duyurular</p>
                                            <p className="text-3xl font-black text-slate-800">{thisMonthAnnouncements}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Hızlı Erişim */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-4">Hızlı Erişim</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleTabChange('announcements')}
                                            className="bg-white border border-slate-100 rounded-2xl p-5 text-left hover:shadow-md hover:border-emerald-200 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                    <Megaphone className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">Yeni Duyuru Fırlat</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Sınıflarınıza duyuru gönderin</p>
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleTabChange('messages')}
                                            className="bg-white border border-slate-100 rounded-2xl p-5 text-left hover:shadow-md hover:border-blue-200 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <MessageSquare className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">Mesaj Merkezi</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{unreadCount > 0 ? `${unreadCount} okunmamış mesajınız var` : 'Mesajlarınızı görüntüleyin'}</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* DUYURU FIRLAT */}
                        {activeTab === 'announcements' && (
                            <div className="h-full flex flex-col animate-fade-in">
                                <TeacherAnnouncementManager
                                    allClassrooms={allClassrooms}
                                    onCreateAnnouncement={async (formData) => {
                                        setIsSubmitting(true);
                                        await createAnnouncement(formData);
                                        setIsSubmitting(false);
                                    }}
                                    isSubmitting={isSubmitting}
                                />
                            </div>
                        )}

                        {/* GEÇMİŞ DUYURULAR */}
                        {activeTab === 'past-announcements' && (
                            <div className="animate-fade-in space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                                        <span className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                                            <History className="w-5 h-5" />
                                        </span>
                                        Geçmiş Duyurularım
                                    </h2>
                                    <p className="text-slate-500 font-medium mt-1 ml-14">Daha önce gönderdiğiniz tüm duyurular aşağıda listelenmiştir.</p>
                                </div>

                                {announcementsLoading ? (
                                    <div className="text-center py-20 text-emerald-600 font-bold animate-pulse">Yükleniyor...</div>
                                ) : announcements.length === 0 ? (
                                    <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                                        <Megaphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold text-lg">Henüz bir duyuru yayınlamadınız.</p>
                                        <button
                                            onClick={() => handleTabChange('announcements')}
                                            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                                        >
                                            İlk Duyuruyu Fırlat
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {announcements.map((ann: Announcement) => (
                                            <div key={ann.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start justify-between group hover:border-emerald-200 transition-colors">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                                                            ann.type === 'EXAM' ? 'bg-red-100 text-red-700' :
                                                            ann.type === 'HOMEWORK' ? 'bg-amber-100 text-amber-700' :
                                                            ann.type === 'EVENT' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                            {ann.type === 'GENERAL' ? 'Genel' :
                                                             ann.type === 'HOMEWORK' ? 'Ödev' :
                                                             ann.type === 'EXAM' ? 'Sınav' :
                                                             ann.type === 'EVENT' ? 'Etkinlik' : ann.type}
                                                        </span>
                                                        <span className="text-slate-400 text-sm font-semibold">
                                                            {new Date(ann.createdDate || '').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </span>
                                                        {ann.targetClasses && ann.targetClasses.length > 0 && (
                                                            <span className="text-slate-400 text-sm font-semibold">
                                                                → {ann.targetClasses.join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{ann.title}</h3>
                                                    <p className="text-slate-600 font-medium whitespace-pre-wrap leading-relaxed line-clamp-3">{ann.content}</p>
                                                    {ann.attachedFiles && ann.attachedFiles.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {ann.attachedFiles.map((att, idx) => (
                                                                <a key={idx} href={`${API_BASE}${att.fileUrl}`} target="_blank" rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors">
                                                                    <Folder className="w-4 h-4" /> {att.fileName}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Bu duyuruyu kaldırmak istediğinize emin misiniz?')) {
                                                            await removeAnnouncement(ann.id);
                                                        }
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 shadow-sm ml-4 flex-shrink-0"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MESAJ MERKEZİ */}
                        {activeTab === 'messages' && (
                            <div className="h-[calc(100vh-140px)] animate-fade-in -mx-8 -my-8">
                                <SharedMessagingModule
                                    messages={messages}
                                    userRoleLabel="Öğretmen"
                                    onSendMessage={async (receiverId, subject, content) => {
                                        await sendMessage({ receiverId, subject, content });
                                        await fetchMessages();
                                    }}
                                    onReadMessage={async (msg) => {
                                        if (msg.type === 'INBOX' && !msg.isRead) {
                                            await markRead(msg.id);
                                            await fetchMessages();
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* PROFİLİM */}
                        {activeTab === 'profile' && (
                            <div className="max-w-4xl mx-auto h-full animate-fade-in w-full py-4">
                                <SharedProfileModule
                                    headerInfo={{
                                        initials: profile?.firstName ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() : 'ÖP',
                                        firstName: profile?.firstName || '',
                                        lastName: profile?.lastName || '',
                                        badgeText: profile?.branch || 'Öğretmen',
                                        schoolName: profile?.schoolName || ''
                                    }}
                                    contactInfo={[
                                        { label: 'Kullanıcı Adı', value: `@${profile?.username}` },
                                        { label: 'Telefon', value: profile?.phone || '-' },
                                        { label: 'E-Posta', value: profile?.email || '-' }
                                    ]}
                                    additionalInfoTitle="Sorumlu Olduğum Sınıflar"
                                    additionalInfo={[
                                        { label: 'Sınıflar', value: profile?.homeroomClasses && profile.homeroomClasses.length > 0 ? profile.homeroomClasses.map((c: any) => c.name).join(', ') : 'Sınıf atanmamış' }
                                    ]}
                                    initialFormState={{
                                        firstName: profile?.firstName || '',
                                        lastName: profile?.lastName || '',
                                        email: profile?.email || '',
                                        phone: profile?.phone || ''
                                    }}
                                    onUpdateProfile={handleProfileUpdate}
                                />
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ÇIKIŞ ONAY MODALI */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-100 relative text-center animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                            <LogOut className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-slate-800">Sistemden Çıkış</h3>
                        <p className="text-slate-500 font-medium mt-2 mb-8 text-lg">Oturumunuzu sonlandırmak istediğinize emin misiniz?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold transition-colors"
                            >
                                İPTAL
                            </button>
                            <button
                                onClick={handleLogoutConfirm}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-200"
                            >
                                ÇIKIŞ YAP
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
