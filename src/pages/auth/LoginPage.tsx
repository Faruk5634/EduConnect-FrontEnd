import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { GraduationCap, UserCircle2, Users, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { roleId = 'student', roleTitle = 'Öğrenci' } = location.state || {};

    const getRoleIcon = () => {
        if (roleId === 'student') return <GraduationCap className="w-12 h-12 text-sky-500" />;
        if (roleId === 'teacher') return <UserCircle2 className="w-12 h-12 text-indigo-500" />;
        return <Users className="w-12 h-12 text-purple-500" />;
    };

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
                setError("Bu portal sadece kampüs kullanıcıları içindir. Lütfen Yönetici Portalı'nı kullanın.");
                setIsLoading(false);
                return;
            }

            let expectedRole = '';
            if (roleId === 'student') expectedRole = 'ROLE_STUDENT';
            else if (roleId === 'teacher') expectedRole = 'ROLE_TEACHER';
            else if (roleId === 'parent') expectedRole = 'ROLE_PARENT';

            if (role !== expectedRole) {
                setError(`Hatalı Giriş! Bu ekrandan sadece ${roleTitle} yetkisine sahip kişiler giriş yapabilir.`);
                setIsLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('username', resUsername);

            if (role === 'ROLE_TEACHER') {
                navigate('/teacher');
            } else if (role === 'ROLE_PARENT') {
                navigate('/parent');
            } else if (role === 'ROLE_STUDENT') {
                navigate('/student');
            } else {
                navigate('/');
            }

        } catch (err) {
            setError('Giriş başarısız! Lütfen kullanıcı adı ve şifrenizi kontrol ediniz.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-sky-200/50 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/50 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

            <div className="w-full max-w-5xl flex flex-col md:flex-row glass-panel/80 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-white overflow-hidden z-10 animate-slide-up">
                {/* Left Side: Branding/Graphic */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-sky-500 to-indigo-600 p-12 flex-col justify-between relative overflow-hidden text-white">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 glass-panel/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/30">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4 leading-tight">Geleceğin Eğitimi <br/>EduConnect ile Başlıyor.</h1>
                        <p className="text-white/80 text-lg">Öğrenci, öğretmen ve veli deneyimini kusursuzlaştıran yeni nesil eğitim platformu.</p>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-[-10px]">
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-sky-200"></div>
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-200"></div>
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-purple-200"></div>
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-600 glass-panel flex items-center justify-center text-xs font-bold text-indigo-600">+2k</div>
                        </div>
                        <p className="mt-3 text-sm text-white/80 font-medium">Binlerce kullanıcıya katılın</p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center glass-panel relative">
                    <div className="mb-10 text-center md:text-left">
                        <div className="inline-flex items-center justify-center p-3 bg-sky-50 rounded-2xl mb-4 text-sky-600 md:hidden">
                            {getRoleIcon()}
                        </div>
                        <div className="hidden md:inline-flex items-center justify-center p-4 bg-transparent rounded-2xl mb-6 shadow-lg border border-slate-100">
                            {getRoleIcon()}
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{roleTitle} Girişi</h2>
                        <p className="text-slate-500 font-medium">Hesabınıza giriş yaparak devam edin</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in flex items-start">
                                <span className="mr-2"><AlertTriangle className="w-4 h-4 inline-block mr-2" /></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-700 text-sm font-semibold mb-2">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field"
                                    placeholder="Kullanıcı adınızı girin"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 text-sm font-semibold mb-2">Şifre</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3.5 text-base shadow-sky-500/25 mt-2"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Giriş Yapılıyor...</>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-100">
                        <button
                            onClick={() => navigate('/campus')}
                            className="inline-flex items-center justify-center text-slate-500 hover:text-sky-600 font-medium transition-colors gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Meydana Geri Dön
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;