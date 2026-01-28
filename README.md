# ElevenLabs Resource Management Server

Hệ thống quản lý tài nguyên (API keys & Proxies) cho ElevenLabs Tool.

## Features

- 🔐 **User Authentication**: Đăng ký/đăng nhập
- 📊 **Resource Management**: Quản lý API keys và proxies cho từng user
- 🚀 **API Endpoints**: Tool tự động get resources từ server
- 🎯 **Admin Dashboard**: Giao diện quản lý tài nguyên
- 🔒 **Secure**: JWT authentication, bcrypt password hashing

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT + bcrypt
- **Deploy**: Vercel
- **Language**: TypeScript

## Setup

### 1. Cài đặt dependencies

```bash
cd resource-management-server
npm install
```

### 2. Tạo Supabase project

1. Đi tới https://supabase.com
2. Tạo project mới
3. Copy URL và anon key

### 3. Setup environment variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-random-secret-key-here
```

### 4. Run database migrations

Copy SQL trong `database/schema.sql` vào Supabase SQL Editor và chạy.

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Get Resources (cho Tool)

```
GET /api/resources/{user_id}
Headers:
  Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "data": {
    "api_keys": ["sk_123...", "sk_456..."],
    "proxies": [
      {"type": "http", "host": "1.2.3.4", "port": 8080},
      ...
    ]
  }
}
```

### User Authentication

```
POST /api/auth/register
POST /api/auth/login
```

## Deploy lên Vercel

```bash
vercel
```

Nhớ set environment variables trong Vercel dashboard.

## Tool Integration

Xem file `tool-integration/resource_fetcher.py` để tích hợp vào tool.


