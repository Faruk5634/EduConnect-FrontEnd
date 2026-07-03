import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 📌 Mesaj Veri Modeli
interface Message {
    id: number;
    sender: string;
    role: string;
    subject: string;
    content: string;
    date: string;
    time: string;
    isRead: boolean;
    type: 'INBOX' | 'SENT';
}

// 📌 Alıcı (Yönetici) Modeli - BACKEND'E TAM UYUMLU
interface Admin {
    id: number;
    name?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    schoolName?: string;
    role?: string;
    roleName?: string; // Spring Boot farklı isimlendirmiş olabilir diye eklendi
    roleType?: string; // Spring Boot farklı isimlendirmiş olabilir diye eklendi
}

const ContactTab: React.FC = () => {
    // 📡 Gerçek Mesaj ve Alıcı Veritabanı State'leri
    const [messages, setMessages] = useState<Message[]>([]);
    const [recipients, setRecipients] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);

    // 🎛️ Arayüz Durumları
    const [activeFolder, setActiveFolder] = useState<'INBOX' | 'SENT' | 'COMPOSE'>('INBOX');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    // 📝 Yeni Mesaj Formu
    const [composeTo, setComposeTo] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeContent, setComposeContent] = useState('');

    // 📡 Verileri Backend'den Çekme Motoru
    useEffect(() => {
        const fetchMessagesAndRecipients = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // 1. Gelen ve Gönderilen Mesajları Çek
                try {
                    const msgRes = await axios.get('http://localhost:8080/api/messages', { headers });
                    setMessages(msgRes.data);
                } catch (err) {
                    setMessages([]); // Sahte veriler yerine boş liste
                }

                // 2. Alıcı Listesi İçin Yöneticileri Çek
                try {
                    const adminRes = await axios.get('http://localhost:8080/api/superadmin/admins', { headers });
                    setRecipients(adminRes.data);
                } catch (err) {
                    setRecipients([]);
                }

            } catch (error) {
                console.error("İletişim verileri çekilirken hata oluştu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessagesAndRecipients();
    }, []);

    // 📩 Mesaj Filtreleme Motoru
    const filteredMessages = messages.filter(msg => msg.type === activeFolder);

    // ✉️ Mesaj Okuma ve "Okundu" İşaretleme
    const handleReadMessage = async (msg: Message) => {
        setSelectedMessage(msg);

        if (!msg.isRead && activeFolder === 'INBOX') {
            try {
                // const token = localStorage.getItem('token');
                // await axios.put(`http://localhost:8080/api/messages/${msg.id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
                setMessages(messages.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
            } catch (err) {
                console.error("Okundu bilgisi iletilemedi.");
            }
        }
    };

    // 🚀 Gerçek Mesaj Gönderme Motoru
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const payload = {
                receiverId: composeTo,
                subject: composeSubject,
                content: composeContent
            };

            await axios.post('http://localhost:8080/api/messages', payload, { headers });

            alert('Mesajınız başarıyla iletildi Kaptan!');
            setActiveFolder('SENT');
            setSelectedMessage(null);
            setComposeTo('');
            setComposeSubject('');
            setComposeContent('');

        } catch (err) {
            alert('Mesaj gönderilirken bir hata oluştu. Backend API bağlantısını kontrol edin.');
        }
    };

    // 🧠 Akıllı İsim Bulucu
    const getAdminDisplayName = (admin: Admin) => {
        if (admin.name) return admin.name;
        if (admin.firstName) return `${admin.firstName} ${admin.lastName || ''}`.trim();
        if (admin.username) return admin.username;
        return 'İsimsiz Yönetici';
    };

    // 🧠 Akıllı Rol Çevirici (Spring Boot formatı ne olursa olsun yakalar)
    const getRoleDisplayName = (admin: Admin) => {
        const roleStr = String(admin.role || admin.roleName || admin.roleType || '').toUpperCase();

        if (roleStr.includes('VICE') || roleStr.includes('YARDIMCI')) return 'Müdür Yrd.';
        if (roleStr.includes('ADMIN') || roleStr.includes('PRINCIPAL') || roleStr.includes('MUDUR')) return 'Okul Müdürü';

        return 'Yönetici';
    };

    if (loading) return <div className="text-center py-20 text-slate-400 font-medium animate-pulse">📡 İletişim paneli yükleniyor...</div>;

    return (
        <div className="animate-fade-in-down h-full bg-slate-50 p-6 md:p-8 rounded-tl-3xl flex flex-col">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">İletişim ve Destek</h2>
                    <p className="text-slate-500 text-sm mt-1">Kurum yöneticileriyle mesajlaşın, destek taleplerini çözün.</p>
                </div>
                <button
                    onClick={() => { setActiveFolder('COMPOSE'); setSelectedMessage(null); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
                >
                    <span>✏️</span> YENİ MESAJ
                </button>
            </div>

            <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[600px]">

                {/* 📂 SOL PANEL: KLASÖRLER VE MESAJ LİSTESİ */}
                <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
                    <div className="flex border-b border-slate-200">
                        <button onClick={() => { setActiveFolder('INBOX'); setSelectedMessage(null); }} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeFolder === 'INBOX' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                            Gelen Kutusu
                        </button>
                        <button onClick={() => { setActiveFolder('SENT'); setSelectedMessage(null); }} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeFolder === 'SENT' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                            Gönderilenler
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredMessages.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 font-medium text-sm">Bu klasör boş.</div>
                        ) : (
                            filteredMessages.map(msg => (
                                <div key={msg.id} onClick={() => handleReadMessage(msg)} className={`p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedMessage?.id === msg.id ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'} ${!msg.isRead && msg.type === 'INBOX' ? 'bg-white' : 'bg-slate-50/30'}`}>
                                    <div className="flex justify-between items-start mb-1">
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

                {/* 📖 SAĞ PANEL: MESAJ İÇERİĞİ VEYA YAZMA ALANI */}
                <div className="w-full md:w-2/3 flex flex-col bg-white">
                    {activeFolder === 'COMPOSE' ? (
                        <div className="p-6 flex flex-col h-full animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
                                <span>✉️</span> Yeni Mesaj Gönder
                            </h3>
                            <form onSubmit={handleSendMessage} className="flex flex-col flex-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kime (Kurum/Yönetici Seçin)</label>
                                    <select required value={composeTo} onChange={e => setComposeTo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-blue-500 outline-none text-slate-700">
                                        <option value="" disabled>Alıcı seçiniz...</option>
                                        <option value="ALL">Tüm Kurum Yöneticileri (Genel Duyuru)</option>
                                        {/* AKILLI ROL İSİMLENDİRME EKLENDİ */}
                                        {recipients.map(admin => (
                                            <option key={admin.id} value={admin.id.toString()}>
                                                {getAdminDisplayName(admin)} - {getRoleDisplayName(admin)} {admin.schoolName ? `(${admin.schoolName})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Konu</label>
                                    <input required type="text" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-blue-500 outline-none text-slate-900" placeholder="Mesajınızın konusu..." />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Mesajınız</label>
                                    <textarea required value={composeContent} onChange={e => setComposeContent(e.target.value)} className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm font-medium focus:bg-white focus:border-blue-500 outline-none text-slate-700 resize-none" placeholder="Mesajınızı buraya yazın..."></textarea>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button type="submit" className="bg-[#0f172a] hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all">Gönder</button>
                                </div>
                            </form>
                        </div>
                    ) : selectedMessage ? (
                        <div className="p-6 flex flex-col h-full animate-fade-in">
                            <div className="border-b border-slate-100 pb-5 mb-5 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedMessage.subject}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                                            {selectedMessage.sender.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-tight">{selectedMessage.sender}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{selectedMessage.role}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400">{selectedMessage.date}</p>
                                    <p className="text-xs font-medium text-slate-400">{selectedMessage.time}</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.content}
                                </p>
                            </div>
                            {activeFolder === 'INBOX' && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => { setActiveFolder('COMPOSE'); setComposeTo(selectedMessage.sender); setComposeSubject(`Re: ${selectedMessage.subject}`); }}
                                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                                    >
                                        <span>↩️</span> Yanıtla
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <span className="text-6xl mb-4">📫</span>
                            <p className="font-bold text-lg text-slate-500">Okumak için bir mesaj seçin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactTab;