import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import './ForgotPassword.css';

type Step = 'EMAIL' | 'OTP' | 'PASSWORD' | 'SUCCESS';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Bước 1: Gửi email để nhận OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập email.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Gọi API kiểm tra xem email có tồn tại không
      const response = await api.post('/auth/check-email', { email });
      if (response.data === true) {
        // Sinh mã ngẫu nhiên 6 chữ số
        const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(mockOtp);
        setStep('OTP');
      } else {
        setError('Email không tồn tại trong hệ thống.');
      }
    } catch (err: any) {
      setError('Có lỗi xảy ra khi xác thực email.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác nhận OTP
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      setError('Mã xác nhận (OTP) không chính xác.');
      return;
    }
    setError('');
    setStep('PASSWORD');
  };

  // Bước 3: Đổi mật khẩu
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ mật khẩu mới và xác nhận mật khẩu.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Mật khẩu phải chứa ít nhất 8 ký tự.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Gọi API reset password thực sự ở backend
      await api.post('/auth/reset-password', {
        email: email,
        newPassword: newPassword,
      });

      setStep('SUCCESS');
    } catch (err: any) {
      setError(err?.response?.data || 'Có lỗi xảy ra khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        {step === 'EMAIL' && (
          <>
            <div className="forgot-password-icon-wrap">
              <Lock className="forgot-password-icon" />
            </div>

            <h1 className="forgot-password-title">QUÊN MẬT KHẨU?</h1>
            <p className="forgot-password-subtitle">
              Vui lòng nhập Email sinh viên đã đăng ký. Hệ thống sẽ gửi mã xác nhận (OTP) để đặt lại.
            </p>

            <form onSubmit={handleEmailSubmit} className="forgot-password-form">
              {error && <div className="forgot-password-error">{error}</div>}

              <div className="forgot-password-field">
                <label htmlFor="email">Email khôi phục</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Nhập email sinh viên của bạn......"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="forgot-password-input"
                />
              </div>

              <button type="submit" className="forgot-password-btn" disabled={loading}>
                {loading ? 'ĐANG GỬI...' : 'GỬI MÃ XÁC NHẬN'}
              </button>

              <Link to="/login" className="forgot-password-back">
                <ArrowLeft size={16} /> Quay lại Đăng nhập
              </Link>
            </form>
          </>
        )}

        {step === 'OTP' && (
          <>
            <div className="forgot-password-icon-wrap">
              <KeyRound className="forgot-password-icon" />
            </div>

            <h1 className="forgot-password-title">XÁC MINH OTP</h1>
            <p className="forgot-password-subtitle">
              Vui lòng nhập mã xác nhận (OTP) đã được gửi đến email của bạn.
            </p>

            {/* Hiển thị OTP ngay phía trên ô nhập theo yêu cầu để dễ test */}
            <div className="forgot-password-otp-display">
              Mã OTP khôi phục của bạn là: <strong>{generatedOtp}</strong>
            </div>

            <form onSubmit={handleOtpSubmit} className="forgot-password-form">
              {error && <div className="forgot-password-error">{error}</div>}

              <div className="forgot-password-field">
                <label htmlFor="otp">Mã xác nhận (OTP)</label>
                <input
                  id="otp"
                  type="text"
                  placeholder="Nhập mã OTP gồm 6 chữ số..."
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  autoFocus
                  className="forgot-password-input"
                  maxLength={6}
                />
              </div>

              <button type="submit" className="forgot-password-btn">
                XÁC NHẬN MÃ OTP
              </button>

              <button
                type="button"
                className="forgot-password-btn-secondary"
                onClick={() => setStep('EMAIL')}
              >
                Quay lại nhập Email
              </button>
            </form>
          </>
        )}

        {step === 'PASSWORD' && (
          <>
            <div className="forgot-password-icon-wrap">
              <Lock className="forgot-password-icon" />
            </div>

            <h1 className="forgot-password-title">MẬT KHẨU MỚI</h1>
            <p className="forgot-password-subtitle">
              Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>.
            </p>

            <form onSubmit={handlePasswordSubmit} className="forgot-password-form">
              {error && <div className="forgot-password-error">{error}</div>}

              <div className="forgot-password-field">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                  className="forgot-password-input"
                />
              </div>

              <div className="forgot-password-field">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Xác nhận lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="forgot-password-input"
                />
              </div>

              <button type="submit" className="forgot-password-btn" disabled={loading}>
                {loading ? 'ĐANG LƯU...' : 'LƯU MẬT KHẨU'}
              </button>
            </form>
          </>
        )}

        {step === 'SUCCESS' && (
          <div className="forgot-password-success-view">
            <div className="forgot-password-success-icon-wrap">
              <CheckCircle2 className="forgot-password-success-icon" size={48} />
            </div>
            <h1 className="forgot-password-title text-success">THÀNH CÔNG!</h1>
            <p className="forgot-password-subtitle">
              Mật khẩu của bạn đã được thay đổi thành công. Vui lòng đăng nhập lại bằng mật khẩu mới.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="forgot-password-btn"
              style={{ marginTop: '1rem' }}
            >
              ĐĂNG NHẬP NGAY
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
