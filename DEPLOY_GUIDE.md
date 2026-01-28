# 🚀 Deploy Resource Management Server to Vercel

## 📋 Yêu cầu:
- ✅ Tài khoản Vercel (free tier OK)
- ✅ Tài khoản GitHub (để link project)
- ✅ Supabase project đã setup (đã có rồi)

---

## 🔧 BƯỚC 1: Chuẩn bị Database (Supabase)

### 1.1 Chạy Migration Script

1. Vào https://supabase.com/dashboard/project/hniirgxqqzltezdmzuyj
2. Click **SQL Editor** (bên trái)
3. Click **New Query**
4. Copy và paste toàn bộ nội dung file: `FINAL_MIGRATION.sql`
5. Click **RUN** (hoặc Ctrl+Enter)
6. Kiểm tra kết quả - phải thấy:
   ```
   ✅ MIGRATION COMPLETED!
   total_users: 3
   total_api_keys: X
   linked_api_keys: X
   ```

### 1.2 Tạo Admin User (nếu chưa có)

Chạy SQL này để tạo admin với password `admin123`:

```sql
-- Generate bcrypt hash for "admin123"
-- Hash: $2a$10$YgZ8K3qF5N7xQX0XxXxXxeXxXxXxXxXxXxXxXxXxXxXxXxXxXx

INSERT INTO users (username, email, password_hash, is_admin, is_active)
VALUES (
  'admin',
  'admin@tool.local',
  '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
  true,
  true
) ON CONFLICT (username) DO UPDATE 
SET password_hash = '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',
    is_admin = true;
```

**Note**: Đổi password sau khi login lần đầu!

---

## 🌐 BƯỚC 2: Deploy lên Vercel

### 2.1 Push Code lên GitHub

```bash
# Di chuyển vào folder server
cd "D:\backup project\elevenlab tool\resource-management-server"

# Init git (nếu chưa có)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Resource Management Server"

# Tạo repo mới trên GitHub (https://github.com/new)
# Tên repo: elevenlabs-resource-server

# Link và push
git remote add origin https://github.com/YOUR_USERNAME/elevenlabs-resource-server.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy từ Vercel Dashboard

1. **Vào Vercel**: https://vercel.com/
2. Click **Add New** → **Project**
3. **Import Git Repository**:
   - Chọn repo: `elevenlabs-resource-server`
   - Click **Import**

4. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (để mặc định)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. **Environment Variables** (QUAN TRỌNG!):
   Click **Environment Variables**, thêm 4 biến:

   **a) Supabase URL:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hniirgxqqzltezdmzuyj.supabase.co
   ```
   
   **b) Supabase Service Role Key:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaWlyZ3hxcXpsdGV6ZG16dXlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY4MTAyMSwiZXhwIjoyMDgzMjU3MDIxfQ.wH0_ypBSFd6Gy5NlKxhMxLFhIo6RG407WCjhCEE-Gk8
   ```
   
   **c) JWT Secret (generate mới):**
   ```bash
   # Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   JWT_SECRET=<paste-generated-key-here>
   ```
   
   **d) ⭐ API Secret Key (generate mới):**
   ```bash
   # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   API_SECRET_KEY=<paste-generated-key-here>
   ```
   
   **⚠️ LƯU KEY NÀY LẠI! Bạn sẽ cần nó cho tool Python sau này!**

6. Click **Deploy**

7. Đợi 2-3 phút... ☕

8. **Xong!** Bạn sẽ nhận được URL dạng:
   ```
   https://elevenlabs-resource-server.vercel.app
   ```

---

## ✅ BƯỚC 3: Kiểm tra Deployment

### 3.1 Test Health Check

Mở browser, truy cập:
```
https://YOUR_VERCEL_URL.vercel.app/api/health
```

Kết quả phải là:
```json
{
  "status": "ok",
  "timestamp": "2026-01-07T..."
}
```

### 3.2 Test API Key Authentication

Test với curl (cần có API key):

```bash
# ❌ Without API key - should fail with 401
curl https://YOUR_VERCEL_URL.vercel.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response: {"error":"Unauthorized: Invalid or missing API key"}

# ✅ With API key - should work
curl https://YOUR_VERCEL_URL.vercel.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_SECRET_KEY" \
  -d '{"username":"admin","password":"admin123"}'

# Response: {"token":"...","userId":"...","username":"admin"}
```

### 3.2 Test Login Page

Truy cập:
```
https://YOUR_VERCEL_URL.vercel.app/login
```

Login với:
- **Username**: `admin`
- **Password**: `admin123`

Nếu vào được dashboard → **THÀNH CÔNG!** 🎉

---

## 🔐 BƯỚC 4: Bảo mật Production

### 4.1 Đổi JWT Secret

1. Generate secret mới:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. Vào Vercel Dashboard → Project → Settings → Environment Variables
3. Edit `JWT_SECRET`, paste secret mới
4. Click **Save**
5. Redeploy: Settings → Deployments → Latest → ... → **Redeploy**

### 4.2 Đổi Admin Password

1. Login vào dashboard
2. Click **Admin** → **Change Password**
3. Đổi password mới (khác `admin123`)

---

## 🔧 BƯỚC 5: Update Tool để dùng Production URL

### 5.1 Setup API Secret Key

Tạo file `.env` trong thư mục tool:

```env
# Resource Management Server Config
RESOURCE_SERVER_URL=https://YOUR_VERCEL_URL.vercel.app
API_SECRET_KEY=your-api-secret-key-from-vercel
```

### 5.2 Test bằng script

Sửa `test_server_integration.py`:

```python
import os
from dotenv import load_dotenv

load_dotenv()  # Load từ .env file

SERVER_URL = os.getenv('RESOURCE_SERVER_URL', 'http://localhost:3001')
API_SECRET_KEY = os.getenv('API_SECRET_KEY')
USERNAME = "xzzz"  # User đã tạo
PASSWORD = "xzzz"  # Password của user

# Initialize fetcher with API key
fetcher = ResourceFetcher(server_url=SERVER_URL, api_secret_key=API_SECRET_KEY)
```

Chạy test:
```bash
pip install python-dotenv  # If not installed
python test_server_integration.py
```

### 5.2 Update main.py

Sửa trong `main.py`:

```python
def _auto_fetch_resources_from_server(self):
    ...
    # Config server URL
    server_url = "https://YOUR_VERCEL_URL.vercel.app"  # Production URL
    ...
```

---

## 🐛 Troubleshooting

### Lỗi: "Failed to fetch"
- ✅ Check CORS settings (đã config trong Next.js)
- ✅ Check environment variables in Vercel
- ✅ Check Supabase connection

### Lỗi: "Could not find table..."
- ✅ Chưa chạy migration script
- ✅ Vào Supabase SQL Editor, chạy `FINAL_MIGRATION.sql`

### Lỗi: "Invalid credentials"
- ✅ Check admin user đã tạo chưa
- ✅ Check password hash đúng chưa
- ✅ Run SQL tạo admin lại

### Build failed trên Vercel
- ✅ Check `package.json` dependencies
- ✅ Check TypeScript errors
- ✅ Xem build logs để debug

---

## 📊 Sau khi Deploy xong:

1. ✅ Tạo users cho mỗi người dùng tool
2. ✅ Add API keys, proxies cho từng user
3. ✅ Tool tự động fetch resources mỗi lần khởi động
4. ✅ Quản lý tập trung trên web dashboard

---

## 🔄 Update sau này:

Khi có code mới:

```bash
git add .
git commit -m "Update: your changes"
git push

# Vercel sẽ tự động deploy!
```

---

## 📝 Tổng kết:

**URL Production**: `https://YOUR_VERCEL_URL.vercel.app`

**Endpoints:**
- 🏠 Dashboard: `/dashboard`
- 🔐 Login: `/login`
- 🔑 API: `/api/resources/{userId}`

**Default Admin:**
- Username: `admin`
- Password: `admin123` (đổi ngay sau khi login!)

---

**Xong rồi! Giờ có thể quản lý resources tập trung cho tất cả users!** 🎉

