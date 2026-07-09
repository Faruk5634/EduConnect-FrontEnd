import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

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

    // 🔍 FİLTRELEME VE SIRALAMA DURUMLARI (YENİ EKLENDİ)
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [cityFilter, setCityFilter] = useState('ALL');
    const [districtFilter, setDistrictFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('A-Z');

    const initialFormState = {
        name: '', schoolType: 'HIGH_SCHOOL', phone: '', email: '',
        city: 'İstanbul', district: 'Kadıköy', neighborhood: '', address: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // Form için geçerli ilçeler
    const availableDistrictsForForm = locationData[formData.city] || [];
    // Filtre çubuğu için geçerli ilçeler
    const availableDistrictsForFilter = cityFilter !== 'ALL' ? locationData[cityFilter] || [] : [];

    useEffect(() => { fetchSchools(); }, []);

    const fetchSchools = async () => {
        try {
            const response = await api.get('/schools');
            setSchools(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Okullar çekilemedi:", err);
            setLoading(false);
        }
    };

    // 🚀 FİLTRELEME MOTORU (YENİ EKLENDİ)
    const filteredAndSortedSchools = schools.filter(school => {
        const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'ALL' || school.schoolType === typeFilter;
        const matchesCity = cityFilter === 'ALL' || school.city === cityFilter;
        const matchesDistrict = districtFilter === 'ALL' || school.district === districtFilter;

        return matchesSearch && matchesType && matchesCity && matchesDistrict;
    }).sort((a, b) => {
        if (sortOrder === 'A-Z') return a.name.localeCompare(b.name);
        if (sortOrder === 'Z-A') return b.name.localeCompare(a.name);
        return 0;
    });

    // Şehir değiştiğinde ilçeyi sıfırlama mantığı
    const handleCityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCityFilter(e.target.value);
        setDistrictFilter('ALL'); // Şehir değişirse ilçe "Tümü" olarak sıfırlanır
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
            await api.post('/schools', formData);
            goToList();
            fetchSchools();
            showToast('Kurum başarıyla kaydedildi ✅', 'success');
        } catch (err) { showToast("Kurum eklenirken hata oluştu!", 'error'); }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/schools/${selectedSchool?.id}`, formData);
            const updatedSchool = { ...selectedSchool, ...formData } as School;
            setSelectedSchool(updatedSchool);
            setViewMode('detail');
            fetchSchools();
            showToast('Kurum başarıyla güncellendi ✅', 'success');
        } catch (err) { showToast("Güncelleme başarısız oldu!", 'error'); }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Bu kurumu sistemden tamamen silmek istediğinize emin misiniz?")) {
            try {
                await api.delete(`/schools/${id}`);
                goToList();
                fetchSchools();
                showToast('Kurum sistemden silindi ✅', 'success');
            } catch (err) { showToast("Silme işlemi başarısız!", 'error'); }
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-400 font-medium animate-pulse">📡 Kurum verileri taranıyor...</div>;

    // ===========================================================================
    // 1. LİSTE (KARTLAR) EKRANI
    // ===========================================================================
    if (viewMode === 'list') {
        return (
            <div className="animate-fade-in-down h-full bg-slate-50 p-6 md:p-8 rounded-tl-3xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800">Kurum Yönetimi</h2>
                        <p className="text-slate-500 text-sm mt-1">Detayları görmek için kurum kartlarına tıklayın.</p>
                    </div>
                    <button onClick={openCreate} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-md font-bold shadow-md transition-all flex items-center gap-2 text-sm tracking-widest flex-shrink-0">
                        <span>➕</span> YENİ KURUM EKLE
                    </button>
                </div>

                {/* 🎛️ FİLTRELEME VE ARAMA KONTROL PANELİ */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col xl:flex-row gap-4">
                    {/* Arama Çubuğu */}
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Kurum adı ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-blue-700 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>

                    {/* Filtre Grubu */}
                    <div className="flex flex-wrap md:flex-nowrap gap-3">
                        {/* Kurum Türü */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full md:w-36 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold focus:bg-white focus:border-blue-700 outline-none transition-all cursor-pointer text-slate-700"
                        >
                            <option value="ALL">Tüm Türler</option>
                            <option value="HIGH_SCHOOL">Sadece Liseler</option>
                            <option value="PRIMARY_MIDDLE_SCHOOL">İlkokul / Ortaokul</option>
                        </select>

                        {/* İl Filtresi */}
                        <select
                            value={cityFilter}
                            onChange={handleCityFilterChange}
                            className="w-full md:w-36 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold focus:bg-white focus:border-blue-700 outline-none transition-all cursor-pointer text-slate-700"
                        >
                            <option value="ALL">Tüm İller</option>
                            {Object.keys(locationData).map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        {/* İlçe Filtresi (İle Bağlı) */}
                        <select
                            value={districtFilter}
                            onChange={(e) => setDistrictFilter(e.target.value)}
                            disabled={cityFilter === 'ALL'}
                            className={`w-full md:w-36 border rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all ${cityFilter === 'ALL' ? 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-700 cursor-pointer text-slate-700'}`}
                        >
                            <option value="ALL">Tüm İlçeler</option>
                            {availableDistrictsForFilter.map(dist => (
                                <option key={dist} value={dist}>{dist}</option>
                            ))}
                        </select>

                        {/* Sıralama */}
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full md:w-36 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold focus:bg-white focus:border-blue-700 outline-none transition-all cursor-pointer text-slate-700"
                        >
                            <option value="A-Z">İsim (A - Z)</option>
                            <option value="Z-A">İsim (Z - A)</option>
                        </select>
                    </div>
                </div>

                {/* KARTLARIN LİSTELENMESİ */}
                {filteredAndSortedSchools.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 py-20 text-center shadow-sm">
                        <span className="text-5xl block mb-4">🏫</span>
                        <h3 className="text-lg font-bold text-slate-700">Sonuç Bulunamadı</h3>
                        <p className="text-slate-500 text-sm mt-1">Arama kriterlerinize uygun bir kurum sistemde kayıtlı değil.</p>
                        <button onClick={() => {setSearchTerm(''); setTypeFilter('ALL'); setCityFilter('ALL'); setDistrictFilter('ALL');}} className="mt-6 text-blue-600 font-bold text-sm hover:underline">
                            Filtreleri Temizle
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedSchools.map((school) => (
                            <div key={school.id} onClick={() => openDetail(school)} className="bg-white p-6 rounded-md shadow-sm border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group relative overflow-hidden">
                                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${school.schoolType === 'HIGH_SCHOOL' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                                <div className="relative z-10">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border tracking-widest ${school.schoolType === 'HIGH_SCHOOL' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {school.schoolType === 'HIGH_SCHOOL' ? 'LİSE' : 'İLK/ORTAOKUL'}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 mt-3 mb-1 group-hover:text-blue-700 transition-colors line-clamp-1" title={school.name}>{school.name}</h3>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{school.city || 'Bilinmiyor'} / {school.district || 'Bilinmiyor'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                                    {availableDistrictsForForm.map(dist => <option key={dist} value={dist}>{dist}</option>)}
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