import { useState, useEffect, useMemo } from 'react';
import { getAvailableRooms, registerRoom } from '../services/api';
import './RoomRegistration.css';

interface RoomDTO {
  roomId: number;
  roomNumber: string;
  buildingName: string;
  roomTypeName: string;
  currentOccupancy: number;
  maxCapacity: number;
  price: number;
}

export const RoomRegistration = () => {
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedBuilding, setSelectedBuilding] = useState('Tất cả');
  const [selectedRoomType, setSelectedRoomType] = useState('Tất cả');
  
  const [selectedRoom, setSelectedRoom] = useState<RoomDTO | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getAvailableRooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const buildings = useMemo(() => {
    const b = new Set(rooms.map(r => r.buildingName));
    return ['Tất cả', ...Array.from(b)];
  }, [rooms]);

  const roomTypes = useMemo(() => {
    const t = new Set(rooms.map(r => r.roomTypeName));
    return ['Tất cả', ...Array.from(t)];
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const matchBuilding = selectedBuilding === 'Tất cả' || r.buildingName === selectedBuilding;
      const matchType = selectedRoomType === 'Tất cả' || r.roomTypeName === selectedRoomType;
      return matchBuilding && matchType;
    });
  }, [rooms, selectedBuilding, selectedRoomType]);

  const handleSelectRoom = (room: RoomDTO) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  const handleRegister = async () => {
    if (!selectedRoom) return;
    try {
      setRegistering(true);
      await registerRoom(selectedRoom.roomId);
      alert('Đăng ký phòng thành công!');
      setShowModal(false);
      setSelectedRoom(null);
      fetchRooms(); // refresh list
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data || 'Có lỗi xảy ra khi đăng ký phòng.');
    } finally {
      setRegistering(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  if (loading) {
    return <div className="room-registration-loading">Đang tải danh sách phòng...</div>;
  }

  return (
    <div className="room-registration-container animate-fade-in">
      <h1 className="page-title">ĐĂNG KÝ PHÒNG TRỰC TUYẾN</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filters-container">
        <div className="filter-group">
          <label>Chọn tòa:</label>
          <select value={selectedBuilding} onChange={e => setSelectedBuilding(e.target.value)}>
            {buildings.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Loại phòng:</label>
          <select value={selectedRoomType} onChange={e => setSelectedRoomType(e.target.value)}>
            {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="rooms-table">
          <thead>
            <tr>
              <th>Phòng</th>
              <th>Tòa nhà</th>
              <th>Loại phòng</th>
              <th>Giường trống</th>
              <th>Giá thuê</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map(room => (
                <tr key={room.roomId}>
                  <td>{room.roomNumber}</td>
                  <td>{room.buildingName}</td>
                  <td>{room.roomTypeName}</td>
                  <td>{room.currentOccupancy} / {room.maxCapacity}</td>
                  <td>{formatCurrency(room.price)}</td>
                  <td>
                    <button className="btn-select-room" onClick={() => handleSelectRoom(room)}>
                      Chọn
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">Không có phòng trống phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedRoom && (
        <div className="modal-overlay">
          <div className="registration-modal">
            <div className="modal-header">
              <h2>XÁC NHẬN ĐĂNG KÝ PHÒNG</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="info-section">
                <h3>1. THÔNG TIN PHÒNG ĐÃ CHỌN</h3>
                <div className="info-grid">
                  <div>
                    <p>Số phòng: <strong>{selectedRoom.roomNumber}</strong></p>
                    <p>Loại phòng: <strong>{selectedRoom.roomTypeName}</strong></p>
                    <p>Giá thuê: <strong>{formatCurrency(selectedRoom.price)} / tháng</strong></p>
                  </div>
                  <div>
                    <p>Tòa nhà: <strong>Tòa {selectedRoom.buildingName}</strong></p>
                    <p>Số người hiện tại: <strong>{selectedRoom.currentOccupancy} / {selectedRoom.maxCapacity} người</strong></p>
                    <p>Tiền cọc: <strong>{formatCurrency(selectedRoom.price)}</strong></p>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>2. TIỆN NGHI & CƠ SỞ VẬT CHẤT</h3>
                <div className="utilities-grid">
                  <ul>
                    <li>- Phòng tắm & NVS khép kín</li>
                    <li>- Điều hòa 2 chiều</li>
                    <li>- Giường tầng</li>
                    <li>- Bàn học dài kèm giá sách</li>
                  </ul>
                  <ul>
                    <li>- Máy giặt chung từng tầng</li>
                    <li>- Quạt trần & Hệ thống đèn LED</li>
                    <li>- Wifi 24/7</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)} disabled={registering}>
                HỦY BỎ
              </button>
              <button className="btn-submit" onClick={handleRegister} disabled={registering}>
                {registering ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomRegistration;
