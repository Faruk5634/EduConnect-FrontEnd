import { Bell } from 'lucide-react';
import { useState } from 'react';
import type { Announcement } from '../../types/panelTypes';
import { API_BASE } from '../../services/api';

interface SharedAnnouncementModuleProps {
    announcements: Announcement[];
    userGrade?: string | null;
}

export default function SharedAnnouncementModule({ announcements, userGrade }: SharedAnnouncementModuleProps) {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [announcementSearch, setAnnouncementSearch] = useState('');
    const [announcementTypeFilter, setAnnouncementTypeFilter] = useState('ALL');
    const [announcementSort, setAnnouncementSort] = useState('NEWEST');

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'HOMEWORK': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold tracking-tight text-slate-800 tracking-widest uppercase border border-orange-200">📝 ÖDEV</span>;
            case 'EXAM_INFO': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold tracking-tight text-slate-800 tracking-widest uppercase border border-red-200">🎯 SINAV</span>;
            case 'EVENT': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold tracking-tight text-slate-800 tracking-widest uppercase border border-purple-200">🎉 ETKİNLİK</span>;
            default: return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold tracking-tight text-slate-800 tracking-widest uppercase border border-blue-200">📢 GENEL</span>;
        }
    };

    const getHeaderBgForType = (type: string) => {
        switch (type) {
            case 'HOMEWORK': return 'bg-gradient-to-r from-orange-500 to-amber-600';
            case 'EXAM_INFO': return 'bg-gradient-to-r from-red-500 to-rose-600';
            case 'EVENT': return 'bg-gradient-to-r from-purple-500 to-fuchsia-600';
            default: return 'bg-gradient-to-r from-blue-600 to-indigo-700';
        }
    };

    const filteredAnnouncements = announcements.filter(ann => {
        const matchesClass = !userGrade || !ann.targetClasses?.length
            ? true
            : ann.targetClasses.includes('Genel Duyuru') || ann.targetClasses.includes(userGrade);

        const matchesSearch =
            ann.title.toLowerCase().includes(announcementSearch.toLowerCase()) ||
            ann.content.toLowerCase().includes(announcementSearch.toLowerCase()) ||
            ann.authorName.toLowerCase().includes(announcementSearch.toLowerCase());

        const matchesType = announcementTypeFilter === 'ALL' || ann.type === announcementTypeFilter;
        return matchesClass && matchesSearch && matchesType;
    }).sort((a, b) => {
        const timeA = new Date(a.createdDate).getTime();
        const timeB = new Date(b.createdDate).getTime();
        return announcementSort === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });

    if (selectedAnnouncement) {
        return (
            <div className="glass-panel rounded-2xl shadow-xl overflow-hidden border border-white/40 animate-scale-in">
                <div className={`relative h-48 ${getHeaderBgForType(selectedAnnouncement.type)} flex items-end p-8`}>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="absolute right-0 top-0 w-64 h-64 glass-panel/10 rounded-full blur-[80px]"></div>
                    <button onClick={() => setSelectedAnnouncement(null)} className="absolute top-6 left-6 glass-panel/20 hover:glass-panel/40 backdrop-blur-md text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg border border-white/30">
                        <span>←</span> Akışa Geri Dön
                    </button>
                    <div className="relative z-10 flex gap-3">
                        <span className="glass-panel/90 text-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight text-slate-800 tracking-widest uppercase shadow-lg">
                            {selectedAnnouncement.type === 'HOMEWORK' ? '📝 ÖDEV' : selectedAnnouncement.type === 'EXAM_INFO' ? '🎯 SINAV' : selectedAnnouncement.type === 'EVENT' ? '🎉 ETKİNLİK' : '📢 GENEL'}
                        </span>
                        <span className="glass-panel/20 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight text-slate-800 tracking-widest uppercase border border-white/30 shadow-lg max-w-[300px] truncate" title={selectedAnnouncement.targetClasses?.join(', ')}>
                            {selectedAnnouncement.targetClasses?.join(', ') || 'Genel Duyuru'}
                        </span>
                    </div>
                </div>
                <div className="p-10 md:p-14">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-800 text-slate-800 mb-8 leading-tight tracking-tight">{selectedAnnouncement.title}</h2>
                    <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-100">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600 shadow-lg">
                            {selectedAnnouncement.authorName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-800">{selectedAnnouncement.authorName}</p>
                            <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">
                                Yayınlanma: {new Date(selectedAnnouncement.createdDate).toLocaleDateString('tr-TR')} • {new Date(selectedAnnouncement.createdDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                    <div className="prose max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-lg">{selectedAnnouncement.content}</div>

                    {selectedAnnouncement.attachedFiles && selectedAnnouncement.attachedFiles.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-slate-100 bg-transparent/50 p-6 rounded-2xl border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span>📎</span> Ekli Dosyalar ({selectedAnnouncement.attachedFiles.length})</h4>
                            <div className="flex flex-wrap gap-4">
                                {selectedAnnouncement.attachedFiles.map((file, idx) => (
                                    <a key={idx} href={`${API_BASE}${file.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 glass-panel hover:bg-indigo-50 text-indigo-700 px-6 py-4 rounded-xl text-sm font-bold transition-all shadow-lg border border-white/40 hover:border-indigo-200 hover:shadow-lg">
                                        <span className="text-2xl text-indigo-500 flex-shrink-0">📄</span>
                                        <span className="truncate max-w-[200px]" title={file.fileName}>{file.fileName || 'Dosyayı İndir'}</span>
                                        <span className="text-slate-400 flex-shrink-0">⬇</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-8">
            <div className="flex-[2] space-y-6">
                <div className="glass-panel p-4 rounded-2xl shadow-lg border border-white/40 flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Duyuru veya ödev ara..."
                            value={announcementSearch}
                            onChange={e => setAnnouncementSearch(e.target.value)}
                            className="w-full bg-transparent border border-white/40 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={announcementTypeFilter}
                            onChange={e => setAnnouncementTypeFilter(e.target.value)}
                            className="bg-transparent border border-white/40 rounded-xl px-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-indigo-500 outline-none cursor-pointer"
                        >
                            <option value="ALL">Tüm Kategoriler</option>
                            <option value="GENERAL">📢 Genel</option>
                            <option value="HOMEWORK">📝 Ödevler</option>
                            <option value="EXAM_INFO">🎯 Sınavlar</option>
                            <option value="EVENT">🎉 Etkinlikler</option>
                        </select>
                        <select
                            value={announcementSort}
                            onChange={e => setAnnouncementSort(e.target.value)}
                            className="bg-transparent border border-white/40 rounded-xl px-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-indigo-500 outline-none cursor-pointer"
                        >
                            <option value="NEWEST">Yeniden Eskiye</option>
                            <option value="OLDEST">Eskiden Yeniye</option>
                        </select>
                    </div>
                </div>

                {filteredAnnouncements.length === 0 ? (
                    <div className="glass-panel border border-white/40 rounded-2xl p-10 text-center shadow-lg">
                        <div className="text-5xl mb-4"><div className="flex justify-center mb-6"><div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center"><Bell className="w-10 h-10 text-slate-400" /></div></div></div>
                        <h4 className="text-lg font-bold text-slate-700">Duyuru bulunamadı</h4>
                        <p className="text-sm text-slate-500 mt-2">Arama kriterlerinize uyan bir içerik yok.</p>
                    </div>
                ) : (
                    filteredAnnouncements.map((ann) => (
                        <div key={ann.id} onClick={() => setSelectedAnnouncement(ann)} className="glass-panel border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group hover:-translate-y-1">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${ann.type === 'HOMEWORK' ? 'bg-orange-400' : ann.type === 'EXAM_INFO' ? 'bg-red-400' : ann.type === 'EVENT' ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{ann.authorName.charAt(0)}</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{ann.authorName}</p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{new Date(ann.createdDate).toLocaleDateString('tr-TR')} • {new Date(ann.createdDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getTypeBadge(ann.type)}
                                    <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[150px]" title={ann.targetClasses?.join(', ')}>
                                        {ann.targetClasses?.join(', ') || 'Genel Duyuru'}
                                    </span>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold tracking-tight text-slate-800 text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{ann.title}</h4>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap mb-4 line-clamp-3">{ann.content}</p>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">Detayları Oku →</span>

                                {ann.attachedFiles && ann.attachedFiles.length > 0 && (
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1 flex-shrink-0">📎 {ann.attachedFiles.length} Dosya</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="flex-1 hidden lg:block">
                {/* Sağ taraf boş kalabilir veya ek bilgiler konabilir, tasarım bütünlüğü için */}
            </div>
        </div>
    );
}
