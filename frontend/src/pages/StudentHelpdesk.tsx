import { useEffect, useState, useRef } from 'react';
import { UploadCloud, MessageSquare, X, CheckCircle } from 'lucide-react';
import './StudentHelpdesk.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const StudentHelpdesk = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Điện (Electricity)');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [completing, setCompleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = () => {
    api.get('/helpdesk')
      .then(res => {
        const sorted = res.data.sort((a: any, b: any) => b.ticketId - a.ticketId);
        setHistory(sorted);
        
        // Update selected ticket if it's currently open
        if (selectedTicket) {
          const updated = sorted.find((t: any) => t.ticketId === selectedTicket.ticketId);
          if (updated) setSelectedTicket(updated);
        }
      })
      .catch(err => console.error("Failed to fetch tickets", err));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) {
      alert("Vui lòng điền tiêu đề và mô tả");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    const ticketData = {
      roomId: 1, // Mock
      studentId: 1, // Mock
      buildingId: 1, // Mock
      description: JSON.stringify({ title, category, desc }),
      priority: 'Medium'
    };

    const ticketBlob = new Blob([JSON.stringify(ticketData)], { type: 'application/json' });
    formData.append('ticket', ticketBlob);

    if (file) {
      formData.append('image', file);
    }

    api.post('/helpdesk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        alert("Gửi yêu cầu thành công!");
        setTitle('');
        setDesc('');
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchHistory();
      })
      .catch(err => {
        console.error("Lỗi khi gửi yêu cầu:", err);
        alert("Có lỗi xảy ra khi gửi yêu cầu.");
      })
      .finally(() => setLoading(false));
  };

  const handleCompleteTicket = () => {
    if (!selectedTicket || selectedTicket.status !== 'InProgress') return;
    setCompleting(true);
    api.put(`/helpdesk/${selectedTicket.ticketId}/complete`)
      .then(() => {
        alert("Đã xác nhận hoàn thành sự cố!");
        fetchHistory();
      })
      .catch(err => {
        console.error("Lỗi khi hoàn thành:", err);
        alert("Có lỗi xảy ra khi cập nhật.");
      })
      .finally(() => setCompleting(false));
  };

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const currentHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const parseDescription = (rawDesc: string) => {
    try {
      const parsed = JSON.parse(rawDesc);
      return parsed;
    } catch (e) {
      return { title: 'Yêu cầu hỗ trợ', category: 'Khác', desc: rawDesc };
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'Pending') return 'CHỜ XỬ LÝ';
    if (status === 'InProgress') return 'ĐANG XỬ LÝ';
    if (status === 'Completed') return 'ĐÃ HOÀN THÀNH';
    return status;
  };

  return (
    <div className="sh-page-container">
      <div className="sh-header">
        <h2>TRUNG TÂM HỖ TRỢ</h2>
        <div className="sh-header-right">
          <div className="sh-search">
            <span>🔍</span>
            <input type="text" placeholder="Tìm kiếm yêu cầu..." />
          </div>
        </div>
      </div>

      <div className="sh-content">
        <div className="sh-form-section">
          <form className="sh-card" onSubmit={handleSubmit}>
            <h3 className="sh-card-title">
              <span className="sh-warn-icon">⚠</span> Trung tâm tiếp nhận sự cố
            </h3>
            
            <div className="sh-form-group">
              <label>Tiêu đề sự cố</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ví dụ: Hỏng điều hòa phòng 402" />
            </div>

            <div className="sh-form-group">
              <label>Phân loại</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option>Điện (Electricity)</option>
                <option>Nước (Water)</option>
                <option>Internet (Network)</option>
                <option>Cơ sở vật chất (Facilities)</option>
              </select>
            </div>

            <div className="sh-form-group">
              <label>Mô tả chi tiết</label>
              <textarea rows={4} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả cụ thể tình trạng sự cố để kỹ thuật viên nắm bắt thông tin..."></textarea>
            </div>

            <div className="sh-form-group">
              <label>Hình ảnh minh chứng (tối đa 1 ảnh)</label>
              <div className="sh-upload-area" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                <UploadCloud size={24} className="text-gray mb-2" />
                <p>Kéo thả hoặc <span className="text-blue">tải lên từ thiết bị</span></p>
                <span className="sh-upload-hint">DUNG LƯỢNG TỐI ĐA 20MB</span>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
              </div>
              {previewUrl && (
                <div className="sh-preview-images mt-4">
                  <div className="sh-img-preview" style={{ position: 'relative', width: '100px', height: '100px', display: 'inline-block' }}>
                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: '2px' }}><X size={14} /></button>
                  </div>
                </div>
              )}
            </div>

            <div className="sh-form-actions">
              <button type="submit" className="sh-btn-submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'} <span>&gt;</span></button>
            </div>
          </form>
        </div>

        <div className="sh-history-section">
          <div className="sh-card flex-1">
            <h3 className="sh-card-title">
              <span className="sh-history-icon">↺</span> Lịch sử & Tiến độ xử lý
            </h3>
            
            <div className="sh-history-list">
              {currentHistory.length === 0 ? <p style={{ color: 'gray', padding: '20px', textAlign: 'center' }}>Chưa có yêu cầu nào.</p> : null}
              {currentHistory.map((item: any) => {
                const parsed = parseDescription(item.description);
                const isProcessing = item.status === 'InProgress' || item.status === 'Pending';
                return (
                  <div key={item.ticketId} className={`sh-history-item ${isProcessing ? 'active' : ''}`} onClick={() => setSelectedTicket(item)} style={{ cursor: 'pointer' }}>
                    <div className="flex justify-between">
                      <div>
                        <span className={`sh-badge-status ${item.status === 'Completed' ? 'gray' : item.status === 'Pending' ? 'orange' : 'blue'}`}>
                          {getStatusText(item.status)}
                        </span>
                        {item.assignedTechnician && <span className="sh-assigned-badge">{item.assignedTechnician.fullName}</span>}
                      </div>
                      <span className="sh-time">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <h4>{parsed.title}</h4>
                    <p>{parsed.desc.length > 50 ? parsed.desc.substring(0, 50) + '...' : parsed.desc}</p>
                  </div>
                );
              })}
            </div>
            
            {totalPages > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '4px 8px' }}>&lt;</button>
                {getPageNumbers().map(pageNum => (
                  <button key={pageNum} style={{ padding: '4px 8px', background: pageNum === currentPage ? '#2196F3' : '#eee', color: pageNum === currentPage ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setCurrentPage(pageNum)}>{pageNum}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '4px 8px' }}>&gt;</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTicket && (
        <div className="sh-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="sh-modal-content" onClick={e => e.stopPropagation()} style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="sh-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>Chi tiết Yêu cầu Hỗ trợ #{selectedTicket.ticketId}</h3>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={20} /></button>
            </div>
            <div className="sh-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {(() => {
                const parsed = parseDescription(selectedTicket.description);
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
                    {selectedTicket.imagePath && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <strong style={{ color: '#666', fontSize: '0.9rem' }}>Hình ảnh minh chứng:</strong>
                        <img src={selectedTicket.imagePath} alt="Minh chứng" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee' }} />
                      </div>
                    )}
                    
                    {/* Tiến độ xử lý (Timeline) */}
                    <div className="sh-timeline" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                      <h4 style={{ marginBottom: '15px', color: '#333' }}>TIẾN ĐỘ CHI TIẾT</h4>
                      
                      <div className="sh-timeline-item">
                        <div className="sh-tl-icon done">✓</div>
                        <div className="sh-tl-content">
                          <h5>Yêu cầu đã được gửi</h5>
                          <p>Hệ thống đã tiếp nhận yêu cầu từ sinh viên.</p>
                        </div>
                        <div className="sh-tl-time">{new Date(selectedTicket.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>

                      <div className="sh-timeline-item">
                        <div className={`sh-tl-icon ${selectedTicket.status !== 'Pending' ? 'done' : 'pending'}`}>{selectedTicket.status !== 'Pending' ? '✓' : ''}</div>
                        <div className="sh-tl-content">
                          <h5 className={selectedTicket.status !== 'Pending' ? "text-blue" : "text-gray"}>Đã phân công xử lý</h5>
                          {selectedTicket.assignedTechnician ? (
                            <p>Kỹ thuật viên <strong>[{selectedTicket.assignedTechnician.fullName}]</strong> đã được phân công và đang đến làm việc.</p>
                          ) : (
                            <p>Đang chờ Ban quản lý phân công kỹ thuật viên.</p>
                          )}
                        </div>
                      </div>

                      <div className="sh-timeline-item">
                        <div className={`sh-tl-icon ${selectedTicket.status === 'Completed' ? 'done' : 'pending'}`}>{selectedTicket.status === 'Completed' ? '✓' : ''}</div>
                        <div className={`sh-tl-content ${selectedTicket.status === 'Completed' ? 'text-blue' : 'text-gray'}`}>
                          <h5>Đã hoàn thành</h5>
                          <p>Sự cố đã được khắc phục xong.</p>
                        </div>
                        {selectedTicket.resolvedAt && (
                          <div className="sh-tl-time">{new Date(selectedTicket.resolvedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.9rem', display: 'block' }}>Trạng thái hiện tại:</strong>
                        <span className={`sh-badge-status ${selectedTicket.status === 'Completed' ? 'gray' : selectedTicket.status === 'Pending' ? 'orange' : 'blue'}`} style={{ marginTop: '5px', display: 'inline-block' }}>
                          {getStatusText(selectedTicket.status)}
                        </span>
                      </div>
                      
                      {selectedTicket.status === 'InProgress' && (
                        <button 
                          onClick={handleCompleteTicket}
                          disabled={completing}
                          style={{ 
                            background: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', 
                            cursor: completing ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' 
                          }}
                        >
                          <CheckCircle size={18} /> {completing ? 'Đang xử lý...' : 'Đánh dấu hoàn thành'}
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

