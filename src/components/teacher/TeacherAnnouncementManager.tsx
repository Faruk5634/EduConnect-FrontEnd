import React, { useState, useRef } from 'react';
import { Send, Folder, UploadCloud, X, Check, Megaphone } from 'lucide-react';
import type { ClassroomInfo } from '../../types/panelTypes';

interface TeacherAnnouncementManagerProps {
    allClassrooms: ClassroomInfo[];
    onCreateAnnouncement: (formData: FormData) => Promise<void>;
    isSubmitting: boolean;
}

export default function TeacherAnnouncementManager({
    allClassrooms,
    onCreateAnnouncement,
    isSubmitting
}: TeacherAnnouncementManagerProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('GENERAL');
    const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleClassSelection = (classId: number) => {
        setSelectedClassIds(prev =>
            prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
        );
    };

    const handleSelectAllClasses = () => {
        if (selectedClassIds.length === allClassrooms.length) {
            setSelectedClassIds([]);
        } else {
            setSelectedClassIds(allClassrooms.map(c => c.id));
        }
    };

    const handleFiles = (newFiles: File[]) => {
        if (selectedFiles.length + newFiles.length > 5) {
            alert('En fazla 5 adet dosya yükleyebilirsiniz!');
            return;
        }
        const MAX_SIZE = 25 * 1024 * 1024; // 25 MB per file
        const oversizedFile = newFiles.find(file => file.size > MAX_SIZE);
        if (oversizedFile) {
            alert(`"${oversizedFile.name}" dosyası 25MB sınırını aşıyor!`);
            return;
        }
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFiles(Array.from(e.target.files));
        e.target.value = '';
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) handleFiles(Array.from(e.dataTransfer.files));
    };

    const removeSelectedFile = (indexToRemove: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleMakeAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClassIds.length === 0) {
            alert('Lütfen en az bir hedef sınıf seçin!');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('type', type);
        selectedClassIds.forEach(id => formData.append('classroomIds', id.toString()));
        // Append raw File objects — required for multipart/form-data uploads
        selectedFiles.forEach(file => formData.append('files', file, file.name));

        try {
            await onCreateAnnouncement(formData);
            // Clear form on success
            setTitle('');
            setContent('');
            setType('GENERAL');
            setSelectedClassIds([]);
            setSelectedFiles([]);
        } catch {
            // Error is already shown as a toast by useAnnouncements.create()
            // No additional action needed here
        }
    };

    return (
        <div className="w-full animate-fade-in">
            {/* Başlık */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                    <span className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <Megaphone className="w-6 h-6" />
                    </span>
                    Yeni Duyuru Oluştur
                </h2>
                <p className="text-slate-500 font-medium mt-2 ml-15">Öğrencilerinize ve velilere ulaşmak istediğiniz konuyu hızlıca paylaşın.</p>
            </div>

            <form onSubmit={handleMakeAnnouncement} className="space-y-6">
                {/* Tip ve Başlık */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Duyuru Tipi</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 font-medium shadow-sm transition-all"
                            >
                                <option value="GENERAL">Genel</option>
                                <option value="HOMEWORK">Ödev</option>
                                <option value="EXAM">Sınav</option>
                                <option value="EVENT">Etkinlik</option>
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Başlık <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Duyurunun başlığını girin..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 font-medium shadow-sm transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Hedef Sınıflar (Multi-Select) */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Hedef Sınıflar <span className="text-red-500">*</span>
                        </label>
                        <div
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center shadow-sm hover:border-emerald-400 transition-colors"
                            onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                        >
                            <span className="text-slate-600 font-medium truncate">
                                {selectedClassIds.length === 0
                                    ? 'Sınıf seçmek için tıklayın...'
                                    : selectedClassIds.length === allClassrooms.length
                                        ? 'Tüm sınıflar seçildi'
                                        : `${selectedClassIds.length} sınıf seçildi`}
                            </span>
                            <span className={`text-slate-400 transition-transform ${isClassDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                        </div>

                        {/* Seçili sınıf etiketleri */}
                        {selectedClassIds.length > 0 && !isClassDropdownOpen && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedClassIds.map(id => {
                                    const cls = allClassrooms.find(c => c.id === id);
                                    return cls ? (
                                        <span key={id} className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                                            {cls.name}
                                            <button type="button" onClick={() => toggleClassSelection(id)} className="text-emerald-600 hover:text-emerald-900">×</button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}

                        {isClassDropdownOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                                {/* Tümünü Seç */}
                                <div
                                    className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 flex items-center gap-3 transition-colors"
                                    onClick={handleSelectAllClasses}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${selectedClassIds.length === allClassrooms.length ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                        {selectedClassIds.length === allClassrooms.length && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="font-bold text-slate-700">Tüm Sınıfları Seç</span>
                                </div>
                                {allClassrooms.length === 0 ? (
                                    <p className="text-center text-slate-500 font-medium py-4 text-sm">Sınıf bulunamadı.</p>
                                ) : (
                                    allClassrooms.map(cls => (
                                        <div
                                            key={cls.id}
                                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"
                                            onClick={() => toggleClassSelection(cls.id)}
                                        >
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${selectedClassIds.includes(cls.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                                {selectedClassIds.includes(cls.id) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="font-medium text-slate-700">{cls.name}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* İçerik Alanı */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Duyuru İçeriği <span className="text-red-500">*</span></label>
                    <textarea
                        placeholder="Öğrencilerinizle ve velilerinizle paylaşmak istediğiniz mesajı buraya yazın..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 h-48 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 font-medium shadow-sm transition-all resize-none"
                        required
                    />
                </div>

                {/* Drag & Drop Dosya Yükleme */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                        Ek Dosyalar <span className="text-slate-400 font-normal">(İsteğe bağlı — maks. 5 dosya, her biri 25MB)</span>
                    </label>
                    <div
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-slate-400">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <p className="text-slate-700 font-bold mb-1">
                            Dosyaları buraya sürükleyin veya{' '}
                            <label className="text-emerald-600 hover:text-emerald-700 cursor-pointer underline">
                                göz atın
                                <input type="file" multiple className="hidden" onChange={handleFileInput} />
                            </label>
                        </p>
                        <p className="text-slate-400 font-semibold text-sm">
                            {selectedFiles.length}/5 dosya seçildi
                        </p>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Folder className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        <span className="text-sm font-semibold text-slate-700 truncate" title={file.name}>{file.name}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeSelectedFile(index)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Gönder Butonu */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 text-lg"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            Gönderiliyor...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" /> Duyuruyu Fırlat
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
