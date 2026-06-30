import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 📦 Backend'den gelen StudentDTO kalıbı
interface Student {
    id: number;
    firstName: string;
    lastName: string;
    schoolNumber: string;
    grade: string;
    parentFullName: string;
    username: string;
}

const StudentTab: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 🚪 Modal (Açılır Pencere) Kontrolleri
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        schoolNumber: '',
        grade: '',
        username: '',
        password: ''
    });

    // ⚓ Sayfa açıldığı an Axios kuryesini gönderiyoruz
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
            const response = await axios.get('http://localhost:8080/api/students/list', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Öğrenci verileri çekilemedi:", err);
            setError("Makine dairesine (sunucuya) ulaşılamadı veya yetkiniz yok.");
            setLoading(false);
        }
    };

    // 🗑️ Öğrenci Silme Motoru
    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Kaptan, ${name} adlı öğrenciyi sistemden silmek istediğine emin misin?`)) {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
                await axios.delete(`http://localhost:8080/api/students/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Silme başarılıysa listeyi güncelle
                setStudents(students.filter(student => student.id !== id));
            } catch (err) {
                console.error("Silme işlemi başarısız:", err);
                alert("Silme işlemi sırasında bir hata oluştu!");
            }
        }
    };

    // 📝 Yeni Öğrenci Ekleme Motoru
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');

            // Backend'deki createStudentWithUser uç noktasına veriyi gönderiyoruz
            await axios.post('http://localhost:8080/api/students/create', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Başarılıysa modalı kapat, formu temizle ve listeyi yenile
            setIsModalOpen(false);
            setFormData({ firstName: '', lastName: '', schoolNumber: '', grade: '', username: '', password: '' });
            setLoading(true);
            fetchStudents();

        } catch (err) {
            console.error("Kayıt sızıntısı:", err);
            alert("Öğrenci eklenirken hata oluştu! Kullanıcı adı veya okul numarası zaten kullanılıyor olabilir.");
        }
    };

    // ⏳ Yükleme Ekranı
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">📡 Makine dairesinden veriler çekiliyor...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-down relative">

            {/* 🚨 Hata Mesajı */}
            {error && <div className="mb-4 p-4 text-red-500 font-medium bg-red-50 border border-red-200 rounded-xl">{error}</div>}

            {/* 🏛️ Üst Bar */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Öğrenci Yönetimi</h2>
                    <p className="text-slate-500 text-sm mt-1">Veritabanındaki tüm öğrenciler burada listelenir.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                    <span className="text-lg">➕</span> Yeni Öğrenci
                </button>
            </div>

            {/* 📊 Veri Tablosu */}
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-5 font-bold rounded-tl-2xl">Okul No</th>
                        <th className="p-5 font-bold">Ad Soyad</th>
                        <th className="p-5 font-bold">Sınıf</th>
                        <th className="p-5 font-bold">Kullanıcı Adı</th>
                        <th className="p-5 font-bold">Veli Bilgisi</th>
                        <th className="p-5 font-bold text-right rounded-tr-2xl">İşlemler</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {students.map((student) => (
                        <tr key={student.id} className="hover:bg-blue-50/50 transition-colors group">
                            <td className="p-5 font-semibold text-slate-700">{student.schoolNumber}</td>
                            <td className="p-5">
                                <div className="font-bold text-slate-800">{student.firstName} {student.lastName}</div>
                            </td>
                            <td className="p-5">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold border border-indigo-200">
                    {student.grade || 'Atanmadı'}
                  </span>
                            </td>
                            <td className="p-5 text-slate-500 text-sm font-medium">
                                {student.username ? `@${student.username}` : <span className="text-slate-400 italic">Yok</span>}
                            </td>
                            <td className="p-5 text-slate-600 font-medium">
                                {student.parentFullName || <span className="text-amber-500">Veli Atanmadı</span>}
                            </td>
                            <td className="p-5 text-right opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                <button className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                                    Düzenle
                                </button>
                                <button
                                    onClick={() => handleDelete(student.id, student.firstName)}
                                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                                >
                                    Sil
                                </button>
                            </td>
                        </tr>
                    ))}

                    {students.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-10 text-center text-slate-500">
                                <div className="text-4xl mb-3">📭</div>
                                <p className="font-medium text-lg">Sistemde henüz kayıtlı öğrenci bulunmuyor.</p>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* 📝 YENİ ÖĞRENCİ MODALI (Açılır Pencere) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 transform transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-800">Yeni Öğrenci Kaydı</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 text-2xl font-bold transition-colors">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Ad</label>
                                    <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Örn: Ali" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Soyad</label>
                                    <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Örn: Yılmaz" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Okul Numarası</label>
                                    <input type="text" required value={formData.schoolNumber} onChange={(e) => setFormData({...formData, schoolNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Örn: 1045" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Sınıfı</label>
                                    <input type="text" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Örn: 10-A" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 mt-2">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Kullanıcı Adı</label>
                                    <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Örn: ali.yilmaz" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Şifre</label>
                                    <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="••••••••" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 mt-6">
                                Öğrenciyi Sisteme Kaydet
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StudentTab;