import { useEffect, useState } from 'react';
import { Plus, Users, CheckCircle, Clock, TrendingUp, X, Edit } from 'lucide-react';
import './Technicians.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Technicians = () => {
  const { user } = useAuth();
  const [techs, setTechs] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('Active'); // Active or Inactive
  const [buildingId, setBuildingId] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);

  // Search state
  const [search, setSearch] = useState('');

  const fetchTechs = () => {
    api.get('/technicians')
      .then(res => {
        const sorted = res.data.sort((a: any, b: any) => b.technicianId - a.technicianId);
        setTechs(sorted);
      })
      .catch(err => console.error("Failed to fetch technicians", err));
  };

  useEffect(() => {
    fetchTechs();
    api.get('/buildings').then(res => {
      setBuildings(res.data);
      if (res.data.length > 0 && buildingId === 1) {
        setBuildingId(res.data[0].buildingId);
      }
    }).catch(err => console.error("Failed to fetch buildings", err));
  }, []);

  const resetForm = () => {
    setFullName('');
    setPhoneNumber('');
    setStatus('Active');
    setBuildingId(1);
    setEditId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) {
      alert("Vui lòng điền đủ thông tin");
      return;
    }
    setLoading(true);
    const payload = {
      fullName,
      phoneNumber,
      status, // 'Active' or 'Inactive'
      building: { buildingId }
    };

    api.post('/technicians', payload)
      .then(() => {
        alert("Thêm kỹ thuật viên thành công!");
        setShowAddModal(false);
        resetForm();
        fetchTechs();
      })
      .catch(err => {
        console.error("Lỗi khi thêm:", err);
        alert("Có lỗi xảy ra khi thêm kỹ thuật viên.");
      })
      .finally(() => setLoading(false));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !editId) return;
    setLoading(true);

    const payload = {
      technicianId: editId,
      fullName,
      phoneNumber,
      status,
      building: { buildingId }
    };

    api.post('/technicians', payload)
      .then(() => {
        alert("Cập nhật kỹ thuật viên thành công!");
        setShowEditModal(false);
        resetForm();
        fetchTechs();
      })
      .catch(err => {
        console.error("Lỗi khi cập nhật:", err);
        alert("Có lỗi xảy ra khi cập nhật kỹ thuật viên.");
      })
      .finally(() => setLoading(false));
  };

  const openEditModal = (t: any) => {
    setEditId(t.technicianId);
    setFullName(t.fullName);
    setPhoneNumber(t.phoneNumber || '');
    setStatus(t.status);
    setBuildingId(t.building?.buildingId || 1);
    setShowEditModal(true);
  };

  const filteredTechs = techs.filter(t => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return t.fullName.toLowerCase().includes(lowerSearch) || (t.phoneNumber && t.phoneNumber.includes(search));
  });

  const totalPages = Math.ceil(filteredTechs.length / itemsPerPage);
  const currentTechs = filteredTechs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getStatusText = (st: string) => {
    if (st === 'Active') return 'Sẵn Sàng';
    return 'Bận';
  };

  return (
    <div className="tech-page-container">
      <div className="tech-header">
        <div>
          <h2>Quản lý Kỹ thuật viên</h2>
          <p>Quản lý nhân sự và lịch trình hoạt động của đội ngũ kỹ thuật.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="tech-btn-add" onClick={() => { resetForm(); setShowAddModal(true); }}><Plus size={16} /> Thêm kỹ thuật viên</button>
        )}
      </div>

      <div className="tech-stats">
        <div className="tech-stat-card">
          <div className="tech-stat-top">
            <p>TỔNG SỐ NHÂN VIÊN</p>
            <Users size={20} className="text-blue" />
          </div>
          <h4>{techs.length}</h4>
          <span className="success">Đội ngũ hiện tại</span>
        </div>
        <div className="tech-stat-card">
          <div className="tech-stat-top">
            <p>ĐANG SẴN SÀNG</p>
            <CheckCircle size={20} className="text-green" />
          </div>
          <h4>{techs.filter(t => t.status === 'Active').length}</h4>
          <span>{techs.length ? Math.round((techs.filter(t => t.status === 'Active').length / techs.length) * 100) : 0}% công suất</span>
        </div>
        <div className="tech-stat-card">
          <div className="tech-stat-top">
            <p>ĐANG BẬN</p>
            <Clock size={20} className="text-red" />
          </div>
          <h4>{techs.filter(t => t.status !== 'Active').length}</h4>
          <span>Đang làm nhiệm vụ</span>
        </div>
        <div className="tech-stat-card">
          <div className="tech-stat-top">
            <p>HIỆU SUẤT</p>
            <TrendingUp size={20} className="text-blue" />
          </div>
          <h4>100%</h4>
          <span className="info">Hoạt động ổn định</span>
        </div>
      </div>

      <div className="tech-table-container">
        <div className="tech-table-actions">
          <div className="tech-search">
            <span>🔍</span>
            <input type="text" placeholder="Tìm kiếm tên, số điện thoại..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {/* <div className="tech-actions-right">
            <button className="tech-btn-outline"><Filter size={16} /> Lọc Chuyên môn</button>
            <button className="tech-btn-outline"><Download size={16} /> Xuất báo cáo</button>
          </div> */}
        </div>

        <table className="tech-table">
          <thead>
            <tr>
              <th style={{ color: 'white' }}>HỌ VÀ TÊN</th>
              <th style={{ color: 'white' }}>SỐ ĐIỆN THOẠI</th>
              <th style={{ color: 'white' }}>TÒA NHÀ</th>
              <th style={{ color: 'white' }}>TRẠNG THÁI</th>
              <th style={{ color: 'white', textAlign: 'center' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {currentTechs.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'gray' }}>Không có nhân viên nào.</td></tr>
            )}
            {currentTechs.map((t) => (
              <tr key={t.technicianId}>
                <td className="tech-name-cell" style={{ color: 'gray' }}>
                  <div className="tech-avatar">{t.fullName.substring(0, 2).toUpperCase()}</div>
                  <div>
                    <strong>{t.fullName}</strong>
                    <div className="tech-id">Mã NV: {t.technicianId}</div>
                  </div>
                </td>
                <td style={{ color: 'gray' }}>{t.phoneNumber}</td>
                <td style={{ color: 'gray' }}><span className={`tech-spec-badge blue`}> {t.building?.name || `ID:${t.building?.buildingId}` || 'N/A'}</span></td>
                <td style={{ color: 'gray' }}>
                  <span className={`tech-status-dot ${t.status === 'Active' ? 'green' : 'red'}`}></span>
                  {getStatusText(t.status)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {user?.role === 'ADMIN' && (
                    <button onClick={() => openEditModal(t)} style={{ background: 'none', border: 'none', color: '#2196F3', cursor: 'pointer' }} title="Sửa thông tin">
                      <Edit size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="tech-pagination">
          <span>Hiển thị {currentTechs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredTechs.length)} trên {filteredTechs.length} nhân viên</span>
          {totalPages > 0 && (
            <div className="tech-page-controls">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>&lt;</button>
              {getPageNumbers().map(pageNum => (
                <button key={pageNum} className={pageNum === currentPage ? 'active' : ''} onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>&gt;</button>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowAddModal(false)}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Thêm Kỹ Thuật Viên</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>Họ và tên</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>Số điện thoại</label>
                <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>Tòa nhà phụ trách</label>
                <select value={buildingId} onChange={e => setBuildingId(Number(e.target.value))} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  {buildings.map(b => (
                    <option key={b.buildingId} value={b.buildingId}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>Trạng thái</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <option value="Active">Sẵn Sàng (Active)</option>
                  <option value="Inactive">Bận (Busy)</option>
                </select>
              </div>
              <button type="submit" disabled={loading} style={{ background: '#2196F3', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', fontWeight: 'bold' }}>
                {loading ? 'Đang xử lý...' : 'Xác nhận Thêm'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowEditModal(false)}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Cập nhật Kỹ Thuật Viên</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>Họ và tên</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>Số điện thoại</label>
                <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>Tòa nhà phụ trách</label>
                <select value={buildingId} onChange={e => setBuildingId(Number(e.target.value))} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  {buildings.map(b => (
                    <option key={b.buildingId} value={b.buildingId}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>Trạng thái</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff' }}
                >
                  <option value="Active">Sẵn Sàng (Active)</option>
                  <option value="Inactive">Bận (Busy)</option>
                </select>
              </div>
              <button type="submit" disabled={loading} style={{ background: '#2196F3', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', fontWeight: 'bold' }}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
