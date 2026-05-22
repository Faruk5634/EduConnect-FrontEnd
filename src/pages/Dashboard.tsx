import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import type { Student } from '../types/student';

export default function Dashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    // 🚀 YENİ: Hangi öğrenciyi düzenlediğimizi aklımızda tutacağımız hafıza (ID)
    // Eğer null ise "Yeni Ekleme" modundayız, eğer bir ID varsa "Güncelleme" modundayız demektir.
    const [editId, setEditId] = useState<number | null>(null);

    const [studentForm, setStudentForm] = useState({
        schoolNumber: '',
        firstName: '',
        lastName: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/students');
            setStudents(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Öğrenciler çekilirken bir hata oluştu: ", error);
            setLoading(false);
        }
    };

    // 🚀 YENİ: Hem Ekleme (POST) hem Güncelleme (PUT) işini yapan Zeki Fonksiyon
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                // --- GÜNCELLEME MODU ---
                await api.put(`/students/${editId}`, studentForm);

                // Tablodaki eski veriyi, formdaki yeni veriyle değiştiriyoruz
                setStudents(students.map(student =>
                    student.id === editId ? { ...studentForm, id: editId } : student
                ));

                setEditId(null); // Güncelleme bitti, hafızayı sıfırla
                alert("Öğrenci başarıyla güncellendi! ✏️");

            } else {
                // --- YENİ EKLEME MODU ---
                const response = await api.post('/students', studentForm);
                setStudents([...students, response.data]);
            }

            // İşlem bitince formu tertemiz yap
            setStudentForm({ schoolNumber: '', firstName: '', lastName: '' });

        } catch (error) {
            console.error("İşlem sırasında hata oluştu!", error);
            alert("İşlem başarısız! Sunucu hatası olabilir.");
        }
    };

    // 🚀 YENİ: Düzenle Butonuna basınca çalışacak fonksiyon
    const handleEditClick = (student: Student) => {
        setEditId(student.id); // Hafızaya ID'yi yaz (Böylece Güncelleme moduna geçeriz)
        setStudentForm({       // Formun içini öğrencinin eski bilgileriyle doldur
            schoolNumber: student.schoolNumber,
            firstName: student.firstName,
            lastName: student.lastName
        });
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Ekranı yavaşça en üste kaydır
    };

    const handleDeleteStudent = async (id: number) => {
        const isConfirmed = window.confirm("Bu öğrenciyi silmek istediğinize emin misiniz?");
        if (!isConfirmed) return;

        try {
            await api.delete(`/students/${id}`);
            setStudents(students.filter(student => student.id !== id));
        } catch (error) {
            console.error("Öğrenci silinirken hata oluştu!", error);
            alert("Silme işlemi başarısız oldu!");
        }
    };

    return (
        <div>
            <Navbar />

            <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
                <h2>🎓 Öğrenci Yönetim Paneli</h2>

                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                    {/* 🚀 Başlık dinamik değişiyor */}
                    <h3>{editId ? "✏️ Öğrenciyi Düzenle" : "➕ Yeni Öğrenci Ekle"}</h3>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text" placeholder="Okul No" required
                            value={studentForm.schoolNumber}
                            onChange={(e) => setStudentForm({ ...studentForm, schoolNumber: e.target.value })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <input
                            type="text" placeholder="Ad" required
                            value={studentForm.firstName}
                            onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <input
                            type="text" placeholder="Soyad" required
                            value={studentForm.lastName}
                            onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />

                        {/* 🚀 Buton rengi ve yazısı duruma göre değişiyor */}
                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: editId ? '#3498db' : '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {editId ? "Güncelle" : "Ekle"}
                        </button>

                        {/* 🚀 Eğer düzenleme modundaysak, vazgeçme butonu çıkar */}
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); setStudentForm({ schoolNumber: '', firstName: '', lastName: '' }); }}
                                style={{ padding: '8px 15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
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
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        {/* 🚀 YENİ: Düzenle Butonu */}
                                        <button
                                            onClick={() => handleEditClick(student)}
                                            style={{ backgroundColor: '#f1c40f', color: '#333', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}
                                        >
                                            Düzenle
                                        </button>

                                        <button
                                            onClick={() => handleDeleteStudent(student.id)}
                                            style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
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