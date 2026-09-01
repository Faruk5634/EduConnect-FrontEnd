import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

interface Parent { id: number; firstName: string; lastName: string; email: string; phoneNumber: string; username?: string; studentNames?:string[]; }

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
                            <thead className="bg-slate-50 border-b">
                            <tr className="text-slate-500 text-xs uppercase font-bold">
                                <th className="p-4">Ad Soyad</th>
                                <th className="p-4">Telefon</th>
                                <th className="p-4">Bağlı Öğrenci</th>
                                <th className="p-4 text-right">İşlemler</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {filteredParents.map((parent) => (
                                <tr
                                    key={parent.id}
                                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                                    onClick={() => { setSelectedParent(parent); setViewMode('detail'); }}
                                >
                                    <td className="p-4 font-bold text-slate-800">{parent.firstName} {parent.lastName}</td>
                                    <td className="p-4 text-slate-600">{parent.phoneNumber}</td>
                                    <td className="p-4 font-bold text-blue-600">
                                        {parent.studentNames ? parent.studentNames.length : 0} Öğrenci
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedParent(parent); setViewMode('detail'); }}
                                                className="text-emerald-600 hover:text-white border border-emerald-200 hover:bg-emerald-500 hover:border-emerald-500 px-3 py-1.5 rounded-md font-bold text-xs transition-all"
                                            >
                                                DETAY
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEditForm(parent); }}
                                                className="text-blue-600 hover:text-white border border-blue-200 hover:bg-blue-600 hover:border-blue-600 px-3 py-1.5 rounded-md font-bold text-xs transition-all"
                                            >
                                                DÜZENLE
                                            </button>
                                        </div>
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

    if (viewMode === 'detail' && selectedParent) {
        return (
            <div className="animate-fade-in-right h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200">
                    <button onClick={goToList} className="text-slate-500 hover:text-slate-900 bg-white border border-slate-300 px-4 py-2 rounded-lg transition-all shadow-sm font-bold text-sm tracking-wider">
                        ⬅️ GERİ DÖN
                    </button>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Veli Profili</h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 max-w-4xl mx-auto w-full">

                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-10 text-white flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>

                        {/* 🚀 ÇÖKME KORUMASI: Optional chaining ve varsayılan değerler eklendi */}
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-inner border border-white/20 relative z-10 shrink-0">
                            {selectedParent.firstName?.charAt(0) || ''}{selectedParent.lastName?.charAt(0) || ''}
                        </div>
                        <div className="relative z-10 text-center md:text-left flex-1">
                            <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{selectedParent.firstName} {selectedParent.lastName}</h3>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                                <span className="px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    VELİ PROFİLİ
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-2">İletişim & Sistem Bilgileri</h4>
                            <div className="space-y-5">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Cep Telefonu</p>
                                    <p className="text-base font-bold text-slate-900 mt-1">📞 {selectedParent.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">E-Posta Adresi</p>
                                    <p className="text-base font-bold text-slate-900 mt-1">✉️ {selectedParent.email}</p>
                                </div>
                                {selectedParent.username && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Sistem Giriş Adı</p>
                                        <p className="text-sm font-bold text-blue-600 mt-1">@{selectedParent.username}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-2">Sorumlu Olduğu Öğrenciler</h4>
                            <div className="space-y-3">
                                {selectedParent.studentNames && selectedParent.studentNames.length > 0 ? (
                                    selectedParent.studentNames.map((studentStr, index) => {
                                        const [fullName, stuNo] = studentStr.includes('|') ? studentStr.split('|') : [studentStr, 'Belirtilmemiş'];
                                        return (
                                            <div key={index} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                                                <span className="font-bold text-slate-800">{fullName}</span>
                                                <span className="bg-white border border-slate-200 text-slate-500 text-xs px-2 py-1 rounded font-bold">
                                                    NO: {stuNo}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm font-medium text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                        Sisteme kayıtlı bağlı öğrenci bulunmuyor.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                        <button onClick={() => handleDelete(selectedParent.id)} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-lg font-bold text-sm tracking-widest transition-all shadow-sm">
                            SİSTEMDEN SİL
                        </button>
                        <button onClick={() => openEditForm(selectedParent)} className="bg-slate-900 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold text-sm tracking-widest shadow-md transition-all">
                            BİLGİLERİ DÜZENLE
                        </button>
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
