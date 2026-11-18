# WBS: Chuyển đổi số HTX Chăn nuôi (Agri-ERP)

## Epic 1: Database, Infrastructure & Core Setup

### Feature 1.1: Database Schema & Migration

Use Case 1.1.1: Khởi tạo cơ sở hạ tầng Docker & CSDL cốt lõi

Mô tả: Thiết lập môi trường chạy các dịch vụ database nền tảng (PostgreSQL, MongoDB, Redis).Dependencies: None

Database/DevOps Tasks:

[ ] Viết file docker-compose.yml để khởi chạy PostgreSQL, MongoDB và Redis (path: docker-compose.yml).

[ ] Tạo schema migration file cho bảng Farmers gồm farmer_id, name, farm_location, capacity, join_date (path:db/migrations/01_create_farmers_table.sql).

[ ] Tạo schema migration file cho bảng Livestock_Batches gồm batch_id, farmer_id, breed_type, import_date,initial_quantity, current_quantity, status (path: db/migrations/02_create_livestock_batches_table.sql).

[ ] Tạo schema migration file cho bảng Health_Records gồm record_id, batch_id, vet_id, disease_name,treatment_plan, medicines_used, date (path: db/migrations/03_create_health_records_table.sql).

[ ] Tạo schema migration file cho bảng Inventory_Transactions gồm trans_id, farmer_id, item_id, quantity, type,date (path: db/migrations/04_create_inventory_transactions_table.sql).

[ ] Tạo schema migration file cho bảng Contracts_Orders gồm order_id, buyer_id, batch_ids, total_weight,unit_price, total_amount, status (path: db/migrations/05_create_contracts_orders_table.sql).

## Epic 2: User & Farm Management

### Feature 2.1: Quản lý thành viên & Hộ chăn nuôi

Use Case 2.1.1: Đăng ký và định danh (KYC) hộ chăn nuôi

Mô tả: Đăng ký tài khoản mới cho nông dân và thiết lập thông tin chuồng trại ban đầu.Dependencies: Epic 1

Backend Tasks (NestJS):

[ ] Tạo DTO cho Farmer Registration request/response (path: src/modules/farmer/dto/create-farmer.dto.ts).

[ ] Cấu hình Controller tạo API Endpoint POST /api/v1/farmers/register (path:src/modules/farmer/farmer.controller.ts).

[ ] Viết Service logic mã hóa mật khẩu, lưu thông tin Farmer vào PostgreSQL (path:src/modules/farmer/farmer.service.ts).

Frontend Tasks (Web - ReactJS):

[ ] Tạo UI Component Form đăng ký tài khoản (path: src/components/Farmer/RegistrationForm.tsx).

[ ] Viết service API layer gọi POST /api/v1/farmers/register (path: src/services/farmerService.ts).

[ ] Xử lý form validation và hiển thị thông báo thành công/thất bại (path: src/pages/RegisterPage.tsx).

## Epic 3: Livestock Management

### Feature 3.1: Quản lý đàn & giống

Use Case 3.1.1: Khai báo nhập đàn mới

Mô tả: Ghi nhận thông tin lô giống mới, gán mã tag RFID cho các cá thể trong đàn.Dependencies: Epic 1, Epic 2

Backend Tasks:

[ ] Tạo DTO cho Batch Creation request/response (path: src/modules/livestock/dto/create-batch.dto.ts).

[ ] Cấu hình Controller tạo API Endpoint POST /api/v1/livestock/batches (path:src/modules/livestock/livestock.controller.ts).

[ ] Viết Service logic tính toán tổng số lượng, lưu trữ lịch sử di truyền giống (path:src/modules/livestock/livestock.service.ts).

Frontend Tasks (Mobile - Flutter):

[ ] Tạo UI Screen Form khai báo nhập đàn có hỗ trợ quét mã tag (path: lib/screens/livestock/add_batch_screen.dart).

[ ] Viết API client gọi POST /api/v1/livestock/batches (path: lib/services/api/livestock_api.dart).

[ ] Tích hợp logic lưu trữ SQLite local cho chế độ Offline Mode khi không có mạng (path:lib/services/local/db_helper.dart).

[ ] Viết logic Background Sync để đồng bộ dữ liệu nhập đàn lên Server khi có 3G/Wifi (path:lib/services/sync/background_sync.dart).

### Feature 3.2: Cập nhật tăng trưởng

Use Case 3.2.1: Ghi nhận chỉ số sinh trưởng định kỳ

Mô tả: Cập nhật cân nặng, kích thước định kỳ và so sánh với chuẩn.Dependencies: Use Case 3.1.1

Backend Tasks:

[ ] Tạo DTO cho Growth Metric Update (path: src/modules/livestock/dto/update-growth.dto.ts).

[ ] Cấu hình API Endpoint POST /api/v1/livestock/batches/:id/growth (path:src/modules/livestock/livestock.controller.ts).

[ ] Viết Service logic lưu dữ liệu MongoDB (log sinh trưởng) và kích hoạt Event cảnh báo chậm lớn (path:src/modules/livestock/growth.service.ts).

Frontend Tasks (Mobile - Flutter):

[ ] Tạo màn hình nhập liệu chỉ số sinh trưởng (path: lib/screens/livestock/growth_update_screen.dart).

[ ] Cập nhật SQLite local cho log sinh trưởng và cấu hình queue để sync (path: lib/services/local/growth_dao.dart).

## Epic 4: Inventory Management

### Feature 4.1: Quản lý kho vật tư

Use Case 4.1.1: Nhập và xuất thức ăn/thuốc

Mô tả: Quản lý giao dịch kho vật tư hàng ngày cho từng hộ chăn nuôi.Dependencies: Epic 1

Backend Tasks:

[ ] Tạo DTO cho Inventory Transaction (path: src/modules/inventory/dto/create-transaction.dto.ts).

[ ] Cấu hình API Endpoint POST /api/v1/inventory/transactions (path: src/modules/inventory/inventory.controller.ts).

[ ] Viết Service logic tính toán tồn kho, trigger cảnh báo hết hạn/hết hàng (path:src/modules/inventory/inventory.service.ts).

Frontend Tasks (Web - ReactJS):

[ ] Tạo Data Table hiển thị lịch sử nhập xuất vật tư (path: src/components/Inventory/TransactionTable.tsx).

[ ] Tạo Modal Form thực hiện giao dịch nhập/xuất (path: src/components/Inventory/TransactionModal.tsx).

[ ] Viết hàm gọi API và quản lý state bằng Redux/Zustand (path: src/store/inventoryStore.ts).

## Epic 5: Health & Vet

### Feature 5.1: Quản lý y tế & Tiêm phòng

Use Case 5.1.1: Lập lịch và chẩn đoán bệnh án

Mô tả: Bác sĩ thú y ghi chép bệnh án và tự động nhắc nhở lịch tiêm qua Zalo ZNS.Dependencies: Epic 3, Epic 4

Backend Tasks:

[ ] Tạo DTO cho Health Record (path: src/modules/health/dto/create-health-record.dto.ts).

[ ] Cấu hình API Endpoint POST /api/v1/health/records (path: src/modules/health/health.controller.ts).

[ ] Viết Service logic lưu hồ sơ y tế, trừ kho vật tư (thuốc) nếu có (path: src/modules/health/health.service.ts).

[ ] Tích hợp Zalo ZNS API để gửi tin nhắn nhắc nhở lịch tiêm tự động (path: src/shared/zalo/zalo.service.ts).

Frontend Tasks (Mobile - Flutter):

[ ] Tạo giao diện ghi chép triệu chứng/bệnh án dành cho thú y (path: lib/screens/vet/health_record_screen.dart).

[ ] Hiển thị danh sách thông báo lịch tiêm phòng sắp tới (path: lib/screens/vet/schedule_screen.dart).

## Epic 6: Supply Chain & Traceability

### Feature 6.1: Truy xuất nguồn gốc (QR Code)

Use Case 6.1.1: Tạo và tra cứu thông tin chuỗi hành trình

Mô tả: Tự động sinh mã QR lưu trữ Immutable Log của vật nuôi.Dependencies: Epic 3, Epic 5

Backend Tasks (Golang/NestJS):

[ ] Xây dựng luồng hash dữ liệu (vòng đời vật nuôi) để lưu thành Immutable Log (path:src/modules/traceability/traceability.service.ts).

[ ] Cấu hình API Endpoint GET /api/v1/traceability/qr/:batchId trả về thông tin tra cứu (path:src/modules/traceability/traceability.controller.ts).

[ ] Tích hợp logic caching bằng Redis để tăng tốc độ phản hồi khi lượng quét QR tăng vọt (path:src/modules/traceability/cache.service.ts).

Frontend Tasks (Web - ReactJS):

[ ] Tạo UI Page cho người tiêu dùng tra cứu thông tin (path: src/pages/TraceabilityResultPage.tsx).

[ ] Hiển thị timeline vòng đời vật nuôi từ khi sinh đến xuất chuồng (path:src/components/Traceability/LifeCycleTimeline.tsx).

## Epic 7: Commerce & Analytics

### Feature 7.1: Hợp đồng & Báo cáo hiệu quả

Use Case 7.1.1: Dashboard Tổng hợp P&L và FCR

Mô tả: Hiển thị báo cáo chỉ số chuyển đổi thức ăn (FCR), lãi lỗ cho ban quản trị.Dependencies: Toàn bộ hệ thống

Backend Tasks:

[ ] Viết custom SQL queries/Aggregation pipeline tính toán hao hụt, FCR, P&L (path:src/modules/analytics/analytics.repository.ts).

[ ] Cấu hình API Endpoint GET /api/v1/analytics/dashboard (path: src/modules/analytics/analytics.controller.ts).

Frontend Tasks (Web - ReactJS):

[ ] Tạo UI Dashboard bao gồm biểu đồ (Line, Bar) thống kê chi phí/sản lượng (path: src/pages/DashboardPage.tsx).

[ ] Viết service gọi API và render các chỉ số tài chính lên Card Components (path:src/components/Analytics/MetricCard.tsx).

