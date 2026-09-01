import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { showToast } from '../../utils/toast';

interface ClassroomInfo {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    firstName: string;
    lastName: string;
    branch: string;
    username?: string;
    phone?: string;
    email?: string;
    homeroomClasses?: ClassroomInfo[];
}

const TeacherTab: React.FC = () => {
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'form'>('list');
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [teacherForm, setTeacherForm] = useState({
        firstName: '',
        lastName: '',
        branch: '',
        username: '',
        password: '',
        phone: '',
        email: ''
    });

    const branchOptions = [
        'Almanca', 'Beden Eğitimi', 'Bilişim Teknolojileri', 'Biyoloji',
        'Coğrafya', 'Din Kültürü ve Ahlak Bilgisi', 'Felsefe', 'Fen Bilimleri',
        'Fizik', 'Görsel Sanatlar', 'İngilizce', 'Kimya', 'Matematik',
        'Müzik', 'Okul Öncesi', 'Rehberlik', 'Sınıf Öğretmenliği',
        'Sosyal Bilgiler', 'Tarih', 'Türk Dili ve Edebiyatı', 'Türkçe'
    ];

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/teachers');
            setTeachers(response.data);
        } catch (error) {
            console.error("Öğretmenler çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(t => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
        return fullName.includes(searchLower) || t.branch.toLowerCase().includes(searchLower);
    });

    const goToList = () => {
        setViewMode('list');
        setSelectedTeacher(null);
    };

    const openCreateForm = () => {
        setTeacherForm({ firstName: '', lastName: '', branch: '', username: '', password: '', phone: '', email: '' });
        setViewMode('form');
    };

    const handleRowClick = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setViewMode('detail');
    };

    const openEditForm = () => {
        if (selectedTeacher) {
            setTeacherForm({
                firstName: selectedTeacher.firstName,
                lastName: selectedTeacher.lastName,
                branch: selectedTeacher.branch,
                username: selectedTeacher.username || '',
                password: '',
                phone: selectedTeacher.phone || '',
                email: selectedTeacher.email || ''
            });
            setViewMode('form');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            firstName: teacherForm.firstName,
            lastName: teacherForm.lastName,
            branch: teacherForm.branch,
            username: teacherForm.username,
            password: teacherForm.password,
            phone: teacherForm.phone,
            email: teacherForm.email
        };

        try {
            if (selectedTeacher) {
                await api.put(`/teachers/${selectedTeacher.id}`, payload);
                showToast("Öğretmen bilgileri başarıyla güncellendi! ✅", 'success');
            } else {
                await api.post('/teachers', payload);
                showToast("Öğretmen başarıyla sisteme kaydedildi! 👨‍🏫", 'success');
            }

            goToList();
            fetchTeachers();
        } catch (error) {
            console.error(error);
            showToast("İşlem sırasında bir hata oluştu. Kullanıcı adı zaten kullanımda olabilir!", 'error');
        }
    };

    const handleDeleteTeacher = async () => {
        if (!selectedTeacher) return;
        if (!window.confirm("Bu öğretmeni sistemden tamamen silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/teachers/${selectedTeacher.id}`);
            goToList();
            fetchTeachers();
        } catch (error) {
            console.error(error);
            showToast("Öğretmen silinemedi!", 'error');
        }
    };

    if (viewMode === 'list') {
        return (
            <div className="animate-fade-in-down h-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Öğretmen Kadrosu</h2>
                        <p className="text-slate-500 text-sm mt-1">Detayları görmek için listedeki satırlara tıklayın.</p>
                    </div>
                    <button onClick={openCreateForm} className="btn-primary px-5 py-2.5 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 text-sm tracking-wide">
                        <span>➕</span> YENİ ÖĞRETMEN EKLE
                    </button>
                </div>

                <div className="glass-panel p-4 rounded-xl shadow-lg border border-white/40 mb-6 flex gap-4">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Öğretmen adı, soyadı veya branşı ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border border-white/40 rounded-lg pl-11 pr-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="glass-panel border border-white/40 rounded-xl shadow-lg flex-1 overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 font-medium animate-pulse">Öğretmenler yükleniyor...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-transparent border-b border-white/40">
                                <tr className="text-slate-500 text-xs uppercase tracking-wider font-bold">
                                    <th className="p-4 pl-6">Ad Soyad</th>
                                    <th className="p-4">Branş</th>
                                    <th className="p-4">İletişim</th>
                                    <th className="p-4">Sorumlu Olduğu Sınıf</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {filteredTeachers.map((teacher) => (
                                    <tr key={teacher.id} onClick={() => handleRowClick(teacher)} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                        <td className="p-4 pl-6">
                                            <div className="font-bold text-slate-900">{teacher.firstName} {teacher.lastName}</div>
                                            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                @{teacher.username || 'KULLANICI ADI YOK'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-bold text-xs tracking-widest uppercase">
                                                    {teacher.branch}
                                                </span>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-600">
                                            {teacher.phone || <span className="text-slate-400 italic">Belirtilmemiş</span>}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-600">
                                            {teacher.homeroomClasses && teacher.homeroomClasses.length > 0
                                                ? teacher.homeroomClasses.map(c => c.name).join(', ')
                                                : <span className="text-slate-400 italic">Atanmamış</span>}
                                        </td>
                                    </tr>
                                ))}
                                {filteredTeachers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center text-slate-400 font-medium">Sistemde öğretmen bulunamadı.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (viewMode === 'detail' && selectedTeacher) {
        return (
            <div className="animate-fade-in-right h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/40">
                    <button onClick={goToList} className="text-slate-500 hover:text-slate-900 glass-panel border border-slate-300 px-4 py-2 rounded-lg transition-all shadow-lg font-bold text-sm tracking-wider">
                        ⬅️ GERİ DÖN
                    </button>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800 tracking-tight uppercase">Öğretmen Profili</h2>
                </div>

                <div className="glass-panel rounded-2xl shadow-lg border border-white/40 overflow-hidden mb-6 max-w-4xl mx-auto w-full">

                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 md:p-10 text-white flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>

                        {/* 🚀 ÇÖKME KORUMASI: Optional chaining ve varsayılan değerler eklendi */}
                        <div className="w-24 h-24 glass-panel/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center text-4xl font-bold tracking-tight text-slate-800 shadow-inner border border-white/20 relative z-10 shrink-0">
                            {selectedTeacher.firstName?.charAt(0) || ''}{selectedTeacher.lastName?.charAt(0) || ''}
                        </div>
                        <div className="relative z-10 text-center md:text-left flex-1">
                            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 tracking-tight mb-2">{selectedTeacher.firstName} {selectedTeacher.lastName}</h3>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                                <span className="px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    {selectedTeacher.branch} ÖĞRETMENİ
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-2">İletişim & Sistem Bilgileri</h4>
                            <div className="space-y-5">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Sistem Kullanıcı Adı</p>
                                    <p className="text-base font-bold text-slate-900 mt-1">@{selectedTeacher.username || 'Atanmamış'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Cep Telefonu</p>
                                    <p className="text-base font-bold text-slate-900 mt-1">{selectedTeacher.phone || 'Belirtilmemiş'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">E-Posta Adresi</p>
                                    <p className="text-base font-semibold text-slate-700 mt-1">{selectedTeacher.email || 'Belirtilmemiş'}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 pb-2">Kurum İçi Görevler</h4>
                            <div className="space-y-5">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">Rehberliği Üstlenilen Sınıflar</p>
                                    {selectedTeacher.homeroomClasses && selectedTeacher.homeroomClasses.length > 0 ? (
                                        <div className="flex gap-2 flex-wrap">
                                            {selectedTeacher.homeroomClasses.map(c => (
                                                <span key={c.id} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-bold text-sm">
                                                    {c.name} Sınıfı
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-medium text-slate-400 italic bg-transparent p-3 rounded-lg border border-slate-100">Sorumlu olduğu bir sınıf bulunmuyor.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-transparent border-t border-white/40 flex justify-end gap-3">
                        <button onClick={handleDeleteTeacher} className="glass-panel border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-lg font-bold text-sm tracking-widest transition-all shadow-lg">
                            SİSTEMDEN SİL
                        </button>
                        <button onClick={openEditForm} className="bg-slate-900 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold text-sm tracking-widest shadow-lg transition-all">
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
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/40">
                    <button onClick={selectedTeacher ? () => setViewMode('detail') : goToList} className="text-slate-500 hover:text-slate-900 glass-panel border border-slate-300 px-4 py-2 rounded-lg transition-all shadow-lg font-bold text-sm">
                        ⬅️ İPTAL
                    </button>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800 tracking-tight">
                        {selectedTeacher ? 'Öğretmen Bilgilerini Güncelle' : 'Yeni Öğretmen Kaydı'}
                    </h2>
                </div>

                <div className="glass-panel rounded-xl shadow-lg border border-white/40 p-8 max-w-4xl">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        <section>
                            <h3 className="text-lg font-bold text-emerald-700 border-b border-slate-100 pb-2 mb-4">1. Kişisel Bilgiler ve Branş</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Ad *</label>
                                    <input required type="text" value={teacherForm.firstName} onChange={e => setTeacherForm({...teacherForm, firstName: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-emerald-500 outline-none" placeholder="Örn: Ahmet" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Soyad *</label>
                                    <input required type="text" value={teacherForm.lastName} onChange={e => setTeacherForm({...teacherForm, lastName: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-emerald-500 outline-none" placeholder="Örn: Yılmaz" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Branş *</label>
                                    <select
                                        required
                                        value={teacherForm.branch}
                                        onChange={e => setTeacherForm({...teacherForm, branch: e.target.value})}
                                        className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-emerald-500 outline-none cursor-pointer"
                                    >
                                        <option value="" disabled>Branş Seçiniz...</option>
                                        {branchOptions.map(branch => (
                                            <option key={branch} value={branch}>{branch}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-blue-700 border-b border-slate-100 pb-2 mb-4">2. Sistem Giriş ve İletişim Bilgileri</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Sistem Kullanıcı Adı *</label>
                                    <input required type="text" value={teacherForm.username} onChange={e => setTeacherForm({...teacherForm, username: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-500 outline-none" placeholder="Örn: ahmet.yilmaz" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                                        {selectedTeacher ? 'Sistem Şifresi (Değiştirmek İstemiyorsanız Boş Bırakın)' : 'Sistem Şifresi *'}
                                    </label>
                                    <input required={!selectedTeacher} type="password" value={teacherForm.password} onChange={e => setTeacherForm({...teacherForm, password: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-500 outline-none" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Cep Telefonu *</label>
                                    <input required type="text" value={teacherForm.phone} onChange={e => setTeacherForm({...teacherForm, phone: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-500 outline-none" placeholder="05XX XXX XX XX" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">E-Posta Adresi (İsteğe Bağlı)</label>
                                    <input type="email" value={teacherForm.email} onChange={e => setTeacherForm({...teacherForm, email: e.target.value})} className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-500 outline-none" placeholder="ahmet@okul.com" />
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end pt-6 mt-6 border-t border-white/40">
                            <button type="submit" className="btn-primary font-bold py-3 px-10 rounded-xl transition-all shadow-lg">
                                {selectedTeacher ? 'DEĞİŞİKLİKLERİ KAYDET' : 'ÖĞRETMENİ SİSTEME KAYDET'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return null;
};

export default TeacherTab;