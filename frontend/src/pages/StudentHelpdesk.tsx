import { useEffect, useState } from 'react';
import { Bell, LogOut, Send, UploadCloud, MessageSquare } from 'lucide-react';
import './StudentHelpdesk.css';
import api from '../services/api';

export const StudentHelpdesk = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Mock API
    const mockList = [
      { id: 1, title: 'Tắc thoát sàn nhà vệ sinh', desc: 'Nước rút rất chậm, gây ngập sàn khi tắm...', status: 'ĐANG XỬ LÝ', time: 'Hôm nay, 10:00', by: 'LÝ' },
      { id: 2, title: 'Mất kết nối Wifi', desc: 'Không thể đăng nhập vào cổng thông tin từ tối qua...', status: 'ĐÃ HOÀN THÀNH', time: '12 Th08, 2023', by: 'THÀNH' },
      { id: 3, title: 'Hỏng ổ cắm điện bàn học', desc: 'Ổ cắm bị lỏng, cắm sạc laptop hay bị ngắt quãng...', status: 'ĐÃ HOÀN THÀNH', time: '05 Th08, 2023', by: 'THÀNH' },
    ];
    setHistory(mockList);
  }, []);

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
          <div className="sh-card">
            <h3 className="sh-card-title">
              <span className="sh-warn-icon">⚠</span> Trung tâm tiếp nhận sự cố
            </h3>
            
            <div className="sh-form-group">
              <label>Tiêu đề sự cố</label>
              <input type="text" placeholder="Ví dụ: Hỏng điều hòa phòng 402" />
            </div>

            <div className="sh-form-group">
              <label>Phân loại</label>
              <select>
                <option>Điện (Electricity)</option>
                <option>Nước (Water)</option>
                <option>Internet (Network)</option>
                <option>Cơ sở vật chất (Facilities)</option>
              </select>
            </div>

            <div className="sh-form-group">
              <label>Mô tả chi tiết</label>
              <textarea rows={4} placeholder="Mô tả cụ thể tình trạng sự cố để kỹ thuật viên nắm bắt thông tin..."></textarea>
            </div>

            <div className="sh-form-group">
              <label>Hình ảnh minh chứng (nếu có)</label>
              <div className="sh-upload-area">
                <UploadCloud size={24} className="text-gray mb-2" />
                <p>Kéo thả hoặc <span className="text-blue cursor-pointer">tải lên từ thiết bị</span></p>
                <span className="sh-upload-hint">DUNG LƯỢNG TỐI ĐA 20MB</span>
              </div>
              <div className="sh-preview-images mt-4">
                <div className="sh-img-placeholder">Ảnh 1</div>
                <div className="sh-img-placeholder">Ảnh 2</div>
              </div>
            </div>

            <div className="sh-form-actions">
              <button className="sh-btn-submit">Gửi yêu cầu hỗ trợ <span>&gt;</span></button>
            </div>
          </div>
        </div>

        <div className="sh-history-section">
          <div className="sh-card flex-1">
            <h3 className="sh-card-title">
              <span className="sh-history-icon">↺</span> Lịch sử & Tiến độ xử lý
            </h3>
            
            <div className="sh-history-list">
              {history.map(item => (
                <div key={item.id} className={`sh-history-item ${item.status === 'ĐANG XỬ LÝ' ? 'active' : ''}`}>
                  <div className="flex justify-between">
                    <div>
                      <span className={`sh-badge-status ${item.status === 'ĐANG XỬ LÝ' ? 'blue' : 'gray'}`}>
                        {item.status}
                      </span>
                      <span className="sh-assigned-badge">{item.by}</span>
                    </div>
                    <span className="sh-time">{item.time}</span>
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="sh-timeline mt-6">
              <h4 className="mb-4">TIẾN ĐỘ CHI TIẾT</h4>
              
              <div className="sh-timeline-item">
                <div className="sh-tl-icon done">✓</div>
                <div className="sh-tl-content">
                  <h5>Yêu cầu đã được gửi</h5>
                  <p>Hệ thống đã tiếp nhận yêu cầu từ sinh viên.</p>
                </div>
                <div className="sh-tl-time">10:00</div>
              </div>

              <div className="sh-timeline-item">
                <div className="sh-tl-icon active">★</div>
                <div className="sh-tl-content">
                  <h5 className="text-blue">Đã phân công xử lý</h5>
                  <p>Quản lý <strong>[Trần Phú]</strong> đã duyệt & chỉ định Kỹ thuật viên <strong>[Nguyễn Văn B]</strong>.</p>
                </div>
                <div className="sh-tl-time">11:15</div>
              </div>

              <div className="sh-timeline-item">
                <div className="sh-tl-icon pending"></div>
                <div className="sh-tl-content text-gray">
                  <h5>Dự kiến hoàn thành</h5>
                  <p>Kỹ thuật viên đang di chuyển đến hiện trường.</p>
                </div>
              </div>
            </div>

            <button className="sh-btn-chat">
              <MessageSquare size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
