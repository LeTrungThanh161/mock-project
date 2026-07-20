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

export default api;

