import React from 'react';
import { useNavigate } from 'react-router-dom';

const CampusPortal: React.FC = () => {
    const navigate = useNavigate();

    // 🎭 Meydandaki Seçilebilir Roller (Şampiyonlar)
    const roles = [
        {
            id: 'student',
            title: 'Öğrenci',
            icon: '🎓',
            desc: 'Ders programı, notlar ve devamsızlık takibi',
            color: 'from-emerald-400 to-teal-500',
            shadow: 'shadow-emerald-500/20'
        },
        {
            id: 'teacher',
            title: 'Öğretmen',
            icon: '👨‍🏫',
            desc: 'Sınıf yönetimi, not girişi ve duyurular',
            color: 'from-blue-400 to-indigo-500',
            shadow: 'shadow-blue-500/20'
        },
        {
            id: 'parent',
            title: 'Veli',
            icon: '👨‍👩‍👦',
            desc: 'Öğrenci gelişimi ve öğretmen iletişimi',
            color: 'from-purple-400 to-pink-500',
            shadow: 'shadow-purple-500/20'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">

            {/* 🌟 Arka Plan Aydınlatmaları */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-5xl">

                {/* 🏛️ Üst Başlık */}
                <div className="text-center mb-16 animate-fade-in-down">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                        Kampüs Meydanı
                    </h2>
                    <p className="text-slate-400 text-lg">
                        EduConnect dünyasına katılmak için rolünüzü seçin
                    </p>
                </div>

                {/* 🃏 Rol Seçim Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            onClick={() => {
                                navigate('/login', {
                                    state: { roleId: role.id, roleTitle: role.title, roleIcon: role.icon }
                                });
                            }}
                            className={`bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:bg-slate-800/80 hover:shadow-2xl hover:${role.shadow} group relative overflow-hidden`}
                        >
                            {/* Kart İçi Işık Yansıması */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                            <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300 text-center drop-shadow-2xl">
                                {role.icon}
                            </div>

                            <h3 className="text-2xl font-bold text-white text-center mb-3">
                                {role.title}
                            </h3>
                            <p className="text-slate-400 text-sm text-center leading-relaxed">
                                {role.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ⚓ Geri Dönüş */}
                <div className="mt-16 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 hover:text-white text-sm font-medium transition-colors inline-flex items-center px-4 py-2 rounded-full hover:bg-slate-800/50"
                    >
                        <span className="mr-2">←</span> Liman'a Geri Dön
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CampusPortal;