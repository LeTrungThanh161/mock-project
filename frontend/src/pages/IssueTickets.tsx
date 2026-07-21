import { useEffect, useState } from 'react';
import { Plus, Wrench, Eye, CheckCircle, Clock, X } from 'lucide-react';
import './IssueTickets.css';
import api from '../services/api';

export const IssueTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedDetailTicket, setSelectedDetailTicket] = useState<any | null>(null);
  const [selectedAssignTicket, setSelectedAssignTicket] = useState<any | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<number | ''>('');
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchTickets = () => {
    api.get('/helpdesk')
      .then(res => {
        const sorted = res.data.sort((a: any, b: any) => b.ticketId - a.ticketId);
        setTickets(sorted);
      })
      .catch(err => console.error("Failed to fetch tickets", err));
  };

  const fetchTechnicians = () => {
    api.get('/technicians')
      .then(res => setTechnicians(res.data))
      .catch(err => console.error("Failed to fetch technicians", err));
  };

  useEffect(() => {
    fetchTickets();
    fetchTechnicians();
  }, []);

  const handleAssign = () => {
    if (!selectedTechId) {
      alert("Vui lòng chọn kỹ thuật viên!");
      return;
    }
    setAssignLoading(true);
    api.put(`/helpdesk/${selectedAssignTicket.ticketId}/assign?technicianId=${selectedTechId}`)
      .then(() => {
        alert("Phân công thành công!");
        setSelectedAssignTicket(null);
        setSelectedTechId('');
        fetchTickets();
      })
      .catch(err => {
        console.error("Lỗi phân công:", err);
        alert("Có lỗi xảy ra khi phân công.");
      })
      .finally(() => setAssignLoading(false));
  };

  const handleReject = () => {
    alert("Chưa có API xử lý từ chối trong backend!");
    setSelectedAssignTicket(null);
  };

  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const currentTickets = tickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const parseDescription = (rawDesc: string) => {
    try {
      return JSON.parse(rawDesc);
    } catch (e) {
      return { title: 'Sự cố', category: 'Khác', desc: rawDesc };
    }
  };

  const getPriorityText = (priority: string) => {
    if (priority === 'High') return 'Khẩn cấp';
    if (priority === 'Medium') return 'Trung bình';
    return 'Bình thường'; // Low
  };

  const getPriorityClass = (priority: string) => {
    if (priority === 'High') return 'danger';
    if (priority === 'Medium') return 'warning';
    return 'normal';
  };

  const getStatusText = (status: string) => {
    if (status === 'Pending') return 'Chờ xử lý';
    if (status === 'InProgress') return 'Đang xử lý';
    if (status === 'Completed') return 'Đã hoàn tất';
    return status;
  };

  const getStatusClass = (status: string) => {
    if (status === 'Pending') return 'red';
    if (status === 'InProgress') return 'orange';
    return 'blue';
  };

  const availableTechs = technicians.filter(t => t.status === 'Active');

  return (
    <div className="tk-page-container">
      <div className="tk-header">
        <h2>Helpdesk & Báo cáo sự cố</h2>
      </div>

      <div className="tk-stats">
        <div className="tk-stat-card">
          <p>TỔNG SỰ CỐ</p>
          <h4>{tickets.length}</h4>
          <span className="info">Toàn bộ hệ thống</span>
        </div>
        <div className="tk-stat-card">
          <p>ĐANG XỬ LÝ</p>
          <h4>{tickets.filter(t => t.status === 'InProgress').length}</h4>
          <div className="tk-progress-bar"><div className="tk-progress" style={{ width: '40%' }}></div></div>
        </div>
        <div className="tk-stat-card">
          <p>ƯU TIÊN CAO</p>
          <h4 className="danger">{tickets.filter(t => t.priority === 'High').length}</h4>
          <span className="danger">Cần giải quyết ngay</span>
        </div>
        <div className="tk-stat-card">
          <p>ĐÃ HOÀN TẤT</p>
          <h4>{tickets.filter(t => t.status === 'Completed').length}</h4>
          <span>Tỷ lệ hoàn thành cao</span>
        </div>
      </div>

      <div className="tk-table-container">
        <div className="tk-table-actions">
          <div className="tk-title-search">
            <h3 style={{ color: 'black' }}>Danh sách yêu cầu hỗ trợ</h3>
            <div className="tk-search">
              <span>🔍</span>
              <input type="text" placeholder="Tìm kiếm phòng, mã..." />
            </div>
          </div>
          <button className="tk-btn-primary"><Plus size={16} /> TẠO PHIẾU MỚI</button>
        </div>

        <table className="tk-table">
          <thead>
            <tr>
              <th style={{ color: 'white' }}>MÃ SỐ</th>
              <th style={{ color: 'white' }}>PHÒNG</th>
              <th style={{ color: 'white' }}>LOẠI SỰ CỐ</th>
              <th style={{ color: 'white' }}>NỘI DUNG TÓM TẮT</th>
              <th style={{ color: 'white' }}>MỨC ĐỘ</th>
              <th style={{ color: 'white' }}>TRẠNG THÁI</th>
              <th style={{ color: 'white', textAlign: 'center' }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'gray' }}>Không có sự cố nào.</td></tr>
            )}
            {currentTickets.map((t) => {
              const parsed = parseDescription(t.description);
              return (
                <tr key={t.ticketId}>
                  <td style={{ color: 'gray' }}><strong>#TK-{t.ticketId}</strong></td>
                  <td style={{ color: 'gray' }}>{t.room?.roomNumber || `Phòng ${t.room?.roomId}`}</td>
                  <td className="tk-type-cell" style={{ color: 'gray' }}>
                    {parsed.category.includes('Điện') ? <span className="tk-icon elec">⚡</span> : parsed.category.includes('Nước') ? <span className="tk-icon water">💧</span> : <span className="tk-icon net">📡</span>}
                    {parsed.category}
                  </td>
                  <td style={{ color: 'gray' }}>
                    <strong>{parsed.title}</strong>
                    <br />
                    <small>{parsed.desc.length > 30 ? parsed.desc.substring(0, 30) + '...' : parsed.desc}</small>
                  </td>
                  <td style={{ color: 'gray' }}>
                    <span className={`tk-priority-badge ${getPriorityClass(t.priority)}`}>
                      {getPriorityText(t.priority)}
                    </span>
                  </td>
                  <td style={{ color: 'gray' }}>
                    <span className={`tk-status-dot ${getStatusClass(t.status)}`}></span>
                    {getStatusText(t.status)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="tk-btn-action" onClick={() => setSelectedDetailTicket(t)} style={{ marginRight: '8px', background: '#e0f2fe', color: '#0284c7' }}><Eye size={14} /> Chi tiết</button>
                    <button className="tk-btn-action" onClick={() => setSelectedAssignTicket(t)}><Wrench size={14} /> Xử lý</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="tk-pagination">
          <span>Hiển thị {currentTickets.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, tickets.length)} trên {tickets.length} yêu cầu</span>
          {totalPages > 0 && (
            <div className="tk-page-controls">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>&lt;</button>
              {getPageNumbers().map(pageNum => (
                <button key={pageNum} className={pageNum === currentPage ? 'active' : ''} onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>&gt;</button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDetailTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedDetailTicket(null)}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Chi tiết Yêu cầu Hỗ trợ #{selectedDetailTicket.ticketId}</h3>
              <button onClick={() => setSelectedDetailTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {(() => {
                const parsed = parseDescription(selectedDetailTicket.description);
                return (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <strong style={{ color: '#666', fontSize: '0.9rem' }}>Tiêu đề sự cố:</strong>
                      <div style={{ padding: '10px', background: '#f5f7fa', borderRadius: '8px', color: '#333' }}>{parsed.title}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <strong style={{ color: '#666', fontSize: '0.9rem' }}>Phân loại:</strong>
                      <div style={{ padding: '10px', background: '#f5f7fa', borderRadius: '8px', color: '#333' }}>{parsed.category}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <strong style={{ color: '#666', fontSize: '0.9rem' }}>Mô tả chi tiết:</strong>
                      <div style={{ padding: '10px', background: '#f5f7fa', borderRadius: '8px', color: '#333', whiteSpace: 'pre-wrap' }}>{parsed.desc}</div>
                    </div>
                    {selectedDetailTicket.imagePath && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Hình ảnh minh chứng:</strong>
                        <img src={selectedDetailTicket.imagePath} alt="Minh chứng" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.9rem', display: 'block' }}>Trạng thái:</strong>
                        <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{getStatusText(selectedDetailTicket.status)}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: '#666', fontSize: '0.9rem', display: 'block' }}>Kỹ thuật viên:</strong>
                        <span>{selectedDetailTicket.assignedTechnician ? selectedDetailTicket.assignedTechnician.fullName : 'Chưa phân công'}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {selectedAssignTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedAssignTicket(null)}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Xử lý Yêu cầu #{selectedAssignTicket.ticketId}</h3>
              <button onClick={() => setSelectedAssignTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '0.9rem' }}>Chọn Kỹ thuật viên (Đang sẵn sàng)</label>
                <select
                  value={selectedTechId}
                  onChange={e => setSelectedTechId(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                >
                  <option value="">-- Chọn kỹ thuật viên --</option>
                  {availableTechs.map(tech => (
                    <option key={tech.technicianId} value={tech.technicianId}>
                      {tech.fullName} - Tòa {tech.building?.name || tech.building?.buildingId}
                    </option>
                  ))}
                  {availableTechs.length === 0 && <option value="" disabled>Không có KTV sẵn sàng</option>}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                  onClick={handleAssign}
                  disabled={assignLoading}
                  style={{ flex: 1, background: '#2196F3', color: '#fff', padding: '10px', border: 'none', borderRadius: '6px', cursor: assignLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  Đồng ý & Phân công
                </button>
                <button
                  onClick={handleReject}
                  style={{ flex: 1, background: '#f44336', color: '#fff', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Từ chối đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
