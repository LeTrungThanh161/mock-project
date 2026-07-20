import { useEffect, useState } from 'react';
import { Download, Eye, Filter, Printer, Zap } from 'lucide-react';
import './Invoices.css';
import api from '../services/api';

export const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const mockData = [
      { id: 'INV-240501', room: 'P.302 (Khu A)', period: 'Tháng 05/2024', total: 4520000, due: '15/05/2024', status: 'Đã thanh toán' },
      { id: 'INV-240502', room: 'P.105 (Khu B)', period: 'Tháng 05/2024', total: 3280000, due: '15/05/2024', status: 'Chưa thanh toán' },
      { id: 'INV-240489', room: 'P.404 (Khu A)', period: 'Tháng 04/2024', total: 5100000, due: '30/04/2024', status: 'Quá hạn' },
      { id: 'INV-240503', room: 'P.210 (Khu C)', period: 'Tháng 05/2024', total: 2950000, due: '15/05/2024', status: 'Đã thanh toán' },
      { id: 'INV-240504', room: 'P.501 (Khu A)', period: 'Tháng 05/2024', total: 4890000, due: '15/05/2024', status: 'Chưa thanh toán' },
    ];
    setInvoices(mockData);
  }, []);

  return (
    <div className="inv-page-container">
      <div className="inv-header">
        <h2>Quản lý Hóa đơn</h2>
      </div>

      <div className="inv-banner">
        <div>
          <h3>Hệ thống Xuất Hóa Đơn Tự Động</h3>
          <p>Tối ưu hóa quy trình quản lý bằng cách xuất hóa đơn cho tất cả các phòng chỉ với một lần nhấn. Hệ thống sẽ tự động tính toán chi phí điện, nước và dịch vụ đi kèm.</p>
          <button className="inv-btn-auto"><Zap size={16} /> Xuất hóa đơn hệ thống hàng loạt</button>
        </div>
        <div className="inv-banner-icon">
          {/* Decorative Icon */}
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
      </div>

      <div className="inv-stats">
        <div className="inv-stat-card">
          <p>TỔNG HÓA ĐƠN</p>
          <h4>128</h4>
          <span className="success">↗ +12% tháng này</span>
        </div>
        <div className="inv-stat-card">
          <p>CHƯA THANH TOÁN</p>
          <h4 className="danger">15</h4>
          <span className="danger">⚠ Cần xử lý ngay</span>
        </div>
        <div className="inv-stat-card">
          <p>QUÁ HẠN</p>
          <h4 className="warning">4</h4>
          <span className="warning">🕒 Trung bình 3 ngày</span>
        </div>
        <div className="inv-stat-card">
          <p>DOANH THU THÁNG</p>
          <h4 className="info">345.2M</h4>
          <span className="success">✓ Đạt 85% kế hoạch</span>
        </div>
      </div>

      <div className="inv-table-container">
        <div className="inv-table-actions">
          <div className="inv-search">
            <span>🔍</span>
            <input type="text" placeholder="Tìm kiếm phòng, mã..." />
          </div>
          <div className="inv-actions-right">
            <button className="inv-btn-outline"><Filter size={16} /> Lọc dữ liệu</button>
            <button className="inv-btn-outline"><Download size={16} /> Xuất Excel</button>
          </div>
        </div>

        <table className="inv-table">
          <thead>
            <tr>
              <th>MÃ HÓA ĐƠN</th>
              <th>PHÒNG</th>
              <th>KỲ THANH TOÁN</th>
              <th>TỔNG TIỀN (VNĐ)</th>
              <th>HẠN CHÓT</th>
              <th>TRẠNG THÁI</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={i}>
                <td className="text-gray">{inv.id}</td>
                <td className="text-gray">{inv.room}</td>
                <td className="text-gray">{inv.period}</td>
                <td className="text-gray"><strong>{inv.total.toLocaleString()}</strong></td>
                <td className={inv.status === 'Quá hạn' ? 'danger-text' : 'text-gray'}>{inv.due}</td>
                <td>
                  <span className={`inv-badge ${inv.status === 'Đã thanh toán' ? 'success' : inv.status === 'Chưa thanh toán' ? 'warning' : 'danger'}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="inv-action-cells">
                  {inv.status !== 'Đã thanh toán' && (
                    <button className="inv-btn-primary">{inv.status === 'Quá hạn' ? 'Nhắc nợ' : 'Thu tiền'}</button>
                  )}
                  <button className="inv-btn-icon"><Eye size={16}/></button>
                  {inv.status === 'Đã thanh toán' && <button className="inv-btn-icon"><Printer size={16}/></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="inv-pagination">
          <span>Đang hiển thị 5 trên 128 kết quả</span>
          <div className="inv-page-controls">
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
