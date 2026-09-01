import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

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

// 📌 SAYFA MODLARI
type ViewMode = 'list' | 'detail' | 'create' | 'edit';

const AdminManagementTab: React.FC = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);

    // 🧭 Ekran Yönetimi
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

    // 🔍 Arama ve Filtreleme Durumları
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [schoolFilter, setSchoolFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('DEFAULT');

    const initialFormState = {
        username: '', password: '', firstName: '', lastName: '', phone: '', email: '', role: 'ROLE_ADMIN', schoolId: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [adminsRes, schoolsRes] = await Promise.all([
                api.get('/superadmin/admins'),
                api.get('/schools')
            ]);
            setAdmins(adminsRes.data);
            setSchools(schoolsRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Veriler çekilemedi:", err);
            setLoading(false);
        }
    };

    const goToList = () => {
        setViewMode('list');
        setSelectedAdmin(null);
    };

    const openCreate = () => {
        setFormData(initialFormState);
        setViewMode('create');
    };

    const openDetail = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setFormData({
            username: admin.username, password: '', firstName: admin.firstName, lastName: admin.lastName,
            phone: admin.phone, email: admin.email || '', role: admin.role, schoolId: admin.schoolId ? admin.schoolId.toString() : ''
        });
        setViewMode('detail');
    };

    const openEdit = () => setViewMode('edit');

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, schoolId: formData.schoolId === '' ? null : Number(formData.schoolId) };
            await api.post('/superadmin/create-admin', payload);
            goToList();
            fetchData();
            showToast('Yeni yönetici başarıyla oluşturuldu ✅', 'success');
        } catch (err) { showToast("Kayıt başarısız! Kullanıcı adı alınmış olabilir.", 'error'); }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, schoolId: formData.schoolId === '' ? null : Number(formData.schoolId) };
            await api.put(`/superadmin/update-admin/${selectedAdmin?.id}`, payload);

            const updatedAdmin = { ...selectedAdmin, ...formData, schoolName: schools.find(s => s.id === Number(formData.schoolId))?.name || 'Boşta' } as AdminUser;
            setSelectedAdmin(updatedAdmin);
            setViewMode('detail');
            fetchData();
            showToast('Yönetici bilgileri başarıyla güncellendi ✅', 'success');
        } catch (err) { showToast("Güncelleme başarısız oldu!", 'error'); }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Bu yöneticiyi sistemden tamamen silmek istediğinize emin misiniz?")) {
            try {
                await api.delete(`/superadmin/delete-admin/${id}`);
                goToList();
                fetchData();
                showToast('Yönetici başarıyla silindi ✅', 'success');
            } catch (err) { showToast("Silme işlemi başarısız!", 'error'); }
        }
    };

    // 🚀 FİLTRELEME VE SIRALAMA MOTORU
    const filteredAdmins = admins.filter(admin => {
        const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
        const schoolName = (admin.schoolName || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = fullName.includes(searchLower) || schoolName.includes(searchLower);
        const matchesRole = roleFilter === 'ALL' || admin.role === roleFilter;
        const matchesSchool = schoolFilter === 'ALL' ||
            (schoolFilter === 'UNASSIGNED' && admin.schoolName === 'Boşta') ||
            admin.schoolId?.toString() === schoolFilter;

        return matchesSearch && matchesRole && matchesSchool;
    }).sort((a, b) => {
        if (sortOrder === 'AZ') return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        if (sortOrder === 'ZA') return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        return 0;
    });

    if (loading) return <div className="text-center py-20 text-slate-400 font-medium animate-pulse">📡 Yönetici verileri taranıyor...</div>;

    if (viewMode === 'list') {
        return (
            <div className="animate-fade-in-down h-full bg-transparent p-6 md:p-8 rounded-tl-3xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800">Yönetici ve Atama Merkezi</h2>
                        <p className="text-slate-500 text-sm mt-1">Yöneticilerin detaylarını görmek için listedeki satırlara tıklayın.</p>
                    </div>
                    <button onClick={openCreate} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-md font-bold shadow-lg transition-all flex items-center gap-2 text-sm tracking-widest">
                        <span>➕</span> YENİ YÖNETİCİ EKLE
                    </button>
                </div>

                <div className="glass-panel p-4 rounded-md shadow-lg border border-white/40 mb-6 flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <input type="text" placeholder="İsim, Soyisim veya Kurum Adı Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent border border-white/40 rounded-md px-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" />
                    </div>
                    <div className="w-full lg:w-48">
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full bg-transparent border border-white/40 rounded-md px-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-blue-700 outline-none transition-all cursor-pointer text-slate-700">
                            <option value="ALL">Tüm Rütbeler</option>
                            <option value="ROLE_ADMIN">Sadece Müdürler</option>
                            <option value="ROLE_VICE_ADMIN">Sadece Müdür Yrd.</option>
                        </select>
                    </div>
                    <div className="w-full lg:w-56">
                        <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className="w-full bg-transparent border border-white/40 rounded-md px-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-blue-700 outline-none transition-all cursor-pointer text-slate-700">
                            <option value="ALL">Tüm Kurumlar</option>
                            <option value="UNASSIGNED">Boşta Bekleyenler</option>
                            {schools.map(s => <option key={s.id} value={s.id.toString()}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="w-full lg:w-40">
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full bg-transparent border border-white/40 rounded-md px-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-blue-700 outline-none transition-all cursor-pointer text-slate-700">
                            <option value="DEFAULT">Kayıt Sırası</option>
                            <option value="AZ">A'dan Z'ye</option>
                            <option value="ZA">Z'den A'ya</option>
                        </select>
                    </div>
                </div>

                <div className="glass-panel border border-white/40 rounded-md shadow-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-transparent border-b border-white/40 text-slate-500 text-xs uppercase tracking-wider font-bold">
                            <th className="p-5">Yönetici</th>
                            <th className="p-5">E-Posta Adresi</th>
                            <th className="p-5">Rütbe</th>
                            <th className="p-5">Görev Yeri</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {filteredAdmins.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">Arama kriterlerine uygun yönetici bulunamadı.</td>
                            </tr>
                        ) : (
                            filteredAdmins.map((admin) => (
                                <tr key={admin.id} onClick={() => openDetail(admin)} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                    <td className="p-5">
                                        <div className="font-bold text-slate-800">{admin.firstName} {admin.lastName}</div>
                                        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">@{admin.username}</div>
                                    </td>
                                    <td className="p-5 text-slate-600 text-sm font-medium">
                                        {admin.email ? admin.email : <span className="text-slate-400 italic">Belirtilmemiş</span>}
                                    </td>
                                    <td className="p-5">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight text-slate-800 uppercase border tracking-widest ${admin.role === 'ROLE_ADMIN' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                        {admin.role === 'ROLE_ADMIN' ? 'MÜDÜR' : 'MÜDÜR YRD.'}
                                      </span>
                                    </td>
                                    <td className="p-5 font-medium text-sm">
                                        {admin.schoolName === 'Boşta' ? (
                                            <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded text-[10px] font-bold tracking-tight text-slate-800 uppercase border border-amber-200 tracking-widest">Boşta (Atama Bekliyor)</span>
                                        ) : <span className="text-slate-700">{admin.schoolName}</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-right h-full bg-transparent p-6 md:p-8 rounded-tl-3xl">

            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/40">
                <button onClick={goToList} className="text-slate-500 hover:text-slate-900 glass-panel border border-slate-300 p-2 rounded-md transition-all shadow-lg font-bold px-4 text-sm tracking-widest">
                    GERİ DÖN
                </button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800 tracking-tight uppercase">
                        {viewMode === 'create' ? 'YENİ YÖNETİCİ OLUŞTUR' : viewMode === 'edit' ? 'YÖNETİCİ BİLGİLERİNİ GÜNCELLE' : 'YÖNETİCİ PROFİLİ'}
                    </h2>
                </div>
            </div>

            {viewMode === 'detail' && selectedAdmin && (
                <div className="max-w-4xl mx-auto">
                    <div className="glass-panel rounded-md shadow-lg border border-white/40 overflow-hidden">

                        <div className="bg-[#1e293b] p-8 text-white flex items-center gap-6">
                            {/* 🚀 ÇÖKME KORUMASI: Optional Chaining Eklendi */}
                            <div className="w-20 h-20 bg-slate-700/50 text-white rounded-md flex items-center justify-center text-3xl font-bold tracking-tight text-slate-800 shadow-inner border border-slate-600">
                                {selectedAdmin.firstName?.charAt(0) || ''}{selectedAdmin.lastName?.charAt(0) || ''}
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold tracking-tight text-slate-800">{selectedAdmin.firstName} {selectedAdmin.lastName}</h3>
                                <div className="mt-3 inline-block">
                                  <span className={`px-3 py-1 rounded text-xs font-bold tracking-widest uppercase ${selectedAdmin.role === 'ROLE_ADMIN' ? 'bg-[#10b981] text-white' : 'bg-blue-600 text-white'}`}>
                                    {selectedAdmin.role === 'ROLE_ADMIN' ? 'OKUL MÜDÜRÜ' : 'MÜDÜR YARDIMCISI'}
                                  </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">İletişim & Lokasyon</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Telefon</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedAdmin.phone || 'Belirtilmemiş'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Kullanıcı Adı</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">@{selectedAdmin.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Kurumsal E-Posta</p>
                                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{selectedAdmin.email || 'Belirtilmemiş'}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Sistem Kayıt Bilgileri</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Sistem Kayıt Numarası (ID)</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">#{selectedAdmin.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Görev Yaptığı Kampüs</p>
                                        <p className={`text-sm font-bold mt-0.5 ${selectedAdmin.schoolName === 'Boşta' ? 'text-amber-600' : 'text-slate-900'}`}>
                                            {selectedAdmin.schoolName === 'Boşta' ? 'Şu an Atama Bekliyor (Boşta)' : selectedAdmin.schoolName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 glass-panel border-t border-white/40 flex justify-end gap-3">
                            <button onClick={() => handleDelete(selectedAdmin.id)} className="glass-panel border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-md font-bold text-sm tracking-widest transition-all">
                                SİSTEMDEN SİL
                            </button>
                            <button onClick={openEdit} className="bg-[#0f172a] hover:bg-blue-700 text-white px-8 py-2.5 rounded-md font-bold text-sm tracking-widest shadow-lg transition-all">
                                DÜZENLE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(viewMode === 'create' || viewMode === 'edit') && (
                <div className="max-w-3xl mx-auto glass-panel p-8 md:p-10 rounded-md shadow-lg border border-white/40">
                    <form onSubmit={viewMode === 'create' ? handleCreateSubmit : handleUpdateSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Adı *</label>
                                <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" placeholder="Örn: Ahmet" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Soyadı *</label>
                                <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" placeholder="Örn: Yılmaz" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Sistem Kullanıcı Adı *</label>
                            <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" placeholder="ahmet.yilmaz" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Telefon *</label>
                                <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" placeholder="05XX XXX XX XX" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">E-posta (İsteğe Bağlı)</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" placeholder="ahmet@okul.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                                {viewMode === 'edit' ? 'Şifre Güncelleme (Değiştirmek istemiyorsanız boş bırakın)' : 'Sistem Giriş Şifresi *'}
                            </label>
                            <input type="password" required={viewMode === 'create'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" placeholder="••••••••" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Rütbe Seçimi *</label>
                                <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all cursor-pointer">
                                    <option value="ROLE_ADMIN">Okul Müdürü</option>
                                    <option value="ROLE_VICE_ADMIN">Müdür Yardımcısı</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Görev Yeri (İsteğe Bağlı)</label>
                                <select value={formData.schoolId} onChange={e => setFormData({...formData, schoolId: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-700 outline-none transition-all cursor-pointer">
                                    <option value="">-- Şimdilik Atama Yapma (Boşta) --</option>
                                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-white/40">
                            <button type="button" onClick={viewMode === 'edit' ? () => setViewMode('detail') : goToList} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-md font-bold text-sm tracking-widest transition-all">
                                İPTAL
                            </button>
                            <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-bold text-sm tracking-widest shadow-lg transition-all">
                                {viewMode === 'create' ? 'KAYDET VE ONAYLA' : 'DEĞİŞİKLİKLERİ UYGULA'}
                            </button>
                        </div>

                    </form>
                </div>
            )}

        </div>
    );
};

export default AdminManagementTab;