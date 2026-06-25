import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

// --- ŞABLONLAR (INTERFACES) ---
interface Announcement {
    id: number;
    title: string;
    content: string;
    createdDate: string;
    authorName: string;
    type: string;
    classroomName: string;
    fileName?: string; // 🚀 EKLENDİ
    fileUrl?: string;  // 🚀 EKLENDİ
}

interface Classroom {
    id: number;
    name: string;
    gradeLevel: number;
}

export default function AnnouncementTab() {
    // --- STATE'LER ---
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Yeni duyuru formu state'i
    const [form, setForm] = useState({
        title: '',
        content: '',
        type: 'GENERAL',
        classroomId: ''
    });

    // 🚀 YENİ: Dosya tutucu State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchAnnouncements();
        fetchClassrooms();
    }, []);

    // --- VERİ ÇEKME İŞLEMLERİ ---
    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await api.get('/announcements');
            // En yeniden en eskiye sıralayalım
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

    // --- DUYURU OLUŞTURMA İŞLEMİ (GÜNCELLENDİ) ---
    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 🚀 ARTIK JSON DEĞİL, FORMDATA (Çok Parçalı) GÖNDERİYORUZ
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('content', form.content);
            formData.append('type', form.type);

            if (form.classroomId) {
                formData.append('classroomId', form.classroomId);
            }

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            await api.post('/announcements/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert("Duyuru başarıyla yayınlandı! 📢");
            setIsCreateModalOpen(false);
            setForm({ title: '', content: '', type: 'GENERAL', classroomId: '' });
            setSelectedFile(null); // Dosyayı sıfırla
            fetchAnnouncements();
        } catch (error) {
            alert("Duyuru yayınlanırken bir hata oluştu!");
            console.error(error);
        }
    };

    const translateType = (type: string) => {
        switch (type) {
            case 'HOMEWORK': return '📚 Ödev';
            case 'EXAM_INFO': return '📝 Sınav Bilgisi';
            case 'EXAM_RESULT': return '💯 Sınav Sonucu';
            case 'EVENT': return '🎉 Etkinlik';
            case 'GENERAL': return '📢 Genel Duyuru';
            default: return type;
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>📢 Pano ve Duyurular</h3>
                <button onClick={() => setIsCreateModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ➕ Yeni Duyuru Yayınla
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>📡 Makine dairesinden duyurular çekiliyor...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {announcements.map((ann) => (
                        <div key={ann.id} style={{ backgroundColor: 'white', borderLeft: '5px solid #3b82f6', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px' }}>{ann.title}</h2>
                                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                                    {translateType(ann.type)}
                                </span>
                            </div>
                            <p style={{ margin: '10px 0', color: '#334155', lineHeight: '1.6' }}>{ann.content}</p>

                            {/* 🚀 EKLİ DOSYA VARSA GÖSTER */}
                            {ann.fileUrl && (
                                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1', display: 'inline-block' }}>
                                    <span style={{ marginRight: '10px' }}>📎 <strong>Ek:</strong> {ann.fileName}</span>
                                    {/* Backend'in adresini buraya bağlıyoruz (Geliştirme aşaması için localhost:8080 varsayılmıştır) */}
                                    <a href={`http://localhost:8080${ann.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
                                        İndir / Görüntüle
                                    </a>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b' }}>
                                <div>
                                    <strong>✍️ Yazar:</strong> {ann.authorName} <br/>
                                    <strong>🎯 Hedef:</strong> <span style={{ color: ann.classroomName === "Genel Duyuru" ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>{ann.classroomName}</span>
                                </div>
                                <div>
                                    <strong>🕒 Tarih:</strong> {new Date(ann.createdDate).toLocaleString('tr-TR')}
                                </div>
                            </div>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                            Pano şu an bomboş. Henüz hiçbir duyuru yayınlanmamış.
                        </div>
                    )}
                </div>
            )}

            {isCreateModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <h3 style={{ marginTop: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', color: '#1e293b' }}>
                            ➕ Yeni Duyuru Yayınla
                        </h3>

                        <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>

                            <input type="text" placeholder="Duyuru Başlığı" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} />

                            <textarea placeholder="Duyuru İçeriği..." required value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select required value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inputStyle}>
                                    <option value="GENERAL">📢 Genel Duyuru</option>
                                    <option value="HOMEWORK">📚 Ödev</option>
                                    <option value="EXAM_INFO">📝 Sınav Bilgisi</option>
                                    <option value="EXAM_RESULT">💯 Sınav Sonucu</option>
                                    <option value="EVENT">🎉 Etkinlik</option>
                                </select>

                                <select value={form.classroomId} onChange={e => setForm({...form, classroomId: e.target.value})} style={inputStyle}>
                                    <option value="">🌐 Tüm Okula (Genel)</option>
                                    {classrooms.map(cls => (
                                        <option key={cls.id} value={cls.id}>Sadece {cls.name} Sınıfına</option>
                                    ))}
                                </select>
                            </div>

                            {/* 🚀 YENİ: DOSYA YÜKLEME ALANI */}
                            <div style={{ border: '1px dashed #cbd5e1', padding: '15px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>
                                    📎 Dosya Ekle (İsteğe Bağlı)
                                </label>
                                <input
                                    type="file"
                                    onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                    style={{ fontSize: '14px' }}
                                />
                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '5px 0 0 0' }}>PDF, Word veya Resim formatında dosyalar yükleyebilirsiniz.</p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setSelectedFile(null); }} style={{ flex: 1, padding: '12px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>İptal</button>
                                <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Yayınla 🚀</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputStyle = { width: '100%', boxSizing: 'border-box' as const, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' };