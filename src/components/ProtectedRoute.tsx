import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// 🚀 YENİ: Artık memura "Sadece bu rütbeler geçebilir" diyebilmek için bir kural listesi (allowedRoles) ekliyoruz.
interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {

    // 1. Kasadan hem bileti hem de rütbeyi alıyoruz
    const token = localStorage.getItem('jwtToken');
    const userRole = localStorage.getItem('userRole');

    // 2. Bilet yoksa, acımadan Login (Giriş) sayfasına geri postala!
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // 3. 🚀 YENİ KONTROL: Rütbe Denetimi!
    // Eğer bu oda için belli rütbeler istenmişse VE kullanıcının rütbesi bu listede yoksa:
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        console.warn(`Kaçak yolcu engellendi! İstenen rütbeler: ${allowedRoles}, Yolcunun rütbesi: ${userRole}`);
        // Rütbesi yetmeyenleri ana kapıya (veya ileride yapacağın bir /yetkisiz sayfasına) geri gönderiyoruz.
        return <Navigate to="/" replace />;
    }

    // 4. Bilet varsa ve rütbesi de yetiyorsa (veya oda biletli herkese açıksa), geçişe izin ver
    return children;
}