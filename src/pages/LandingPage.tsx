import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex flex-col items-center justify-center p-6 font-sans">

            {/* 🌟 Üst Başlık Kısmı */}
            <div className="text-center mb-16 animate-fade-in-down">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                    EduConnect'e Hoş Geldiniz
                </h1>
                <p className="text-xl text-blue-200 font-light tracking-wide">
                    Lütfen giriş yapmak istediğiniz portalı seçin
                </p>
            </div>

            {/* 🚪 Portallar (Kartlar) */}
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">

                {/* 🏛️ 1. Kapı: Yönetim Portalı */}
                <div
                    onClick={() => navigate('/admin-login')}
                    className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl shadow-2xl hover:bg-white/20 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] transition-all duration-300 cursor-pointer flex flex-col items-center text-center group"
                >
                    <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        🏛️
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">Yönetim Portalı</h2>
                    <p className="text-blue-100/80 text-lg">
                        Super Admin ve Okul Müdürleri içindir.
                    </p>
                </div>

                {/* 🎓 2. Kapı: Kampüs Portalı */}
                <div
                    onClick={() => navigate('/campus')}
                    className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl shadow-2xl hover:bg-emerald-500/20 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(16,_185,_129,_0.5)] border-b-4 border-b-emerald-500/50 transition-all duration-300 cursor-pointer flex flex-col items-center text-center group"
                >
                    <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        🎓
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">Kampüs Portalı</h2>
                    <p className="text-blue-100/80 text-lg">
                        Öğretmen, Öğrenci ve Veliler içindir.
                    </p>
                </div>

            </div>

            {/* ⚓ Alt Bilgi */}
            <div className="absolute bottom-8 text-white/40 text-sm">
                © 2026 EduConnect Merkez Kampüsü. Tüm Hakları Saklıdır.
            </div>
        </div>
    );
};

export default LandingPage;