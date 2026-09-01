import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', {
                username: username,
                password: password
            }, { headers: { 'X-Skip-Auth-Redirect': '1' } });

            const token = response.data.token;
            const role = response.data.role;
            const resUsername = response.data.username; // 🚀 BACKEND UYUMU: Kullanıcı adını da aldık

            if (role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN' || role === 'ROLE_VICE_ADMIN') {

                // 🚀 DÜZELTME: api.ts ile %100 uyumlu anahtarlar
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('username', resUsername);

                console.log(`Login successful for role ${role}`);
                navigate('/admin');

            } else {
                setError("Bu portal sadece yöneticiler içindir. Lütfen Kampüs Portalı'nı kullanın.");
            }

        } catch (err) { // 🚀 'any' kirliliği temizlendi
            console.error("Giriş hatası:", err);
            setError("Giriş başarısız! Kullanıcı adı veya şifre hatalı.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-10 rounded-3xl shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 drop-shadow-lg">🏛️</div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Yönetim Portalı</h2>
                    <p className="text-blue-200/80 mt-2 text-sm font-medium tracking-wide uppercase">Güvenli Giriş Noktası</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="Sistem Kullanıcı Adı"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 transform hover:-translate-y-1 mt-4"
                    >
                        Giriş Yap
                    </button>
                </form>

                <div className="mt-6 text-center border-t border-slate-700/50 pt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center justify-center w-full"
                    >
                        <span className="mr-2">←</span> Liman'a Geri Dön
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;