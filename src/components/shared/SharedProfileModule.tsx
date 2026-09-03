import React, { useState, useEffect } from 'react';
import { User, Mail, Smartphone, Lock, Save, GraduationCap, CheckCircle2 } from 'lucide-react';

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
        schoolName?: string;
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
    /** 'sky' = öğrenci mavi, 'emerald' = öğretmen yeşil (default) */
    theme?: 'sky' | 'emerald' | 'amber';
}

export default function SharedProfileModule({
    headerInfo,
    contactInfo,
    additionalInfoTitle,
    additionalInfo,
    initialFormState,
    onUpdateProfile,
    hideEditOptions = false,
    theme = 'emerald'
}: SharedProfileModuleProps) {
    // ── Tema ──────────────────────────────────────────────────────────────────
    const getThemeConfig = () => {
        if (theme === 'sky') return {
            headerGrad: 'bg-gradient-to-r from-sky-600 to-blue-700', avatarBg: 'bg-sky-500',
            badgeBg: 'bg-sky-50/30 border-sky-400/30 text-sky-100', saveBtn: 'bg-sky-600 hover:bg-sky-700 shadow-sky-200',
            ring: 'focus:ring-sky-500 focus:border-sky-500', tabActive: 'bg-sky-50 text-sky-700 border-sky-200',
            iconActive: 'text-sky-600'
        };
        if (theme === 'amber') return {
            headerGrad: 'bg-gradient-to-r from-amber-500 to-orange-600', avatarBg: 'bg-amber-500',
            badgeBg: 'bg-amber-50/30 border-amber-400/30 text-amber-100', saveBtn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
            ring: 'focus:ring-amber-500 focus:border-amber-500', tabActive: 'bg-amber-50 text-amber-700 border-amber-200',
            iconActive: 'text-amber-600'
        };
        return {
            headerGrad: 'bg-gradient-to-r from-emerald-600 to-teal-700', avatarBg: 'bg-emerald-500',
            badgeBg: 'bg-emerald-50/30 border-emerald-400/30 text-emerald-100', saveBtn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
            ring: 'focus:ring-emerald-500 focus:border-emerald-500', tabActive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            iconActive: 'text-emerald-600'
        };
    };
    const p = getThemeConfig();
    const [updateForm, setUpdateForm] = useState({
        ...initialFormState,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isSavingInfo, setIsSavingInfo] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [savedInfo, setSavedInfo] = useState(false);
    const [savedPassword, setSavedPassword] = useState(false);

    useEffect(() => {
        setUpdateForm(prev => ({
            ...prev,
            firstName: initialFormState.firstName,
            lastName: initialFormState.lastName,
            email: initialFormState.email,
            phone: initialFormState.phone,
        }));
    }, [initialFormState]);

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingInfo(true);
        await onUpdateProfile('editPersonal', updateForm);
        setIsSavingInfo(false);
        setSavedInfo(true);
        setTimeout(() => setSavedInfo(false), 3000);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (updateForm.newPassword !== updateForm.confirmPassword) {
            alert('Yeni şifreler eşleşmiyor!');
            return;
        }
        if (updateForm.newPassword.length < 6) {
            alert('Şifre en az 6 karakter olmalıdır!');
            return;
        }
        setIsSavingPassword(true);
        await onUpdateProfile('editPassword', updateForm);
        setIsSavingPassword(false);
        setSavedPassword(true);
        setUpdateForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        setTimeout(() => setSavedPassword(false), 3000);
    };

    return (
        <div className="w-full space-y-6 pb-10">

            {/* ── Profil Başlık Kartı ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Emerald Header */}
                <div className={`${p.headerGrad} p-8 relative overflow-hidden`}>
                    {/* Dekoratif daireler */}
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full"></div>
                    <div className="absolute -right-4 -bottom-16 w-32 h-32 bg-white/5 rounded-full"></div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-3xl font-black text-white shadow-lg flex-shrink-0">
                            {headerInfo.initials}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">{headerInfo.firstName} {headerInfo.lastName}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {headerInfo.badgeText && (
                                    <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white px-3 py-1 rounded-lg text-xs font-bold">
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        {headerInfo.badgeText}
                                    </span>
                                )}
                                {headerInfo.schoolName && (
                                    <span className="text-emerald-100 text-sm font-medium">
                                        {headerInfo.schoolName}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mevcut Bilgiler */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* İletişim */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 pb-2 border-b border-slate-100">
                            İletişim Bilgileri
                        </h4>
                        <div className="space-y-4">
                            {contactInfo.map((info, idx) => (
                                <div key={idx}>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{info.label}</p>
                                    <p className={`text-sm font-bold mt-0.5 ${info.valueClass || 'text-slate-800'}`}>{info.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ek Bilgiler */}
                    {additionalInfo && additionalInfo.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 pb-2 border-b border-slate-100">
                                {additionalInfoTitle || 'Kayıt Bilgileri'}
                            </h4>
                            <div className="space-y-4">
                                {additionalInfo.map((info, idx) => (
                                    <div key={idx}>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{info.label}</p>
                                        <p className={`text-sm font-bold mt-0.5 ${info.valueClass || 'text-slate-800'}`}>{info.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!hideEditOptions && (
                <>
                    {/* ── Kişisel Bilgileri Güncelle ── */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${p.tabActive} flex items-center justify-center flex-shrink-0`}>
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Kişisel Bilgiler</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Ad, soyad, e-posta ve telefon bilgilerini düzenleyin</p>
                            </div>
                        </div>

                        <form onSubmit={handleInfoSubmit} className="p-6 space-y-5">
                            {/* Ad & Soyad */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Ad</label>
                                    <input
                                        type="text"
                                        value={updateForm.firstName}
                                        onChange={e => setUpdateForm({ ...updateForm, firstName: e.target.value })}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 ${p.ring} outline-none transition-all focus:bg-white`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Soyad</label>
                                    <input
                                        type="text"
                                        value={updateForm.lastName}
                                        onChange={e => setUpdateForm({ ...updateForm, lastName: e.target.value })}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 ${p.ring} outline-none transition-all focus:bg-white`}
                                        required
                                    />
                                </div>
                            </div>

                            {/* E-Posta */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" /> E-Posta Adresi
                                </label>
                                <input
                                    type="email"
                                    value={updateForm.email}
                                    onChange={e => setUpdateForm({ ...updateForm, email: e.target.value })}
                                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 ${p.ring} outline-none transition-all focus:bg-white`}
                                    placeholder="ornek@okul.edu.tr"
                                />
                            </div>

                            {/* Telefon */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-slate-400" /> Telefon Numarası
                                </label>
                                <input
                                    type="text"
                                    value={updateForm.phone}
                                    onChange={e => setUpdateForm({ ...updateForm, phone: e.target.value })}
                                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 ${p.ring} outline-none transition-all focus:bg-white`}
                                    placeholder="05XX XXX XX XX"
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isSavingInfo}
                                    className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-sm ${
                                        savedInfo
                                            ? `${p.tabActive} border`
                                            : `${p.saveBtn} text-white shadow-sm`
                                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                    {savedInfo ? (
                                        <><CheckCircle2 className="w-5 h-5" /> Kaydedildi!</>
                                    ) : isSavingInfo ? (
                                        <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Kaydediliyor...</>
                                    ) : (
                                        <><Save className="w-5 h-5" /> Bilgileri Kaydet</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── Şifre Güncelleme ── */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Şifre Güvenliği</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Hesabınızın güvenliği için şifrenizi düzenli aralıklarla değiştirin</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Mevcut Şifre</label>
                                <input
                                    type="password"
                                    value={updateForm.currentPassword}
                                    onChange={e => setUpdateForm({ ...updateForm, currentPassword: e.target.value })}
                                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 ${p.ring} outline-none transition-all focus:bg-white`}
                                    placeholder="Mevcut şifrenizi girin"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Yeni Şifre</label>
                                    <input
                                        type="password"
                                        value={updateForm.newPassword}
                                        onChange={e => setUpdateForm({ ...updateForm, newPassword: e.target.value })}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 ${p.ring} outline-none transition-all focus:bg-white`}
                                        placeholder="En az 6 karakter"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Yeni Şifre (Tekrar)</label>
                                    <input
                                        type="password"
                                        value={updateForm.confirmPassword}
                                        onChange={e => setUpdateForm({ ...updateForm, confirmPassword: e.target.value })}
                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 outline-none transition-all focus:bg-white ${
                                            updateForm.confirmPassword && updateForm.newPassword !== updateForm.confirmPassword
                                                ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                                                : `border-slate-200 ${p.ring}`
                                        }`}
                                        placeholder="Şifreyi tekrar girin"
                                        required
                                    />
                                    {updateForm.confirmPassword && updateForm.newPassword !== updateForm.confirmPassword && (
                                        <p className="text-xs text-red-500 font-semibold mt-1">Şifreler eşleşmiyor</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isSavingPassword || !updateForm.currentPassword || !updateForm.newPassword || !updateForm.confirmPassword}
                                    className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-sm ${
                                        savedPassword
                                            ? `${p.tabActive} border`
                                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                    {savedPassword ? (
                                        <><CheckCircle2 className="w-5 h-5" /> Şifre Güncellendi!</>
                                    ) : isSavingPassword ? (
                                        <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Güncelleniyor...</>
                                    ) : (
                                        <><Lock className="w-5 h-5" /> Şifreyi Güncelle</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
