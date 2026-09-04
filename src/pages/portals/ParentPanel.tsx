import {
    Megaphone, MessageSquare, UserCircle, LogOut, ArrowLeft,
    Home, School, ChevronDown, Bell, Users, GraduationCap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';
import { useMessages } from '../../hooks/useMessages';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import type { Message } from '../../types/panelTypes';

import SharedAnnouncementModule from '../../components/shared/SharedAnnouncementModule';
import SharedMessagingModule from '../../components/shared/SharedMessagingModule';
import SharedProfileModule from '../../components/shared/SharedProfileModule';

type TabId = 'overview' | 'messages' | 'profile';

interface ParentProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    username: string;
    studentNames: string[];
}

export default function ParentPanel() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

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
        fetchParentProfile();
        fetchAnnouncements();
        fetchMessages();
    }, []);

    const fetchParentProfile = async () => {
        try {
            const res = await api.get('/parents/me');
            setParentProfile(res.data);
        } catch (error) {
            console.error("Veli profili çekilemedi:", error);
            showToast("Profil bilgileri yüklenirken hata oluştu.", "error");
        } finally {
            setProfileLoading(false);
        }
    };

    // Duyuruları son eklenene göre sırala (Veliler tüm genel/sınıf duyurularını görebilir ya da backend'den gelenleri)
    const recentAnnouncements = [...rawAnnouncements]
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

    const handleParentProfileUpdate = async (mode: string, formData: any) => {
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
            showToast('Veli profiliniz başarıyla güncellendi.', 'success');
            await fetchParentProfile();
        } catch (error) {
            showToast('Profil güncellenemedi.', 'error');
        }
    };

    const handleStudentClick = (schoolNumber: string) => {
        navigate('/student', {
            state: {
                isParentViewing: true,
                studentSchoolNumber: schoolNumber
            }
        });
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/', { replace: true });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-amber-600">
                <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
                <p className="font-bold animate-pulse text-lg tracking-wider">Veli Paneli Yükleniyor...</p>
            </div>
        );
    }

    const fullName = `${parentProfile?.firstName || ''} ${parentProfile?.lastName || ''}`.trim();
    const initials = parentProfile?.firstName ? `${parentProfile.firstName.charAt(0)}${parentProfile.lastName.charAt(0)}`.toUpperCase() : 'VP';

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
            
            {/* ─── SOL MENÜ (SIDEBAR) ───────────────────────────────────────────────── */}
            <aside className="w-20 lg:w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm z-20 transition-all duration-300">
                <div>
                    <button onClick={() => handleTabChange('overview')} className="h-20 w-full flex items-center justify-center lg:justify-start lg:px-8 border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-200/50 flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                        <h1 className="hidden lg:block ml-3 text-xl font-black text-slate-800 tracking-tight text-left">
                            EduConnect<span className="text-amber-500">.</span>
                        </h1>
                    </button>

                    <nav className="p-4 space-y-2">
                        <button
                            onClick={() => handleTabChange('overview')}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                                activeTab === 'overview'
                                    ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            <Home className={`w-5 h-5 ${activeTab === 'overview' ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span className="hidden lg:block">Ana Ekran</span>
                        </button>

                        <button
                            onClick={() => handleTabChange('messages')}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all relative ${
                                activeTab === 'messages'
                                    ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            <MessageSquare className={`w-5 h-5 ${activeTab === 'messages' ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span className="hidden lg:block">Mesaj Merkezi</span>
                            {unreadCount > 0 && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => handleTabChange('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                                activeTab === 'profile'
                                    ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            <UserCircle className={`w-5 h-5 ${activeTab === 'profile' ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span className="hidden lg:block">Profilim</span>
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-100">
                    <div className="hidden lg:flex items-center gap-3 px-4 py-3 mb-2 bg-slate-50 rounded-2xl border border-slate-200">
                        <School className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 truncate">Veli Portalı</p>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Eğitim Yönetim Sistemi</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ─── ANA İÇERİK ALANI ───────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                
                {/* ── Üst Navbar ── */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight hidden sm:block">
                            {activeTab === 'overview' && 'Genel Bakış'}
                            {activeTab === 'messages' && 'Mesaj Merkezi'}
                            {activeTab === 'profile' && 'Profil Ayarları'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Bildirim İkonu (Görsel amaçlı) */}
                        <div className="relative cursor-pointer hidden sm:block">
                            <div className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 transition-colors">
                                <Bell className="w-5 h-5 text-slate-600" />
                            </div>
                            {unreadCount > 0 && (
                                <div className="absolute 0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                            )}
                        </div>

                        {/* Profil Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 p-1.5 pr-4 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-full transition-all group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-all">
                                    {initials}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-bold text-slate-800 leading-tight">{fullName || 'Veli'}</p>
                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Veli</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-amber-500 hidden md:block" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                                    <div className="px-4 py-3 border-b border-slate-50">
                                        <p className="text-sm font-bold text-slate-800">{fullName}</p>
                                        <p className="text-xs font-medium text-slate-500">@{parentProfile?.username}</p>
                                    </div>
                                    <div className="p-2">
                                        <button 
                                            onClick={() => { handleTabChange('profile'); setIsDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors flex items-center gap-2"
                                        >
                                            <UserCircle className="w-4 h-4" /> Profilim
                                        </button>
                                        <button 
                                            onClick={() => { handleTabChange('messages'); setIsDropdownOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Bell className="w-4 h-4" /> Bildirimler
                                            </div>
                                            {unreadCount > 0 && (
                                                <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>
                                        <button 
                                            onClick={() => setShowLogoutModal(true)}
                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" /> Çıkış Yap
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── İçerik Alanı ── */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
                    
                    {/* TAB: ANA EKRAN (OVERVIEW) */}
                    {activeTab === 'overview' && (
                        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
                            
                            {/* Hoş Geldin Kartı */}
                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                                {/* Dekoratif arka plan çemberi */}
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                                
                                <div className="relative z-10 flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold tracking-wider uppercase mb-4">
                                        <School className="w-4 h-4" /> EduConnect Veli Portalı
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
                                        Hoş Geldiniz!
                                    </h2>
                                    <p className="text-slate-500 font-medium text-lg">
                                        Öğrencilerinizin eğitim durumunu ve okul duyurularını buradan takip edebilirsiniz.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* SOL KOLON: Öğrencilerim */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-amber-500" /> Öğrencilerim
                                        </h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {parentProfile?.studentNames && parentProfile.studentNames.length > 0 ? (
                                            parentProfile.studentNames.map((studentStr, index) => {
                                                const [stuFullName, stuNo] = studentStr.includes('|') ? studentStr.split('|') : [studentStr, 'Belirtilmemiş'];
                                                return (
                                                    <div
                                                        key={index}
                                                        onClick={() => handleStudentClick(stuNo)}
                                                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                                                    >
                                                        {/* İnce üst çizgi efekti */}
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                                                        <div className="flex items-start gap-4 mb-6">
                                                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl font-bold group-hover:bg-amber-500 group-hover:text-white transition-colors border border-amber-100">
                                                                <GraduationCap className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-700 transition-colors">{stuFullName}</h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-bold uppercase tracking-wider">NO: {stuNo}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                                            <span className="text-sm font-bold text-slate-500 group-hover:text-amber-600 transition-colors">Panele Git</span>
                                                            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-transform rotate-180" />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                    <Users className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-700 mb-1">Öğrenci Bulunamadı</h4>
                                                <p className="text-sm text-slate-500">Sisteme kayıtlı bir öğrenciniz bulunmuyor.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SAĞ KOLON: Son Duyurular */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-0">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                <Megaphone className="w-5 h-5 text-amber-500" /> Son Duyurular
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {recentAnnouncements.length > 0 ? (
                                                recentAnnouncements.map((ann, idx) => (
                                                    <div key={idx} className="group relative pl-4 pb-4 border-l-2 border-slate-100 last:border-transparent last:pb-0">
                                                        <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-amber-400 group-hover:scale-150 transition-transform"></div>
                                                        <div className="bg-slate-50 hover:bg-white border border-transparent hover:border-amber-200 p-3 rounded-xl transition-all shadow-sm hover:shadow-md cursor-default">
                                                            <p className="text-xs font-bold text-amber-600 mb-1 uppercase tracking-widest">{ann.type === 'EXAM_INFO' ? 'SINAV BİLGİSİ' : ann.type}</p>
                                                            <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 mb-1">{ann.title}</h4>
                                                            <p className="text-xs text-slate-500 font-medium">{new Date(ann.createdDate || '').toLocaleDateString('tr-TR')} • {ann.authorName}</p>
                                                            {ann.attachmentUrl && (
                                                                <div className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded inline-flex">
                                                                    <Paperclip className="w-3 h-3" /> Ekli Dosya
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                    <p className="text-sm font-bold text-slate-500">Henüz duyuru yok.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: MESAJ MERKEZİ */}
                    {activeTab === 'messages' && (
                        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] animate-fade-in-up">
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm h-full overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-amber-600" /> Veli - Öğretmen Mesajlaşması
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">Okul yönetimi ve öğretmenlerle hızlıca iletişime geçin.</p>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <SharedMessagingModule
                                        messages={messages}
                                        userRoleLabel="Veli"
                                        onSendMessage={handleSendMessage}
                                        onReadMessage={handleReadMessage}
                                        theme="amber"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PROFİL */}
                    {activeTab === 'profile' && (
                        <div className="max-w-4xl mx-auto animate-fade-in-up">
                            <SharedProfileModule
                                headerInfo={{
                                    initials: initials,
                                    firstName: parentProfile?.firstName || '',
                                    lastName: parentProfile?.lastName || '',
                                    badgeText: 'Veli Hesabı'
                                }}
                                contactInfo={[
                                    { label: 'Kullanıcı Adı', value: `@${parentProfile?.username}` },
                                    { label: 'Telefon', value: parentProfile?.phoneNumber || '-' },
                                    { label: 'E-Posta', value: parentProfile?.email || '-' }
                                ]}
                                additionalInfoTitle="Öğrenci Bilgileri"
                                additionalInfo={[
                                    { label: 'Kayıtlı Öğrenciler', value: parentProfile?.studentNames?.length ? parentProfile.studentNames.map(s => s.split('|')[0]).join(', ') : 'Bulunmuyor' }
                                ]}
                                initialFormState={{
                                    firstName: parentProfile?.firstName || '',
                                    lastName: parentProfile?.lastName || '',
                                    email: parentProfile?.email || '',
                                    phone: parentProfile?.phoneNumber || ''
                                }}
                                onUpdateProfile={handleParentProfileUpdate}
                                theme="amber"
                            />
                        </div>
                    )}
                </div>
            </main>

            {/* ── Çıkış Modal ── */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in px-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-100 text-center animate-scale-in">
                        <div className="w-20 h-20 rounded-full bg-red-50 border-8 border-white shadow-sm flex items-center justify-center mx-auto mb-6 text-4xl">
                            <LogOut className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Çıkış Yapıyorsunuz</h3>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            Oturumunuzu sonlandırmak istediğinize emin misiniz? Öğrenci panellerinden de çıkış yapılacaktır.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => {
                                    setShowLogoutModal(false);
                                    window.history.pushState({ tab: activeTab }, '', window.location.pathname);
                                }} 
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold tracking-wide transition-colors"
                            >
                                İptal
                            </button>
                            <button 
                                onClick={handleLogout} 
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold tracking-wide shadow-md shadow-red-200 transition-colors"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
