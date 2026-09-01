import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';
import { useTeacherProfile } from '../../hooks/useProfile';
import { useMessages } from '../../hooks/useMessages';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import SharedMessagingModule from '../../components/shared/SharedMessagingModule';
import TeacherAnnouncementManager from '../../components/teacher/TeacherAnnouncementManager';
import SharedProfileModule from '../../components/shared/SharedProfileModule';
import type { ClassroomInfo } from '../../types/panelTypes';
import { Megaphone, MessageSquare, UserCircle, LogOut, ArrowLeft, GraduationCap } from 'lucide-react';

export default function TeacherPanel() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const { profile, loading: profileLoading, setProfile } = useTeacherProfile();
    const [allClassrooms, setAllClassrooms] = useState<ClassroomInfo[]>([]);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { messages, loading: messagesLoading, fetchAll: fetchMessages, send: sendMessage, markRead } = useMessages();
    const { announcements, loading: announcementsLoading, fetchAll: fetchAllAnnouncements, create: createAnnouncement, remove: removeAnnouncement } = useAnnouncements();
    const [announcementTab, setAnnouncementTab] = useState<'announcements' | 'my-announcements'>('announcements');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loading = profileLoading || messagesLoading || announcementsLoading;

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

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (activeTab === 'announcements') {
            fetchAllAnnouncements();
        }
    }, [activeTab, fetchAllAnnouncements]);

    const fetchInitialData = async () => {
        try {
            const profileRes = await api.get('/teachers/me');
            setProfile(profileRes.data);
            const classesRes = await api.get('/classes');
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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-transparent text-emerald-600 font-bold animate-pulse text-xl">Öğretmen Paneli Yükleniyor...</div>;

    const unreadCount = messages.filter(m => m.type === 'INBOX' && !m.isRead).length;
    const myAnnouncements = announcements.filter(a => a.authorName === `${profile?.firstName} ${profile?.lastName}`);

    return (
        <div className="font-sans min-h-screen bg-transparent flex flex-col overflow-hidden text-slate-800">
            {/* ÜST BİLGİ VE NAVİGASYON (Header) */}
            <header className="glass-panel border-b border-white/40 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('overview')}>
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold tracking-tight text-slate-800 text-2xl shadow-lg group-hover:bg-emerald-700 transition-colors">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800 text-slate-800 tracking-tight">EDUCONNECT <span className="text-emerald-600">ÖĞRETMEN</span></h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Yönetim Paneli</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Profil Dropdown */}
                    <div className="relative">
                        <div 
                            className="flex items-center gap-3 cursor-pointer hover:bg-transparent p-2 rounded-xl transition-colors border border-transparent hover:border-white/40"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-700">{profile?.firstName} {profile?.lastName}</p>
                                <p className="text-[10px] font-bold tracking-tight text-slate-800 text-emerald-600 uppercase tracking-widest">{profile?.branch || 'Öğretmen'}</p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold tracking-tight text-slate-800 border border-emerald-200">
                                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                                <div className="p-4 border-b border-slate-100 bg-transparent">
                                    <p className="font-bold text-slate-700">{profile?.firstName} {profile?.lastName}</p>
                                    <p className="text-xs text-slate-500 mt-1">@{profile?.username}</p>
                                </div>
                                <div className="p-2">
                                    <button 
                                        onClick={() => { setActiveTab('profile'); setIsDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <UserCircle className="w-4 h-4" /> Profilimi Görüntüle
                                    </button>
                                </div>
                                <div className="p-2 border-t border-slate-100">
                                    <button 
                                        onClick={() => setShowLogoutModal(true)}
                                        className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
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
            <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    
                    {/* SEÇİM EKRANI (Ana Sayfa) */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                            <div 
                                onClick={() => setActiveTab('announcements')}
                                className="glass-panel rounded-2xl p-8 border border-white/40 shadow-lg hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer group flex flex-col items-center justify-center text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <Megaphone className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800 mb-2">Duyurular</h2>
                                <p className="text-slate-500 font-medium">Öğrencilere ve velilere duyuru ve ödev gönderin.</p>
                            </div>

                            <div 
                                onClick={() => setActiveTab('messages')}
                                className="glass-panel rounded-2xl p-8 border border-white/40 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group flex flex-col items-center justify-center text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                {unreadCount > 0 && (
                                    <span className="absolute top-6 right-6 bg-red-500 text-white text-sm font-bold tracking-tight text-slate-800 w-8 h-8 flex items-center justify-center rounded-full animate-bounce shadow-lg">
                                        {unreadCount}
                                    </span>
                                )}
                                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <MessageSquare className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800 mb-2">Mesajlar</h2>
                                <p className="text-slate-500 font-medium">Veliler veya diğer öğretmenlerle birebir görüşün.</p>
                            </div>

                            <div 
                                onClick={() => setActiveTab('profile')}
                                className="glass-panel rounded-2xl p-8 border border-white/40 shadow-lg hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer group flex flex-col items-center justify-center text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                <div className="w-24 h-24 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <UserCircle className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800 mb-2">Profilim</h2>
                                <p className="text-slate-500 font-medium">Kişisel bilgilerinizi ve hesap ayarlarınızı düzenleyin.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <div className="h-full flex flex-col">
                            <div className="mb-6">
                                <button onClick={() => setActiveTab('overview')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-bold transition-colors">
                                    <ArrowLeft className="w-5 h-5" /> Ana Ekrana Dön
                                </button>
                            </div>
                            <TeacherAnnouncementManager 
                                activeTab={announcementTab}
                                setActiveTab={setAnnouncementTab}
                                allClassrooms={allClassrooms} 
                                myAnnouncements={myAnnouncements}
                                onCreateAnnouncement={async (formData) => {
                                    setIsSubmitting(true);
                                    await createAnnouncement(formData);
                                    setIsSubmitting(false);
                                }}
                                onDeleteAnnouncement={async (id) => {
                                    await removeAnnouncement(id);
                                }}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="h-full flex flex-col glass-panel rounded-2xl shadow-lg border border-white/40 overflow-hidden">
                             <div className="bg-white/50 p-4 border-b border-white/40 backdrop-blur-md rounded-t-2xl flex items-center justify-between">
                                <button onClick={() => setActiveTab('overview')} className="flex items-center gap-2 text-slate-500 hover:text-blue-700 font-bold transition-colors">
                                    <ArrowLeft className="w-5 h-5" /> Ana Ekrana Dön
                                </button>
                                <h2 className="font-bold tracking-tight text-slate-800 text-slate-700">Mesaj Merkezi</h2>
                            </div>
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

                    {activeTab === 'profile' && (
                        <div className="max-w-4xl mx-auto h-full">
                            <SharedProfileModule
                                headerInfo={{
                                    initials: profile?.firstName ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() : 'ÖP',
                                    firstName: profile?.firstName || '',
                                    lastName: profile?.lastName || '',
                                    badgeText: profile?.branch || 'Öğretmen'
                                }}
                                contactInfo={[
                                    { label: 'Kullanıcı Adı', value: `@${profile?.username}` },
                                    { label: 'Telefon', value: profile?.phone || '-' },
                                    { label: 'E-Posta', value: profile?.email || '-' }
                                ]}
                                additionalInfoTitle="Ders Verilen Sınıflar"
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

            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/40 relative text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-3xl"><LogOut className="w-8 h-8 text-red-500" /></div>
                        <h3 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800">Sistemden Çıkış</h3>
                        <p className="text-slate-500 font-medium text-sm mt-2 mb-8">Oturumunuzu sonlandırmak istediğinize emin misiniz?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-colors">İPTAL</button>
                            <button onClick={handleLogoutConfirm} className="flex-1 btn-danger py-3 rounded-xl font-bold transition-all shadow-lg">ÇIKIŞ YAP</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
