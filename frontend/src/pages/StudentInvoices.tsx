import { useEffect, useState } from 'react';
import { ChevronRight, CreditCard } from 'lucide-react';
import './StudentInvoices.css';
import api, { createPayment } from '../services/api';

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
  invoiceType: string;
  invoiceTypeLabel: string;
  statusLabel: string;
  penaltyAmount: number;
  canPay: boolean;
  paymentCheckoutUrl?: string;
  paymentCounterpartCode?: string;
  billingMonth?: string;
};

export const StudentInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [selectedInv, setSelectedInv] = useState<InvoiceItem | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'UNPAID' | 'PAID'>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [paymentHint, setPaymentHint] = useState<string | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ SỬA 1: map đúng enum Java (Unpaid / Paid)
      const response = await api.get('/invoices/my', {
        params:
          statusFilter === 'all'
            ? {}
            : { status: statusFilter === 'UNPAID' ? 'Unpaid' : 'Paid' },
      });

      const items = Array.isArray(response?.data)
        ? response.data
        : response?.data?.items || [];

      const mapped: InvoiceItem[] = items.map((item: any) => {
        const total = Number(
          item.totalAmount ??
            (item.roomFee ?? 0) +
              (item.electricityFee ?? 0) +
              (item.waterFee ?? 0) +
              (item.internetFee ?? 0) +
              (item.penaltyAmount ?? 0)
        );

        return {
          invoiceId: item.invoiceId,
          id: `INV-${item.invoiceId}`,

          // ✅ SỬA 2: format period không bị "Tháng tháng"
          period: item.billingMonth
            ? (() => {
                const d = new Date(item.billingMonth);
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const y = d.getFullYear();
                return `Tháng ${m}/${y}`;
              })()
            : '—',

          due: item.dueDate
            ? new Date(item.dueDate).toLocaleDateString('vi-VN')
            : '—',
          total,
          status:
            item.statusLabel ||
            (item.paymentStatus === 'PAID' || item.paymentStatus === 'Paid'
              ? 'ĐÃ THANH TOÁN'
              : 'CHƯA THANH TOÁN'),
          roomFee: Number(item.roomFee ?? 0),
          electricityFee: Number(item.electricityFee ?? 0),
          waterFee: Number(item.waterFee ?? 0),
          internetFee: Number(item.internetFee ?? 0),
          paymentStatus: item.paymentStatus,
          invoiceType: item.invoiceType,
          invoiceTypeLabel: item.invoiceTypeLabel || 'Hóa đơn tiền phòng',
          statusLabel: item.statusLabel,
          penaltyAmount: Number(item.penaltyAmount ?? 0),
          canPay: item.canPay !== false,
          paymentCheckoutUrl: item.paymentCheckoutUrl,
          paymentCounterpartCode: item.paymentCounterpartCode,
          billingMonth: item.billingMonth,
        };
      });

      // Lọc theo năm nếu có
      let filtered = mapped;
      if (yearFilter !== 'all') {
        filtered = mapped.filter((inv) => {
          if (!inv.billingMonth) return false;
          return new Date(inv.billingMonth).getFullYear().toString() === yearFilter;
        });
      }

      setInvoices(filtered);
      setSelectedInv((prev) => {
        if (!prev) return filtered[0] ?? null;
        const stillExists = filtered.find((i) => i.invoiceId === prev.invoiceId);
        return stillExists ?? filtered[0] ?? null;
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Đọc query sau khi PayOS redirect về
    const params = new URLSearchParams(window.location.search);
    const paymentState = params.get('payment');
    if (paymentState === 'success') {
      setPaymentHint('Thanh toán thành công! Hệ thống đang cập nhật trạng thái hóa đơn.');
    } else if (paymentState === 'cancelled' || paymentState === 'failed') {
      setPaymentHint('Thanh toán chưa hoàn tất hoặc đã bị hủy.');
    }

    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, yearFilter]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' đ';

  const handlePay = async (gateway: string) => {
    if (!selectedInv) return;
    setPaying(true);
    setError(null);
    try {
      const response = await createPayment(selectedInv.invoiceId, gateway);
      const paymentUrl = response?.paymentUrl;
      if (paymentUrl) {
        window.open(paymentUrl, '_blank', 'noopener,noreferrer');
        setShowPayment(false);
      } else {
        setError('Không nhận được đường dẫn thanh toán');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Không thể tạo link thanh toán'
      );
    } finally {
      setPaying(false);
    }
  };

  // Lấy danh sách năm từ hóa đơn để filter
  const availableYears = Array.from(
    new Set(
      invoices
        .map((i) => (i.billingMonth ? new Date(i.billingMonth).getFullYear() : null))
        .filter(Boolean)
    )
  ).sort((a, b) => (b as number) - (a as number));

  const isPaid =
    selectedInv?.paymentStatus === 'PAID' ||
    selectedInv?.paymentStatus === 'Paid';

  return (
    <div className="si-page-container">
      {paymentHint && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 16px',
            borderRadius: 8,
            background: paymentHint.includes('thành công') ? '#ecfdf5' : '#fff7ed',
            color: paymentHint.includes('thành công') ? '#065f46' : '#9a3412',
            border: `1px solid ${
              paymentHint.includes('thành công') ? '#a7f3d0' : '#fed7aa'
            }`,
          }}
        >
          {paymentHint}
        </div>
      )}

      <div className="si-header-filters">
        <div className="si-filters">
          <span className="si-filter-label">YEAR</span>
          <select
            className="si-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {availableYears.length === 0 && (
              <option value={new Date().getFullYear().toString()}>
                {new Date().getFullYear()}
              </option>
            )}
            {availableYears.map((y) => (
              <option key={String(y)} value={String(y)}>
                {y}
              </option>
            ))}
          </select>

          <span className="si-filter-label">STATUS</span>
          <div className="si-toggle-group">
            <button
              className={statusFilter === 'all' ? 'active' : ''}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              className={statusFilter === 'UNPAID' ? 'active' : ''}
              onClick={() => setStatusFilter('UNPAID')}
            >
              Unpaid
            </button>
            <button
              className={statusFilter === 'PAID' ? 'active' : ''}
              onClick={() => setStatusFilter('PAID')}
            >
              Paid
            </button>
          </div>
        </div>
      </div>

      <div className="si-content">
        {/* Danh sách bên trái */}
        <div className="si-list-section">
          <h2>Hóa đơn của tôi</h2>
          {loading && <p>Đang tải hóa đơn...</p>}
          {error && <p style={{ color: '#dc2626' }}>{error}</p>}
          {!loading && !error && invoices.length === 0 && (
            <p>Chưa có hóa đơn nào.</p>
          )}

          <div className="si-list">
            {invoices.map((inv) => (
              <div
                key={inv.invoiceId}
                className={`si-list-item ${
                  selectedInv?.invoiceId === inv.invoiceId ? 'active' : ''
                }`}
                onClick={() => setSelectedInv(inv)}
              >
                <div className="si-item-top">
                  <span>Kỳ thanh toán</span>
                  <span
                    className={`si-badge ${
                      inv.paymentStatus === 'PAID' || inv.paymentStatus === 'Paid'
                        ? 'success'
                        : 'danger'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
                <h4>{inv.period}</h4>
                <div className="text-gray">{inv.invoiceTypeLabel}</div>
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

        {/* Chi tiết bên phải */}
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
                    <tr>
                      <td>Tiền phòng</td>
                      <td></td>
                      <td>{formatCurrency(selectedInv.roomFee)}</td>
                    </tr>
                    <tr>
                      <td>Tiền điện</td>
                      <td></td>
                      <td>{formatCurrency(selectedInv.electricityFee)}</td>
                    </tr>
                    <tr>
                      <td>Tiền nước</td>
                      <td></td>
                      <td>{formatCurrency(selectedInv.waterFee)}</td>
                    </tr>
                    {selectedInv.internetFee > 0 && (
                      <tr>
                        <td>Internet</td>
                        <td></td>
                        <td>{formatCurrency(selectedInv.internetFee)}</td>
                      </tr>
                    )}
                    {selectedInv.penaltyAmount > 0 && (
                      <tr>
                        <td>Phạt quá hạn</td>
                        <td></td>
                        <td>{formatCurrency(selectedInv.penaltyAmount)}</td>
                      </tr>
                    )}
                    <tr className="si-total-row">
                      <td>Tổng cộng</td>
                      <td></td>
                      <td>{formatCurrency(selectedInv.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="si-detail-footer">
                <div>
                  <span className="text-gray">TỔNG SỐ TIỀN CẦN THANH TOÁN</span>
                  <h2 className="si-grand-total">
                    {formatCurrency(selectedInv.total)}
                  </h2>
                </div>
                {!isPaid && selectedInv.canPay && (
                  <button
                    className="si-btn-pay"
                    onClick={() => setShowPayment(true)}
                    disabled={paying}
                  >
                    <CreditCard size={18} />
                    {paying ? 'Đang xử lý...' : 'Thanh toán trực tuyến'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal chọn cổng thanh toán */}
      {showPayment && selectedInv && (
        <div className="si-modal-overlay">
          <div className="si-modal">
            <h3>Cổng thanh toán</h3>
            <p>
              Chọn phương thức thanh toán cho hóa đơn{' '}
              <strong>{formatCurrency(selectedInv.total)}</strong>
            </p>
            {error && (
              <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{error}</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="si-btn-cancel"
                onClick={() => setShowPayment(false)}
                disabled={paying}
              >
                Hủy
              </button>
              <button
                className="si-btn-pay"
                onClick={() => handlePay('PAYOS')}
                disabled={paying}
              >
                PayOS
              </button>
              <button
                className="si-btn-pay"
                onClick={() => handlePay('MOMO')}
                disabled={paying}
              >
                MoMo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInvoices;