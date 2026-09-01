import React from 'react';
import { Building2, GraduationCap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            
            {/* Ambient Deep Glows */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

            <div className="text-center mb-16 relative z-10 animate-slide-up">
                <div className="inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-md rounded-2xl mb-6 border border-white/10 shadow-2xl">
                    <GraduationCap className="w-10 h-10 text-sky-400" />
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6 tracking-tight drop-shadow-sm">
                    EduConnect
                </h1>
                <p className="text-xl text-slate-400 font-medium tracking-wide max-w-xl mx-auto">
                    Yeni nesil eğitim yönetim platformuna hoş geldiniz. Lütfen giriş yapmak istediğiniz portalı seçin.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl relative z-10 animate-fade-in">

                {/* Yönetim Portalı */}
                <div
                    onClick={() => navigate('/admin-login')}
                    className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-10 rounded-[2rem] shadow-2xl hover:bg-slate-800/60 hover:-translate-y-2 hover:border-sky-500/30 transition-all duration-300 cursor-pointer flex flex-col items-center text-center group relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-20 h-20 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-slate-700">
                        <Building2 className="w-10 h-10 text-sky-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Yönetim Portalı</h2>
                    <p className="text-slate-400 text-base mb-8">
                        Kurum yöneticileri ve sistem adminleri için güvenli yönetim merkezi.
                    </p>
                    <div className="mt-auto flex items-center gap-2 text-sky-400 font-semibold group-hover:gap-4 transition-all">
                        Giriş Yap <ChevronRight className="w-5 h-5" />
                    </div>
                </div>

                {/* Kampüs Portalı */}
                <div
                    onClick={() => navigate('/campus')}
                    className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-10 rounded-[2rem] shadow-2xl hover:bg-slate-800/60 hover:-translate-y-2 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer flex flex-col items-center text-center group relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-20 h-20 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-slate-700">
                        <GraduationCap className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Kampüs Portalı</h2>
                    <p className="text-slate-400 text-base mb-8">
                        Öğretmenler, öğrenciler ve veliler için interaktif eğitim platformu.
                    </p>
                    <div className="mt-auto flex items-center gap-2 text-emerald-400 font-semibold group-hover:gap-4 transition-all">
                        Portala Git <ChevronRight className="w-5 h-5" />
                    </div>
                </div>

            </div>

            <div className="absolute bottom-8 text-slate-500 text-sm font-medium tracking-wide z-10">
                © 2026 EduConnect Platform. Tüm Hakları Saklıdır.
            </div>
        </div>
    );
};

export default LandingPage;