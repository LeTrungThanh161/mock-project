import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 30 giây timeout
});

// Thêm interceptor để đính kèm token (nếu có Auth)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor bắt lỗi response để không cho Promise treo vĩnh viễn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Timeout: Backend không phản hồi sau 10 giây'));
    }
    if (error.response?.status === 401) {
      // Token hết hạn - xóa token và redirect về login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getStudentProfile = async () => {
  const response = await api.get('/students/profile');
  console.log(response.data);
  return response.data;
};

export const updateStudentProfile = async (data: { fullName: string; phoneNumber: string; className: string }) => {
  const response = await api.put('/students/profile', data);
  return response.data;
};

export const getAvailableRooms = async () => {
  const response = await api.get('/rooms/available');
  return response.data;
};

export const getBuildings = async () => {
  const response = await api.get('/buildings');
  return response.data;
};

export const registerRoom = async (roomId: number) => {
  const response = await api.post('/contracts/register', { roomId });
  return response.data;
};

export const getMyContracts = async () => {
  const response = await api.get('/contracts/my');
  return response.data;
};

export const renewMyContract = async (contractId: number) => {
  const response = await api.post(`/contracts/my/${contractId}/renew`);
  return response.data;
};

// ─── Admin Account Management ─────────────────────────────────────────────────

export const getStaffList = async () => {
  const response = await api.get('/admin/staff');
  return response.data;
};

export const createManager = async (data: {
  fullName: string; email: string; phoneNumber: string; password: string; buildingId: number | null;
}) => {
  const response = await api.post('/admin/staff', data);
  return response.data;
};

export const updateStaff = async (staffId: number, data: {
  fullName: string; phoneNumber: string; buildingId: number | null; status: string;
}) => {
  const response = await api.put(`/admin/staff/${staffId}`, data);
  return response.data;
};

export const getStudentList = async (page: number, size: number, search: string, className?: string, buildingName?: string, status?: string) => {
  const params: any = { page, size };
  if (search) params.search = search;
  if (className) params.className = className;
  if (buildingName) params.buildingName = buildingName;
  if (status) params.status = status;
  const response = await api.get('/admin/students', { params });
  return response.data;
};

export const resetStudentPassword = async (accountId: number) => {
  const response = await api.post(`/admin/students/${accountId}/reset-password`);
  return response.data;
};

export const toggleStudentStatus = async (accountId: number) => {
  const response = await api.post(`/admin/students/${accountId}/toggle-status`);
  return response.data;
};

// ─── Infrastructure Management ────────────────────────────────────────────────

export const createBuilding = async (data: { name: string; genderType: string; totalFloors: number }) => {
  const response = await api.post('/buildings', data);
  return response.data;
};

export const updateBuilding = async (id: number, data: { name: string; genderType: string; totalFloors: number }) => {
  const response = await api.put(`/buildings/${id}`, data);
  return response.data;
};

export const getAllRooms = async (buildingId?: number) => {
  const response = await api.get('/rooms', { params: buildingId ? { buildingId } : {} });
  return response.data;
};

export const createRoom = async (data: { buildingId: number; roomTypeId: number | null; roomNumber: string; maxCapacity: number; price: number; status: string }) => {
  const response = await api.post('/rooms', data);
  return response.data;
};

export const updateRoom = async (id: number, data: { buildingId: number; roomTypeId: number | null; roomNumber: string; maxCapacity: number; price: number; status: string }) => {
  const response = await api.put(`/rooms/${id}`, data);
  return response.data;
};

export const getFloorsByBuilding = async (buildingId: number) => {
  const response = await api.get('/rooms/floors', { params: { buildingId } });
  return response.data;
};

export const getAllRoomTypes = async () => {
  const response = await api.get('/room-types');
  return response.data;
};

export const createRoomType = async (data: { typeName: string; defaultCapacity: number; defaultPrice: number }) => {
  const response = await api.post('/room-types', data);
  return response.data;
};

export const updateRoomType = async (id: number, data: { typeName: string; defaultCapacity: number; defaultPrice: number }) => {
  const response = await api.put(`/room-types/${id}`, data);
  return response.data;
};

export default api;
