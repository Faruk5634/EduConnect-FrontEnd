import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

// --- Arayüzler (Interfaces) ---
interface ClassroomInfo {
    id: number;
    name: string;
}

interface TeacherProfile {
    id: number;
    firstName: string;
    lastName: string;
    branch: string;
    username: string;
    phone: string;
    email: string;
    homeroomClasses: ClassroomInfo[];
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
}

// 📌 YENİ: Profil Düzenleme Sayfa Modları
type ProfileViewMode = 'overview' | 'editPersonal' | 'editEmail' | 'editPhone' | 'editPassword';

export default function TeacherPanel() {
    const navigate = useNavigate();

    // 🚦 Durum Yönetimi
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState<TeacherProfile | null>(null);
    const [allClassrooms, setAllClassrooms] = useState<ClassroomInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // 📢 Duyuru State'leri
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('GENERAL');
    const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✉️ E-Posta State'leri
    const [messages, setMessages] = useState<Message[]>([]);
    const [mailBoxView, setMailBoxView] = useState<'INBOX' | 'SENT'>('INBOX');
    const [rightPaneMode, setRightPaneMode] = useState<'EMPTY' | 'READ' | 'COMPOSE'>('EMPTY');
    const [msgReceiverId, setMsgReceiverId] = useState('');
    const [msgSubject, setMsgSubject] = useState('');
    const [msgContent, setMsgContent] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    // 👤 Profil Düzenleme State'leri (TAM SAYFA İÇİN)
    const [profileViewMode, setProfileViewMode] = useState<ProfileViewMode>('overview');
    const [updateForm, setUpdateForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const profileRes = await api.get('/teachers/me');
            setProfile(profileRes.data);

            // Profil güncelleme formu için ön dolum
            setUpdateForm(prev => ({
                ...prev,
                firstName: profileRes.data.firstName,
                lastName: profileRes.data.lastName,
                email: profileRes.data.email,
                phone: profileRes.data.phone
            }));

            const classRes = await api.get('/classrooms/school');
            setAllClassrooms(classRes.data);

            await fetchMessages();
        } catch (err) {
            console.error("Veriler çekilemedi:", err);
            showToast("Bilgiler yüklenirken hata oluştu.", "error");
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

    const toggleClassSelection = (classId: number) => {
        setSelectedClassIds(prev =>
            prev.includes(classId)
                ? prev.filter(id => id !== classId)
                : [...prev, classId]
        );
    };

    const handleMakeAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClassIds.length === 0) {
            showToast('Lütfen en az bir sınıf seçin!', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('type', type);
            selectedClassIds.forEach(id => formData.append('classroomIds', id.toString()));
            if (selectedFile) formData.append('file', selectedFile);

            await api.post('/announcements/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Duyuru seçili sınıflara başarıyla gönderildi! 🚀', 'success');
            setTitle('');
            setContent('');
            setSelectedClassIds([]);
            setSelectedFile(null);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error) {
            showToast('Duyuru gönderilirken hata oluştu!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!msgReceiverId) {
            showToast('Lütfen bir alıcı seçin.', 'error');
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

    // 👤 YENİ: Geniş Ekran Profil Kaydetme Motoru
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (profileViewMode === 'editPassword') {
                if (!updateForm.currentPassword || !updateForm.newPassword) {
                    showToast('Lütfen mevcut ve yeni şifrenizi girin.', 'error');
                    return;
                }
                await api.put('/users/me', { password: updateForm.newPassword, currentPassword: updateForm.currentPassword });
            } else {
                const payload: any = {
                    firstName: updateForm.firstName,
                    lastName: updateForm.lastName,
                    email: updateForm.email,
                    phone: updateForm.phone
                };
                await api.put('/users/me', payload);
            }

            showToast('Profil bilgileriniz başarıyla güncellendi.', 'success');
            setProfileViewMode('overview');
            setUpdateForm(prev => ({ ...prev, newPassword: '', currentPassword: '' }));
            await fetchInitialData(); // Verileri tazele
        } catch (err: any) {
            const serverMsg = err?.response?.data || 'Profil güncellenemedi.';
            showToast(serverMsg, 'error');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const getInitials = (first?: string, last?: string) => {
        if (!first || !last) return 'ÖG';
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600 font-bold animate-pulse text-xl">Öğretmen Paneli Yükleniyor...</div>;

    const displayedMessages = messages.filter(m => m.type === mailBoxView);
    const unreadCount = messages.filter(m => m.type === 'INBOX' && !m.isRead).length;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-emerald-500/30">

            {/* 🧭 SOL NAVİGASYON */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0">
                <div
                    onClick={() => { setActiveTab('overview'); setProfileViewMode('overview'); }}
                    className="p-8 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors group"
                >
                    <h1 className="text-3xl font-black text-emerald-600 tracking-tight group-hover:scale-105 transition-transform origin-left">
                        EduConnect
                    </h1>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">Öğretmen Portalı</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => {setActiveTab('overview'); setProfileViewMode('overview');}} className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all font-semibold ${activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-700'}`}>
                        <span className="text-xl">🏠</span><span>Anasayfa</span>
                    </button>
                    <button onClick={() => {setActiveTab('announcements'); setProfileViewMode('overview');}} className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all font-semibold ${activeTab === 'announcements' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-700'}`}>
                        <span className="text-xl">📢</span><span>Duyuru Paneli</span>
                    </button>
                    <button onClick={() => {setActiveTab('messages'); setRightPaneMode('EMPTY'); setProfileViewMode('overview');}} className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all font-semibold ${activeTab === 'messages' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-700'}`}>
                        <div className="flex items-center space-x-4">
                            <span className="text-xl">✉️</span><span>İletişim & Mesajlar</span>
                        </div>
                        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-black">{unreadCount}</span>}
                    </button>
                    <button onClick={() => {setActiveTab('profile'); setProfileViewMode('overview');}} className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all font-semibold ${activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-700'}`}>
                        <span className="text-xl">👤</span><span>Profilim</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl transition-colors font-bold border border-red-100">
                        <span>🚪</span><span>Güvenli Çıkış</span>
                    </button>
                </div>
            </aside>

            {/* 📡 ANA İÇERİK EKRANI */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* 👤 ÜST BAŞLIK */}
                <header className="bg-white border-b border-slate-200 px-10 py-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hoş Geldiniz, {profile?.firstName} Öğretmenim!</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">{profile?.branch} Zümresi</p>
                    </div>

                    <div className="relative">
                        {isDropdownOpen && <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>}
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="relative z-50 flex items-center gap-3 bg-white border border-slate-200 px-2 py-2 pr-5 rounded-full hover:bg-slate-50 transition-all shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black shadow-inner">
                                {getInitials(profile?.firstName, profile?.lastName)}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-bold text-slate-800">{profile?.firstName} {profile?.lastName}</p>
                                <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5 uppercase">Hesabım ▼</p>
                            </div>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b border-slate-100">
                                    <p className="text-sm font-bold text-slate-800">{profile?.firstName} {profile?.lastName}</p>
                                    <p className="text-xs text-slate-500 font-medium truncate">{profile?.email || 'E-Posta Belirtilmemiş'}</p>
                                </div>
                                <button onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }} className="w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3">
                                    <span>🚪</span> Sistemden Çıkış
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* 🧩 SEKMELER (TABS) */}
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 relative">

                    {/* 🏠 ANASAYFA SEKME */}
                    {activeTab === 'overview' && (
                        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-down">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-3xl p-10 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
                                <h1 className="text-4xl font-black relative z-10">İyi Çalışmalar, {profile?.firstName} Hoca!</h1>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
                                    <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-black">🏫</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase">Okuldaki Sınıflar</p>
                                        <p className="text-3xl font-black text-slate-800">{allClassrooms.length}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
                                    <div className="w-16 h-16 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-3xl font-black">🎓</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase">Rehberlik Sınıfı</p>
                                        <p className="text-2xl font-black text-slate-800 truncate mt-1">
                                            {profile?.homeroomClasses && profile.homeroomClasses.length > 0
                                                ? `${profile.homeroomClasses[0].name} Sınıfı`
                                                : 'Atanmadı'}
                                        </p>
                                    </div>
                                </div>
                                <div onClick={() => setActiveTab('messages')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer group">
                                    <div className="w-16 h-16 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl font-black group-hover:bg-purple-100 transition-colors">✉️</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase">Okunmamış Mesaj</p>
                                        <p className="text-3xl font-black text-slate-800">{unreadCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 📢 DUYURU PANELİ SEKME */}
                    {activeTab === 'announcements' && (
                        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in-down">
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">📢</div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">Çoklu Sınıf Duyuru Sistemi</h2>
                                    <p className="text-sm text-slate-500 font-medium">İstediğiniz sınıfları seçin ve duyurunuzu anında fırlatın.</p>
                                </div>
                            </div>

                            <form onSubmit={handleMakeAnnouncement} className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 flex justify-between items-center">
                                        <span>Hedef Sınıfları Seçiniz *</span>
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-[10px]">{selectedClassIds.length} Sınıf Seçildi</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                                        {allClassrooms.map(c => {
                                            const isSelected = selectedClassIds.includes(c.id);
                                            return (
                                                <button
                                                    type="button"
                                                    key={c.id}
                                                    onClick={() => toggleClassSelection(c.id)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'}`}
                                                >
                                                    {isSelected && <span className="mr-2 text-xs">✓</span>}
                                                    {c.name} Sınıfı
                                                </button>
                                            )
                                        })}
                                        {allClassrooms.length === 0 && <p className="text-sm font-medium text-slate-500">Okula kayıtlı sınıf bulunamadı.</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Duyuru Tipi *</label>
                                        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all cursor-pointer">
                                            <option value="GENERAL">📢 Genel Duyuru</option>
                                            <option value="HOMEWORK">📝 Ödev Ataması</option>
                                            <option value="EXAM_INFO">🎯 Sınav Bilgisi</option>
                                            <option value="EXAM_RESULT">📊 Sınav Sonucu</option>
                                            <option value="EVENT">🎉 Etkinlik / Gezi</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Duyuru Başlığı *</label>
                                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: Hafta Sonu Deneme Sınavı" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Detaylı Mesajınız *</label>
                                    <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Öğrencilerinize iletmek istediğiniz notlar..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-none transition-all resize-y placeholder:text-slate-400" required />
                                </div>

                                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-emerald-50 hover:border-emerald-300 transition-colors relative group">
                                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📎</div>
                                    <label className="block text-base font-black text-slate-700 mb-1 cursor-pointer">Destekleyici Dosya Ekle (İsteğe Bağlı)</label>
                                    <p className="text-xs text-slate-500 font-medium mb-4">PDF, Word, Excel veya Resim Seçiniz</p>
                                    <input id="file-upload" type="file" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 cursor-pointer transition-colors" />
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-black py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg">
                                    {isSubmitting ? 'GÖNDERİLİYOR...' : 'SEÇİLİ SINIFLARA YAYINLA 🚀'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ✉️ MESAJLAR (GELİŞMİŞ E-POSTA KUTUSU) SEKME */}
                    {activeTab === 'messages' && (
                        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-150px)] animate-fade-in">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">İletişim ve Destek</h2>
                                    <p className="text-sm text-slate-500 font-medium">Öğrenci, Veli veya Kurum yöneticileriyle resmi yazışmalar.</p>
                                </div>
                                <button onClick={() => setRightPaneMode('COMPOSE')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center gap-2">
                                    <span>✎</span> YENİ MESAJ
                                </button>
                            </div>

                            <div className="flex-1 flex gap-6 overflow-hidden">
                                {/* SOL PANE: LİSTE */}
                                <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                                    <div className="flex border-b border-slate-100 bg-slate-50">
                                        <button onClick={() => {setMailBoxView('INBOX'); setRightPaneMode('EMPTY');}} className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${mailBoxView === 'INBOX' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Gelen Kutusu</button>
                                        <button onClick={() => {setMailBoxView('SENT'); setRightPaneMode('EMPTY');}} className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${mailBoxView === 'SENT' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Gönderilenler</button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto">
                                        {displayedMessages.length === 0 ? (
                                            <div className="p-10 text-center text-slate-400">
                                                <p className="font-bold text-sm">Bu klasör şu an boş.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {displayedMessages.map(msg => (
                                                    <div
                                                        key={msg.id}
                                                        onClick={() => handleReadMessage(msg)}
                                                        className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col gap-1 border-l-4 ${selectedMessage?.id === msg.id ? 'border-l-blue-500 bg-blue-50/30' : !msg.isRead && msg.type === 'INBOX' ? 'border-l-blue-500 bg-slate-50' : 'border-l-transparent'}`}
                                                    >
                                                        <div className="flex justify-between items-baseline">
                                                            <p className={`text-sm truncate ${!msg.isRead && msg.type === 'INBOX' ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                                                {msg.type === 'INBOX' ? msg.sender : `Alıcı: ${msg.sender}`}
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

                                {/* SAĞ PANE: OKUMA / YAZMA */}
                                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">

                                    {rightPaneMode === 'EMPTY' && (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-50">
                                            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-4xl mb-6 text-slate-400">✉️</div>
                                            <p className="text-slate-500 font-medium text-base">İşlem yapmak için sol menüden bir mesaj seçin veya yeni mesaj oluşturun.</p>
                                        </div>
                                    )}

                                    {rightPaneMode === 'READ' && selectedMessage && (
                                        <div className="flex flex-col h-full animate-fade-in">
                                            <div className="p-8 border-b border-slate-100 bg-slate-50 shrink-0">
                                                <h2 className="text-2xl font-black text-slate-800 mb-4">{selectedMessage.subject}</h2>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-black">
                                                            {selectedMessage.sender.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{mailBoxView === 'INBOX' ? 'Kimden:' : 'Kime:'} <span className="text-emerald-700">{selectedMessage.sender}</span></p>
                                                            <p className="text-[11px] font-bold text-slate-400 mt-0.5">{selectedMessage.date} - {selectedMessage.time}</p>
                                                        </div>
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
                                                        setMsgSubject(`RE: ${selectedMessage.subject}`);
                                                        setRightPaneMode('COMPOSE');
                                                    }} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                                                        <span>↩️</span> Yanıtla
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {rightPaneMode === 'COMPOSE' && (
                                        <div className="flex flex-col h-full animate-fade-in p-8">
                                            <h3 className="text-xl font-black text-slate-800 mb-6">Yeni İleti Gönder</h3>
                                            <form onSubmit={handleSendMessage} className="flex flex-col flex-1">
                                                <div className="space-y-5 flex-1">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Kime (Alıcı Seçin) *</label>
                                                        <select
                                                            value={msgReceiverId}
                                                            onChange={e => setMsgReceiverId(e.target.value)}
                                                            required
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                                                        >
                                                            <option value="" disabled>Alıcı seçiniz...</option>
                                                            <option value="ALL">📢 Tüm Okul Yöneticilerine (Toplu)</option>
                                                            <option value="SUPER_ADMIN">⚙️ Sistem Yöneticisine (Teknik Destek)</option>
                                                            <option value="" disabled>--- veya öğrenci/veli ID'si girin ---</option>
                                                        </select>
                                                        {(!['ALL', 'SUPER_ADMIN'].includes(msgReceiverId) && msgReceiverId !== '') && (
                                                            <input
                                                                type="text"
                                                                value={msgReceiverId}
                                                                onChange={e => setMsgReceiverId(e.target.value)}
                                                                className="w-full mt-2 bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all"
                                                                placeholder="Özel ID giriniz..."
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Konu *</label>
                                                        <input
                                                            type="text"
                                                            value={msgSubject}
                                                            onChange={e => setMsgSubject(e.target.value)}
                                                            required
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                                                            placeholder="Mesajınızın konusu..."
                                                        />
                                                    </div>
                                                    <div className="flex-1 flex flex-col h-full min-h-[250px]">
                                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Mesajınız *</label>
                                                        <textarea
                                                            value={msgContent}
                                                            onChange={e => setMsgContent(e.target.value)}
                                                            required
                                                            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                                                            placeholder="Mesajınızı detaylıca yazın..."
                                                        />
                                                    </div>
                                                </div>
                                                <div className="pt-6 flex justify-end">
                                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-bold transition-all shadow-md">
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

                    {/* 👤 PROFİLİM (TAM SAYFA DÜZENLEME) SEKME */}
                    {activeTab === 'profile' && (
                        <div className="max-w-4xl mx-auto h-full">

                            {/* OVERVIEW (GENEL BAKIŞ) MODU */}
                            {profileViewMode === 'overview' && (
                                <div className="animate-fade-in-down pb-10">
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                                        <div className="bg-slate-900 p-10 text-white relative">
                                            <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px]"></div>
                                            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl font-black shadow-inner border border-white/20 relative z-10 mb-6">
                                                {getInitials(profile?.firstName, profile?.lastName)}
                                            </div>
                                            <h3 className="text-3xl font-black tracking-tight relative z-10">{profile?.firstName} {profile?.lastName}</h3>
                                            <span className="inline-block mt-3 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-md text-xs font-bold tracking-widest uppercase relative z-10">
                                                {profile?.branch} ZÜMRESİ
                                            </span>
                                        </div>
                                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">İletişim Bilgileri</h4>
                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Sistem Kullanıcı Adı</p>
                                                        <p className="text-lg font-black text-emerald-600">@{profile?.username}</p>
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
                                                    <span>🏫</span> Rehberlik Sınıfı
                                                </h4>
                                                <div className="space-y-3">
                                                    {profile?.homeroomClasses && profile.homeroomClasses.length > 0 ? (
                                                        profile.homeroomClasses.map(c => (
                                                            <div key={c.id} className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex items-center justify-between">
                                                                <span className="font-bold text-slate-700">{c.name} Sınıfı</span>
                                                                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded font-black tracking-wider">REHBERLİK</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                                                            <p className="text-sm font-bold text-slate-500">Henüz adınıza atanmış bir rehberlik sınıfı bulunmuyor.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-800 mb-4">Hesap İşlemleri</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div onClick={() => setProfileViewMode('editPersonal')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex items-center gap-4 group">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">👤</div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">Kişisel Bilgileri Güncelle</h4>
                                                <p className="text-xs text-slate-500 mt-1">Sistemdeki ad ve soyadınızı değiştirin.</p>
                                            </div>
                                        </div>
                                        <div onClick={() => setProfileViewMode('editEmail')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex items-center gap-4 group">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">✉️</div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">E-Posta Değiştir</h4>
                                                <p className="text-xs text-slate-500 mt-1">Sistem ve iletişim e-postanızı yenileyin.</p>
                                            </div>
                                        </div>
                                        <div onClick={() => setProfileViewMode('editPhone')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex items-center gap-4 group">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">📱</div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">Telefon Numarası Değiştir</h4>
                                                <p className="text-xs text-slate-500 mt-1">İletişim numaranızı güncelleyin.</p>
                                            </div>
                                        </div>
                                        <div onClick={() => setProfileViewMode('editPassword')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex items-center gap-4 group">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">🔒</div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">Şifre Değiştir</h4>
                                                <p className="text-xs text-slate-500 mt-1">Hesap güvenliğiniz için şifrenizi yenileyin.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DÜZENLEME MODLARI (TAM SAYFA FORM) */}
                            {profileViewMode !== 'overview' && (
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
                                                    <input type="text" value={updateForm.firstName} onChange={e => setUpdateForm({...updateForm, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all" required />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Soyadınız *</label>
                                                    <input type="text" value={updateForm.lastName} onChange={e => setUpdateForm({...updateForm, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all" required />
                                                </div>
                                            </div>
                                        )}

                                        {profileViewMode === 'editEmail' && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Yeni E-Posta Adresi *</label>
                                                <input type="email" value={updateForm.email} onChange={e => setUpdateForm({...updateForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all" required />
                                            </div>
                                        )}

                                        {profileViewMode === 'editPhone' && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Yeni Telefon Numarası *</label>
                                                <input type="text" value={updateForm.phone} onChange={e => setUpdateForm({...updateForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="05XX XXX XX XX" required />
                                            </div>
                                        )}

                                        {profileViewMode === 'editPassword' && (
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Mevcut Şifreniz *</label>
                                                    <input type="password" value={updateForm.currentPassword} onChange={e => setUpdateForm({...updateForm, currentPassword: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="Mevcut şifreniz" />
                                                </div>
                                                <div className="pt-4 border-t border-slate-100">
                                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Yeni Şifre *</label>
                                                    <input type="password" required value={updateForm.newPassword} onChange={e => setUpdateForm({...updateForm, newPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="Yeni şifreniz" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                                            <button type="button" onClick={() => setProfileViewMode('overview')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all">
                                                İPTAL
                                            </button>
                                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-200 relative text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-3xl">🚪</div>
                        <h3 className="text-2xl font-black text-slate-800">Sistemden Çıkış</h3>
                        <p className="text-slate-500 font-medium text-sm mt-2 mb-8">Oturumunuzu sonlandırmak istediğinize emin misiniz?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-colors">İPTAL</button>
                            <button onClick={handleLogout} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all shadow-md">ÇIKIŞ YAP</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}