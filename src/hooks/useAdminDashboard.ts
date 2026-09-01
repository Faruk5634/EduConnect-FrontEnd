import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { resolveAdminRoleTitle } from '../constants/adminRoles';

export interface AdminProfileData {
    name: string;
    email: string;
    roleTitle: string;
    schoolName: string;
}

export interface AdminStats {
    students: number;
    teachers: number;
    classes: number;
    parents: number;
    announcements: number;
}

const EMPTY_PROFILE: AdminProfileData = {
    name: 'Yükleniyor...',
    email: '',
    roleTitle: 'Yönetici',
    schoolName: 'Kurum Bilgisi Bekleniyor...'
};

const EMPTY_STATS: AdminStats = {
    students: 0,
    teachers: 0,
    classes: 0,
    parents: 0,
    announcements: 0
};

export function useAdminDashboard() {
    const [profileData, setProfileData] = useState<AdminProfileData>(EMPTY_PROFILE);
    const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);

        try {
            try {
                const userRes = await api.get('/users/me');
                const user = userRes.data;

                setProfileData({
                    name: user.name || user.username || 'İsimsiz Kullanıcı',
                    email: user.email || 'E-posta tanımlı değil',
                    roleTitle: resolveAdminRoleTitle(user.role),
                    schoolName: user.schoolName || 'Kurum Ataması Bekleniyor'
                });
            } catch (err) {
                console.warn('Kullanıcı bilgileri çekilemedi.');
            }

            try {
                const statsRes = await api.get('/school/stats');
                setStats({
                    students: statsRes.data.totalStudents || 0,
                    teachers: statsRes.data.totalTeachers || 0,
                    classes: statsRes.data.totalClasses || 0,
                    parents: statsRes.data.totalParents || 0,
                    announcements: statsRes.data.totalAnnouncements || 0
                });
            } catch (err) {
                console.error('İstatistikler henüz hazır değil veya backend hata döndü:', err);
                setStats(EMPTY_STATS);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return { profileData, stats, loading, refresh: fetchDashboardData, setProfileData, setStats };
}
