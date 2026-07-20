import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Topbar.css';

const ROLE_LABEL: Record<string, string> = {
  STUDENT: 'Sinh viên',
  MANAGER: 'Quản lý',
  ADMIN: 'Quản trị viên',
};

const Topbar = () => {
  const { user } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
    : '?';

  return (
    <header className="topbar">
      <div className="search-bar">
        {/* Placeholder for search if needed */}
      </div>
      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge-dot"></span>
        </button>
        {user && (
          <div className="user-profile">
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user.fullName || user.username}</span>
              <span className="user-role">{ROLE_LABEL[user.role] ?? user.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
