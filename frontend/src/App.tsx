import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Helpdesk from './pages/Helpdesk';
import Utilities from './pages/Utilities';
import StudentProfile from './pages/StudentProfile';
import './App.css';

// Guard: Nếu chưa đăng nhập → chuyển về /login
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private (cần đăng nhập) */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/profile" replace />} />
        <Route path="profile"           element={<StudentProfile />} />
        <Route path="dashboard"         element={<Dashboard />} />
        <Route path="helpdesk"          element={<Helpdesk />} />
        <Route path="utilities"         element={<Utilities />} />
        {/* Placeholder routes */}
        <Route path="buildings"         element={<Dashboard />} />
        <Route path="students"          element={<Dashboard />} />
        <Route path="applications"      element={<Dashboard />} />
        <Route path="contracts"         element={<Dashboard />} />
        <Route path="absences"          element={<Dashboard />} />
        <Route path="invoices"          element={<Dashboard />} />
        <Route path="room-registration" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
