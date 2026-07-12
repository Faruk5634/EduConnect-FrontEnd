import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 🚀 DÜZELTME: roleId bilgisini de Kampüs Meydanından yakalıyoruz
    const { roleId = 'student', roleTitle = 'Öğrenci', roleIcon = '🎓' } = location.state || {};

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // ⚙️ Ortak Giriş Motoru
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', {
                username: username,
                password: password
            });

            const token = response.data.token;
            const role = response.data.role; // Backend'den gelen asıl ve kesin rütbe

            // 🚨 GÜVENLİK KİLİDİ 1: Yöneticiler Kampüs kapısından giremez!
            if (role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN' || role === 'ROLE_VICE_ADMIN') {
                setError("Bu portal sadece kampüs kullanıcıları içindir. Lütfen Yönetici Portalı'nı kullanın.");
                return; // Girişi iptal et, token'ı kaydetme!
            }

            // 🚨 GÜVENLİK KİLİDİ 2: Çapraz Kapı Sızıntısını Engelle! (Seçilen Rol == Gerçek Rol olmalı)
            let expectedRole = '';
            if (roleId === 'student') expectedRole = 'ROLE_STUDENT';
            else if (roleId === 'teacher') expectedRole = 'ROLE_TEACHER';
            else if (roleId === 'parent') expectedRole = 'ROLE_PARENT';

            if (role !== expectedRole) {
                setError(`Hatalı Giriş! Bu ekrandan sadece ${roleTitle} yetkisine sahip kişiler giriş yapabilir.`);
                return; // Girişi iptal et, token'ı kaydetme!
            }

            // 🟢 Tüm kilitler başarıyla aşıldıysa biletleri ambara kaldır
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);

            console.log(`Kaptan, ${role} olarak giriş başarılı!`);

            // 🚦 Rütbeye Göre İlgili Panele Işınlama
            if (role === 'ROLE_TEACHER') {
                navigate('/teacher');
            } else if (role === 'ROLE_PARENT') {
                navigate('/parent');
            } else if (role === 'ROLE_STUDENT') {
                navigate('/student');
            } else {
                // Beklenmeyen bir durum olursa Liman'a geri at
                navigate('/');
            }

        } catch (err: any) {
            console.error("Giriş sızıntısı:", err);
            setError('Giriş başarısız! Bilgilerini kontrol et Kaptan.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">

            {/* 🌟 Arka plan aydınlatmaları */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* 🛡️ Form Kartı */}
            <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl z-10 animate-fade-in-down">

                {/* Dinamik Başlık */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 transform hover:scale-110 transition-transform cursor-default">
                        {roleIcon}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{roleTitle} Girişi</h2>
                    <p className="text-slate-400 text-sm">EduConnect sistemine hoş geldiniz</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-sm text-center font-medium animate-pulse">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            placeholder="kullanici_adiniz"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/30 transform hover:-translate-y-1 mt-4"
                    >
                        Giriş Yap
                    </button>
                </form>

                <div className="mt-6 text-center border-t border-slate-700/50 pt-6">
                    <button
                        onClick={() => navigate('/campus')}
                        className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center justify-center w-full"
                    >
                        <span className="mr-2">←</span> Meydana Geri Dön
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;