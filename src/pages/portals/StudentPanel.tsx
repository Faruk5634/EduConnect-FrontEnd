import {
    Megaphone, MessageSquare, UserCircle, LogOut, ArrowLeft,
    Home, School, ChevronDown, Bell, BookOpen, Paperclip
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';
import { useStudentProfile } from '../../hooks/useProfile';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { useMessages } from '../../hooks/useMessages';
import type { Announcement, Message } from '../../types/panelTypes';

import SharedAnnouncementModule from '../../components/shared/SharedAnnouncementModule';
import SharedMessagingModule from '../../components/shared/SharedMessagingModule';
import SharedProfileModule from '../../components/shared/SharedProfileModule';

type TabId = 'overview' | 'announcements' | 'messages' | 'profile';

export default function StudentPanel() {
    const navigate = useNavigate();
    const location = useLocation();

    const isParentViewing = location.state?.isParentViewing || false;
    const studentSchoolNumber = location.state?.studentSchoolNumber;

    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const fetchUrl = isParentViewing && studentSchoolNumber
        ? `/students/number/${studentSchoolNumber}` : null;
    const { profile, loading: profileLoading, refresh: refreshProfile } = useStudentProfile(fetchUrl);

    const { announcements: rawAnnouncements, loading: announcementsLoading, fetchAll: fetchAnnouncements } = useAnnouncements();
    const { messages, loading: messagesLoading, fetchAll: fetchMessages, send: sendMessage, markRead } = useMessages();

    const loading = profileLoading || announcementsLoading || messagesLoading;

    // ─── History API: Geri/İleri Tuşu Koruması ──────────────────────────────
    const handleTabChange = (tab: TabId) => {
        setActiveTab(tab);
        window.history.pushState({ tab }, '', window.location.pathname);
    };

    const isNotHomeRef = useRef(activeTab !== 'overview');

    useEffect(() => {
        window.history.replaceState({ tab: 'overview' }, '', window.location.pathname);

        const handlePopState = (event: PopStateEvent) => {
            const prevTab = event.state?.tab as TabId | undefined;
            if (!prevTab || prevTab === 'overview') {
                setActiveTab('overview');
                setShowLogoutModal(true);
                window.history.pushState({ tab: 'overview' }, '', window.location.pathname);
            } else {
                setActiveTab(prevTab);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        isNotHomeRef.current = activeTab !== 'overview';
    }, [activeTab]);
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        refreshProfile();
        fetchAnnouncements();
        fetchMessages();
    }, []);

    const validAnnouncements = rawAnnouncements.filter(ann => {
        if (!ann.targetClasses?.length) return true;
        return ann.targetClasses.includes('Genel Duyuru') || ann.targetClasses.includes(profile?.grade || '');
    });

    const recentAnnouncements = [...validAnnouncements]
        .sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime())
        .slice(0, 4);

    const unreadCount = messages.filter(m => m.type === 'INBOX' && !m.isRead).length;

    const handleSendMessage = async (receiverId: string, subject: string, content: string) => {
        if (!receiverId) { showToast('Lütfen listeden bir alıcı seçin.', 'error'); return; }
        try {
            await sendMessage({ receiverId, subject, content });
            showToast('Mesaj başarıyla gönderildi!', 'success');
            await fetchMessages();
        } catch { showToast('Mesaj gönderilemedi.', 'error'); }
    };

    const handleReadMessage = async (msg: Message) => {
        if (msg.type === 'INBOX' && !msg.isRead) await markRead(msg.id);
    };

    const handleProfileUpdate = async (viewMode: string, formData: any) => {
        if (isParentViewing) { showToast('Öğrenci bilgileri veli yetkisiyle güncellenemez.', 'error'); return; }
        try {
            if (viewMode === 'editPassword') {
                await api.put('/users/me', { password: formData.newPassword, currentPassword: formData.currentPassword });
            } else {
                await api.put('/users/me', { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone });
            }
            showToast('Profil bilgileriniz başarıyla güncellendi.', 'success');
            await refreshProfile();
        } catch { showToast('Profil güncellenemedi.', 'error'); }
    };

    const handleLogoutConfirm = () => { localStorage.clear(); navigate('/', { replace: true }); };

    const getInitials = (first?: string, last?: string) => {
        if (!first || !last) return 'ÖG';
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    const getTypeBadge = (type: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            HOMEWORK:  { label: 'Ödev',    cls: 'bg-amber-100 text-amber-700' },
            EXAM:      { label: 'Sınav',   cls: 'bg-red-100 text-red-700' },
            EXAM_INFO: { label: 'Sınav',   cls: 'bg-red-100 text-red-700' },
            EVENT:     { label: 'Etkinlik',cls: 'bg-purple-100 text-purple-700' },
        };
        const d = map[type] ?? { label: 'Genel', cls: 'bg-sky-100 text-sky-700' };
        return <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg ${d.cls}`}>{d.label}</span>;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sky-600 font-bold animate-pulse text-xl">
            Öğrenci Paneli Yükleniyor...
        </div>
    );

    const navItems: Array<{ id: TabId; label: string; icon: React.ElementType; badge?: number }> = [
        { id: 'overview',      label: 'Anasayfa',        icon: Home },
        { id: 'announcements', label: 'Duyuru & Ödevler',icon: Megaphone },
        { id: 'messages',      label: 'İletişim',         icon: MessageSquare, badge: unreadCount },
        { id: 'profile',       label: 'Profilim',         icon: UserCircle },
    ];

    return (
        <div className="font-sans min-h-screen bg-slate-50 flex overflow-hidden text-slate-800">

            {/* ── SOL MENÜ (Sidebar) ─────────────────────────────────────────── */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20 flex-shrink-0">
                {/* Logo */}
                <button
                    onClick={() => handleTabChange('overview')}
                    className="h-20 flex items-center px-6 border-b border-slate-100 w-full text-left hover:bg-sky-50/50 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:bg-sky-700 transition-colors">
                            <School className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">EduConnect</h1>
                            <div className="flex items-center gap-1.5">
                                <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Öğrenci Portalı</p>
                                {isParentViewing && (
                                    <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">Veli</span>
                                )}
                            </div>
                        </div>
                    </div>
                </button>

                {/* Nav Items */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                                    isActive
                                        ? 'bg-sky-50 text-sky-700 shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                                    <span>{item.label}</span>
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

                {/* Footer */}
                <div className="p-4 border-t border-slate-100">
                    {isParentViewing ? (
                        <button
                            onClick={() => navigate('/parent')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors font-semibold"
                        >
                            <ArrowLeft className="w-5 h-5" /> Veli Paneline Dön
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                        >
                            <LogOut className="w-5 h-5" /> Çıkış Yap
                        </button>
                    )}
                </div>
            </aside>

            {/* ── SAĞ KISIM ──────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* ÜST BAR */}
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
                                className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-700">{profile?.firstName} {profile?.lastName}</p>
                                <p className="text-[11px] font-semibold text-slate-500">
                                    {profile?.grade ? `${profile.grade} Sınıfı` : 'Sınıf Ataması Bekleniyor'}
                                </p>
                            </div>
                            <div className="relative">
                                <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center font-bold text-lg border border-sky-200 shadow-sm">
                                    {getInitials(profile?.firstName, profile?.lastName)}
                                </div>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isDropdownOpen && (
                            <div
                                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                                onMouseLeave={() => setIsDropdownOpen(false)}
                            >
                                <div className="p-4 border-b border-slate-100 bg-slate-50">
                                    <p className="font-bold text-slate-700">{profile?.firstName} {profile?.lastName}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{profile?.email || 'E-posta belirtilmemiş'}</p>
                                    {profile?.grade && (
                                        <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-lg mt-1.5">
                                            <School className="w-3 h-3" /> {profile.grade} Sınıfı
                                        </span>
                                    )}
                                </div>
                                <div className="p-2 space-y-1">
                                    <button onClick={() => { handleTabChange('profile'); setIsDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors flex items-center gap-2">
                                        <UserCircle className="w-4 h-4" /> Profilimi Görüntüle
                                    </button>
                                    <button onClick={() => { handleTabChange('messages'); setIsDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4" /> Bildirimler
                                        </div>
                                        {unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                                        )}
                                    </button>
                                </div>
                                <div className="p-2 border-t border-slate-100">
                                    {isParentViewing ? (
                                        <button onClick={() => navigate('/parent')}
                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-sky-600 hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-2">
                                            <ArrowLeft className="w-4 h-4" /> Veli Paneline Dön
                                        </button>
                                    ) : (
                                        <button onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
                                            <LogOut className="w-4 h-4" /> Çıkış Yap
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    </div>

                </header>

                {/* ANA İÇERİK */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto">

                        {/* ── ANASAYFA ─────────────────────────────────────────────── */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Hoş Geldin Kartı */}
                                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-8 py-6 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white tracking-tight">
                                                Merhaba, {profile?.firstName}! 👋
                                            </h2>
                                            <p className="text-sky-100 font-medium mt-1">
                                                Derslerinde başarılar. Güncel okul durumun aşağıdadır.
                                            </p>
                                        </div>
                                        {/* Sınıf Rozeti */}
                                        {profile?.grade && (
                                            <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 text-center">
                                                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Sınıfın</p>
                                                <p className="text-3xl font-black text-white leading-none">{profile.grade}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stat Widgetları */}
                                    <div className="grid grid-cols-3 divide-x divide-slate-100">
                                        <div
                                            className="p-5 flex items-center gap-4 cursor-pointer hover:bg-sky-50/50 transition-colors group"
                                            onClick={() => handleTabChange('announcements')}
                                        >
                                            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center group-hover:bg-sky-100 transition-colors flex-shrink-0">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bekleyen Duyurular</p>
                                                <p className="text-2xl font-black text-slate-800">{validAnnouncements.length}</p>
                                            </div>
                                        </div>
                                        <div
                                            className="p-5 flex items-center gap-4 cursor-pointer hover:bg-sky-50/50 transition-colors group"
                                            onClick={() => handleTabChange('messages')}
                                        >
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                                                <MessageSquare className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Okunmamış Mesaj</p>
                                                <p className="text-2xl font-black text-slate-800">{unreadCount}</p>
                                            </div>
                                        </div>
                                        <div className="p-5 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <School className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sınıfım</p>
                                                <p className="text-2xl font-black text-slate-800">{profile?.grade || '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Son Duyurular Feed */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-700">Son Duyurular</h3>
                                        <button
                                            onClick={() => handleTabChange('announcements')}
                                            className="text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                                        >
                                            Tümünü Gör →
                                        </button>
                                    </div>

                                    {recentAnnouncements.length === 0 ? (
                                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-10 text-center">
                                            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500 font-medium">Henüz bir duyuru yok.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentAnnouncements.map((ann: Announcement) => (
                                                <div
                                                    key={ann.id}
                                                    className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex items-start gap-4 hover:shadow-md hover:border-sky-200 transition-all cursor-pointer group"
                                                    onClick={() => handleTabChange('announcements')}
                                                >
                                                    {/* Sol renk çizgisi */}
                                                    <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                                                        ann.type === 'HOMEWORK' ? 'bg-amber-400' :
                                                        ann.type === 'EXAM' || ann.type === 'EXAM_INFO' ? 'bg-red-400' :
                                                        ann.type === 'EVENT' ? 'bg-purple-400' : 'bg-sky-400'
                                                    }`}></div>

                                                    {/* Avatar */}
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-sky-100 group-hover:text-sky-700 transition-colors">
                                                        {ann.authorName?.charAt(0) || '?'}
                                                    </div>

                                                    {/* İçerik */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            {getTypeBadge(ann.type)}
                                                            <span className="text-xs text-slate-400 font-semibold">
                                                                {ann.authorName} • {new Date(ann.createdDate || '').toLocaleDateString('tr-TR')}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-800 truncate group-hover:text-sky-700 transition-colors">{ann.title}</h4>
                                                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{ann.content}</p>
                                                    </div>

                                                    {/* Ek dosya göstergesi */}
                                                    {ann.attachedFiles && ann.attachedFiles.length > 0 && (
                                                        <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold flex-shrink-0">
                                                            <Paperclip className="w-3.5 h-3.5" />
                                                            {ann.attachedFiles.length}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── DUYURU & ÖDEVLER ─────────────────────────────────────── */}
                        {activeTab === 'announcements' && (
                            <div className="animate-fade-in">
                                <SharedAnnouncementModule
                                    announcements={validAnnouncements}
                                    userGrade={profile?.grade}
                                    theme="sky"
                                />
                            </div>
                        )}

                        {/* ── İLETİŞİM ─────────────────────────────────────────────── */}
                        {activeTab === 'messages' && (
                            <div className="h-[calc(100vh-140px)] animate-fade-in -mx-8 -my-8">
                                <SharedMessagingModule
                                    messages={messages}
                                    userRoleLabel="Öğrenci Hesabı"
                                    theme="sky"
                                    onSendMessage={handleSendMessage}
                                    onReadMessage={handleReadMessage}
                                />
                            </div>
                        )}

                        {/* ── PROFİL ───────────────────────────────────────────────── */}
                        {activeTab === 'profile' && (
                            <div className="max-w-4xl mx-auto animate-fade-in w-full py-4">
                                <SharedProfileModule
                                    theme="sky"
                                    headerInfo={{
                                        initials: getInitials(profile?.firstName, profile?.lastName),
                                        firstName: profile?.firstName || '',
                                        lastName: profile?.lastName || '',
                                        badgeText: profile?.grade ? `${profile.grade} Sınıfı` : undefined,
                                        schoolName: profile?.schoolName || ''
                                    }}
                                    contactInfo={[
                                        { label: 'Kullanıcı Adı', value: `@${profile?.username}` },
                                        { label: 'Telefon', value: profile?.phone || '-' },
                                        { label: 'E-Posta', value: profile?.email || '-' }
                                    ]}
                                    additionalInfoTitle="Kayıt Bilgileri"
                                    additionalInfo={[
                                        { label: 'Okul Numarası', value: profile?.schoolNumber || '-' },
                                        { label: 'Kayıtlı Veli', value: profile?.parentFullName || 'Belirtilmemiş' }
                                    ]}
                                    initialFormState={{
                                        firstName: profile?.firstName || '',
                                        lastName: profile?.lastName || '',
                                        email: profile?.email || '',
                                        phone: profile?.phone || ''
                                    }}
                                    onUpdateProfile={handleProfileUpdate}
                                    hideEditOptions={isParentViewing}
                                />
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ── ÇIKIŞ MODALI ─────────────────────────────────────────────── */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-100 text-center animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                            <LogOut className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Sistemden Çıkış</h3>
                        <p className="text-slate-500 font-medium mt-2 mb-8 text-lg">
                            Oturumunuzu sonlandırmak istediğinize emin misiniz?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold transition-colors"
                            >
                                İPTAL
                            </button>
                            <button
                                onClick={handleLogoutConfirm}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-200 transition-all"
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