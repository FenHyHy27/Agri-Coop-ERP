# AGENTS.md - Quy chuẩn và Chỉ dẫn Phát triển Dự án Agri-Coop-ERP

Tài liệu này là quy chuẩn bắt buộc (Ground Rules) áp dụng cho tất cả các tác vụ phát triển, cấu trúc mã nguồn, an toàn dữ liệu và tương tác giữa các kỹ sư/AI Agents trong toàn bộ vòng đời của dự án Agri-Coop-ERP.

---

## 1. Định vị Vai trò và Ngôn ngữ Giao tiếp
- **Vai trò:** Senior Full-stack Engineer kiêm Hướng dẫn viên thực tập (Internship Mentor). Mọi chỉ dẫn, đánh giá mã nguồn và đề xuất kỹ thuật phải tuân thủ nghiêm ngặt các tiêu chuẩn kỹ thuật cấp doanh nghiệp (Enterprise Grade), giải thích rõ nguyên nhân kiến trúc và hướng tới chất lượng mã nguồn bền vững.
- **Ngôn ngữ báo cáo & giao tiếp:** Sử dụng **tiếng Việt** cho toàn bộ giải thích, trao đổi, tài liệu hướng dẫn và báo cáo kết quả.
- **Ngôn ngữ mã nguồn:** Sử dụng **tiếng Anh** chuẩn mực, định danh rõ nghĩa (self-explanatory naming convention) cho biến, hàm, class, interface, bảng CSDL và commit message.
- **Quy chuẩn mã nguồn:** **Tuyệt đối không sử dụng emoji trong mã nguồn** (comments, console logs, code identifiers, exception messages).

---

## 2. Nguồn Yêu cầu và Phạm vi Triển khai (Scope)
- **Nguồn yêu cầu chính thức:** Toàn bộ đặc tả nghiệp vụ, yêu cầu chức năng (FR) và phi chức năng (NFR) căn cứ duy nhất vào tài liệu SRS và WBS nằm tại thư mục `docs/specs/`:
  - `docs/specs/SRS_Chuyen_Doi_So_HTX_Chan_Nuoi.docx`
  - `docs/specs/WBS_ Chuyển đổi số HTX Chăn nuôi (Agri-ERP).docx`
- **Mục tiêu ưu tiên hiện tại:**
  - Hoàn thành chính xác 6 task gốc của **Epic 2 (EP-02.1 đến EP-02.6)** theo đúng WBS chính thức.
  - Tích hợp các **chức năng mở rộng** phục vụ bản MVP (Đăng nhập Google, Đăng nhập Email/Password, Quản lý Token/Phiên, Luồng hồ sơ nông hộ và Phân quyền KYC) mà không làm biến dạng hoặc thay đổi tên/mã/phạm vi của 6 task gốc.
- **Giới hạn phạm vi (Scope Boundary):**
  - **Không** tự ý tạo hoặc scaffold trước các module nghiệp vụ thuộc Epic 3 đến Epic 7 (Kế hoạch chăn nuôi, Thức ăn, Thú y, Thu hoạch, Báo cáo...).
  - Mọi quy tắc nghiệp vụ bổ sung không có trong SRS/WBS bắt buộc phải được đánh dấu rõ ràng là **[Đề xuất thiết kế - Design Proposal]**.
  - Mỗi bước thực thi chỉ làm đúng yêu cầu của prompt hiện tại, **không tự ý chuyển sang bước tiếp theo** khi chưa có sự xác nhận từ Tech Lead/User.

---

## 3. Tech Stack & Kiến trúc Hệ thống
- **Backend:** NestJS, TypeScript, kiến trúc module hóa theo Domain/Feature.
- **Frontend Web:** React, Vite, TypeScript, Ant Design (antd).
- **Cơ sở dữ liệu chính (RDBMS):** PostgreSQL (lưu trữ định danh, người dùng, phân quyền, hồ sơ nông hộ, giao dịch quan trọng).
- **ORM:** Prisma ORM.
- **Cơ sở dữ liệu NoSQL & Cache:**
  - MongoDB & Redis được cấu hình khởi chạy qua Docker Compose sẵn sàng cho các giai đoạn tiếp theo (IoT, Logs, Session Cache).
  - **Lưu ý đặc thù Epic 2:** MongoDB và Redis chưa có nghiệp vụ trực tiếp trong Epic 2. **Tuyệt đối không tạo logic giả (mock/dummy logic) hoặc cố nhét Redis/MongoDB vào luồng xác thực của Epic 2 khi chưa có yêu cầu.**
- **Package Manager:** Sử dụng duy nhất `npm`. Tuyệt đối không cài đặt hoặc chạy xen kẽ `pnpm`, `yarn` nhằm tránh xung đột file lock và hoisting module.

---

## 4. Cấu trúc Thư mục Workspace
Dự án được tổ chức theo mô hình Monorepo đơn giản hóa:
```
Agri-Coop-ERP/
├── apps/
│   ├── api/                   # Backend NestJS Application
│   └── web/                   # Frontend React + Vite + AntD Application
├── docs/
│   └── specs/                 # Tài liệu SRS, WBS và tài liệu đặc tả
├── docker-compose.yml         # Hạ tầng dịch vụ (PostgreSQL, MongoDB, Redis)
├── .env.example               # Template biến môi trường gốc
├── .gitignore                 # Loại trừ secrets, logs, node_modules, build artifacts
└── AGENTS.md                  # Quy chuẩn dự án (Tài liệu này)
```

---

## 5. Quy chuẩn Nghiệp vụ, Kiến trúc & Bảo mật

### 5.1. Định tuyến API (API Routing)
- Toàn bộ backend API bắt buộc sử dụng global prefix: `/api/v1`.
- Endpoint đăng ký tài khoản nông hộ phải giữ chính xác theo chuẩn WBS:
  `POST /api/v1/farmers/register`

### 5.2. [Đề xuất thiết kế] Phân tách Thực thể & Vòng đời Hồ sơ Nông hộ
- `User` và `FarmerProfile` là **hai thực thể tách biệt** trong Database Schema (quan hệ 1 - 1 hoặc 1 - 0..1).
- **Trình tự khởi tạo:** Người dùng có thể đăng ký (Local Register) hoặc đăng nhập (Google Sign-In) để tạo tài khoản `User` trước khi có `FarmerProfile`.
- **Điều hướng hoàn thiện hồ sơ:** Khi người dùng đã xác thực nhưng chưa có `FarmerProfile`, giao diện Frontend tự động điều hướng người dùng tới trang hoàn thiện thông tin cơ sở chăn nuôi / nông hộ.
- **Vòng đời trạng thái hồ sơ (`FarmerProfileStatus`):**
  - `INCOMPLETE`: Đã có tài khoản `User`, nhưng chưa nộp đầy đủ thông tin trang trại / chuồng trại.
  - `PENDING`: Nông hộ đã nộp đầy đủ hồ sơ và thông tin cơ sở, đang chờ quản trị viên HTX thẩm định.
  - `VERIFIED`: Hồ sơ đã được Ban quản trị HTX phê duyệt, chính thức xác nhận tư cách xã viên HTX.
  - `REJECTED`: Hồ sơ bị từ chối phê duyệt (kèm lý do giải trình cụ thể từ quản trị viên).
- **Thẩm quyền phê duyệt:** Chỉ duy nhất Quản trị viên HTX (vai trò `ADMIN`) có thẩm quyền xét duyệt hồ sơ sang trạng thái `VERIFIED` hoặc `REJECTED`.
- **Chốt chặn phân quyền (Verification Gate):** Những người dùng chưa đạt trạng thái `VERIFIED` tuyệt đối không được phép truy cập hoặc sử dụng các nghiệp vụ đòi hỏi tư cách xã viên đã xác minh (ví dụ: đăng ký kế hoạch chăn nuôi, nhận phân phối thức ăn/thuốc thú y, xuất chuồng thu hoạch, biểu quyết HTX).
- **Nguyên tắc cốt lõi về KYC:** **Đăng nhập Google thành công chỉ xác nhận danh tính email của User, tuyệt đối KHÔNG đồng nghĩa hồ sơ đã hoàn thành KYC VERIFIED.**

### 5.3. [Đề xuất thiết kế] Phương thức Đăng nhập & Định danh
- **Đăng nhập truyền thống (Email/Password):**
  - Mật khẩu bắt buộc băm bằng thuật toán **Argon2id** (độ an toàn cao, chống GPU cracking).
- **Đăng nhập Google (Google Sign-In):**
  - Frontend: Sử dụng **Google Identity Services (GIS)** SDK để thu nhận ID token từ Google.
  - Backend: Nhận Google ID token tại NestJS và sử dụng thư viện `google-auth-library` gọi `verifyIdToken()` với Client ID tương ứng.
  - **Bảo mật token:** Backend tuyệt đối không tin cậy dữ liệu payload do frontend giải mã. Backend bắt buộc phải trích xuất `sub` (Google Subject ID duy nhất) và `email` từ token đã được Google ký số và kiểm tra tính hợp lệ (issuer, audience, expiry).
- **Phân định rõ loại Token:** Phân biệt rạch ròi giữa **Google ID token** (chỉ dùng làm bằng chứng xác thực danh tính gửi lên NestJS khi đăng nhập Google) và **Application JWT** (Access Token/Refresh Token do chính NestJS cấp phát để duy trì phiên làm việc trong hệ thống Agri-ERP).
- **Quy chuẩn thông tin Số điện thoại:**
  - Số điện thoại là thuộc tính định danh thuộc về **Hồ sơ nông hộ (`FarmerProfile`)** (hoặc thực thể liên lạc liên kết), không đặt làm định danh bắt buộc trên bảng `User` cơ sở.
  - Quy tắc xác thực (Validation): Kiểm tra định dạng số điện thoại chuẩn Việt Nam (E.164 hoặc regex số di động 10 chữ số).
  - Tính duy nhất (Uniqueness): Ràng buộc tính duy nhất của số điện thoại được định nghĩa rõ ràng trong schema CSDL để ngăn chặn trùng lặp số điện thoại nông hộ trong HTX.
- **Quy tắc liên kết tài khoản (Account Linking Rule):**
  - Không tự động liên kết tài khoản Google với tài khoản password đã tồn tại chỉ dựa vào email trùng (phòng tránh nguy cơ Account Takeover).
  - Yêu cầu người dùng xác thực mật khẩu hiện tại để liên kết tài khoản hoặc cung cấp luồng liên kết có xác thực.
- **Quyền hạn mặc định (RBAC):**
  - Mọi tài khoản tự đăng ký hoặc tạo mới qua Google chỉ nhận vai trò duy nhất là `FARMER`.
  - Nghiêm cấm mọi hành vi tự gán hoặc tự nâng quyền lên `ADMIN` hoặc `VET`.

### 5.4. Bảo mật JWT, Quản lý Phiên & Phòng vệ CSRF Toàn diện
- **Cơ chế cấp phát & Quản lý phiên:**
  - Cặp token: **Access Token** ngắn hạn (15 phút) và **Refresh Token** dài hạn (7 ngày).
  - Client dùng Refresh Token hợp lệ để yêu cầu cấp mới Access Token.
  - Hỗ trợ cơ chế thu hồi phiên (Session Revocation): Refresh Token tương ứng phải bị vô hiệu hóa khi đăng xuất hoặc phát hiện bất thường.
- **Lưu trữ phiên an toàn qua Cookie:**
  - Token phiên nhạy cảm (đặc biệt là Refresh Token) được lưu trữ trong **Cookie HttpOnly**.
  - Bật cờ `Secure: true` khi chạy môi trường Production/HTTPS.
  - Cấu hình thuộc tính `SameSite` phù hợp (`Lax` hoặc `Strict`).
- **Phòng chống tấn công CSRF (Cross-Site Request Forgery) Toàn diện:**
  - **Không coi chỉ kiểm tra header `X-Requested-With` là biện pháp CSRF đầy đủ.**
  - Giải pháp phòng vệ bắt buộc kết hợp đa lớp:
    1. Kiểm tra nghiêm ngặt `Origin` và `Referer` headers trên backend đối với mọi request thay đổi trạng thái (POST, PUT, PATCH, DELETE).
    2. Cấu hình CORS whitelist chính xác domain nguồn của frontend (không dùng `*` khi `credentials: true`).
    3. Cấu hình Cookie với cờ `SameSite=Lax` hoặc `Strict`.
    4. Triển khai cơ chế **CSRF Token** (Double Submit Cookie pattern hoặc Anti-CSRF token guard được xác thực qua custom header) đối với các giao dịch nhạy cảm.
- **An toàn DTO & Ngăn ngừa lộ lọt bí mật:**
  - Toàn bộ request payload phải đi qua DTO với các decorator của `class-validator` và `class-transformer`.
  - Khởi tạo `ValidationPipe` toàn cục (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
  - **Tuyệt đối không ghi token (Access/Refresh/Google ID token), mật khẩu, hash mật khẩu hoặc secrets vào log hệ thống hoặc console.**
  - Không bao giờ trả về `passwordHash`, secret keys, hoặc tokens nhạy cảm trong response body trả về client.

### 5.5. Quản lý Secrets & Biến môi trường
- Mọi thông tin nhạy cảm (DB password, JWT secret, Google Client ID/Secret...) phải đọc từ biến môi trường qua `.env`.
- File `.env.example` chỉ chứa tên biến và giá trị placeholder mẫu, tuyệt đối không lưu secret thật.
- File `.env` phải được khai báo trong `.gitignore`.
- Tuyệt đối không yêu cầu người dùng gửi credentials/secrets thật lên cửa sổ chat.

---

## 6. Quy tắc An toàn Dữ liệu & Cách ly Môi trường Docker (BẮT BUỘC)

### 6.1. Bảo toàn Tuyệt đối Dữ liệu Hiện có của Máy tính Chủ
Máy tính hiện tại đang chạy các tài nguyên của dự án C# trước đây cần được bảo vệ nguyên vẹn:
- **Các Container cũ không được đụng chạm:**
  - `agri_postgres`
  - `agri_mongodb`
  - `agri_redis`
- **Các Docker Volume dữ liệu bắt buộc bảo toàn:**
  - `megadlpcoopapi_postgres_data`
  - `megadlpcoopapi_mongodb_data`
  - `megadlpcoopapi_redis_data`

### 6.2. Nguyên tắc Cách ly Dự án Mới & Phân định Rạch ròi Danh định
- **Tên Project riêng:** Sử dụng Docker Compose Project Name riêng biệt (`-p agri_erp` hoặc khai báo `name: agri_erp` trong `docker-compose.yml`).
- **Tên Container riêng biệt:**
  - `agri_erp_postgres`
  - `agri_erp_mongodb`
  - `agri_erp_redis`
- **Tên Volume riêng biệt:**
  - `agri_erp_postgres_data`
  - `agri_erp_mongodb_data`
  - `agri_erp_redis_data`
- **Phân biệt rõ Tên Docker Container với Tên PostgreSQL Database thực tế trong `DATABASE_URL`:**
  - **Tên Container Docker:** `agri_erp_postgres` (định danh service container chạy trên Docker host).
  - **Tên Database thực tế:** `agri_erp_db` (hoặc tên CSDL logic được tạo bên trong PostgreSQL qua biến `POSTGRES_DB`).
  - **DATABASE_URL chuẩn:** `postgresql://postgres:postgres@localhost:5433/agri_erp_db?schema=public` (cổng ngoài ánh xạ linh hoạt để không trùng cổng `5432` của hệ thống cũ).
- **Tránh xung đột cổng (Port Conflicts):**
  - Môi trường cũ có thể đang chiếm dụng: `5432` (PostgreSQL), `27017` (MongoDB), `6379` (Redis).
  - Cấu hình ánh xạ cổng ngoài linh hoạt qua biến môi trường (ví dụ: `5433:5432`, `27018:27017`, `6380:6379`).

### 6.3. Lệnh Cấm Tuyệt đối (Strictly Forbidden Commands)
Nghiêm cấm tự ý thực thi các lệnh sau khi chưa có sự chấp thuận rõ ràng của người dùng:
1. `docker rm` (đối với bất kỳ container cũ nào).
2. `docker volume rm` (đối với bất kỳ volume cũ nào).
3. `docker volume prune`, `docker system prune`.
4. `docker compose down -v` (hành vi xóa volume).
5. `DROP DATABASE` hoặc xóa bảng thủ công.
6. `npx prisma migrate reset` (lệnh này tự động drop toàn bộ dữ liệu database).

### 6.4. An toàn Prisma Migration & Quản trị CSDL
- **Không tự động reset database:** Nghiêm cấm tự ý chạy bất kỳ cờ lệnh hoặc script nào dẫn tới reset cơ sở dữ liệu.
- **Xử lý Schema Drift:** Nếu Prisma cảnh báo phát hiện sai lệch lược đồ (schema drift) hoặc đưa ra yêu cầu/gợi ý reset database để áp dụng migration, **hệ thống bắt buộc phải dừng ngay lập tức**, bảo toàn trạng thái hiện tại và báo cáo chi tiết cho người dùng xin chỉ thị.
- **Kiểm tra Database đích trước khi Migration:** Trước khi thực thi bất kỳ lệnh migration nào, phải kiểm tra và xác nhận chính xác biến `DATABASE_URL` cùng database đích (bảo đảm trỏ chính xác vào cơ sở dữ liệu `agri_erp_db` trên port dự án mới, tuyệt đối không trỏ nhầm vào CSDL của dự án C# cũ).
- **Phê duyệt thay đổi cấu trúc CSDL:** Mọi thay đổi về schema và lệnh migration chỉ được phép thực thi sau khi đã giải thích rõ nội dung thay đổi và nhận được sự phê duyệt rõ ràng từ người dùng.

---

## 7. Tiêu chí Nghiệm thu Chi tiết 6 Task Gốc Epic 2 (Khớp 100% WBS Gốc)

Dưới đây là đặc tả chuẩn xác 6 task thuộc **Epic 2: User & Farm Management (Feature 2.1: Quản lý thành viên & Hộ chăn nuôi - Use Case 2.1.1: Đăng ký và định danh (KYC) hộ chăn nuôi)** được đối chiếu trực tiếp từ tài liệu WBS chính thức.

| Mã Task | Mô tả Chính xác theo WBS | File Dự kiến | Tiêu chí Nghiệm thu Bắt buộc | Kiểm thử Cần Thực hiện |
| :--- | :--- | :--- | :--- | :--- |
| **EP-02.1** | Tạo DTO cho Farmer Registration request/response | `apps/api/src/modules/farmer/dto/create-farmer.dto.ts`<br>`apps/api/src/modules/farmer/dto/farmer-response.dto.ts` | - Định nghĩa đầy đủ các trường dữ liệu đăng ký theo đặc tả.<br>- Ràng buộc validation chặt chẽ bằng `class-validator` (email, password format, phone, tên, địa chỉ, quy mô).<br>- Response DTO loại bỏ hoàn toàn `passwordHash` hoặc dữ liệu nhạy cảm. | - Unit test kiểm tra DTO validation: Bắt đúng dữ liệu hợp lệ và từ chối dữ liệu thiếu trường/sai định dạng.<br>- Test chuyển đổi transformer (trim chuỗi, normalize email). |
| **EP-02.2** | Cấu hình Controller tạo API Endpoint `POST /api/v1/farmers/register` | `apps/api/src/modules/farmer/farmer.controller.ts` | - Khởi tạo đúng endpoint `POST /api/v1/farmers/register`.<br>- Tích hợp `ValidationPipe` để kiểm tra body request.<br>- Trả về HTTP status code 201 Created kèm dữ liệu `farmer-response.dto`.<br>- Xử lý chuẩn mã lỗi (400 Bad Request, 409 Conflict khi trùng lặp). | - Controller Unit test kiểm tra routing và invocation đến Service.<br>- E2E / Integration test gửi HTTP request hợp lệ trả về 201 Created.<br>- Test gửi request sai schema trả về 400 Bad Request. |
| **EP-02.3** | Viết Service logic mã hóa mật khẩu, lưu thông tin Farmer vào PostgreSQL | `apps/api/src/modules/farmer/farmer.service.ts` | - Thực hiện băm mật khẩu bằng thuật toán an toàn **Argon2id** trước khi lưu trữ.<br>- Tương tác với PostgreSQL qua Prisma Client để tạo bản ghi mới.<br>- Kiểm tra ràng buộc duy nhất (Email, Số điện thoại); ném lỗi `ConflictException` nếu đã tồn tại.<br>- Đảm bảo giao dịch (Transaction) toàn vẹn dữ liệu. | - Service Unit test kiểm tra hàm hash Argon2id hoạt động chính xác.<br>- Service test mô phỏng (Mock Prisma) tạo farmer thành công.<br>- Test kiểm tra bắt lỗi trùng email/SĐT ném đúng HTTP 409.<br>- Xác nhận password thô không bị lưu trữ vào CSDL. |
| **EP-02.4** | Tạo UI Component Form đăng ký tài khoản | `apps/web/src/components/Farmer/RegistrationForm.tsx` | - Xây dựng giao diện form đăng ký tài khoản thân thiện bằng React và Ant Design (Form, Input, Button, Card).<br>- Có đầy đủ các trường: Họ và tên, Email, Mật khẩu, Xác nhận mật khẩu, Số điện thoại, Địa chỉ trang trại, Quy mô.<br>- Hỗ trợ các trạng thái loading, disabled khi đang submit. | - Component Render test (React Testing Library) đảm bảo form hiển thị đầy đủ các field.<br>- Test tương tác người dùng nhập dữ liệu vào các ô input. |
| **EP-02.5** | Viết service API layer gọi `POST /api/v1/farmers/register` | `apps/web/src/services/farmerService.ts` | - Viết API client (Axios hoặc Fetch wrapper) gọi chính xác `POST /api/v1/farmers/register`.<br>- Đính kèm đúng headers, content-type `application/json`.<br>- Xử lý chuẩn hóa response trả về và trích xuất lỗi từ backend để UI dễ dàng hiển thị. | - Unit test service API với mock adapter (Axios Mock / MSW).<br>- Test gọi API thành công trả về đúng object kết quả.<br>- Test xử lý lỗi mạng (Network Error) và lỗi HTTP (400, 409, 500). |
| **EP-02.6** | Xử lý form validation và hiển thị thông báo thành công/thất bại | `apps/web/src/pages/RegisterPage.tsx` | - Xử lý client-side validation chặt chẽ (định dạng email, độ dài mật khẩu, khớp xác nhận mật khẩu, định dạng số điện thoại).<br>- Hiển thị thông báo phản hồi rõ ràng cho người dùng bằng Ant Design Message/Notification khi đăng ký thành công hoặc thất bại.<br>- Điều hướng người dùng hợp lý sau khi đăng ký thành công (chuyển sang trang hoàn thiện hồ sơ hoặc đăng nhập). | - Integration test luồng submit form với dữ liệu không hợp lệ: Hiển thị lỗi validation ngay tại UI.<br>- Integration test luồng submit form thành công: Gọi đúng service và hiển thị alert/notification thành công.<br>- Test hiển thị thông báo lỗi từ backend (ví dụ "Email đã được sử dụng"). |

> **Nguyên tắc nghiệm thu cốt lõi:** Bất kỳ task nào trong 6 task trên chỉ được đánh dấu là HOÀN THÀNH khi có đủ 3 bằng chứng thực tế:
> 1. File mã nguồn được tạo mới/chỉnh sửa tại đúng đường dẫn.
> 2. Lệnh build dự án chạy thành công không có lỗi syntax/type check (`npm run build`).
> 3. Kiểm thử tự động (Unit test / Integration test) được thực thi và pass 100%.

---

## 8. Chức năng Mở rộng Ngoài Phạm vi 6 Task Gốc (Extended Scope cho Bản MVP)

Các chức năng dưới đây là phần mở rộng kiến trúc và nghiệp vụ phục vụ cho bản MVP hoàn chỉnh theo yêu cầu của hệ thống Agri-ERP. **Các chức năng này tồn tại độc lập, tuyệt đối không làm thay đổi tên gọi, mã số định danh hay phạm vi của 6 task WBS gốc nêu trên.**

### 8.1. Đăng nhập Email/Password Truyền thống
- Triển khai endpoint `POST /api/v1/auth/login` tiếp nhận email và password.
- Xác thực mật khẩu thông qua Argon2id verify.
- Cấp phát phiên đăng nhập an toàn.

### 8.2. Đăng nhập Google (Google Sign-In qua GIS)
- Tích hợp Google Identity Services (GIS) SDK trên frontend để người dùng đăng nhập bằng tài khoản Google.
- Backend tiếp nhận Google ID token tại `POST /api/v1/auth/google`, sử dụng `google-auth-library` để verify tính hợp lệ và trích xuất `sub` + `email`.
- Tạo mới hoặc đối soát tài khoản người dùng theo nguyên tắc bảo mật (không tự động liên kết khi chưa xác thực).

### 8.3. Quản lý JWT và Refresh Token
- Triển khai cơ chế cặp token: Access Token ngắn hạn và Refresh Token dài hạn.
- Cơ chế lưu trữ cookie `HttpOnly`, phòng vệ CSRF đa lớp (Origin/Referer, SameSite, CSRF Token).
- Endpoint `POST /api/v1/auth/refresh` và `POST /api/v1/auth/logout` để thu hồi phiên.

### 8.4. Hoàn thiện Hồ sơ Nông hộ (Farmer Profile Setup)
- Dành cho người dùng tạo tài khoản trước (hoặc đăng nhập Google) nhưng chưa có thông tin chuồng trại.
- Frontend tự động điều hướng người dùng chưa có `FarmerProfile` sang trang hoàn thiện hồ sơ.
- Endpoint cập nhật thông tin cơ sở chăn nuôi, địa chỉ tọa độ, quy mô chuồng trại.

### 8.5. Xác minh KYC, Phân quyền & Xét duyệt Thành viên
- Quản lý vòng đời trạng thái hồ sơ: `INCOMPLETE → PENDING → VERIFIED / REJECTED`.
- Phân quyền RBAC nghiêm ngặt: Chỉ `ADMIN` HTX mới có quyền xét duyệt sang `VERIFIED`.
- Verification Gate: Chặn người dùng chưa đạt `VERIFIED` truy cập vào các tính năng xã viên chính thức.

---

## 9. Quy trình Thực thi và Báo cáo Công việc (Protocol)

Mọi phiên làm việc và mỗi tác vụ phát triển phải tuân thủ nghiêm ngặt chu trình 2 bước:

### Bước 1: Trước khi chỉnh sửa (Planning)
- Đọc kỹ yêu cầu và đối chiếu với SRS/WBS.
- Tóm tắt ngắn gọn kế hoạch thực hiện.
- Liệt kê danh sách các file dự kiến tạo mới hoặc chỉnh sửa.
- Nêu rõ các rủi ro kỹ thuật (nếu có).

### Bước 2: Sau khi chỉnh sửa (Reporting)
Báo cáo đầy đủ và trung thực kết quả thực tế theo cấu trúc:
1. **Danh sách file đã tạo / chỉnh sửa:** (kèm đường dẫn cụ thể).
2. **Các lệnh đã thực thi trong terminal:** (kèm mục đích).
3. **Kết quả thực tế đạt được:** (kết quả test, build, lint, output thực tế).
4. **Vấn đề / Lỗi còn tồn đọng (nếu có):** Nêu trung thực nguyên nhân và giải pháp khắc phục.
> **Quy tắc trung thực:** Tuyệt đối không tuyên bố "đã chạy thành công" hoặc "đã vượt qua kiểm thử" nếu chưa thực sự chạy lệnh và thu được kết quả thành công trong terminal.
