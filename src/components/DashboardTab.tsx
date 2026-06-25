import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function DashboardTab() {
    // İstatistikleri tutacağımız state'ler
    const [stats, setStats] = useState({
        studentCount: 0,
        teacherCount: 0,
        classroomCount: 0,
        parentCount: 0,
        announcementCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        setLoading(true);
        try {
            // Tüm verileri aynı anda paralel çekerek hızı artırıyoruz
            const [students, teachers, classrooms, parents, announcements] = await Promise.all([
                api.get('/students/list'),
                api.get('/teachers'),
                api.get('/classrooms'),
                api.get('/parents'),
                api.get('/announcements')
            ]);

            setStats({
                studentCount: students.data.length,
                teacherCount: teachers.data.length,
                classroomCount: classrooms.data.length,
                parentCount: parents.data.length,
                announcementCount: announcements.data.length
            });
        } catch (error) {
            console.error("İstatistikler çekilirken fırtınaya yakalandık:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p style={{ textAlign: 'center', padding: '50px', color: '#64748b', fontSize: '18px' }}>📡 Radar verileri toplanıyor...</p>;
    }

    return (
        <div style={{ animation: 'fadeIn 0.4s' }}>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '28px' }}>⚓ Kaptan Köşküne Hoş Geldin!</h2>
                <p style={{ color: '#64748b', marginTop: '5px' }}>EduConnect sisteminin anlık genel durum raporu aşağıdadır.</p>
            </div>

            {/* İSTATİSTİK KARTLARI (GRID) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>

                {/* Öğrenci Kartı */}
                <div style={cardStyle('#eff6ff', '#3b82f6')}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎓</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>{stats.studentCount}</div>
                    <div style={{ color: '#64748b', fontWeight: 'bold' }}>Kayıtlı Öğrenci</div>
                </div>

                {/* Öğretmen Kartı */}
                <div style={cardStyle('#f0fdf4', '#10b981')}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>👨‍🏫</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>{stats.teacherCount}</div>
                    <div style={{ color: '#64748b', fontWeight: 'bold' }}>Aktif Öğretmen</div>
                </div>

                {/* Sınıf Kartı */}
                <div style={cardStyle('#fef3c7', '#f59e0b')}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏫</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>{stats.classroomCount}</div>
                    <div style={{ color: '#64748b', fontWeight: 'bold' }}>Mevcut Sınıf</div>
                </div>

                {/* Veli Kartı */}
                <div style={cardStyle('#f3e8ff', '#a855f7')}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>👨‍👩‍👧</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>{stats.parentCount}</div>
                    <div style={{ color: '#64748b', fontWeight: 'bold' }}>Sistemdeki Veli</div>
                </div>

            </div>

            {/* ALT BİLGİ ALANI */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>📢 İletişim Durumu</h3>
                    <p style={{ margin: 0, color: '#475569' }}>Sistemde şu ana kadar toplam <strong>{stats.announcementCount}</strong> adet duyuru yayınlandı.</p>
                </div>
                <div style={{ fontSize: '50px' }}>
                    📡
                </div>
            </div>
        </div>
    );
}

// Kartlar için ortak stil fonksiyonu
const cardStyle = (bgColor: string, borderColor: string) => ({
    backgroundColor: bgColor,
    borderTop: `4px solid ${borderColor}`,
    borderRadius: '12px',
    padding: '25px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s',
    cursor: 'default'
});