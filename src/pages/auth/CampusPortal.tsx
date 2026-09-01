import React from 'react';
import { GraduationCap, Users, UserCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CampusPortal: React.FC = () => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'student',
            title: 'Öğrenci',
            icon: <GraduationCap className="w-12 h-12" />,
            desc: 'Ders programı, notlar ve devamsızlık takibi',
            color: 'from-emerald-400 to-teal-500',
            textHover: 'group-hover:text-emerald-400',
            borderHover: 'hover:border-emerald-500/30'
        },
        {
            id: 'teacher',
            title: 'Öğretmen',
            icon: <UserCircle2 className="w-12 h-12" />,
            desc: 'Sınıf yönetimi, not girişi ve duyurular',
            color: 'from-sky-400 to-indigo-500',
            textHover: 'group-hover:text-sky-400',
            borderHover: 'hover:border-sky-500/30'
        },
        {
            id: 'parent',
            title: 'Veli',
            icon: <Users className="w-12 h-12" />,
            desc: 'Öğrenci gelişimi ve öğretmen iletişimi',
            color: 'from-purple-400 to-pink-500',
            textHover: 'group-hover:text-purple-400',
            borderHover: 'hover:border-purple-500/30'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            
            {/* Ambient Deep Glows */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none"></div>
            <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

            <div className="relative z-10 w-full max-w-5xl animate-slide-up">
                
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight">
                        Kampüs Portalı
                    </h2>
                    <p className="text-slate-400 text-lg font-medium">
                        Sisteme giriş yapmak için rolünüzü seçin
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            onClick={() => {
                                navigate('/login', {
                                    state: { roleId: role.id, roleTitle: role.title }
                                });
                            }}
                            className={`bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-10 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:bg-slate-800/60 shadow-2xl ${role.borderHover} group relative overflow-hidden flex flex-col items-center`}
                        >
                            {/* Hover Top Border Indicator */}
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${role.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                            
                            <div className={`w-24 h-24 bg-slate-800/80 rounded-3xl flex items-center justify-center mb-8 transform group-hover:scale-110 transition-all duration-300 shadow-inner border border-slate-700 text-slate-300 ${role.textHover}`}>
                                {role.icon}
                            </div>

                            <h3 className="text-2xl font-bold text-white text-center mb-3">
                                {role.title}
                            </h3>
                            <p className="text-slate-400 text-base text-center leading-relaxed">
                                {role.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 font-medium transition-colors px-6 py-3 rounded-full hover:bg-slate-800/50"
                    >
                        <ArrowLeft className="w-5 h-5" /> Ana Ekrana Dön
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CampusPortal;