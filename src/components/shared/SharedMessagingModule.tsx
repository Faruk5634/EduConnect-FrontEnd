import { Edit3, Send, Mail, Shield } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useUserSearch } from '../../hooks/useUserSearch';
import type { Message } from '../../types/panelTypes';

interface SearchUser {
    userId: number;
    fullName: string;
    role: string;
}

interface SharedMessagingModuleProps {
    messages: Message[];
    onSendMessage: (receiverId: string, subject: string, content: string) => Promise<void>;
    onReadMessage: (msg: Message) => Promise<void>;
    userRoleLabel: string;
    /** 'sky' (öğrenci), 'emerald' (öğretmen), 'amber' (veli) */
    theme?: 'sky' | 'emerald' | 'amber';
}

export default function SharedMessagingModule({ messages, onSendMessage, onReadMessage, userRoleLabel, theme = 'emerald' }: SharedMessagingModuleProps) {
    const getThemeConfig = () => {
        if (theme === 'sky') return {
            btn: 'bg-sky-600 hover:bg-sky-700', ring: 'focus:ring-sky-500 focus:border-sky-500',
            tabActive: 'border-sky-500 text-sky-700 bg-sky-50/50', tabInactive: 'border-transparent text-slate-500 hover:text-slate-700',
            hoverBg: 'hover:bg-sky-50', avatarBg: 'bg-sky-50 border-sky-100 text-sky-600',
            msgSel: 'border-l-sky-500 bg-sky-50/30', msgUnread: 'border-l-sky-500 bg-transparent',
            accentText: 'text-sky-600', accentTextHover: 'hover:text-sky-700 group-hover:text-sky-700',
            badge: 'bg-sky-100 text-sky-700 border-sky-200'
        };
        if (theme === 'amber') return {
            btn: 'bg-amber-600 hover:bg-amber-700', ring: 'focus:ring-amber-500 focus:border-amber-500',
            tabActive: 'border-amber-500 text-amber-700 bg-amber-50/50', tabInactive: 'border-transparent text-slate-500 hover:text-slate-700',
            hoverBg: 'hover:bg-amber-50', avatarBg: 'bg-amber-50 border-amber-100 text-amber-600',
            msgSel: 'border-l-amber-500 bg-amber-50/30', msgUnread: 'border-l-amber-500 bg-transparent',
            accentText: 'text-amber-600', accentTextHover: 'hover:text-amber-700 group-hover:text-amber-700',
            badge: 'bg-amber-100 text-amber-700 border-amber-200'
        };
        return {
            btn: 'bg-emerald-600 hover:bg-emerald-700', ring: 'focus:ring-emerald-500 focus:border-emerald-500',
            tabActive: 'border-emerald-500 text-emerald-700 bg-emerald-50/50', tabInactive: 'border-transparent text-slate-500 hover:text-slate-700',
            hoverBg: 'hover:bg-emerald-50', avatarBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
            msgSel: 'border-l-emerald-500 bg-emerald-50/30', msgUnread: 'border-l-emerald-500 bg-transparent',
            accentText: 'text-emerald-600', accentTextHover: 'hover:text-emerald-700 group-hover:text-emerald-700',
            badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
    };
    const c = getThemeConfig();

    const [mailBoxView, setMailBoxView] = useState<'INBOX' | 'SENT'>('INBOX');
    const [rightPaneMode, setRightPaneMode] = useState<'EMPTY' | 'READ' | 'COMPOSE'>('EMPTY');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    const [msgReceiverId, setMsgReceiverId] = useState('');
    const [msgSubject, setMsgSubject] = useState('');
    const [msgContent, setMsgContent] = useState('');

    const [userSearchQuery, setUserSearchQuery] = useState('');
    const { results: searchResults, visible: searchVisible } = useUserSearch(userSearchQuery);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [selectedReceiverName, setSelectedReceiverName] = useState('');

    useEffect(() => {
        setShowSearchDropdown(searchVisible);
    }, [searchVisible]);

    const displayedMessages = messages.filter(m => m.type === mailBoxView);

    const handleReadMessage = async (msg: Message) => {
        setSelectedMessage(msg);
        setRightPaneMode('READ');
        if (msg.type === 'INBOX' && !msg.isRead) {
            await onReadMessage(msg);
        }
    };

    const handleSelectUser = (user: SearchUser) => {
        setMsgReceiverId(user.userId.toString());
        setSelectedReceiverName(`${user.fullName} (${user.role})`);
        setShowSearchDropdown(false);
        setUserSearchQuery('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSendMessage(msgReceiverId, msgSubject, msgContent);
        
        // Reset form on success
        setMsgReceiverId('');
        setSelectedReceiverName('');
        setMsgSubject('');
        setMsgContent('');
        setRightPaneMode('EMPTY');
        setMailBoxView('SENT');
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col h-full animate-fade-in">
            <div className="mb-4 flex items-center justify-between px-2">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-800">İletişim ve Mesajlar</h2>
                    <p className="text-sm text-slate-500 font-medium">{userRoleLabel}</p>
                </div>
                <button onClick={() => setRightPaneMode('COMPOSE')} className={`${c.btn} text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg flex items-center gap-2`}>
                    <span>✎</span> YENİ MESAJ
                </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden pb-2">
                <div className="w-1/3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    <div className="flex border-b border-slate-100 bg-white">
                        <button onClick={() => {setMailBoxView('INBOX'); setRightPaneMode('EMPTY');}} className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${mailBoxView === 'INBOX' ? c.tabActive : c.tabInactive}`}>Gelen Kutusu</button>
                        <button onClick={() => {setMailBoxView('SENT'); setRightPaneMode('EMPTY');}} className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${mailBoxView === 'SENT' ? c.tabActive : c.tabInactive}`}>Gönderilenler</button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {displayedMessages.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">
                                <p className="font-bold text-sm">Bu klasör şu an boş.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {displayedMessages.map(msg => (
                                    <div key={msg.id} onClick={() => handleReadMessage(msg)} className={`p-4 cursor-pointer transition-colors flex flex-col gap-1 border-l-4 ${selectedMessage?.id === msg.id ? c.msgSel : !msg.isRead && msg.type === 'INBOX' ? c.msgUnread : 'border-l-transparent hover:bg-slate-50'}`}>
                                        <div className="flex justify-between items-baseline">
                                            <p className={`text-sm truncate flex items-center ${!msg.isRead && msg.type === 'INBOX' ? 'font-bold tracking-tight text-slate-900' : 'font-bold text-slate-700'}`}>
                                                {msg.type === 'INBOX' ? msg.sender : `Alıcı: ${msg.sender}`}
                                                {msg.isSentByParent && <span className="ml-1 text-purple-600 text-[10px]" title="Veli Mührü"><Shield className="w-3 h-3 inline-block" /></span>}
                                            </p>
                                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{msg.date}</span>
                                        </div>
                                        <p className={`text-sm truncate ${!msg.isRead && msg.type === 'INBOX' ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>{msg.subject}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
                    {rightPaneMode === 'EMPTY' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 bg-transparent">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-6 text-slate-300"><Mail className="w-12 h-12" /></div>
                            <p className="text-slate-500 font-medium text-base">İşlem yapmak için sol menüden bir mesaj seçin veya yeni mesaj oluşturun.</p>
                        </div>
                    )}

                    {rightPaneMode === 'READ' && selectedMessage && (
                        <div className="p-8 flex flex-col h-full bg-white relative animate-fade-in z-10">
                            <div className="border-b border-slate-100 pb-6 mb-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight pr-8">{selectedMessage.subject}</h3>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-slate-500">{selectedMessage.date}</p>
                                        <p className="text-xs font-bold text-slate-400 mt-0.5">{selectedMessage.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-6">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold tracking-tight text-lg border ${c.avatarBg}`}>
                                        {selectedMessage.sender.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                                            {selectedMessage.type === 'INBOX' ? 'Kimden:' : 'Kime:'} {selectedMessage.sender}
                                            {selectedMessage.isSentByParent && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] tracking-widest font-bold uppercase border border-purple-200">VELİ</span>}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sistem İçi Mesaj</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-base">
                                    {selectedMessage.content}
                                </p>
                            </div>
                        </div>
                    )}

                    {rightPaneMode === 'COMPOSE' && (
                        <div className="p-8 flex flex-col h-full bg-white relative animate-fade-in z-10">
                            <h3 className="text-xl font-bold tracking-tight text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-slate-400" /> Yeni İleti Gönder
                            </h3>
                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-5 relative">
                                <div className="relative">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Kime (İsim veya Rol Ara) *</label>
                                    
                                    {!selectedReceiverName ? (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={userSearchQuery}
                                                onChange={e => setUserSearchQuery(e.target.value)}
                                                onFocus={() => { if(userSearchQuery.length >= 2) setShowSearchDropdown(true); }}
                                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold ${c.ring} outline-none text-slate-700 transition-all placeholder:text-slate-400`}
                                                placeholder="Örn: Veli, Öğretmen veya isim yazın (En az 2 harf)"
                                                required
                                            />
                                            {showSearchDropdown && (
                                                <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto top-full">
                                                    {searchResults.length === 0 ? (
                                                        <div className="p-4 text-center text-sm font-bold text-slate-400">Sonuç bulunamadı.</div>
                                                    ) : (
                                                        searchResults.map(user => (
                                                            <div key={user.userId} onClick={() => handleSelectUser(user)} className="px-4 py-3 border-b last:border-0 border-slate-50 hover:bg-slate-50 cursor-pointer flex flex-col group transition-colors">
                                                                <span className={`text-sm font-bold text-slate-800 ${c.accentTextHover}`}>{user.fullName}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{user.role}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`flex items-center justify-between border px-4 py-3 rounded-xl ${c.badge}`}>
                                            <div>
                                                <span className="text-xs font-bold opacity-70 block mb-0.5 uppercase tracking-widest">Seçili Alıcı</span>
                                                <span className="text-sm font-bold tracking-tight">{selectedReceiverName}</span>
                                            </div>
                                            <button type="button" onClick={() => { setSelectedReceiverName(''); setMsgReceiverId(''); }} className={`${c.accentText} ${c.accentTextHover} bg-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors border border-current opacity-70 hover:opacity-100`}>Değiştir</button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="relative z-0">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Konu *</label>
                                    <input required type="text" value={msgSubject} onChange={e => setMsgSubject(e.target.value)} className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold ${c.ring} outline-none text-slate-800 transition-all placeholder:text-slate-400`} placeholder="Mesajınızın konusu..." />
                                </div>
                                
                                <div className="flex-1 flex flex-col relative z-0">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mesajınız *</label>
                                    <textarea required value={msgContent} onChange={e => setMsgContent(e.target.value)} className={`flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium ${c.ring} outline-none text-slate-800 resize-none transition-all placeholder:text-slate-400`} placeholder="Mesajınızı buraya detaylıca yazabilirsiniz..."></textarea>
                                </div>
                                
                                <div className="flex justify-end pt-4 border-t border-slate-100 shrink-0">
                                    <button type="submit" disabled={!msgReceiverId} className={`${c.btn} disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-10 py-3.5 rounded-xl font-bold tracking-widest shadow-md transition-all flex items-center gap-2`}>
                                        <Send className="w-4 h-4" /> GÖNDER
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
