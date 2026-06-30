import React from 'react';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminPanel from './AdminPanel'; // Senin o ekranda gördüğün eski panel

const AdminDashboardController: React.FC = () => {
    // Tarayıcı hafızasından rütbeyi çekiyoruz
    const role = localStorage.getItem('userRole');

    // Eğer giren kişi Donanma Komutanı (Super Admin) ise yeni karanlık kokpite yönlendir
    if (role === 'ROLE_SUPER_ADMIN') {
        return <SuperAdminDashboard />;
    }

    // Eğer normal Okul Müdürü (Admin) ise şimdilik o gördüğün eski beyaz paneli göster
    return <AdminPanel />;
};

export default AdminDashboardController;