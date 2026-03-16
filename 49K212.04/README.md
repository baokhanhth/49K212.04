# ⚽ Football Web

Hệ thống quản lý bóng đá trực tuyến.

## 🛠 Tech Stack

| Layer    | Technology                    |
| -------- | ----------------------------- |
| Frontend | React 18 + Vite + TailwindCSS |
| Backend  | NestJS + TypeORM              |
| Database | SQL Server (MSSQL)            |

## 📁 Cấu trúc thư mục

```
├── client/              # Frontend - React + Vite + TailwindCSS
│   ├── public/
│   ├── src/
│   │   ├── components/  # Các component dùng chung
│   │   ├── pages/       # Các trang
│   │   ├── services/    # API services (axios)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/              # Backend - NestJS
│   ├── src/
│   │   ├── common/      # Entities, DTOs, interfaces dùng chung
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Hướng dẫn cài đặt

### Yêu cầu

- **Node.js** >= 18
- **SQL Server** đã cài đặt và chạy
- **npm** >= 9

### 1. Clone và cài đặt dependencies

```bash
# Cài đặt tất cả dependencies
npm run install:all
```

### 2. Cấu hình Database

Tạo database trong SQL Server:

```sql
CREATE DATABASE football_db;
```

Cập nhật file `server/.env`:

```env
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourPassword123
DB_DATABASE=football_db
PORT=5000
```

### 3. Chạy ứng dụng

```bash
# Chạy Backend (port 5000)
npm run dev:server

# Chạy Frontend (port 3000) - mở terminal khác
npm run dev:client
```

### 4. Truy cập

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📝 Ghi chú

- Frontend proxy `/api` requests đến Backend qua Vite config
- TypeORM `synchronize: true` sẽ tự động tạo bảng từ entities (chỉ dùng trong development)
- Đổi `synchronize: false` trong production và sử dụng migrations