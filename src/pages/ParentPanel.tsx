import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface ParentProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    studentNames: string[];
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    createdDate: string;
    authorName: string;
    type: string;
    classroomName: string;
    fileName?: string; // 🚀 EKLENDİ
    fileUrl?: string;  // 🚀 EKLENDİ
}

export default function ParentPanel() {
    const [profile, setProfile] = useState<ParentProfile | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    // 🚀 YENİ: Hangi duyuruların açık/kapalı olduğunu takip eden hafıza
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
                const response = await api.get('/parents/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(response.data);
                fetchAnnouncements(token);
            } catch (error) {
                console.error("Veli profili çekilemedi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const fetchAnnouncements = async (token: string | null) => {
        try {
            const response = await api.get('/announcements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sorted = response.data.sort((a: Announcement, b: Announcement) =>
                new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
            );
            setAnnouncements(sorted);
        } catch (error) {
            console.error("Duyurular çekilirken hata oluştu:", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // 🚀 YENİ: Tıklanan duyuruyu aç/kapat yapan fonksiyon
    const toggleExpand = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

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

    if (loading) {
        return <div style={styles.loading}>Yükleniyor...</div>;
    }

    if (!selectedStudent) {
        return (
            <div style={styles.netflixContainer}>
                <button onClick={handleLogout} style={styles.logoutBtn}>Çıkış Yap</button>
                <h1 style={styles.netflixTitle}>Kimin bilgilerini görüntülemek istiyorsunuz?</h1>

                <div style={styles.profilesWrapper}>
                    {profile?.studentNames.map((studentName, index) => (
                        <div key={index} style={styles.profileCard} onClick={() => setSelectedStudent(studentName)}>
                            <div style={styles.avatarBox}>
                                <span style={styles.avatarEmoji}>🎓</span>
                            </div>
                            <h3 style={styles.profileName}>{studentName}</h3>
                        </div>
                    ))}

                    <div style={styles.profileCard} onClick={() => setSelectedStudent('Genel Duyurular')}>
                        <div style={{...styles.avatarBox, backgroundColor: '#3b82f6'}}>
                            <span style={styles.avatarEmoji}>🏫</span>
                        </div>
                        <h3 style={styles.profileName}>Genel Okul Duyuruları</h3>
                    </div>
                </div>
            </div>
        );
    }

    const filteredAnnouncements = selectedStudent === 'Genel Duyurular'
        ? announcements.filter(a => a.type === 'GENERAL' || !a.classroomName)
        : announcements;

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <nav style={{ backgroundColor: '#1e293b', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>EduConnect Veli Portalı</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => setSelectedStudent(null)} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        🔄 Profil Değiştir
                    </button>
                    <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Çıkış
                    </button>
                </div>
            </nav>

            <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
                <h1 style={{ color: '#1e293b', marginBottom: '30px' }}>
                    {selectedStudent === 'Genel Duyurular'
                        ? '🏫 Okul Genel Duyuruları'
                        : `🎓 ${selectedStudent} - Öğrenci Panosu`}
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {filteredAnnouncements.map((ann) => {
                        const isExpanded = expandedIds.includes(ann.id); // Bu duyuru açık mı?

                        return (
                            <div key={ann.id} style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderLeft: '5px solid #3b82f6', overflow: 'hidden' }}>

                                {/* 🚀 KART BAŞLIĞI (Tıklanabilir Alan) */}
                                <div
                                    onClick={() => toggleExpand(ann.id)}
                                    style={{ padding: '20px 25px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isExpanded ? '#f8fafc' : 'white', transition: 'background-color 0.2s' }}
                                >
                                    <div>
                                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>{ann.title}</h3>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '5px' }}>
                                            <span><strong>✍️ Yazar:</strong> {ann.authorName}</span> &nbsp;|&nbsp;
                                            <span><strong>🕒 Tarih:</strong> {new Date(ann.createdDate).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {translateType(ann.type)}
                                        </span>
                                        <span style={{ fontSize: '20px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                            🔽
                                        </span>
                                    </div>
                                </div>

                                {/* 🚀 KART İÇERİĞİ (Açıldığında Görünür) */}
                                {isExpanded && (
                                    <div style={{ padding: '0 25px 25px 25px', borderTop: '1px solid #e2e8f0' }}>
                                        <p style={{ color: '#334155', lineHeight: '1.6', fontSize: '15px', marginTop: '20px', whiteSpace: 'pre-wrap' }}>
                                            {ann.content}
                                        </p>

                                        {/* DOSYA VARSA GÖSTER */}
                                        {ann.fileUrl && (
                                            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'inline-block' }}>
                                                <span style={{ marginRight: '10px', fontSize: '15px' }}>📎 <strong>Ek Dosya:</strong> {ann.fileName}</span>
                                                <a href={`http://localhost:8080${ann.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', display: 'inline-block', marginTop: '10px' }}>
                                                    İndir / Görüntüle
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredAnnouncements.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px', color: '#94a3b8' }}>
                            Bu profile ait şu an herhangi bir duyuru bulunmamaktadır.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', backgroundColor: '#141414', color: 'white' },
    netflixContainer: { minHeight: '100vh', backgroundColor: '#141414', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    logoutBtn: { position: 'absolute', top: '30px', right: '40px', padding: '10px 20px', backgroundColor: 'transparent', color: '#e50914', border: '1px solid #e50914', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
    netflixTitle: { color: 'white', fontSize: '48px', fontWeight: 'normal', marginBottom: '50px', textAlign: 'center' },
    profilesWrapper: { display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' },
    profileCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s', width: '150px' },
    avatarBox: { width: '150px', height: '150px', backgroundColor: '#10b981', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '64px', marginBottom: '15px', border: '4px solid transparent', transition: 'border-color 0.2s' },
    profileName: { color: '#808080', fontSize: '20px', margin: 0, textAlign: 'center', transition: 'color 0.2s' },
    avatarEmoji: { userSelect: 'none' }
};