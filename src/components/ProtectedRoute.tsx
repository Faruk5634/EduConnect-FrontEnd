import { Navigate, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children?: ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
        return <Navigate to="/login" replace />;
    }

    return children ?? <Outlet />;
}