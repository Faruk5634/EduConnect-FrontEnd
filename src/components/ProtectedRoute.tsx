import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// Dışarıdan aldığı sayfayı (children) koruyacak olan memurumuz
export default function ProtectedRoute({ children }: { children: ReactNode }) {

    // Kasada JWT bileti var mı diye bakıyoruz
    const token = localStorage.getItem('jwtToken');

    // Eğer bilet yoksa, acımadan Login (Giriş) sayfasına geri postala!
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Bilet varsa, geçişe izin ver
    return children;
}