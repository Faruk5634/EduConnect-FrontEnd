import React from 'react';
import { GraduationCap, BookOpen, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Background decoration — mirrors the LandingPage campus (right) side ─ */
const CampusBgDecor: React.FC = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8%"   cy="15%" r="110" fill="#fde68a" opacity="0.22" />
        <circle cx="92%"  cy="20%" r="80"  fill="#a5f3fc" opacity="0.18" />
        <circle cx="5%"   cy="80%" r="130" fill="#fef3c7" opacity="0.24" />
        <circle cx="88%"  cy="78%" r="100" fill="#bae6fd" opacity="0.20" />
        <circle cx="50%"  cy="5%"  r="60"  fill="#fed7aa" opacity="0.16" />
        {[[20,40],[40,70],[72,55],[85,38],[30,88],[60,20]].map(([cx,cy],i) => (
            <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="2.8" fill="#f59e0b" opacity="0.30" />
        ))}
    </svg>
);

/* ─── Role card data ─────────────────────────────────────────────────────── */
interface RoleCard {
    id: string;
    title: string;
    desc: string;
    icon: React.ReactNode;
    iconBg: string;
    accentBar: string;
}

const roles: RoleCard[] = [
    {
        id: 'parent',
        title: 'Veli',
        desc: 'Öğrencinizin ders takibi, okul duyuruları ve öğretmenle iletişim.',
        icon: <Users className="w-11 h-11" />,
        iconBg: 'bg-amber-50 border-amber-100 text-amber-500',
        accentBar: 'from-amber-300 via-orange-300 to-amber-300',
    },
    {
        id: 'student',
        title: 'Öğrenci',
        desc: 'Ders programı, güncel okul duyuruları ve kampüs iletişimi.',
        icon: <GraduationCap className="w-11 h-11" />,
        iconBg: 'bg-sky-50 border-sky-100 text-sky-500',
        accentBar: 'from-sky-300 via-blue-300 to-sky-300',
    },
    {
        id: 'teacher',
        title: 'Öğretmen',
        desc: 'Sınıf içi duyurular, ders yönetimi ve velilerle güvenli iletişim.',
        icon: <BookOpen className="w-11 h-11" />,
        iconBg: 'bg-teal-50 border-teal-100 text-teal-500',
        accentBar: 'from-teal-300 via-emerald-300 to-teal-300',
    },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */
const CampusPortal: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen overflow-hidden font-sans select-none
                        bg-gradient-to-br from-[#fffcf0] via-[#fef9ee] to-[#f0f9ff]
                        flex flex-col items-center justify-center px-8 py-12">

            <CampusBgDecor />

            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">

                {/* ── Header ──────────────────────────────────── */}
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center shadow-sm">
                        <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-black tracking-tight">
                        <span className="text-slate-800">Edu</span>
                        <span className="text-amber-500">Connect</span>
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-3">
                    Kampüs Portalı
                </h1>
                <p className="text-slate-500 text-base font-medium mb-14">
                    Sisteme giriş yapmak için rolünüzü seçin
                </p>

                {/* ── Role cards: Veli | Öğrenci | Öğretmen ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-7 w-full">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            onClick={() => navigate('/login', { state: { roleId: role.id, roleTitle: role.title } })}
                            className="group relative flex flex-col items-center text-center rounded-3xl px-10 py-12 cursor-pointer
                                       transition-all duration-500 ease-out hover:-translate-y-2"
                            style={{
                                background: 'rgba(255,255,255,0.88)',
                                backdropFilter: 'blur(18px)',
                                WebkitBackdropFilter: 'blur(18px)',
                                border: '1px solid rgba(251,191,36,0.18)',
                                boxShadow: '0 8px 40px rgba(148,163,184,0.12)',
                            }}
                        >
                            {/* Hover accent bar */}
                            <div className={`absolute top-0 left-10 right-10 h-[2px] rounded-full
                                             opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                             bg-gradient-to-r ${role.accentBar}`} />

                            {/* Icon */}
                            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-8 border
                                             group-hover:scale-105 transition-transform duration-300 ${role.iconBg}`}
                                 style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                                {role.icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-3">
                                {role.title}
                            </h3>

                            {/* Description */}
                            <p className="text-slate-500 text-sm leading-[1.75] max-w-[200px]">
                                {role.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Back link ────────────────────────────── */}
                <button
                    onClick={() => navigate('/')}
                    className="mt-14 inline-flex items-center gap-2 text-slate-400 hover:text-slate-700
                               text-sm font-medium tracking-wide transition-colors duration-200
                               px-5 py-2.5 rounded-xl hover:bg-white/70 border border-transparent
                               hover:border-slate-200/60"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Ana Ekrana Dön
                </button>

            </div>
        </div>
    );
};

export default CampusPortal;