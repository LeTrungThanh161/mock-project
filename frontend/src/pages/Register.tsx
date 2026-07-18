import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

interface RegisterForm {
  fullName: string;
  studentCode: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: 'Male' | 'Female' | 'Other' | 'Mixed';
  className: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState<RegisterForm>({
    fullName: '',
    studentCode: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'Male',
    className: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        studentCode: form.studentCode,
        fullName: form.fullName,
        gender: form.gender,
        phoneNumber: form.phoneNumber,
        className: form.className,
      });

      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr?.response?.data?.message;
      setError(msg || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Header */}
        <div className="register-header">
          <h1 className="register-title">Tạo tài khoản mới</h1>
          <p className="register-subtitle">Vui lòng điền chính xác thông tin để đối chiếu hồ sơ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="register-form">
          {error   && <div className="register-error">{error}</div>}
          {success && <div className="register-success">✅ {success}</div>}

          <div className="register-grid">
            {/* Họ và tên */}
            <div className="register-field">
              <label htmlFor="fullName">Họ và tên</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={handleChange}
                required
                className="register-input"
              />
            </div>

            {/* MSSV */}
            <div className="register-field">
              <label htmlFor="studentCode">Mã số sinh viên (MSSV)</label>
              <input
                id="studentCode"
                name="studentCode"
                type="text"
                placeholder="20261234"
                value={form.studentCode}
                onChange={handleChange}
                required
                className="register-input"
              />
            </div>

            {/* Số điện thoại */}
            <div className="register-field">
              <label htmlFor="phoneNumber">Số điện thoại</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="0912345678"
                value={form.phoneNumber}
                onChange={handleChange}
                className="register-input"
              />
            </div>

            {/* Email */}
            <div className="register-field">
              <label htmlFor="email">Email sinh viên</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="a.nv26@student.edu"
                value={form.email}
                onChange={handleChange}
                required
                className="register-input"
              />
            </div>

            {/* Mật khẩu */}
            <div className="register-field">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="register-input"
              />
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="register-field">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="register-input"
              />
            </div>

            {/* Giới tính */}
            <div className="register-field">
              <label htmlFor="gender">Giới tính</label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="register-select"
              >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            {/* Lớp */}
            <div className="register-field">
              <label htmlFor="className">Lớp</label>
              <input
                id="className"
                name="className"
                type="text"
                placeholder="SE1601"
                value={form.className}
                onChange={handleChange}
                className="register-input"
              />
            </div>
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ TÀI KHOẢN'}
          </button>

          <p className="register-login-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
