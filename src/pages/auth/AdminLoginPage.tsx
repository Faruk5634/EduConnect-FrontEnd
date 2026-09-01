import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Shield, Lock, ArrowLeft, Loader2, KeyRound } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', {
                username: username,
                password: password
            }, { headers: { 'X-Skip-Auth-Redirect': '1' } });

            const token = response.data.token;
            const role = response.data.role;
            const resUsername = response.data.username;

            if (role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN' || role === 'ROLE_VICE_ADMIN') {
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('username', resUsername);

                navigate('/admin');
            } else {
                setError("Bu portal sadece yöneticiler içindir. Lütfen Kampüs Portalı'nı kullanın.");
                setIsLoading(false);
            }

        } catch (err) {
            setError("Giriş başarısız! Kullanıcı adı veya şifre hatalı.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Animated Dark Gradient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
            
            {/* Ambient Glows */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative z-10 animate-scale-in">
                
                <div className="text-center mb-10">
                    <div className="mx-auto w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-slate-700/50 shadow-inner">
                        <Shield className="w-8 h-8 text-sky-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Yönetici Girişi</h2>
                    <p className="text-slate-400 text-sm font-medium">Sistem Yönetim Portalı</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="bg-red-950/50 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium text-center flex items-center justify-center gap-2 animate-fade-in">
                            <Lock className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <KeyRound className="w-5 h-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all"
                                placeholder="Sistem Kullanıcı Adı"
                                required
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="w-5 h-5 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-sky-900/50 flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Kimlik Doğrulanıyor...</>
                        ) : (
                            'Sisteme Giriş Yap'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-800 pt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors flex items-center justify-center w-full gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Ana Ekrana Dön
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;