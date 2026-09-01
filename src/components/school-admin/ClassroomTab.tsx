import { School } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { showToast } from '../../utils/toast';
import { useClassrooms } from '../../hooks/useClassrooms';

// --- ŞABLONLAR (INTERFACES) ---
interface Classroom {
    id: number;
    name: string;
    gradeLevel: number;
    homeroomTeacherFullName: string;
    studentNames?: string[];
}

const ClassroomTab: React.FC = () => {
    const { classrooms, teachers, classStudents, schoolType, loading, fetchInitialData, fetchClassStudents, createOrUpdateClass, deleteClass, deleteStudent } = useClassrooms();

    // 🎛️ Arayüz Durumları
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'form'>('list');
    const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);

    // 🔍 Arama ve Filtreleme Durumları (YENİ EKLENDİ)
    const [searchTerm, setSearchTerm] = useState('');
    const [gradeFilter, setGradeFilter] = useState('ALL');

    // 📝 Akıllı Form Durumu
    const [classForm, setClassForm] = useState({
        gradeLevel: '',
        branch: '',
        teacherId: ''
    });

    // 🧠 DİNAMİK KADEME SEÇENEKLERİ
    let gradeOptions: string[] = [];
    if (schoolType === 'PRIMARY_MIDDLE_SCHOOL') {
        gradeOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];
    } else if (schoolType === 'HIGH_SCHOOL') {
        gradeOptions = ['9', '10', '11', '12'];
    } else {
        gradeOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    }

    const branchOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

    // 🧠 Otomatik Sınıf Adı Üretici (Örn: 10 ve E seçilince 10-E yapar)
    const generatedClassName = classForm.gradeLevel && classForm.branch
        ? `${classForm.gradeLevel}-${classForm.branch}`
        : '';

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Data loading & mutations are handled by useClassrooms hook (fetchInitialData, fetchClassStudents, createOrUpdateClass, ...)

    // NOTE: useClassrooms provides fetchInitialData and fetchClassStudents which are used elsewhere in this component.

    // 🚀 FİLTRELEME MOTORU (YENİ EKLENDİ)
    const filteredClassrooms = classrooms.filter(cls => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            cls.name.toLowerCase().includes(searchLower) ||
            (cls.homeroomTeacherFullName && cls.homeroomTeacherFullName.toLowerCase().includes(searchLower));

        const matchesGrade = gradeFilter === 'ALL' || cls.gradeLevel.toString() === gradeFilter;

        return matchesSearch && matchesGrade;
    });

    // --- ARAYÜZ YÖNLENDİRMELERİ ---
    const goToList = () => {
        setViewMode('list');
        setSelectedClass(null);
    };

    const openCreateForm = () => {
        setClassForm({ gradeLevel: '', branch: '', teacherId: '' });
        setViewMode('form');
    };

    const handleCardClick = (cls: Classroom) => {
        setSelectedClass(cls);
        fetchClassStudents(cls.name);
        setViewMode('detail');
    };

    const openEditForm = () => {
        if (selectedClass) {
            const [grade, branch] = selectedClass.name.split('-');
            const currentTeacher = teachers.find(t => `${t.firstName} ${t.lastName}` === selectedClass.homeroomTeacherFullName);

            setClassForm({
                gradeLevel: grade || selectedClass.gradeLevel.toString(),
                branch: branch || '',
                teacherId: currentTeacher ? currentTeacher.id.toString() : ''
            });
            setViewMode('form');
        }
    };

    // --- İŞLEM MOTORLARI ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!generatedClassName) {
            showToast("Lütfen Kademe ve Şube seçimini eksiksiz yapın!", 'error');
             return;
         }

        const isDuplicate = classrooms.some(c => c.name === generatedClassName && c.id !== selectedClass?.id);
        if (isDuplicate) {
            showToast(`${generatedClassName} sınıfı zaten kayıtlıdır. Lütfen farklı bir şube seçiniz.`, 'error');
             return;
        }

        try {
            await createOrUpdateClass({ name: generatedClassName, gradeLevel: Number(classForm.gradeLevel), teacherId: classForm.teacherId || undefined }, selectedClass?.id ?? undefined);
            showToast(selectedClass ? "Sınıf bilgileri başarıyla güncellendi! ✅" : "Sınıf başarıyla oluşturuldu! 🏫", 'success');
            goToList();
            fetchInitialData();
        } catch (error) {
            console.error(error);
            showToast("İşlem sırasında bir hata oluştu!", 'error');
        }
    };

    const handleDeleteClass = async () => {
        if (!selectedClass) return;
        if (!window.confirm("Bu sınıfı silmek istediğinize emin misiniz? (Öğrenciler silinmez, sadece sınıf kaydı silinir)")) return;
        try {
            await deleteClass(selectedClass.id);
            goToList();
            fetchInitialData();
        } catch (error) {
            console.error(error);
            showToast("Sınıf silinemedi!", 'error');
        }
    };

    const handleDeleteStudent = async (id: number) => {
        if (!window.confirm("Bu öğrenciyi sistemden silmek istediğinize emin misiniz?")) return;
        try {
            await deleteStudent(id);
        } catch (error) {
            console.error(error);
            showToast("Öğrenci silinemedi!", 'error');
        }
    };

    // ===========================================================================
    // 1. LİSTE GÖRÜNÜMÜ
    // ===========================================================================
    if (viewMode === 'list') {
        return (
            <div className="animate-fade-in-down h-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Mevcut Sınıflar</h2>
                        <p className="text-slate-500 text-sm mt-1">Öğrenci listesini ve detayları görmek için sınıf kartlarına tıklayın.</p>
                    </div>
                    <button onClick={openCreateForm} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 text-sm tracking-wide">
                        <span>➕</span> YENİ SINIF OLUŞTUR
                    </button>
                </div>

                {/* 🔍 ARAMA VE FİLTRELEME ÇUBUĞU (YENİ EKLENDİ) */}
                <div className="glass-panel p-4 rounded-xl shadow-lg border border-white/40 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Sınıf adı veya rehber öğretmen ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border border-white/40 rounded-lg pl-11 pr-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <div className="w-full md:w-56">
                        <select
                            value={gradeFilter}
                            onChange={(e) => setGradeFilter(e.target.value)}
                            className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-2.5 text-sm font-semibold focus:glass-panel focus:border-blue-500 outline-none transition-all cursor-pointer text-slate-700"
                        >
                            <option value="ALL">Tüm Kademeler</option>
                            {gradeOptions.map(grade => (
                                <option key={grade} value={grade}>{grade}. Sınıf</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 font-medium animate-pulse">Sınıflar yükleniyor...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                        {filteredClassrooms.map((cls) => (
                            <div
                                key={cls.id}
                                onClick={() => handleCardClick(cls)}
                                className="glass-panel border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4 relative z-10">
                                    <h2 className="text-3xl font-bold tracking-tight text-slate-800 text-blue-700">{cls.name}</h2>
                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg font-bold text-xs tracking-widest">
                                        {cls.gradeLevel}. SINIF
                                    </span>
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">👨‍🏫 REHBER ÖĞRETMEN</p>
                                        {cls.homeroomTeacherFullName !== "Rehber Öğretmen Atanmadı" && cls.homeroomTeacherFullName
                                            ? <p className="text-sm font-bold text-emerald-600 truncate">{cls.homeroomTeacherFullName}</p>
                                            : <p className="text-sm font-medium text-red-400 italic">Atanmadı</p>}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">🎓 MEVCUT</p>
                                        <p className="text-sm font-bold text-slate-800">{cls.studentNames ? cls.studentNames.length : 0} Öğrenci</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredClassrooms.length === 0 && (
                            <div className="col-span-full text-center py-16 glass-panel rounded-2xl border border-white/40">
                                <span className="text-5xl block mb-4"><School className="w-12 h-12 mx-auto" /></span>
                                <h3 className="text-lg font-bold text-slate-700">Sınıf Bulunamadı</h3>
                                <p className="text-slate-500 text-sm mt-1">Arama kriterlerine uygun veya sistemde kayıtlı bir sınıf yok.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ===========================================================================
    // 2. DETAY GÖRÜNÜMÜ (Öğrenci Listesi)
    // ===========================================================================
    if (viewMode === 'detail' && selectedClass) {
        return (
            <div className="animate-fade-in-right h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/40">
                    <button onClick={goToList} className="text-slate-500 hover:text-slate-900 glass-panel border border-slate-300 px-4 py-2 rounded-lg transition-all shadow-lg font-bold text-sm">
                        ⬅️ GERİ DÖN
                    </button>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800 tracking-tight">{selectedClass.name} Sınıfı Detayları</h2>
                </div>

                <div className="glass-panel rounded-xl shadow-lg border border-white/40 overflow-hidden mb-6">
                    <div className="bg-slate-800 p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <p className="text-blue-300 font-bold tracking-widest uppercase text-xs mb-1">Rehber Öğretmen</p>
                            <h3 className="text-2xl font-bold tracking-tight text-slate-800">{selectedClass.homeroomTeacherFullName !== "Rehber Öğretmen Atanmadı" && selectedClass.homeroomTeacherFullName ? selectedClass.homeroomTeacherFullName : 'Atanmamış'}</h3>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={openEditForm} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all">
                                ⚙️ SINIF AYARLARI
                            </button>
                        </div>
                    </div>
                </div>

                <div className="glass-panel border border-white/40 rounded-xl shadow-lg flex-1 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-transparent/50">
                        <h3 className="font-bold text-slate-800">🎓 Sınıf Listesi ({classStudents.length} Öğrenci)</h3>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="glass-panel border-b border-white/40">
                            <tr className="text-slate-500 text-xs uppercase tracking-wider font-bold">
                                <th className="p-4 pl-6">Okul No</th>
                                <th className="p-4">Ad Soyad</th>
                                <th className="p-4">Veli Bilgisi</th>
                                <th className="p-4 text-center pr-6">İşlem</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {classStudents.map(student => (
                                <tr key={student.id} className="hover:bg-transparent transition-colors">
                                    <td className="p-4 pl-6 text-sm font-bold text-slate-700">{student.schoolNumber}</td>
                                    <td className="p-4 text-sm font-bold text-slate-900">{student.firstName} {student.lastName}</td>
                                    <td className="p-4 text-sm font-medium text-slate-500">{student.parentFullName || 'Atanmadı'}</td>
                                    <td className="p-4 pr-6 text-center">
                                        <button onClick={() => handleDeleteStudent(student.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors font-bold text-xs">
                                            SİSTEMDEN SİL
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {classStudents.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-slate-400 font-medium">Bu sınıfa henüz öğrenci kaydedilmemiş.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
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
            <div className="animate-fade-in-right h-full">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/40">
                    <button onClick={selectedClass ? () => setViewMode('detail') : goToList} className="text-slate-500 hover:text-slate-900 glass-panel border border-slate-300 px-4 py-2 rounded-lg transition-all shadow-lg font-bold text-sm">
                        ⬅️ İPTAL
                    </button>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800 tracking-tight">
                        {selectedClass ? 'Sınıf Ayarlarını Güncelle' : 'Yeni Sınıf Oluştur'}
                    </h2>
                </div>

                <div className="glass-panel rounded-xl shadow-lg border border-white/40 p-8 max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Oluşacak Sınıf Adı</p>
                            <h3 className="text-5xl font-bold tracking-tight text-slate-800 text-blue-800">{generatedClassName || '?'}</h3>
                            <p className="text-xs text-blue-500/80 mt-2 font-medium">Sistem, girdiğiniz seviye ve şube kodunu otomatik olarak birleştirir.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Kademe / Derece *</label>
                                <select
                                    required
                                    value={classForm.gradeLevel}
                                    onChange={e => setClassForm({...classForm, gradeLevel: e.target.value})}
                                    className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-500 outline-none cursor-pointer"
                                >
                                    <option value="" disabled>Seçiniz...</option>
                                    {gradeOptions.map(grade => (
                                        <option key={grade} value={grade}>{grade}. Sınıf</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Şube *</label>
                                <select
                                    required
                                    value={classForm.branch}
                                    onChange={e => setClassForm({...classForm, branch: e.target.value})}
                                    className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-500 outline-none cursor-pointer"
                                >
                                    <option value="" disabled>Seçiniz (Örn: A)</option>
                                    {branchOptions.map(branch => (
                                        <option key={branch} value={branch}>{branch} Şubesi</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Rehber Öğretmen Ataması (İsteğe Bağlı)</label>
                            <select
                                value={classForm.teacherId}
                                onChange={e => setClassForm({...classForm, teacherId: e.target.value})}
                                className="w-full bg-transparent border border-white/40 rounded-lg px-4 py-3 text-slate-900 font-bold focus:glass-panel focus:border-blue-500 outline-none cursor-pointer"
                            >
                                <option value="">👨‍🏫 Atama Yapma (Boş Bırak)</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.branch})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/40">
                            {selectedClass ? (
                                <button type="button" onClick={handleDeleteClass} className="text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-lg font-bold text-sm tracking-widest transition-all">
                                    SİL
                                </button>
                            ) : <div></div>}

                            <button type="submit" className="btn-primary font-bold py-3 px-8 rounded-xl transition-all shadow-lg">
                                {selectedClass ? 'DEĞİŞİKLİKLERİ KAYDET' : 'SINIFI SİSTEME KAYDET'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return null;
};

export default ClassroomTab;
