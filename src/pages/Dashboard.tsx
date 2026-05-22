import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import type { Student } from '../types/student';
import type { Parent } from '../types/parent'; // 🚀 Veli şablonunu çağırdık

export default function Dashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<Parent[]>([]); // 🚀 Veliler için yeni ambar
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<number | null>(null);

    // Form deposuna parentId eklendi
    const [studentForm, setStudentForm] = useState({
        schoolNumber: '',
        firstName: '',
        lastName: '',
        parentId: ''
    });

    useEffect(() => {
        fetchStudents();
        fetchParents(); // 🚀 Sayfa açılınca velileri de çek
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/students');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 🚀 Java'nın tam beklediği JSON paketini (payload) hazırlıyoruz
            // Eğer parentId seçilmişse onu nesne olarak gönder, seçilmemişse null gönder
            const payload = {
                schoolNumber: studentForm.schoolNumber,
                firstName: studentForm.firstName,
                lastName: studentForm.lastName,
                parent: studentForm.parentId ? { id: Number(studentForm.parentId) } : null
            };

            if (editId) {
                await api.put(`/students/${editId}`, payload);
                alert("Öğrenci başarıyla güncellendi! ✏️");
            } else {
                await api.post('/students', payload);
            }

            setStudentForm({ schoolNumber: '', firstName: '', lastName: '', parentId: '' });
            setEditId(null);
            fetchStudents(); // Form gönderilince tabloyu tazelemek en sağlam yoldur
        } catch (error) {
            console.error("İşlem başarısız!", error);
            alert("Hata oluştu!");
        }
    };

    const handleEditClick = (student: Student) => {
        setEditId(student.id);
        setStudentForm({
            schoolNumber: student.schoolNumber,
            firstName: student.firstName,
            lastName: student.lastName,
            // 🚀 YENİ: Artık DTO'dan parentId geliyor! Varsa metne çevirip forma koy, yoksa boş bırak.
            parentId: student.parentId ? student.parentId.toString() : ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <div>
            <Navbar />
            <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
                <h2>🎓 Öğrenci Yönetim Paneli</h2>

                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                    <h3>{editId ? "✏️ Öğrenciyi Düzenle" : "➕ Yeni Öğrenci Ekle"}</h3>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text" placeholder="Okul No" required value={studentForm.schoolNumber}
                            onChange={(e) => setStudentForm({ ...studentForm, schoolNumber: e.target.value })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <input
                            type="text" placeholder="Ad" required value={studentForm.firstName}
                            onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <input
                            type="text" placeholder="Soyad" required value={studentForm.lastName}
                            onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />

                        {/* 🚀 YENİ: Veli Seçim Menüsü */}
                        <select
                            value={studentForm.parentId}
                            onChange={(e) => setStudentForm({ ...studentForm, parentId: e.target.value })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                        >
                            <option value="">Veli Seçiniz (İsteğe Bağlı)</option>
                            {parents.map((parent) => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.firstName} {parent.lastName}
                                </option>
                            ))}
                        </select>

                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: editId ? '#3498db' : '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {editId ? "Güncelle" : "Ekle"}
                        </button>
                        {editId && (
                            <button type="button" onClick={() => { setEditId(null); setStudentForm({ schoolNumber: '', firstName: '', lastName: '', parentId: '' }); }} style={{ padding: '8px 15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                İptal
                            </button>
                        )}
                    </form>
                </div>

                {loading ? (
                    <p>📡 Java Kalesinden veriler bekleniyor...</p>
                ) : (
                    <table border={1} style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '10px' }}>ID</th>
                                <th style={{ padding: '10px' }}>Okul No</th>
                                <th style={{ padding: '10px' }}>Ad</th>
                                <th style={{ padding: '10px' }}>Soyad</th>
                                {/* 🚀 Tabloya Veli Sütunu Eklendi */}
                                <th style={{ padding: '10px' }}>Veli</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td style={{ padding: '10px' }}>{student.id}</td>
                                    <td style={{ padding: '10px' }}>{student.schoolNumber}</td>
                                    <td style={{ padding: '10px' }}>{student.firstName}</td>
                                    <td style={{ padding: '10px' }}>{student.lastName}</td>
                                    {/* 🚀 Eğer veli varsa adını yazdır, yoksa "Atanmadı" yaz */}
                                    <td style={{ padding: '10px' }}>
                                        {student.parentFullName}
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <button onClick={() => handleEditClick(student)} style={{ backgroundColor: '#f1c40f', color: '#333', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}>
                                            Düzenle
                                        </button>
                                        <button onClick={() => handleDeleteStudent(student.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}