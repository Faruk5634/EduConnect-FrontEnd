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

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
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
        e.preventDefault(); // Sayfanın yenilenmesini engeller
        setMessage('');

        try {
            const token = localStorage.getItem('jwtToken');

            // Makine dairesinin (Java'nın) beklediği tam paket yapısı
            const payload = {
                title: title,
                content: content,
                type: type,
                classroom: { id: parseInt(classroomId) } // Sınıfın benzersiz ID'si
            };

            // 🚀 İNATÇI HAYALETİ KESEN SATIR: İstek doğrudan kesinleştirdiğimiz '/create' rotasına gidiyor!
            await api.post('/announcements/create', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('✅ Duyuru başarıyla sınıfa gönderildi!');
            setTitle(''); // Formu temizle
            setContent('');
        } catch (error) {
            console.error("Duyuru gönderilemedi:", error);
            setMessage('❌ Duyuru gönderilirken bir hata oluştu.');
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>👨‍🏫 Hoş Geldiniz, {profile?.firstName} {profile?.lastName} Öğretmenim!</h1>

            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                {/* SOL TARAF: Duyuru Yapma Formu */}
                <div style={{ flex: 2, padding: '20px', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
                    <h2>📢 Yeni Duyuru Yayınla</h2>
                    <form onSubmit={handleMakeAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                        <div>
                            <label><strong>Hedef Sınıf:</strong></label><br />
                            <select
                                value={classroomId}
                                onChange={(e) => setClassroomId(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
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
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
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
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                required
                            />
                        </div>

                        <div>
                            <label><strong>Mesajınız:</strong></label><br />
                            <textarea
                                rows={4}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                required
                            />
                        </div>

                        <button type="submit" style={{ padding: '10px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Gönder
                        </button>

                        {message && <div style={{ marginTop: '10px', fontWeight: 'bold', color: message.includes('✅') ? 'green' : 'red' }}>{message}</div>}
                    </form>
                </div>

                {/* SAĞ TARAF: Profil Özeti */}
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', height: 'fit-content' }}>
                    <h3>Profil Bilgileri</h3>
                    <p><strong>Branş:</strong> {profile?.branch}</p>
                    <p><strong>Sınıflarım:</strong></p>
                    <ul>
                        {profile?.homeroomClasses?.map(c => (
                            <li key={c.id}>{c.name}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}