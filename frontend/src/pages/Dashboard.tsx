import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const [occupancy, setOccupancy] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, you would use environment variables for API URL
    const API_BASE = 'http://localhost:8080/api';

    axios.get(`${API_BASE}/reports/occupancy`).then(res => setOccupancy(res.data)).catch(console.error);
    axios.get(`${API_BASE}/reports/revenue`).then(res => setRevenue(res.data)).catch(console.error);
    axios.get(`${API_BASE}/reports/overdue`).then(res => setOverdue(res.data)).catch(console.error);
  }, []);

  const pieData = occupancy ? [
    { name: 'Occupied', value: occupancy.occupiedRooms },
    { name: 'Available', value: occupancy.availableRooms },
  ] : [];

  return (
    <div className="dashboard-container">
      <div className="header-actions">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-3 stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Occupancy Rate</h3>
            <p className="stat-value">{occupancy ? `${occupancy.occupancyRate.toFixed(1)}%` : '...'}</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--info)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Expected Revenue</h3>
            <p className="stat-value">
              {revenue.length > 0 
                ? `${(revenue[revenue.length - 1].expectedRevenue / 1000000).toFixed(1)}M` 
                : '...'}
            </p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>Overdue Invoices</h3>
            <p className="stat-value">{overdue.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 charts-grid mt-6">
        <div className="glass-card">
          <h3>Revenue Overview</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" tick={{fill: '#94a3b8'}} tickFormatter={(tick) => {
                  if(!tick) return '';
                  const d = new Date(tick);
                  return `${d.getMonth() + 1}/${d.getFullYear()}`;
                }} />
                <YAxis tick={{fill: '#94a3b8'}} />
                <RechartsTooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} />
                <Legend />
                <Bar dataKey="expectedRevenue" fill="#4f46e5" name="Expected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualRevenue" fill="#10b981" name="Actual" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <h3>Room Occupancy</h3>
          <div className="chart-wrapper flex-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
