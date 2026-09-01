import { MessageSquare, UserCircle, LogOut, ArrowLeft, GraduationCap, Users } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';
import { useMessages } from '../../hooks/useMessages';
import SharedProfileModule from '../../components/shared/SharedProfileModule';
import SharedMessagingModule from '../../components/shared/SharedMessagingModule';

interface ParentProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    username: string;
    studentNames: string[];
}

export default function ParentPanel() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [viewMode, setViewMode] = useState<'selection' | 'studentsList' | 'parentProfile' | 'messages'>('selection');
    const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
    const { messages, loading: messagesLoading, fetchAll: fetchMessages, send: sendMessage, markRead } = useMessages();

    const isNotHome = viewMode !== 'selection';
    const isNotHomeRef = useRef(isNotHome);

    useEffect(() => {
        window.history.replaceState({ page: 'base' }, "", window.location.href);
        window.history.pushState({ page: 'trap' }, "", window.location.href);

        const handlePopState = () => {
            if (isNotHomeRef.current) {
                setViewMode('selection');
            } else {
                setShowLogoutModal(true);
                window.history.pushState({ page: 'trap' }, "", window.location.href);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        if (isNotHome && !isNotHomeRef.current) {
            window.history.pushState({ page: 'subpage' }, "", window.location.href);
        }
        isNotHomeRef.current = isNotHome;
    }, [isNotHome]);

    useEffect(() => {
        fetchParentProfile();
        fetchMessages();
    }, []);

    const fetchParentProfile = async () => {
        try {
            const res = await api.get('/parents/me');
            setParentProfile(res.data);
        } catch (error) {
            console.error("Veli profili çekilemedi:", error);
            showToast("Profil bilgileri yüklenirken hata oluştu.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStudentClick = (schoolNumber: string) => {
        navigate('/student', {
            state: {
                isParentViewing: true,
                studentSchoolNumber: schoolNumber
            }
        });
    };

    const handleParentProfileUpdate = async (mode: string, formData: any) => {
        try {
            if (mode === 'editPassword') {
                if (!formData.currentPassword || !formData.newPassword) return showToast('Lütfen şifreleri girin.', 'error');
                await api.put('/users/me', { password: formData.newPassword, currentPassword: formData.currentPassword });
            } else {
                await api.put('/users/me', { 
                    firstName: formData.firstName, 
                    lastName: formData.lastName, 
                    email: formData.email, 
                    phone: formData.phone 
                });
            }
            showToast('Veli profiliniz başarıyla güncellendi.', 'success');
            await fetchParentProfile();
        } catch (error) { 
            showToast('Profil güncellenemedi.', 'error'); 
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/', { replace: true });
    };

    if (loading || messagesLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-purple-500 font-bold animate-pulse text-xl">Veli Paneli Yükleniyor...</div>;

    const unreadCount = messages.filter(m => m.type === 'INBOX' && !m.isRead).length;

    return (
        <div className="font-sans min-h-screen bg-slate-950 flex flex-col overflow-hidden relative selection:bg-purple-500/30 animate-fade-in">

            <div className="absolute top-0 left-0 w-full p-6 md:px-12 flex justify-between items-center z-50 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => setViewMode('selection')}>
                    <div className="w-12 h-12 bg-purple-700 rounded-xl flex items-center justify-center text-white font-bold tracking-tight text-slate-800 text-xl shadow-[0_0_20px_rgba(126,34,206,0.4)]">EC</div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 text-white tracking-widest drop-shadow-lg">EDUCONNECT <span className="text-purple-400">VELİ</span></h1>
                </div>
                <button onClick={() => setShowLogoutModal(true)} className="pointer-events-auto text-slate-300 hover:text-white flex items-center gap-2 bg-slate-900/80 px-6 py-2.5 rounded-full border border-slate-700/50 backdrop-blur-md hover:border-red-500/50 hover:bg-red-500/10 transition-all font-bold tracking-wider text-sm shadow-xl">
                    <LogOut className="w-8 h-8 text-red-500" /> Çıkış Yap
                </button>
            </div>

            {viewMode === 'selection' && (
                <div className="flex-1 flex flex-col md:flex-row h-screen">
                    <div
                        onClick={() => setViewMode('studentsList')}
                        className="flex-1 bg-slate-900/40 hover:bg-slate-900 flex items-center justify-center cursor-pointer group border-b md:border-b-0 md:border-r border-slate-800/50 transition-colors"
                    >
                        <div className="text-center transform group-hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 mx-auto bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-6xl mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_50px_rgba(59,130,246,0.4)] group-hover:bg-blue-500/20 transition-all border border-blue-500/20">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight text-slate-800 text-white tracking-tight">Öğrencilerim</h2>
                            <p className="text-slate-400 mt-3 font-medium">Öğrenci panellerine geçiş yapın</p>
                        </div>
                    </div>

                    <div
                        onClick={() => setViewMode('messages')}
                        className="flex-1 bg-slate-900/60 hover:bg-slate-900 flex items-center justify-center cursor-pointer group border-b md:border-b-0 md:border-r border-slate-800/50 transition-colors relative"
                    >
                        {unreadCount > 0 && (
                            <span className="absolute top-1/4 right-1/4 bg-red-500 text-white text-xl font-bold tracking-tight text-slate-800 w-12 h-12 flex items-center justify-center rounded-full animate-bounce shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                                {unreadCount}
                            </span>
                        )}
                        <div className="text-center transform group-hover:scale-105 transition-transform duration-300">
                            <div className="w-32 h-32 mx-auto bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-6xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] group-hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight text-slate-800 text-white tracking-tight">Mesajlarım</h2>
                            <p className="text-slate-400 mt-3 font-medium">Okul yönetimi ve öğretmenlerle görüşün</p>
                        </div>
                    </div>

                    <div
                        onClick={() => setViewMode('parentProfile')}
                        className="flex-1 bg-slate-950 hover:bg-slate-900 flex items-center justify-center cursor-pointer group transition-colors relative overflow-hidden"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-purple-800/30 transition-colors"></div>
                        <div className="text-center transform group-hover:scale-105 transition-transform duration-300 relative z-10">
                            <div className="w-32 h-32 mx-auto bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center text-6xl mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] group-hover:bg-purple-500/20 transition-all border border-purple-500/20">
                                <UserCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight text-slate-800 text-white tracking-tight">Profilim</h2>
                            <p className="text-slate-400 mt-3 font-medium">Kendi bilgilerinizi yönetin</p>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'studentsList' && (
                <div className="flex-1 overflow-y-auto pt-32 px-6 pb-20 relative z-10 bg-slate-900/30">
                    <div className="max-w-4xl mx-auto animate-fade-in-right">
                        <button onClick={() => setViewMode('selection')} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 border border-slate-800 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wider">
                            <ArrowLeft className="w-5 h-5" /> Ana Ekrana Dön
                        </button>

                        <h2 className="text-4xl font-bold tracking-tight text-slate-800 text-white mb-2 tracking-tight">Öğrencilerim</h2>
                        <p className="text-slate-400 font-medium mb-10">Okul sistemine gitmek için öğrencinizin kartına tıklayın.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {parentProfile?.studentNames && parentProfile.studentNames.length > 0 ? (
                                parentProfile.studentNames.map((studentStr, index) => {
                                    const [fullName, stuNo] = studentStr.includes('|') ? studentStr.split('|') : [studentStr, 'Belirtilmemiş'];
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleStudentClick(stuNo)}
                                            className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-800 shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
                                        >
                                            <div className="flex items-center gap-5 mb-8">
                                                <div className="w-16 h-16 bg-slate-800 text-blue-400 rounded-full flex items-center justify-center text-2xl font-bold tracking-tight text-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-slate-700 group-hover:border-transparent">
                                                    <GraduationCap className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-200 group-hover:text-white transition-colors">{fullName}</h3>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">OKUL NO: {stuNo}</p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950 rounded-xl p-4 flex items-center justify-between border border-slate-800 group-hover:border-blue-500/30 transition-colors">
                                                <span className="text-sm font-bold text-slate-400 group-hover:text-blue-400 transition-colors">Öğrenci Paneline Git</span>
                                                <span className="text-blue-500 font-bold tracking-tight text-slate-800 group-hover:translate-x-2 transition-transform">➔</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
                                    <div className="flex justify-center mb-6">
                                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
                                            <Users className="w-10 h-10 text-slate-500" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-300">Öğrenci Bulunamadı</h4>
                                    <p className="text-slate-500 mt-2">Sisteme kayıtlı bir öğrenciniz bulunmuyor.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'parentProfile' && (
                <div className="flex-1 overflow-y-auto pt-32 px-6 pb-20 relative z-10 bg-slate-950">
                    <div className="max-w-3xl mx-auto">
                        <SharedProfileModule
                            headerInfo={{
                                initials: parentProfile?.firstName ? `${parentProfile.firstName.charAt(0)}${parentProfile.lastName.charAt(0)}`.toUpperCase() : 'VP',
                                firstName: parentProfile?.firstName || '',
                                lastName: parentProfile?.lastName || '',
                                badgeText: 'Sistem Kullanıcısı'
                            }}
                            contactInfo={[
                                { label: 'Kullanıcı Adı', value: `@${parentProfile?.username}` },
                                { label: 'Telefon', value: parentProfile?.phoneNumber || '-' },
                                { label: 'E-Posta', value: parentProfile?.email || '-' }
                            ]}
                            initialFormState={{
                                firstName: parentProfile?.firstName || '',
                                lastName: parentProfile?.lastName || '',
                                email: parentProfile?.email || '',
                                phone: parentProfile?.phoneNumber || ''
                            }}
                            onUpdateProfile={handleParentProfileUpdate}
                        />
                    </div>
                </div>
            )}

            {viewMode === 'messages' && (
                <div className="flex-1 overflow-y-auto pt-32 px-6 pb-20 relative z-10 bg-slate-950">
                    <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-150px)] animate-fade-in glass-panel rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-slate-100 p-4 border-b border-white/40 flex items-center">
                            <button onClick={() => setViewMode('selection')} className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-bold transition-colors">
                                <ArrowLeft className="w-5 h-5" /> Ana Ekrana Dön
                            </button>
                        </div>
                        <SharedMessagingModule
                            messages={messages}
                            userRoleLabel="Veli"
                            onSendMessage={async (receiverId, subject, content) => {
                                await sendMessage({ receiverId, subject, content });
                                await fetchMessages();
                            }}
                            onReadMessage={async (msg) => {
                                if (msg.type === 'INBOX' && !msg.isRead) {
                                    await markRead(msg.id);
                                    await fetchMessages();
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-10 border border-slate-700 relative text-center animate-scale-in">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner"><LogOut className="w-8 h-8 text-red-500" /></div>
                        <h3 className="text-3xl font-bold tracking-tight text-slate-800 text-white tracking-tight">Sistemden Çıkış</h3>
                        <p className="text-slate-400 font-medium mt-3 mb-10">Oturumunuzu sonlandırmak istediğinize emin misiniz?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold uppercase tracking-wider transition-colors border border-slate-700">İptal</button>
                            <button onClick={handleLogout} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-colors">Çıkış Yap</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}