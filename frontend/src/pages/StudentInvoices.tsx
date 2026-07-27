import { useEffect, useState } from 'react';
import { ChevronRight, CreditCard } from 'lucide-react';
import './StudentInvoices.css';
import api from '../services/api';

type InvoiceItem = {
  invoiceId: number;
  id: string;
  period: string;
  due: string;
  total: number;
  status: string;
  roomFee: number;
  electricityFee: number;
  waterFee: number;
  internetFee: number;
  paymentStatus: string;
};

export const StudentInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [selectedInv, setSelectedInv] = useState<InvoiceItem | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const response = await api.get('/invoices/my');
        const mapped = (response.data || []).map((item: any) => ({
          invoiceId: item.invoiceId,
          id: `INV-${item.invoiceId}`,
          period: `Tháng ${new Date(item.billingMonth).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}`,
          due: item.dueDate ? new Date(item.dueDate).toLocaleDateString('vi-VN') : '—',
          total: Number(item.totalAmount ?? (item.roomFee ?? 0) + (item.electricityFee ?? 0) + (item.waterFee ?? 0) + (item.internetFee ?? 0)),
          status: item.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN',
          roomFee: Number(item.roomFee ?? 0),
          electricityFee: Number(item.electricityFee ?? 0),
          waterFee: Number(item.waterFee ?? 0),
          internetFee: Number(item.internetFee ?? 0),
          paymentStatus: item.paymentStatus,
        }));
        setInvoices(mapped);
        setSelectedInv(mapped[0] ?? null);
      } catch (err: any) {
        setError(err?.message || 'Không thể tải danh sách hóa đơn');
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const formatCurrency = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' đ';

  const handlePay = async () => {
    if (!selectedInv) return;
    setPaying(true);
    try {
      const response = await api.post(`/payments/${selectedInv.invoiceId}/create?gateway=VNPAY`);
      const paymentUrl = response.data?.paymentUrl;
      if (paymentUrl) {
        window.open(paymentUrl, '_blank', 'noopener,noreferrer');
        setShowPayment(false);
      } else {
        setError('Không nhận được đường dẫn thanh toán');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tạo link thanh toán');
    } finally {
      setPaying(false);
    }
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
          {loading && <p>Đang tải hóa đơn...</p>}
          {error && <p className="text-danger">{error}</p>}
          <div className="si-list">
            {invoices.map((inv) => (
              <div
                key={inv.invoiceId}
                className={`si-list-item ${selectedInv?.invoiceId === inv.invoiceId ? 'active' : ''}`}
                onClick={() => setSelectedInv(inv)}
              >
                <div className="si-item-top">
                  <span>Kỳ thanh toán</span>
                  <span className={`si-badge ${inv.paymentStatus === 'PAID' ? 'success' : 'danger'}`}>
                    {inv.status}
                  </span>
                </div>
                <h4>{inv.period}</h4>
                <div className="si-item-bottom">
                  <div>
                    <span className="text-gray">Hạn chót: {inv.due}</span>
                    <h3 className="si-item-total">{formatCurrency(inv.total)}</h3>
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
                  <span className="si-icon-box">🏢</span> Chi tiết phí
                </div>
                <table className="si-table no-bg">
                  <tbody>
                    <tr><td>Tiền phòng cố định</td><td></td><td>{formatCurrency(selectedInv.roomFee)}</td></tr>
                    <tr><td>Tiền điện</td><td></td><td>{formatCurrency(selectedInv.electricityFee)}</td></tr>
                    <tr><td>Tiền nước</td><td></td><td>{formatCurrency(selectedInv.waterFee)}</td></tr>
                    <tr><td>Internet</td><td></td><td>{formatCurrency(selectedInv.internetFee)}</td></tr>
                    <tr className="si-total-row"><td>Tổng cộng</td><td></td><td>{formatCurrency(selectedInv.total)}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="si-detail-footer">
                <div>
                  <span className="text-gray">TỔNG SỐ TIỀN CẦN THANH TOÁN</span>
                  <h2 className="si-grand-total">{formatCurrency(selectedInv.total)}</h2>
                </div>
                {selectedInv.paymentStatus !== 'PAID' && (
                  <button className="si-btn-pay" onClick={() => setShowPayment(true)} disabled={paying}>
                    <CreditCard size={18} /> {paying ? 'Đang xử lý...' : 'Thanh toán trực tuyến'}
                  </button>
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
            <p>Bạn sẽ được chuyển đến cổng VNPay để thanh toán <strong>{formatCurrency(selectedInv?.total ?? 0)}</strong></p>
            <div className="flex justify-end gap-2 mt-4">
              <button className="si-btn-cancel" onClick={() => setShowPayment(false)}>Hủy</button>
              <button className="si-btn-pay" onClick={handlePay} disabled={paying}>
                {paying ? 'Đang tạo link...' : 'Tiếp tục thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
