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
}

export default function SharedMessagingModule({ messages, onSendMessage, onReadMessage, userRoleLabel }: SharedMessagingModuleProps) {
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
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-150px)] animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800">İletişim ve Mesajlar</h2>
                    <p className="text-sm text-slate-500 font-medium">{userRoleLabel}</p>
                </div>
                <button onClick={() => setRightPaneMode('COMPOSE')} className="btn-primary px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg flex items-center gap-2">
                    <span>✎</span> YENİ MESAJ
                </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                <div className="w-1/3 glass-panel rounded-2xl shadow-lg border border-white/40 flex flex-col overflow-hidden">
                    <div className="flex border-b border-slate-100 bg-transparent">
                        <button onClick={() => {setMailBoxView('INBOX'); setRightPaneMode('EMPTY');}} className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${mailBoxView === 'INBOX' ? 'border-indigo-600 text-indigo-700 glass-panel' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Gelen Kutusu</button>
                        <button onClick={() => {setMailBoxView('SENT'); setRightPaneMode('EMPTY');}} className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${mailBoxView === 'SENT' ? 'border-indigo-600 text-indigo-700 glass-panel' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Gönderilenler</button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {displayedMessages.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">
                                <p className="font-bold text-sm">Bu klasör şu an boş.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {displayedMessages.map(msg => (
                                    <div key={msg.id} onClick={() => handleReadMessage(msg)} className={`p-4 cursor-pointer hover:bg-transparent transition-colors flex flex-col gap-1 border-l-4 ${selectedMessage?.id === msg.id ? 'border-l-indigo-500 bg-indigo-50/30' : !msg.isRead && msg.type === 'INBOX' ? 'border-l-indigo-500 bg-transparent' : 'border-l-transparent'}`}>
                                        <div className="flex justify-between items-baseline">
                                            <p className={`text-sm truncate flex items-center ${!msg.isRead && msg.type === 'INBOX' ? 'font-bold tracking-tight text-slate-800 text-slate-900' : 'font-bold text-slate-700'}`}>
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

                <div className="flex-1 glass-panel rounded-2xl shadow-lg border border-white/40 overflow-hidden flex flex-col relative">
                    {rightPaneMode === 'EMPTY' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 bg-transparent">
                            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-4xl mb-6 text-slate-400"><Mail className="w-12 h-12" /></div>
                            <p className="text-slate-500 font-medium text-base">İşlem yapmak için sol menüden bir mesaj seçin veya yeni mesaj oluşturun.</p>
                        </div>
                    )}

                    {rightPaneMode === 'READ' && selectedMessage && (
                        <div className="p-8 flex flex-col h-full glass-panel relative animate-fade-in z-10">
                            <div className="border-b border-slate-100 pb-6 mb-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-900 leading-tight pr-8">{selectedMessage.subject}</h3>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-slate-500">{selectedMessage.date}</p>
                                        <p className="text-xs font-bold text-slate-400 mt-0.5">{selectedMessage.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-6">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold tracking-tight text-slate-800 text-lg border border-indigo-100">
                                        {selectedMessage.sender.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-slate-800 flex items-center gap-2">
                                            {selectedMessage.type === 'INBOX' ? 'Kimden:' : 'Kime:'} {selectedMessage.sender}
                                            {selectedMessage.isSentByParent && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] tracking-widest font-bold tracking-tight text-slate-800 uppercase border border-purple-200">VELİ</span>}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Sistem İçi Mesaj</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                <p className="text-slate-700 font-medium leading-loose whitespace-pre-wrap text-base">
                                    {selectedMessage.content}
                                </p>
                            </div>
                        </div>
                    )}

                    {rightPaneMode === 'COMPOSE' && (
                        <div className="p-8 flex flex-col h-full glass-panel relative animate-fade-in z-10">
                            <h3 className="text-xl font-bold tracking-tight text-slate-800 text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                <Edit3 className="w-4 h-4" /> Yeni İleti Gönder
                            </h3>
                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-5 relative">
                                <div className="relative">
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Kime (İsim veya Rol Ara) *</label>
                                    
                                    {!selectedReceiverName ? (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={userSearchQuery}
                                                onChange={e => setUserSearchQuery(e.target.value)}
                                                onFocus={() => { if(userSearchQuery.length >= 2) setShowSearchDropdown(true); }}
                                                className="w-full bg-transparent border border-white/40 rounded-xl px-4 py-3.5 text-sm font-semibold focus:glass-panel focus:border-indigo-500 outline-none text-slate-700 transition-all placeholder:text-slate-400"
                                                placeholder="Örn: Veli, Öğretmen veya isim yazın (En az 2 harf)"
                                                required
                                            />
                                            {showSearchDropdown && (
                                                <div className="absolute z-[100] w-full mt-2 glass-panel border border-white/40 rounded-xl shadow-2xl max-h-64 overflow-y-auto top-full">
                                                    {searchResults.length === 0 ? (
                                                        <div className="p-4 text-center text-sm font-bold text-slate-400">Sonuç bulunamadı.</div>
                                                    ) : (
                                                        searchResults.map(user => (
                                                            <div key={user.userId} onClick={() => handleSelectUser(user)} className="px-4 py-3 border-b last:border-0 border-slate-100 hover:bg-indigo-50 cursor-pointer flex flex-col group transition-colors">
                                                                <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-700">{user.fullName}</span>
                                                                <span className="text-[10px] font-bold tracking-tight text-slate-800 text-slate-400 uppercase tracking-widest mt-0.5">{user.role}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 px-4 py-3.5 rounded-xl">
                                            <div>
                                                <span className="text-xs font-bold text-indigo-400 block mb-0.5 uppercase tracking-widest">Seçili Alıcı</span>
                                                <span className="text-sm font-bold tracking-tight text-slate-800 text-indigo-900">{selectedReceiverName}</span>
                                            </div>
                                            <button type="button" onClick={() => { setSelectedReceiverName(''); setMsgReceiverId(''); }} className="text-indigo-400 hover:text-indigo-700 glass-panel px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-colors">Değiştir</button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="relative z-0">
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Konu *</label>
                                    <input required type="text" value={msgSubject} onChange={e => setMsgSubject(e.target.value)} className="w-full bg-transparent border border-white/40 rounded-xl px-4 py-3.5 text-sm font-semibold focus:glass-panel focus:border-indigo-500 outline-none text-slate-900 transition-all placeholder:text-slate-400" placeholder="Mesajınızın konusu..." />
                                </div>
                                
                                <div className="flex-1 flex flex-col relative z-0">
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Mesajınız *</label>
                                    <textarea required value={msgContent} onChange={e => setMsgContent(e.target.value)} className="flex-1 w-full bg-transparent border border-white/40 rounded-xl px-4 py-4 text-sm font-medium focus:glass-panel focus:border-indigo-500 outline-none text-slate-800 resize-none transition-all placeholder:text-slate-400" placeholder="Mesajınızı buraya detaylıca yazabilirsiniz..."></textarea>
                                </div>
                                
                                <div className="flex justify-end pt-4 border-t border-slate-100 shrink-0">
                                    <button type="submit" disabled={!msgReceiverId} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-10 py-3.5 rounded-xl font-bold tracking-tight text-slate-800 text-sm tracking-widest shadow-lg hover:shadow-lg transition-all flex items-center gap-2">
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
