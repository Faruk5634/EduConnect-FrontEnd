import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface School {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    schoolType: string;
    city: string;
    district: string;
    neighborhood: string;
}

const locationData: Record<string, string[]> = {
    "İstanbul": ["Kadıköy", "Ümraniye", "Çekmeköy", "Üsküdar", "Beşiktaş", "Şişli"],
    "Ankara": ["Çankaya", "Keçiören", "Yenimahalle"],
    "İzmir": ["Bornova", "Karşıyaka", "Konak"],
    "Batman": ["Merkez", "Hasankeyf", "Kozluk"]
};

// 📌 SAYFA MODLARI
type ViewMode = 'list' | 'detail' | 'create' | 'edit';

const CampusManagementTab: React.FC = () => {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

    const initialFormState = {
        name: '', schoolType: 'HIGH_SCHOOL', phone: '', email: '',
        city: 'İstanbul', district: 'Kadıköy', neighborhood: '', address: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    const availableDistricts = locationData[formData.city] || [];

    useEffect(() => { fetchSchools(); }, []);

    const fetchSchools = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/schools', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchools(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Okullar çekilemedi:", err);
            setLoading(false);
        }
    };

    const goToList = () => {
        setViewMode('list');
        setSelectedSchool(null);
    };

    const openCreate = () => {
        setFormData(initialFormState);
        setViewMode('create');
    };

    const openDetail = (school: School) => {
        setSelectedSchool(school);
        setFormData({
            name: school.name, schoolType: school.schoolType, phone: school.phone || '',
            email: school.email || '', city: school.city || 'İstanbul',
            district: school.district || '', neighborhood: school.neighborhood || '',
            address: school.address || ''
        });
        setViewMode('detail');
    };

    const openEdit = () => setViewMode('edit');

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/schools', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            goToList();
            fetchSchools();
        } catch (err) { alert("Kurum eklenirken hata oluştu!"); }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/schools/${selectedSchool?.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updatedSchool = { ...selectedSchool, ...formData } as School;
            setSelectedSchool(updatedSchool);
            setViewMode('detail');
            fetchSchools();
        } catch (err) { alert("Güncelleme başarısız oldu!"); }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Bu kurumu sistemden tamamen silmek istediğinize emin misiniz?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8080/api/schools/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                goToList();
                fetchSchools();
            } catch (err) { alert("Silme işlemi başarısız!"); }
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-400 font-medium animate-pulse">📡 Kurum verileri taranıyor...</div>;

    // ===========================================================================
    // 1. LİSTE (KARTLAR) EKRANI
    // ===========================================================================
    if (viewMode === 'list') {
        return (
            <div className="animate-fade-in-down h-full bg-slate-50 p-6 md:p-8 rounded-tl-3xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800">Kurum Yönetimi</h2>
                        <p className="text-slate-500 text-sm mt-1">Detayları görmek için kurum kartlarına tıklayın.</p>
                    </div>
                    <button onClick={openCreate} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-md font-bold shadow-md transition-all flex items-center gap-2 text-sm tracking-widest">
                        <span>➕</span> YENİ KURUM EKLE
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schools.map((school) => (
                        <div key={school.id} onClick={() => openDetail(school)} className="bg-white p-6 rounded-md shadow-sm border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group relative overflow-hidden">
                            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${school.schoolType === 'HIGH_SCHOOL' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                            <div className="relative z-10">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border tracking-widest ${school.schoolType === 'HIGH_SCHOOL' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {school.schoolType === 'HIGH_SCHOOL' ? 'LİSE' : 'İLK/ORTAOKUL'}
                </span>
                                <h3 className="text-lg font-bold text-slate-900 mt-3 mb-1 group-hover:text-blue-700 transition-colors">{school.name}</h3>
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{school.city || 'Bilinmiyor'} / {school.district || 'Bilinmiyor'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ===========================================================================
    // 2. DETAY & FORM EKRANI
    // ===========================================================================
    return (
        <div className="animate-fade-in-right h-full bg-slate-50 p-6 md:p-8 rounded-tl-3xl">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-200">
                <button onClick={goToList} className="text-slate-500 hover:text-slate-900 bg-white border border-slate-300 p-2 rounded-md transition-all shadow-sm font-bold px-4">
                    GERİ DÖN
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        {viewMode === 'create' ? 'YENİ KURUM OLUŞTUR' : viewMode === 'edit' ? 'KURUM BİLGİLERİNİ GÜNCELLE' : 'KURUM PROFİLİ'}
                    </h2>
                </div>
            </div>

            {/* SADECE DETAY GÖRÜNÜMÜ */}
            {viewMode === 'detail' && selectedSchool && (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-800 p-8 text-white flex items-center gap-6">
                            <div className="w-20 h-20 bg-slate-700 text-white rounded-md flex items-center justify-center text-4xl shadow-inner border border-slate-600">
                                🏛️
                            </div>
                            <div>
                                <h3 className="text-3xl font-black">{selectedSchool.name}</h3>
                                <div className="mt-3 inline-block">
                  <span className={`px-3 py-1 rounded text-xs font-bold tracking-widest ${selectedSchool.schoolType === 'HIGH_SCHOOL' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                    {selectedSchool.schoolType === 'HIGH_SCHOOL' ? 'LİSE' : 'İLKOKUL / ORTAOKUL'}
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
                                        <p className="text-base font-bold text-slate-900">{selectedSchool.phone || 'Belirtilmemiş'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Bölge</p>
                                        <p className="text-base font-bold text-slate-900">{selectedSchool.city} / {selectedSchool.district}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Açık Adres</p>
                                        <p className="text-sm font-semibold text-slate-700 mt-1">{selectedSchool.address || 'Belirtilmemiş'}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Sistem Kayıt Bilgileri</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Sistem Kayıt Numarası (ID)</p>
                                        <p className="text-base font-bold text-slate-900">#{selectedSchool.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Kurumsal E-Posta</p>
                                        <p className="text-base font-bold text-slate-900">{selectedSchool.email || 'Belirtilmemiş'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                            <button onClick={() => handleDelete(selectedSchool.id)} className="bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 px-6 py-2 rounded-md font-bold text-sm tracking-widest transition-all">
                                SİSTEMDEN SİL
                            </button>
                            <button onClick={openEdit} className="bg-slate-900 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-bold text-sm tracking-widest shadow-md transition-all">
                                DÜZENLE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FORM GÖRÜNÜMÜ (BANKA TEMASI) */}
            {(viewMode === 'create' || viewMode === 'edit') && (
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-md shadow-sm border border-slate-200">
                    <form onSubmit={viewMode === 'create' ? handleCreateSubmit : handleUpdateSubmit} className="space-y-6">

                        {/* TAM GENİŞLİK: Okul Adı */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Kurum Adı *</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" placeholder="Örn: Atatürk Anadolu Lisesi" />
                        </div>

                        {/* İKİLİ SATIR: Tür ve Telefon */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Kurum Türü *</label>
                                <select required value={formData.schoolType} onChange={e => setFormData({...formData, schoolType: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all cursor-pointer">
                                    <option value="HIGH_SCHOOL">Lise</option>
                                    <option value="PRIMARY_MIDDLE_SCHOOL">İlkokul / Ortaokul </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Kurum Telefonu *</label>
                                <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" placeholder="0212 XXX XX XX" />
                            </div>
                        </div>

                        {/* İKİLİ SATIR: İl ve İlçe */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 mt-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">İl *</label>
                                <select required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value, district: locationData[e.target.value]?.[0] || ''})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all cursor-pointer">
                                    {Object.keys(locationData).map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">İlçe *</label>
                                <select required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all cursor-pointer">
                                    {availableDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* İKİLİ SATIR: Mahalle ve E-Posta */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Mahalle *</label>
                                <input type="text" required value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" placeholder="Örn: Cumhuriyet Mah." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Kurumsal E-Posta (İsteğe Bağlı)</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" placeholder="info@kurum.com" />
                            </div>
                        </div>

                        {/* TAM GENİŞLİK: Adres */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Açık Adres *</label>
                            <textarea required rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all placeholder:text-slate-400 resize-none" placeholder="Sokak, Cadde, Bina No..."></textarea>
                        </div>

                        {/* BUTONLAR */}
                        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-200">
                            <button type="button" onClick={viewMode === 'edit' ? () => setViewMode('detail') : goToList} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-md font-bold text-sm tracking-widest transition-all">
                                İPTAL
                            </button>
                            <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-bold text-sm tracking-widest shadow-md transition-all">
                                {viewMode === 'create' ? 'KAYDET VE ONAYLA' : 'DEĞİŞİKLİKLERİ UYGULA'}
                            </button>
                        </div>

                    </form>
                </div>
            )}

        </div>
    );
};

export default CampusManagementTab;