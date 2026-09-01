export const ADMIN_ROLES = {
    SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
    ADMIN: 'ROLE_ADMIN',
    VICE_ADMIN: 'ROLE_VICE_ADMIN'
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

export const resolveAdminRoleTitle = (role?: string): string => {
    const roleStr = String(role || '').toUpperCase();

    if (roleStr.includes('VICE') || roleStr.includes('YARDIMCI')) return 'Müdür Yardımcısı';
    if (roleStr.includes('ADMIN') || roleStr.includes('PRINCIPAL') || roleStr.includes('MUDUR')) return 'Kurum Müdürü';
    return 'Yönetici';
};
