import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
{/* Bỏ dòng dưới khi production */}
import DevRoleSwitcher from './DevRoleSwitcher'

const Layout = () => {
  return (
    <div className="app-container animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      {/* Bỏ dòng dưới khi production */}
      <DevRoleSwitcher/>
    </div>
  );
};

export default Layout;
