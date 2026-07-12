import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wrench, Zap, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">D</div>
        <h2>DormOS</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/helpdesk" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Wrench size={20} />
          <span>Helpdesk</span>
        </NavLink>
        <NavLink to="/utilities" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Zap size={20} />
          <span>Utilities</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
