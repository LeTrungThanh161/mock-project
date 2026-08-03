import { useState, useEffect } from 'react';
import { Users, DoorClosed, AlertCircle, Briefcase } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
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

  // Chỉ Admin mới được xem Dashboard
  if (user?.role !== 'ADMIN') {
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
    </div>
  );
};

export default Dashboard;
