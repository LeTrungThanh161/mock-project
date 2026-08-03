import React, { useEffect, useState } from 'react';
import { getMyContracts, renewMyContract } from '../services/api';
import './Contracts.css';

interface Contract {
    contractId: number;
    studentId: number;
    studentName: string;
    studentCode: string;
    roomId: number;
    roomNumber: string;
    buildingId: number;
    buildingName: string;
    roomTypeName: string;
    roomPrice: number;
    startDate: string;
    endDate: string;
    deposit: number;
    status: string;
}

export function Contracts() {
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const data = await getMyContracts();
                if (data && data.length > 0) {
                    const activeContract = data.find((c: Contract) => c.status === 'ACTIVE') || data[0];
                    setContract(activeContract);
                } else {
                    setContract(null);
                }
            } catch (err) {
                setError('Không thể tải dữ liệu hợp đồng.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchContract();
    }, []);

    const handleRenew = async () => {
        if (!contract) return;
        if (window.confirm('Bạn có chắc chắn muốn gia hạn hợp đồng thêm 6 tháng không?')) {
            try {
                setLoading(true);
                const newContract = await renewMyContract(contract.contractId);
                setContract(newContract);
                alert('Gia hạn hợp đồng thành công!');
            } catch (err: any) {
                console.error(err);
                alert('Có lỗi xảy ra khi gia hạn hợp đồng: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return <div className="contracts-container"><p>Đang tải dữ liệu...</p></div>;
    }

    if (error) {
        return <div className="contracts-container"><p className="text-danger">{error}</p></div>;
    }

    if (!contract) {
        return (
            <div className="contracts-container">
                <div className="contracts-header">
                    <h2>THÔNG TIN HỢP ĐỒNG HIỆN TẠI</h2>
                </div>
                <div className="contract-card">
                    <p style={{ textAlign: 'center', margin: '20px 0', fontSize: '16px', color: '#555' }}>Bạn không có hợp đồng nào đang hiệu lực.</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount: number) => {
        if (amount === null || amount === undefined) return '0đ';
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    return (
        <div className="contracts-container">
            <div className="contracts-header">
                <h2>THÔNG TIN HỢP ĐỒNG HIỆN TẠI</h2>
                <div className="status">
                    Trạng thái cư trú: <span className="status-active" style={{ color: contract.status === 'ACTIVE' ? '#10b981' : '#f59e0b' }}>
                        [ {contract.status === 'ACTIVE' ? 'ĐANG HIỆU LỰC' : contract.status} ]
                    </span>
                </div>
            </div>

            <div className="contract-card">
                <div className="grid md:grid-cols-2">
                    <div className="info-group">
                        <p>Mã hợp đồng: <strong>#HD-{contract.contractId}</strong></p>
                        <p>Ngày ký: <strong>{formatDate(contract.startDate)}</strong></p>
                    </div>
                    <div className="info-group">
                        <p>Phòng ở: <strong>Phòng {contract.roomNumber} - Tòa {contract.buildingName}</strong></p>
                        <p>Loại: <strong>{contract.roomTypeName || 'N/A'}</strong></p>
                    </div>
                </div>
                <hr className="divider" />
                <div className="grid md:grid-cols-2">
                    <div className="info-group">
                        <p>Ngày bắt đầu ở: <strong>{formatDate(contract.startDate)}</strong></p>
                        <p>Ngày hết hạn: <strong>{formatDate(contract.endDate)}</strong></p>
                    </div>
                    <div className="info-group">
                        <p>Tiền thuê phòng: <strong>{formatCurrency(contract.roomPrice)}</strong></p>
                        <p>Tiền đặt cọc: <strong>{formatCurrency(contract.deposit)} (Đã đóng)</strong></p>
                    </div>
                </div>
            </div>

            <p className="note">(*) Lưu ý: Để gia hạn hợp đồng cho kỳ học tiếp theo, vui lòng gửi yêu cầu trước ngày hết hạn 10 ngày.</p>

            <div className="actions">
                <button className="btn-outline-dark">YÊU CẦU TRẢ PHÒNG</button>
                <button className="btn-primary-blue" onClick={handleRenew}>ĐĂNG KÝ GIA HẠN HỢP ĐỒNG</button>
            </div>
        </div>
    );
}
