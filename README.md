# Agri-Coop-ERP

Hệ thống ERP chuyển đổi số cho Hợp tác xã (HTX) Chăn nuôi theo kiến trúc Monorepo hiện đại.

## Cấu trúc Thư mục

```text
Agri-Coop-ERP/
├── apps/
│   ├── api/                   # Backend NestJS (TypeScript, Prisma, PostgreSQL)
│   └── web/                   # Frontend React + Vite + TypeScript + Ant Design
├── docs/                      # Đặc tả yêu cầu (SRS, WBS) và kế hoạch triển khai
├── docker-compose.yml         # Hạ tầng CSDL độc lập (PostgreSQL, MongoDB, Redis)
├── .env.example               # Template biến môi trường
├── .gitignore                 # Cấu hình loại trừ tệp nhạy cảm và artifacts
├── AGENTS.md                  # Quy chuẩn và nguyên tắc phát triển bắt buộc
└── README.md                  # Hướng dẫn dự án
```

## Yêu cầu Môi trường

- Node.js >= 20 (Đã kiểm thử trên Node v24)
- npm >= 10
- Docker & Docker Compose (cho dịch vụ CSDL)

## Cài đặt & Khởi động Nhanh

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Khởi chạy CSDL qua Docker Compose (Cách ly hoàn toàn)

```bash
# Kiểm tra cấu hình Docker
docker compose config

# Khởi chạy dịch vụ nền tảng (cổng ngoài 5433, 27018, 6380)
docker compose up -d
```

### 3. Chạy Ứng dụng ở Chế độ Phát triển

- **Backend NestJS:**
  ```bash
  npm run start:api
  # API chạy tại: http://localhost:3000/api/v1
  # Healthcheck: http://localhost:3000/api/v1/health
  ```

- **Frontend React Web:**
  ```bash
  npm run start:web
  # Web Portal chạy tại: http://localhost:5173
  ```

## Kiểm thử & Build

```bash
# Build toàn bộ dự án
npm run build

# Chạy toàn bộ kiểm thử
npm run test

# Chạy linting
npm run lint
```
