import React, { useState, useEffect } from 'react';
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
    studentNames: string[];
}

type ProfileViewMode = 'overview' | 'editPersonal' | 'editEmail' | 'editPhone' | 'editPassword';

export default function ParentPanel() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // 🚦 GÜNCELLENEN STATE: selection, studentsList, parentProfile
    const [viewMode, setViewMode] = useState<'selection' | 'studentsList' | 'parentProfile'>('selection');
    const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
    const [parentProfileView, setParentProfileView] = useState<ProfileViewMode>('overview');
    const [parentUpdateForm, setParentUpdateForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', currentPassword: '', newPassword: ''
    });

    useEffect(() => {
        fetchParentProfile();
    }, []);

    const fetchParentProfile = async () => {
        try {
            const res = await api.get('/parents/me');
            setParentProfile(res.data);
            setParentUpdateForm({
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                email: res.data.email || '',
                phone: res.data.phoneNumber || '',
                currentPassword: '',
                newPassword: ''
            });
        } catch (error) {
            console.error("Veli profili çekilemedi:", error);
            showToast("Profil bilgileri yüklenirken hata oluştu.", "error");
        } finally {
            setLoading(false);
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

    const handleParentProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (parentProfileView === 'editPassword') {
                if (!parentUpdateForm.currentPassword || !parentUpdateForm.newPassword) return showToast('Lütfen şifreleri girin.', 'error');
                await api.put('/users/me', { password: parentUpdateForm.newPassword, currentPassword: parentUpdateForm.currentPassword });
            } else {
                await api.put('/users/me', { firstName: parentUpdateForm.firstName, lastName: parentUpdateForm.lastName, email: parentUpdateForm.email, phone: parentUpdateForm.phone });
            }
            showToast('Veli profiliniz başarıyla güncellendi.', 'success');
            setParentProfileView('overview');
            setParentUpdateForm(prev => ({ ...prev, newPassword: '', currentPassword: '' }));
            await fetchParentProfile();
        } catch (err) { showToast('Profil güncellenemedi.', 'error'); }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };
    const getInitials = (first?: string, last?: string) => { return !first || !last ? 'VP' : `${first.charAt(0)}${last.charAt(0)}`.toUpperCase(); };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-purple-500 font-bold animate-pulse text-xl">Veli Paneli Yükleniyor...</div>;

    return (
        <div className="font-sans min-h-screen bg-slate-950 flex flex-col overflow-hidden relative selection:bg-purple-500/30 animate-fade-in">

            {/* YÜZEYSEL ÜST BAR */}
            <div className="absolute top-0 left-0 w-full p-6 md:px-12 flex justify-between items-center z-50 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => {setViewMode('selection'); setParentProfileView('overview');}}>
                    <div className="w-12 h-12 bg-purple-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(126,34,206,0.4)]">EC</div>
                    <h1 className="text-2xl font-black text-white tracking-widest drop-shadow-lg">EDUCONNECT <span className="text-purple-400">VELİ</span></h1>
                </div>
                <button onClick={() => setShowLogoutModal(true)} className="pointer-events-auto text-slate-300 hover:text-white flex items-center gap-2 bg-slate-900/80 px-6 py-2.5 rounded-full border border-slate-700/50 backdrop-blur-md hover:border-red-500/50 hover:bg-red-500/10 transition-all font-bold tracking-wider text-sm shadow-xl">
                    🚪 Çıkış Yap
                </button>
            </div>

            {/* DURUM 1: ANA SEÇİM EKRANI (50/50 BÖLÜNMÜŞ DEV BUTONLAR) */}
            {viewMode === 'selection' && (
                <div className="flex-1 flex flex-col md:flex-row h-screen">
                    <div
                        onClick={() => setViewMode('studentsList')}
                        className="flex-1 bg-slate-900/40 hover:bg-slate-900 flex items-center justify-center cursor-pointer group border-b md:border-b-0 md:border-r border-slate-800/50 transition-colors"
                    >
                        <div className="text-center transform group-hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 mx-auto bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-6xl mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_50px_rgba(59,130,246,0.4)] group-hover:bg-blue-500/20 transition-all border border-blue-500/20">
                                🎓
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tight">Öğrencilerim</h2>
                            <p className="text-slate-400 mt-3 font-medium">Öğrenci panellerine geçiş yapın</p>
                        </div>
                    </div>

                    <div
                        onClick={() => {setViewMode('parentProfile'); setParentProfileView('overview');}}
                        className="flex-1 bg-slate-950 hover:bg-slate-900 flex items-center justify-center cursor-pointer group transition-colors relative overflow-hidden"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-purple-800/30 transition-colors"></div>
                        <div className="text-center transform group-hover:scale-105 transition-transform duration-300 relative z-10">
                            <div className="w-32 h-32 mx-auto bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center text-6xl mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] group-hover:bg-purple-500/20 transition-all border border-purple-500/20">
                                👤
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tight">Profilim</h2>
                            <p className="text-slate-400 mt-3 font-medium">Kendi bilgilerinizi yönetin</p>
                        </div>
                    </div>
                </div>
            )}

            {/* DURUM 2: ÖĞRENCİ LİSTESİ EKRANI */}
            {viewMode === 'studentsList' && (
                <div className="flex-1 overflow-y-auto pt-32 px-6 pb-20 relative z-10 bg-slate-900/30">
                    <div className="max-w-4xl mx-auto animate-fade-in-right">
                        <button onClick={() => setViewMode('selection')} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 border border-slate-800 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wider">
                            <span>←</span> Ana Ekrana Dön
                        </button>

                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Öğrencilerim</h2>
                        <p className="text-slate-400 font-medium mb-10">Okul sistemine gitmek için öğrencinizin kartına tıklayın.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {parentProfile?.studentNames && parentProfile.studentNames.length > 0 ? (
                                parentProfile.studentNames.map((studentStr, index) => {
                                    const [fullName, stuNo] = studentStr.includes('|') ? studentStr.split('|') : [studentStr, 'Belirtilmemiş'];
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleStudentClick(stuNo)}
                                            className="bg-slate-900/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
                                        >
                                            <div className="flex items-center gap-5 mb-8">
                                                <div className="w-16 h-16 bg-slate-800 text-blue-400 rounded-full flex items-center justify-center text-2xl font-black group-hover:bg-blue-600 group-hover:text-white transition-colors border border-slate-700 group-hover:border-transparent">
                                                    🎓
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-200 group-hover:text-white transition-colors">{fullName}</h3>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">OKUL NO: {stuNo}</p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950 rounded-xl p-4 flex items-center justify-between border border-slate-800 group-hover:border-blue-500/30 transition-colors">
                                                <span className="text-sm font-bold text-slate-400 group-hover:text-blue-400 transition-colors">Öğrenci Paneline Git</span>
                                                <span className="text-blue-500 font-black group-hover:translate-x-2 transition-transform">➔</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center">
                                    <div className="text-6xl mb-6 opacity-50">📭</div>
                                    <h4 className="text-xl font-bold text-slate-300">Öğrenci Bulunamadı</h4>
                                    <p className="text-slate-500 mt-2">Sisteme kayıtlı bir öğrenciniz bulunmuyor.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* DURUM 3: VELİ PROFİLİ EKRANI */}
            {viewMode === 'parentProfile' && (
                <div className="flex-1 overflow-y-auto pt-32 px-6 pb-20 relative z-10 bg-slate-950">
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>

                    <div className="max-w-3xl mx-auto animate-fade-in-right">
                        <button onClick={() => {
                            if (parentProfileView === 'overview') setViewMode('selection');
                            else setParentProfileView('overview');
                        }} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 border border-slate-800 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wider">
                            <span>←</span> {parentProfileView === 'overview' ? 'Ana Ekrana Dön' : 'Profile Dön'}
                        </button>

                        {parentProfileView === 'overview' ? (
                            <>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Veli Profili</h2>
                                <p className="text-slate-400 font-medium mb-10">Kendi iletişim ve güvenlik tercihlerinizi yönetin.</p>

                                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-10 relative overflow-hidden shadow-2xl">
                                    <div className="flex items-center gap-6 mb-8 border-b border-slate-800 pb-8">
                                        <div className="w-24 h-24 bg-purple-900/50 border border-purple-500/30 text-purple-300 rounded-full flex items-center justify-center text-3xl font-black shadow-inner">
                                            {getInitials(parentProfile?.firstName, parentProfile?.lastName)}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white">{parentProfile?.firstName} {parentProfile?.lastName}</h3>
                                            <p className="text-purple-400 text-sm font-bold tracking-widest uppercase mt-2">Sistem Kullanıcısı</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-10 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                                        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kullanıcı Adı</p>
                                            <p className="text-base font-bold text-slate-200">@{parentProfile?.username}</p>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Telefon</p>
                                            <p className="text-base font-bold text-slate-200">{parentProfile?.phoneNumber || '-'}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">E-Posta</p>
                                            <p className="text-base font-bold text-slate-200">{parentProfile?.email || '-'}</p>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-4">Hesap Ayarları</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setParentProfileView('editPersonal')} className="bg-slate-800 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 hover:border-purple-500/50 border border-slate-700 p-6 rounded-2xl transition-all text-center flex flex-col items-center justify-center gap-3">
                                            <span className="text-3xl">👤</span><span className="text-sm font-bold">Kişisel Bilgi</span>
                                        </button>
                                        <button onClick={() => setParentProfileView('editEmail')} className="bg-slate-800 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 hover:border-purple-500/50 border border-slate-700 p-6 rounded-2xl transition-all text-center flex flex-col items-center justify-center gap-3">
                                            <span className="text-3xl">✉️</span><span className="text-sm font-bold">E-Posta</span>
                                        </button>
                                        <button onClick={() => setParentProfileView('editPhone')} className="bg-slate-800 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 hover:border-purple-500/50 border border-slate-700 p-6 rounded-2xl transition-all text-center flex flex-col items-center justify-center gap-3">
                                            <span className="text-3xl">📱</span><span className="text-sm font-bold">Telefon</span>
                                        </button>
                                        <button onClick={() => setParentProfileView('editPassword')} className="bg-slate-800 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 hover:border-purple-500/50 border border-slate-700 p-6 rounded-2xl transition-all text-center flex flex-col items-center justify-center gap-3">
                                            <span className="text-3xl">🔒</span><span className="text-sm font-bold">Şifre Değiştir</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-10 shadow-2xl">
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight border-b border-slate-800 pb-6">
                                    {parentProfileView === 'editPersonal' && 'Kişisel Bilgiler'}
                                    {parentProfileView === 'editEmail' && 'E-Posta Değişikliği'}
                                    {parentProfileView === 'editPhone' && 'Telefon Değişikliği'}
                                    {parentProfileView === 'editPassword' && 'Şifre Değişikliği'}
                                </h2>

                                <form onSubmit={handleParentProfileUpdate} className="space-y-6 mt-8">
                                    {parentProfileView === 'editPersonal' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Adınız</label><input type="text" value={parentUpdateForm.firstName} onChange={e => setParentUpdateForm({...parentUpdateForm, firstName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-white font-bold focus:border-purple-500 outline-none" required /></div>
                                            <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Soyadınız</label><input type="text" value={parentUpdateForm.lastName} onChange={e => setParentUpdateForm({...parentUpdateForm, lastName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-white font-bold focus:border-purple-500 outline-none" required /></div>
                                        </div>
                                    )}
                                    {parentProfileView === 'editEmail' && (
                                        <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Yeni E-Posta Adresi</label><input type="email" value={parentUpdateForm.email} onChange={e => setParentUpdateForm({...parentUpdateForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-white font-bold focus:border-purple-500 outline-none" required /></div>
                                    )}
                                    {parentProfileView === 'editPhone' && (
                                        <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Yeni Telefon Numarası</label><input type="text" value={parentUpdateForm.phone} onChange={e => setParentUpdateForm({...parentUpdateForm, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-white font-bold focus:border-purple-500 outline-none" placeholder="05XX XXX XX XX" required /></div>
                                    )}
                                    {parentProfileView === 'editPassword' && (
                                        <div className="space-y-6">
                                            <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mevcut Şifreniz</label><input type="password" value={parentUpdateForm.currentPassword} onChange={e => setParentUpdateForm({...parentUpdateForm, currentPassword: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-white font-bold focus:border-purple-500 outline-none" required /></div>
                                            <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Yeni Şifre</label><input type="password" value={parentUpdateForm.newPassword} onChange={e => setParentUpdateForm({...parentUpdateForm, newPassword: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 text-white font-bold focus:border-purple-500 outline-none" required /></div>
                                        </div>
                                    )}

                                    <button type="submit" className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(126,34,206,0.3)] tracking-wider uppercase">Değişiklikleri Kaydet</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 🚨 ÇIKIŞ ONAY PENCERESİ */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-10 border border-slate-700 relative text-center animate-scale-in">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">🚪</div>
                        <h3 className="text-3xl font-black text-white tracking-tight">Sistemden Çıkış</h3>
                        <p className="text-slate-400 font-medium mt-3 mb-10">Oturumunuzu sonlandırmak istediğinize emin misiniz?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold uppercase tracking-wider transition-colors border border-slate-700">İptal</button>
                            <button onClick={handleLogout} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-colors">Çıkış Yap</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}