import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

interface StudentInfo { id: number; firstName: string; lastName: string; schoolNumber: string; grade: string; }
interface Parent { id: number; firstName: string; lastName: string; email: string; phoneNumber: string; username?: string; students?: StudentInfo[]; }

const ParentTab: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'form'>('list');
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [parents, setParents] = useState<Parent[]>([]);
    const [schoolType, setSchoolType] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const [parentForm, setParentForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', username: '', password: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            try {
                const userRes = await api.get('/users/me');
                setSchoolType(userRes.data.schoolType || 'HIGH_SCHOOL');
            } catch (err) {
                console.warn("Kullanıcı türü çekilemedi.");
            }
            const response = await api.get('/parents');
            setParents(response.data);
        } catch (error) {
            console.error("Veliler çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredParents = parents.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

    const goToList = () => { setViewMode('list'); setSelectedParent(null); };

    const openCreateForm = () => {
        setParentForm({ firstName: '', lastName: '', email: '', phoneNumber: '', username: '', password: '' });
        setViewMode('form');
    };

    const openEditForm = (parent: Parent) => {
        setSelectedParent(parent);
        setParentForm({
            firstName: parent.firstName, lastName: parent.lastName, email: parent.email || '', phoneNumber: parent.phoneNumber || '',
            username: parent.username || '', password: ''
        });
        setViewMode('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            firstName: parentForm.firstName,
            lastName: parentForm.lastName,
            email: parentForm.email,
            phoneNumber: parentForm.phoneNumber,
            username: parentForm.username,
            password: parentForm.password
        };

        try {
            if (selectedParent) {
                await api.put(`/parents/${selectedParent.id}`, payload);
                showToast("Veli güncellendi! ✅", 'success');
            } else {
                await api.post('/parents', payload);
                showToast("Veli sisteme kaydedildi! 👨‍👩‍👧", 'success');
            }
            goToList();
            fetchInitialData();
        } catch (error) {
            console.error(error);
            showToast("İşlem başarısız!", 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Bu veliyi silmek istediğinize emin misiniz?")) {
            await api.delete(`/parents/${id}`);
            fetchInitialData();
            goToList();
            showToast('Veli silindi ✅', 'success');
        }
    };

    if (viewMode === 'list') {
        return (
            <div className="animate-fade-in-down h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold text-slate-800">Veli Yönetimi</h2>
                    <button onClick={openCreateForm} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold">➕ YENİ VELİ EKLE</button>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
                    <input type="text" placeholder="🔍 Veli ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border rounded-lg px-4 py-2.5 outline-none" />
                </div>
                <div className="bg-white border rounded-xl shadow-sm flex-1 overflow-auto">
                    {loading ? <div className="p-10 text-center text-slate-400">Yükleniyor...</div> : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b"><tr className="text-slate-500 text-xs uppercase font-bold"><th className="p-4">Ad Soyad</th><th className="p-4">Telefon</th><th className="p-4">Bağlı Öğrenci</th><th className="p-4">İşlemler</th></tr></thead>
                            <tbody className="divide-y">
                            {filteredParents.map((parent) => (
                                <tr key={parent.id} className="hover:bg-slate-50 cursor-pointer">
                                    <td className="p-4 font-bold" onClick={() => {setSelectedParent(parent); setViewMode('detail');}}>{parent.firstName} {parent.lastName}</td>
                                    <td className="p-4">{parent.phoneNumber}</td>
                                    <td className="p-4 font-bold text-blue-600">{parent.students?.length || 0} Öğrenci</td>
                                    <td className="p-4"><button onClick={() => openEditForm(parent)} className="text-blue-600 font-bold text-xs">DÜZENLE</button></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        );
    }

    if (viewMode === 'detail' && selectedParent) {
        return (
            <div className="animate-fade-in-right h-full">
                <button onClick={goToList} className="mb-4 text-sm font-bold bg-white border px-4 py-2 rounded-lg">⬅️ GERİ</button>
                <div className="bg-white rounded-xl shadow-sm border p-8">
                    <h3 className="text-3xl font-black mb-2">{selectedParent.firstName} {selectedParent.lastName}</h3>
                    <p className="mb-6 font-bold text-slate-500">📞 {selectedParent.phoneNumber} | ✉️ {selectedParent.email}</p>
                    {selectedParent.username && (
                        <p className="mb-6 font-bold text-blue-600">Sistem Giriş Adı: @{selectedParent.username}</p>
                    )}
                    <h4 className="font-bold border-b pb-2 mb-4">Sorumlu Olduğu Öğrenciler</h4>
                    <ul className="mb-6 list-disc pl-5">
                        {selectedParent.students?.map(s => <li key={s.id} className="font-medium">{s.firstName} {s.lastName} ({s.schoolNumber})</li>)}
                        {!selectedParent.students?.length && <li className="text-slate-400">Bağlı öğrenci yok.</li>}
                    </ul>
                    <div className="flex gap-3">
                        <button onClick={() => handleDelete(selectedParent.id)} className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-bold">SİL</button>
                        <button onClick={() => openEditForm(selectedParent)} className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold">DÜZENLE</button>
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'form') {
        return (
            <div className="animate-fade-in-right h-full">
                <button onClick={goToList} className="mb-4 text-sm font-bold bg-white border px-4 py-2 rounded-lg">⬅️ İPTAL</button>
                <div className="bg-white rounded-xl shadow-sm border p-8">
                    <h2 className="text-2xl font-black mb-6">{selectedParent ? 'Veli Güncelle' : 'Yeni Veli Kaydı'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-bold mb-1">Ad *</label><input required value={parentForm.firstName} onChange={e => setParentForm({...parentForm, firstName: e.target.value})} className="w-full border rounded-lg px-4 py-2" /></div>
                            <div><label className="block text-sm font-bold mb-1">Soyad *</label><input required value={parentForm.lastName} onChange={e => setParentForm({...parentForm, lastName: e.target.value})} className="w-full border rounded-lg px-4 py-2" /></div>
                            <div><label className="block text-sm font-bold mb-1">Telefon *</label><input required value={parentForm.phoneNumber} onChange={e => setParentForm({...parentForm, phoneNumber: e.target.value})} className="w-full border rounded-lg px-4 py-2" /></div>
                            <div><label className="block text-sm font-bold mb-1">E-Posta *</label><input required type="email" value={parentForm.email} onChange={e => setParentForm({...parentForm, email: e.target.value})} className="w-full border rounded-lg px-4 py-2" /></div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="mb-3">
                                <h3 className="text-sm font-bold text-slate-700">
                                    Giriş Bilgileri {schoolType === 'PRIMARY_MIDDLE_SCHOOL' ? '(zorunlu)' : '(isteğe bağlı)'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    {schoolType === 'PRIMARY_MIDDLE_SCHOOL'
                                        ? 'İlkokul ve ortaokul velileri sisteme giriş yapabilmek için kullanıcı adı ve şifre ile kaydedilmelidir.'
                                        : 'Lise velileri için kullanıcı adı ve şifre girilebilir; girilirse veli kendi hesabıyla sisteme giriş yapabilir.'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-emerald-600 mb-1">Sistem Kullanıcı Adı {schoolType === 'PRIMARY_MIDDLE_SCHOOL' ? '*' : '(isteğe bağlı)'}</label>
                                    <input
                                        required={schoolType === 'PRIMARY_MIDDLE_SCHOOL'}
                                        value={parentForm.username}
                                        onChange={e => setParentForm({...parentForm, username: e.target.value})}
                                        className="w-full border rounded-lg px-4 py-2"
                                        placeholder="Örn: veli.ayse"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-emerald-600 mb-1">{selectedParent ? 'Şifre (Değişmeyecekse Boş Bırak)' : schoolType === 'PRIMARY_MIDDLE_SCHOOL' ? 'Şifre *' : 'Şifre (isteğe bağlı)'}</label>
                                    <input
                                        required={schoolType === 'PRIMARY_MIDDLE_SCHOOL' && !selectedParent}
                                        type="password"
                                        value={parentForm.password}
                                        onChange={e => setParentForm({...parentForm, password: e.target.value})}
                                        className="w-full border rounded-lg px-4 py-2"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl">KAYDET</button>
                    </form>
                </div>
            </div>
        );
    }

    return null;
};

export default ParentTab;