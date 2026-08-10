/**
 * DevLoginHint: Chỉ dùng trong DEV — hiển thị các nút điền nhanh thông tin đăng nhập
 * Đặt trong trang Login, xóa khi deploy production
 */
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  setUsername: (v: string) => void;
  setPassword: (v: string) => void;
}

const MOCK_ACCOUNTS: { label: string; email: string; password: string; role: UserRole }[] = [
  { label: '🎓 Student',       email: 'student@test.com',  password: '123456', role: 'STUDENT'  },
  { label: '🏢 Manager',       email: 'manager@test.com',  password: '123456', role: 'MANAGER'  },
  { label: '⚙️ Admin',         email: 'admin@test.com',    password: '123456', role: 'ADMIN'    },
];

/**
 * Khi chưa có backend, dùng nút này để bypass login và vào thẳng app
 */
const DevLoginHint = ({ setUsername, setPassword }: Props) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const mockLogin = (acc: typeof MOCK_ACCOUNTS[0]) => {
    login({
      accountId: 1,
      username: acc.email,
      fullName: acc.role === 'STUDENT' ? 'Nguyễn Văn A' : acc.role === 'MANAGER' ? 'Trần Thị B' : 'Lê Văn C',
      role: acc.role,
      token: 'dev-mock-token',
    });
    if (acc.role === 'STUDENT') navigate('/profile');
    else navigate('/dashboard');
  };

  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '0.75rem 1rem',
      background: '#f0f9ff',
      border: '1px dashed #93c5fd',
      borderRadius: '6px',
    }}>
      <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>
        🛠 DEV — Đăng nhập nhanh (bỏ khi production)
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {MOCK_ACCOUNTS.map(acc => (
          <button
            key={acc.role}
            type="button"
            onClick={() => mockLogin(acc)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #93c5fd',
              background: '#dbeafe',
              color: '#1e40af',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {acc.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => { setUsername(''); setPassword(''); }}
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid #fca5a5',
            background: '#fee2e2',
            color: '#991b1b',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          ✕ Xóa form
        </button>
      </div>
    </div>
  );
};

export default DevLoginHint;
