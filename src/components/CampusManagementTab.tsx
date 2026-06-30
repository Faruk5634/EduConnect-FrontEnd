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

// 🗺️ Örnek İl ve İlçe Veritabanı
const locationData: Record<string, string[]> = {
    "İstanbul": ["Kadıköy", "Ümraniye", "Çekmeköy", "Üsküdar", "Beşiktaş", "Şişli"],
    "Ankara": ["Çankaya", "Keçiören", "Yenimahalle"],
    "İzmir": ["Bornova", "Karşıyaka", "Konak"],
    "Batman": ["Merkez", "Hasankeyf", "Kozluk"]
};

const CampusManagementTab: React.FC = () => {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);

    // 🚪 Modal Kontrolleri
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null); // Detay/Düzenleme için
    const [isEditing, setIsEditing] = useState(false);

    // 📝 Form Hafızası
    const initialFormState = {
        name: '', schoolType: 'HIGH_SCHOOL', phone: '', email: '',
        city: 'İstanbul', district: 'Kadıköy', neighborhood: '', address: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // Seçilen şehre göre ilçeleri filtrele
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

    // ➕ YENİ OKUL EKLEME
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/schools', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsCreateModalOpen(false);
            setFormData(initialFormState);
            fetchSchools();
        } catch (err) { alert("Okul eklenirken hata oluştu!"); }
    };

    // 🗑️ OKUL SİLME
    const handleDelete = async (id: number) => {
        if (window.confirm("Bu kampüsü tamamen silmek istediğine emin misin Kaptan?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8080/api/schools/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSelectedSchool(null);
                fetchSchools();
            } catch (err) { alert("Silme işlemi başarısız!"); }
        }
    };

    // ✏️ OKUL GÜNCELLEME (Bunun için Backend'e küçük bir PUT ekleyeceğiz)
    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Not: Spring Boot'ta bu uç noktayı (PUT) bir sonraki adımda yazacağız!
            await axios.put(`http://localhost:8080/api/schools/${selectedSchool?.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedSchool(null);
            setIsEditing(false);
            fetchSchools();
        } catch (err) { alert("Güncelleme başarısız oldu!"); }
    };

    // Karta tıklandığında detayları aç
    const openDetail = (school: School) => {
        setSelectedSchool(school);
        setIsEditing(false);
        setFormData({
            name: school.name, schoolType: school.schoolType, phone: school.phone || '',
            email: school.email || '', city: school.city || 'İstanbul',
            district: school.district || '', neighborhood: school.neighborhood || '',
            address: school.address || ''
        });
    };

    if (loading) return <div className="py-20 text-center animate-pulse text-slate-400">📡 Kampüsler Taranıyor...</div>;

    return (
        <div className="animate-fade-in-down">

            {/* 🏛️ Üst Bar */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Kampüs Yönetimi</h2>
                    <p className="text-slate-500 text-sm mt-1">Kartların üzerine tıklayarak detayları görebilir ve düzenleyebilirsin.</p>
                </div>
                <button onClick={() => { setFormData(initialFormState); setIsCreateModalOpen(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all">
                    ➕ Yeni Kampüs Ekle
                </button>
            </div>

            {/* 🏙️ Tıklanabilir Kampüs Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((school) => (
                    <div key={school.id} onClick={() => openDetail(school)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden">
                        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${school.schoolType === 'HIGH_SCHOOL' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                        <div className="relative z-10">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${school.schoolType === 'HIGH_SCHOOL' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                {school.schoolType === 'HIGH_SCHOOL' ? 'LİSE' : 'İLK/ORTAOKUL'}
              </span>
                            <h3 className="text-xl font-bold text-slate-800 mt-3 mb-1 group-hover:text-blue-600 transition-colors">{school.name}</h3>
                            <p className="text-slate-500 text-sm">{school.city || 'Şehir Yok'} / {school.district || 'İlçe Yok'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 📝 YENİ KAMPÜS VEYA DETAY/DÜZENLEME MODALI */}
            {(isCreateModalOpen || selectedSchool) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-800">
                                {isCreateModalOpen ? 'Yeni Kampüs İnşası' : isEditing ? 'Kampüsü Düzenle' : 'Kampüs Detayları'}
                            </h3>
                            <button onClick={() => { setIsCreateModalOpen(false); setSelectedSchool(null); }} className="text-slate-400 hover:text-red-500 text-3xl transition-colors">&times;</button>
                        </div>

                        {/* Form Alanı (Hem Ekleme Hem Düzenleme İçin Ortak Kullanım) */}
                        <form onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit} className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Okul Adı *</label>
                                    <input type="text" required disabled={selectedSchool && !isEditing} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Okul Türü *</label>
                                    <select required disabled={selectedSchool && !isEditing} value={formData.schoolType} onChange={e => setFormData({...formData, schoolType: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70">
                                        <option value="HIGH_SCHOOL">Lise</option>
                                        <option value="PRIMARY_MIDDLE_SCHOOL">İlkokul / Ortaokul</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">İl *</label>
                                    <select required disabled={selectedSchool && !isEditing} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value, district: locationData[e.target.value]?.[0] || ''})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70">
                                        {Object.keys(locationData).map(city => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">İlçe *</label>
                                    <select required disabled={selectedSchool && !isEditing} value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70">
                                        {availableDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Mahalle *</label>
                                    <input type="text" required disabled={selectedSchool && !isEditing} value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Telefon *</label>
                                    <input type="text" required disabled={selectedSchool && !isEditing} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">E-posta (İsteğe Bağlı)</label>
                                    <input type="email" disabled={selectedSchool && !isEditing} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Açık Adres *</label>
                                <textarea required rows={2} disabled={selectedSchool && !isEditing} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-70 resize-none"></textarea>
                            </div>

                            {/* BUTONLAR (Duruma Göre Değişir) */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                {isCreateModalOpen ? (
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Kampüsü Ekle</button>
                                ) : (
                                    <>
                                        {!isEditing ? (
                                            <>
                                                <button type="button" onClick={() => handleDelete(selectedSchool!.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-3 rounded-xl font-bold">Kampüsü Sil</button>
                                                <button type="button" onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold">Düzenle</button>
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

export default CampusManagementTab;