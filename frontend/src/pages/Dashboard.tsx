import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, DoorClosed, AlertCircle, Banknote, MoreVertical, Mail } from 'lucide-react';
import './Dashboard.css';
import api from '../services/api';

const COLORS = ['#60a5fa', '#f1f5f9'];

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Mock API call
    api.get('/statistics/dashboard')
      .then(res => setStats(res.data))
      .catch(() => {
        setStats({
          totalStudents: 1248,
          activeRooms: 312,
          totalRooms: 350,
          issuesCount: 14,
          revenue: '428.5M',
          occupancyRate: 89
        });
      });
  }, []);

  const pieData = stats ? [
    { name: 'Lấp Đầy', value: stats.activeRooms },
    { name: 'Trống', value: stats.totalRooms - stats.activeRooms },
  ] : [];

  const barData = [
    { name: 'Tòa A', actual: 400, expected: 420 },
    { name: 'Tòa B', actual: 300, expected: 310 },
    { name: 'Tòa C', actual: 200, expected: 250 },
    { name: 'Tòa D', actual: 278, expected: 290 },
    { name: 'Tòa E', actual: 189, expected: 200 },
  ];

  const overdueList = [
    { room: 'A-402', name: 'Nguyễn Văn An', invoiceId: '#INV-231024', amount: '3,450,000 đ', days: 12, status: 'RỦI RO CAO' },
    { room: 'C-205', name: 'Trần Thị Bích', invoiceId: '#INV-231105', amount: '1,200,000 đ', days: 5, status: 'CHƯA GIẢI QUYẾT' },
    { room: 'B-101', name: 'Lê Hoàng Long', invoiceId: '#INV-230988', amount: '5,800,000 đ', days: 18, status: 'RỦI RO CAO' },
    { room: 'D-310', name: 'Phan Minh Anh', invoiceId: '#INV-231212', amount: '850,000 đ', days: 2, status: 'GẦN ĐÂY' },
  ];

  return (
    <div className="dash-container">
      <div className="dash-header">
        <h2>Dashboard Thống kê</h2>
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
            <p>PHÒNG HOẠT ĐỘNG</p>
            <div className="dash-icon-wrapper blue"><DoorClosed size={20} /></div>
          </div>
          <h3>{stats?.activeRooms || 0} / {stats?.totalRooms || 0}</h3>
          <div className="dash-progress-bg">
            <div className="dash-progress-fill" style={{ width: `${stats ? (stats.activeRooms/stats.totalRooms)*100 : 0}%` }}></div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <p>VẤN ĐỀ</p>
            <div className="dash-icon-wrapper red"><AlertCircle size={20} /></div>
          </div>
          <h3>{stats?.issuesCount || 0}</h3>
          <span className="dash-stat-sub">4 bảo trì, 10 thanh toán</span>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <p>DOANH THU THÁNG TRƯỚC (VNĐ)</p>
            <div className="dash-icon-wrapper orange"><Banknote size={20} /></div>
          </div>
          <h3>{stats?.revenue || '0M'}</h3>
        </div>
      </div>

      <div className="dash-charts-row">
        <div className="dash-chart-card pie-card">
          <div className="dash-chart-title">
            <h4>Tỉ Lệ Lấp Đầy</h4>
            <span>ⓘ</span>
          </div>
          <div className="dash-pie-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="dash-pie-center">
              <span className="dash-pie-percent">{stats?.occupancyRate || 0}%</span>
              <span className="dash-pie-label">TỔNG</span>
            </div>
          </div>
          <div className="dash-pie-legend">
            <span><span className="dash-dot blue"></span> Lấp Đầy ({stats?.activeRooms})</span>
            <span><span className="dash-dot gray"></span> Trống ({stats?.totalRooms - stats?.activeRooms})</span>
          </div>
        </div>

        <div className="dash-chart-card bar-card">
          <div className="dash-chart-title">
            <h4>Doanh thu theo từng tòa nhà (triệu VNĐ)</h4>
            <select className="dash-select"><option>Monthly View</option></select>
          </div>
          <div className="dash-bar-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis hide />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                <Legend iconType="square" wrapperStyle={{fontSize: 12, bottom: -10}} />
                <Bar dataKey="actual" name="Doanh thu thực tế" fill="#0f172a" radius={[4, 4, 4, 4]} />
                <Bar dataKey="expected" name="Doanh thu dự kiến" fill="#bae6fd" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dash-table-card">
        <div className="dash-table-header">
          <div>
            <h4>Danh Sách Quá Hạn</h4>
            <p>Đã tìm thấy 8 khoản thanh toán đang chờ xử lý cần được xử lý ngay lập tức.</p>
          </div>
          <button className="dash-btn-remind"><Mail size={16} /> Nhắc Nhở</button>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>PHÒNG</th>
              <th>TÊN SINH VIÊN</th>
              <th>MÃ SỐ HÓA ĐƠN</th>
              <th>SỐ TIỀN NỢ</th>
              <th>SỐ NGÀY QUÁ HẠN</th>
              <th>TÌNH TRẠNG</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {overdueList.map((item, i) => (
              <tr key={i}>
                <td className="text-gray"><strong>{item.room}</strong></td>
                <td className="text-gray">{item.name}</td>
                <td className="text-gray">{item.invoiceId}</td>
                <td className="text-red font-medium">{item.amount}</td>
                <td className="text-gray">{item.days} ngày</td>
                <td>
                  <span className={`dash-badge ${item.status === 'RỦI RO CAO' ? 'danger' : 'warning'}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button className="dash-btn-icon"><MoreVertical size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="dash-pagination">
          <span>Hiển thị 4 trong số 8 hồ sơ quá hạn</span>
          <div className="dash-page-controls">
            <button>&lt;</button>
            <button>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
