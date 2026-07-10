import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

// 🚀 DTO ile tam uyumlu Premium Arayüz (Interface)
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

export default function TeacherPanel() {
    const navigate = useNavigate();

    // 🚦 Durum Yönetimi
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState<TeacherProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // 📝 Duyuru Formu Hafızası
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('GENERAL');
    const [classroomId, setClassroomId] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Interceptor kullanıyorsan token otomatik gider, ama garanti olsun
            const response = await api.get('/teachers/me');
            setProfile(response.data);

            // Sınıfı varsa varsayılan olarak ilk sınıfı seç
            if (response.data.homeroomClasses && response.data.homeroomClasses.length > 0) {
                setClassroomId(response.data.homeroomClasses[0].id.toString());
            }
        } catch (err) {
            console.error("Profil çekilemedi:", err);
            showToast("Profil bilgileri yüklenirken hata oluştu.", "error");
        } finally {
            setLoading(false);
        }
    };

    // 🚀 DUYURU GÖNDERME MOTORU
    const handleMakeAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('type', type);

            if (classroomId) formData.append('classroomId', classroomId);
            if (selectedFile) formData.append('file', selectedFile);

            await api.post('/announcements/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } // api.ts token'ı ekleyecektir
            });

            showToast('Duyuru başarıyla sınıfa gönderildi! 🚀', 'success');

            // Formu Temizle
            setTitle('');
            setContent('');
            setSelectedFile(null);
            // Dosya inputunu görsel olarak da sıfırlamak için
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error("Duyuru gönderilemedi:", error);
            showToast('Duyuru gönderilirken bir hata oluştu!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName || !lastName) return 'ÖG';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getTabClass = (tabName: string) => {
        return `w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold ${
            activeTab === tabName
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-700'
        }`;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600 font-bold animate-pulse text-xl">Sistem Hazırlanıyor...</div>;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-emerald-500/30">

            {/* 🧭 SOL NAVİGASYON (Sidebar) */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
                <div className="p-8 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors group" onClick={() => setActiveTab('overview')}>
                    <h1 className="text-3xl font-black text-emerald-600 tracking-tight group-hover:scale-105 transition-transform origin-left">
                        EduConnect
                    </h1>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">
                        Öğretmen Portalı
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveTab('overview')} className={getTabClass('overview')}>
                        <span className="text-xl group-hover:scale-110 transition-transform">📢</span>
                        <span className="tracking-wide">Duyuru Paneli</span>
                    </button>
                    {/* Gelecekte eklenebilecek sekmeler */}
                    <button className="w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold text-slate-400 cursor-not-allowed opacity-70">
                        <span className="text-xl">🎓</span>
                        <span className="tracking-wide">Öğrencilerim (Yakında)</span>
                    </button>
                    <button className="w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold text-slate-400 cursor-not-allowed opacity-70">
                        <span className="text-xl">✉️</span>
                        <span className="tracking-wide">Mesajlar (Yakında)</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl transition-colors font-bold shadow-sm border border-red-100 hover:border-red-200">
                        <span>🚪</span>
                        <span>Güvenli Çıkış</span>
                    </button>
                </div>
            </aside>

            {/* 📡 ANA İÇERİK EKRANI */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* 👤 ÜST BAŞLIK VE PROFİL */}
                <header className="bg-white border-b border-slate-200 px-10 py-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hoş Geldiniz, {profile?.firstName} Öğretmenim!</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">{profile?.branch} Zümresi</p>
                    </div>

                    <div className="relative z-30">
                        {isDropdownOpen && <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>}

                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`relative z-50 flex items-center gap-3 bg-white border px-2 py-2 pr-5 rounded-full hover:bg-slate-50 transition-all shadow-sm group ${isDropdownOpen ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'}`}>
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black shadow-inner tracking-tighter">
                                {getInitials(profile?.firstName, profile?.lastName)}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">{profile?.firstName} {profile?.lastName}</p>
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
                                    <button onClick={() => { setIsDropdownOpen(false); setShowLogoutModal(true); }} className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                                        <span className="text-lg">🚪</span> Sistemden Çıkış
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* 🧩 İÇERİK ALANI */}
                <div className="flex-1 overflow-y-auto p-10">
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

                        {/* SOL: DUYURU FORMU */}
                        <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-xl">📢</div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">Yeni Duyuru Yayınla</h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Sınıflarınıza veya tüm okula anında bildirim gönderin.</p>
                                </div>
                            </div>

                            <form onSubmit={handleMakeAnnouncement} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Sınıf Seçimi */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Hedef Kitle / Sınıf *</label>
                                        <select
                                            value={classroomId}
                                            onChange={(e) => setClassroomId(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>Sınıf Seçiniz</option>
                                            {profile?.homeroomClasses?.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} Sınıfı</option>
                                            ))}
                                            {(!profile?.homeroomClasses || profile.homeroomClasses.length === 0) && (
                                                <option value="" disabled>Sorumlu olduğunuz sınıf yok</option>
                                            )}
                                        </select>
                                    </div>

                                    {/* Duyuru Tipi */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Duyuru Tipi *</label>
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="GENERAL">Genel Duyuru</option>
                                            <option value="HOMEWORK">Ödev Ataması</option>
                                            <option value="EXAM_INFO">Sınav Bilgisi</option>
                                            <option value="EVENT">Sınıf Etkinliği</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Başlık */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Duyuru Başlığı *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Örn: Yarınki Matematik Sınavı Hakkında"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                                        required
                                    />
                                </div>

                                {/* İçerik */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Mesajınız *</label>
                                    <textarea
                                        rows={5}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Öğrencilerinize iletmek istediğiniz mesajı buraya yazın..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-medium focus:bg-white focus:border-emerald-500 outline-none transition-all resize-y placeholder:text-slate-400"
                                        required
                                    />
                                </div>

                                {/* Dosya Yükleme */}
                                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-100 transition-colors relative">
                                    <div className="text-3xl mb-2">📎</div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 cursor-pointer">
                                        Destekleyici Dosya Ekle (İsteğe Bağlı)
                                    </label>
                                    <p className="text-xs text-slate-500 font-medium mb-4">PDF, Word, Excel veya Resim (Max 10MB)</p>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                    />
                                </div>

                                {/* Buton */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || (!classroomId && (!profile?.homeroomClasses || profile.homeroomClasses.length === 0))}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'GÖNDERİLİYOR...' : 'DUYURUYU YAYINLA 🚀'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* SAĞ: PROFİL KARTI */}
                        <div className="flex-1 flex flex-col gap-6">

                            {/* Ana Profil Kartı */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-[50px]"></div>

                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-inner border border-white/20 relative z-10 mb-4">
                                        {getInitials(profile?.firstName, profile?.lastName)}
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight relative z-10">{profile?.firstName} {profile?.lastName}</h3>
                                    <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-md text-xs font-bold tracking-widest uppercase relative z-10">
                                        {profile?.branch} ÖĞRETMENİ
                                    </span>
                                </div>

                                <div className="p-6">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">İletişim & Sistem</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Sistem Giriş Adı</p>
                                            <p className="text-sm font-bold text-slate-800">@{profile?.username}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Telefon</p>
                                            <p className="text-sm font-bold text-slate-800">{profile?.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">E-Posta</p>
                                            <p className="text-sm font-semibold text-slate-600 truncate">{profile?.email || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sınıflar Kartı */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <span>🏫</span> Sorumlu Olduğum Sınıflar
                                </h4>
                                <div className="space-y-3">
                                    {profile?.homeroomClasses && profile.homeroomClasses.length > 0 ? (
                                        profile.homeroomClasses.map(c => (
                                            <div key={c.id} className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg flex items-center justify-between group hover:border-emerald-200 transition-colors">
                                                <span className="font-bold text-slate-700">{c.name} Sınıfı</span>
                                                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded font-black tracking-wider">REHBERLİK</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-center">
                                            <p className="text-xs font-bold text-amber-600">Henüz adınıza atanmış bir sınıf bulunmuyor.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
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
                            <button onClick={handleLogout} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-red-600/20 transition-all">ÇIKIŞ YAP</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}