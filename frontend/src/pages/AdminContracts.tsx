import { useEffect, useState, useMemo } from 'react';
import { getAllContracts } from '../services/api';
import {
  Search, Filter, RotateCcw, FileText, CheckCircle2,
  Clock, AlertTriangle, Building, Home
} from 'lucide-react';
import './AdminContracts.css';

interface ContractItem {
  contractId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  roomId: number;
  roomNumber: string;
  buildingId: number;
  buildingName: string;
  roomTypeName: string | null;
  roomPrice: number;
  startDate: string;
  endDate: string;
  deposit: number;
  status: string; // Active, Terminated, Expired, Inactive
  createdAt: string | null;
}

export function AdminContracts() {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [searchRoom, setSearchRoom] = useState<string>('');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active'); // Mặc định hiện Active

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllContracts();
      setContracts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Lỗi tải hợp đồng:', err);
      setError(err?.message || 'Không thể tải danh sách hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  // Danh sách các loại phòng duy nhất
  const uniqueRoomTypes = useMemo(() => {
    const types = new Set<string>();
    contracts.forEach((c) => {
      if (c.roomTypeName) types.add(c.roomTypeName);
    });
    return Array.from(types);
  }, [contracts]);

  // Lọc hợp đồng theo điều kiện
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      // 1. Tìm theo MSSV hoặc Tên
      const studentMatch =
        !searchStudent ||
        (c.studentCode && c.studentCode.toLowerCase().includes(searchStudent.toLowerCase().trim())) ||
        (c.studentName && c.studentName.toLowerCase().includes(searchStudent.toLowerCase().trim()));

      // 2. Tìm theo Phòng hoặc Tòa
      const roomMatch =
        !searchRoom ||
        (c.roomNumber && c.roomNumber.toLowerCase().includes(searchRoom.toLowerCase().trim())) ||
        (c.buildingName && c.buildingName.toLowerCase().includes(searchRoom.toLowerCase().trim()));

      // 3. Loại phòng
      const roomTypeMatch =
        selectedRoomType === 'ALL' || c.roomTypeName === selectedRoomType;

      // 4. Trạng thái
      const statusMatch =
        selectedStatus === 'ALL' ||
        c.status?.toUpperCase() === selectedStatus.toUpperCase();

      return studentMatch && roomMatch && roomTypeMatch && statusMatch;
    });
  }, [contracts, searchStudent, searchRoom, selectedRoomType, selectedStatus]);

  // Reset về trang 1 khi lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchStudent, searchRoom, selectedRoomType, selectedStatus]);

  // Thống kê tổng quan
  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((c) => c.status?.toUpperCase() === 'ACTIVE').length;
    const expired = contracts.filter((c) => c.status?.toUpperCase() === 'EXPIRED').length;
    const terminated = contracts.filter((c) => c.status?.toUpperCase() === 'TERMINATED').length;
    return { total, active, expired, terminated };
  }, [contracts]);

  // Phân trang
  const totalPages = Math.ceil(filteredContracts.length / pageSize) || 1;
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredContracts.slice(start, start + pageSize);
  }, [filteredContracts, currentPage]);

  const handleResetFilters = () => {
    setSearchStudent('');
    setSearchRoom('');
    setSelectedRoomType('ALL');
    setSelectedStatus('Active');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (statusStr: string) => {
    const s = (statusStr || '').toUpperCase();
    if (s === 'ACTIVE') {
      return (
        <span className="status-pill active">
          <span className="status-dot"></span> Active
        </span>
      );
    }
    if (s === 'EXPIRED') {
      return (
        <span className="status-pill expired">
          <span className="status-dot"></span> Expired
        </span>
      );
    }
    if (s === 'TERMINATED') {
      return (
        <span className="status-pill terminated">
          <span className="status-dot"></span> Terminated
        </span>
      );
    }
    return (
      <span className="status-pill inactive">
        <span className="status-dot"></span> {statusStr || 'Inactive'}
      </span>
    );
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="admin-contracts-container">
      {/* Header */}
      <div className="admin-contracts-header">
        <h2>Danh sách Hợp đồng Sinh viên</h2>
      </div>

      {/* Stats Cards */}
      <div className="contract-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <p>Tổng hợp đồng</p>
            <h3>{stats.total}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <p>Đang hiệu lực (Active)</p>
            <h3>{stats.active}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper amber">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <p>Đã hết hạn (Expired)</p>
            <h3>{stats.expired}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <p>Đã chấm dứt (Terminated)</p>
            <h3>{stats.terminated}</h3>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="filter-card">
        <div className="filter-title">
          <Filter size={18} />
          <span>Bộ lọc tìm kiếm</span>
        </div>
        <div className="filter-controls-grid">
          {/* MSSV / Họ tên */}
          <div className="filter-group">
            <label>Tìm theo MSSV, Họ tên</label>
            <div className="filter-input-wrapper">
              <Search size={16} className="filter-input-icon" />
              <input
                type="text"
                className="filter-input"
                placeholder="Nhập MSSV / tên sinh viên"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </div>
          </div>


          {/* Phòng ở / Tòa */}
          
            <div className="filter-group">
              <label>Tìm theo Phòng / Tòa</label>
              <div className="filter-input-wrapper">
                <Home size={16} className="filter-input-icon" />
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Ví dụ: 101 | Tòa A"
                  value={searchRoom}
                  onChange={(e) => setSearchRoom(e.target.value)}
                />
              </div>
            </div>
          



          {/* Loại phòng */}
          <div className="filter-group">
            <label>Loại phòng</label>
            <select
              className="filter-select"
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
            >
              <option value="ALL">-- Tất cả loại phòng --</option>
              {uniqueRoomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Trạng thái */}
          <div className="filter-group">
            <label>Trạng thái</label>
            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">-- Tất cả trạng thái --</option>
              <option value="Active">Active (Đang hiệu lực)</option>
              <option value="Expired">Expired (Hết hạn)</option>
              <option value="Terminated">Terminated (Đã chấm dứt)</option>
              <option value="Inactive">Inactive (Chưa kích hoạt)</option>
            </select>
          </div>

          {/* Reset Filter */}
          <div className="filter-group">
            <button className="btn-reset-filter" onClick={handleResetFilters} title="Đặt lại bộ lọc">
              <RotateCcw size={16} /> Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        {error && (
          <div style={{ padding: '16px 20px', backgroundColor: '#fef2f2', color: '#dc2626', borderBottom: '1px solid #fee2e2' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <p>Đang tải dữ liệu hợp đồng...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>MSSV</th>
                  <th>Họ tên</th>
                  <th>Phòng ở</th>
                  <th>Loại phòng</th>
                  <th>Ngày kí</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày hết hạn</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContracts.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">
                        <FileText size={40} />
                        <p>Không tìm thấy hợp đồng nào phù hợp với bộ lọc.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedContracts.map((c) => (
                    <tr key={c.contractId}>
                      <td className="student-code">{c.studentCode || 'N/A'}</td>
                      <td className="student-name">{c.studentName || 'N/A'}</td>
                      <td>
                        <span className="room-badge">
                          <Building size={13} /> P.{c.roomNumber} - {c.buildingName}
                        </span>
                      </td>
                      <td className="room-type">{c.roomTypeName || 'N/A'}</td>
                      <td className="date-text">{formatDate(c.createdAt || c.startDate)}</td>
                      <td className="date-text">{formatDate(c.startDate)}</td>
                      <td className="date-text">{formatDate(c.endDate)}</td>
                      <td>{renderStatusBadge(c.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredContracts.length > 0 && (
          <div className="table-pagination">
            <div className="pagination-info">
              Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filteredContracts.length)} -{' '}
              {Math.min(currentPage * pageSize, filteredContracts.length)} trên tổng số {filteredContracts.length} hợp đồng
            </div>
            {totalPages > 0 && (
              <div className="global-pagination">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  &lt;
                </button>
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    className={pageNum === currentPage ? 'active' : ''}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  &gt;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
