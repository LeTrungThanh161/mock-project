import { Bell, User } from 'lucide-react';
import './Topbar.css';

const Topbar = () => {
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
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">Operations</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
