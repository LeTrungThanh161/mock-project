import { useEffect, useState } from 'react';
import { Plus, Wrench, CheckCircle, Clock } from 'lucide-react';
import './IssueTickets.css';
import api from '../services/api';

export const IssueTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const mockData = [
      { id: '#TK-4592', room: 'P.302-A', type: 'Điện & Năng lượng', desc: 'Mất điện đột ngột ở...', priority: 'Khẩn cấp', status: 'Chờ xử lý' },
      { id: '#TK-4591', room: 'P.105-B', type: 'Nước & Vệ sinh', desc: 'Vòi sen rò rỉ nước liê...', priority: 'Bình thường', status: 'Đã gán việc' },
      { id: '#TK-4588', room: 'P.501-A', type: 'Internet & IT', desc: 'Tốc độ mạng chậm, ...', priority: 'Trung bình', status: 'Đang thực hiện' },
    ];
    setTickets(mockData);
  }, []);

  return (
    <div className="tk-page-container">
      <div className="tk-header">
        <h2>Helpdesk & Báo cáo sự cố</h2>
      </div>

      <div className="tk-stats">
        <div className="tk-stat-card">
          <p>TỔNG SỰ CỐ</p>
          <h4>128</h4>
          <span className="info">↗ +12% vs tháng trước</span>
        </div>
        <div className="tk-stat-card">
          <p>ĐANG XỬ LÝ</p>
          <h4>14</h4>
          <div className="tk-progress-bar"><div className="tk-progress" style={{width:'40%'}}></div></div>
        </div>
        <div className="tk-stat-card">
          <p>ƯU TIÊN CAO</p>
          <h4 className="danger">05</h4>
          <span className="danger">Cần giải quyết ngay</span>
        </div>
        <div className="tk-stat-card">
          <p>ĐÃ HOÀN TẤT</p>
          <h4>109</h4>
          <span>Tỷ lệ hoàn thành 85%</span>
        </div>
      </div>

      <div className="tk-table-container">
        <div className="tk-table-actions">
          <div className="tk-title-search">
            <h3>Danh sách yêu cầu hỗ trợ</h3>
            <div className="tk-search">
              <span>🔍</span>
              <input type="text" placeholder="Tìm kiếm phòng, mã..." />
            </div>
          </div>
          <button className="tk-btn-primary"><Plus size={16} /> TẠO PHIẾU MỚI</button>
        </div>

        <table className="tk-table">
          <thead>
            <tr>
              <th>MÃ SỐ</th>
              <th>PHÒNG</th>
              <th>LOẠI SỰ CỐ</th>
              <th>NỘI DUNG TÓM TẮT</th>
              <th>MỨC ĐỘ</th>
              <th>TRẠNG THÁI</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t, i) => (
              <tr key={i}>
                <td><strong>{t.id}</strong></td>
                <td>{t.room}</td>
                <td className="tk-type-cell">
                  {t.type.includes('Điện') ? <span className="tk-icon elec">⚡</span> : t.type.includes('Nước') ? <span className="tk-icon water">💧</span> : <span className="tk-icon net">📡</span>}
                  {t.type}
                </td>
                <td>{t.desc}</td>
                <td>
                  <span className={`tk-priority-badge ${t.priority === 'Khẩn cấp' ? 'danger' : t.priority === 'Trung bình' ? 'warning' : 'normal'}`}>
                    {t.priority}
                  </span>
                </td>
                <td>
                  <span className={`tk-status-dot ${t.status === 'Chờ xử lý' ? 'red' : t.status === 'Đã gán việc' ? 'orange' : 'blue'}`}></span>
                  {t.status}
                </td>
                <td>
                  <button className="tk-btn-action"><Wrench size={14} /> Xử lý</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="tk-pagination">
          <span>Hiển thị 1-10 trên 128 yêu cầu</span>
          <div className="tk-page-controls">
            <button>&lt;</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};
