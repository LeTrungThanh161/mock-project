import { useEffect, useState } from 'react';
import { Filter, Save } from 'lucide-react';
import './MeterReadings.css';
import api from '../services/api';

export const MeterReadings = () => {
  const [readings, setReadings] = useState<any[]>([]);

  useEffect(() => {
    // Mock data for UI
    const mockData = [
      { room: '101', service: 'Điện', oldVal: 1245, newVal: 1288, usage: 43, total: 150500 },
      { room: '101', service: 'Nước', oldVal: 412, newVal: 418, usage: 6, total: 90000 },
      { room: '102', service: 'Điện', oldVal: 2890, newVal: null, usage: null, total: null },
      { room: '102', service: 'Nước', oldVal: 556, newVal: null, usage: null, total: null },
      { room: '103', service: 'Điện', oldVal: 1112, newVal: null, usage: null, total: null },
      { room: '103', service: 'Nước', oldVal: 301, newVal: null, usage: null, total: null },
    ];
    setReadings(mockData);
  }, []);

  return (
    <div className="mr-page-container">
      <div className="mr-header">
        <h2>Nhập Chỉ số Điện/Nước</h2>
      </div>

      <div className="mr-filters">
        <div className="mr-filter-group">
          <label>Tòa Nhà</label>
          <select><option>Tòa nhà A</option></select>
        </div>
        <div className="mr-filter-group">
          <label>Tầng</label>
          <select><option>Tầng 1</option></select>
        </div>
        <div className="mr-filter-group">
          <label>Tháng</label>
          <input type="month" defaultValue="2023-11" />
        </div>
        <button className="mr-btn-filter">
          <Filter size={18} /> Lọc dữ liệu
        </button>
      </div>

      <div className="mr-table-card">
        <div className="mr-table-header">
          <h3>Danh sách nhập chỉ số</h3>
          <span>Nhấn vào cột "Chỉ số mới" để nhập liệu trực tiếp</span>
        </div>

        <table className="mr-table">
          <thead>
            <tr>
              <th>PHÒNG</th>
              <th>DỊCH VỤ</th>
              <th>CHỈ SỐ CŨ</th>
              <th>CHỈ SỐ MỚI</th>
              <th>TIÊU THỤ</th>
              <th>TỔNG TẠM TÍNH</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((r, i) => (
              <tr key={i}>
                <td className="text-gray"><strong>{r.room}</strong></td>
                <td className="mr-type-cell text-gray">
                  <span className={`mr-icon ${r.service === 'Điện' ? 'elec' : 'water'}`}>
                    {r.service === 'Điện' ? '⚡' : '💧'}
                  </span>
                  {r.service}
                </td>
                <td className="text-gray">{r.oldVal}</td>
                <td className="text-gray">
                  <input type="number" defaultValue={r.newVal || ''} placeholder="Nhập chỉ số" className="mr-input-newval"/>
                </td>
                <td className="mr-usage">{r.usage ? `${r.usage} ${r.service === 'Điện' ? 'kWh' : 'm³'}` : '--'}</td>
                <td className="mr-total text-gray">{r.total ? `${r.total.toLocaleString()} đ` : '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mr-table-footer">
          <span>Đang hiển thị {readings.length} bản ghi</span>
          <button className="mr-btn-save"><Save size={18} /> Lưu toàn bộ</button>
        </div>
      </div>

      <div className="mr-stats-container">
        <div className="mr-stat-card">
          <div className="mr-stat-icon done">✓</div>
          <div>
            <p>TIẾN ĐỘ</p>
            <h4>2 / 48 Phòng</h4>
          </div>
        </div>
        <div className="mr-stat-card">
          <div className="mr-stat-icon trend">↗</div>
          <div>
            <p>TỔNG ĐIỆN (TẠM TÍNH)</p>
            <h4>1,250 kWh</h4>
          </div>
        </div>
        <div className="mr-stat-card">
          <div className="mr-stat-icon warn">!</div>
          <div>
            <p>CẢNH BÁO BẤT THƯỜNG</p>
            <h4>0 Phòng</h4>
          </div>
        </div>
      </div>
    </div>
  );
};
