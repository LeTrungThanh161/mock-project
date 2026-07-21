import { useEffect, useState } from 'react';
import { Filter, Save } from 'lucide-react';
import './MeterReadings.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Building {
  buildingId: number;
  name: string;
}

interface MeterReadingRecord {
  readingId: number;
  room: { roomId: number; roomNumber: string };
  electricStart: number;
  electricEnd: number;
  waterStart: number;
  waterEnd: number;
  isFirstMonth?: boolean;
}

interface PricingTier {
  tierId: number;
  utilityType: string;
  tierOrder: number;
  fromUnit: number;
  toUnit: number | null;
  unitPrice: number;
}

interface UIDataRow {
  readingId: number;
  room: string;
  service: string;
  oldVal: number;
  newVal: number | null;
  usage: number | null;
  total: number | null;
  isFirstMonth: boolean;
}

export const MeterReadings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<number | ''>('');

  const [floors, setFloors] = useState<number[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | ''>('');

  const [month, setMonth] = useState<string>('2026-06');

  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [readings, setReadings] = useState<UIDataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialFetched, setInitialFetched] = useState(false);

  // Logic kiểm tra nếu chưa qua tháng hiện tại (selected > current month) thì không cho nhập
  const currentDate = new Date();
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const isLocked = month > currentMonthStr;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 3 rooms * 2 services

  useEffect(() => {
    // Fetch buildings
    api.get('/buildings')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setBuildings(res.data);
          setSelectedBuilding(res.data[0].buildingId);
        }
      })
      .catch(err => console.error("Failed to fetch buildings", err));
      
    // Fetch pricing tiers
    api.get('/admin/pricing-tiers')
      .then(res => {
        if (res.data) setPricingTiers(res.data);
      })
      .catch(err => console.error("Failed to fetch pricing tiers", err));
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      api.get(`/rooms/floors?buildingId=${selectedBuilding}`)
        .then(res => {
          setFloors(res.data);
          setSelectedFloor(''); // ALL floors
        })
        .catch(err => console.error("Failed to fetch floors", err));
    }
  }, [selectedBuilding]);

  const fetchReadings = () => {
    if (!selectedBuilding || !month) return;
    setLoading(true);

    // YYYY-MM -> YYYY-MM-01
    const dateParam = `${month}-01`;
    let url = `/meter-readings/filter?buildingId=${selectedBuilding}&month=${dateParam}`;
    if (selectedFloor !== '') {
      url += `&floorNumber=${selectedFloor}`;
    }

    api.get(url)
      .then(res => {
        const data: MeterReadingRecord[] = res.data;
        const uiData: UIDataRow[] = [];

        data.forEach(item => {
          // Electric row
          uiData.push({
            readingId: item.readingId,
            room: item.room.roomNumber,
            service: 'Electric',
            oldVal: item.electricStart,
            newVal: item.electricEnd === item.electricStart ? null : item.electricEnd,
            usage: item.electricEnd === item.electricStart ? null : Math.round((item.electricEnd - item.electricStart) * 100) / 100,
            total: null, // Tạm tính có thể thêm logic
            isFirstMonth: !!item.isFirstMonth,
          });
          // Water row
          uiData.push({
            readingId: item.readingId,
            room: item.room.roomNumber,
            service: 'Water',
            oldVal: item.waterStart,
            newVal: item.waterEnd === item.waterStart ? null : item.waterEnd,
            usage: item.waterEnd === item.waterStart ? null : Math.round((item.waterEnd - item.waterStart) * 100) / 100,
            total: null,
            isFirstMonth: !!item.isFirstMonth,
          });
        });

        setReadings(uiData);
        setCurrentPage(1);
      })
      .catch(err => {
        console.error("Failed to fetch readings", err);
        alert("Lỗi khi tải dữ liệu");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedBuilding !== '' && month !== '' && !initialFetched) {
      fetchReadings();
      setInitialFetched(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBuilding, month, initialFetched]);

  const handleInputChange = (index: number, valStr: string) => {
    const newVal = valStr === '' ? null : parseFloat(valStr);
    const newReadings = [...readings];
    const row = newReadings[index];
    row.newVal = newVal;
    if (newVal !== null) {
      row.usage = Math.round((newVal - row.oldVal) * 100) / 100;
    } else {
      row.usage = null;
    }
    setReadings(newReadings);
  };

  const handleOldValChange = (index: number, valStr: string) => {
    const newOldVal = valStr === '' ? 0 : parseFloat(valStr);
    const newReadings = [...readings];
    const row = newReadings[index];
    row.oldVal = newOldVal;
    if (row.newVal !== null) {
      row.usage = Math.round((row.newVal - row.oldVal) * 100) / 100;
    }
    setReadings(newReadings);
  };

  const handleSaveAll = () => {
    setSaving(true);
    // Nhóm lại theo readingId
    const updatesMap = new Map<number, { readingId: number, electricEnd?: number, waterEnd?: number, electricStart?: number, waterStart?: number }>();

    readings.forEach(r => {
      if (r.newVal !== null || r.isFirstMonth) {
        if (!updatesMap.has(r.readingId)) {
          updatesMap.set(r.readingId, { readingId: r.readingId });
        }
        const updateObj = updatesMap.get(r.readingId)!;
        if (r.service === 'Electric') {
          if (r.newVal !== null) updateObj.electricEnd = r.newVal;
          if (r.isFirstMonth) updateObj.electricStart = r.oldVal;
        } else {
          if (r.newVal !== null) updateObj.waterEnd = r.newVal;
          if (r.isFirstMonth) updateObj.waterStart = r.oldVal;
        }
      }
    });

    const payload = Array.from(updatesMap.values());
    if (payload.length === 0) {
      alert("Không có thay đổi nào để lưu");
      setSaving(false);
      return;
    }

    api.put('/meter-readings/bulk-update', payload)
      .then(() => {
        alert("Lưu thành công");
        fetchReadings();
      })
      .catch(err => alert("Lỗi khi lưu: " + err))
      .finally(() => setSaving(false));
  };

  // Pagination logic
  const totalPages = Math.ceil(readings.length / itemsPerPage);
  const currentReadings = readings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const calculateTotal = (usage: number, service: string) => {
    const tiers = pricingTiers
      .filter(t => t.utilityType === service)
      .sort((a, b) => a.tierOrder - b.tierOrder);
    if (!tiers.length) return 0;
    
    let remaining = usage;
    let total = 0;
    
    for (const tier of tiers) {
      if (remaining <= 0) break;
      const capacity = tier.toUnit !== null 
        ? (tier.fromUnit === 0 ? tier.toUnit : tier.toUnit - tier.fromUnit + 1) 
        : Infinity;
      const amountToCharge = Math.min(remaining, capacity);
      total += amountToCharge * tier.unitPrice;
      remaining -= amountToCharge;
    }
    return Math.round(total);
  };

  const totalElec = Math.round(readings.filter(r => r.service === 'Electric').reduce((acc, r) => acc + (r.usage || 0), 0) * 100) / 100;
  const totalWater = Math.round(readings.filter(r => r.service === 'Water').reduce((acc, r) => acc + (r.usage || 0), 0) * 100) / 100;
  const totalRoomsWithData = new Set(readings.filter(r => r.newVal !== null).map(r => r.room)).size;
  const totalRooms = new Set(readings.map(r => r.room)).size;

  return (
    <div className="mr-page-container">
      <div className="mr-header">
        <h2>Nhập Chỉ số Điện/Nước</h2>
      </div>

      <div className="mr-filters">
        <div className="mr-filter-group">
          <label>Tòa Nhà</label>
          <select value={selectedBuilding} onChange={e => setSelectedBuilding(Number(e.target.value))}>
            {buildings.map(b => (
              <option key={b.buildingId} value={b.buildingId}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="mr-filter-group">
          <label>Tầng</label>
          <select value={selectedFloor} onChange={e => setSelectedFloor(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">Tất cả tầng</option>
            {floors.map(f => (
              <option key={f} value={f}>Tầng {f}</option>
            ))}
          </select>
        </div>
        <div className="mr-filter-group">
          <label>Tháng</label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
        </div>
        <button className="mr-btn-filter" onClick={fetchReadings} disabled={loading}>
          <Filter size={18} /> {loading ? 'Đang lọc...' : 'Lọc dữ liệu'}
        </button>
      </div>

      <div className="mr-table-card">
        <div className="mr-table-header">
          <h3 style={{ color: 'gray' }}>Danh sách nhập chỉ số</h3>
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
            {currentReadings.length > 0 ? currentReadings.map((r, i) => {
              const actualIndex = (currentPage - 1) * itemsPerPage + i;
              return (
                <tr key={`${r.readingId}-${r.service}`}>
                  <td className="text-gray"><strong>{r.room}</strong></td>
                  <td className="mr-type-cell text-gray">
                    <span className={`mr-icon ${r.service === 'Electric' ? 'elec' : 'water'}`}>
                      {r.service === 'Electric' ? '⚡' : '💧'}
                    </span>
                    {r.service === 'Electric' ? 'Điện' : 'Nước'}
                  </td>
                  <td className="text-gray">
                    {r.isFirstMonth ? (
                      <input
                        type="number"
                        value={r.oldVal}
                        onChange={e => handleOldValChange(actualIndex, e.target.value)}
                        placeholder="Chỉ số đầu"
                        className="mr-input-newval"
                        disabled={isLocked || isAdmin}
                        style={{ width: '80px' }}
                      />
                    ) : (
                      r.oldVal
                    )}
                  </td>
                  <td className="text-gray">
                    <input
                      type="number"
                      value={r.newVal === null ? '' : r.newVal}
                      onChange={e => handleInputChange(actualIndex, e.target.value)}
                      placeholder="Nhập chỉ số"
                      className="mr-input-newval"
                      disabled={isLocked || isAdmin}
                    />
                  </td>
                  <td className="mr-usage">{r.usage !== null ? `${r.usage} ${r.service === 'Electric' ? 'kWh' : 'm³'}` : '--'}</td>
                  <td className="mr-total text-gray">{r.usage !== null ? `${calculateTotal(r.usage, r.service).toLocaleString('vi-VN')} đ` : '--'}</td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'gray' }}>Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mr-table-footer">
          <div className="mr-pagination-info-controls">
            <span>Đang hiển thị {currentReadings.length} trên {readings.length} bản ghi</span>
            {totalPages > 0 && (
              <div className="mr-page-controls">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>&lt;</button>
                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    className={pageNum === currentPage ? 'active' : ''}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>&gt;</button>
              </div>
            )}
          </div>
          {!isAdmin && (
            <button className="mr-btn-save" onClick={handleSaveAll} disabled={saving || readings.length === 0}>
              <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu toàn bộ'}
            </button>
          )}
        </div>
      </div>

      <div className="mr-stats-container">
        <div className="mr-stat-card">
          <div className="mr-stat-icon done">✓</div>
          <div>
            <p>TIẾN ĐỘ</p>
            <h4 style={{ color: 'gray' }}>{totalRoomsWithData} / {totalRooms} Phòng</h4>
          </div>
        </div>
        <div className="mr-stat-card">
          <div className="mr-stat-icon trend">↗</div>
          <div>
            <p>TỔNG ĐIỆN (TẠM TÍNH)</p>
            <h4 style={{ color: 'gray' }}>{totalElec} kWh</h4>
          </div>
        </div>
        <div className="mr-stat-card">
          <div className="mr-stat-icon" style={{ background: '#E3F2FD', color: '#2196F3', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💧</div>
          <div>
            <p>TỔNG NƯỚC (TẠM TÍNH)</p>
            <h4 style={{ color: 'gray' }}>{totalWater} m³</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

