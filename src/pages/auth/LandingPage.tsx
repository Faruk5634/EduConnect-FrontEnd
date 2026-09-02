import React from 'react';
import { Building2, GraduationCap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Left background: Matte Dark Navy with subtle grid ─────────────────── */
const AdminBgDecor: React.FC = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="adminBlob" cx="50%" cy="80%" r="60%">
                <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0c1322" stopOpacity="0" />
            </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#adminBlob)" />
        {[...Array(12)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${(i + 1) * 7.7}%`} x2="100%" y2={`${(i + 1) * 7.7}%`}
                stroke="#94a3b8" strokeWidth="0.35" opacity="0.07" />
        ))}
        {[...Array(12)].map((_, i) => (
            <line key={`v${i}`} x1={`${(i + 1) * 7.7}%`} y1="0" x2={`${(i + 1) * 7.7}%`} y2="100%"
                stroke="#94a3b8" strokeWidth="0.35" opacity="0.07" />
        ))}
        {[[15, 20], [75, 15], [35, 55], [85, 65], [10, 75], [60, 40], [90, 30], [22, 88]].map(([cx, cy], i) => (
            <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="2.5" fill="#475569" opacity="0.30" />
        ))}
        <line x1="15%" y1="20%" x2="35%" y2="55%" stroke="#334155" strokeWidth="0.6" opacity="0.2" />
        <line x1="75%" y1="15%" x2="85%" y2="65%" stroke="#334155" strokeWidth="0.6" opacity="0.2" />
        <line x1="35%" y1="55%" x2="60%" y2="40%" stroke="#334155" strokeWidth="0.6" opacity="0.2" />
        {[26, 40, 34, 54, 40, 50, 36].map((h, i) => (
            <rect key={i} x={`${5 + i * 5}%`} y={`${97 - h * 0.3}%`}
                width="3.5%" height={`${h * 0.3}%`} fill="#1e293b" rx="2" opacity="0.6" />
        ))}
    </svg>
);

/* ─── Right background: Warm pastel blobs ───────────────────────────────── */
const CampusBgDecor: React.FC = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18%" cy="20%" r="100" fill="#fde68a" opacity="0.28" />
        <circle cx="80%" cy="75%" r="140" fill="#bae6fd" opacity="0.22" />
        <circle cx="60%" cy="10%" r="60"  fill="#a5f3fc" opacity="0.20" />
        <circle cx="6%"  cy="85%" r="80"  fill="#fef3c7" opacity="0.30" />
        <circle cx="92%" cy="20%" r="50"  fill="#fed7aa" opacity="0.20" />
        {[[28, 46], [66, 26], [42, 80], [82, 52], [16, 58], [50, 68]].map(([cx, cy], i) => (
            <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="3" fill="#f59e0b" opacity="0.35" />
        ))}
    </svg>
);

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen overflow-hidden font-sans select-none">

            {/* Split backgrounds */}
            <div className="absolute inset-y-0 left-0 w-1/2 bg-[#0c1322] pointer-events-none">
                <AdminBgDecor />
            </div>
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-br from-[#fffcf0] via-[#fef9ee] to-[#f0f9ff] pointer-events-none">
                <CampusBgDecor />
            </div>
            {/* Sharp center divider */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-px w-px bg-gradient-to-b from-transparent via-slate-600/30 to-transparent pointer-events-none" />

            {/* Two-column layout — each card fills its half */}
            <main className="relative z-10 min-h-screen grid grid-cols-2">

                {/* ── LEFT: Admin card ─────────────────────────── */}
                <div className="flex items-center justify-center px-16 py-12">
                    <div
                        onClick={() => navigate('/admin-login')}
                        className="group relative flex flex-col items-center text-center w-full max-w-lg rounded-3xl px-14 py-14 cursor-pointer transition-all duration-500 ease-out hover:-translate-y-1"
                        style={{
                            background: 'rgba(20, 28, 46, 0.80)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(71, 85, 105, 0.40)',
                            boxShadow: '0 12px 60px rgba(8, 12, 22, 0.70)',
                        }}
                    >
                        {/* Hover top accent */}
                        <div className="absolute top-0 left-12 right-12 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-gradient-to-r from-transparent via-slate-400/50 to-transparent" />

                        {/* Logo inside card — white theme */}
                        <div className="flex items-center gap-2.5 mb-10">
                            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight">
                                <span className="text-white">Edu</span>
                                <span className="text-sky-400">Connect</span>
                            </span>
                        </div>

                        {/* Icon */}
                        <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-300">
                            <Building2 className="w-12 h-12 text-slate-300" />
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-black text-white tracking-tight mb-4">
                            Yönetim Portalı
                        </h2>

                        {/* Description */}
                        <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-xs">
                            Kurum yöneticileri için güvenli yönetim merkezi.
                        </p>

                        {/* CTA */}
                        <button
                            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm text-slate-100 bg-slate-700 hover:bg-slate-600 border border-slate-600/50 transition-all duration-300 group-hover:gap-4"
                        >
                            Giriş Yap
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>

                {/* ── RIGHT: Campus card ───────────────────────── */}
                <div className="flex items-center justify-center px-16 py-12">
                    <div
                        onClick={() => navigate('/campus')}
                        className="group relative flex flex-col items-center text-center w-full max-w-lg rounded-3xl px-14 py-14 cursor-pointer transition-all duration-500 ease-out hover:-translate-y-1"
                        style={{
                            background: 'rgba(255, 255, 255, 0.88)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(251, 191, 36, 0.25)',
                            boxShadow: '0 12px 60px rgba(251, 191, 36, 0.12)',
                        }}
                    >
                        {/* Hover top accent */}
                        <div className="absolute top-0 left-12 right-12 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300" />

                        {/* Logo inside card — dark theme, amber accent matches CTA */}
                        <div className="flex items-center gap-2.5 mb-10">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight">
                                <span className="text-slate-800">Edu</span>
                                <span className="text-amber-500">Connect</span>
                            </span>
                        </div>

                        {/* Icon */}
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-50 to-sky-50 border border-amber-100 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-300">
                            <GraduationCap className="w-12 h-12 text-amber-500" />
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">
                            Kampüs Portalı
                        </h2>

                        {/* Description */}
                        <p className="text-slate-500 text-base leading-relaxed mb-10 max-w-xs">
                            Öğretmenler, öğrenciler ve veliler için interaktif eğitim platformu.
                        </p>

                        {/* CTA */}
                        <button
                            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 shadow-md shadow-amber-200/50 transition-all duration-300 group-hover:gap-4"
                        >
                            Portala Git
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>

            </main>

            {/* Footer — bottom-left on the dark side */}
            <footer className="absolute bottom-0 left-0 z-30 pb-5 pl-8">
                <p className="text-slate-400/55 text-xs font-light tracking-wide">
                    © 2026 EduConnect Platform · Tüm Hakları Saklıdır
                </p>
            </footer>

        </div>
    );
};

export default LandingPage;