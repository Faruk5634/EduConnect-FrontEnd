import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute'; // 🚀 Kalkanımızı import ettik

function App() {
  return (
    <Router>
      <Routes>
        {/* Login sayfası herkese açık, korumaya gerek yok */}
        <Route path="/" element={<Login />} />

        {/* 🚀 Dashboard sayfasını ProtectedRoute kalkanının içine aldık! */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;