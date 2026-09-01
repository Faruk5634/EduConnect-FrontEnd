import React, { useState, useEffect } from 'react';
import { User, Mail, Smartphone, Lock } from 'lucide-react';

type ProfileViewMode = 'overview' | 'editPersonal' | 'editEmail' | 'editPhone' | 'editPassword';

interface ProfileInfoRow {
    label: string;
    value: React.ReactNode;
    valueClass?: string;
}

interface SharedProfileModuleProps {
    headerInfo: {
        initials: string;
        firstName: string;
        lastName: string;
        badgeText?: string;
    };
    contactInfo: ProfileInfoRow[];
    additionalInfoTitle?: string;
    additionalInfo?: ProfileInfoRow[];
    initialFormState: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    onUpdateProfile: (viewMode: string, formData: any) => Promise<void>;
    hideEditOptions?: boolean;
}

export default function SharedProfileModule({
    headerInfo,
    contactInfo,
    additionalInfoTitle,
    additionalInfo,
    initialFormState,
    onUpdateProfile,
    hideEditOptions = false
}: SharedProfileModuleProps) {
    const [profileViewMode, setProfileViewMode] = useState<ProfileViewMode>('overview');
    const [updateForm, setUpdateForm] = useState({
        ...initialFormState,
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        setUpdateForm(prev => ({
            ...prev,
            firstName: initialFormState.firstName,
            lastName: initialFormState.lastName,
            email: initialFormState.email,
            phone: initialFormState.phone
        }));
    }, [initialFormState]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdateProfile(profileViewMode, updateForm);
        setProfileViewMode('overview');
        setUpdateForm(prev => ({ ...prev, newPassword: '', currentPassword: '' }));
    };

    if (profileViewMode !== 'overview') {
        return (
            <div className="max-w-4xl mx-auto h-full animate-fade-in-right p-6 md:p-8 glass-panel rounded-2xl shadow-lg border border-white/40">
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/40">
                    <button onClick={() => setProfileViewMode('overview')} className="text-slate-500 hover:text-slate-900 bg-transparent border border-white/40 p-2 rounded-md transition-all shadow-lg font-bold px-4">
                        GERİ DÖN
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800 tracking-tight">
                            {profileViewMode === 'editPersonal' && 'KİŞİSEL BİLGİLERİ GÜNCELLE'}
                            {profileViewMode === 'editEmail' && 'E-POSTA ADRESİNİ DEĞİŞTİR'}
                            {profileViewMode === 'editPhone' && 'TELEFON NUMARASINI DEĞİŞTİR'}
                            {profileViewMode === 'editPassword' && 'SİSTEM ŞİFRESİNİ YENİLE'}
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                    {profileViewMode === 'editPersonal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Ad *</label>
                                <input type="text" value={updateForm.firstName} onChange={e => setUpdateForm({...updateForm, firstName: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-indigo-500 outline-none transition-all" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Soyad *</label>
                                <input type="text" value={updateForm.lastName} onChange={e => setUpdateForm({...updateForm, lastName: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-indigo-500 outline-none transition-all" required />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 md:col-span-2">Bu isim sistemdeki diğer kullanıcılar tarafından görülecektir.</p>
                        </div>
                    )}

                    {profileViewMode === 'editEmail' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Yeni E-Posta Adresi *</label>
                            <input type="email" value={updateForm.email} onChange={e => setUpdateForm({...updateForm, email: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-indigo-500 outline-none transition-all" required />
                        </div>
                    )}

                    {profileViewMode === 'editPhone' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Yeni Telefon Numarası *</label>
                            <input type="text" value={updateForm.phone} onChange={e => setUpdateForm({...updateForm, phone: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-indigo-500 outline-none transition-all" placeholder="05XX XXX XX XX" required />
                        </div>
                    )}

                    {profileViewMode === 'editPassword' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Mevcut Şifreniz *</label>
                                <input type="password" value={updateForm.currentPassword} onChange={e => setUpdateForm({...updateForm, currentPassword: e.target.value})} required className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-indigo-500 outline-none transition-all" placeholder="Mevcut şifreniz" />
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Yeni Şifre *</label>
                                <input type="password" required value={updateForm.newPassword} onChange={e => setUpdateForm({...updateForm, newPassword: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-indigo-500 outline-none transition-all" />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-white/40">
                        <button type="button" onClick={() => setProfileViewMode('overview')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold text-sm tracking-widest transition-all">
                            İPTAL
                        </button>
                        <button type="submit" className="btn-primary px-8 py-3 rounded-lg font-bold text-sm tracking-widest shadow-lg transition-all">
                            DEĞİŞİKLİKLERİ UYGULA
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-full animate-fade-in-down pb-10">
            <div className="glass-panel rounded-2xl shadow-lg border border-white/40 overflow-hidden mb-8">
                <div className="bg-indigo-900 p-10 text-white relative">
                    <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px]"></div>
                    <div className="w-24 h-24 glass-panel/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl font-bold tracking-tight text-white shadow-inner border border-white/20 relative z-10 mb-6">
                        {headerInfo.initials}
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight text-white tracking-tight relative z-10">{headerInfo.firstName} {headerInfo.lastName}</h3>
                    {headerInfo.badgeText && (
                        <span className="inline-block mt-3 px-3 py-1 bg-indigo-500/40 border border-indigo-400 text-indigo-100 rounded-md text-xs font-bold tracking-widest uppercase relative z-10">
                            {headerInfo.badgeText}
                        </span>
                    )}
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">İletişim Bilgileri</h4>
                        <div className="space-y-6">
                            {contactInfo.map((info, idx) => (
                                <div key={idx}>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{info.label}</p>
                                    <p className={`text-base font-bold ${info.valueClass || 'text-slate-800'}`}>{info.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {additionalInfo && additionalInfo.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
                                {additionalInfoTitle || 'Kayıt Bilgileri'}
                            </h4>
                            <div className="space-y-6">
                                {additionalInfo.map((info, idx) => (
                                    <div key={idx}>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{info.label}</p>
                                        <p className={`text-base font-bold ${info.valueClass || 'text-slate-800'}`}>{info.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!hideEditOptions && (
                <>
                    <h3 className="text-xl font-bold tracking-tight text-slate-800 text-slate-800 mb-4">Hesap İşlemleri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div onClick={() => setProfileViewMode('editPersonal')} className="glass-panel p-6 rounded-2xl border border-white/40 shadow-lg hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Kişisel Bilgileri Güncelle</h4>
                                <p className="text-xs text-slate-500 mt-1">Sistemdeki ad ve soyadınızı değiştirin.</p>
                            </div>
                        </div>
                        <div onClick={() => setProfileViewMode('editEmail')} className="glass-panel p-6 rounded-2xl border border-white/40 shadow-lg hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">E-Posta Değiştir</h4>
                                <p className="text-xs text-slate-500 mt-1">Sistem ve iletişim e-postanızı yenileyin.</p>
                            </div>
                        </div>
                        <div onClick={() => setProfileViewMode('editPhone')} className="glass-panel p-6 rounded-2xl border border-white/40 shadow-lg hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Telefon Numarası Değiştir</h4>
                                <p className="text-xs text-slate-500 mt-1">İletişim numaranızı güncelleyin.</p>
                            </div>
                        </div>
                        <div onClick={() => setProfileViewMode('editPassword')} className="glass-panel p-6 rounded-2xl border border-white/40 shadow-lg hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Şifre Değiştir</h4>
                                <p className="text-xs text-slate-500 mt-1">Hesap güvenliğiniz için şifrenizi yenileyin.</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
