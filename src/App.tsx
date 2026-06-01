import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import TeacherPanel from './pages/TeacherPanel';
import ParentPanel from './pages/ParentPanel';
import StudentPanel from './pages/StudentPanel';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="/admin" element={<AdminPanel />} />
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