import { useEffect, useState } from 'react';
import { api } from '../services/api';

// --- ŞABLONLAR ---
interface Parent {
    id: number;
    firstName: string;
    lastName: string;
}

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    schoolNumber: string;
    grade: string;
    username: string;
    parentId: number;
}

export default function ParentTab() {
    // --- ANA EKRAN STATE'LERİ ---
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [parentForm, setParentForm] = useState({ firstName: '', lastName: '' });

    // --- DETAY EKRANI STATE'LERİ ---
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [parentStudents, setParentStudents] = useState<Student[]>([]);

    // --- ÖĞRENCİ DÜZENLEME STATE'LERİ ---
    const [isStudentEditModalOpen, setIsStudentEditModalOpen] = useState(false);
    const [editStudentId, setEditStudentId] = useState<number | null>(null);
    const [studentForm, setStudentForm] = useState({
        username: '', schoolNumber: '', grade: '', firstName: '', lastName: ''
    });

    useEffect(() => {
        fetchParents();
    }, []);

    // --- VERİ ÇEKME ---
    const fetchParents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/parents');
            setParents(response.data);
        } catch (error) {
            console.error("Veliler çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchParentStudents = async (parentId: number) => {
        try {
            const response = await api.get('/students/list');
            // Gelen tüm öğrencilerden, sadece bu veliye (parentId) ait olanları ayıkla
            const filtered = response.data.filter((s: Student) => s.parentId === parentId);
            setParentStudents(filtered);
        } catch (error) {
            console.error("Öğrenciler çekilemedi:", error);
        }
    };

    // --- VELİ İŞLEMLERİ ---
    const handleCreateParent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/parents', parentForm);
            alert("Veli başarıyla eklendi! 👨‍👩‍👧");
            setIsCreateModalOpen(false);
            setParentForm({ firstName: '', lastName: '' });
            fetchParents();
        } catch (error) {
            alert("Veli eklenirken hata oluştu.");
        }
    };

    const handleUpdateParent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedParent) return;
        try {
            await api.put(`/parents/${selectedParent.id}`, parentForm);
            alert("Veli bilgileri güncellendi! ✅");
            fetchParents();
            setSelectedParent({ ...selectedParent, firstName: parentForm.firstName, lastName: parentForm.lastName });
        } catch (error) {
            alert("Güncelleme başarısız!");
        }
    };

    const handleDeleteParent = async () => {
        if (!selectedParent) return;
        if (!window.confirm("Bu veliyi sistemden silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/parents/${selectedParent.id}`);
            setSelectedParent(null);
            fetchParents();
        } catch (error) {
            alert("Veli silinemedi!");
        }
    };

    // --- ÖĞRENCİ İŞLEMLERİ (DETAY EKRANI İÇİN) ---
    const handleDeleteStudent = async (id: number) => {
        if (!window.confirm("Bu öğrenciyi sistemden tamamen silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/students/${id}`);
            setParentStudents(parentStudents.filter(s => s.id !== id));
        } catch (error) {
            alert("Öğrenci silinemedi!");
        }
    };

    const openStudentEditModal = (student: Student) => {
        setEditStudentId(student.id);
        setStudentForm({
            firstName: student.firstName,
            lastName: student.lastName,
            schoolNumber: student.schoolNumber,
            grade: student.grade || '',
            username: student.username || ''
        });
        setIsStudentEditModalOpen(true);
    };

    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedParent || !editStudentId) return;
        try {
            const payload = {
                ...studentForm,
                parentId: selectedParent.id // Öğrencinin veli bağını koruyoruz
            };
            await api.put(`/students/${editStudentId}`, payload);
            alert("Öğrenci başarıyla güncellendi! 🎓");
            setIsStudentEditModalOpen(false);
            fetchParentStudents(selectedParent.id); // Tabloyu yenile
        } catch (error) {
            alert("Öğrenci güncellenirken hata oluştu!");
        }
    };

    // --- DETAYA GİRİŞ ---
    const handleRowClick = (parent: Parent) => {
        setSelectedParent(parent);
        setParentForm({ firstName: parent.firstName, lastName: parent.lastName });
        fetchParentStudents(parent.id);
    };


    // ==========================================
    // EKRAN 1: DETAYLI VELİ VE ÖĞRENCİ YÖNETİMİ
    // ==========================================
    if (selectedParent) {
        return (
            <div style={{ animation: 'fadeIn 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
                    <button onClick={() => setSelectedParent(null)} style={{ padding: '10px 15px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ⬅️ Velilere Dön
                    </button>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>👨‍👩‍👧 {selectedParent.firstName} {selectedParent.lastName} - Veli Paneli</h2>
                </div>

                {/* VELİ GÜNCELLEME FORMU */}
                <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                    <h3 style={{ marginTop: 0, color: '#3b82f6', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>⚙️ Veli Bilgilerini Güncelle</h3>
                    <form onSubmit={handleUpdateParent} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Ad</label>
                            <input type="text" value={parentForm.firstName} onChange={e => setParentForm({...parentForm, firstName: e.target.value})} style={inputStyle} required />
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Soyad</label>
                            <input type="text" value={parentForm.lastName} onChange={e => setParentForm({...parentForm, lastName: e.target.value})} style={inputStyle} required />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Kaydet</button>
                            <button type="button" onClick={handleDeleteParent} style={{ padding: '12px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Veliyi Sil</button>
                        </div>
                    </form>
                </div>

                {/* VELİYE BAĞLI ÖĞRENCİLER TABLOSU */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, color: '#10b981', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                        🎓 Velinin Öğrencileri ({parentStudents.length} Kişi)
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#1e293b', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '14px' }}>Okul No</th>
                                <th style={{ padding: '14px' }}>Ad Soyad</th>
                                <th style={{ padding: '14px' }}>Sınıf</th>
                                <th style={{ padding: '14px', textAlign: 'center' }}>İşlemler</th>
                            </tr>
                            </thead>
                            <tbody>
                            {parentStudents.map(student => (
                                <tr key={student.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '14px', fontWeight: 'bold' }}>{student.schoolNumber}</td>
                                    <td style={{ padding: '14px' }}>{student.firstName} {student.lastName}</td>
                                    <td style={{ padding: '14px', color: '#64748b' }}>{student.grade || '-'}</td>
                                    <td style={{ padding: '14px', textAlign: 'center' }}>
                                        <button onClick={() => openStudentEditModal(student)} style={{ marginRight: '8px', padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✏️ Düzenle</button>
                                        <button onClick={() => handleDeleteStudent(student.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Sil</button>
                                    </td>
                                </tr>
                            ))}
                            {parentStudents.length === 0 && (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Bu veliye kayıtlı öğrenci bulunmamaktadır.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ÖĞRENCİ DÜZENLEME PENCERESİ (MODAL) */}
                {isStudentEditModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                            <h3 style={{ marginTop: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', color: '#1e293b' }}>✏️ Öğrenciyi Düzenle</h3>
                            <form onSubmit={handleUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                                <input type="text" placeholder="Ad" required value={studentForm.firstName} onChange={e => setStudentForm({...studentForm, firstName: e.target.value})} style={inputStyle} />
                                <input type="text" placeholder="Soyad" required value={studentForm.lastName} onChange={e => setStudentForm({...studentForm, lastName: e.target.value})} style={inputStyle} />
                                <input type="text" placeholder="Okul No" required value={studentForm.schoolNumber} onChange={e => setStudentForm({...studentForm, schoolNumber: e.target.value})} style={inputStyle} />
                                <input type="text" placeholder="Sınıf (Örn: 10-A)" required value={studentForm.grade} onChange={e => setStudentForm({...studentForm, grade: e.target.value})} style={inputStyle} />
                                <input type="text" placeholder="Kullanıcı Adı" required value={studentForm.username} onChange={e => setStudentForm({...studentForm, username: e.target.value})} style={inputStyle} />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setIsStudentEditModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>İptal</button>
                                    <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // EKRAN 2: ANA LİSTE (ÖĞRENCİLER GİBİ TABLO)
    // ==========================================
    return (
        <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>👨‍👩‍👧 Kayıtlı Veliler</h3>
                <button onClick={() => setIsCreateModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ➕ Yeni Veli Ekle
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
                            <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>İşlem</th>
                        </tr>
                        </thead>
                        <tbody>
                        {parents.map((parent) => (
                            <tr
                                key={parent.id}
                                onClick={() => handleRowClick(parent)}
                                style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <td style={{ padding: '14px', fontWeight: 'bold', color: '#64748b' }}>#{parent.id}</td>
                                <td style={{ padding: '14px', fontWeight: '500' }}>{parent.firstName} {parent.lastName}</td>
                                <td style={{ padding: '14px', textAlign: 'center' }}>
                                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                                            Detay & Öğrenciler ➡️
                                        </span>
                                </td>
                            </tr>
                        ))}
                        {parents.length === 0 && (
                            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Henüz veli bulunamadı.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* YENİ VELİ OLUŞTURMA PENCERESİ */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <h3 style={{ marginTop: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', color: '#1e293b' }}>➕ Yeni Veli Ekle</h3>
                        <form onSubmit={handleCreateParent} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input type="text" placeholder="Ad" required value={parentForm.firstName} onChange={e => setParentForm({...parentForm, firstName: e.target.value})} style={inputStyle} />
                            <input type="text" placeholder="Soyad" required value={parentForm.lastName} onChange={e => setParentForm({...parentForm, lastName: e.target.value})} style={inputStyle} />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>İptal</button>
                                <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Veliyi Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputStyle = { width: '100%', boxSizing: 'border-box' as const, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', marginTop: '5px' };