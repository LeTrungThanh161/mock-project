import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getBuildings, createBuilding, updateBuilding,
  getAllRooms, createRoom, updateRoom, getFloorsByBuilding,
  getAllRoomTypes, createRoomType, updateRoomType
} from '../services/api';
import './Infrastructure.css';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Building {
  buildingId: number;
  name: string;
  genderType: string;
  totalFloors: number;
  totalRooms: number;
  managerName: string | null;
}

interface RoomType {
  roomTypeId: number;
  typeName: string;
  defaultCapacity: number;
  defaultPrice: number;
}

interface Room {
  roomId: number;
  buildingId: number;
  buildingName: string;
  roomTypeId: number;
  roomTypeName: string;
  roomNumber: string;
  floorNumber: number;
  maxCapacity: number;
  currentOccupancy: number;
  price: number;
  status: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Infrastructure() {
  const [activeTab, setActiveTab] = useState<'buildings' | 'rooms' | 'roomTypes'>('buildings');
  const [loading, setLoading] = useState(false);

  // ── Data states ──
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [floors, setFloors] = useState<number[]>([]);

  // ── Filter states ──
  const [buildingFilterGender, setBuildingFilterGender] = useState(''); // '', 'Male', 'Female', 'Mixed'
  const [roomFilterBuildingId, setRoomFilterBuildingId] = useState<number | ''>('');
  const [roomFilterFloor, setRoomFilterFloor] = useState<number | ''>('');
  const [roomFilterOccupancy, setRoomFilterOccupancy] = useState('');

  // ── Modal states ──
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);

  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);

  // ── Form states ──
  const [buildingForm, setBuildingForm] = useState({ name: '', genderType: 'Male', totalFloors: '' });
  const [roomForm, setRoomForm] = useState({ buildingId: '', roomTypeId: '', roomNumber: '', maxCapacity: '', price: '', status: 'Available' });
  const [roomTypeForm, setRoomTypeForm] = useState({ typeName: '', defaultCapacity: '', defaultPrice: '' });

  // ─── Data Fetching ─────────────────────────────────────────────────────────

  const fetchBuildings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBuildings();
      setBuildings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoomTypes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllRoomTypes();
      setRoomTypes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRooms = useCallback(async (bId?: number, fNum?: number) => {
    setLoading(true);
    try {
      const data = await getAllRooms(bId, fNum);
      setRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFloors = useCallback(async (bId: number) => {
    try {
      const data = await getFloorsByBuilding(bId);
      setFloors(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ─── Initial Load & Tab Change ─────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'buildings') {
      fetchBuildings();
    } else if (activeTab === 'rooms') {
      fetchBuildings(); // Cần danh sách tòa để filter và form
      fetchRoomTypes(); // Cần loại phòng cho form
      fetchRooms(
        roomFilterBuildingId ? Number(roomFilterBuildingId) : undefined,
        roomFilterFloor !== '' ? Number(roomFilterFloor) : undefined
      );
      if (roomFilterBuildingId) {
        fetchFloors(Number(roomFilterBuildingId));
      } else {
        setFloors([]);
      }
    } else if (activeTab === 'roomTypes') {
      fetchRoomTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Handle building and floor filter change for rooms
  useEffect(() => {
    if (activeTab === 'rooms') {
      fetchRooms(
        roomFilterBuildingId ? Number(roomFilterBuildingId) : undefined,
        roomFilterFloor !== '' ? Number(roomFilterFloor) : undefined
      );
    }
  }, [roomFilterBuildingId, roomFilterFloor, fetchRooms, activeTab]);

  // Fetch floors when building changes
  useEffect(() => {
    if (activeTab === 'rooms') {
      if (roomFilterBuildingId) {
        fetchFloors(Number(roomFilterBuildingId));
      } else {
        setFloors([]);
      }
    }
  }, [roomFilterBuildingId, fetchFloors, activeTab]);

  // ─── Format Utils ────────────────────────────────────────────────────────

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  };

  const translateGender = (gender: string) => {
    if (gender === 'Male') return 'Nam';
    if (gender === 'Female') return 'Nữ';
    return gender;
  };

  const translateRoomStatus = (status: string) => {
    if (status === 'Available') return 'Sẵn sàng';
    if (status === 'Full') return 'Đã đầy';
    if (status === 'UnderMaintenance') return 'Đang bảo trì';
    return status;
  };

  // ─── Handlers: Buildings ───────────────────────────────────────────────────

  const handleOpenBuildingModal = (b?: Building) => {
    if (b) {
      setEditingBuilding(b);
      setBuildingForm({ name: b.name, genderType: b.genderType, totalFloors: String(b.totalFloors) });
    } else {
      setEditingBuilding(null);
      setBuildingForm({ name: '', genderType: 'Male', totalFloors: '' });
    }
    setShowBuildingModal(true);
  };

  const handleSaveBuilding = async () => {
    if (!buildingForm.name || !buildingForm.totalFloors) {
      alert('Vui lòng nhập Tên tòa nhà và Số tầng');
      return;
    }
    const payload = {
      name: buildingForm.name,
      genderType: buildingForm.genderType,
      totalFloors: Number(buildingForm.totalFloors)
    };

    setLoading(true);
    try {
      if (editingBuilding) {
        await updateBuilding(editingBuilding.buildingId, payload);
        alert('Cập nhật thành công');
      } else {
        await createBuilding(payload);
        alert('Thêm tòa nhà thành công');
      }
      setShowBuildingModal(false);
      fetchBuildings();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredBuildings = useMemo(() => {
    if (!buildingFilterGender) return buildings;
    return buildings.filter(b => b.genderType === buildingFilterGender);
  }, [buildings, buildingFilterGender]);

  // ─── Handlers: Room Types ──────────────────────────────────────────────────

  const handleOpenRoomTypeModal = (rt?: RoomType) => {
    if (rt) {
      setEditingRoomType(rt);
      setRoomTypeForm({
        typeName: rt.typeName,
        defaultCapacity: String(rt.defaultCapacity),
        defaultPrice: String(rt.defaultPrice)
      });
    } else {
      setEditingRoomType(null);
      setRoomTypeForm({ typeName: '', defaultCapacity: '', defaultPrice: '' });
    }
    setShowRoomTypeModal(true);
  };

  const handleSaveRoomType = async () => {
    if (!roomTypeForm.typeName || !roomTypeForm.defaultCapacity || !roomTypeForm.defaultPrice) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    const payload = {
      typeName: roomTypeForm.typeName,
      defaultCapacity: Number(roomTypeForm.defaultCapacity),
      defaultPrice: Number(roomTypeForm.defaultPrice)
    };

    setLoading(true);
    try {
      if (editingRoomType) {
        await updateRoomType(editingRoomType.roomTypeId, payload);
        alert('Cập nhật thành công');
      } else {
        await createRoomType(payload);
        alert('Thêm loại phòng thành công');
      }
      setShowRoomTypeModal(false);
      fetchRoomTypes();
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ─── Handlers: Rooms ───────────────────────────────────────────────────────

  const handleOpenRoomModal = (r?: Room) => {
    if (r) {
      setEditingRoom(r);
      setRoomForm({
        buildingId: String(r.buildingId),
        roomTypeId: String(r.roomTypeId || ''),
        roomNumber: r.roomNumber,
        maxCapacity: String(r.maxCapacity),
        price: String(r.price),
        status: r.status
      });
    } else {
      setEditingRoom(null);
      setRoomForm({
        buildingId: roomFilterBuildingId ? String(roomFilterBuildingId) : (buildings.length > 0 ? String(buildings[0].buildingId) : ''),
        roomTypeId: roomTypes.length > 0 ? String(roomTypes[0].roomTypeId) : '',
        roomNumber: '',
        maxCapacity: '',
        price: '',
        status: 'Available'
      });
    }
    setShowRoomModal(true);
  };

  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const rt = roomTypes.find(x => x.roomTypeId === Number(val));
    if (rt) {
      setRoomForm(prev => ({
        ...prev,
        roomTypeId: val,
        maxCapacity: String(rt.defaultCapacity),
        price: String(rt.defaultPrice)
      }));
    } else {
      setRoomForm(prev => ({ ...prev, roomTypeId: val }));
    }
  };

  const handleSaveRoom = async () => {
    if (!roomForm.buildingId || !roomForm.roomNumber || !roomForm.maxCapacity) {
      alert('Vui lòng nhập đầy đủ Số phòng và Sức chứa');
      return;
    }
    const payload = {
      buildingId: Number(roomForm.buildingId),
      roomTypeId: roomForm.roomTypeId ? Number(roomForm.roomTypeId) : null,
      roomNumber: roomForm.roomNumber,
      maxCapacity: Number(roomForm.maxCapacity),
      price: Number(roomForm.price || 0),
      status: roomForm.status
    };

    setLoading(true);
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.roomId, payload);
        alert('Cập nhật thành công');
      } else {
        await createRoom(payload);
        alert('Thêm phòng thành công');
      }
      setShowRoomModal(false);
      fetchRooms(roomFilterBuildingId ? Number(roomFilterBuildingId) : undefined);
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMaintenance = async (r: Room) => {
    const newStatus = r.status === 'UnderMaintenance' ? 'Available' : 'UnderMaintenance';
    const actionName = newStatus === 'UnderMaintenance' ? 'đánh dấu bảo trì' : 'mở hoạt động';
    if (!window.confirm(`Bạn có chắc muốn ${actionName} phòng ${r.roomNumber}?`)) return;

    setLoading(true);
    try {
      await updateRoom(r.roomId, {
        buildingId: r.buildingId,
        roomTypeId: r.roomTypeId,
        roomNumber: r.roomNumber,
        maxCapacity: r.maxCapacity,
        price: r.price,
        status: newStatus
      });
      fetchRooms(roomFilterBuildingId ? Number(roomFilterBuildingId) : undefined);
    } catch (err: any) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    let result = rooms;
    if (roomFilterOccupancy === 'full') {
      result = result.filter(r => r.currentOccupancy >= r.maxCapacity);
    } else if (roomFilterOccupancy === 'available') {
      result = result.filter(r => r.currentOccupancy < r.maxCapacity);
    }
    return result;
  }, [rooms, roomFilterOccupancy]);

  // ─── Renders ─────────────────────────────────────────────────────────────

  return (
    <div className="infra-container">
      <h2>QUẢN LÝ CƠ SỞ HẠ TẦNG</h2>
      <div className="infra-subtitle">
        Thiết lập cấu hình vật lý KTX: Quản lý Tòa nhà, Sơ đồ Phòng và Danh mục Loại phòng.
      </div>

      <div className="infra-tabs-container">
        <div className="infra-tabs">
          <button className={`infra-tab ${activeTab === 'buildings' ? 'active' : ''}`} onClick={() => setActiveTab('buildings')}>
            DANH SÁCH TÒA NHÀ
          </button>
          <button className={`infra-tab ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
            SƠ ĐỒ & QUẢN LÝ PHÒNG
          </button>
          <button className={`infra-tab ${activeTab === 'roomTypes' ? 'active' : ''}`} onClick={() => setActiveTab('roomTypes')}>
            DANH MỤC LOẠI PHÒNG
          </button>
        </div>
      </div>

      {/* ── Tab: Buildings ────────────────────────────────────────────────── */}
      {activeTab === 'buildings' && (
        <>
          <div className="section-header">DANH SÁCH TÒA NHÀ TRONG HỆ THỐNG</div>
          <div className="infra-filters">
            <div className="infra-filter-group">
              <label>Lọc giới tính:</label>
              <select value={buildingFilterGender} onChange={e => setBuildingFilterGender(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
              </select>
            </div>
            <div className="infra-spacer" />
            <button className="btn-add" onClick={() => handleOpenBuildingModal()}>+ THÊM TÒA NHÀ MỚI</button>
          </div>

          <table className="infra-table">
            <thead>
              <tr>
                <th>Mã Tòa</th>
                <th>Tên Tòa nhà</th>
                <th>Số tầng</th>
                <th>Dành cho</th>
                <th>Tổng số phòng</th>
                <th>Quản lý phụ trách (Manager)</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="infra-loading">Đang tải...</td></tr>
              ) : filteredBuildings.length === 0 ? (
                <tr><td colSpan={7} className="infra-loading">Không có dữ liệu</td></tr>
              ) : filteredBuildings.map(b => (
                <tr key={b.buildingId}>
                  <td>{b.buildingId}</td>
                  <td>{b.name}</td>
                  <td>{b.totalFloors} tầng</td>
                  <td>{translateGender(b.genderType)}</td>
                  <td>{b.totalRooms} phòng</td>
                  <td>{b.managerName || '—'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleOpenBuildingModal(b)}>✏️ Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Tab: Rooms ────────────────────────────────────────────────────── */}
      {activeTab === 'rooms' && (
        <>
          <div className="section-header">SƠ ĐỒ & QUẢN LÝ PHÒNG HẠ TẦNG</div>
          <div className="infra-filters">
            <div className="infra-filter-group">
              <label>Chọn Tòa nhà:</label>
              <select value={roomFilterBuildingId} onChange={e => {
                setRoomFilterBuildingId(e.target.value ? Number(e.target.value) : '');
                setRoomFilterFloor('');
              }}>
                <option value="">Tất cả</option>
                {buildings.map(b => (
                  <option key={b.buildingId} value={b.buildingId}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="infra-filter-group">
              <label>Tình trạng:</label>
              <select value={roomFilterOccupancy} onChange={e => setRoomFilterOccupancy(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="full">Đã đầy</option>
                <option value="available">Chưa đầy</option>
              </select>
            </div>
            <div className="infra-spacer" />
            <button className="btn-add" onClick={() => handleOpenRoomModal()}>+ TẠO PHÒNG MỚI</button>
          </div>

          <table className="infra-table">
            <thead>
              <tr>
                <th>Số phòng</th>
                <th>Tòa nhà</th>
                <th>Tầng</th>
                <th>Loại phòng</th>
                <th>Số người ở</th>
                <th>Trạng thái kỹ thuật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="infra-loading">Đang tải...</td></tr>
              ) : filteredRooms.length === 0 ? (
                <tr><td colSpan={7} className="infra-loading">Không có dữ liệu</td></tr>
              ) : filteredRooms.map(r => {
                const isFull = r.currentOccupancy >= r.maxCapacity;
                return (
                  <tr key={r.roomId}>
                    <td>{r.roomNumber}</td>
                    <td>{r.buildingName}</td>
                    <td>Tầng {r.floorNumber}</td>
                    <td>{r.roomTypeName || '—'}</td>
                    <td>
                      <span className={isFull ? 'occupancy-full' : 'occupancy-available'}>
                        {r.currentOccupancy}/{r.maxCapacity}
                      </span>
                    </td>
                    <td className={
                      r.status === 'UnderMaintenance' ? 'status-maintenance' :
                        r.status === 'Available' ? 'status-available' : 'status-full'
                    }>
                      {translateRoomStatus(r.status)}
                    </td>
                    <td>
                      <div className="infra-action-buttons">
                        <button className="btn-edit" onClick={() => handleOpenRoomModal(r)}>✏️ Sửa</button>
                        {r.status === 'UnderMaintenance' ? (
                          <button className="btn-activate" onClick={() => handleToggleMaintenance(r)}>🟢 Mở hoạt động</button>
                        ) : (
                          <button className="btn-maintenance" onClick={() => handleToggleMaintenance(r)}>🔧 Đánh dấu Bảo trì</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}


      {/* ── Tab: Room Types ───────────────────────────────────────────────── */}
      {activeTab === 'roomTypes' && (
        <>
          <div className="section-header">DANH MỤC LOẠI PHÒNG & ĐƠN GIÁ CHUẨN</div>
          <div className="infra-filters">
            <div className="infra-spacer" />
            <button className="btn-add" onClick={() => handleOpenRoomTypeModal()}>+ THÊM LOẠI PHÒNG MỚI</button>
          </div>

          <table className="infra-table">
            <thead>
              <tr>
                <th>Mã loại</th>
                <th>Tên loại phòng</th>
                <th>Sức chứa mặc định</th>
                <th>Giá thuê / Giường / Tháng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="infra-loading">Đang tải...</td></tr>
              ) : roomTypes.length === 0 ? (
                <tr><td colSpan={5} className="infra-loading">Không có dữ liệu</td></tr>
              ) : roomTypes.map(rt => (
                <tr key={rt.roomTypeId}>
                  <td>RT-{rt.roomTypeId.toString().padStart(2, '0')}</td>
                  <td>{rt.typeName}</td>
                  <td>{rt.defaultCapacity} giường</td>
                  <td className="price-cell">{formatPrice(rt.defaultPrice)}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleOpenRoomTypeModal(rt)}>✏️ Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Modal: Building ───────────────────────────────────────────────── */}
      {showBuildingModal && (
        <div className="infra-modal-backdrop">
          <div className="infra-modal">
            <div className="infra-modal-header">
              <h3>{editingBuilding ? 'CẬP NHẬT TÒA NHÀ' : 'THÊM TÒA NHÀ MỚI'}</h3>
              <button className="infra-close-btn" onClick={() => setShowBuildingModal(false)}>✕</button>
            </div>
            <div className="infra-modal-body">
              {editingBuilding && (
                <div className="infra-form-group">
                  <label>Mã Tòa nhà (*):</label>
                  <input type="text" value={editingBuilding.buildingId} disabled style={{ background: '#f1f5f9' }} />
                </div>
              )}
              <div className="infra-form-group">
                <label>Tên Tòa nhà (*):</label>
                <input type="text" value={buildingForm.name} onChange={e => setBuildingForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="infra-form-group">
                <label>Số tầng (*):</label>
                <input type="number" value={buildingForm.totalFloors} onChange={e => setBuildingForm(f => ({ ...f, totalFloors: e.target.value }))} />
              </div>
              <div className="infra-form-group">
                <label>Đối tượng áp dụng (*):</label>
                <div className="infra-radio-group">
                  <label><input type="radio" checked={buildingForm.genderType === 'Male'} onChange={() => setBuildingForm(f => ({ ...f, genderType: 'Male' }))} /> Nam</label>
                  <label><input type="radio" checked={buildingForm.genderType === 'Female'} onChange={() => setBuildingForm(f => ({ ...f, genderType: 'Female' }))} /> Nữ</label>
                </div>
              </div>
            </div>
            <div className="infra-modal-footer">
              <button className="infra-btn-cancel" onClick={() => setShowBuildingModal(false)} disabled={loading}>HỦY BỎ</button>
              <button className="infra-btn-save" onClick={handleSaveBuilding} disabled={loading}>{loading ? 'Đang lưu...' : 'LƯU TÒA NHÀ'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Room Type ──────────────────────────────────────────────── */}
      {showRoomTypeModal && (
        <div className="infra-modal-backdrop">
          <div className="infra-modal">
            <div className="infra-modal-header">
              <h3>{editingRoomType ? 'CẬP NHẬT LOẠI PHÒNG' : 'THÊM LOẠI PHÒNG MỚI'}</h3>
              <button className="infra-close-btn" onClick={() => setShowRoomTypeModal(false)}>✕</button>
            </div>
            <div className="infra-modal-body">
              <div className="infra-form-group">
                <label>Tên loại phòng (*):</label>
                <input type="text" value={roomTypeForm.typeName} onChange={e => setRoomTypeForm(f => ({ ...f, typeName: e.target.value }))} />
              </div>
              <div className="infra-form-group">
                <label>Sức chứa (số giường) (*):</label>
                <input type="number" value={roomTypeForm.defaultCapacity} onChange={e => setRoomTypeForm(f => ({ ...f, defaultCapacity: e.target.value }))} />
              </div>
              <div className="infra-form-group">
                <label>Giá thuê mặc định (VNĐ) (*):</label>
                <input type="number" value={roomTypeForm.defaultPrice} onChange={e => setRoomTypeForm(f => ({ ...f, defaultPrice: e.target.value }))} />
              </div>
            </div>
            <div className="infra-modal-footer">
              <button className="infra-btn-cancel" onClick={() => setShowRoomTypeModal(false)} disabled={loading}>HỦY BỎ</button>
              <button className="infra-btn-save" onClick={handleSaveRoomType} disabled={loading}>{loading ? 'Đang lưu...' : 'LƯU LOẠI PHÒNG'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Room ───────────────────────────────────────────────────── */}
      {showRoomModal && (
        <div className="infra-modal-backdrop">
          <div className="infra-modal">
            <div className="infra-modal-header">
              <h3>{editingRoom ? 'CẬP NHẬT PHÒNG' : 'TẠO PHÒNG MỚI'}</h3>
              <button className="infra-close-btn" onClick={() => setShowRoomModal(false)}>✕</button>
            </div>
            <div className="infra-modal-body">
              <div className="infra-form-group">
                <label>Thuộc Tòa nhà (*):</label>
                <select value={roomForm.buildingId} onChange={e => setRoomForm(f => ({ ...f, buildingId: e.target.value }))}>
                  <option value="">-- Chọn tòa nhà --</option>
                  {buildings.map(b => (
                    <option key={b.buildingId} value={b.buildingId}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="infra-form-group">
                <label>Loại phòng:</label>
                <select value={roomForm.roomTypeId} onChange={handleRoomTypeChange}>
                  <option value="">-- Tùy chỉnh (Không dùng loại phòng) --</option>
                  {roomTypes.map(rt => (
                    <option key={rt.roomTypeId} value={rt.roomTypeId}>{rt.typeName}</option>
                  ))}
                </select>
              </div>
              <div className="infra-form-group">
                <label>Số phòng (*):</label>
                <input type="text" value={roomForm.roomNumber} onChange={e => setRoomForm(f => ({ ...f, roomNumber: e.target.value }))} placeholder="VD: 101, B205..." />
              </div>
              <div className="infra-form-group">
                <label>Sức chứa tối đa (*):</label>
                <input type="number" value={roomForm.maxCapacity} onChange={e => setRoomForm(f => ({ ...f, maxCapacity: e.target.value }))} />
              </div>
              {editingRoom && (
                <div className="infra-form-group">
                  <label>Trạng thái (*):</label>
                  <select value={roomForm.status} onChange={e => setRoomForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="Available">Sẵn sàng (Available)</option>
                    <option value="Full">Đã đầy (Full)</option>
                    <option value="UnderMaintenance">Bảo trì (UnderMaintenance)</option>
                  </select>
                </div>
              )}
            </div>
            <div className="infra-modal-footer">
              <button className="infra-btn-cancel" onClick={() => setShowRoomModal(false)} disabled={loading}>HỦY BỎ</button>
              <button className="infra-btn-save" onClick={handleSaveRoom} disabled={loading}>{loading ? 'Đang lưu...' : 'LƯU PHÒNG'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
