# 🔐 Setup Admin User

Hệ thống **KHÔNG CHO PHÉP đăng ký** từ web. Bạn phải tự tạo admin user trong database Supabase.

---

## Bước 1: Vào Supabase SQL Editor

1. Mở [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** (icon 📝 bên trái)

---

## Bước 2: Tạo Tables (nếu chưa có)

Copy và chạy file `database/schema.sql`:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proxies table
CREATE TABLE IF NOT EXISTS proxies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proxy_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rotating Proxy Keys table
CREATE TABLE IF NOT EXISTS rotating_proxy_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Resources Linking table
CREATE TABLE IF NOT EXISTS user_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  proxy_id UUID REFERENCES proxies(id) ON DELETE CASCADE,
  rotating_proxy_key_id UUID REFERENCES rotating_proxy_keys(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Access Logs table
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_resources_user_id ON user_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resources_api_key_id ON user_resources(api_key_id);
CREATE INDEX IF NOT EXISTS idx_user_resources_proxy_id ON user_resources(proxy_id);
CREATE INDEX IF NOT EXISTS idx_user_resources_rotating_key_id ON user_resources(rotating_proxy_key_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
```

---

## Bước 3: Tạo Admin User

### Chạy query này để tạo admin:

```sql
-- Tạo admin user
-- Username: admin
-- Password: admin123  (đổi password này!)
INSERT INTO users (username, email, password_hash)
VALUES (
  'admin',
  'admin@localhost.local',
  '$2b$10$YourHashedPasswordHere'  -- Xem bước tiếp theo để hash password
);
```

### ⚠️ Hash Password trước khi insert

Bạn cần hash password bằng bcrypt. Có 2 cách:

#### **Cách 1: Dùng Online Tool** (nhanh nhất)
1. Vào: https://bcrypt-generator.com/
2. Nhập password của bạn (ví dụ: `admin123`)
3. Chọn rounds: **10**
4. Copy hash (ví dụ: `$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldbNjmkl3pJlYr6iVfS`)
5. Replace trong query trên

#### **Cách 2: Dùng Node.js**
```bash
# Trong terminal
cd resource-management-server
npm install bcrypt
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('admin123', 10));"
```

### Ví dụ query hoàn chỉnh:

```sql
-- Admin user với password: admin123
INSERT INTO users (username, email, password_hash)
VALUES (
  'admin',
  'admin@localhost.local',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldbNjmkl3pJlYr6iVfS'
);
```

---

## Bước 4: Login vào Web

1. Mở: http://localhost:3000 (local) hoặc https://your-vercel-url.vercel.app
2. Click **"🔐 Đăng nhập Quản Trị"**
3. Nhập:
   - **Email**: `admin@localhost.local`
   - **Password**: `admin123` (hoặc password bạn đã hash)
4. Click **Đăng nhập**

---

## Bước 5: Thêm Resources

Sau khi login, bạn có thể thêm:
- 🔑 **API Keys**: ElevenLabs API keys (sk_...)
- 🌐 **Proxies**: Proxy URLs (socks5://...)
- 🔄 **Rotating Keys**: Rotating proxy keys

Tool Python sẽ tự động fetch resources này qua API!

---

## 📝 Tạo Thêm User (Optional)

Nếu cần nhiều admin user:

```sql
-- User 2
INSERT INTO users (username, email, password_hash)
VALUES (
  'user2',
  'user2@example.com',
  '$2b$10$[your_hashed_password]'
);
```

---

## 🔒 Bảo Mật

- ✅ Đổi password mặc định ngay sau khi setup
- ✅ Sử dụng password mạnh (>12 ký tự, có số + ký tự đặc biệt)
- ✅ Không share credentials
- ✅ Định kỳ đổi password

---

## 🐛 Troubleshooting

### ❌ "Invalid credentials"
- Kiểm tra email chính xác
- Đảm bảo password đã hash đúng
- Thử tạo user mới

### ❌ "User not found"
- Chạy lại query INSERT
- Kiểm tra table `users` trong Supabase (Table Editor)

### ❌ Quên password
```sql
-- Reset password (đổi email và hash mới)
UPDATE users
SET password_hash = '$2b$10$[new_hashed_password]'
WHERE email = 'admin@localhost.local';
```

---

## ✅ Xong!

Giờ bạn có thể:
1. Login vào dashboard
2. Thêm API keys và proxies
3. Tool sẽ tự động lấy resources từ server này!


