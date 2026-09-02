import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { GraduationCap, Users, BookOpen, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import parentIllustration from '../../assets/parent_transparent_v4.png';
import studentIllustration from '../../assets/student_transparent.png';
import teacherIllustration from '../../assets/teacher_transparent.png';/* ─── Per-role theme ─────────────────────────────────────────────────────── */
interface RoleTheme {
    icon: React.ReactNode;
    iconColor: string;
    leftBg: string;
    btn: string;
}

const THEMES: Record<string, RoleTheme> = {
    parent: {
        icon: <Users className="w-8 h-8" />,
        iconColor: 'text-amber-500',
        leftBg: 'bg-gradient-to-b from-[#f59e0b] to-[#d97706]',
        btn: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    },
    student: {
        icon: <GraduationCap className="w-8 h-8" />,
        iconColor: 'text-sky-500',
        leftBg: 'bg-gradient-to-b from-[#0ea5e9] to-[#0284c7]',
        btn: 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700',
    },
    teacher: {
        icon: <BookOpen className="w-8 h-8" />,
        iconColor: 'text-teal-500',
        leftBg: 'bg-gradient-to-b from-[#14b8a6] to-[#0f766e]',
        btn: 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700',
    },
};

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { roleId = 'student', roleTitle = 'Öğrenci' } = location.state || {};
    const theme = THEMES[roleId] ?? THEMES.student;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', { username, password }, { headers: { 'X-Skip-Auth-Redirect': '1' } });
            const { token, role, username: resUser } = res.data;
            if (['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_VICE_ADMIN'].includes(role)) {
                setError("Bu portal sadece kampüs kullanıcıları içindir.");
                setIsLoading(false); return;
            }
            const expected: Record<string, string> = { student: 'ROLE_STUDENT', teacher: 'ROLE_TEACHER', parent: 'ROLE_PARENT' };
            if (role !== expected[roleId]) {
                setError(`Sadece ${roleTitle} yetkisine sahip kişiler giriş yapabilir.`);
                setIsLoading(false); return;
            }
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('username', resUser);
            if (role === 'ROLE_TEACHER') navigate('/teacher');
            else if (role === 'ROLE_PARENT') navigate('/parent');
            else if (role === 'ROLE_STUDENT') navigate('/student');
            else navigate('/');
        } catch {
            setError('Giriş başarısız! Lütfen bilgilerinizi kontrol ediniz.');
            setIsLoading(false);
        }
    };

    const iconBgMap: Record<string, string> = {
        parent: 'bg-amber-50 text-amber-500',
        student: 'bg-sky-50 text-sky-500',
        teacher: 'bg-teal-50 text-teal-500',
    };
    const iconBg = iconBgMap[roleId] ?? iconBgMap.student;

    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">

            {/* ══ LEFT PANEL (40%) ══ */}
            <div className={`hidden lg:flex flex-col relative w-[40%] ${theme.leftBg}`}>
                {/* Subtle texture */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                {/* Logo */}
                <div className="absolute top-12 left-12 z-20 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-2xl font-black tracking-tight">EduConnect</span>
                </div>

                {/* Unified Content Block (Text + Image) Centered */}
                {/* FIX: Removed z-10 from here so it doesn't create a stacking context, blocking mix-blend-multiply */}
                <div className="relative flex-1 flex flex-col justify-center items-center px-12 pt-24">
                    <div className="w-full max-w-[440px] flex flex-col gap-6">

                        {/* Text Content */}
                        <div>
                            <h1 className="text-white text-[2.5rem] leading-[1.15] font-black tracking-tight mb-4 drop-shadow-sm">
                                Geleceğin Eğitimi<br />EduConnect ile<br />Başlıyor.
                            </h1>
                            <p className="text-white/80 text-[15px] font-medium leading-relaxed">
                                Öğrenci, öğretmen ve veli deneyimini kusursuzlaştıran yeni nesil eğitim platformu.
                            </p>
                        </div>

                        {/* Transparent Illustration with Glassmorphism Wrapper */}
                        <div className="relative p-6 sm:p-10 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl shadow-orange-900/10">
                            
                            <div className="relative w-full max-w-[480px] aspect-square pointer-events-none z-10 mx-auto">
                                <img 
                                    src={
                                        roleId === 'parent' ? parentIllustration :
                                        roleId === 'teacher' ? teacherIllustration :
                                        studentIllustration
                                    }
                                    alt="Portal Illustration" 
                                    className="absolute inset-0 w-full h-full object-contain select-none drop-shadow-xl"
                                />
                                
                                {roleId === 'parent' && (
                                    <>
                                        {/* CSS Overlays for precise text without ruining the image */}
                                        {/* Phone Screen Text */}
                                        <div className="absolute flex items-center justify-center" style={{ top: '48%', left: '48.5%', transform: 'translate(-50%, -50%) rotate(-15deg)' }}>
                                            <span className="text-[7px] sm:text-[9px] font-black text-sky-900 tracking-tighter opacity-80">EduConnect</span>
                                        </div>

                                        {/* Books Text */}
                                        <div className="absolute flex flex-col items-center gap-[4px] sm:gap-[6px]" style={{ top: '68%', left: '58.5%', transform: 'translate(-50%, -50%) rotate(-4deg)' }}>
                                            <span className="text-[4.5px] sm:text-[6px] font-bold text-slate-800 opacity-90">MATEMATİK</span>
                                            <span className="text-[4.5px] sm:text-[6px] font-bold text-white opacity-90">SOSYAL</span>
                                            <span className="text-[4.5px] sm:text-[6px] font-bold text-white opacity-90">İNGİLİZCE</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ══ RIGHT PANEL (60%) ══ */}
            <div className="flex-1 lg:w-[60%] flex items-center justify-center relative bg-[#FDFDFD]">

                {/* Ambient glow */}
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

                {/* Form Area - Centered, Clean */}
                <div className="relative z-10 w-full max-w-[420px] bg-white rounded-3xl p-10 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">

                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${iconBg}`}>
                        {theme.icon}
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                        {roleTitle} Girişi
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mb-8">
                        Hesabınıza giriş yaparak devam edin
                    </p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-medium">
                                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 tracking-widest uppercase ml-1">Kullanıcı Adı</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Kullanıcı adınızı girin"
                                required
                                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none text-slate-800 placeholder-slate-400 text-sm focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 tracking-widest uppercase ml-1">Şifre</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-none text-slate-800 placeholder-slate-400 text-sm focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-2xl font-bold text-white mt-4 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${theme.btn}`}
                        >
                            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Giriş Yapılıyor...</> : 'Giriş Yap'}
                        </button>
                    </form>

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => navigate('/campus')}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Ana Ekrana Dön
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;