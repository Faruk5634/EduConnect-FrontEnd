import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboardController from './pages/dashboards/AdminDashboardController';

// 🚀 YENİ EKLENECEK SAYFALAR
import LandingPage from './pages/auth/LandingPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import CampusPortal from './pages/auth/CampusPortal';
import LoginPage from './pages/auth/LoginPage';

// MEVCUT PANELLER VE KORUMALI ROTA
import TeacherPanel from './pages/portals/TeacherPanel';
import ParentPanel from './pages/portals/ParentPanel';
import StudentPanel from './pages/portals/StudentPanel';
import ProtectedRoute from './components/security/ProtectedRoute';

function App() {
  return (
      <Router>
        <Routes>
          {/* 🚪 Ana Karşılama Ekranı (İki Kapı Seçimi) */}
          <Route path="/" element={<LandingPage />} />

          {/* 🏢 1. Kapı: Yönetim Girişi */}
          <Route path="/admin-login" element={<AdminLoginPage />} />

          {/* 🎓 2. Kapı: Kampüs (3 Butonlu) Girişi */}
          <Route path="/campus" element={<CampusPortal />} />

          {/* 🔑 YENİ: Öğrenci, Öğretmen ve Velilerin Ortak Giriş Kapısı */}
          <Route path="/login" element={<LoginPage />} />

          {/* --- GÜVENLİ LİMANLAR (Paneller) --- */}
          {/* Yöneticiler (Super Admin, Müdür ve Müdür Yardımcısı) buraya girebilir */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_VICE_ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboardController />} />
            {/* 🚀 HAYALET LİMAN ÇÖZÜLDÜ: Super Admin rotası da Controller'a bağlandı */}
            <Route path="/superadmin" element={<AdminDashboardController />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']} />}>
            <Route path="/teacher" element={<TeacherPanel />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ROLE_PARENT']} />}>
            <Route path="/parent" element={<ParentPanel />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
            <Route path="/student" element={<StudentPanel />} />
          </Route>
        </Routes>
      </Router>
  );
}

export default App;