-- Mock Data for 5 new screens
-- 1. Pricing Tiers
INSERT INTO PricingTier (utilityType, tierOrder, fromUnit, toUnit, unitPrice) VALUES
('Electric', 1, 0, 50, 1678),
('Electric', 2, 51, 100, 1734),
('Electric', 3, 101, 200, 2014),
('Water', 1, 0, 10, 5973),
('Water', 2, 11, 20, 7052);

-- 2. Technicians
INSERT INTO Technician (fullName, phone, specialization, status) VALUES
('Nguyễn Văn A', '0987654321', 'Điện', 'Sẵn Sàng'),
('Trần Hoàng B', '0912345678', 'Nước', 'Bận'),
('Lê Minh C', '0901223344', 'Net', 'Sẵn Sàng'),
('Phạm Văn D', '0977888999', 'Máy Móc', 'Bận'),
('Quách Thị E', '0933445566', 'Điện', 'Sẵn Sàng');

-- 3. Invoices (Simplified)
-- Assuming some staffId and roomId exist. You may need to adjust these IDs.
-- INSERT INTO Invoice (invoiceCode, roomId, billingMonth, totalAmount, dueDate, status) VALUES ...

-- 4. Issue Tickets (Simplified)
-- INSERT INTO IssueTicket (ticketCode, roomId, type, description, priority, status) VALUES ...

-- 5. Meter Readings (Simplified)
-- INSERT INTO MeterReading (roomId, readingDate, utilityType, oldValue, newValue, consumption, totalCost) VALUES ...
