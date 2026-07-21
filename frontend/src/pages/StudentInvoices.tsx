import { useEffect, useState } from 'react';
import { ChevronRight, CreditCard } from 'lucide-react';
import './StudentInvoices.css';
import api from '../services/api';

export const StudentInvoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInv, setSelectedInv] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    // Mock API
    const mockList = [
      { id: 'INV-260703', period: 'Tháng 07/2026', due: '15/08/2026', total: 1250000, status: 'CHƯA THANH TOÁN' },
      { id: 'INV-260601', period: 'Tháng 06/2026', due: '15/07/2026', total: 1180000, status: 'ĐÃ THANH TOÁN' },
      { id: 'INV-260505', period: 'Tháng 05/2026', due: '15/06/2026', total: 1025000, status: 'ĐÃ THANH TOÁN' },
      { id: 'INV-260408', period: 'Tháng 04/2026', due: '15/05/2026', total: 1240000, status: 'ĐĐÃ THANH TOÁN' },
    ];
    setInvoices(mockList);
    setSelectedInv(mockList[0]);
  }, []);

  const handlePay = () => {
    setShowPayment(true);
  };

  const confirmPayment = () => {
    alert('Thanh toán thành công!');
    setShowPayment(false);
  };

  return (
    <div className="si-page-container">
      <div className="si-header-filters">
        <div className="si-filters">
          <span className="si-filter-label">YEAR</span>
          <select className="si-select"><option>2026</option></select>
          <span className="si-filter-label">STATUS</span>
          <div className="si-toggle-group">
            <button className="active">All</button>
            <button>Unpaid</button>
            <button>Paid</button>
          </div>
        </div>
      </div>

      <div className="si-content">
        <div className="si-list-section">
          <h2>Hóa đơn điện nước</h2>
          <div className="si-list">
            {invoices.map((inv, i) => (
              <div 
                key={i} 
                className={`si-list-item ${selectedInv?.id === inv.id ? 'active' : ''}`}
                onClick={() => setSelectedInv(inv)}
              >
                <div className="si-item-top">
                  <span>Kỳ thanh toán</span>
                  <span className={`si-badge ${inv.status === 'CHƯA THANH TOÁN' ? 'danger' : 'success'}`}>
                    {inv.status}
                  </span>
                </div>
                <h4>{inv.period}</h4>
                <div className="si-item-bottom">
                  <div>
                    <span className="text-gray">Hạn chót: {inv.due}</span>
                    <h3 className="si-item-total">{inv.total.toLocaleString()} đ</h3>
                  </div>
                  <ChevronRight size={20} className="text-gray" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="si-detail-section">
          {selectedInv && (
            <div className="si-detail-card">
              <div className="si-detail-header">
                <div>
                  <span className="text-gray">CHI TIẾT HÓA ĐƠN</span>
                  <h2>{selectedInv.period}</h2>
                </div>
                <div className="text-right">
                  <span className="text-gray">Mã hóa đơn</span>
                  <h4>{selectedInv.id}</h4>
                </div>
              </div>

              <div className="si-detail-body">
                <div className="si-section-title">
                  <span className="si-icon-box">🏢</span> Tiền phòng cố định
                </div>
                <table className="si-table">
                  <thead><tr><th>LOẠI PHÒNG</th><th>DIỆN TÍCH</th><th>ĐƠN GIÁ</th></tr></thead>
                  <tbody><tr><td>Phòng tiêu chuẩn 4 người</td><td>24 m²</td><td>800.000 đ</td></tr></tbody>
                </table>

                <div className="si-section-title mt-6">
                  <span className="si-icon-box elec">⚡</span> Tiền điện (Lũy tiến)
                </div>
                <div className="si-readings-box">
                  <div><span className="text-gray">CHỈ SỐ CŨ</span><br/><strong>1250</strong></div>
                  <div><span className="text-gray">CHỈ SỐ MỚI</span><br/><strong>1320</strong></div>
                  <div><span className="text-gray">TIÊU THỤ</span><br/><strong className="text-blue">70 kWh</strong></div>
                </div>
                <table className="si-table no-bg">
                  <tbody>
                    <tr><td>Bậc 1: 50 kWh đầu tiên</td><td>50 kWh × 1.800đ</td><td>90.000 đ</td></tr>
                    <tr><td>Bậc 2: 20 kWh tiếp theo</td><td>20 kWh × 2.500đ</td><td>50.000 đ</td></tr>
                    <tr className="si-total-row"><td>Tổng cộng tiền điện</td><td></td><td>140.000 đ</td></tr>
                  </tbody>
                </table>

                <div className="si-section-title mt-6">
                  <span className="si-icon-box water">💧</span> Tiền nước
                </div>
                <table className="si-table no-bg">
                  <tbody>
                    <tr><td>Chỉ số tiêu thụ</td><td>8 m³ × 6.000đ</td><td>48.000 đ</td></tr>
                    <tr className="si-total-row"><td>Tổng cộng tiền nước</td><td></td><td>48.000 đ</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="si-detail-footer">
                <div>
                  <span className="text-gray">TỔNG SỐ TIỀN CẦN THANH TOÁN</span>
                  <h2 className="si-grand-total">{selectedInv.total.toLocaleString()} đ</h2>
                </div>
                {selectedInv.status === 'CHƯA THANH TOÁN' && (
                  <button className="si-btn-pay" onClick={handlePay}><CreditCard size={18} /> Thanh toán trực tuyến</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showPayment && (
        <div className="si-modal-overlay">
          <div className="si-modal">
            <h3>Cổng thanh toán</h3>
            <p>Vui lòng nhập thông tin thẻ để thanh toán <strong>{selectedInv?.total.toLocaleString()} đ</strong></p>
            <input type="text" placeholder="Số thẻ (VD: 4123 4567 8901 2345)" className="si-input-full" />
            <div className="flex gap-2">
              <input type="text" placeholder="MM/YY" className="si-input-half" />
              <input type="text" placeholder="CVC" className="si-input-half" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="si-btn-cancel" onClick={() => setShowPayment(false)}>Hủy</button>
              <button className="si-btn-pay" onClick={confirmPayment}>Xác nhận thanh toán</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
