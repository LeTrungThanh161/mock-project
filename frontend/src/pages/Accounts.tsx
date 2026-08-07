import React, { useState, useEffect, useCallback } from 'react';
import {
  getStaffList, createManager, updateStaff,
  getStudentList, resetStudentPassword, toggleStudentStatus, getBuildings
} from '../services/api';
import './Accounts.css';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface StaffItem {
  staffId: number;
  accountId: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  roleName: string;
  buildingId: number | null;
  buildingName: string;
  status: string;
}

interface StudentItem {
  studentId: number;
  accountId: number;
  studentCode: string;
  fullName: string;
  email: string;
  className: string;
  buildingName: string;
  roomNumber: string | null;
  status: string;
}

interface PageData {
  content: StudentItem[];
  totalPages: number;
  totalElements: number;
  number: number;
}

interface BuildingItem {
  buildingId: number;
  name: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Accounts() {
  const [activeTab, setActiveTab] = useState('manager');

  // ── Staff state ──
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState('');

  // ── Student state ──
  const [studentPage, setStudentPage] = useState<PageData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // ── Extra filters ──
  const [filterClassName, setFilterClassName] = useState('');
  const [filterBuildingName, setFilterBuildingName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHasRoom, setFilterHasRoom] = useState('');
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);

  const [studentLoading, setStudentLoading] = useState(false);

  // ── Modal state ──
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);

  // ── Create form state ──
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', buildingId: '' });
  const [createLoading, setCreateLoading] = useState(false);

  // ── Config form state ──
  const [configForm, setConfigForm] = useState({ fullName: '', phoneNumber: '', buildingId: '', status: 'Active' });
  const [configLoading, setConfigLoading] = useState(false);

  // ─── Fetch Staff ─────────────────────────────────────────────────────────────

  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    setStaffError('');
    try {
      const data = await getStaffList();
      setStaffList(data);
    } catch (err: any) {
      setStaffError('Không thể tải danh sách ban quản lý.');
      console.error(err);
    } finally {
      setStaffLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'manager') fetchStaff();
  }, [activeTab, fetchStaff]);

  // ─── Fetch Students ───────────────────────────────────────────────────────────

  const fetchStudents = useCallback(async () => {
    setStudentLoading(true);
    try {
      const data = await getStudentList(currentPage, pageSize, search, filterClassName, filterBuildingName, filterStatus, filterHasRoom);
      setStudentPage(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStudentLoading(false);
    }
  }, [currentPage, pageSize, search, filterClassName, filterBuildingName, filterStatus, filterHasRoom]);

  useEffect(() => {
    if (activeTab === 'student') {
      fetchStudents();
    }
  }, [activeTab, fetchStudents]);

  useEffect(() => {
    getBuildings().then(setBuildings).catch(console.error);
  }, []);

  // ─── Handlers: Staff ─────────────────────────────────────────────────────────

  const handleOpenConfig = (staff: StaffItem) => {
    setSelectedStaff(staff);
    setConfigForm({
      fullName: staff.fullName,
      phoneNumber: staff.phoneNumber || '',
      buildingId: staff.buildingId ? String(staff.buildingId) : '',
      status: staff.status,
    });
    setShowConfigModal(true);
  };

  const handleCreateManager = async () => {
    if (!createForm.fullName || !createForm.email || !createForm.password) {
      alert('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.');
      return;
    }
    setCreateLoading(true);
    try {
      await createManager({
        fullName: createForm.fullName,
        email: createForm.email,
        phoneNumber: createForm.phoneNumber,
        password: createForm.password,
        buildingId: createForm.buildingId ? Number(createForm.buildingId) : null,
      });
      alert('Tạo tài khoản Manager thành công!');
      setShowCreateModal(false);
      setCreateForm({ fullName: '', email: '', phoneNumber: '', password: '', buildingId: '' });
      fetchStaff();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!selectedStaff) return;
    setConfigLoading(true);
    try {
      await updateStaff(selectedStaff.staffId, {
        fullName: configForm.fullName,
        phoneNumber: configForm.phoneNumber,
        buildingId: configForm.buildingId ? Number(configForm.buildingId) : null,
        status: configForm.status,
      });
      alert('Lưu thay đổi thành công!');
      setShowConfigModal(false);
      fetchStaff();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setConfigLoading(false);
    }
  };

  // ─── Handlers: Students ──────────────────────────────────────────────────────

  const handleSearch = () => {
    setSearch(searchInput);
    setCurrentPage(0);
  };

  const handleResetPassword = async (accountId: number, name: string) => {
    if (!window.confirm(`Xác nhận reset mật khẩu của ${name} về "123456"?`)) return;
    try {
      await resetStudentPassword(accountId);
      alert(`Đã reset mật khẩu của ${name} thành công. Mật khẩu mới: 123456`);
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (accountId: number, name: string, currentStatus: string) => {
    const action = currentStatus === 'Active' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Xác nhận ${action} tài khoản của ${name}?`)) return;
    try {
      await toggleStudentStatus(accountId);
      fetchStudents();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  const totalPages = studentPage?.totalPages ?? 0;

  const renderPageButtons = () => {
    if (totalPages <= 1) return null;
    const pages: React.ReactNode[] = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1);

    if (start > 0) { pages.push(<button key="first" onClick={() => setCurrentPage(0)}>1</button>); if (start > 1) pages.push(<span key="e1">...</span>); }
    for (let i = start; i <= end; i++) {
      pages.push(<button key={i} className={i === currentPage ? 'active' : ''} onClick={() => setCurrentPage(i)}>{i + 1}</button>);
    }
    if (end < totalPages - 1) { if (end < totalPages - 2) pages.push(<span key="e2">...</span>); pages.push(<button key="last" onClick={() => setCurrentPage(totalPages - 1)}>{totalPages}</button>); }
    return pages;
  };

  return (
    <div className="accounts-container">
      <h2>QUẢN LÝ TÀI KHOẢN</h2>

      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'manager' ? 'active' : ''}`} onClick={() => setActiveTab('manager')}>
            Ban quản lý
          </button>
          <button className={`tab ${activeTab === 'student' ? 'active' : ''}`} onClick={() => setActiveTab('student')}>
            Sinh viên
          </button>
        </div>
      </div>

      {/* ── Tab Ban quản lý ─────────────────────────────────────────────────── */}
      {activeTab === 'manager' && (
        <div className="tab-content">
          <div className="filters">
            <input
              type="text"
              placeholder="Tìm theo email, tên..."
              className="search-input"
            />
            <button className="btn-primary-blue ml-auto" onClick={() => { setCreateForm({ fullName: '', email: '', phoneNumber: '', password: '', buildingId: '' }); setShowCreateModal(true); }}>
              + TẠO TÀI KHOẢN MANAGER
            </button>
          </div>

          {staffError && <p style={{ color: 'red', marginBottom: 12 }}>{staffError}</p>}

          <table className="light-table">
            <thead>
              <tr>
                <th>ID</th><th>Email</th><th>Họ và tên</th><th>Vai trò</th><th>Tòa phụ trách</th><th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {staffLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>Đang tải...</td></tr>
              ) : staffList.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>Không có dữ liệu</td></tr>
              ) : staffList.map(staff => (
                <tr key={staff.staffId} onClick={() => handleOpenConfig(staff)} style={{ cursor: 'pointer' }}>
                  <td>{String(staff.staffId).padStart(3, '0')}</td>
                  <td>{staff.email}</td>
                  <td>{staff.fullName}</td>
                  <td>{staff.roleName}</td>
                  <td>{staff.buildingName}</td>
                  <td className={staff.status === 'Active' ? 'text-success' : 'text-danger'}>
                    [{staff.status === 'Active' ? 'Active' : 'Khóa'}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab Sinh viên ───────────────────────────────────────────────────── */}
      {activeTab === 'student' && (
        <div className="tab-content">
          <div className="filters" style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px' }}>
            <div className="search-wrapper" style={{ flex: '1 1 auto', minWidth: '200px' }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm theo MSSV, Tên, Email..."
                className="search-input with-icon"
                style={{ width: '100%', minWidth: 'unset' }}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <input
              type="text"
              placeholder="Lớp..."
              className="search-input"
              style={{ width: '200px', minWidth: '100px', flexShrink: 0 }}
              value={filterClassName}
              onChange={e => { setFilterClassName(e.target.value); setCurrentPage(0); }}
            />

            <select
              className="search-input"
              style={{ width: '200px', minWidth: '140px', cursor: 'pointer', flexShrink: 0 }}
              value={filterBuildingName}
              onChange={e => { setFilterBuildingName(e.target.value); setCurrentPage(0); }}
            >
              <option value="">Tất cả các tòa</option>
              {buildings.map(b => (
                <option key={b.buildingId} value={b.name}>{b.name}</option>
              ))}
            </select>

            <select
              className="search-input"
              style={{ width: '200px', minWidth: '140px', cursor: 'pointer', flexShrink: 0 }}
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setCurrentPage(0); }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              className="search-input"
              style={{ width: '220px', minWidth: '140px', cursor: 'pointer', flexShrink: 0 }}
              value={filterHasRoom}
              onChange={e => { setFilterHasRoom(e.target.value); setCurrentPage(0); }}
            >
              <option value="">Tất cả sinh viên</option>
              <option value="true">Đã xếp phòng</option>
              <option value="false">Chưa xếp phòng</option>
            </select>

            <button className="btn-primary-blue" style={{ flexShrink: 0 }} onClick={handleSearch}>Tìm kiếm</button>
          </div>

          <table className="light-table">
            <thead>
              <tr>
                <th>MSSV</th><th>Họ và tên</th><th>Email sinh viên</th><th>Lớp</th><th>Tòa - Phòng</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {studentLoading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>Đang tải...</td></tr>
              ) : !studentPage || studentPage.content.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>Không có dữ liệu</td></tr>
              ) : studentPage.content.map(sv => (
                <tr key={sv.studentId}>
                  <td>{sv.studentCode}</td>
                  <td>{sv.fullName}</td>
                  <td title={sv.email}>{sv.email && sv.email.length > 25 ? sv.email.slice(0, 25) + '...' : sv.email}</td>
                  <td>{sv.className || '—'}</td>
                  <td>{sv.roomNumber ? `${sv.buildingName} - ${sv.roomNumber}` : sv.buildingName}</td>
                  <td className={sv.status === 'Active' ? 'text-success' : 'text-danger'}>
                    [{sv.status === 'Active' ? 'Active' : 'Locked'}]
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-small" onClick={() => handleResetPassword(sv.accountId, sv.fullName)}>
                        🔑 Reset Pass
                      </button>
                      <button className="btn-small" onClick={() => handleToggleStatus(sv.accountId, sv.fullName, sv.status)}>
                        {sv.status === 'Active' ? '🔒 Khóa TK' : '🔓 Mở khóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {studentPage && (
            <div className="pagination-wrapper">
              <div className="page-info">
                Trang {currentPage + 1} / {totalPages} &nbsp;|&nbsp; Tổng {studentPage.totalElements} sinh viên
              </div>
              <div className="pagination">
                <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>&lt;</button>
                {renderPageButtons()}
                <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>&gt;</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modal: Tạo tài khoản Manager ─────────────────────────────────── */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>TẠO TÀI KHOẢN QUẢN LÝ TÒA (MANAGER)</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {[
                { label: 'Họ và tên :', key: 'fullName', type: 'text' },
                { label: 'Email:', key: 'email', type: 'email' },
                { label: 'Số điện thoại:', key: 'phoneNumber', type: 'text' },
                { label: 'Mật khẩu khởi tạo:', key: 'password', type: 'text' },
              ].map(({ label, key, type }) => (
                <div className="form-group-light" key={key}>
                  <label>{label}</label>
                  <input
                    type={type}
                    value={(createForm as any)[key]}
                    onChange={e => setCreateForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="form-group-light">
                <label>Tòa nhà phân công:</label>
                <select
                  value={createForm.buildingId}
                  onChange={e => setCreateForm(f => ({ ...f, buildingId: e.target.value }))}
                >
                  <option value="">-- Để trống nếu là Admin --</option>
                  {buildings.map(b => (
                    <option key={b.buildingId} value={b.buildingId}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-dark" onClick={() => setShowCreateModal(false)}>HỦY</button>
              <button className="btn-primary-blue" onClick={handleCreateManager} disabled={createLoading}>
                {createLoading ? 'Đang tạo...' : 'TẠO TÀI KHOẢN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Cấu hình Staff ────────────────────────────────────────── */}
      {showConfigModal && selectedStaff && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>CẤU HÌNH TÀI KHOẢN BAN QUẢN LÝ</h3>
              <button className="close-btn" onClick={() => setShowConfigModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group-light">
                <label>Họ và tên :</label>
                <input type="text" value={configForm.fullName} onChange={e => setConfigForm(f => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="form-group-light">
                <label>Email :</label>
                <input type="email" value={selectedStaff.email} disabled style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
              </div>
              <div className="form-group-light">
                <label>Số điện thoại</label>
                <input type="text" value={configForm.phoneNumber} onChange={e => setConfigForm(f => ({ ...f, phoneNumber: e.target.value }))} />
              </div>
              <div className="form-group-light">
                <label>Tòa nhà phân công:</label>
                <select
                  value={configForm.buildingId}
                  onChange={e => setConfigForm(f => ({ ...f, buildingId: e.target.value }))}
                >
                  <option value="">-- Để trống nếu là Admin --</option>
                  {buildings.map(b => (
                    <option key={b.buildingId} value={b.buildingId}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group-light flex-radio">
                <label>Trạng thái tài khoản:</label>
                <div className="radio-group">
                  <label>
                    <input type="radio" name="cfg-status" checked={configForm.status === 'Active'} onChange={() => setConfigForm(f => ({ ...f, status: 'Active' }))} />
                    {' '}Hoạt động (Active)
                  </label>
                  <label>
                    <input type="radio" name="cfg-status" checked={configForm.status === 'Locked'} onChange={() => setConfigForm(f => ({ ...f, status: 'Locked' }))} />
                    {' '}Tạm khóa (Locked)
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-dark" onClick={() => setShowConfigModal(false)}>HỦY BỎ</button>
              <button className="btn-primary-blue" onClick={handleUpdateStaff} disabled={configLoading}>
                {configLoading ? 'Đang lưu...' : '💾 LƯU THAY ĐỔI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
