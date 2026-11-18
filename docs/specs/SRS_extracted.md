Đặc tả yêu cầu (SRS) & Thiết kế hệ thống

# 1. Executive Summary (Tổng quan dự án)

Mục tiêu kinh doanh (Business Goals): Số hóa toàn diện quy trình vận hành của Hợp tác xã (HTX) chăn nuôi, từ khâu quản lý đàn, cung ứng vật tư đến bao tiêu sản phẩm. Hệ thống giúp tối ưu hóa chi phí thức ăn/thuốc men, giảm thiểu rủi ro dịch bệnh, minh bạch nguồn gốc sản phẩm để nâng cao giá trị thương hiệu và tạo lợi thế cạnh tranh trên thị trường.

Đối tượng người dùng mục tiêu (Target Audience):

Ban quản trị HTX: Quản lý tổng thể, điều phối vật tư, kiểm soát đơn hàng và theo dõi hiệu quả kinh doanh.

Hộ chăn nuôi/Xã viên: Ghi chép nhật ký chăn nuôi, nhận lịch tiêm phòng/thông báo dịch bệnh, quản lý chi phí hộ gia đình.

Bác sĩ thú y: Cập nhật phác đồ điều trị, quản lý lịch tiêm, duyệt xuất đàn an toàn.

Khách hàng (B2B/B2C) & Người tiêu dùng: Ký kết hợp đồng mua bán, đặt hàng và quét mã QR truy xuất nguồn gốc.

Phạm vi dự án (Project Scope): Xây dựng một nền tảng ERP chuyên biệt cho nông nghiệp (Agri-ERP) bao gồm Web Portal dành cho khâu quản trị tập trung và Mobile App (có tính năng Offline Mode) dành riêng cho các hộ chăn nuôi thao tác trực tiếp tại chuồng trại.

# 2. System Architecture & Tech Stack (Kiến trúc & Công nghệ)

Mô hình kiến trúc: Microservices Architecture kết hợp Event-Driven.

Lý do: HTX có thể mở rộng số lượng thành viên và nghiệp vụ liên tục (từ lợn, bò sang gia cầm). Việc tách các dịch vụ (Core Farm, Inventory, Health, Trading) giúp hệ thống không bị "nghẽn" nếu một phân hệ (ví dụ: quét mã QR truy xuất) đột ngột nhận lưu lượng truy cập lớn.

Tech Stack đề xuất:

| Lớp (Layer) | Công nghệ đề xuất | Lý do lựa chọn |
| --- | --- | --- |
| Frontend (Web) | ReactJS + Ant Design | Hệ sinh thái thư viện phong phú, render nhanh bảng biểu lớn cho Ban quản trị, dễ xây dựng Dashboard phức tạp. |
| Frontend (Mobile) | Flutter (Dart) | Code một lần chạy trên cả iOS & Android, hỗ trợ tốt Local Database (SQLite) để làm tính năng Offline Mode cho nông dân. |
| Backend | NestJS (Node.js) hoặc Golang | NestJS phù hợp cho phát triển nhanh các service nghiệp vụ. Golang dùng cho các service cần xử lý tải cao (Truy xuất nguồn gốc, IoT Sensor). |
| Database | PostgreSQL + MongoDB + Redis | PostgreSQL (ACID) cho dữ liệu tài chính/đơn hàng. MongoDB cho log sinh trưởng/nhật ký đa định dạng. Redis để cache dữ liệu truy xuất. |
| Cloud & DevOps | AWS / Google Cloud (GCP) + Docker | Dễ dàng thiết lập Kubernetes để auto-scaling. Triển khai CI/CD tự động giảm thiểu lỗi khi update tính năng mới. |
| 3rd-party | Zalo ZNS / SMS, VNPay, Map API | ZNS/SMS để bắn cảnh báo dịch bệnh khẩn cấp; Cổng thanh toán cho đối tác mua hàng; Bản đồ theo dõi vùng dịch. |


# 3. Functional Requirements (Đặc tả yêu cầu chức năng)

| Khối chức năng (Module) | Tên chức năng (Feature) | Mô tả (Description) | Mức độ ưu tiên |
| --- | --- | --- | --- |
| 1. User & Farm Mgt | Quản lý thành viên | Đăng ký, định danh (KYC) hộ chăn nuôi, phân bổ quy mô chuồng trại, thiết lập tài khoản thú y/quản lý. | High |
| 2. Livestock Mgt | Quản lý đàn & giống | Khai báo nhập đàn mới (lô giống/cá thể), đánh mã tag (Ear tag/RFID), theo dõi lịch sử di truyền giống. | High |
| 2. Livestock Mgt | Cập nhật tăng trưởng | Ghi nhận chỉ số cân nặng, kích thước định kỳ. Cảnh báo các cá thể/nhóm chậm lớn so với chuẩn. | Medium |
| 3. Inventory Mgt | Quản lý kho vật tư | Nhập/xuất thức ăn, thuốc, vật tư y tế. Tính toán định mức tiêu hao và cảnh báo hàng tồn kho sắp hết/hết hạn. | High |
| 4. Health & Vet | Quản lý y tế | Lập lịch tiêm vắc xin, vệ sinh chuồng tự động nhắc nhở qua App. Ghi chép triệu chứng, chẩn đoán, cấp phát thuốc điều trị bệnh. | High |
| 5. Supply Chain | Quản lý nhập/xuất đàn | Quy trình duyệt xuất đàn: Thú y đánh giá sức khỏe -> Quản lý duyệt -> Xuất phiếu cân xe/giao nhận. | High |
| 5. Supply Chain | Truy xuất nguồn gốc | Tự động sinh mã QR cho mỗi lô hàng/sản phẩm. Lưu trữ Immutable Log (Nhật ký không thể sửa) về vòng đời vật nuôi từ khi sinh đến khi xuất chuồng. | High |
| 6. Commerce | Quản lý thương mại | Quản lý CRM đối tác thu mua, tạo hợp đồng bao tiêu, theo dõi trạng thái đơn đặt hàng, thanh toán và công nợ. | Medium |
| 7. Analytics | Báo cáo hiệu quả | Dashboard tổng hợp: FCR (Hệ số chuyển đổi thức ăn), tỷ lệ hao hụt, chi phí/kg tăng trọng, P&L (Lỗ/Lãi) theo từng hộ hoặc toàn HTX. | High |


# 4. Non-Functional Requirements (Yêu cầu phi chức năng)

Hiệu năng (Performance):

Hệ thống phản hồi dưới 2 giây (2000ms) cho các tác vụ thông thường.

Offline-first: App di động của hộ chăn nuôi phải hoạt động được khi mất mạng (lưu Cache/SQLite local). Khi có mạng (3G/Wifi), dữ liệu tự động đồng bộ.

Bảo mật (Security):

Bảo mật API bằng JWT (JSON Web Tokens) và OAuth 2.0.

Phân quyền Role-Based Access Control (RBAC) nghiêm ngặt.

Khả năng mở rộng (Scalability):

Hệ thống có thể scale tự động (Auto-scaling) để chịu tải lên tới 10,000+ CCU vào các khung giờ quét QR truy xuất nguồn gốc.

# 5. Database Schema & Data Models (Thiết kế dữ liệu cốt lõi)

Thực thể Farmers (Hộ chăn nuôi): farmer_id, name, farm_location, capacity, join_date.

Thực thể Livestock_Batches (Lô vật nuôi): batch_id, farmer_id, breed_type, import_date, initial_quantity, current_quantity, status.

Quan hệ: 1 Farmer - N Livestock_Batches.

Thực thể Health_Records (Hồ sơ y tế): record_id, batch_id, vet_id, disease_name, treatment_plan, medicines_used, date.

Quan hệ: 1 Livestock_Batches - N Health_Records.

Thực thể Inventory_Transactions (Giao dịch vật tư): trans_id, farmer_id, item_id (Thức ăn/Thuốc), quantity, type, date.

Thực thể Contracts_Orders (Hợp đồng/Đơn hàng): order_id, buyer_id, batch_ids, total_weight, unit_price, total_amount, status.

# 6. Milestones & WBS (Kế hoạch triển khai & WBS)

Tổng thời gian dự kiến để MVP (Minimum Viable Product) go-live là 5 tháng (~110 Man-days/dev).

| Phase | Hạng mục công việc (WBS) | Thời gian dự kiến | Output / Deliverables |
| --- | --- | --- | --- |
| Phase 1 | Foundation & Core Farm- Setup hạ tầng Cloud, CI/CD.- Phát triển Module Quản lý Thành viên & Hộ.- Quản lý Lô/Đàn và luồng cập nhật tăng trưởng. | T0 - T1.5 (6 tuần) | Web Admin & App Nông dân (bản cơ bản để nhập số liệu đàn). |
| Phase 2 | Inventory & Health- Xây dựng luồng nhập/xuất kho vật tư.- Quản lý phác đồ điều trị, cảnh báo lịch tiêm tự động.- Tích hợp thông báo Zalo ZNS. | T1.5 - T3 (6 tuần) | Nông dân và Thú y có thể quản lý chi phí thức ăn, thuốc và bệnh án. |
| Phase 3 | Commerce, Traceability & Reports- Luồng duyệt xuất đàn, hợp đồng mua bán.- Tạo module phát sinh mã QR Traceability.- Xây dựng Dashboard Báo cáo (P&L, FCR). | T3 - T4 (4 tuần) | App Khách hàng quét mã QR; Ban quản trị xem được dòng tiền và năng suất. |
| Phase 4 | UAT, Training & Go-live- Kiểm thử người dùng cuối (Nông dân thao tác thử).- Tối ưu hóa tính năng Offline-sync.- Triển khai Production. | T4 - T5 (4 tuần) | Hệ thống vận hành chính thức tại HTX, có tài liệu Hướng dẫn sử dụng. |


