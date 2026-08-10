import { useEffect, useState } from 'react';
import { Download, Eye, Printer, Zap } from 'lucide-react';
import './Invoices.css';
import api, { exportInvoicesForBuilding } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Invoices = () => {
  
  const { user } = useAuth();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'UNPAID' | 'PAID'>('all');

  // Xuất hóa đơn
  const [exportMonth, setExportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [exporting, setExporting] = useState(false);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | ''>('');

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const isManager = user?.role?.toUpperCase() === 'MANAGER';

  // Load danh sách tòa (Admin chọn tòa, Manager dùng tòa của mình)
  useEffect(() => {
    if (isAdmin) {
      api.get('/buildings')
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : [];
          setBuildings(list);
          if (list.length > 0) {
            setSelectedBuildingId(list[0].buildingId);
          }
        })
        .catch(err => console.error('Failed to load buildings', err));
    } else if (isManager) {
      // Manager: ưu tiên buildingId từ user (JWT), fallback lấy tòa đầu tiên
      const managerBuildingId = (user as any)?.buildingId;
      if (managerBuildingId) {
        setSelectedBuildingId(managerBuildingId);
      } else {
        api.get('/buildings')
          .then(res => {
            const list = Array.isArray(res.data) ? res.data : [];
            if (list.length > 0) {
              setSelectedBuildingId(list[0].buildingId);
            }
          })
          .catch(err => console.error(err));
      }
    }
  }, [isAdmin, isManager, user]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/invoices', {
        params: statusFilter === 'all' ? {} : { status: statusFilter },
      });
      const items = Array.isArray(response?.data) ? response.data : (response?.data?.items || []);
      const mapped = items.map((item: any) => {
        const dueDate = item.dueDate ? new Date(item.dueDate) : null;
        const today = new Date();
        const daysLate = dueDate
          ? Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;
        const total = Number(
          item.totalAmount ??
            (item.roomFee ?? 0) +
              (item.electricityFee ?? 0) +
              (item.waterFee ?? 0) +
              (item.internetFee ?? 0)
        );
        let status =
          item.statusLabel ||
          (item.paymentStatus === 'PAID' || item.paymentStatus === 'Paid'
            ? 'Đã thanh toán'
            : 'Chưa thanh toán');
        const penalty = Number(item.penaltyAmount ?? 0);
        if (
          item.paymentStatus !== 'PAID' &&
          item.paymentStatus !== 'Paid' &&
          dueDate &&
          daysLate > 0
        ) {
          status = daysLate <= 5 ? 'Quá hạn' : 'Đã bị chấm dứt';
        }
        return {
          id: `INV-${item.invoiceId}`,
          invoiceId: item.invoiceId,
          room: item.roomNumber
            ? `P.${item.roomNumber}`
            : item.room?.roomNumber
              ? `P.${item.room.roomNumber}`
              : 'N/A',
          period: item.billingMonth
            ? `Tháng ${new Date(item.billingMonth).toLocaleDateString('vi-VN', {
                month: '2-digit',
                year: 'numeric',
              })}`
            : '—',
          total,
          due: dueDate ? dueDate.toLocaleDateString('vi-VN') : '—',
          status,
          penalty,
          paymentStatus: item.paymentStatus,
          invoiceTypeLabel: item.invoiceTypeLabel || 'Hóa đơn tiền phòng',
          invoiceType: item.invoiceType,
        };
      });
      setInvoices(mapped);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const handleExport = async () => {
    if (!selectedBuildingId) {
      alert('Vui lòng chọn tòa nhà');
      return;
    }
    if (!exportMonth) {
      alert('Vui lòng chọn tháng');
      return;
    }

    try {
      setExporting(true);
      const billingMonth = `${exportMonth}-01`;
      const res = await exportInvoicesForBuilding(Number(selectedBuildingId), billingMonth);
      alert(res?.message || `Đã xuất ${res?.count ?? 0} hóa đơn`);
      await loadInvoices();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Không thể xuất hóa đơn';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setExporting(false);
    }
  };

  const unpaidCount = invoices.filter(
    (i) => i.paymentStatus !== 'PAID' && i.paymentStatus !== 'Paid'
  ).length;
  const paidCount = invoices.filter(
    (i) => i.paymentStatus === 'PAID' || i.paymentStatus === 'Paid'
  ).length;
  const overdueCount = invoices.filter((i) => i.status === 'Quá hạn').length;

  return (
    <div className="inv-page-container">
      <div className="inv-header">
        <h2>Quản lý Hóa đơn</h2>
      </div>

      {error && (
        <div className="inv-banner" style={{ borderColor: '#f59e0b', marginBottom: 16 }}>
          <p>{error}</p>
        </div>
      )}

      {/* Banner xuất hóa đơn */}
      <div className="inv-banner">
        <div>
          <h3>Xuất hóa đơn tháng</h3>
          <p>
            Chỉ xuất sau khi đã nhập chỉ số điện/nước. Mỗi sinh viên một hóa đơn:
            tiền phòng full + điện/nước chia theo số người trong phòng. Không có phí Internet.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginTop: 16,
              flexWrap: 'wrap',
            }}
          >
            {isAdmin && (
              <select
                value={selectedBuildingId}
                onChange={(e) =>
                  setSelectedBuildingId(e.target.value ? Number(e.target.value) : '')
                }
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  minWidth: 160,
                }}
              >
                <option value="">-- Chọn tòa --</option>
                {buildings.map((b) => (
                  <option key={b.buildingId} value={b.buildingId}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}

            <input
              type="month"
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
              }}
            />
            {!isAdmin && (
            <button
              className="inv-btn-auto"
              onClick={handleExport}
              disabled={exporting || !selectedBuildingId}
            >
              <Zap size={16} />
              {exporting ? 'Đang xuất...' : 'Xuất hóa đơn tháng này'}
            </button>
            )}
          </div>
        </div>
        <div className="inv-banner-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="inv-stats">
        <div className="inv-stat-card">
          <p>TỔNG HÓA ĐƠN</p>
          <h4>{invoices.length}</h4>
          <span className="success">Danh sách hiện tại</span>
        </div>
        <div className="inv-stat-card">
          <p>CHƯA THANH TOÁN</p>
          <h4 className="danger">{unpaidCount}</h4>
          <span className="danger">⚠ Cần xử lý</span>
        </div>
        <div className="inv-stat-card">
          <p>QUÁ HẠN</p>
          <h4 className="warning">{overdueCount}</h4>
          <span className="warning">Cần nhắc nợ</span>
        </div>
        <div className="inv-stat-card">
          <p>ĐÃ THANH TOÁN</p>
          <h4 className="info">{paidCount}</h4>
          <span className="success">✓ Hoàn tất</span>
        </div>
      </div>

      {/* Table */}
      <div className="inv-table-container">
        <div className="inv-table-actions">
          <div className="inv-search">
            <span>🔍</span>
            <input type="text" placeholder="Tìm kiếm phòng, mã..." />
          </div>
          <div className="inv-actions-right">
            <div className="inv-toggle-group" style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`inv-btn-outline ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                Tất cả
              </button>
              <button
                className={`inv-btn-outline ${statusFilter === 'UNPAID' ? 'active' : ''}`}
                onClick={() => setStatusFilter('UNPAID')}
              >
                Chưa thanh toán
              </button>
              <button
                className={`inv-btn-outline ${statusFilter === 'PAID' ? 'active' : ''}`}
                onClick={() => setStatusFilter('PAID')}
              >
                Đã thanh toán
              </button>
            </div>
            {/* <button className="inv-btn-outline">
              <Download size={16} /> Xuất Excel
            </button> */}
          </div>
        </div>

        {loading && <p style={{ padding: 16 }}>Đang tải dữ liệu hóa đơn...</p>}
        {!loading && invoices.length === 0 && (
          <p style={{ padding: 16, color: '#64748b' }}>Chưa có hóa đơn nào để hiển thị.</p>
        )}

        {!loading && invoices.length > 0 && (
          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ color: 'white' }}>MÃ HÓA ĐƠN</th>
                <th style={{ color: 'white' }}>PHÒNG</th>
                <th style={{ color: 'white' }}>KỲ THANH TOÁN</th>
                <th style={{ color: 'white' }}>LOẠI HÓA ĐƠN</th>
                <th style={{ color: 'white' }}>TỔNG TIỀN (VNĐ)</th>
                <th style={{ color: 'white' }}>HẠN CHÓT</th>
                <th style={{ color: 'white' }}>TRẠNG THÁI</th>
                <th style={{ color: 'white' }}>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="text-gray">{inv.id}</td>
                  <td className="text-gray">{inv.room}</td>
                  <td className="text-gray">{inv.period}</td>
                  <td className="text-gray">{inv.invoiceTypeLabel}</td>
                  <td className="text-gray">
                    <strong>{inv.total.toLocaleString('vi-VN')}</strong>
                  </td>
                  <td className={inv.status === 'Quá hạn' ? 'danger-text' : 'text-gray'}>
                    {inv.due}
                  </td>
                  <td>
                    <span
                      className={`inv-badge ${
                        inv.status === 'Đã thanh toán'
                          ? 'success'
                          : inv.status === 'Chưa thanh toán'
                            ? 'warning'
                            : 'danger'
                      }`}
                    >
                      {inv.status}
                    </span>
                    {inv.penalty > 0 && (
                      <div className="danger-text">
                        Phạt: {inv.penalty.toLocaleString('vi-VN')} đ
                      </div>
                    )}
                  </td>
                  <td className="inv-action-cells">
                    {inv.status !== 'Đã thanh toán' && (
                      <button className="inv-btn-primary">
                        {inv.status === 'Quá hạn' ? 'Nhắc nợ' : 'Thu tiền'}
                      </button>
                    )}
                    <button className="inv-btn-icon">
                      <Eye size={16} />
                    </button>
                    {inv.status === 'Đã thanh toán' && (
                      <button className="inv-btn-icon">
                        <Printer size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="inv-pagination">
          <span>
            Đang hiển thị {invoices.length} hóa đơn
          </span>
          <div className="inv-page-controls">
            <button>&lt;</button>
            <button className="active">1</button>
            <button>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};