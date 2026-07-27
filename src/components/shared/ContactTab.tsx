import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

interface Message {
    id: number;
    sender: string;
    subject: string;
    content: string;
    date: string;
    time: string;
    isRead: boolean;
    type: 'INBOX' | 'SENT';
}

interface Admin {
    id: number;
    firstName?: string;
    lastName?: string;
    schoolName?: string;
}

const ContactTab: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [recipients, setRecipients] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFolder, setActiveFolder] = useState<'INBOX' | 'SENT' | 'COMPOSE'>('INBOX');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    const [composeTo, setComposeTo] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeContent, setComposeContent] = useState('');

    // 🚀 DÜZELTME: localStorage anahtarı 'role' olarak güncellendi!
    const userRole = localStorage.getItem('role');
    const isSuperAdmin = userRole === 'ROLE_SUPER_ADMIN';

    const fetchMessages = async () => {
        try {
            const msgRes = await api.get('/messages');
            setMessages(msgRes.data);
        } catch (error) {
            console.error("Mesajlar çekilemedi:", error);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            await fetchMessages();

            if (isSuperAdmin) {
                try {
                    const adminRes = await api.get('/superadmin/admins');
                    setRecipients(adminRes.data);
                } catch (e) {
                    console.error("Alıcı listesi çekilemedi");
                }
            } else {
                setComposeTo('SUPER_ADMIN');
            }
            setLoading(false);
        };
        fetchInitialData();
    }, [isSuperAdmin]);

    const filteredMessages = messages.filter(msg => msg.type === activeFolder);

    const handleReadMessage = async (msg: Message) => {
        setSelectedMessage(msg);
        if (!msg.isRead && activeFolder === 'INBOX') {
            try {
                await api.put(`/messages/${msg.id}/read`);
                setMessages(messages.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
            } catch (err) {
                console.error("Okundu bilgisi iletilemedi.");
            }
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/messages', {
                receiverId: composeTo,
                subject: composeSubject,
                content: composeContent
            });

            showToast(isSuperAdmin ? 'Mesajınız iletildi!' : 'Destek talebiniz başarıyla iletildi!', 'success');

            setActiveFolder('SENT');
            setSelectedMessage(null);
            setComposeSubject('');
            setComposeContent('');
            if (!isSuperAdmin) setComposeTo('SUPER_ADMIN');

            await fetchMessages();

        } catch (error) {
            console.error(error);
            showToast('Mesaj gönderilirken bir hata oluştu!', 'error');
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-400 font-medium animate-pulse">📡 İletişim paneli senkronize ediliyor...</div>;

    return (
        <div className="animate-fade-in-down h-full bg-slate-50 p-6 md:p-8 rounded-tl-3xl flex flex-col">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">İletişim ve Destek</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {isSuperAdmin ? 'Kurum yöneticileriyle mesajlaşın, destek taleplerini çözün.' : 'Sistem yöneticileriyle mesajlaşın, teknik destek taleplerini iletin.'}
                    </p>
                </div>
                <button
                    onClick={() => { setActiveFolder('COMPOSE'); setSelectedMessage(null); }}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-md font-bold shadow-md transition-all flex items-center gap-2 text-sm tracking-widest"
                >
                    <span>✏️</span> YENİ MESAJ
                </button>
            </div>

            <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
                    <div className="flex border-b border-slate-200">
                        <button onClick={() => { setActiveFolder('INBOX'); setSelectedMessage(null); }} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeFolder === 'INBOX' ? 'border-blue-700 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                            Gelen Kutusu
                        </button>
                        <button onClick={() => { setActiveFolder('SENT'); setSelectedMessage(null); }} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeFolder === 'SENT' ? 'border-blue-700 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                            Gönderilenler
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredMessages.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 font-medium text-sm">Bu klasör şu an boş.</div>
                        ) : (
                            filteredMessages.map(msg => (
                                <div key={msg.id} onClick={() => handleReadMessage(msg)} className={`p-5 border-b border-slate-100 cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedMessage?.id === msg.id ? 'bg-blue-50/80 border-l-4 border-l-blue-700' : 'border-l-4 border-l-transparent'} ${!msg.isRead && msg.type === 'INBOX' ? 'bg-white' : 'bg-transparent'}`}>
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 className={`text-sm truncate pr-2 ${!msg.isRead && msg.type === 'INBOX' ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                            {msg.sender}
                                        </h4>
                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{msg.date}</span>
                                    </div>
                                    <p className={`text-xs truncate ${!msg.isRead && msg.type === 'INBOX' ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>
                                        {msg.subject}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="w-full md:w-2/3 flex flex-col bg-white">
                    {activeFolder === 'COMPOSE' ? (
                        <div className="p-8 flex flex-col h-full animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                {isSuperAdmin ? 'Yeni İleti Gönder' : "Sistem Yönetimi'ne Destek Talebi Gönder"}
                            </h3>
                            <form onSubmit={handleSendMessage} className="flex flex-col flex-1 gap-6">
                                {isSuperAdmin ? (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Kime (Kurum/Yönetici Seçin) *</label>
                                        <select required value={composeTo} onChange={e => setComposeTo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm font-semibold focus:bg-white focus:border-blue-700 outline-none text-slate-700 transition-all cursor-pointer">
                                            <option value="" disabled>Alıcı seçiniz...</option>
                                            <option value="ALL">Tüm Kurum Yöneticileri (Genel Duyuru)</option>
                                            {recipients.map(admin => (
                                                <option key={admin.id} value={admin.id.toString()}>
                                                    {admin.firstName} {admin.lastName} - {admin.schoolName || 'Boşta'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Kime</label>
                                        <input type="text" disabled value="Sistem Yönetimi (Super Admin)" className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-500 font-bold cursor-not-allowed" />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Konu *</label>
                                    <input required type="text" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm font-semibold focus:bg-white focus:border-blue-700 outline-none text-slate-900 transition-all" placeholder="Mesajınızın konusu..." />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Mesajınız *</label>
                                    <textarea required value={composeContent} onChange={e => setComposeContent(e.target.value)} className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm font-medium focus:bg-white focus:border-blue-700 outline-none text-slate-800 resize-none transition-all" placeholder="Mesajınızı detaylıca yazın..."></textarea>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-bold text-sm tracking-widest shadow-md transition-all">GÖNDER</button>
                                </div>
                            </form>
                        </div>
                    ) : selectedMessage ? (
                        <div className="p-8 flex flex-col h-full animate-fade-in">
                            <div className="border-b border-slate-100 pb-6 mb-6 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{selectedMessage.subject}</h3>
                                    <div className="flex items-center gap-3 mt-4">
                                        {/* 🚀 ÇÖKME KORUMASI: Optional Chaining Eklendi */}
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">
                                            {selectedMessage.sender?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-tight">{selectedMessage.sender}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">EduConnect Merkezi</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500">{selectedMessage.date}</p>
                                    <p className="text-xs font-medium text-slate-400 mt-1">{selectedMessage.time}</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.content}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                            <span className="text-6xl mb-4 opacity-50">📫</span>
                            <p className="font-bold text-base text-slate-500">Okumak için listeden bir mesaj seçin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactTab;