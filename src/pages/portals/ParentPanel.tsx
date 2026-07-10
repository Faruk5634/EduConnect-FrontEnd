import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

interface ParentProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    username: string;
    studentNames: string[]; // "Ali Veli|1234" formatında geliyor
}

interface StudentData {
    id: number;
    firstName: string;
    lastName: string;
    schoolNumber: string;
    grade: string;
    gender: string;
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

export default function ParentPanel() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // 🚦 Veli Ana Ekranı State'leri
    const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);

    // 🚦 Öğrenci (Çocuk) Detay Ekranı State'leri
    const [viewMode, setViewMode] = useState<'home' | 'studentView'>('home');
    const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
    const [studentAnnouncements, setStudentAnnouncements] = useState<Announcement[]>([]);
    const [studentLoading, setStudentLoading] = useState(false);

    useEffect(() => {
        fetchParentProfile();
    }, []);

    const fetchParentProfile = async () => {
        try {
            const res = await api.get('/parents/me');
            setParentProfile(res.data);
        } catch (error) {
            console.error("Veli profili çekilemedi:", error);
            showToast("Profil bilgileri yüklenirken hata oluştu.", "error");
        } finally {
            setLoading(false);
        }
    };

    // 🚀 Çocuğa Tıklandığında Çalışacak Motor (Öğrenci Paneline Geçiş)
    const handleStudentClick = async (schoolNumber: string) => {
        setStudentLoading(true);
        try {
            // 1. Çocuğun detaylarını çek
            const studentRes = await api.get(`/students/number/${schoolNumber}`);
            setSelectedStudent(studentRes.data);

            // 2. Okuldaki duyuruları çek ve çocuğun sınıfına göre filtrele
            const annRes = await api.get('/announcements');
            const filteredAnnouncements = annRes.data.filter((ann: Announcement) =>
                ann.classroomName === "Genel Duyuru" || ann.classroomName === studentRes.data.grade
            );
            setStudentAnnouncements(filteredAnnouncements);

            // Ekranı değiştir
            setViewMode('studentView');
        } catch (error) {
            console.error("Öğrenci bilgileri çekilemedi:", error);
            showToast("Öğrenci bilgileri yüklenemedi.", "error");
        } finally {
            setStudentLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName || !lastName) return 'VP';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'HOMEWORK': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">📝 ÖDEV</span>;
            case 'EXAM_INFO': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">🎯 SINAV</span>;
            case 'EVENT': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">🎉 ETKİNLİK</span>;
            default: return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">📢 GENEL</span>;
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sky-600 font-bold animate-pulse text-xl">Veli Paneli Hazırlanıyor...</div>;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-500/30">

            {/* 👤 ÜST BAŞLIK */}
            <header className="bg-white border-b border-slate-200 px-10 py-5 flex justify-between items-center shadow-sm z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-600 text-white rounded-xl flex items-center justify-center text-xl font-black shadow-md">
                        EC
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">EduConnect</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Veli Portalı</p>
                    </div>
                </div>

                <div className="relative z-30">
                    {isDropdownOpen && <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>}

                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`relative z-50 flex items-center gap-3 bg-white border px-2 py-2 pr-5 rounded-full hover:bg-slate-50 transition-all shadow-sm group ${isDropdownOpen ? 'border-sky-400 ring-2 ring-sky-100' : 'border-slate-200'}`}>
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-black shadow-inner tracking-tighter">
                            {getInitials(parentProfile?.firstName, parentProfile?.lastName)}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-sky-700 transition-colors">{parentProfile?.firstName} {parentProfile?.lastName}</p>
                            <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5 uppercase flex items-center gap-1">Hesabım <span className="text-[8px]">▼</span></p>
                        </div>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in-down origin-top-right z-50">
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <p className="text-sm font-bold text-slate-800">{parentProfile?.firstName} {parentProfile?.lastName}</p>
                                <p className="text-xs text-slate-500 font-medium truncate">{parentProfile?.email || 'E-Posta Belirtilmemiş'}</p>
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

            {/* 🧩 İÇERİK ALANI (DİNAMİK DEĞİŞİR) */}
            <main className="flex-1 overflow-y-auto p-10 relative">

                {/* YÜKLENİYOR OVERLAY */}
                {studentLoading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="text-sky-600 font-bold text-xl animate-pulse">Öğrenci Bilgileri Yükleniyor...</div>
                    </div>
                )}

                {/* ========================================================================================= */}
                {/* 1. DURUM: VELİ ANA EKRANI (Çocuk Seçimi & Veli Profili) */}
                {/* ========================================================================================= */}
                {viewMode === 'home' && (
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 animate-fade-in-down">

                        {/* ÇOCUK SEÇİM ALANI */}
                        <div className="flex-[2]">
                            <h2 className="text-2xl font-black text-slate-800 mb-2">Öğrencileriniz</h2>
                            <p className="text-sm text-slate-500 font-medium mb-8">Detaylı bilgi ve duyurularına ulaşmak için öğrencinizin kartına tıklayın.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {parentProfile?.studentNames && parentProfile.studentNames.length > 0 ? (
                                    parentProfile.studentNames.map((studentStr, index) => {
                                        const [fullName, stuNo] = studentStr.includes('|') ? studentStr.split('|') : [studentStr, 'Belirtilmemiş'];
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => handleStudentClick(stuNo)}
                                                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-sky-300 transition-all cursor-pointer group relative overflow-hidden"
                                            >
                                                <div className="absolute right-0 top-0 bottom-0 w-2 bg-sky-500 group-hover:w-3 transition-all"></div>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform">
                                                        🎓
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-slate-800 group-hover:text-sky-700 transition-colors">{fullName}</h3>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">NO: {stuNo}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                                    <span className="text-xs font-bold text-slate-500">Öğrenci Paneline Git</span>
                                                    <span className="text-sky-600 font-black group-hover:translate-x-2 transition-transform">➔</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                                        <div className="text-5xl mb-4">📭</div>
                                        <h4 className="text-lg font-bold text-slate-700">Sisteme Kayıtlı Öğrenci Bulunamadı</h4>
                                        <p className="text-slate-500 text-sm mt-1">Okul yönetimi tarafından adınıza henüz bir öğrenci atanmamış.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* VELİ PROFİL ÖZETİ */}
                        <div className="flex-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-0">
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-sky-500/20 rounded-full blur-[40px]"></div>
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner border border-white/20 relative z-10 mb-4">
                                        {getInitials(parentProfile?.firstName, parentProfile?.lastName)}
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight relative z-10">{parentProfile?.firstName} {parentProfile?.lastName}</h3>
                                    <p className="text-sky-300 text-xs font-bold tracking-widest uppercase mt-1 relative z-10">VELİ PROFİLİ</p>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telefon Numarası</p>
                                            <p className="text-sm font-bold text-slate-800 mt-0.5">{parentProfile?.phoneNumber || 'Belirtilmemiş'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-Posta Adresi</p>
                                            <p className="text-sm font-bold text-slate-800 mt-0.5">{parentProfile?.email || 'Belirtilmemiş'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistem Kullanıcı Adı</p>
                                            <p className="text-sm font-bold text-sky-600 mt-0.5">@{parentProfile?.username}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}


                {/* ========================================================================================= */}
                {/* 2. DURUM: ÖĞRENCİ DETAY EKRANI (Çocuğa tıklandığında açılır - Öğrenci Paneli Birebir Aynı) */}
                {/* ========================================================================================= */}
                {viewMode === 'studentView' && selectedStudent && (
                    <div className="max-w-6xl mx-auto animate-fade-in-right">

                        {/* Geri Dön Butonu */}
                        <div className="mb-6 pb-6 border-b border-slate-200">
                            <button
                                onClick={() => setViewMode('home')}
                                className="flex items-center gap-2 text-slate-500 hover:text-sky-700 bg-white border border-slate-300 hover:border-sky-300 px-4 py-2.5 rounded-lg transition-all shadow-sm font-bold text-sm tracking-wider"
                            >
                                <span>⬅️</span> Veli Paneline Geri Dön
                            </button>
                        </div>

                        <div className="flex flex-col-reverse lg:flex-row gap-8">

                            {/* SOL: DUYURULAR AKIŞI */}
                            <div className="flex-[2] space-y-6">
                                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <span>📰</span> {selectedStudent.firstName} İçin Güncel Akış
                                </h3>

                                {studentAnnouncements.length === 0 ? (
                                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                                        <div className="text-5xl mb-4">📭</div>
                                        <h4 className="text-lg font-bold text-slate-700">Henüz bir duyuru yok</h4>
                                        <p className="text-slate-500 text-sm mt-1">Öğrencinizin sınıfına veya okula ait yeni bir duyuru geldiğinde burada görünecektir.</p>
                                    </div>
                                ) : (
                                    studentAnnouncements.map((ann) => (
                                        <div key={ann.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
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
                                                        className="inline-flex items-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-sky-100"
                                                    >
                                                        <span>📎</span> {ann.fileName || 'Ekli Dosyayı İndir'}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* SAĞ: ÖĞRENCİ DİJİTAL KİMLİĞİ */}
                            <div className="flex-1">
                                <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden sticky top-0">
                                    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white relative flex flex-col items-center">
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                                        <div className="w-24 h-24 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white/20 relative z-10 mb-4">
                                            {getInitials(selectedStudent.firstName, selectedStudent.lastName)}
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight relative z-10 text-center">{selectedStudent.firstName} <br/> {selectedStudent.lastName}</h3>

                                        <div className="mt-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 relative z-10 flex flex-col items-center">
                                            <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mb-1">Okul Numarası</span>
                                            <span className="text-xl font-black tracking-widest">{selectedStudent.schoolNumber}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sınıf</span>
                                                <span className="text-sm font-black text-slate-800">{selectedStudent.grade || 'Atanmadı'}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cinsiyet</span>
                                                <span className="text-sm font-bold text-slate-800">{selectedStudent.gender || 'Belirtilmemiş'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
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