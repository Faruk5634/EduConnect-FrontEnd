import  { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// --- ŞABLONLAR ---
interface Announcement {
    id: number;
    title: string;
    content: string;
    createdDate: string;
    authorName: string;
    type: string;
    classroomName: string;
}

export default function StudentPanel() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

            // Makine dairesinden duyuruları çekiyoruz
            const response = await api.get('/announcements', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Gelen duyuruları tarihe göre en yeniden en eskiye sıralayalım
            const sortedAnnouncements = response.data.sort((a: Announcement, b: Announcement) =>
                new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
            );

            setAnnouncements(sortedAnnouncements);
        } catch (error) {
            console.error("Duyurular çekilirken hata oluştu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        navigate('/'); // Çıkış yapınca ana giriş ekranına fırlat
    };

    // Duyuru tiplerini Türkçeleştirip ikon ekleyen yardımcı fonksiyon
    const translateType = (type: string) => {
        switch (type) {
            case 'HOMEWORK': return '📚 Ödev';
            case 'EXAM_INFO': return '📝 Sınav Bilgisi';
            case 'EXAM_RESULT': return '💯 Sınav Sonucu';
            case 'EVENT': return '🎉 Etkinlik';
            case 'GENERAL': return '📢 Genel Duyuru';
            default: return type;
        }
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* ÖĞRENCİ ÜST BAR (NAVBAR) */}
            <nav style={{ backgroundColor: '#1e293b', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: 0, fontSize: '22px' }}>🎓 EduConnect Öğrenci Portalı</h2>
                <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Güverteyi Terk Et (Çıkış)
                </button>
            </nav>

            <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>Hoş Geldin! 👋</h2>
                    <p style={{ color: '#64748b', margin: 0 }}>Buradan okuldaki güncel duyuruları ve sınıfına ait bilgileri takip edebilirsin.</p>
                </div>

                {/* DUYURU PANOSU */}
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ marginTop: 0, color: '#3b82f6', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                        📢 Pano ve Duyurular
                    </h3>

                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>📡 Makine dairesinden veriler çekiliyor...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            {announcements.map((ann) => (
                                <div key={ann.id} style={{ borderLeft: '5px solid #3b82f6', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <h4 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>{ann.title}</h4>
                                        <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {translateType(ann.type)}
                                        </span>
                                    </div>
                                    <p style={{ margin: '10px 0', color: '#334155', lineHeight: '1.5' }}>{ann.content}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #cbd5e1' }}>
                                        <span><strong>✍️ Yazar:</strong> {ann.authorName}</span>
                                        <span><strong>🎯 Hedef:</strong> {ann.classroomName}</span>
                                        <span><strong>🕒 Tarih:</strong> {new Date(ann.createdDate).toLocaleString('tr-TR')}</span>
                                    </div>
                                </div>
                            ))}
                            {announcements.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                    Panoda şu an hiç duyuru yok.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

