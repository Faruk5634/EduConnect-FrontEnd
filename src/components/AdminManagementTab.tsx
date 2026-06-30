import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AdminUser {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    role: string;
    schoolId: number | string;
    schoolName: string;
}

interface School {
    id: number;
    name: string;
}

const AdminManagementTab: React.FC = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);

    // 🚪 Modal ve Detay Kontrolleri
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const initialFormState = {
        username: '', password: '', firstName: '', lastName: '', phone: '', email: '', role: 'ROLE_ADMIN', schoolId: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [adminsRes, schoolsRes] = await Promise.all([
                axios.get('http://localhost:8080/api/superadmin/admins', { headers }),
                axios.get('http://localhost:8080/api/schools', { headers })
            ]);
            setAdmins(adminsRes.data);
            setSchools(schoolsRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Veriler çekilemedi:", err);
            setLoading(false);
        }
    };

    // ➕ YENİ YÖNETİCİ EKLE
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData, schoolId: formData.schoolId === '' ? null : Number(formData.schoolId) };
            await axios.post('http://localhost:8080/api/superadmin/create-admin', payload, { headers: { Authorization: `Bearer ${token}` } });
            setIsCreateModalOpen(false);
            setFormData(initialFormState);
            fetchData();
        } catch (err) { alert("Kayıt başarısız! Kullanıcı adı alınmış olabilir."); }
    };

    // ✏️ YÖNETİCİ GÜNCELLE
    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData, schoolId: formData.schoolId === '' ? null : Number(formData.schoolId) };
            await axios.put(`http://localhost:8080/api/superadmin/update-admin/${selectedAdmin?.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedAdmin(null);
            setIsEditing(false);
            fetchData();
        } catch (err) { alert("Güncelleme başarısız oldu!"); }
    };

    // 🗑️ YÖNETİCİ SİL
    const handleDelete = async (id: number) => {
        if (window.confirm("Bu yöneticiyi sistemden tamamen silmek istediğinize emin misiniz?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8080/api/superadmin/delete-admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setSelectedAdmin(null);
                fetchData();
            } catch (err) { alert("Silme işlemi başarısız!"); }
        }
    };

    // Satıra tıklandığında detayları aç
    const openDetail = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setIsEditing(false);
        setFormData({
            username: admin.username, password: '', firstName: admin.firstName, lastName: admin.lastName,
            phone: admin.phone, email: admin.email, role: admin.role, schoolId: admin.schoolId || ''
        });
    };

    if (loading) return <div className="text-center py-20 text-slate-400 font-medium animate-pulse">📡 Yönetici verileri taranıyor...</div>;

    return (
        <div className="animate-fade-in-down h-full bg-slate-100 p-6 rounded-tl-3xl">

            {/* 🏛️ Üst Bar */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Yönetici ve Atama Merkezi</h2>
                    <p className="text-slate-500 text-sm mt-1">Yöneticilerin detaylarını görmek için listedeki satırlara tıklayın.</p>
                </div>
                <button onClick={() => { setFormData(initialFormState); setIsCreateModalOpen(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all">
                    <span>👨‍💼</span> Yeni Yönetici Ekle
                </button>
            </div>

            {/* 📊 Veri Tablosu */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-5 font-bold">Yönetici</th>
                        <th className="p-5 font-bold">İletişim</th>
                        <th className="p-5 font-bold">Rütbe</th>
                        <th className="p-5 font-bold">Görev Yeri</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {admins.map((admin) => (
                        <tr key={admin.id} onClick={() => openDetail(admin)} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                            <td className="p-5">
                                <div className="font-bold text-slate-800">{admin.firstName} {admin.lastName}</div>
                                <div className="text-xs text-slate-400">@{admin.username}</div>
                            </td>
                            <td className="p-5 text-slate-600 text-sm font-medium">{admin.phone || '-'}</td>
                            <td className="p-5">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${admin.role === 'ROLE_ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                    {admin.role === 'ROLE_ADMIN' ? 'MÜDÜR' : 'MÜDÜR YRD.'}
                  </span>
                            </td>
                            <td className="p-5 font-medium">
                                {admin.schoolName === 'Boşta' ? (
                                    <span className="text-amber-500 bg-amber-50 px-3 py-1 rounded-lg text-xs font-bold border border-amber-200">Boşta (Atama Bekliyor)</span>
                                ) : <span className="text-slate-700">{admin.schoolName}</span>}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 📝 YENİ YÖNETİCİ VEYA DETAY/DÜZENLEME MODALI */}
            {(isCreateModalOpen || selectedAdmin) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-800">
                                {isCreateModalOpen ? 'Yeni Yönetici Oluştur' : isEditing ? 'Yöneticiyi Düzenle' : 'Yönetici Detayları'}
                            </h3>
                            <button onClick={() => { setIsCreateModalOpen(false); setSelectedAdmin(null); }} className="text-slate-400 hover:text-red-500 text-3xl transition-colors">&times;</button>
                        </div>

                        <form onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit} className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Adı *</label>
                                    <input type="text" required disabled={selectedAdmin && !isEditing} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Soyadı *</label>
                                    <input type="text" required disabled={selectedAdmin && !isEditing} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Telefon *</label>
                                    <input type="text" required disabled={selectedAdmin && !isEditing} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">E-posta (İsteğe Bağlı)</label>
                                    <input type="email" disabled={selectedAdmin && !isEditing} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Sistem Kullanıcı Adı *</label>
                                    <input type="text" required disabled={selectedAdmin && !isEditing} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">
                                        {isEditing || isCreateModalOpen ? 'Şifre (Boş bırakırsanız değişmez)' : 'Şifre (Gizli)'}
                                    </label>
                                    <input type="password" required={isCreateModalOpen} disabled={selectedAdmin && !isEditing} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70" placeholder="••••••••" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Rütbe Seçimi *</label>
                                    <select required disabled={selectedAdmin && !isEditing} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70">
                                        <option value="ROLE_ADMIN">Okul Müdürü</option>
                                        <option value="ROLE_VICE_ADMIN">Müdür Yardımcısı</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Görev Yeri (İsteğe Bağlı)</label>
                                    <select disabled={selectedAdmin && !isEditing} value={formData.schoolId} onChange={e => setFormData({...formData, schoolId: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70">
                                        <option value="">-- Şimdilik Boşta Bırak --</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* BUTONLAR (Duruma Göre Değişir) */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                {isCreateModalOpen ? (
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Yöneticiyi Ekle</button>
                                ) : (
                                    <>
                                        {!isEditing ? (
                                            <>
                                                <button type="button" onClick={() => handleDelete(selectedAdmin!.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-3 rounded-xl font-bold">Yöneticiyi Sil</button>
                                                <button type="button" onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold">Bilgileri Düzenle</button>
                                            </>
                                        ) : (
                                            <>
                                                <button type="button" onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold">İptal</button>
                                                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Değişiklikleri Kaydet</button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagementTab;