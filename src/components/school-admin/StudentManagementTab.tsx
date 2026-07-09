import React, { useState, useEffect } from 'react';
import { api } from '../../services/api'; // 🚀 Axios yerine kendi API memurumuzu kullanıyoruz
import { showToast } from '../../utils/toast';

// --- ŞABLONLAR ---
interface Student {
    id: number;
    firstName: string;
    lastName: string;
    schoolNumber: string;
    grade: string;
    parentFullName: string;
    username: string;
    gender?: string;
    phone?: string;
    email?: string;
}

interface Parent {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

interface Classroom {
    id: number;
    name: string;
}

const StudentManagementTab: React.FC = () => {
    // 🎛️ Arayüz Durumları
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'form'>('list');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // 🔍 Arama ve Filtreleme
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('ALL'); // 🚀 YENİ EKLENDİ

    // 📡 Veri Durumları
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<Parent[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [schoolType, setSchoolType] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', schoolNumber: '', grade: '', gender: 'Belirtilmemiş', parentId: '',
        username: '', password: '', phone: '', email: '' // 🚀 EKLENDİ
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // api.ts sayesinde header göndermeye gerek kalmadı!
            const [userRes, studentsRes, parentsRes, classroomsRes] = await Promise.allSettled([
                api.get('/users/me'),
                api.get('/students/list'),
                api.get('/parents'),
                api.get('/classrooms/school')
            ]);

            if (userRes.status === 'fulfilled') setSchoolType(userRes.value.data.schoolType || 'HIGH_SCHOOL');
            if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value.data);
            if (parentsRes.status === 'fulfilled') setParents(parentsRes.value.data);
            if (classroomsRes.status === 'fulfilled') setClassrooms(classroomsRes.value.data);

        } catch (err) {
            console.error("Veri çekme hatası:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🚀 GELİŞMİŞ FİLTRELEME MOTORU
    const filteredStudents = students.filter(s => {
        const matchesSearch =
            s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.schoolNumber.includes(searchTerm);

        const matchesClass = classFilter === 'ALL' || s.grade === classFilter;

        return matchesSearch && matchesClass;
    });

    const goToList = () => {
        setViewMode('list');
        setSelectedStudent(null);
    };

    const openCreateForm = () => {
        setFormData({ firstName: '', lastName: '', schoolNumber: '', grade: '', gender: 'Belirtilmemiş', parentId: '', username: '', password: '', phone: '', email: '' });
        setViewMode('form');
    };

    const handleViewDetail = (student: Student) => {
        setSelectedStudent(student);
        setViewMode('detail');
    };

    const openEditForm = (student: Student) => {
        setSelectedStudent(student);
        const currentParent = parents.find(p => `${p.firstName} ${p.lastName}` === student.parentFullName);

        setFormData({
            firstName: student.firstName, lastName: student.lastName, schoolNumber: student.schoolNumber,
            grade: student.grade || '', gender: student.gender || 'Belirtilmemiş',
            parentId: currentParent ? currentParent.id.toString() : '',
            username: student.username || '', password: '',
            phone: student.phone || '', // 🚀 EKLENDİ
            email: student.email || ''  // 🚀 EKLENDİ
        });
        setViewMode('form');
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`${name} adlı öğrenciyi sistemden silmek istediğinize emin misiniz?`)) {
            try {
                await api.delete(`/students/${id}`);
                fetchInitialData();
                goToList();
                showToast('Öğrenci sistemden silindi ✅', 'success');
            } catch (err) {
                console.error(err);
                showToast("Silme işlemi sırasında bir hata oluştu!", 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, parentId: formData.parentId ? Number(formData.parentId) : null };

            if (selectedStudent) {
                await api.put(`/students/${selectedStudent.id}`, payload);
                showToast('Öğrenci bilgileri güncellendi! ✅', 'success');
            } else {
                await api.post('/students/create', payload);
                showToast('Öğrenci başarıyla kaydedildi! 🎓', 'success');
            }
            goToList();
            fetchInitialData();
        } catch (err: any) {
            console.error(err);
            showToast("İşlem sırasında hata oluştu! Numara veya kullanıcı adı zaten sistemde olabilir.", 'error');
        }
    };

    // 🎨 Cinsiyete Göre Renk Rozeti
    const getGenderBadge = (gender?: string) => {
        if (gender === 'Kız') return <span className="bg-pink-50 text-pink-600 border border-pink-200 px-2.5 py-1 rounded-md font-bold text-xs">Kız</span>;
        if (gender === 'Erkek') return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-md font-bold text-xs">Erkek</span>;
        return <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-md font-bold text-xs">Belirtilmemiş</span>;
    };

    if (loading) return <div className="text-center py-20 text-slate-400 font-medium animate-pulse">📡 Öğrenci verileri taranıyor...</div>;

    // ===========================================================================
    // 1. LİSTE GÖRÜNÜMÜ (BANKA TEMASI)
    // ===========================================================================
    if (viewMode === 'list') {
        return (
            <div className="animate-fade-in-down h-full bg-slate-50 p-6 md:p-8 rounded-tl-3xl flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Öğrenci Yönetimi</h2>
                        <p className="text-slate-500 text-sm mt-1">Sistemdeki tüm öğrencileri ve sınıflarını buradan yönetebilirsiniz.</p>
                    </div>
                    <button onClick={openCreateForm} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-md font-bold shadow-md transition-all flex items-center gap-2 text-sm tracking-widest flex-shrink-0">
                        <span>➕</span> YENİ ÖĞRENCİ EKLE
                    </button>
                </div>

                {/* 🎛️ FİLTRE VE ARAMA ÇUBUĞU */}
                <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 flex-shrink-0">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Öğrenci adı, soyadı veya numarası ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-11 pr-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-blue-700 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-blue-700 outline-none transition-all cursor-pointer text-slate-700"
                        >
                            <option value="ALL">Tüm Sınıflar</option>
                            {classrooms.map(c => (
                                <option key={c.id} value={c.name}>{c.name} Sınıfı</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 📊 TABLO EKRANI */}
                <div className="bg-white border border-slate-200 rounded-md shadow-sm flex-1 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                <th className="p-5 pl-6 whitespace-nowrap">Okul No</th>
                                <th className="p-5 whitespace-nowrap">Öğrenci Adı Soyadı</th>
                                <th className="p-5 whitespace-nowrap">Sınıf</th>
                                <th className="p-5 whitespace-nowrap">Cinsiyet</th>
                                <th className="p-5 pr-6 text-right whitespace-nowrap">İşlemler</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">Arama kriterlerine uygun öğrenci bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} onClick={() => handleViewDetail(student)} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                        <td className="p-5 pl-6 text-sm font-black text-slate-700 w-24">
                                            {student.schoolNumber}
                                        </td>
                                        <td className="p-5">
                                            <div className="font-bold text-slate-800">{student.firstName} {student.lastName}</div>
                                            {schoolType === 'HIGH_SCHOOL' && student.username && (
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                    @{student.username}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-bold text-xs tracking-widest uppercase">
                                                {student.grade || 'ATANMADI'}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            {getGenderBadge(student.gender)}
                                        </td>
                                        <td className="p-5 pr-6 text-right flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleViewDetail(student)} className="bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 px-3 py-1.5 rounded-md font-bold text-xs transition-all shadow-sm">
                                                DETAY
                                            </button>
                                            <button onClick={() => handleDelete(student.id, student.firstName)} className="bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 px-3 py-1.5 rounded-md font-bold text-xs transition-all shadow-sm">
                                                SİL
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // ===========================================================================
    // 2. DETAY GÖRÜNÜMÜ (PROFİL KARTI)
    // ===========================================================================
    if (viewMode === 'detail' && selectedStudent) {
        return (
            <div className="animate-fade-in-right h-full bg-slate-50 p-6 md:p-8 rounded-tl-3xl flex flex-col">
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-200">
                    <button onClick={goToList} className="text-slate-500 hover:text-slate-900 bg-white border border-slate-300 p-2 rounded-md transition-all shadow-sm font-bold px-4 text-sm tracking-wider">
                        GERİ DÖN
                    </button>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Öğrenci Profili</h2>
                </div>

                <div className="max-w-4xl mx-auto w-full">
                    <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">

                        {/* Profil Üst Kısım - Lacivert Arka Plan */}
                        <div className="bg-[#1e293b] p-8 text-white flex items-center gap-6 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

                            <div className="w-20 h-20 bg-slate-700/50 text-white rounded-md flex items-center justify-center text-3xl font-black shadow-inner border border-slate-600 relative z-10">
                                {selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                                <div className="mt-3 flex gap-2">
                                    <span className="px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase bg-[#10b981] text-white">
                                        SINIF: {selectedStudent.grade || 'ATANMADI'}
                                    </span>
                                    <span className="px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase bg-slate-700 text-slate-300 border border-slate-600">
                                        NO: {selectedStudent.schoolNumber}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Detaylar Kısımı */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Kişisel Bilgiler</h4>
                                <div className="space-y-4">
                                    {schoolType === 'HIGH_SCHOOL' && (
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase">Sistem Kullanıcı Adı</p>
                                            <p className="text-sm font-bold text-slate-900 mt-0.5">
                                                {selectedStudent.username ? `@${selectedStudent.username}` : <span className="text-slate-400 italic">Belirtilmemiş</span>}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Cinsiyet</p>
                                        {getGenderBadge(selectedStudent.gender)}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Aile & İletişim Bilgileri</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Sorumlu Veli</p>
                                        <p className={`text-sm font-bold mt-0.5 ${selectedStudent.parentFullName ? 'text-slate-900' : 'text-amber-600'}`}>
                                            {selectedStudent.parentFullName || 'Sisteme Veli Atanmamış'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Aksiyon Butonları */}
                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                            <button onClick={() => handleDelete(selectedStudent.id, selectedStudent.firstName)} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-md font-bold text-sm tracking-widest transition-all shadow-sm">
                                SİSTEMDEN SİL
                            </button>
                            <button onClick={() => openEditForm(selectedStudent)} className="bg-[#0f172a] hover:bg-blue-700 text-white px-8 py-2.5 rounded-md font-bold text-sm tracking-widest shadow-md transition-all">
                                BİLGİLERİ DÜZENLE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ===========================================================================
    // 3. AKILLI FORM GÖRÜNÜMÜ
    // ===========================================================================
    if (viewMode === 'form') {
        return (
            <div className="animate-fade-in-right h-full bg-slate-50 p-6 md:p-8 rounded-tl-3xl flex flex-col">
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-200">
                    <button onClick={selectedStudent ? () => setViewMode('detail') : goToList} className="text-slate-500 hover:text-slate-900 bg-white border border-slate-300 p-2 rounded-md transition-all shadow-sm font-bold px-4 text-sm tracking-wider">
                        İPTAL
                    </button>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                        {selectedStudent ? 'Öğrenci Bilgilerini Güncelle' : 'Yeni Öğrenci Kaydı'}
                    </h2>
                </div>

                <div className="max-w-4xl mx-auto w-full bg-white p-8 md:p-10 rounded-md shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Aşama */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-6 text-emerald-700">1. Öğrenci Temel Bilgileri</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Ad *</label>
                                    <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Soyad *</label>
                                    <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Okul Numarası *</label>
                                    <input required type="text" value={formData.schoolNumber} onChange={e => setFormData({...formData, schoolNumber: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all placeholder:text-slate-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Cinsiyet</label>
                                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all cursor-pointer">
                                        <option value="Belirtilmemiş">Belirtilmemiş</option>
                                        <option value="Kız">Kız</option>
                                        <option value="Erkek">Erkek</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Kayıtlı Olduğu Sınıf *</label>
                                    <select required value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all cursor-pointer">
                                        <option value="" disabled>Sınıf Seçiniz</option>
                                        {classrooms.map(c => (
                                            <option key={c.id} value={c.name}>{c.name} Sınıfı</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* 2. Aşama */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-6 text-blue-700">2. Veli Ataması (İsteğe Bağlı)</h3>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Kayıtlı Velilerden Seçin</label>
                                <select value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-blue-700 outline-none transition-all cursor-pointer">
                                    <option value="">-- Şimdilik Veli Atama (Boş Bırak) --</option>
                                    {parents.map(p => (
                                        <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (Tel: {p.phoneNumber})</option>
                                    ))}
                                </select>
                            </div>
                        </section>

                        {/* 3. Aşama (Sadece Liseler İçin) */}
                        {/* 3. Aşama (Sadece Liseler İçin) */}
                        {schoolType === 'HIGH_SCHOOL' && (
                            <section className="animate-fade-in">
                                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-6 text-purple-700">3. Öğrenci Sistem Giriş & İletişim Bilgileri (Lise)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Sistem Kullanıcı Adı *</label>
                                        <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-purple-700 outline-none transition-all placeholder:text-slate-400" placeholder="Örn: ahmet.yilmaz" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">{selectedStudent ? 'Şifre (Değişmeyecekse Boş Bırak)' : 'Sistem Giriş Şifresi *'}</label>
                                        <input required={!selectedStudent} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-purple-700 outline-none transition-all placeholder:text-slate-400" placeholder="••••••••" />
                                    </div>
                                    {/* 🚀 YENİ İLETİŞİM ALANLARI */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Öğrenci Telefon Numarası *</label>
                                        <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-purple-700 outline-none transition-all placeholder:text-slate-400" placeholder="05XX XXX XX XX" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Öğrenci E-Posta (İsteğe Bağlı)</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-md px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-purple-700 outline-none transition-all placeholder:text-slate-400" placeholder="ogrenci@mail.com" />
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-200">
                            <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-md font-bold text-sm tracking-widest shadow-md transition-all">
                                {selectedStudent ? 'DEĞİŞİKLİKLERİ UYGULA' : 'ÖĞRENCİYİ SİSTEME KAYDET'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return null;
};

export default StudentManagementTab;