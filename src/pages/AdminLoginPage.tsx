import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🚀 Axios kuryemizi gemiye aldık!

const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // 🚨 Hata mesajları için yeni kanca

    // ⚙️ Gerçek Backend Bağlantı Motoru
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Yeni denemede eski hatayı temizle

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username: username,
                password: password
            });

            const token = response.data.token;
            // Backend'in gönderdiği rolü al (veya şimdilik test için varsayılan ata)
            const role = response.data.role || 'ROLE_ADMIN';

            // Hem bileti hem de rütbeyi (Güvenlik Görevlisinin okuyacağı isimle) kaydet!
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);

            console.log("Kaptan, giriş başarılı! Bilet ve Rütbe alındı.");

            navigate('/admin');

        } catch (err: any) {
            console.error("Giriş sızıntısı:", err);
            // Backend'den gelen hata mesajını yakalıyoruz
            setError('Giriş başarısız! Kullanıcı adı veya şifre hatalı olabilir Kaptan.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">

            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-slate-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl z-10 animate-fade-in-down">

                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🏛️</div>
                    <h2 className="text-3xl font-bold text-white mb-2">Yönetim Girişi</h2>
                    <p className="text-slate-400 text-sm">EduConnect yetkili paneline erişim</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* 🚨 Eğer hata varsa burada kırmızı bir uyarı göstereceğiz */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="manager_ali"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Şifre</label>
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