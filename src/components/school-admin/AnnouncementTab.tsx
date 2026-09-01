import React, { useEffect, useState } from 'react';
import { api, API_BASE } from '../../services/api';
import { showToast } from '../../utils/toast';
import { useAnnouncements } from '../../hooks/useAnnouncements';

interface Classroom {
    id: number;
    name: string;
}

export default function AnnouncementTab() {
    const { announcements, loading, fetchAll, create, remove } = useAnnouncements();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form & Dosya Durumları
    const [form, setForm] = useState({ title: '', content: '', type: 'GENERAL' });
    const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]); // Çoklu sınıf seçimi için dizi
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Çoklu dosya seçimi için dizi
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtreleme Durumları
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        fetchAll();
        fetchClassrooms();
    }, [fetchAll]);

    const fetchClassrooms = async () => {
        try {
            const response = await api.get('/classrooms/school');
            setClassrooms(response.data);
        } catch (error) {
            console.error("Sınıflar çekilemedi:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bu duyuruyu yayından kaldırmak istediğinize emin misiniz?")) return;
        try {
            await remove(id);
            fetchAll();
        } catch (error) {
            console.error(error);
            showToast("Duyuru kaldırılamadı!", 'error');
        }
    };

    // 🚀 ÇOKLU SINIF SEÇİM YARDIMCILARI
    const toggleClassSelection = (classId: number) => {
        setSelectedClassIds(prev =>
            prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
        );
    };

    const handleSelectAllClasses = () => {
        if (selectedClassIds.length === classrooms.length) {
            setSelectedClassIds([]);
        } else {
            setSelectedClassIds(classrooms.map(c => c.id));
        }
    };

    // 🚀 ÇOKLU DOSYA SEÇİM YARDIMCILARI
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            if (selectedFiles.length + newFiles.length > 5) {
                showToast('En fazla 5 adet dosya yükleyebilirsiniz!', 'error');
                return;
            }

            const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
            const oversizedFile = newFiles.find(file => file.size > MAX_SIZE);
            if (oversizedFile) {
                showToast(`"${oversizedFile.name}" adlı dosya 5 MB'dan büyük! Lütfen daha küçük dosyalar seçin.`, 'error');
                return;
            }

            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
        e.target.value = ''; // Input'u sıfırla
    };

    const removeSelectedFile = (indexToRemove: number) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // 🚀 DUYURU OLUŞTURMA MOTORU (Çoklu Sınıf & Çoklu Dosya Destekli)
    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('content', form.content);
        formData.append('type', form.type);

        selectedClassIds.forEach(id => formData.append('classroomIds', id.toString()));
        selectedFiles.forEach(file => formData.append('files', file));

        try {
            await create(formData);
            setIsCreateModalOpen(false);
            setForm({ title: '', content: '', type: 'GENERAL' });
            setSelectedClassIds([]);
            setSelectedFiles([]);
            showToast('Duyuru başarıyla yayınlandı.', 'success');
            fetchAll();
        } catch (error) {
            console.error(error);
            showToast("Duyuru yayınlanırken hata oluştu!", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🚀 FİLTRELEME MOTORU
    const filteredAnnouncements = announcements.filter(ann => {
        const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) || ann.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'ALL' || ann.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // 🎨 GÖRSEL ROZET MOTORU
    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'HOMEWORK': return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-md font-bold text-xs tracking-widest uppercase">📚 Ödev</span>;
            case 'EXAM_INFO': return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-md font-bold text-xs tracking-widest uppercase">📝 Sınav Bilgisi</span>;
            case 'EVENT': return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-md font-bold text-xs tracking-widest uppercase">🎉 Etkinlik</span>;
            case 'GENERAL': default: return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md font-bold text-xs tracking-widest uppercase">📢 Genel</span>;
        }
    };

    return (
        <div className="animate-fade-in-down h-full bg-transparent p-6 md:p-8 rounded-tl-3xl flex flex-col">

            {/* 🎯 ÜST BAR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Okul Duyuru Panosu</h2>
                    <p className="text-slate-500 text-sm mt-1">Öğrencilere ve velilere yönelik bilgilendirmeleri buradan yönetebilirsiniz.</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-md font-bold shadow-lg transition-all flex items-center gap-2 text-sm tracking-widest flex-shrink-0">
                    <span>➕</span> YENİ DUYURU
                </button>
            </div>

            {/* 🎛️ FİLTRE ÇUBUĞU */}
            <div className="glass-panel p-4 rounded-md shadow-lg border border-white/40 mb-6 flex flex-col sm:flex-row gap-4 flex-shrink-0">
                <div className="flex-1 relative">
                    <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Duyuru başlığı veya içeriği ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border border-white/40 rounded-md pl-11 pr-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-blue-700 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="w-full sm:w-56">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full bg-transparent border border-white/40 rounded-md px-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-blue-700 outline-none transition-all cursor-pointer text-slate-700"
                    >
                        <option value="ALL">Tüm Duyuru Tipleri</option>
                        <option value="GENERAL">Genel Duyurular</option>
                        <option value="HOMEWORK">Ödevler</option>
                        <option value="EXAM_INFO">Sınav Bilgileri</option>
                        <option value="EVENT">Etkinlikler</option>
                    </select>
                </div>
            </div>

            {/* 📋 DUYURU LİSTESİ (KARTLAR) */}
            {loading ? (
                <div className="text-center py-20 text-slate-400 font-medium animate-pulse">📡 Panodaki duyurular taranıyor...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {filteredAnnouncements.length === 0 ? (
                        <div className="col-span-full glass-panel rounded-xl border border-white/40 py-16 text-center shadow-lg">
                            <span className="text-5xl block mb-4">📭</span>
                            <h3 className="text-lg font-bold text-slate-700">Duyuru Bulunamadı</h3>
                            <p className="text-slate-500 text-sm mt-1">Sistemde henüz yayınlanmış bir duyuru yok veya aramanızla eşleşmiyor.</p>
                        </div>
                    ) : (
                        filteredAnnouncements.map((ann) => {
                            // Backend'den sınıflar gelmezse veya içinde 'Genel Duyuru' varsa Tüm Okul olarak göster
                            const isGeneral = !ann.targetClasses || ann.targetClasses.length === 0 || ann.targetClasses.includes("Genel Duyuru");

                            return (
                                <div key={ann.id} className="glass-panel rounded-xl border border-white/40 shadow-lg hover:shadow-lg transition-shadow relative flex flex-col h-full overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            {getTypeBadge(ann.type)}
                                            <button onClick={() => handleDelete(ann.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Duyuruyu Sil">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{ann.title}</h3>
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">{ann.content}</p>

                                        {/* 🚀 GÜNCELLEME: ÇOKLU DOSYA GÖRÜNÜMÜ */}
                                        {ann.attachedFiles && ann.attachedFiles.length > 0 && (
                                            <div className="bg-transparent border border-white/40 rounded-md p-3 mb-4 space-y-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/40 pb-1">
                                                    📎 Eklentiler ({ann.attachedFiles.length})
                                                </p>
                                                {ann.attachedFiles.map((file, idx) => (
                                                    <div key={idx} className="flex items-center gap-3">
                                                        <span className="text-lg">📄</span>
                                                        <div className="flex-1 min-w-0 flex justify-between items-center">
                                                            <p className="text-xs font-bold text-slate-700 truncate pr-2" title={file.fileName}>{file.fileName}</p>
                                                            <a href={`${API_BASE}${file.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider whitespace-nowrap">Aç</a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest mt-auto gap-4">
                                            <span className="flex items-center gap-1 flex-shrink-0">✍️ {ann.authorName}</span>

                                            {/* 🚀 GÜNCELLEME: HEDEF SINIF LİSTESİ */}
                                            <span className="text-blue-600 truncate text-right" title={!isGeneral ? ann.targetClasses.join(', ') : 'TÜM OKUL'}>
                                                {!isGeneral ? ann.targetClasses.join(', ') : 'TÜM OKUL'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* 💎 PREMIUM MODAL (DUYURU OLUŞTURMA PENCERESİ) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
                    <div className="glass-panel rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">

                        {/* Modal Başlığı */}
                        <div className="bg-slate-800 p-6 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-slate-800 text-white tracking-tight">Yeni Duyuru Yayınla</h3>
                                <p className="text-slate-400 text-xs font-medium mt-1">Tüm okula veya belirli bir sınıfa duyuru gönderin.</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-600 transition-colors">
                                ✕
                            </button>
                        </div>

                        {/* Modal İçeriği (Kaydırılabilir Alan) */}
                        <div className="p-8 overflow-y-auto flex-1">
                            <form id="announcementForm" onSubmit={handleCreateAnnouncement} className="space-y-6">

                                {/* 🚀 GÜNCELLEME: ÇOKLU SINIF SEÇİCİ */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Hedef Sınıflar</label>
                                        {classrooms.length > 0 && (
                                            <button type="button" onClick={handleSelectAllClasses} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                                {selectedClassIds.length === classrooms.length ? 'Seçimleri Kaldır' : '+ Tümünü Seç'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 p-3 bg-transparent border border-white/40 rounded-md max-h-32 overflow-y-auto">
                                        {classrooms.map(cls => {
                                            const isSelected = selectedClassIds.includes(cls.id);
                                            return (
                                                <button
                                                    type="button"
                                                    key={cls.id}
                                                    onClick={() => toggleClassSelection(cls.id)}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}
                                                >
                                                    {isSelected && <span className="mr-1">✓</span>}
                                                    {cls.name} Sınıfı
                                                </button>
                                            )
                                        })}
                                        {classrooms.length === 0 && <p className="text-xs text-slate-500">Sistemde kayıtlı sınıf bulunamadı.</p>}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">* Hiçbir sınıf seçmezseniz duyuru <span className="font-bold text-slate-500">TÜM OKULA (Genel)</span> gönderilir.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Duyuru Tipi *</label>
                                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all cursor-pointer">
                                        <option value="GENERAL">📢 Genel Duyuru</option>
                                        <option value="HOMEWORK">📚 Ödev</option>
                                        <option value="EXAM_INFO">📝 Sınav Bilgisi</option>
                                        <option value="EVENT">🎉 Etkinlik</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Duyuru Başlığı *</label>
                                    <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" placeholder="Örn: Yarınki Tören Hakkında" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Duyuru İçeriği *</label>
                                    <textarea required rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-md px-4 py-3 text-slate-900 font-medium focus:glass-panel focus:border-blue-700 outline-none transition-all placeholder:text-slate-400 resize-none" placeholder="Mesajınızı detaylıca yazın..."></textarea>
                                </div>

                                {/* 🚀 GÜNCELLEME: ÇOKLU DOSYA SEÇİCİ */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Dosya Ekleri (Maks. 5)</label>
                                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-transparent transition-colors">
                                        <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className="pointer-events-none">
                                            <span className="text-3xl mb-2 block">📎</span>
                                            <p className="text-sm font-bold text-slate-600">Dosya seçmek için tıklayın veya sürükleyin</p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel veya Resim (Max 5MB/dosya)</p>
                                        </div>
                                    </div>

                                    {selectedFiles.length > 0 && (
                                        <div className="mt-3 bg-transparent border border-white/40 rounded-md p-3">
                                            <ul className="space-y-1">
                                                {selectedFiles.map((file, index) => (
                                                    <li key={index} className="flex items-center justify-between text-xs font-medium text-slate-700 glass-panel border border-slate-100 px-2 py-1.5 rounded">
                                                        <span className="truncate max-w-[80%] pl-1">{file.name}</span>
                                                        <button type="button" onClick={() => removeSelectedFile(index)} className="text-red-500 hover:text-red-700 px-2 font-bold tracking-tight text-slate-800">✕</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                            </form>
                        </div>

                        {/* Modal Alt Butonlar */}
                        <div className="bg-transparent p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="glass-panel border border-slate-300 hover:bg-slate-100 text-slate-700 px-6 py-2.5 rounded-md font-bold text-sm tracking-widest transition-all shadow-lg">
                                İPTAL
                            </button>
                            <button type="submit" disabled={isSubmitting} form="announcementForm" className="bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white px-8 py-2.5 rounded-md font-bold text-sm tracking-widest shadow-lg transition-all">
                                {isSubmitting ? 'YAYINLANIYOR...' : 'YAYINLA'}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
