import { Mail } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

type ViewMode = 'overview' | 'editPersonal' | 'editEmail' | 'editPhone' | 'editPassword';

const ProfileTab: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('overview');

    const [profileData, setProfileData] = useState({
        firstName: 'Yükleniyor...',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        currentPassword: '',
        roleTitle: 'Sistem Yöneticisi'
    });
    const [userId, setUserId] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string>('');

    const fetchProfileData = async () => {
        try {
            const userRes = await api.get('/users/me');

            let title = 'Sistem Kullanıcısı';
            // 🚀 DÜZELTME: localStorage anahtarı 'role' olarak güncellendi!
            const currentRole = userRes.data.role || localStorage.getItem('role') || '';
            if (currentRole === 'SUPER_ADMIN' || currentRole === 'ROLE_SUPER_ADMIN') title = 'Sistem Kurucusu / Süper Admin';

            setUserId(userRes.data.id || null);
            setUserRole(currentRole || '');

            const fullName = userRes.data.name || userRes.data.username || 'Super Admin';
            const parts = fullName.split(' ').filter(Boolean);
            const first = parts.shift() || '';
            const last = parts.join(' ') || '';

            setProfileData({
                firstName: first,
                lastName: last,
                email: userRes.data.email || 'Belirtilmemiş',
                phone: userRes.data.phone || '0555 000 00 00',
                password: '',
                currentPassword: '',
                roleTitle: title
            });
        } catch (error) {
            console.warn("API bulunamadı, varsayılan veriler gösteriliyor.");
            setProfileData({
                firstName: 'Super',
                lastName: 'Admin',
                email: 'Belirtilmemiş',
                phone: '0555 000 00 00',
                password: '',
                currentPassword: '',
                roleTitle: 'Sistem Kurucusu / Süper Admin'
            });
            setUserId(null);
            setUserRole('');
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleSettingSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (viewMode === 'editPassword') {
                if (!profileData.currentPassword || !profileData.password) {
                    showToast('Lütfen mevcut şifrenizi ve yeni şifreyi girin.', 'error');
                    return;
                }

                // 🚀 DÜZELTME: 'any' kirliliği temizlendi
                const passwordPayload: Record<string, string> = {
                    password: profileData.password,
                    currentPassword: profileData.currentPassword
                };

                await api.put('/users/me', passwordPayload);
            } else {
                // 🚀 DÜZELTME: 'any' kirliliği temizlendi
                const payload: Record<string, string> = {
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    email: profileData.email,
                    phone: profileData.phone
                };

                if (profileData.password && profileData.password.length > 0) {
                    payload.password = profileData.password;
                }

                if ((userRole === 'SUPER_ADMIN' || userRole === 'ROLE_SUPER_ADMIN') && userId) {
                    await api.put(`/superadmin/update-admin/${userId}`, payload);
                } else {
                    await api.put('/users/me', payload);
                }
            }

            showToast('Profil bilgileriniz veritabanına kaydedildi ✅', 'success');
            setViewMode('overview');
            await fetchProfileData();

            // 🚀 DÜZELTME: 'as any' zorlaması silindi
            setProfileData(prev => ({ ...prev, password: '', currentPassword: '' }));
        } catch (error: unknown) {
            console.error('Profil güncellenirken hata:', error);
            const err = error as { response?: { data?: string } };
            showToast(err?.response?.data || 'Profil kaydedilemedi. Lütfen tekrar deneyin.', 'error');
        }
    };

    const getInitials = (first: string, last: string) => {
        const name = `${first || ''} ${last || ''}`.trim();
        if (!name || name === 'Yükleniyor...') return 'SA';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (viewMode === 'overview') {
        return (
            <div className="p-6 md:p-10 relative z-10 animate-fade-in-down h-full bg-transparent rounded-tl-3xl">
                <header className="mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Kişisel Profilim</h2>
                    <p className="text-slate-500 mt-1 text-sm">Hesap bilgilerinizi ve güvenlik tercihlerinizi yönetin.</p>
                </header>

                <div className="max-w-5xl">
                    <div className="glass-panel rounded-xl shadow-lg border border-white/40 overflow-hidden mb-8">
                        <div className="h-28 bg-gradient-to-r from-blue-700 to-indigo-800"></div>
                        <div className="px-8 pb-8 relative">
                            <div className="absolute -top-12 left-8 w-24 h-24 glass-panel border-4 border-slate-50 rounded-full flex items-center justify-center text-3xl font-bold tracking-tight text-slate-800 text-blue-700 shadow-lg">
                                {getInitials(profileData.firstName as string, profileData.lastName as string)}
                            </div>
                            <div className="pt-16">
                                <h3 className="text-2xl font-extrabold text-slate-900">{`${profileData.firstName} ${profileData.lastName}`.trim()}</h3>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">{profileData.roleTitle}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><span><Mail className="w-6 h-6" /></span> KURUMSAL E-POSTA</p>
                                    <p className="text-sm font-semibold text-slate-800">{profileData.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><span>📱</span> İLETİŞİM NUMARASI</p>
                                    <p className="text-sm font-semibold text-slate-800">{profileData.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-white/40 pb-2">Hesap İşlemleri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => setViewMode('editPersonal')} className="glass-panel p-5 rounded-xl border border-white/40 shadow-lg hover:border-blue-500 hover:shadow-lg transition-all flex items-center gap-4 text-left group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">👤</div>
                            <div>
                                <h4 className="font-bold text-slate-800">Kişisel Bilgileri Güncelle</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Sistemdeki ad ve soyadınızı değiştirin.</p>
                            </div>
                        </button>
                        <button onClick={() => setViewMode('editEmail')} className="glass-panel p-5 rounded-xl border border-white/40 shadow-lg hover:border-emerald-500 hover:shadow-lg transition-all flex items-center gap-4 text-left group">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Mail className="w-12 h-12" /></div>
                            <div>
                                <h4 className="font-bold text-slate-800">E-Posta Değiştir</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Sistem ve iletişim e-postanızı yenileyin.</p>
                            </div>
                        </button>
                        <button onClick={() => setViewMode('editPhone')} className="glass-panel p-5 rounded-xl border border-white/40 shadow-lg hover:border-purple-500 hover:shadow-lg transition-all flex items-center gap-4 text-left group">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">📱</div>
                            <div>
                                <h4 className="font-bold text-slate-800">Telefon Numarası Değiştir</h4>
                                <p className="text-xs text-slate-500 mt-0.5">İletişim ve güvenlik numaranızı güncelleyin.</p>
                            </div>
                        </button>
                        <button onClick={() => setViewMode('editPassword')} className="glass-panel p-5 rounded-xl border border-white/40 shadow-lg hover:border-amber-500 hover:shadow-lg transition-all flex items-center gap-4 text-left group">
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

    return (
        <div className="animate-fade-in-right h-full bg-transparent p-6 md:p-8 rounded-tl-3xl">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/40">
                <button onClick={() => setViewMode('overview')} className="text-slate-500 hover:text-slate-900 glass-panel border border-slate-300 p-2 rounded-md transition-all shadow-lg font-bold px-4">
                    GERİ DÖN
                </button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800 tracking-tight">
                        {viewMode === 'editPersonal' && 'KİŞİSEL BİLGİLERİ GÜNCELLE'}
                        {viewMode === 'editEmail' && 'E-POSTA ADRESİNİ DEĞİŞTİR'}
                        {viewMode === 'editPhone' && 'TELEFON NUMARASINI DEĞİŞTİR'}
                        {viewMode === 'editPassword' && 'SİSTEM ŞİFRESİNİ YENİLE'}
                    </h2>
                </div>
            </div>

            <div className="max-w-3xl glass-panel p-8 md:p-10 rounded-md shadow-lg border border-white/40">
                <form onSubmit={handleSettingSave} className="space-y-6">

                    {viewMode === 'editPersonal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Ad *</label>
                                <input type="text" value={profileData.firstName as string} onChange={e => setProfileData({...profileData, firstName: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Soyad *</label>
                                <input type="text" value={profileData.lastName as string} onChange={e => setProfileData({...profileData, lastName: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all" required />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 md:col-span-2">Bu isim sistemdeki diğer kullanıcılar tarafından görülecektir.</p>
                        </div>
                    )}

                    {viewMode === 'editEmail' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Yeni E-Posta Adresi *</label>
                            <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all" required />
                        </div>
                    )}

                    {viewMode === 'editPhone' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Yeni Telefon Numarası *</label>
                            <input type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all" placeholder="05XX XXX XX XX" required />
                        </div>
                    )}

                    {viewMode === 'editPassword' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Mevcut Şifreniz *</label>
                                <input type="password" value={profileData.currentPassword} onChange={e => setProfileData({...profileData, currentPassword: e.target.value})} required className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all" placeholder="Mevcut şifreniz" />
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Yeni Şifre *</label>
                                <input type="password" required value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all" />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-white/40">
                        <button type="button" onClick={() => setViewMode('overview')} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-md font-bold text-sm tracking-widest transition-all">
                            İPTAL
                        </button>
                        <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-bold text-sm tracking-widest shadow-lg transition-all">
                            DEĞİŞİKLİKLERİ UYGULA
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ProfileTab;