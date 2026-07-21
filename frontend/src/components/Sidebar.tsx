import { NavLink, useNavigate } from 'react-router-dom';
import {
  User, FileText, FileSignature, Clock,
  LayoutDashboard, Building2, Users, ClipboardList,
  Wrench, Receipt, LogOut, ChevronRight, Zap, Settings, HardHat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import './Sidebar.css';
import Logo from '../assets/logo.jpg'

// ============================================================
// Định nghĩa menu items cho từng Role
// ============================================================
const MENU_ITEMS: Record<UserRole, { to: string; icon: React.ReactNode; label: string }[]> = {
  STUDENT: [
    { to: '/profile', icon: <User size={18} />, label: 'Hồ sơ' },
    { to: '/room-registration', icon: <FileText size={18} />, label: 'Đăng ký phòng' },
    { to: '/contracts', icon: <FileSignature size={18} />, label: 'Hợp đồng' },
    { to: '/absences', icon: <Clock size={18} />, label: 'Tạm vắng' },
    { to: '/invoices', icon: <Receipt size={18} />, label: 'Hóa đơn' },
    { to: '/helpdesk', icon: <Wrench size={18} />, label: 'Hỗ trợ' },
  ],
  ADMIN: [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/buildings', icon: <Building2 size={18} />, label: 'Tòa nhà & Phòng' },
    { to: '/students', icon: <Users size={18} />, label: 'Sinh viên' },
    { to: '/applications', icon: <ClipboardList size={18} />, label: 'Đơn đăng ký' },
    { to: '/contracts', icon: <FileSignature size={18} />, label: 'Hợp đồng' },
    { to: '/absences', icon: <Clock size={18} />, label: 'Tạm vắng' },
    { to: '/pricing-tiers', icon: <Settings size={18} />, label: 'Cấu hình giá' },
    { to: '/meter-readings', icon: <Zap size={18} />, label: 'Điện & Nước' },
    { to: '/invoices', icon: <Receipt size={18} />, label: 'Hóa đơn' },
    { to: '/helpdesk', icon: <Wrench size={18} />, label: 'Hỗ trợ' },
    { to: '/technicians', icon: <HardHat size={18} />, label: 'Nhân viên kỹ thuật' },
  ],
  MANAGER: [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/buildings', icon: <Building2 size={18} />, label: 'Tòa nhà & Phòng' },
    { to: '/students', icon: <Users size={18} />, label: 'Sinh viên' },
    { to: '/applications', icon: <ClipboardList size={18} />, label: 'Đơn đăng ký' },
    { to: '/contracts', icon: <FileSignature size={18} />, label: 'Hợp đồng' },
    { to: '/absences', icon: <Clock size={18} />, label: 'Tạm vắng' },
    { to: '/pricing-tiers', icon: <Settings size={18} />, label: 'Cấu hình giá' },
    { to: '/meter-readings', icon: <Zap size={18} />, label: 'Điện & Nước' },
    { to: '/invoices', icon: <Receipt size={18} />, label: 'Hóa đơn' },
    { to: '/helpdesk', icon: <Wrench size={18} />, label: 'Hỗ trợ' },
    { to: '/technicians', icon: <HardHat size={18} />, label: 'Nhân viên kỹ thuật' },
  ],
};

// Label hiển thị dễ đọc cho Role
const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: 'Sinh viên',
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
};

// Màu badge theo Role
const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  STUDENT: 'role-badge student',
  ADMIN: 'role-badge admin',
  MANAGER: 'role-badge manager',
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role: UserRole = user?.role ?? 'STUDENT';
  const menuItems = MENU_ITEMS[role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Header: Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={Logo} alt="Logo" width={50} height={50} />
          <h2 className="system-logo-text">QUẢN LÝ KTX</h2>
        </div>
      </div>

      {/* User Info */}
      <div className="sidebar-user-info">
        <div className="user-avatar">
          {(user?.fullName ?? 'U').charAt(0).toUpperCase()}
        </div>
        <div className="user-meta">
          <p className="user-name">{user?.fullName ?? 'Khách'}</p>
          <span className={ROLE_BADGE_CLASS[role]}>{ROLE_LABELS[role]}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            {item.icon}
            <span>{item.label}</span>
            <ChevronRight size={14} className="nav-arrow" />
          </NavLink>
        ))}
      </nav>

      {/* Footer: Logout */}
      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
