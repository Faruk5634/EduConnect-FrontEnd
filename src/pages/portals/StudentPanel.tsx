import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

interface StudentProfile {
    id: number;
    firstName: string;
    lastName: string;
    schoolNumber: string;
    parentFullName: string;
    username: string;
    grade: string;
    gender: string;
    phone: string;
    email: string;
}

interface AnnouncementFile {
    fileName: string;
    fileUrl: string;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    createdDate: string;
    authorName: string;
    type: string;
    targetClasses: string[];
    attachedFiles?: AnnouncementFile[];
}

interface Message {
    id: number;
    subject: string;
    content: string;
    date: string;
    time: string;
    isRead: boolean;
    type: 'INBOX' | 'SENT';
    sender: string;
    isSentByParent?: boolean;
}

type ProfileViewMode = 'overview' | 'editPersonal' | 'editEmail' | 'editPhone' | 'editPassword';

export default function StudentPanel() {
    const navigate = useNavigate();
    const location = useLocation();

    const isParentViewing = location.state?.isParentViewing || false;
    const studentSchoolNumber = location.state?.studentSchoolNumber;

    // 🚀 GÜNCELLEME: Varsayılan sekme artık 'overview' (Anasayfa)
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    // 🚀 YENİ EKLENENLER: Duyuru Filtreleme State'leri
    const [announcementSearch, setAnnouncementSearch] = useState('');
    const [announcementTypeFilter, setAnnouncementTypeFilter] = useState('ALL');
    const [announcementSort, setAnnouncementSort] = useState('NEWEST');

    const [messages, setMessages] = useState<Message[]>([]);
    const [mailBoxView, setMailBoxView] = useState<'INBOX' | 'SENT'>('INBOX');
    const [rightPaneMode, setRightPaneMode] = useState<'EMPTY' | 'READ' | 'COMPOSE'>('EMPTY');
    const [msgReceiverId, setMsgReceiverId] = useState('');
    const [msgSubject, setMsgSubject] = useState('');
    const [msgContent, setMsgContent] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{userId: number, fullName: string, role: string}[]>([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [selectedReceiverName, setSelectedReceiverName] = useState('');

    const [profileViewMode, setProfileViewMode] = useState<ProfileViewMode>('overview');
    const [updateForm, setUpdateForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', currentPassword: '', newPassword: ''
    });

    const isNotHome = activeTab !== 'overview' || profileViewMode !== 'overview' || rightPaneMode !== 'EMPTY' || selectedAnnouncement !== null;
    const isNotHomeRef = useRef(isNotHome);

    useEffect(() => {
        window.history.replaceState({ page: 'base' }, "", window.location.href);
        window.history.pushState({ page: 'trap' }, "", window.location.href);

        const handlePopState = () => {
            if (isNotHomeRef.current) {
                setActiveTab('overview');
                setProfileViewMode('overview');
                setRightPaneMode('EMPTY');
                setSelectedAnnouncement(null);
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
        const delayDebounceFn = setTimeout(async () => {
            if (userSearchQuery.length >= 2) {
                try {
                    const res = await api.get(`/messages/search-users?keyword=${userSearchQuery}`);
                    setSearchResults(res.data);
                    setShowSearchDropdown(true);
                } catch (error) {
                    console.error("Arama hatası", error);
                }
            } else {
                setSearchResults([]);
                setShowSearchDropdown(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [userSearchQuery]);

    const fetchInitialData = async () => {
        try {
            let profileRes;
            if (isParentViewing && studentSchoolNumber) {
                profileRes = await api.get(`/students/number/${studentSchoolNumber}`);
            } else {
                profileRes = await api.get('/students/me');
            }
            setProfile(profileRes.data);

            setUpdateForm(prev => ({
                ...prev,
                firstName: profileRes.data.firstName,
                lastName: profileRes.data.lastName,
                email: profileRes.data.email || '',
                phone: profileRes.data.phone || ''
            }));

            const annRes = await api.get('/announcements');
            const filteredAnnouncements = annRes.data.filter((ann: Announcement) => {
                if (!ann.targetClasses || ann.targetClasses.length === 0) return true;
                return ann.targetClasses.includes("Genel Duyuru") || ann.targetClasses.includes(profileRes.data.grade);
            });

            setAnnouncements(filteredAnnouncements);

            await fetchMessages();
        } catch (err) {
            console.error("Veriler çekilemedi:", err);
            showToast("Bilgiler yüklenirken bir hata oluştu.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const msgRes = await api.get('/messages');
            setMessages(msgRes.data);
        } catch (error) {
            console.error("Mesajlar çekilemedi", error);
        }
    };

    const handleSelectUser = (user: any) => {
        setMsgReceiverId(user.userId.toString());
        setSelectedReceiverName(`${user.fullName} (${user.role})`);
        setShowSearchDropdown(false);
        setUserSearchQuery('');
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!msgReceiverId) {
            showToast('Lütfen listeden bir alıcı seçin.', 'error');
            return;
        }
        try {
            await api.post('/messages', {
                receiverId: msgReceiverId,
                subject: msgSubject,
                content: msgContent
            });

            showToast('Mesaj başarıyla gönderildi!', 'success');

            setMsgReceiverId('');
            setSelectedReceiverName('');
            setMsgSubject('');
            setMsgContent('');
            setRightPaneMode('EMPTY');

            await fetchMessages();
            setMailBoxView('SENT');

        } catch (error) {
            showToast('Mesaj gönderilemedi.', 'error');
        }
    };

    const handleReadMessage = async (msg: Message) => {
        setSelectedMessage(msg);
        setRightPaneMode('READ');
        if (msg.type === 'INBOX' && !msg.isRead) {
            try {
                await api.put(`/messages/${msg.id}/read`);
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
            } catch (error) {
                console.error("Okundu işaretlenemedi", error);
            }
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isParentViewing) {
            showToast('Öğrenci bilgileri veli yetkisiyle güncellenemez.', 'error');
            return;
        }

        try {
            if (profileViewMode === 'editPassword') {
                if (!updateForm.currentPassword || !updateForm.newPassword) {
                    showToast('Lütfen mevcut ve yeni şifrenizi girin.', 'error');
                    return;
                }
                await api.put('/users/me', { password: updateForm.newPassword, currentPassword: updateForm.currentPassword });
            } else {
                const payload: any = {
                    firstName: updateForm.firstName, lastName: updateForm.lastName, email: updateForm.email, phone: updateForm.phone
                };
                await api.put('/users/me', payload);
            }

            showToast('Profil bilgileriniz başarıyla güncellendi.', 'success');
            setProfileViewMode('overview');
            setUpdateForm(prev => ({ ...prev, newPassword: '', currentPassword: '' }));
            await fetchInitialData();
        } catch (err: any) {
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

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'HOMEWORK': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase border border-orange-200">📝 ÖDEV</span>;
            case 'EXAM_INFO': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase border border-red-200">🎯 SINAV</span>;
            case 'EVENT': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase border border-purple-200">🎉 ETKİNLİK</span>;
            default: return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase border border-blue-200">📢 GENEL</span>;
        }
    };

    const getHeaderBgForType = (type: string) => {
        switch (type) {
            case 'HOMEWORK': return 'bg-gradient-to-r from-orange-500 to-amber-600';
            case 'EXAM_INFO': return 'bg-gradient-to-r from-red-500 to-rose-600';
            case 'EVENT': return 'bg-gradient-to-r from-purple-500 to-fuchsia-600';
            default: return 'bg-gradient-to-r from-blue-600 to-indigo-700';
        }
    };

    // 🚀 DUYURULARI FİLTRELEME VE SIRALAMA MOTORU
    const processedAnnouncements = announcements
        .filter(ann => {
            const matchesSearch = ann.title.toLowerCase().includes(announcementSearch.toLowerCase()) ||
                ann.content.toLowerCase().includes(announcementSearch.toLowerCase()) ||
                ann.authorName.toLowerCase().includes(announcementSearch.toLowerCase());
            const matchesType = announcementTypeFilter === 'ALL' || ann.type === announcementTypeFilter;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            const timeA = new Date(a.createdDate).getTime();
            const timeB = new Date(b.createdDate).getTime();
            return announcementSort === 'NEWEST' ? timeB - timeA : timeA - timeB;
        });

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600 font-bold animate-pulse text-xl">Öğrenci Paneli Hazırlanıyor...</div>;

    const displayedMessages = messages.filter(m => m.type === mailBoxView);
    const unreadCount = messages.filter(m => m.type === 'INBOX' && !m.isRead).length;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-indigo-500/30">

            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0">
                {/* 🚀 BUG FIX: Logoya tıklandığında artık login'e atmaz, panel içindeki anasayfaya geçer */}
                <div onClick={() => { setActiveTab('overview'); setProfileViewMode('overview'); setSelectedAnnouncement(null); }} className="p-8 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors group">
                    <h1 className="text-3xl font-black text-indigo-600 tracking-tight group-hover:scale-105 transition-transform origin-left">
                        EduConnect
                    </h1>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold flex items-center gap-1">
                        Öğrenci Portalı
                        {isParentViewing && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md ml-1 border border-purple-200">Veli Modu</span>}
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => {setActiveTab('overview'); setProfileViewMode('overview'); setSelectedAnnouncement(null);}} className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-700'}`}>
                        <span className="text-xl group-hover:scale-110 transition-transform">🏠</span>
                        <span className="tracking-wide">Anasayfa</span>
                    </button>
                    <button onClick={() => {setActiveTab('announcements'); setProfileViewMode('overview'); setSelectedAnnouncement(null);}} className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold ${activeTab === 'announcements' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-700'}`}>
                        <span className="text-xl group-hover:scale-110 transition-transform">📢</span>
                        <span className="tracking-wide">Duyuru & Ödevler</span>
                    </button>
                    <button onClick={() => {setActiveTab('messages'); setRightPaneMode('EMPTY'); setProfileViewMode('overview'); setSelectedAnnouncement(null);}} className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all group font-semibold ${activeTab === 'messages' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-700'}`}>
                        <div className="flex items-center space-x-4">
                            <span className="text-xl group-hover:scale-110 transition-transform">✉️</span>
                            <span className="tracking-wide">İletişim</span>
                        </div>
                        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-black">{unreadCount}</span>}
                    </button>
                    <button onClick={() => {setActiveTab('profile'); setProfileViewMode('overview'); setSelectedAnnouncement(null);}} className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-700'}`}>
                        <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
                        <span className="tracking-wide">Profilim</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    {isParentViewing ? (
                        <button onClick={() => navigate('/parent')} className="w-full flex items-center justify-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-4 rounded-xl transition-colors font-black shadow-sm border border-indigo-200">
                            <span className="text-xl">⬅️</span>
                            <span>Veli Paneline Dön</span>
                        </button>
                    ) : (
                        <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl transition-colors font-bold shadow-sm border border-red-100 hover:border-red-200">
                            <span>🚪</span>
                            <span>Güvenli Çıkış</span>
                        </button>
                    )}
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-10 py-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            Merhaba, {profile?.firstName}! 👋
                        </h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">{profile?.grade ? `${profile?.grade} Sınıfı Öğrencisi` : 'Sınıf Ataması Bekleniyor'}</p>
                    </div>
                    <div className="relative z-30">
                        {isDropdownOpen && <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>}
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`relative z-50 flex items-center gap-3 bg-white border px-2 py-2 pr-5 rounded-full hover:bg-slate-50 transition-all shadow-sm group ${isDropdownOpen ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'}`}>
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black shadow-inner tracking-tighter">
                                {getInitials(profile?.firstName, profile?.lastName)}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors">{profile?.firstName} {profile?.lastName}</p>
                                <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5 uppercase flex items-center gap-1">Hesabım <span className="text-[8px]">▼</span></p>
                            </div>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in-down origin-top-right z-50">
                                <div className="p-4 border-b border-slate-100 bg-slate-50">
                                    <p className="text-sm font-bold text-slate-800">{profile?.firstName} {profile?.lastName}</p>
                                    <p className="text-xs text-slate-500 font-medium truncate">{profile?.email || 'E-Posta Belirtilmemiş'}</p>
                                </div>
                                <div className="py-2">
                                    <button onClick={() => { setIsDropdownOpen(false); setActiveTab('profile'); setProfileViewMode('overview'); }} className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center gap-3">
                                        <span className="text-lg">👤</span> Profilimi Görüntüle
                                    </button>
                                    <button onClick={() => { setIsDropdownOpen(false); setActiveTab('messages'); setRightPaneMode('EMPTY'); }} className="w-full text-left px-5 py-2.5 text-sm font-medium text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center gap-3">
                                        <span className="text-lg">✉️</span> İletişim & Mesajlar
                                    </button>
                                </div>
                                <div className="py-2 border-t border-slate-100">
                                    {isParentViewing ? (
                                        <button onClick={() => navigate('/parent')} className="w-full text-left px-5 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-3">
                                            <span className="text-lg">⬅️</span> Veli Paneline Dön
                                        </button>
                                    ) : (
                                        <button onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                                            <span className="text-lg">🚪</span> Sistemden Çıkış
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">

                    {/* 🚀 YENİ EKLENEN ANASAYFA (OVERVIEW) */}
                    {activeTab === 'overview' && (
                        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-down">
                            <div className="bg-gradient-to-r from-indigo-600 to-blue-800 rounded-3xl p-10 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
                                <h1 className="text-4xl font-black relative z-10">Eğitim Portalı, {profile?.firstName}! 🚀</h1>
                                <p className="mt-3 text-indigo-100 relative z-10 font-medium text-lg">Derslerinde başarılar. Güncel okul durumun aşağıdadır.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div onClick={() => setActiveTab('announcements')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer group">
                                    <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-black group-hover:bg-blue-100 transition-colors">📢</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase">Sınıf Panosu</p>
                                        <p className="text-3xl font-black text-slate-800">{announcements.length} <span className="text-sm text-slate-400 font-medium">Duyuru</span></p>
                                    </div>
                                </div>
                                <div onClick={() => setActiveTab('messages')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer group">
                                    <div className="w-16 h-16 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl font-black group-hover:bg-purple-100 transition-colors">✉️</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase">Okunmamış Mesaj</p>
                                        <p className="text-3xl font-black text-slate-800">{unreadCount}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-3xl font-black">🏫</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase">Sınıfın</p>
                                        <p className="text-2xl font-black text-slate-800">{profile?.grade || 'Atanmadı'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <div className="max-w-7xl mx-auto animate-fade-in-down">
                            {selectedAnnouncement ? (
                                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 animate-scale-in">
                                    <div className={`relative h-48 ${getHeaderBgForType(selectedAnnouncement.type)} flex items-end p-8`}>
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
                                        <button onClick={() => setSelectedAnnouncement(null)} className="absolute top-6 left-6 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm border border-white/30">
                                            <span>←</span> Akışa Geri Dön
                                        </button>
                                        <div className="relative z-10 flex gap-3">
                                            <span className="bg-white/90 text-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm">
                                                {selectedAnnouncement.type === 'HOMEWORK' ? '📝 ÖDEV' : selectedAnnouncement.type === 'EXAM_INFO' ? '🎯 SINAV' : selectedAnnouncement.type === 'EVENT' ? '🎉 ETKİNLİK' : '📢 GENEL'}
                                            </span>

                                            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border border-white/30 shadow-sm max-w-[300px] truncate" title={selectedAnnouncement.targetClasses?.join(', ')}>
                                                {selectedAnnouncement.targetClasses?.join(', ') || 'Genel Duyuru'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-10 md:p-14">
                                        <h2 className="text-4xl font-black text-slate-800 mb-8 leading-tight tracking-tight">{selectedAnnouncement.title}</h2>
                                        <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-100">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600 shadow-sm">
                                                {selectedAnnouncement.authorName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-slate-800">{selectedAnnouncement.authorName}</p>
                                                <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">
                                                    Yayınlanma: {new Date(selectedAnnouncement.createdDate).toLocaleDateString('tr-TR')} • {new Date(selectedAnnouncement.createdDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="prose max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-lg">{selectedAnnouncement.content}</div>

                                        {selectedAnnouncement.attachedFiles && selectedAnnouncement.attachedFiles.length > 0 && (
                                            <div className="mt-12 pt-8 border-t border-slate-100 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span>📎</span> Ekli Dosyalar ({selectedAnnouncement.attachedFiles.length})</h4>
                                                <div className="flex flex-wrap gap-4">
                                                    {selectedAnnouncement.attachedFiles.map((file, idx) => (
                                                        <a key={idx} href={`http://localhost:8080${file.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white hover:bg-indigo-50 text-indigo-700 px-6 py-4 rounded-xl text-sm font-bold transition-all shadow-sm border border-slate-200 hover:border-indigo-200 hover:shadow-md">
                                                            <span className="text-2xl text-indigo-500 flex-shrink-0">📄</span>
                                                            <span className="truncate max-w-[200px]" title={file.fileName}>{file.fileName || 'Dosyayı İndir'}</span>
                                                            <span className="text-slate-400 flex-shrink-0">⬇</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col-reverse lg:flex-row gap-8">
                                    <div className="flex-[2] space-y-6">

                                        {/* 🚀 GÜNCELLEME: FİLTRE VE ARAMA ÇUBUĞU */}
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-8">
                                            <div className="flex-1 relative">
                                                <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                                                <input
                                                    type="text"
                                                    placeholder="Duyuru veya ödev ara..."
                                                    value={announcementSearch}
                                                    onChange={e => setAnnouncementSearch(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <select
                                                    value={announcementTypeFilter}
                                                    onChange={e => setAnnouncementTypeFilter(e.target.value)}
                                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
                                                >
                                                    <option value="ALL">Tüm Kategoriler</option>
                                                    <option value="GENERAL">📢 Genel</option>
                                                    <option value="HOMEWORK">📝 Ödevler</option>
                                                    <option value="EXAM_INFO">🎯 Sınavlar</option>
                                                    <option value="EVENT">🎉 Etkinlikler</option>
                                                </select>
                                                <select
                                                    value={announcementSort}
                                                    onChange={e => setAnnouncementSort(e.target.value)}
                                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
                                                >
                                                    <option value="NEWEST">Yeniden Eskiye</option>
                                                    <option value="OLDEST">Eskiden Yeniye</option>
                                                </select>
                                            </div>
                                        </div>

                                        {processedAnnouncements.length === 0 ? (
                                            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                                                <div className="text-5xl mb-4">📭</div>
                                                <h4 className="text-lg font-bold text-slate-700">Duyuru bulunamadı</h4>
                                                <p className="text-sm text-slate-500 mt-2">Arama kriterlerinize uyan bir içerik yok.</p>
                                            </div>
                                        ) : (
                                            processedAnnouncements.map((ann) => (
                                                <div key={ann.id} onClick={() => setSelectedAnnouncement(ann)} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group hover:-translate-y-1">
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${ann.type === 'HOMEWORK' ? 'bg-orange-400' : ann.type === 'EXAM_INFO' ? 'bg-red-400' : ann.type === 'EVENT' ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{ann.authorName.charAt(0)}</div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{ann.authorName}</p>
                                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{new Date(ann.createdDate).toLocaleDateString('tr-TR')} • {new Date(ann.createdDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {getTypeBadge(ann.type)}
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[150px]" title={ann.targetClasses?.join(', ')}>
                                                                {ann.targetClasses?.join(', ') || 'Genel Duyuru'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <h4 className="text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{ann.title}</h4>
                                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap mb-4 line-clamp-3">{ann.content}</p>
                                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">Detayları Oku →</span>

                                                        {ann.attachedFiles && ann.attachedFiles.length > 0 && (
                                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1 flex-shrink-0">📎 {ann.attachedFiles.length} Dosya</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Sağ Taraftaki Profil Kartı */}
                                    <div className="flex-1">
                                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden sticky top-6">
                                            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white relative flex flex-col items-center">
                                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white/20 relative z-10 mb-4">
                                                    {getInitials(profile?.firstName, profile?.lastName)}
                                                </div>
                                                <h3 className="text-2xl font-black tracking-tight relative z-10 text-center">{profile?.firstName} <br/> {profile?.lastName}</h3>
                                                <div className="mt-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 relative z-10 flex flex-col items-center">
                                                    <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mb-1">Okul Numarası</span>
                                                    <span className="text-xl font-black tracking-widest">{profile?.schoolNumber}</span>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-white">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sınıf</span><span className="text-sm font-black text-slate-800">{profile?.grade || 'Atanmadı'}</span></div>
                                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sistem Adı</span><span className="text-sm font-bold text-indigo-600">@{profile?.username}</span></div>
                                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kayıtlı Veli</span><span className="text-sm font-bold text-slate-800">{profile?.parentFullName || 'Belirtilmemiş'}</span></div>
                                                    <div className="flex justify-between items-center pb-1"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cinsiyet</span><span className="text-sm font-bold text-slate-800">{profile?.gender}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-150px)] animate-fade-in">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">İletişim</h2>
                                    <p className="text-sm text-slate-500 font-medium">Öğretmenlerinizle veya okul yönetimiyle iletişime geçin.</p>
                                </div>
                                <button onClick={() => setRightPaneMode('COMPOSE')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center gap-2">
                                    <span>✎</span> YENİ MESAJ
                                </button>
                            </div>

                            <div className="flex-1 flex gap-6 overflow-hidden">
                                <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                                    <div className="flex border-b border-slate-100 bg-slate-50">
                                        <button onClick={() => {setMailBoxView('INBOX'); setRightPaneMode('EMPTY');}} className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${mailBoxView === 'INBOX' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Gelen Kutusu</button>
                                        <button onClick={() => {setMailBoxView('SENT'); setRightPaneMode('EMPTY');}} className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${mailBoxView === 'SENT' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Gönderilenler</button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto">
                                        {displayedMessages.length === 0 ? (
                                            <div className="p-10 text-center text-slate-400">
                                                <p className="font-bold text-sm">Bu klasör şu an boş.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {displayedMessages.map(msg => (
                                                    <div key={msg.id} onClick={() => handleReadMessage(msg)} className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col gap-1 border-l-4 ${selectedMessage?.id === msg.id ? 'border-l-indigo-500 bg-indigo-50/30' : !msg.isRead && msg.type === 'INBOX' ? 'border-l-indigo-500 bg-slate-50' : 'border-l-transparent'}`}>
                                                        <div className="flex justify-between items-baseline">
                                                            <p className={`text-sm truncate flex items-center ${!msg.isRead && msg.type === 'INBOX' ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                                                {msg.type === 'INBOX' ? msg.sender : `Alıcı: ${msg.sender}`}
                                                                {msg.isSentByParent && <span className="ml-1 text-purple-600 text-[10px]" title="Veli Mührü">🛡️</span>}
                                                            </p>
                                                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{msg.date}</span>
                                                        </div>
                                                        <p className={`text-sm truncate ${!msg.isRead && msg.type === 'INBOX' ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>{msg.subject}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
                                    {rightPaneMode === 'EMPTY' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 bg-slate-50">
                                            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-4xl mb-6 text-slate-400">✉️</div>
                                            <p className="text-slate-500 font-medium text-base">İşlem yapmak için sol menüden bir mesaj seçin veya yeni mesaj oluşturun.</p>
                                        </div>
                                    )}

                                    {rightPaneMode === 'READ' && selectedMessage && (
                                        <div className="absolute inset-0 flex flex-col animate-fade-in bg-white">
                                            <div className="p-8 border-b border-slate-100 bg-slate-50 shrink-0">
                                                <h2 className="text-2xl font-black text-slate-800 mb-4">{selectedMessage.subject}</h2>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-black">
                                                        {selectedMessage.sender.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{mailBoxView === 'INBOX' ? 'Kimden:' : 'Kime:'} <span className="text-indigo-700">{selectedMessage.sender}</span></p>
                                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{selectedMessage.date} - {selectedMessage.time}</p>

                                                        {selectedMessage.isSentByParent && (
                                                            <span className="inline-block mt-2 bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase shadow-sm">
                                                                🛡️ VELİ TARAFINDAN GÖNDERİLDİ
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-8 flex-1 overflow-y-auto">
                                                <div className="prose max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                                    {selectedMessage.content}
                                                </div>
                                            </div>
                                            {mailBoxView === 'INBOX' && (
                                                <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end">
                                                    <button onClick={() => {
                                                        setMsgReceiverId(selectedMessage.sender);
                                                        setSelectedReceiverName(selectedMessage.sender);
                                                        setMsgSubject(`RE: ${selectedMessage.subject}`);
                                                        setRightPaneMode('COMPOSE');
                                                    }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                                                        <span>↩️</span> Yanıtla
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {rightPaneMode === 'COMPOSE' && (
                                        <div className="absolute inset-0 flex flex-col p-8 animate-fade-in bg-white">
                                            <h3 className="text-xl font-black text-slate-800 mb-6 shrink-0">Yeni İleti Gönder</h3>

                                            <form onSubmit={handleSendMessage} className="flex flex-col flex-1 overflow-y-auto pr-2 pb-4">
                                                <div className="space-y-6">

                                                    <div className="relative z-20">
                                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Kime (Alıcı Seçin) *</label>
                                                        {selectedReceiverName ? (
                                                            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 shadow-sm">
                                                                <span className="font-bold text-indigo-800">{selectedReceiverName}</span>
                                                                <button type="button" onClick={() => {setMsgReceiverId(''); setSelectedReceiverName('');}} className="text-indigo-500 hover:text-red-500 font-bold transition-colors text-sm px-2">
                                                                    ✕ Değiştir
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className="relative flex items-center w-full">
                                                                    <input
                                                                        type="text"
                                                                        value={userSearchQuery}
                                                                        onChange={e => setUserSearchQuery(e.target.value)}
                                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-12 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                                        placeholder="Kişi aramak için isim veya kullanıcı adı yazın (En az 2 harf)..."
                                                                    />
                                                                    <div className="absolute right-4 text-slate-400 pointer-events-none flex items-center justify-center">
                                                                        🔍
                                                                    </div>
                                                                </div>

                                                                <div className="relative">
                                                                    {showSearchDropdown && searchResults.length > 0 && (
                                                                        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in-down">
                                                                            {searchResults.map((user: any) => (
                                                                                <div key={user.userId} onClick={() => handleSelectUser(user)} className="px-5 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center justify-between transition-colors">
                                                                                    <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
                                                                                    <p className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-2 py-1 rounded uppercase tracking-widest">{user.role}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {showSearchDropdown && searchResults.length === 0 && userSearchQuery.length >= 2 && (
                                                                        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl px-5 py-4 text-sm text-slate-500 text-center font-medium">
                                                                            Sistemde bu isme ait kişi bulunamadı.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="relative z-10 shrink-0">
                                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Konu *</label>
                                                        <input
                                                            type="text"
                                                            value={msgSubject}
                                                            onChange={e => setMsgSubject(e.target.value)}
                                                            required
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                                            placeholder="Mesajınızın konusu..."
                                                        />
                                                    </div>

                                                    <div className="flex flex-col relative z-0 flex-1 min-h-[150px]">
                                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Mesajınız *</label>
                                                        <textarea
                                                            value={msgContent}
                                                            onChange={e => setMsgContent(e.target.value)}
                                                            required
                                                            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all resize-y min-h-[150px]"
                                                            placeholder="Mesajınızı detaylıca yazın..."
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-8 pb-4 shrink-0 flex justify-end mt-auto">
                                                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-lg font-bold transition-all shadow-md">
                                                        GÖNDER
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="max-w-4xl mx-auto h-full">
                            {profileViewMode === 'overview' && (
                                <div className="animate-fade-in-down pb-10">
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                                        <div className="bg-indigo-900 p-10 text-white relative">
                                            <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px]"></div>
                                            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl font-black shadow-inner border border-white/20 relative z-10 mb-6">
                                                {getInitials(profile?.firstName, profile?.lastName)}
                                            </div>
                                            <h3 className="text-3xl font-black tracking-tight relative z-10">{profile?.firstName} {profile?.lastName}</h3>
                                            <span className="inline-block mt-3 px-3 py-1 bg-indigo-500/40 border border-indigo-400 text-indigo-100 rounded-md text-xs font-bold tracking-widest uppercase relative z-10">
                                                {profile?.grade} SINIFI ÖĞRENCİSİ
                                            </span>
                                        </div>
                                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">İletişim Bilgileri</h4>
                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Sistem Kullanıcı Adı</p>
                                                        <p className="text-lg font-black text-indigo-600">@{profile?.username}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Telefon Numarası</p>
                                                        <p className="text-base font-bold text-slate-800">{profile?.phone || 'Belirtilmemiş'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">E-Posta Adresi</p>
                                                        <p className="text-base font-bold text-slate-800">{profile?.email || 'Belirtilmemiş'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                    Kayıt Bilgileri
                                                </h4>
                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Okul Numarası</p>
                                                        <p className="text-base font-bold text-slate-800">{profile?.schoolNumber}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Kayıtlı Veli</p>
                                                        <p className="text-base font-bold text-slate-800">{profile?.parentFullName || 'Belirtilmemiş'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {!isParentViewing ? (
                                        <>
                                            <h3 className="text-xl font-black text-slate-800 mb-4">Hesap İşlemleri</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div onClick={() => setProfileViewMode('editPersonal')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-4 group">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">👤</div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800">Kişisel Bilgileri Güncelle</h4>
                                                        <p className="text-xs text-slate-500 mt-1">Sistemdeki ad ve soyadınızı değiştirin.</p>
                                                    </div>
                                                </div>
                                                <div onClick={() => setProfileViewMode('editEmail')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-4 group">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">✉️</div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800">E-Posta Değiştir</h4>
                                                        <p className="text-xs text-slate-500 mt-1">Sistem ve iletişim e-postanızı yenileyin.</p>
                                                    </div>
                                                </div>
                                                <div onClick={() => setProfileViewMode('editPhone')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-4 group">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">📱</div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800">Telefon Numarası Değiştir</h4>
                                                        <p className="text-xs text-slate-500 mt-1">İletişim numaranızı güncelleyin.</p>
                                                    </div>
                                                </div>
                                                <div onClick={() => setProfileViewMode('editPassword')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-4 group">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">🔒</div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800">Şifre Değiştir</h4>
                                                        <p className="text-xs text-slate-500 mt-1">Hesap güvenliğiniz için şifrenizi yenileyin.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm animate-fade-in">
                                            <div className="text-3xl mt-1">🛡️</div>
                                            <div>
                                                <h4 className="font-black text-purple-900 text-lg">Salt Okunur Mod (Veli Yetkisi)</h4>
                                                <p className="text-sm font-medium text-purple-700 mt-1.5 leading-relaxed">
                                                    Öğrenci hesap ayarları (şifre, iletişim bilgileri vb.) yalnızca öğrencinin kendi paneli üzerinden güncellenebilir. Veli olarak bu bilgileri sadece görüntüleme yetkisine sahipsiniz.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {profileViewMode !== 'overview' && !isParentViewing && (
                                <div className="animate-fade-in-right bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200">
                                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
                                        <button onClick={() => setProfileViewMode('overview')} className="text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 p-2 rounded-lg transition-all shadow-sm font-bold px-4">
                                            GERİ DÖN
                                        </button>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                                {profileViewMode === 'editPersonal' && 'KİŞİSEL BİLGİLERİ GÜNCELLE'}
                                                {profileViewMode === 'editEmail' && 'E-POSTA ADRESİNİ DEĞİŞTİR'}
                                                {profileViewMode === 'editPhone' && 'TELEFON NUMARASINI DEĞİŞTİR'}
                                                {profileViewMode === 'editPassword' && 'SİSTEM ŞİFRESİNİ YENİLE'}
                                            </h2>
                                        </div>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                                        {profileViewMode === 'editPersonal' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Adınız *</label>
                                                    <input type="text" value={updateForm.firstName} onChange={e => setUpdateForm({...updateForm, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" required />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Soyadınız *</label>
                                                    <input type="text" value={updateForm.lastName} onChange={e => setUpdateForm({...updateForm, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" required />
                                                </div>
                                            </div>
                                        )}

                                        {profileViewMode === 'editEmail' && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Yeni E-Posta Adresi *</label>
                                                <input type="email" value={updateForm.email} onChange={e => setUpdateForm({...updateForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" required />
                                            </div>
                                        )}

                                        {profileViewMode === 'editPhone' && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Yeni Telefon Numarası *</label>
                                                <input type="text" value={updateForm.phone} onChange={e => setUpdateForm({...updateForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="05XX XXX XX XX" required />
                                            </div>
                                        )}

                                        {profileViewMode === 'editPassword' && (
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Mevcut Şifreniz *</label>
                                                    <input type="password" value={updateForm.currentPassword} onChange={e => setUpdateForm({...updateForm, currentPassword: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="Mevcut şifreniz" />
                                                </div>
                                                <div className="pt-4 border-t border-slate-100">
                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Yeni Şifre *</label>
                                                    <input type="password" required value={updateForm.newPassword} onChange={e => setUpdateForm({...updateForm, newPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="Yeni şifreniz" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                                            <button type="button" onClick={() => setProfileViewMode('overview')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all">
                                                İPTAL
                                            </button>
                                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all">
                                                DEĞİŞİKLİKLERİ KAYDET
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* 🚨 ÇIKIŞ ONAY PENCERESİ */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-200 relative animate-scale-in z-50 text-center">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🚪</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">Sistemden Çıkış</h3>
                        <p className="text-slate-500 font-medium text-sm mt-3 mb-8 leading-relaxed">Güvenli bir şekilde oturumunuzu sonlandırmak istediğinize emin misiniz?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl font-bold text-sm transition-colors uppercase tracking-wider">İPTAL</button>
                            <button onClick={handleLogoutConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-sm shadow-md transition-all uppercase tracking-wider">ÇIKIŞ YAP</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}