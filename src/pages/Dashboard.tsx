import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import type { Student } from '../types/student';

export default function Dashboard() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const [newStudent, setNewStudent] = useState({
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

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/students', newStudent);
            setStudents([...students, response.data]);
            setNewStudent({ schoolNumber: '', firstName: '', lastName: '' });
        } catch (error) {
            console.error("Öğrenci eklenirken hata oluştu!", error);
            alert("Öğrenci eklenemedi! (CORS veya Sunucu hatası olabilir)");
        }
    };

    // 🚀 YENİ: Öğrenci Silme Fonksiyonu (DELETE)
    const handleDeleteStudent = async (id: number) => {
        // 1. Kullanıcıya "Emin misin?" diye soruyoruz
        const isConfirmed = window.confirm("Bu öğrenciyi silmek istediğinize emin misiniz?");
        if (!isConfirmed) return; // İptale basarsa işlemi durdur

        try {
            // 2. Java kalesine "Bu ID'li öğrenciyi yok et" emrini gönderiyoruz
            await api.delete(`/students/${id}`);

            // 3. Ekranda anında yok olması için sildiğimiz öğrenciyi listeden filtreleyip çıkarıyoruz
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
                    <h3>Yeni Öğrenci Ekle</h3>
                    <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Okul No"
                            value={newStudent.schoolNumber}
                            onChange={(e) => setNewStudent({ ...newStudent, schoolNumber: e.target.value })}
                            required
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <input
                            type="text"
                            placeholder="Ad"
                            value={newStudent.firstName}
                            onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                            required
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <input
                            type="text"
                            placeholder="Soyad"
                            value={newStudent.lastName}
                            onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                            required
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Ekle
                        </button>
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
                                {/* 🚀 YENİ: İşlemler Sütunu */}
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
                                    {/* 🚀 YENİ: Sil Butonu */}
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
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