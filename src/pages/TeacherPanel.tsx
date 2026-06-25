import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

// Yeni DTO yapımıza uygun arayüz tanımlamaları
interface ClassroomInfo {
    id: number;
    name: string;
}

interface TeacherProfile {
    firstName: string;
    lastName: string;
    branch: string;
    homeroomClasses: ClassroomInfo[];
}

export default function TeacherPanel() {
    const [profile, setProfile] = useState<TeacherProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Duyuru formu için State'ler (Hafıza)
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('GENERAL');
    const [classroomId, setClassroomId] = useState('');
    const [message, setMessage] = useState('');

    // 🚀 YENİ: Dosya tutucu
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
                const response = await api.get('/teachers/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(response.data);

                // Eğer hocanın sınıfı varsa, dropdown kutusunda ilk sınıf otomatik seçili gelsin
                if (response.data.homeroomClasses && response.data.homeroomClasses.length > 0) {
                    setClassroomId(response.data.homeroomClasses[0].id.toString());
                }
            } catch (err) {
                console.error("Hata:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Duyuru Gönderme Fonksiyonu
    const handleMakeAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

            // 🚀 ARTIK JSON DEĞİL, FORMDATA (Çok Parçalı) GÖNDERİYORUZ
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('type', type);

            if (classroomId) {
                formData.append('classroomId', classroomId);
            }

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            await api.post('/announcements/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage('✅ Duyuru başarıyla sınıfa gönderildi!');
            setTitle('');
            setContent('');
            setSelectedFile(null); // Form gönderilince seçili dosyayı da sıfırla
        } catch (error) {
            console.error("Duyuru gönderilemedi:", error);
            setMessage('❌ Duyuru gönderilirken bir hata oluştu.');
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>👨‍🏫 Hoş Geldiniz, {profile?.firstName} {profile?.lastName} Öğretmenim!</h1>

            <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
                {/* SOL TARAF: Duyuru Yapma Formu */}
                <div style={{ flex: 2, padding: '20px', backgroundColor: '#f0f4f8', borderRadius: '8px', minWidth: '300px' }}>
                    <h2>📢 Yeni Duyuru Yayınla</h2>
                    <form onSubmit={handleMakeAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                        <div>
                            <label><strong>Hedef Sınıf:</strong></label><br />
                            <select
                                value={classroomId}
                                onChange={(e) => setClassroomId(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                                required
                            >
                                {profile?.homeroomClasses?.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} Sınıfı</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label><strong>Duyuru Tipi:</strong></label><br />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="GENERAL">Genel Duyuru</option>
                                <option value="HOMEWORK">Ödev</option>
                                <option value="EXAM_INFO">Sınav Bilgisi</option>
                                <option value="EVENT">Etkinlik</option>
                            </select>
                        </div>

                        <div>
                            <label><strong>Başlık:</strong></label><br />
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                                required
                            />
                        </div>

                        <div>
                            <label><strong>Mesajınız:</strong></label><br />
                            <textarea
                                rows={4}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                                required
                            />
                        </div>

                        {/* 🚀 YENİ: Dosya Yükleme Alanı */}
                        <div style={{ padding: '10px', backgroundColor: '#e2e8f0', borderRadius: '6px', border: '1px dashed #94a3b8' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                                📎 Dosya Ekle (İsteğe Bağlı)
                            </label>
                            <input
                                type="file"
                                onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                style={{ fontSize: '14px', width: '100%' }}
                            />
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '5px 0 0 0' }}>PDF, Word veya Resim formatında dosyalar yükleyebilirsiniz.</p>
                        </div>

                        <button type="submit" style={{ padding: '12px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>
                            Gönder 🚀
                        </button>

                        {message && <div style={{ marginTop: '10px', fontWeight: 'bold', padding: '10px', borderRadius: '4px', backgroundColor: message.includes('✅') ? '#dcfce7' : '#fee2e2', color: message.includes('✅') ? '#166534' : '#991b1b' }}>{message}</div>}
                    </form>
                </div>

                {/* SAĞ TARAF: Profil Özeti */}
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', height: 'fit-content', minWidth: '250px' }}>
                    <h3 style={{ marginTop: 0 }}>Profil Bilgileri</h3>
                    <p><strong>Branş:</strong> {profile?.branch}</p>
                    <p><strong>Sınıflarım:</strong></p>
                    <ul style={{ paddingLeft: '20px' }}>
                        {profile?.homeroomClasses?.map(c => (
                            <li key={c.id} style={{ marginBottom: '5px' }}>{c.name}</li>
                        ))}
                        {(!profile?.homeroomClasses || profile.homeroomClasses.length === 0) && (
                            <li style={{ color: '#94a3b8', listStyleType: 'none', marginLeft: '-20px' }}>Henüz sınıf atanmamış.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}