import { Navigate, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children?: ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const token = localStorage.getItem('token');

    // 🚀 KRİTİK DÜZELTME: Eski 'userRole' yerine yeni standart 'role' anahtarını arıyoruz!
    const userRole = localStorage.getItem('role');

    // Eğer bilet (token) yoksa Ana Karşılama Ekranına (Liman) geri gönder
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Eğer bilet var ama rütbe (role) uyuşmuyorsa yine Ana Ekrana gönder
    if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
        return <Navigate to="/" replace />;
    }

    return children ?? <Outlet />;
}