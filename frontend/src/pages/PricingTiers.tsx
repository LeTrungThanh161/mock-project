import { useEffect, useState } from 'react';
import { Bell, Download, Filter, Edit, Trash2 } from 'lucide-react';
import './PricingTiers.css';
import api from '../services/api';

interface PricingTier {
  tierId: number;
  utilityType: string;
  tierOrder: number;
  fromUnit: number;
  toUnit: number | null;
  unitPrice: number;
}

export const PricingTiers = () => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<PricingTier>>({
    utilityType: 'Electric',
    tierOrder: 1,
    fromUnit: 0,
    toUnit: 50,
    unitPrice: 1800
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchTiers = () => {
    setLoading(true);
    api.get('/admin/pricing-tiers')
      .then(res => {
        if (res.data) setTiers(res.data);
      })
      .catch(err => {
        console.error("Failed to load tiers", err);
        setTiers([]); // Don't use mock data anymore
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleInputChange = (field: keyof PricingTier, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (editingId) {
      api.put(`/admin/pricing-tiers/${editingId}`, formData)
        .then(() => {
          fetchTiers();
          setEditingId(null);
        })
        .catch(err => alert('Cập nhật thất bại: ' + err));
    } else {
      api.post('/admin/pricing-tiers', formData)
        .then(() => fetchTiers())
        .catch(err => alert('Thêm mới thất bại: ' + err));
    }
    // reset form
    setFormData({
      utilityType: 'ELECTRICITY',
      tierOrder: (formData.tierOrder || 1) + 1, // Suggest next tier order
      fromUnit: 0,
      toUnit: 50,
      unitPrice: 1800
    });
  };

  const handleEdit = (tier: PricingTier) => {
    setFormData(tier);
    setEditingId(tier.tierId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bậc giá này?')) {
      api.delete(`/admin/pricing-tiers/${id}`)
        .then(() => {
          fetchTiers();
          // Adjust pagination if needed
          const remainingItems = tiers.length - 1;
          const totalPages = Math.ceil(remainingItems / itemsPerPage);
          if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
          }
        })
        .catch(err => alert('Xóa thất bại: ' + err));
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(tiers.length / itemsPerPage);
  const currentTiers = tiers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pt-page-container">
      <div className="pt-header">
        <h2>Dorm Manager / <span className="pt-breadcrumb">Cấu hình Giá Lũy tiến</span></h2>
      </div>

      <div className="pt-content">
        <div className="pt-form-card">
          <div className="pt-form-title">
            <span className="pt-icon-settings"></span> {editingId ? 'Sửa Bậc Giá' : 'Thêm Bậc Giá Mới'}
          </div>

          <div className="pt-form-group">
            <label>Loại Dịch vụ</label>
            <select
              value={formData.utilityType}
              onChange={(e) => handleInputChange('utilityType', e.target.value)}
            >
              <option value="Electric">Điện (Electricity)</option>
              <option value="Water">Nước (Water)</option>
            </select>
          </div>

          <div className="pt-form-group">
            <label>Bậc số</label>
            <input
              type="number"
              placeholder="Ví dụ: 1"
              value={formData.tierOrder || ''}
              onChange={(e) => handleInputChange('tierOrder', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="pt-form-row">
            <div className="pt-form-group">
              <label>Từ (kWh/m³)</label>
              <input
                type="number"
                value={formData.fromUnit ?? 0}
                onChange={(e) => handleInputChange('fromUnit', e.target.value === '' ? 0 : parseFloat(e.target.value))}
              />
            </div>
            <div className="pt-form-group">
              <label>Đến (kWh/m³)</label>
              <input
                type="number"
                placeholder="Để trống nếu không giới hạn"
                value={formData.toUnit === null ? '' : (formData.toUnit ?? 50)}
                onChange={(e) => handleInputChange('toUnit', e.target.value === '' ? null : parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="pt-form-group">
            <label>Đơn giá (VNĐ)</label>
            <div className="pt-input-suffix">
              <input
                type="number"
                value={formData.unitPrice ?? 1800}
                onChange={(e) => handleInputChange('unitPrice', e.target.value === '' ? 0 : parseFloat(e.target.value))}
              />
              <span>VNĐ</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="pt-btn-save" onClick={handleSave} disabled={loading}>
              {editingId ? 'Cập nhật cấu hình' : 'Lưu cấu hình'}
            </button>
            {editingId && (
              <button
                className="pt-btn-cancel"
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
                onClick={() => {
                  setEditingId(null);
                  setFormData({ utilityType: 'Electric', tierOrder: 1, fromUnit: 0, toUnit: 50, unitPrice: 1800 });
                }}
              >
                Hủy
              </button>
            )}
          </div>
          <p className="pt-note">* Thay đổi sẽ áp dụng cho kỳ thanh toán tiếp theo. Vui lòng kiểm tra kỹ phạm vi và đơn giá.</p>
        </div>

        <div className="pt-table-card">
          <div className="pt-table-header">
            <div>
              <h3 className='text-gray'>Danh sách Bậc giá Hiện hành</h3>
              <p>Danh sách chi tiết các khung giá đang được áp dụng.</p>
            </div>
            <div className="pt-table-actions">
              <button className="pt-icon-btn"><Filter size={18} /></button>
              <button className="pt-icon-btn"><Download size={18} /></button>
            </div>
          </div>

          <table className="pt-table">
            <thead>
              <tr>
                <th style={{ color: 'white' }}>LOẠI DỊCH VỤ</th>
                <th style={{ color: 'white' }}>TÊN BẬC</th>
                <th style={{ color: 'white' }}>PHẠM VI (KWH hoặc M³)</th>
                <th style={{ color: 'white' }}>ĐƠN GIÁ</th>
                <th style={{ color: 'white' }}>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</td></tr>
              ) : currentTiers.length > 0 ? currentTiers.map((tier) => (
                <tr key={tier.tierId}>
                  <td className="text-gray">
                    <div className="pt-type-cell">
                      <span className={`pt-type-icon ${tier.utilityType === 'Electric' ? 'elec' : 'water'}`}>
                        {tier.utilityType === 'Electric' ? '⚡' : '💧'}
                      </span>
                      {tier.utilityType === 'Electric' ? 'Điện sinh hoạt' : 'Nước sinh hoạt'}
                    </div>
                  </td>
                  <td className="text-gray">Bậc {tier.tierOrder}</td>
                  <td className="text-gray"><span className="pt-range-badge">{tier.fromUnit} - {tier.toUnit !== null ? tier.toUnit : 'Trở lên'}</span></td>
                  <td className="text-gray">
                    <strong>{tier.unitPrice.toLocaleString('vi-VN')}</strong><br />
                    <small>VNĐ</small>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4CAF50' }}
                        onClick={() => handleEdit(tier)}
                        title="Sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#F44336' }}
                        onClick={() => handleDelete(tier.tierId)}
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 0 && (
            <div className="pt-pagination">
              <span>Đang hiển thị {currentTiers.length} trên {tiers.length} bản ghi</span>
              <div className="pt-page-controls">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    className={pageNum === currentPage ? 'active' : ''}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
