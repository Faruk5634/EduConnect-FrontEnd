import { useState } from 'react';
import Navbar from '../components/Navbar';
import DashboardTab from '../components/DashboardTab'; // 🚀 EKLENDİ
import StudentTab from '../components/StudentTab';
import TeacherTab from '../components/TeacherTab';
import ClassroomTab from '../components/ClassroomTab';
import ParentTab from '../components/ParentTab';
import AnnouncementTab from '../components/AnnouncementTab';

export default function Dashboard() {
    // 🚀 GÜNCELLENDİ: Sisteme ilk girişte ana sayfa (dashboard) açık gelsin
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />

            <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ color: '#1e293b', borderBottom: '3px solid #3b82f6', paddingBottom: '15px', marginTop: 0 }}>
                    ⚙️ EduConnect Yönetim Merkezi
                </h2>

                {/* YÖNETİM SEKMELERİ */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', marginTop: '25px', overflowX: 'auto', paddingBottom: '10px' }}>

                    {/* 🚀 EKLENDİ: Ana Sayfa Butonu (En başa) */}
                    <button onClick={() => setActiveTab('dashboard')} style={tabStyle(activeTab === 'dashboard')}>
                        ⚓ Kaptan Köşkü
                    </button>

                    <button onClick={() => setActiveTab('students')} style={tabStyle(activeTab === 'students')}>
                        🎓 Öğrenciler
                    </button>
                    <button onClick={() => setActiveTab('parents')} style={tabStyle(activeTab === 'parents')}>
                        👨‍👩‍👧 Veliler
                    </button>
                    <button onClick={() => setActiveTab('teachers')} style={tabStyle(activeTab === 'teachers')}>
                        👨‍🏫 Öğretmenler
                    </button>
                    <button onClick={() => setActiveTab('classes')} style={tabStyle(activeTab === 'classes')}>
                        🏫 Sınıflar
                    </button>
                    <button onClick={() => setActiveTab('announcements')} style={tabStyle(activeTab === 'announcements')}>
                        📢 Duyurular
                    </button>
                </div>

                {/* İÇERİK EKRANI (Hangi Sekme Seçiliyse O Gelecek) */}
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                    {activeTab === 'dashboard' && <DashboardTab />} {/* 🚀 EKLENDİ */}
                    {activeTab === 'students' && <StudentTab />}
                    {activeTab === 'parents' && <ParentTab />}
                    {activeTab === 'teachers' && <TeacherTab />}
                    {activeTab === 'classes' && <ClassroomTab />}
                    {activeTab === 'announcements' && <AnnouncementTab />}
                </div>
            </div>
        </div>
    );
}

// Butonların renk değiştirmesini sağlayan stil
const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    backgroundColor: isActive ? '#3b82f6' : '#e2e8f0',
    color: isActive ? 'white' : '#475569',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const
});