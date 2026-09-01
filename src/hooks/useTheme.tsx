import React, { useEffect } from 'react';

const ROLE_MAP: Record<string, string> = {
  ROLE_STUDENT: 'student',
  ROLE_TEACHER: 'teacher',
  ROLE_PARENT: 'parent',
  ROLE_ADMIN: 'admin',
  ROLE_SUPER_ADMIN: 'admin'
};

export const ThemeProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const rawRole = localStorage.getItem('role') || 'ROLE_STUDENT';
    const roleKey = ROLE_MAP[rawRole] || rawRole.toLowerCase();

    // Remove any existing theme classes and add the resolved one
    document.documentElement.classList.remove('theme-student', 'theme-teacher', 'theme-parent', 'theme-admin');
    document.documentElement.classList.add(`theme-${roleKey}`);
  }, []);

  return <>{children}</>;
};

export function applyThemeForRole(rawRole: string) {
  const roleKey = ROLE_MAP[rawRole] || rawRole.toLowerCase();
  document.documentElement.classList.remove('theme-student', 'theme-teacher', 'theme-parent', 'theme-admin');
  document.documentElement.classList.add(`theme-${roleKey}`);
}
