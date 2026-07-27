import React from 'react';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminPanel from './AdminPanel';

const AdminDashboardController: React.FC = () => {
    // 🚀 KRİTİK DÜZELTME: Bir önceki adımda standartlaştırdığımız 'role' anahtarını kullanıyoruz!
    const role = localStorage.getItem('role');

    // Eğer giren kişi Donanma Komutanı (Super Admin) ise yeni karanlık kokpite yönlendir
    if (role === 'ROLE_SUPER_ADMIN') {
        return <SuperAdminDashboard />;
    }

    // Eğer normal Okul Müdürü veya Müdür Yardımcısı (Admin/Vice Admin) ise kurum panelini göster
    return <AdminPanel />;
};

export default AdminDashboardController;