import { useEffect, useState } from 'react';
import { Download, Filter, Plus, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import './Technicians.css';
import api from '../services/api';

export const Technicians = () => {
  const [techs, setTechs] = useState<any[]>([]);

  useEffect(() => {
    const mockData = [
      { id: 'KT001', name: 'Nguyễn Văn A', phone: '0987 654 321', spec: 'Điện', status: 'Sẵn Sàng' },
      { id: 'KT002', name: 'Trần Hoàng B', phone: '0912 345 678', spec: 'Nước', status: 'Bận' },
      { id: 'KT003', name: 'Lê Minh C', phone: '0901 223 344', spec: 'Net', status: 'Sẵn Sàng' },
      { id: 'KT004', name: 'Phạm Văn D', phone: '0977 888 999', spec: 'Máy Móc', status: 'Bận' },
      { id: 'KT005', name: 'Quách Thị E', phone: '0933 445 566', spec: 'Điện', status: 'Sẵn Sàng' },
    ];
    setTechs(mockData);
  }, []);

  return (
    <div className="tech-page-container">
      <div className="tech-header">
        <div>
          <h2>Quản lý Kỹ thuật viên</h2>
          <p>Quản lý nhân sự và lịch trình hoạt động của đội ngũ kỹ thuật.</p>
        </div>
        <button className="tech-btn-add"><Plus size={16} /> Thêm kỹ thuật viên</button>
      </div>

      <div className="tech-stats">
        <div className="tech-stat-card">
          <div className="tech-stat-top">
            <p>TỔNG SỐ NHÂN VIÊN</p>
            <Users size={20} className="text-blue" />
          </div>
          <h4>24</h4>
          <span className="success">↗ +2 tháng này</span>
        </div>
        <div className="tech-stat-card">
          <div className="tech-stat-top">
            <p>ĐANG SẴN SÀNG</p>
            <CheckCircle size={20} className="text-green" />
          </div>
          <h4>18</h4>
          <span>75% công suất</span>
        </div>
        <div className="tech-stat-card">
          <div className="tech-stat-top">
            <p>ĐANG BẬN</p>
            <Clock size={20} className="text-red" />
          </div>
          <h4>06</h4>
          <span>6 nhiệm vụ đang xử lý</span>
        </div>
        <div className="tech-stat-card">
          <div className="tech-stat-top">
            <p>HIỆU SUẤT THÁNG</p>
            <TrendingUp size={20} className="text-blue" />
          </div>
          <h4>92%</h4>
          <span className="info">Cao hơn 4% so với quý trước</span>
        </div>
      </div>

      <div className="tech-table-container">
        <div className="tech-table-actions">
          <div className="tech-search">
            <span>🔍</span>
            <input type="text" placeholder="Tìm kiếm tên, số điện thoại..." />
          </div>
          <div className="tech-actions-right">
            <button className="tech-btn-outline"><Filter size={16} /> Lọc Chuyên môn</button>
            <button className="tech-btn-outline"><Download size={16} /> Xuất báo cáo</button>
          </div>
        </div>

        <table className="tech-table">
          <thead>
            <tr>
              <th style={{ color: 'white' }}>HỌ VÀ TÊN</th>
              <th style={{ color: 'white' }}>SỐ ĐIỆN THOẠI</th>
              <th style={{ color: 'white' }}>CHUYÊN MÔN</th>
              <th style={{ color: 'white' }}>TRẠNG THÁI</th>
              <th style={{ color: 'white' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {techs.map((t, i) => (
              <tr key={i}>
                <td className="tech-name-cell" style={{ color: 'gray' }}>
                  <div className="tech-avatar">{t.name.substring(0, 2).toUpperCase()}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <div className="tech-id">Mã NV: {t.id}</div>
                  </div>
                </td>
                <td style={{ color: 'gray' }}>{t.phone}</td>
                <td><span className={`tech-spec-badge ${t.spec === 'Điện' ? 'blue' : t.spec === 'Nước' ? 'cyan' : t.spec === 'Net' ? 'purple' : 'orange'}`}>{t.spec}</span></td>
                <td style={{ color: 'gray' }}>
                  <span className={`tech-status-dot ${t.status === 'Sẵn Sàng' ? 'green' : 'red'}`}></span>
                  {t.status}
                </td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="tech-pagination">
          <span>Hiển thị 1-5 trên 24 nhân viên</span>
          <div className="tech-page-controls">
            <button>&lt;</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <span>...</span>
            <button>5</button>
            <button>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};
