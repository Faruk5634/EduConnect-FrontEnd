import { Megaphone, MessageSquare, UserCircle, LogOut, ArrowLeft, Home, School } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';
import { useStudentProfile } from '../../hooks/useProfile';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { useMessages } from '../../hooks/useMessages';
import type { Message } from '../../types/panelTypes';

import SharedAnnouncementModule from '../../components/shared/SharedAnnouncementModule';
import SharedMessagingModule from '../../components/shared/SharedMessagingModule';
import SharedProfileModule from '../../components/shared/SharedProfileModule';

export default function StudentPanel() {
    const navigate = useNavigate();
    const location = useLocation();

    const isParentViewing = location.state?.isParentViewing || false;
    const studentSchoolNumber = location.state?.studentSchoolNumber;

    const [activeTab, setActiveTab] = useState('overview');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const fetchUrl = isParentViewing && studentSchoolNumber ? `/students/number/${studentSchoolNumber}` : null;
    const { profile, loading: profileLoading, refresh: refreshProfile } = useStudentProfile(fetchUrl);

    const { announcements: rawAnnouncements, loading: announcementsLoading, fetchAll: fetchAnnouncements } = useAnnouncements();
    const { messages, loading: messagesLoading, fetchAll: fetchMessages, send: sendMessage, markRead } = useMessages();

    const loading = profileLoading || announcementsLoading || messagesLoading;

    // Handle back button effectively
    const isNotHome = activeTab !== 'overview';
    const isNotHomeRef = useRef(isNotHome);

    useEffect(() => {
        window.history.replaceState({ page: 'base' }, '', window.location.href);
        window.history.pushState({ page: 'trap' }, '', window.location.href);

        const handlePopState = () => {
            if (isNotHomeRef.current) {
                setActiveTab('overview');
            } else {
                setShowLogoutModal(true);
                window.history.pushState({ page: 'trap' }, '', window.location.href);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        if (isNotHome && !isNotHomeRef.current) {
            window.history.pushState({ page: 'subpage' }, '', window.location.href);
        }
        isNotHomeRef.current = isNotHome;
    }, [isNotHome]);

    const fetchInitialData = async () => {
        await Promise.all([
            refreshProfile(),
            fetchAnnouncements(),
            fetchMessages()
        ]);
    };

    const handleSendMessage = async (receiverId: string, subject: string, content: string) => {
        if (!receiverId) {
            showToast('Lütfen listeden bir alıcı seçin.', 'error');
            return;
        }

        try {
            await sendMessage({ receiverId, subject, content });
            showToast('Mesaj başarıyla gönderildi!', 'success');
            await fetchInitialData();
        } catch {
            showToast('Mesaj gönderilemedi.', 'error');
        }
    };

    const handleReadMessage = async (msg: Message) => {
        if (msg.type === 'INBOX' && !msg.isRead) {
            await markRead(msg.id);
        }
    };

    const handleProfileUpdate = async (viewMode: string, formData: any) => {
        if (isParentViewing) {
            showToast('Öğrenci bilgileri veli yetkisiyle güncellenemez.', 'error');
            return;
        }

        try {
            if (viewMode === 'editPassword') {
                if (!formData.currentPassword || !formData.newPassword) {
                    showToast('Lütfen mevcut ve yeni şifrenizi girin.', 'error');
                    return;
                }
                await api.put('/users/me', {
                    password: formData.newPassword,
                    currentPassword: formData.currentPassword
                });
            } else {
                await api.put('/users/me', {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone
                });
            }
            showToast('Profil bilgileriniz başarıyla güncellendi.', 'success');
            await fetchInitialData();
        } catch {
            showToast('Profil güncellenemedi.', 'error');
        }
    };

    const handleLogoutConfirm = () => {
        localStorage.clear();
        navigate('/', { replace: true });
    };

    const getInitials = (first?: string, last?: string) => {
        if (!first || !last) return 'ÖG';
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    const validAnnouncements = rawAnnouncements.filter(ann => {
        const matchesClass = !profile?.grade || !ann.targetClasses?.length
            ? true
            : ann.targetClasses.includes('Genel Duyuru') || ann.targetClasses.includes(profile.grade);
        return matchesClass;
    });

    const unreadCount = messages.filter(m => m.type === 'INBOX' && !m.isRead).length;

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-transparent text-indigo-600 font-bold animate-pulse text-xl">Öğrenci Paneli Hazırlanıyor...</div>;

    return ( 
        <div className="min-h-screen bg-transparent text-slate-800 flex font-sans selection:bg-indigo-500/30">
            <aside className="w-72 glass-panel border-r border-white/40 flex flex-col shadow-lg z-10 shrink-0">
                <div onClick={() => setActiveTab('overview')} className="p-8 border-b border-slate-100 cursor-pointer hover:bg-transparent transition-colors group">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 text-indigo-600 tracking-tight group-hover:scale-105 transition-transform origin-left">
                        EduConnect
                    </h1>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold flex items-center gap-1">
                        Öğrenci Portalı
                        {isParentViewing && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md ml-1 border border-purple-200">Veli Modu</span>}
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-700'}`}>
                        <span className="text-xl group-hover:scale-110 transition-transform"><Home className="w-6 h-6" /></span>
                        <span className="tracking-wide">Anasayfa</span>
                    </button>
                    <button onClick={() => setActiveTab('announcements')} className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold ${activeTab === 'announcements' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-700'}`}>
                        <span className="text-xl group-hover:scale-110 transition-transform"><Megaphone className="w-6 h-6" /></span>
                        <span className="tracking-wide">Duyuru & Ödevler</span>
                    </button>
                    <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all group font-semibold ${activeTab === 'messages' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-700'}`}>
                        <div className="flex items-center space-x-4">
                            <span className="text-xl group-hover:scale-110 transition-transform"><MessageSquare className="w-6 h-6" /></span>
                            <span className="tracking-wide">İletişim</span>
                        </div>
                        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold tracking-tight text-slate-800">{unreadCount}</span>}
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-700'}`}>
                        <span className="text-xl group-hover:scale-110 transition-transform"><UserCircle className="w-6 h-6" /></span>
                        <span className="tracking-wide">Profilim</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    {isParentViewing ? (
                        <button onClick={() => navigate('/parent')} className="w-full flex items-center justify-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-4 rounded-xl transition-colors font-bold tracking-tight text-slate-800 shadow-lg border border-indigo-200">
                            <span className="text-xl"><ArrowLeft className="w-5 h-5" /></span>
                            <span>Veli Paneline Dön</span>
                        </button>
                    ) : (
                        <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl transition-colors font-bold shadow-lg border border-red-100 hover:border-red-200">
                            <LogOut className="w-8 h-8 text-red-500" />
                            <span>Güvenli Çıkış</span>
                        </button>
                    )}
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="glass-panel border-b border-white/40 px-10 py-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800 tracking-tight">
                            Merhaba, {profile?.firstName}!
                        </h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">{profile?.grade ? `${profile?.grade} Sınıfı Öğrencisi` : 'Sınıf Ataması Bekleniyor'}</p>
                    </div>
                    <div className="relative z-30">
                        {isDropdownOpen && <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>}
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`relative z-50 flex items-center gap-3 glass-panel border px-2 py-2 pr-5 rounded-full hover:bg-transparent transition-all shadow-lg group ${isDropdownOpen ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-white/40'}`}>
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold tracking-tight text-slate-800 shadow-inner tracking-tighter">
                                {getInitials(profile?.firstName, profile?.lastName)}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors">{profile?.firstName} {profile?.lastName}</p>
                                <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5 uppercase flex items-center gap-1">Hesabım <span className="text-[8px]">▼</span></p>
                            </div>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-64 glass-panel border border-white/40 rounded-xl shadow-xl overflow-hidden animate-fade-in-down origin-top-right z-50">
                                <div className="p-4 border-b border-slate-100 bg-transparent">
                                    <p className="text-sm font-bold text-slate-800">{profile?.firstName} {profile?.lastName}</p>
                                    <p className="text-xs text-slate-500 font-medium truncate">{profile?.email || 'E-Posta Belirtilmemiş'}</p>
                                </div>
                                <div className="py-2">
                                    <button onClick={() => { setIsDropdownOpen(false); setActiveTab('profile'); }} className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center gap-3">
                                        <span className="text-lg"><UserCircle className="w-6 h-6" /></span> Profilimi Görüntüle
                                    </button>
                                    <button onClick={() => { setIsDropdownOpen(false); setActiveTab('messages'); }} className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center gap-3">
                                        <span className="text-lg"><MessageSquare className="w-6 h-6" /></span> İletişim & Mesajlar
                                    </button>
                                </div>
                                <div className="py-2 border-t border-slate-100">
                                    {isParentViewing ? (
                                        <button onClick={() => navigate('/parent')} className="w-full text-left px-5 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-3">
                                            <span className="text-lg"><ArrowLeft className="w-5 h-5" /></span> Veli Paneline Dön
                                        </button>
                                    ) : (
                                        <button onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                                            <span className="text-lg"><LogOut className="w-8 h-8 text-red-500" /></span> Sistemden Çıkış
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 bg-transparent/50">
                    {activeTab === 'overview' && (
                        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-down">
                            <div className="bg-gradient-to-r from-indigo-600 to-blue-800 rounded-2xl p-10 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-64 h-64 glass-panel/10 rounded-full blur-[80px]"></div>
                                <h1 className="text-4xl font-bold tracking-tight text-slate-800 relative z-10">Eğitim Portalı, {profile?.firstName}!</h1>
                                <p className="mt-3 text-indigo-100 relative z-10 font-medium text-lg">Derslerinde başarılar. Güncel okul durumun aşağıdadır.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div onClick={() => setActiveTab('announcements')} className="glass-panel p-6 rounded-2xl border border-white/40 shadow-lg flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer group">
                                    <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-bold tracking-tight text-slate-800 group-hover:bg-blue-100 transition-colors"><Megaphone className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase">Sınıf Panosu</p>
                                        <p className="text-3xl font-bold tracking-tight text-slate-800 text-slate-800">{validAnnouncements.length} <span className="text-sm text-slate-400 font-medium">Duyuru</span></p>
                                    </div>
                                </div>
                                <div onClick={() => setActiveTab('messages')} className="glass-panel p-6 rounded-2xl border border-white/40 shadow-lg flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer group">
                                    <div className="w-16 h-16 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl font-bold tracking-tight text-slate-800 group-hover:bg-purple-100 transition-colors"><MessageSquare className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase">Okunmamış Mesaj</p>
                                        <p className="text-3xl font-bold tracking-tight text-slate-800 text-slate-800">{unreadCount}</p>
                                    </div>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl border border-white/40 shadow-lg flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold tracking-tight text-slate-800"><School className="w-8 h-8" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase">Sınıfın</p>
                                        <p className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800">{profile?.grade || 'Atanmadı'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <SharedAnnouncementModule
                            announcements={validAnnouncements}
                            userGrade={profile?.grade}
                        />
                    )}

                    {activeTab === 'messages' && (
                        <SharedMessagingModule
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onReadMessage={handleReadMessage}
                            userRoleLabel="Öğrenci Hesabı"
                        />
                    )}

                    {activeTab === 'profile' && (
                        <SharedProfileModule
                            headerInfo={{
                                initials: getInitials(profile?.firstName, profile?.lastName),
                                firstName: profile?.firstName || '',
                                lastName: profile?.lastName || '',
                                badgeText: profile?.grade ? `${profile?.grade} SINIFI ÖĞRENCİSİ` : undefined
                            }}
                            contactInfo={[
                                { label: 'Sistem Kullanıcı Adı', value: `@${profile?.username}`, valueClass: 'text-indigo-600' },
                                { label: 'Telefon Numarası', value: profile?.phone || 'Belirtilmemiş' },
                                { label: 'E-Posta Adresi', value: profile?.email || 'Belirtilmemiş' }
                            ]}
                            additionalInfoTitle="Kayıt Bilgileri"
                            additionalInfo={[
                                { label: 'Okul Numarası', value: profile?.schoolNumber },
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
                    )}
                </div>
            </main>

            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-fade-in">
                    <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/40 relative animate-scale-in z-50 text-center">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl"><LogOut className="w-8 h-8 text-red-500" /></span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight text-slate-800 text-slate-800 tracking-tight">Sistemden Çıkış</h3>
                        <p className="text-slate-500 font-medium text-sm mt-3 mb-8 leading-relaxed">Güvenli bir şekilde oturumunuzu sonlandırmak istediğinize emin misiniz?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl font-bold text-sm transition-colors uppercase tracking-wider">İPTAL</button>
                            <button onClick={handleLogoutConfirm} className="flex-1 btn-danger py-4 rounded-xl font-bold text-sm shadow-lg transition-all uppercase tracking-wider">ÇIKIŞ YAP</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}