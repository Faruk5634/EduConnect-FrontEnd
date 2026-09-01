import { Send, Trash2, Megaphone, Folder } from 'lucide-react';
import React, { useState } from 'react';
import type { ClassroomInfo, Announcement } from '../../types/panelTypes';

interface TeacherAnnouncementManagerProps {
    activeTab: 'announcements' | 'my-announcements';
    setActiveTab: (tab: 'announcements' | 'my-announcements') => void;
    allClassrooms: ClassroomInfo[];
    myAnnouncements: Announcement[];
    onCreateAnnouncement: (formData: FormData) => Promise<void>;
    onDeleteAnnouncement: (id: number) => Promise<void>;
    isSubmitting: boolean;
}

export default function TeacherAnnouncementManager({
    activeTab,
    setActiveTab,
    allClassrooms,
    myAnnouncements,
    onCreateAnnouncement,
    onDeleteAnnouncement,
    isSubmitting
}: TeacherAnnouncementManagerProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('GENERAL');
    const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const toggleClassSelection = (classId: number) => {
        setSelectedClassIds(prev =>
            prev.includes(classId)
                ? prev.filter(id => id !== classId)
                : [...prev, classId]
        );
    };

    const handleSelectAllClasses = () => {
        if (selectedClassIds.length === allClassrooms.length) {
            setSelectedClassIds([]);
        } else {
            setSelectedClassIds(allClassrooms.map(c => c.id));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            if (selectedFiles.length + newFiles.length > 5) {
                alert('En fazla 5 adet dosya yükleyebilirsiniz!');
                return;
            }

            const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
            const oversizedFile = newFiles.find(file => file.size > MAX_SIZE);
            if (oversizedFile) {
                alert(`"${oversizedFile.name}" adlı dosya 5 MB'dan büyük! Lütfen daha küçük dosyalar seçin.`);
                return;
            }

            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
        e.target.value = '';
    };

    const removeSelectedFile = (indexToRemove: number) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleMakeAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClassIds.length === 0) {
            alert('Lütfen en az bir sınıf seçin!');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('type', type);
        selectedClassIds.forEach(id => formData.append('classroomIds', id.toString()));

        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        await onCreateAnnouncement(formData);
        setTitle('');
        setContent('');
        setType('GENERAL');
        setSelectedClassIds([]);
        setSelectedFiles([]);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bu duyuruyu yayından kaldırmak istediğinize emin misiniz?")) return;
        await onDeleteAnnouncement(id);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-right">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-6 border-b border-white/40 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">
                        {activeTab === 'announcements' ? <Megaphone className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800">
                            {activeTab === 'announcements' ? 'Yeni Duyuru Yayınla' : 'Geçmiş Duyurularım'}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {activeTab === 'announcements' 
                                ? 'Tüm okula veya belirli bir sınıfa duyuru fırlatın.' 
                                : 'Daha önce yayınladığınız duyuruları görüntüleyin veya yayından kaldırın.'}
                        </p>
                    </div>
                </div>
                {activeTab === 'my-announcements' && (
                    <button onClick={() => setActiveTab('announcements')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg flex items-center gap-2 shrink-0">
                        <span>➕ </span> YENİ DUYURU OLUŞTUR
                    </button>
                )}
            </div>

            {activeTab === 'announcements' ? (
                <form onSubmit={handleMakeAnnouncement} className="glass-panel border border-white/40 p-8 rounded-2xl shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Duyuru Tipi *</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-transparent border border-white/40 rounded-xl px-4 py-3.5 text-slate-900 font-bold focus:glass-panel focus:border-emerald-500 outline-none transition-all cursor-pointer">
                                <option value="GENERAL">📢 Genel Duyuru</option>
                                <option value="HOMEWORK">📝 Ödev Ataması</option>
                                <option value="EXAM_INFO">🎯 Sınav Bilgisi</option>
                                <option value="EVENT">🎉 Etkinlik / Gezi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Duyuru Başlığı *</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: Hafta Sonu Deneme Sınavı" className="w-full bg-transparent border border-white/40 rounded-xl px-4 py-3.5 text-slate-900 font-bold focus:glass-panel focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium" required />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Duyuru İçeriği *</label>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Detayları buraya yazın..." className="w-full bg-transparent border border-white/40 rounded-xl px-4 py-3.5 text-slate-900 font-bold focus:glass-panel focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-slate-400 placeholder:font-medium" required></textarea>
                    </div>

                    <div className="mt-6">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center justify-between">
                            <span>Hedef Sınıflar *</span>
                            <button type="button" onClick={handleSelectAllClasses} className="text-emerald-600 hover:text-emerald-700 font-bold tracking-tight text-slate-800 tracking-normal normal-case">
                                {selectedClassIds.length === allClassrooms.length ? 'Tümünü Temizle' : 'Tümünü Seç'}
                            </button>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {allClassrooms.map(c => (
                                <button key={c.id} type="button" onClick={() => toggleClassSelection(c.id)} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border ${selectedClassIds.includes(c.id) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'glass-panel border-white/40 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'}`}>
                                    {c.name}
                                </button>
                            ))}
                        </div>
                        {allClassrooms.length === 0 && <p className="text-sm text-slate-500 italic">Okulda kayıtlı sınıf bulunmuyor.</p>}
                    </div>

                    <div className="mt-6">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Dosya Ekleri (Opsiyonel, Max 5 Adet)</label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-white/40 inline-flex items-center gap-2">
                                <span>📎</span> Dosya Seç
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                            <span className="text-xs font-medium text-slate-500">{selectedFiles.length} dosya seçildi. Toplam boyut {"<"} 5MB olmalı.</span>
                        </div>
                        
                        {selectedFiles.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2 pl-3 rounded-lg">
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-xs font-bold text-emerald-800 truncate" title={file.name}>{file.name}</span>
                                            <span className="text-[10px] font-bold text-emerald-600/70">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                        <button type="button" onClick={() => removeSelectedFile(idx)} className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors ml-2 shrink-0">×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-8 py-3.5 rounded-xl font-bold tracking-tight text-slate-800 text-lg transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSubmitting ? <span className="animate-pulse">GÖNDERİLİYOR...</span> : <><Send className="w-4 h-4" /> DUYURUYU FIRLAT</>}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {myAnnouncements.length === 0 ? (
                        <div className="text-center py-16 bg-transparent rounded-2xl border border-dashed border-slate-300">
                            <span className="text-5xl mb-4 block opacity-50">📢</span>
                            <h4 className="text-lg font-bold text-slate-700">Henüz bir duyuru yayınlamadınız.</h4>
                            <p className="text-sm text-slate-500 mt-2">Öğrencilerinize ulaşmak için 'Yeni Duyuru Oluştur' butonunu kullanın.</p>
                        </div>
                    ) : (
                        myAnnouncements.map(ann => {
                            const isGeneral = !ann.targetClasses || ann.targetClasses.length === 0 || ann.targetClasses.includes("Genel Duyuru");
                            return (
                                <div key={ann.id} className="glass-panel border border-white/40 p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between gap-6 hover:border-emerald-300 transition-colors group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight text-slate-800 tracking-widest uppercase border ${
                                                ann.type === 'HOMEWORK' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                ann.type === 'EXAM_INFO' ? 'bg-red-100 text-red-700 border-red-200' :
                                                ann.type === 'EVENT' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                'bg-blue-100 text-blue-700 border-blue-200'
                                            }`}>
                                                {ann.type === 'HOMEWORK' ? '📝 ÖDEV' : ann.type === 'EXAM_INFO' ? '🎯 SINAV' : ann.type === 'EVENT' ? '🎉 ETKİNLİK' : '📢 GENEL'}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <span>🕒</span> {new Date(ann.createdDate).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight text-slate-800 text-slate-800 mb-2">{ann.title}</h3>
                                        <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed mb-3">{ann.content}</p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-slate-500">Hedef:</span>
                                            {isGeneral ? (
                                                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">Tüm Okul</span>
                                            ) : (
                                                ann.targetClasses?.map((cls, idx) => (
                                                    <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-white/40">{cls}</span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-end items-end shrink-0 gap-3">
                                        {ann.attachedFiles && ann.attachedFiles.length > 0 && (
                                            <div className="text-xs font-bold text-slate-400 bg-transparent px-3 py-1.5 rounded border border-slate-100">
                                                📎 {ann.attachedFiles.length} Ek
                                            </div>
                                        )}
                                        <button onClick={() => handleDelete(ann.id)} className="text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2">
                                            <span><Trash2 className="w-4 h-4" /></span> Sil
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
