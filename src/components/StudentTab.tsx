import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Student } from '../types/student';
import type { Parent } from '../types/parent';

// 🚀 YENİ: Sınıf verilerini karşılamak için geçici bir tip tanımı
interface Classroom {
    id: number;
    name: string;
    gradeLevel: number;
}

export default function StudentTab() {
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<Parent[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]); // 🚀 YENİ: Sınıfları tutacağımız state
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editId, setEditId] = useState<number | null>(null);

    const [studentForm, setStudentForm] = useState({
        username: '', password: '', schoolNumber: '', grade: '',
        firstName: '', lastName: '', parentId: ''
    });

    useEffect(() => {
        fetchStudents();
        fetchParents();
        fetchClassrooms(); // 🚀 YENİ: Sayfa açıldığında sınıfları da çek
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/students/list');
            setStudents(response.data);
        } catch (error) {
            console.error("Öğrenciler çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchParents = async () => {
        try {
            const response = await api.get('/parents');
            setParents(response.data);
        } catch (error) {
            console.error("Veliler çekilemedi:", error);
        }
    };

    // 🚀 YENİ: Backend'den Sınıfları Çeken Fonksiyon
    const fetchClassrooms = async () => {
        try {
            const response = await api.get('/classrooms');
            setClassrooms(response.data);
        } catch (error) {
            console.error("Sınıflar çekilemedi:", error);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchStudents();
            return;
        }
        try {
            setLoading(true);
            const response = await api.get(`/students/search?firstName=${searchTerm}`);
            setStudents(response.data);
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
                username: studentForm.username,
                password: studentForm.password,
                schoolNumber: studentForm.schoolNumber,
                grade: studentForm.grade, // 🚀 Backend'e seçilen sınıfın adını (Örn: "10-A") gönderiyoruz
                firstName: studentForm.firstName,
                lastName: studentForm.lastName,
                parentId: studentForm.parentId ? Number(studentForm.parentId) : null
            };

            if (editId) {
                await api.put(`/students/${editId}`, payload);
                alert("Öğrenci başarıyla güncellendi! ✏️");
            } else {
                await api.post('/students/create', payload);
                alert("Öğrenci başarıyla eklendi! 🎓");
            }

            closeModal();
            fetchStudents();
        } catch (error) {
            alert("İşlem başarısız! Kullanıcı adı veya okul no kullanılıyor olabilir.");
        }
    };

    const handleEditClick = (student: Student) => {
        setEditId(student.id);
        setStudentForm({
            username: student.username || '',
            password: '',
            schoolNumber: student.schoolNumber,
            grade: student.grade || '',
            firstName: student.firstName,
            lastName: student.lastName,
            parentId: student.parentId ? student.parentId.toString() : ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteStudent = async (id: number) => {
        if (!window.confirm("Bu öğrenciyi silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/students/${id}`);
            setStudents(students.filter(s => s.id !== id));
        } catch (error) {
            alert("Silme işlemi başarısız!");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditId(null);
        setStudentForm({ username: '', password: '', schoolNumber: '', grade: '', firstName: '', lastName: '', parentId: '' });
    };

    return (
        <div>
            {/* ÜST BAR: Arama Çubuğu ve Yeni Ekle Butonu */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="İsme Göre Ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '250px' }}
                    />
                    <button onClick={handleSearch} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        🔍 Ara
                    </button>
                </div>
                <button onClick={() => setIsModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ➕ Yeni Öğrenci Ekle
                </button>
            </div>

            {/* TABLO */}
            {loading ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>📡 Makine dairesinden veriler çekiliyor...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>Okul No</th>
                            <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>Ad Soyad</th>
                            <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>Sınıf</th>
                            <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>Veli</th>
                            <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {students.map((student) => (
                            <tr key={student.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '14px' }}>{student.schoolNumber}</td>
                                <td style={{ padding: '14px', fontWeight: '500' }}>{student.firstName} {student.lastName}</td>
                                <td style={{ padding: '14px' }}>{student.grade || '-'}</td>
                                <td style={{ padding: '14px', color: '#64748b' }}>{student.parentFullName || 'Atanmadı'}</td>
                                <td style={{ padding: '14px', textAlign: 'center' }}>
                                    <button onClick={() => handleEditClick(student)} style={{ marginRight: '8px', padding: '8px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        ✏️
                                    </button>
                                    <button onClick={() => handleDeleteStudent(student.id)} style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Henüz öğrenci bulunamadı.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* AÇILIR PENCERE (MODAL) FORM */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <h3 style={{ marginTop: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', color: '#1e293b' }}>
                            {editId ? '✏️ Öğrenci Düzenle' : '➕ Yeni Öğrenci Ekle'}
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" placeholder="Ad" required value={studentForm.firstName} onChange={e => setStudentForm({...studentForm, firstName: e.target.value})} style={inputStyle} />
                                <input type="text" placeholder="Soyad" required value={studentForm.lastName} onChange={e => setStudentForm({...studentForm, lastName: e.target.value})} style={inputStyle} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" placeholder="Okul No" required value={studentForm.schoolNumber} onChange={e => setStudentForm({...studentForm, schoolNumber: e.target.value})} style={inputStyle} />

                                {/* 🚀 YENİ: Manuel giriş yerine Açılır Menü (Select) */}
                                <select
                                    required
                                    value={studentForm.grade}
                                    onChange={e => setStudentForm({...studentForm, grade: e.target.value})}
                                    style={inputStyle}
                                >
                                    <option value="">Sınıf Seçiniz</option>
                                    {classrooms.map(cls => (
                                        <option key={cls.id} value={cls.name}>{cls.name} (Derece: {cls.gradeLevel})</option>
                                    ))}
                                </select>
                            </div>

                            <input type="text" placeholder="Kullanıcı Adı (Giriş İçin)" required value={studentForm.username} onChange={e => setStudentForm({...studentForm, username: e.target.value})} style={inputStyle} />
                            {!editId && <input type="password" placeholder="Şifre" required value={studentForm.password} onChange={e => setStudentForm({...studentForm, password: e.target.value})} style={inputStyle} />}

                            <select value={studentForm.parentId} onChange={e => setStudentForm({...studentForm, parentId: e.target.value})} style={inputStyle}>
                                <option value="">Veli Seçiniz (İsteğe Bağlı)</option>
                                {parents.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                            </select>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>İptal</button>
                                <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{editId ? 'Değişiklikleri Kaydet' : 'Öğrenciyi Kaydet'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Girdi alanları için ortak stil
const inputStyle = { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' };