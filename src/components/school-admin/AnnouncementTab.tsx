import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface Announcement {
    id: number;
    title: string;
    content: string;
    createdDate: string;
    authorName: string;
    type: string;
    classroomName: string;
}

interface Classroom {
    id: number;
    name: string;
}

export default function AnnouncementTab() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', type: 'GENERAL', classroomId: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchAnnouncements();
        fetchClassrooms();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await api.get('/announcements');
            const sorted = response.data.sort((a: Announcement, b: Announcement) =>
                new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
            );
            setAnnouncements(sorted);
        } catch (error) {
            console.error("Duyurular çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassrooms = async () => {
        try {
            const response = await api.get('/classrooms');
            setClassrooms(response.data);
        } catch (error) {
            console.error("Sınıflar çekilemedi:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bu duyuruyu yayından kaldırmak istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/announcements/${id}`);
            fetchAnnouncements();
        } catch (error) {
            alert("Duyuru kaldırılamadı!");
        }
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('content', form.content);
        formData.append('type', form.type);
        if (form.classroomId) formData.append('classroomId', form.classroomId);
        if (selectedFile) formData.append('file', selectedFile);

        try {
            await api.post('/announcements/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert("Duyuru başarıyla yayınlandı! 📢");
            setIsCreateModalOpen(false);
            setForm({ title: '', content: '', type: 'GENERAL', classroomId: '' });
            setSelectedFile(null);
            fetchAnnouncements();
        } catch (error) {
            alert("Duyuru yayınlanırken hata oluştu!");
        }
    };

    return (
        <div className="animate-fade-in-down h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">📢 Okul Duyuru Panosu</h2>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all">
                    ➕ Yeni Duyuru
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400 font-medium">Yükleniyor...</div>
            ) : (
                <div className="grid gap-6">
                    {announcements.map((ann) => (
                        <div key={ann.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
                            <button onClick={() => handleDelete(ann.id)} className="absolute top-4 right-4 text-red-500 font-bold text-xs">SİL</button>
                            <h3 className="text-lg font-bold text-slate-800">{ann.title}</h3>
                            <p className="text-slate-600 my-4 text-sm">{ann.content}</p>
                            <div className="text-xs font-bold text-slate-400">✍️ {ann.authorName} | 🎯 {ann.classroomName || 'Genel'}</div>
                        </div>
                    ))}
                </div>
            )}

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl w-full max-w-lg">
                        <h3 className="font-bold text-lg mb-4">Yeni Duyuru</h3>
                        <form onSubmit={handleCreateAnnouncement} className="flex flex-col gap-4">
                            <input required className="border p-2" placeholder="Başlık" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                            <textarea required className="border p-2" placeholder="İçerik" value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="border p-2">
                                <option value="GENERAL">Genel</option>
                                <option value="HOMEWORK">Ödev</option>
                            </select>
                            <select value={form.classroomId} onChange={e => setForm({...form, classroomId: e.target.value})} className="border p-2">
                                <option value="">Genel Duyuru</option>
                                {classrooms.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                            </select>
                            <input type="file" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded">Yayınla</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}