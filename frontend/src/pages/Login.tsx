import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logoImg from '../assets/logo.jpg';
import './Login.css';
{/* Bỏ dòng dưới khi production */}
import DevLoginHint from '../components/DevRoleSwitcher';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Backend nhận { email, password }
      const res = await api.post('/auth/login', { email: username, password });
      const data = res.data;

      // role backend trả về dạng "Admin" | "Manager" | "Student" → uppercase
      const normalizedRole = (data.role as string).toUpperCase() as 'STUDENT' | 'ADMIN' | 'MANAGER';

      login({
        accountId: data.accountId ?? 0,   // backend có thể không trả, sẽ bổ sung sau
        username: data.email ?? username,
        fullName: data.fullName ?? '',
        role: normalizedRole,
        token: data.token,
      });

      // Điều hướng theo role
      if (normalizedRole === 'STUDENT') navigate('/profile');
      else navigate('/dashboard');
    } catch {
      setError('Tài khoản hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-wrap">
          <img src={logoImg} alt="Logo KTX" className="login-logo" />
        </div>

        {/* Tiêu đề */}
        <h1 className="login-title">HỆ THỐNG QUẢN LÝ KTX</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="login-field">
            <label htmlFor="username">Tài khoản</label>
            <input
              id="username"
              type="text"
              placeholder="Nhập email..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              className="login-input"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <div className="login-row">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="login-forgot">Quên mật khẩu?</a>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </button>

          <p className="login-register">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </form>
        {/* Bỏ dòng dưới khi production */}
        <DevLoginHint setUsername={setUsername} setPassword={setPassword} /> 
      </div>
    </div>
  );
};

export default Login;
