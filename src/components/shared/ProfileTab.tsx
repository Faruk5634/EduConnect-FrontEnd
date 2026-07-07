import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 📌 SAYFA MODLARI
type ViewMode = 'overview' | 'editPersonal' | 'editEmail' | 'editPhone' | 'editPassword';

const ProfileTab: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('overview');

    // Profil Verileri
    const [profileData, setProfileData] = useState({
        username: 'Yükleniyor...',
        email: '',
        phone: '',
        password: '',
        roleTitle: 'Sistem Yöneticisi'
    });

    // 📡 Verileri Arka Plandan Çekme
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Backend'den veriyi çekmeyi dener
                const userRes = await axios.get('http://localhost:8080/api/users/me', { headers });

                let title = 'Sistem Kullanıcısı';
                const currentRole = localStorage.getItem('userRole') || '';
                if (currentRole === 'SUPER_ADMIN') title = 'Sistem Kurucusu / Süper Admin';

                setProfileData({
                    username: userRes.data.name || userRes.data.username || 'Super Admin',
                    email: userRes.data.email || 'Belirtilmemiş',
                    phone: userRes.data.phone || '0555 000 00 00',
                    password: '',
                    roleTitle: title
                });
            } catch (err) {
                console.warn("API bulunamadı, varsayılan Super Admin verileri gösteriliyor.");
                // API YAZILANA KADAR GÖRÜNECEK VARSAYILAN (MOCK) VERİLER
                setProfileData({
                    username: 'Super Admin',
                    email: 'Belirtilmemiş',
                    phone: '0555 000 00 00',
                    password: '',
                    roleTitle: 'Sistem Kurucusu / Süper Admin'
                });
            }
        };

        fetchProfileData();
    }, []);

    // 💾 Ayar Kaydetme Motoru
    const handleSettingSave = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Hesap bilgileriniz başarıyla güncellendi Kaptan! (Yakında veritabanına bağlanacak)');
        setViewMode('overview'); // Kaydettikten sonra ana profile dön
    };

    // 🔠 İsim Baş harflerini alma
    const getInitials = (name: string) => {
        if (!name || name === 'Yükleniyor...') return 'SA';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // ===========================================================================
    // 1. GENEL BAKIŞ (OVERVIEW) EKRANI
    // ===========================================================================
    if (viewMode === 'overview') {
        return (
            <div className="p-6 md:p-10 relative z-10 animate-fade-in-down h-full bg-slate-50 rounded-tl-3xl">
                <header className="mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Kişisel Profilim</h2>
                    <p className="text-slate-500 mt-1 text-sm">Hesap bilgilerinizi ve güvenlik tercihlerinizi yönetin.</p>
                </header>

                <div className="max-w-5xl">
                    {/* 💳 Kurumsal Profil Kartı */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                        <div className="h-28 bg-gradient-to-r from-blue-700 to-indigo-800"></div>
                        <div className="px-8 pb-8 relative">
                            <div className="absolute -top-12 left-8 w-24 h-24 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-3xl font-black text-blue-700 shadow-md">
                                {getInitials(profileData.username)}
                            </div>
                            <div className="pt-16">
                                <h3 className="text-2xl font-extrabold text-slate-900">{profileData.username}</h3>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">{profileData.roleTitle}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><span>✉️</span> KURUMSAL E-POSTA</p>
                                    <p className="text-sm font-semibold text-slate-800">{profileData.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><span>📱</span> İLETİŞİM NUMARASI</p>
                                    <p className="text-sm font-semibold text-slate-800">{profileData.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🎛️ Ayar Butonları Izgarası */}
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Hesap İşlemleri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => setViewMode('editPersonal')} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-4 text-left group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">👤</div>
                            <div>
                                <h4 className="font-bold text-slate-800">Kişisel Bilgileri Güncelle</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Sistemdeki ad ve soyadınızı değiştirin.</p>
                            </div>
                        </button>
                        <button onClick={() => setViewMode('editEmail')} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-4 text-left group">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">✉️</div>
                            <div>
                                <h4 className="font-bold text-slate-800">E-Posta Değiştir</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Sistem ve iletişim e-postanızı yenileyin.</p>
                            </div>
                        </button>
                        <button onClick={() => setViewMode('editPhone')} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition-all flex items-center gap-4 text-left group">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">📱</div>
                            <div>
                                <h4 className="font-bold text-slate-800">Telefon Numarası Değiştir</h4>
                                <p className="text-xs text-slate-500 mt-0.5">İletişim ve güvenlik numaranızı güncelleyin.</p>
                            </div>
                        </button>
                        <button onClick={() => setViewMode('editPassword')} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition-all flex items-center gap-4 text-left group">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">🔒</div>
                            <div>
                                <h4 className="font-bold text-slate-800">Şifre Değiştir</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Hesap güvenliğiniz için şifrenizi yenileyin.</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===========================================================================
    // 2. DETAY & FORM EKRANI (İÇ SAYFA)
    // ===========================================================================
    return (
        <div className="animate-fade-in-right h-full bg-slate-50 p-6 md:p-8 rounded-tl-3xl">
            {/* Üst Başlık ve Geri Dön Butonu */}
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-200">
                <button onClick={() => setViewMode('overview')} className="text-slate-500 hover:text-slate-900 bg-white border border-slate-300 p-2 rounded-md transition-all shadow-sm font-bold px-4">
                    GERİ DÖN
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        {viewMode === 'editPersonal' && 'KİŞİSEL BİLGİLERİ GÜNCELLE'}
                        {viewMode === 'editEmail' && 'E-POSTA ADRESİNİ DEĞİŞTİR'}
                        {viewMode === 'editPhone' && 'TELEFON NUMARASINI DEĞİŞTİR'}
                        {viewMode === 'editPassword' && 'SİSTEM ŞİFRESİNİ YENİLE'}
                    </h2>
                </div>
            </div>

            {/* Form Alanı */}
            <div className="max-w-3xl bg-white p-8 md:p-10 rounded-md shadow-sm border border-slate-200">
                <form onSubmit={handleSettingSave} className="space-y-6">

                    {viewMode === 'editPersonal' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Ad Soyad *</label>
                            <input type="text" value={profileData.username} onChange={e => setProfileData({...profileData, username: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all" required />
                            <p className="text-xs text-slate-400 mt-2">Bu isim sistemdeki diğer kullanıcılar tarafından görülecektir.</p>
                        </div>
                    )}

                    {viewMode === 'editEmail' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Yeni E-Posta Adresi *</label>
                            <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all" required />
                        </div>
                    )}

                    {viewMode === 'editPhone' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Yeni Telefon Numarası *</label>
                            <input type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all" placeholder="05XX XXX XX XX" required />
                        </div>
                    )}

                    {viewMode === 'editPassword' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Mevcut Şifreniz *</label>
                                <input type="password" required className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all" placeholder="Güvenlik onayı için gerekli" />
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Yeni Şifre *</label>
                                <input type="password" required value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all" />
                            </div>
                        </div>
                    )}

                    {/* BUTONLAR */}
                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-200">
                        <button type="button" onClick={() => setViewMode('overview')} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-md font-bold text-sm tracking-widest transition-all">
                            İPTAL
                        </button>
                        <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-bold text-sm tracking-widest shadow-md transition-all">
                            DEĞİŞİKLİKLERİ UYGULA
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ProfileTab;