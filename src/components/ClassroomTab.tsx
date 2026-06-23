import { useEffect, useState } from 'react';
import { api } from '../services/api';

// --- ŞABLONLAR (INTERFACES) ---
interface Classroom {
    id: number;
    name: string;
    gradeLevel: number;
    homeroomTeacherFullName: string;
    studentNames: string[];
}

interface Teacher {
    id: number;
    firstName: string;
    lastName: string;
    branch: string;
}

// Öğrenci işlemlerini burada yapabilmek için Student şablonunu ekledik
interface Student {
    id: number;
    firstName: string;
    lastName: string;
    schoolNumber: string;
    grade: string;
    parentFullName: string;
}

export default function ClassroomTab() {
    // --- ANA EKRAN STATE'LERİ ---
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // --- DETAY EKRANI STATE'LERİ ---
    const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
    const [classStudents, setClassStudents] = useState<Student[]>([]);
    const [classForm, setClassForm] = useState({ name: '', gradeLevel: '', teacherId: '' });

    useEffect(() => {
        fetchClassrooms();
        fetchTeachers();
    }, []);

    // --- VERİ ÇEKME İŞLEMLERİ ---
    const fetchClassrooms = async () => {
        setLoading(true);
        try {
            const response = await api.get('/classrooms');
            setClassrooms(response.data);
        } catch (error) {
            console.error("Sınıflar çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await api.get('/teachers');
            setTeachers(response.data);
        } catch (error) {
            console.error("Öğretmenler çekilemedi:", error);
        }
    };

    // Sınıfın içine girildiğinde sadece o sınıfın öğrencilerini getiren zeki filtre!
    const fetchClassStudents = async (className: string) => {
        try {
            const response = await api.get('/students/list');
            // Gelen tüm öğrencilerden, sınıfı (grade) bu sınıfın adına eşit olanları ayıkla
            const filtered = response.data.filter((s: Student) => s.grade === className);
            setClassStudents(filtered);
        } catch (error) {
            console.error("Öğrenciler çekilemedi:", error);
        }
    };

    // --- SINIF OLUŞTURMA VE GÜNCELLEME İŞLEMLERİ ---
    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/classrooms', { name: classForm.name, gradeLevel: Number(classForm.gradeLevel) });
            alert("Sınıf başarıyla oluşturuldu! 🏫");
            setIsCreateModalOpen(false);
            setClassForm({ name: '', gradeLevel: '', teacherId: '' });
            fetchClassrooms();
        } catch (error) {
            alert("İşlem başarısız!");
        }
    };

    const handleUpdateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) return;
        try {
            let url = `/classrooms/${selectedClass.id}`;
            if (classForm.teacherId) url += `?teacherId=${classForm.teacherId}`;

            await api.put(url, { name: classForm.name, gradeLevel: Number(classForm.gradeLevel) });
            alert("Sınıf bilgileri ve öğretmen ataması güncellendi! ✅");
            fetchClassrooms();

            // Güncel veriyi yansıtmak için seçili sınıfın adını da güncelle
            setSelectedClass({ ...selectedClass, name: classForm.name, gradeLevel: Number(classForm.gradeLevel) });
        } catch (error) {
            alert("Güncelleme başarısız!");
        }
    };

    const handleDeleteClass = async () => {
        if (!selectedClass) return;
        if (!window.confirm("Bu sınıfı tamamen silmek istediğinize emin misiniz? (Öğrenciler silinmez, sadece sınıf kaydı silinir)")) return;
        try {
            await api.delete(`/classrooms/${selectedClass.id}`);
            setSelectedClass(null); // Detay ekranından çık
            fetchClassrooms(); // Listeyi yenile
        } catch (error) {
            alert("Sınıf silinemedi!");
        }
    };

    const handleDeleteStudent = async (id: number) => {
        if (!window.confirm("Bu öğrenciyi sistemden tamamen silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/students/${id}`);
            // Listeden anında uçur
            setClassStudents(classStudents.filter(s => s.id !== id));
        } catch (error) {
            alert("Öğrenci silinemedi!");
        }
    };

    // --- KARTA TIKLAMA (DETAYA GİRİŞ) ---
    const handleCardClick = (cls: Classroom) => {
        setSelectedClass(cls);

        // Öğretmen ID'sini isimden bulup formun default değeri yapma zekası
        const currentTeacher = teachers.find(t => `${t.firstName} ${t.lastName}` === cls.homeroomTeacherFullName);

        setClassForm({
            name: cls.name,
            gradeLevel: cls.gradeLevel.toString(),
            teacherId: currentTeacher ? currentTeacher.id.toString() : ''
        });

        fetchClassStudents(cls.name); // İçeri girer girmez o sınıfın öğrencilerini çağır
    };


    // ==========================================
    // EKRAN 1: DETAYLI SINIF YÖNETİMİ (İÇERİSİ)
    // ==========================================
    if (selectedClass) {
        return (
            <div style={{ animation: 'fadeIn 0.3s' }}>
                {/* Üst Bar: Geri Butonu ve Başlık */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
                    <button
                        onClick={() => setSelectedClass(null)}
                        style={{ padding: '10px 15px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ⬅️ Sınıflara Dön
                    </button>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>🏫 {selectedClass.name} Sınıfı Yönetim Paneli</h2>
                </div>

                {/* Sınıf Bilgileri ve Öğretmen Atama Kutusu */}
                <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                    <h3 style={{ marginTop: 0, color: '#3b82f6', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                        ⚙️ Sınıf Ayarları ve Rehber Öğretmen
                    </h3>
                    <form onSubmit={handleUpdateClass} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Sınıf Adı</label>
                            <input type="text" value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value})} style={inputStyle} required />
                        </div>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Derece (Örn: 9, 10)</label>
                            <input type="number" value={classForm.gradeLevel} onChange={e => setClassForm({...classForm, gradeLevel: e.target.value})} style={inputStyle} required />
                        </div>
                        <div style={{ flex: 2, minWidth: '250px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Rehber Öğretmen Ataması</label>
                            <select value={classForm.teacherId} onChange={e => setClassForm({...classForm, teacherId: e.target.value})} style={inputStyle}>
                                <option value="">👨‍🏫 Öğretmen Atanmadı (Seçiniz...)</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.branch})</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                💾 Kaydet
                            </button>
                            <button type="button" onClick={handleDeleteClass} style={{ padding: '12px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                🗑️ Sınıfı Sil
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sınıf Öğrencileri Tablosu */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, color: '#10b981', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                        🎓 Bu Sınıftaki Öğrenciler ({classStudents.length} Kişi)
                    </h3>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '14px' }}>Okul No</th>
                                <th style={{ padding: '14px' }}>Ad Soyad</th>
                                <th style={{ padding: '14px' }}>Veli</th>
                                <th style={{ padding: '14px', textAlign: 'center' }}>İşlem</th>
                            </tr>
                            </thead>
                            <tbody>
                            {classStudents.map(student => (
                                <tr key={student.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '14px', fontWeight: 'bold' }}>{student.schoolNumber}</td>
                                    <td style={{ padding: '14px' }}>{student.firstName} {student.lastName}</td>
                                    <td style={{ padding: '14px', color: '#64748b' }}>{student.parentFullName || 'Atanmadı'}</td>
                                    <td style={{ padding: '14px', textAlign: 'center' }}>
                                        <button onClick={() => handleDeleteStudent(student.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                                            Sistemden Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {classStudents.length === 0 && (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Bu sınıfa henüz öğrenci kaydedilmemiş.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // EKRAN 2: ANA LİSTE (KART GÖRÜNÜMÜ)
    // ==========================================
    return (
        <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>🏫 Mevcut Sınıflar</h3>
                <button onClick={() => setIsCreateModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ➕ Yeni Sınıf Oluştur
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>📡 Makine dairesinden sınıflar çekiliyor...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {classrooms.map((cls) => (
                        <div
                            key={cls.id}
                            onClick={() => handleCardClick(cls)}
                            style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
                                <h2 style={{ margin: 0, color: '#3b82f6', fontSize: '24px' }}>{cls.name}</h2>
                                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                                    {cls.gradeLevel}. Sınıf
                                </span>
                            </div>

                            <p style={{ margin: '5px 0', color: '#475569', fontSize: '15px' }}>
                                <strong>👨‍🏫 Rehber Öğretmen:</strong> <br/>
                                {cls.homeroomTeacherFullName !== "Rehber Öğretmen Atanmadı"
                                    ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>{cls.homeroomTeacherFullName}</span>
                                    : <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Atanmadı</span>}
                            </p>

                            <p style={{ margin: '15px 0 5px 0', color: '#475569', fontSize: '15px' }}>
                                <strong>🎓 Öğrenci Sayısı:</strong> {cls.studentNames ? cls.studentNames.length : 0} Kişi
                            </p>

                            <div style={{ position: 'absolute', bottom: '15px', right: '20px', color: '#3b82f6', fontSize: '13px', fontWeight: 'bold' }}>
                                Yönetmek için tıkla ➡️
                            </div>
                        </div>
                    ))}
                    {classrooms.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                            Henüz hiçbir sınıf oluşturulmamış.
                        </div>
                    )}
                </div>
            )}

            {/* YENİ SINIF OLUŞTURMA PENCERESİ */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <h3 style={{ marginTop: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', color: '#1e293b' }}>
                            ➕ Yeni Sınıf Oluştur
                        </h3>
                        <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input type="text" placeholder="Sınıf Adı (Örn: 10-A, 11-B)" required value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value})} style={inputStyle} />
                            <input type="number" placeholder="Sınıf Derecesi (Örn: 10, 11)" required value={classForm.gradeLevel} onChange={e => setClassForm({...classForm, gradeLevel: e.target.value})} style={inputStyle} />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>İptal</button>
                                <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Sınıfı Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputStyle = { width: '100%', boxSizing: 'border-box' as const, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', marginTop: '5px' };