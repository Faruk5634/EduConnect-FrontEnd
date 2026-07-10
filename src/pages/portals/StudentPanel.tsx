import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

// 🚀 Backend DTO'ları ile tam uyumlu arayüzler
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

interface Announcement {
    id: number;
    title: string;
    content: string;
    createdDate: string;
    authorName: string;
    type: string;
    classroomName: string;
    fileName?: string;
    fileUrl?: string;
}

export default function StudentPanel() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('announcements');
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Öğrencinin Kendi Profilini Çek (Yeni eklediğimiz /me endpoint'i)
            const profileRes = await api.get('/students/me');
            setProfile(profileRes.data);

            // 2. Okuldaki Duyuruları Çek
            const annRes = await api.get('/announcements');

            // Sadece 'Genel' duyuruları ve öğrencinin 'Kendi Sınıfına' ait duyuruları filtrele
            const filteredAnnouncements = annRes.data.filter((ann: Announcement) =>
                ann.classroomName === "Genel Duyuru" || ann.classroomName === profileRes.data.grade
            );

            setAnnouncements(filteredAnnouncements);
        } catch (err) {
            console.error("Veriler çekilemedi:", err);
            showToast("Bilgiler yüklenirken bir hata oluştu.", "error");
        } finally {
            setLoading(false);
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

    // Duyuru tipine göre rozet rengi
    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'HOMEWORK': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">📝 ÖDEV</span>;
            case 'EXAM_INFO': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">🎯 SINAV</span>;
            case 'EVENT': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">🎉 ETKİNLİK</span>;
            default: return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">📢 GENEL</span>;
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600 font-bold animate-pulse text-xl">Öğrenci Paneli Hazırlanıyor...</div>;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-indigo-500/30">

            {/* 🧭 SOL NAVİGASYON (Sidebar) */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
                <div className="p-8 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors group">
                    <h1 className="text-3xl font-black text-indigo-600 tracking-tight group-hover:scale-105 transition-transform origin-left">
                        EduConnect
                    </h1>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">
                        Öğrenci Portalı
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveTab('announcements')} className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold ${activeTab === 'announcements' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-700'}`}>
                        <span className="text-xl group-hover:scale-110 transition-transform">📢</span>
                        <span className="tracking-wide">Duyuru & Ödevler</span>
                    </button>
                    {/* Gelecek Modüller İçin Yer Tutucular */}
                    <button className="w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold text-slate-400 cursor-not-allowed opacity-70">
                        <span className="text-xl">📊</span>
                        <span className="tracking-wide">Notlar & Karneler</span>
                    </button>
                    <button className="w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all group font-semibold text-slate-400 cursor-not-allowed opacity-70">
                        <span className="text-xl">📅</span>
                        <span className="tracking-wide">Ders Programı</span>
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

                {/* 👤 ÜST BAŞLIK */}
                <header className="bg-white border-b border-slate-200 px-10 py-6 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Merhaba, {profile?.firstName}! 👋</h2>
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
                    <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row gap-8">

                        {/* SOL: DUYURULAR AKIŞI (FEED) */}
                        <div className="flex-[2] space-y-6">
                            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                <span>📰</span> Güncel Akış
                            </h3>

                            {announcements.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                                    <div className="text-5xl mb-4">📭</div>
                                    <h4 className="text-lg font-bold text-slate-700">Henüz bir duyuru yok</h4>
                                    <p className="text-slate-500 text-sm mt-1">Okulunuzdan veya sınıfınızdan yeni bir duyuru geldiğinde burada görünecektir.</p>
                                </div>
                            ) : (
                                announcements.map((ann) => (
                                    <div key={ann.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        {/* Dekoratif Sol Çizgi */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${ann.type === 'HOMEWORK' ? 'bg-orange-400' : ann.type === 'EXAM_INFO' ? 'bg-red-400' : ann.type === 'EVENT' ? 'bg-purple-400' : 'bg-blue-400'}`}></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
                                                    {ann.authorName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{ann.authorName}</p>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                        {new Date(ann.createdDate).toLocaleDateString('tr-TR')} • {new Date(ann.createdDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {getTypeBadge(ann.type)}
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{ann.classroomName}</span>
                                            </div>
                                        </div>

                                        <h4 className="text-xl font-black text-slate-800 mb-2">{ann.title}</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap mb-4">{ann.content}</p>

                                        {ann.fileUrl && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <a
                                                    href={`http://localhost:8080${ann.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-indigo-100"
                                                >
                                                    <span>📎</span> {ann.fileName || 'Ekli Dosyayı İndir'}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* SAĞ: DİJİTAL ÖĞRENCİ KİMLİĞİ */}
                        <div className="flex-1">
                            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden sticky top-0">
                                {/* Kimlik Üst Kısım (Gradient) */}
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

                                {/* Kimlik Detaylar */}
                                <div className="p-6 bg-white">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sınıf</span>
                                            <span className="text-sm font-black text-slate-800">{profile?.grade || 'Atanmadı'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sistem Adı</span>
                                            <span className="text-sm font-bold text-indigo-600">@{profile?.username}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kayıtlı Veli</span>
                                            <span className="text-sm font-bold text-slate-800">{profile?.parentFullName || 'Belirtilmemiş'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cinsiyet</span>
                                            <span className="text-sm font-bold text-slate-800">{profile?.gender}</span>
                                        </div>
                                    </div>
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