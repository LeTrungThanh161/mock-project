import React, { useState } from 'react';
import './Accounts.css';

export function Accounts() {
  const [activeTab, setActiveTab] = useState('manager');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  return (
    <div className="accounts-container">
      <h2>QUẢN LÝ TÀI KHOẢN</h2>
      
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'manager' ? 'active' : ''}`}
            onClick={() => setActiveTab('manager')}
          >
            Ban quản lý
          </button>
          <button 
            className={`tab ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveTab('student')}
          >
            Sinh viên
          </button>
        </div>
      </div>

      {activeTab === 'manager' && (
        <div className="tab-content">
          <div className="filters">
            <div className="filter-group">
              <label>Vai trò:</label>
              <select><option>Tất cả</option></select>
            </div>
            <div className="filter-group">
              <label>Trạng thái:</label>
              <select><option>Tất cả</option></select>
            </div>
            <input type="text" placeholder="Tìm theo email, tên..." className="search-input" />
            <button className="btn-primary-blue ml-auto" onClick={() => setShowCreateModal(true)}>
              + TẠO TÀI KHOẢN MANAGER
            </button>
          </div>

          <table className="light-table">
            <thead>
              <tr>
                <th>ID</th><th>Email</th><th>Họ và tên</th><th>Vai trò</th><th>Tòa phụ trách</th><th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr onClick={() => setShowConfigModal(true)} style={{cursor: 'pointer'}}>
                <td>001</td><td>admin@dorm.edu.vn</td><td>Phùng Văn C</td><td>Admin</td><td>Tất cả</td><td className="text-success">[Active]</td>
              </tr>
              <tr onClick={() => setShowConfigModal(true)} style={{cursor: 'pointer'}}>
                <td>002</td><td>mgr.a1@dorm.edu.vn</td><td>Nguyễn Văn B</td><td>Manager</td><td>Tòa A1</td><td className="text-success">[Active]</td>
              </tr>
              <tr onClick={() => setShowConfigModal(true)} style={{cursor: 'pointer'}}>
                <td>003</td><td>mgr.a2@dorm.edu.vn</td><td>Trần Thị D</td><td>Manager</td><td>Tòa A2</td><td className="text-success">[Active]</td>
              </tr>
              <tr onClick={() => setShowConfigModal(true)} style={{cursor: 'pointer'}}>
                <td>004</td><td>mgr.b1@dorm.edu.vn</td><td>Lê Văn E</td><td>Manager</td><td>Tòa B1</td><td className="text-danger">[Khóa]</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'student' && (
        <div className="tab-content">
          <div className="filters">
            <div className="filter-group">
              <label>Lớp:</label>
              <select><option>Tất cả</option></select>
            </div>
            <div className="filter-group">
              <label>Tòa ở:</label>
              <select><option>Tất cả</option></select>
            </div>
            <div className="filter-group">
              <label>Trạng thái:</label>
              <select><option>Tất cả</option></select>
            </div>
            <div className="search-wrapper">
               <span className="search-icon">🔍</span>
               <input type="text" placeholder="Tìm theo MSSV, Tên, Email..." className="search-input with-icon" />
            </div>
          </div>

          <table className="light-table">
            <thead>
              <tr>
                <th>MSSV</th><th>Họ và tên</th><th>Email sinh viên</th><th>Lớp</th><th>Tòa - Phòng</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>20261234</td><td>Nguyễn Văn An</td><td>nguyenvanan.sv26@student...</td><td>K68-KHMT</td><td>Tòa A1 - 101</td><td className="text-success">[Active]</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-small">🔑 Reset Pass</button>
                    <button className="btn-small">🔒 Khóa TK</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>20265678</td><td>Lê Thị Bình</td><td>lethibinh.sv26@student.edu...</td><td>K68-CNTT</td><td>Tòa B1 - 202</td><td className="text-success">[Active]</td>
                <td>
                   <div className="action-buttons">
                    <button className="btn-small">🔑 Reset Pass</button>
                    <button className="btn-small">🔒 Khóa TK</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>20269012</td><td>Trần Văn C</td><td>tranvancuong.sv26@student...</td><td>K68-ANM</td><td>Chưa xếp</td><td className="text-danger">[Locked]</td>
                <td>
                   <div className="action-buttons">
                    <button className="btn-small">🔑 Reset Pass</button>
                    <button className="btn-small">🔓 Mở khóa</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="pagination-wrapper">
            <div className="page-info">Trang 1 / 115</div>
            <div className="pagination">
              <button>&lt;</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
              <span>...</span>
              <button>80</button>
              <button>&gt;</button>
            </div>
            <div className="page-size">
              Hiển thị: <select><option>10 sinh viên / trang</option></select>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>TẠO TÀI KHOẢN QUẢN LÝ TÒA (MANAGER)</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group-light">
                <label>Họ và tên :</label>
                <input type="text" defaultValue="Nguyễn Văn B" />
              </div>
              <div className="form-group-light">
                <label>Email:</label>
                <input type="email" defaultValue="mgr.a1@dorm.edu.vn" />
              </div>
              <div className="form-group-light">
                <label>Số điện thoại:</label>
                <input type="text" defaultValue="0912345678" />
              </div>
              <div className="form-group-light">
                <label>Mật khẩu khởi tạo:</label>
                <input type="text" defaultValue="12345678" />
              </div>
              <div className="form-group-light">
                <label>Tòa nhà phân công:</label>
                <select><option>Tòa Nam A1</option></select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-dark" onClick={() => setShowCreateModal(false)}>HỦY</button>
              <button className="btn-primary-blue">TẠO TÀI KHOẢN</button>
            </div>
          </div>
        </div>
      )}

      {showConfigModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>CẤU HÌNH TÀI KHOẢN BAN QUẢN LÝ</h3>
              <button className="close-btn" onClick={() => setShowConfigModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group-light">
                <label>Họ và tên :</label>
                <input type="text" defaultValue="Nguyễn Văn B" />
              </div>
              <div className="form-group-light">
                <label>Email :</label>
                <input type="email" defaultValue="mgr.a1@dorm.edu.vn" />
              </div>
              <div className="form-group-light">
                <label>Số điện thoại</label>
                <input type="text" defaultValue="0988123456" />
              </div>
              <div className="form-group-light">
                <label>Phân công Tòa nhà (*):</label>
                <select><option>Tòa Nam A1</option></select>
              </div>
              <div className="form-group-light flex-radio">
                <label>Trạng thái tài khoản:</label>
                <div className="radio-group">
                  <label><input type="radio" name="status" defaultChecked /> Hoạt động (Active)</label>
                  <label><input type="radio" name="status" /> Tạm khóa (Locked)</label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-dark" onClick={() => setShowConfigModal(false)}>HỦY BỎ</button>
              <button className="btn-primary-blue">💾 LƯU THAY ĐỔI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
