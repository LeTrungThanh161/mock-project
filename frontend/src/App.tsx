import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import StudentProfile from './pages/StudentProfile';
import { PricingTiers } from './pages/PricingTiers';
import { MeterReadings } from './pages/MeterReadings';
import { Invoices } from './pages/Invoices';
import { Technicians } from './pages/Technicians';
import { IssueTickets } from './pages/IssueTickets';
import { StudentInvoices } from './pages/StudentInvoices';
import { StudentHelpdesk } from './pages/StudentHelpdesk';
import { RoomRegistration } from './pages/RoomRegistration';
import { Infrastructure } from './pages/Infrastructure';
import { Contracts } from './pages/Contracts';
import { AdminContracts } from './pages/AdminContracts';
import { Accounts } from './pages/Accounts';
import './App.css';
import { useEffect } from 'react';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Guard: Ngăn chặn role STUDENT truy cập bằng URL
const NonStudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user?.role !== 'STUDENT' ? <>{children}</> : <Navigate to="/profile" replace />;
};

const RoleBasedInvoices = () => {
  const { user } = useAuth();
  return user?.role === 'STUDENT' ? <StudentInvoices /> : <Invoices />;
};

const RoleBasedHelpdesk = () => {
  const { user } = useAuth();
  return user?.role === 'STUDENT' ? <StudentHelpdesk /> : <IssueTickets />;
};

const RoleBasedContracts = () => {
  const { user } = useAuth();
  return user?.role === 'STUDENT' ? <Contracts /> : <AdminContracts />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

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
        <Route path="profile" element={<StudentProfile />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="helpdesk" element={<RoleBasedHelpdesk />} />
        
        {/* Protected Routes (Chỉ cho Admin/Manager) */}
        <Route path="pricing-tiers" element={<NonStudentRoute><PricingTiers /></NonStudentRoute>} />
        <Route path="meter-readings" element={<NonStudentRoute><MeterReadings /></NonStudentRoute>} />
        <Route path="technicians" element={<NonStudentRoute><Technicians /></NonStudentRoute>} />

        {/* Placeholder routes */}
        <Route path="buildings" element={<Infrastructure />} />
        <Route path="students" element={<Dashboard />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="applications" element={<Dashboard />} />
        <Route path="contracts" element={<RoleBasedContracts />} />
        <Route path="absences" element={<Dashboard />} />
        <Route path="invoices" element={<RoleBasedInvoices />} />
        <Route path="room-registration" element={<RoomRegistration />} />
      </Route>
    </Routes>
  );
}

function App() {
  useEffect(() => {
    document.title = "Quản Lý Ký Túc Xá";
  }, []);
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
