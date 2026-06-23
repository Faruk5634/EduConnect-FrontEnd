import { useEffect, useState } from 'react';
import { api } from '../services/api';

interface Teacher {
    id: number;
    firstName: string;
    lastName: string;
    branch: string;
    homeroomClasses?: { id: number; name: string }[];
}

export default function TeacherTab() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // 🚀 YENİ: Düzenleme modunu takip edecek state
    const [editId, setEditId] = useState<number | null>(null);

    const [teacherForm, setTeacherForm] = useState({
        firstName: '',
        lastName: '',
        branch: ''
    });

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/teachers');
            setTeachers(response.data);
        } catch (error) {
            console.error("Öğretmenler çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchTeachers();
            return;
        }
        try {
            setLoading(true);
            const response = await api.get(`/teachers/search?branch=${searchTerm}`);
            setTeachers(response.data);
        } catch (error) {
            console.error("Arama başarısız:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                firstName: teacherForm.firstName,
                lastName: teacherForm.lastName,
                branch: teacherForm.branch
            };

            // 🚀 YENİ: Edit ID varsa Güncelle (PUT), yoksa Yeni Ekle (POST)
            if (editId) {
                await api.put(`/teachers/${editId}`, payload);
                alert("Öğretmen başarıyla güncellendi! ✏️");
            } else {
                await api.post('/teachers', payload);
                alert("Öğretmen başarıyla eklendi! 👨‍🏫");
            }

            closeModal();
            fetchTeachers();
        } catch (error) {
            alert("İşlem başarısız! Sunucuyla bağlantı kurulamadı.");
        }
    };

    // 🚀 YENİ: Düzenleme Butonuna Tıklanınca
    const handleEditClick = (teacher: Teacher) => {
        setEditId(teacher.id);
        setTeacherForm({
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            branch: teacher.branch
        });
        setIsModalOpen(true);
    };

    // 🚀 YENİ: Silme Butonuna Tıklanınca
    const handleDeleteTeacher = async (id: number) => {
        if (!window.confirm("Bu öğretmeni silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/teachers/${id}`);
            setTeachers(teachers.filter(t => t.id !== id)); // Listeden anında uçur
        } catch (error) {
            alert("Silme işlemi başarısız!");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditId(null); // Kapatırken edit modunu sıfırla
        setTeacherForm({ firstName: '', lastName: '', branch: '' });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text" placeholder="Branşa Göre Ara (Örn: Matematik)" value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '250px' }}
                    />
                    <button onClick={handleSearch} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        🔍 Ara
                    </button>
                </div>
                <button onClick={() => setIsModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ➕ Yeni Öğretmen Ekle
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>📡 Makine dairesinden veriler çekiliyor...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>ID</th>
                            <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>Ad Soyad</th>
                            <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>Branş</th>
                            <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>Sorumlu Sınıf</th>
                            <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {teachers.map((teacher) => (
                            <tr key={teacher.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '14px', fontWeight: 'bold', color: '#64748b' }}>#{teacher.id}</td>
                                <td style={{ padding: '14px', fontWeight: '500' }}>{teacher.firstName} {teacher.lastName}</td>
                                <td style={{ padding: '14px' }}>
                                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                                            {teacher.branch}
                                        </span>
                                </td>
                                <td style={{ padding: '14px', color: '#64748b', fontWeight: '500' }}>
                                    {teacher.homeroomClasses && teacher.homeroomClasses.length > 0
                                        ? teacher.homeroomClasses.map(c => c.name).join(', ')
                                        : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Atanmadı</span>}
                                </td>
                                {/* 🚀 YENİ: İşlem Butonları */}
                                <td style={{ padding: '14px', textAlign: 'center' }}>
                                    <button onClick={() => handleEditClick(teacher)} style={{ marginRight: '8px', padding: '8px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        ✏️
                                    </button>
                                    <button onClick={() => handleDeleteTeacher(teacher.id)} style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {teachers.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Henüz öğretmen bulunamadı.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <h3 style={{ marginTop: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', color: '#1e293b' }}>
                            {editId ? '✏️ Öğretmen Düzenle' : '➕ Yeni Öğretmen Ekle'}
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input type="text" placeholder="Ad" required value={teacherForm.firstName} onChange={e => setTeacherForm({...teacherForm, firstName: e.target.value})} style={inputStyle} />
                            <input type="text" placeholder="Soyad" required value={teacherForm.lastName} onChange={e => setTeacherForm({...teacherForm, lastName: e.target.value})} style={inputStyle} />
                            <input type="text" placeholder="Branş (Örn: Fizik, Tarih)" required value={teacherForm.branch} onChange={e => setTeacherForm({...teacherForm, branch: e.target.value})} style={inputStyle} />

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>İptal</button>
                                <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {editId ? 'Değişiklikleri Kaydet' : 'Öğretmeni Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' };