import { useState, useEffect } from 'react';
import { Users, DoorClosed, AlertCircle, Briefcase, Settings, Wrench, HardHat, Zap } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Mock API call
    api.get('/statistics/dashboard')
      .then(res => {
        setStats(res.data);
      })
      .catch(() => {
        setStats({
          totalStudents: 1248,
          totalEmployees: 45, // Thêm tổng nhân viên
          activeRooms: 312,
          totalRooms: 350,
          issuesCount: 14,
          occupancyRate: 89
        });
      });
  }, []);

  // Chỉ Admin và Manager mới được xem Dashboard
  if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
    return <Navigate to="/buildings" replace />;
  }

  return (
    <div className="dash-container">
      <div className="dash-header">
        <h2>Thống kê</h2>
      </div>

      <div className="dash-stats-row">
        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <p>TỔNG SINH VIÊN</p>
            <div className="dash-icon-wrapper gray"><Users size={20} /></div>
          </div>
          <h3>{stats?.totalStudents || 0}</h3>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <p>TỔNG NHÂN VIÊN</p>
            <div className="dash-icon-wrapper orange"><Briefcase size={20} /></div>
          </div>
          <h3>{stats?.totalEmployees || 0}</h3>
          <span className="dash-stat-sub">Quản lý & Kỹ thuật viên</span>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <p>PHÒNG HOẠT ĐỘNG</p>
            <div className="dash-icon-wrapper blue"><DoorClosed size={20} /></div>
          </div>
          <h3>{stats?.activeRooms || 0} / {stats?.totalRooms || 0}</h3>
          <div className="dash-progress-bg">
            <div className="dash-progress-fill" style={{ width: `${stats ? (stats.activeRooms / stats.totalRooms) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <p>VẤN ĐỀ</p>
            <div className="dash-icon-wrapper red"><AlertCircle size={20} /></div>
          </div>
          <h3>{stats?.issuesCount || 0}</h3>
          <span className="dash-stat-sub">Đang cần giải quyết</span>
        </div>
      </div>

      <div className="dash-header" style={{ marginTop: '30px' }}>
        <h2>Lối tắt</h2>
      </div>

      <div className="dash-stats-row">
        {user?.role === 'ADMIN' && (
          <>
            <div className="dash-stat-card shortcut-card" onClick={() => navigate('/pricing-tiers')}>
              <div className="dash-stat-top">
                <p>CẤU HÌNH GIÁ</p>
                <div className="dash-icon-wrapper gray"><Settings size={20} /></div>
              </div>
              <h3>Bảng giá</h3>
              <span className="dash-stat-sub">Truy cập cấu hình giá</span>
            </div>
            <div className="dash-stat-card shortcut-card" onClick={() => navigate('/helpdesk')}>
              <div className="dash-stat-top">
                <p>HỖ TRỢ</p>
                <div className="dash-icon-wrapper orange"><Wrench size={20} /></div>
              </div>
              <h3>Tickets</h3>
              <span className="dash-stat-sub">Quản lý yêu cầu</span>
            </div>
            <div className="dash-stat-card shortcut-card" onClick={() => navigate('/technicians')}>
              <div className="dash-stat-top">
                <p>KỸ THUẬT VIÊN</p>
                <div className="dash-icon-wrapper blue"><HardHat size={20} /></div>
              </div>
              <h3>Nhân sự</h3>
              <span className="dash-stat-sub">Quản lý kỹ thuật viên</span>
            </div>
          </>
        )}
        {user?.role === 'MANAGER' && (
          <>
            <div className="dash-stat-card shortcut-card" onClick={() => navigate('/meter-readings')}>
              <div className="dash-stat-top">
                <p>ĐIỆN & NƯỚC</p>
                <div className="dash-icon-wrapper blue"><Zap size={20} /></div>
              </div>
              <h3>Ghi số</h3>
              <span className="dash-stat-sub">Quản lý điện nước</span>
            </div>
            <div className="dash-stat-card shortcut-card" onClick={() => navigate('/helpdesk')}>
              <div className="dash-stat-top">
                <p>HỖ TRỢ</p>
                <div className="dash-icon-wrapper orange"><Wrench size={20} /></div>
              </div>
              <h3>Tickets</h3>
              <span className="dash-stat-sub">Quản lý yêu cầu</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
