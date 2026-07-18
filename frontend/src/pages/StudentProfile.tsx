import { useEffect, useState } from 'react';
import { getStudentProfile, updateStudentProfile } from '../services/api';
import './StudentProfile.css';

const StudentProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    className: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getStudentProfile();
        setProfile(data);
        setFormData({
          fullName: data?.fullName || '',
          phoneNumber: data?.phoneNumber || '',
          className: data?.className || ''
        });
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Không thể tải dữ liệu hồ sơ. Vui lòng thử lại sau.');
      }
    };
    fetchProfile();
  }, []);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      setShowConfirm(true);
    }
  };

  const confirmUpdate = async () => {
    setShowConfirm(false);
    setError('');
    setSuccessMsg('');
    try {
      const updatedProfile = await updateStudentProfile(formData);
      setSuccessMsg('Cập nhật thông tin thành công!');
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật thông tin.');
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: profile?.fullName || '',
      phoneNumber: profile?.phoneNumber || '',
      className: profile?.className || ''
    });
    setIsEditing(false);
    setError('');
    setSuccessMsg('');
  };


  const genderLabel = profile?.gender === 'Male' ? 'Nam' : profile?.gender === 'Female' ? 'Nữ' : profile?.gender === 'Mixed' ? 'Nam/Nữ' : 'Khác';

  return (
    <div className="profile-container animate-fade-in">

      <div className="profile-header">
        <h1>THÔNG TIN CÁ NHÂN</h1>
        <p>Vui lòng kiểm tra và cập nhật chính xác số điện thoại liên lạc.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="profile-form-wrapper">
        <div className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                name="fullName"
                value={isEditing ? formData.fullName : (profile?.fullName || '')}
                onChange={handleChange}
                className={isEditing ? "form-control-light editable" : "form-control-light read-only"}
                readOnly={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Giới tính:</label>
              <input
                type="text"
                value={genderLabel}
                className="form-control-light read-only"
                readOnly
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mã số sinh viên (MSSV)</label>
              <input
                type="text"
                value={profile?.studentCode || ''}
                className="form-control-light read-only"
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="phoneNumber"
                value={isEditing ? formData.phoneNumber : (profile?.phoneNumber || '')}
                onChange={handleChange}
                className={isEditing ? "form-control-light editable" : "form-control-light read-only"}
                readOnly={!isEditing}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email sinh viên</label>
              <input
                type="text"
                value={profile?.email || 'student@domain.edu'}
                className="form-control-light read-only"
                readOnly
              />
            </div>
          </div>

          {isEditing && (
            <div className="form-row">
              <div className="form-group">
                <label>Lớp sinh hoạt</label>
                <input
                  type="text"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  className="form-control-light editable"
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            {isEditing && (
              <button type="button" className="btn-cancel-simple" onClick={handleCancelEdit}>
                HỦY
              </button>
            )}
            <button type="button" className="btn-update" onClick={handleUpdateClick}>
              {isEditing ? 'CẬP NHẬT' : 'CẬP NHẬT THÔNG TIN'}
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h3>Xác nhận cập nhật</h3>
            <p>Bạn có chắc chắn muốn lưu các thay đổi này không?</p>
            <div className="confirm-modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowConfirm(false)}>Hủy</button>
              <button className="btn-modal-confirm" onClick={confirmUpdate}>Đồng ý</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;

