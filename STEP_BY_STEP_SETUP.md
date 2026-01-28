# 🚀 Hướng Dẫn Setup Database + Deploy Vercel Chi Tiết

## 📋 Tổng Quan

Bạn sẽ setup:
1. ✅ **Supabase Database** (PostgreSQL cloud - FREE)
2. ✅ **Deploy lên Vercel** (Hosting - FREE)
3. ✅ **Kết nối Tool với Server**

---

## 🗄️ BƯỚC 1: Setup Supabase Database

### 1.1. Tạo Supabase Project

```
1. Vào https://supabase.com
2. Click "Start your project" (hoặc "New Project" nếu đã có account)
3. Login bằng GitHub (recommended) hoặc email
4. Click "+ New Project"
```

### 1.2. Cấu Hình Project

```
Name: elevenlabs-resources (hoặc tên bạn thích)
Database Password: [TẠO PASSWORD MẠNH - LƯU LẠI!]
Region: Southeast Asia (Singapore) - GẦN VIỆT NAM NHẤT
Pricing Plan: Free
```

Click **"Create new project"** → Đợi 2-3 phút để project khởi động

### 1.3. Lấy Database Credentials

Khi project sẵn sàng:

```
1. Vào sidebar → Click "Project Settings" (biểu tượng bánh răng)
2. Click "API" trong menu bên trái
3. Copy các thông tin sau:

   📋 Project URL: 
   https://[your-project-id].supabase.co
   
   📋 anon public key:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M... (key dài)
   
   📋 service_role key: (Click "Reveal" để xem)
   ey... (key dài khác)
```

**⚠️ Lưu 3 thông tin này vào notepad!**

### 1.4. Chạy Database Migrations

#### Bước 1: Mở SQL Editor

```
1. Vào sidebar → Click "SQL Editor"
2. Click "+ New query"
```

#### Bước 2: Chạy Schema Chính

```
1. Copy TOÀN BỘ nội dung file này:
   d:\backup project\elevenlab tool\resource-management-server\database\schema.sql

2. Paste vào SQL Editor

3. Click "Run" (hoặc Ctrl+Enter)

4. Chờ → Thấy "Success. No rows returned" = OK!
```

#### Bước 3: Chạy Schema ElevenLabs Accounts

```
1. Click "+ New query" (tạo query mới)

2. Copy TOÀN BỘ nội dung file này:
   d:\backup project\elevenlab tool\resource-management-server\database\ADD_ELEVENLABS_ACCOUNTS.sql

3. Paste vào SQL Editor

4. Click "Run"

5. Thấy "Success. No rows returned" = OK!
```

#### Bước 4: Verify Tables

```
1. Vào sidebar → Click "Table Editor"
2. Bạn sẽ thấy các tables sau:
   ✅ users
   ✅ api_keys
   ✅ proxies
   ✅ rotating_proxy_keys
   ✅ elevenlabs_accounts ← MỚI!
   ✅ access_logs
```

Nếu thấy đủ 6 tables → Database setup XONG! ✅

---

## 🌐 BƯỚC 2: Chuẩn Bị Code để Deploy

### 2.1. Kiểm Tra Dependencies

```bash
cd "d:\backup project\elevenlab tool\resource-management-server"

# Check package.json có đầy đủ dependencies
```

File `package.json` phải có:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "bcryptjs": "^2.x",
    "jsonwebtoken": "^9.x",
    "next": "14.x",
    "react": "^18.x",
    "react-dom": "^18.x"
  }
}
```

### 2.2. Tạo File .env.local (LOCAL TESTING)

```bash
# Tạo file mới trong resource-management-server/
touch .env.local
```

Paste nội dung sau (thay bằng thông tin thật từ Supabase):

```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=my-super-secret-jwt-key-123456
ENCRYPTION_KEY=exactly-32-characters-key-!!!!
```

**⚠️ QUAN TRỌNG:**
- `ENCRYPTION_KEY` phải **ĐÚNG 32 KÝ TỰ** (không nhiều, không ít!)
- Ví dụ: `my-secret-encryption-key-12345!!` (đếm = 32 ký tự)

### 2.3. Test Local (Optional nhưng recommended)

```bash
cd "d:\backup project\elevenlab tool\resource-management-server"

# Install dependencies
npm install

# Run dev server
npm run dev
```

Mở http://localhost:3000 → Nếu thấy trang web = OK!

Ctrl+C để tắt.

---

## 🚀 BƯỚC 3: Deploy lên Vercel

### 3.1. Install Vercel CLI

```bash
# Mở terminal/PowerShell mới
npm install -g vercel
```

Đợi install xong.

### 3.2. Login Vercel

```bash
vercel login
```

Chọn phương thức login:
```
> GitHub (recommended)
  GitLab
  Bitbucket
  Email
```

Nhấn Enter → Mở browser → Authorize → Xong!

### 3.3. Deploy Project

```bash
cd "d:\backup project\elevenlab tool\resource-management-server"

# Deploy
vercel
```

#### Sẽ có các câu hỏi:

**1. Set up and deploy?**
```
> Yes
```

**2. Which scope?**
```
> [Your GitHub username] (hoặc Vercel account name)
```

**3. Link to existing project?**
```
> N (No - tạo mới)
```

**4. What's your project's name?**
```
> elevenlabs-resources (hoặc tên bạn thích)
Enter
```

**5. In which directory is your code located?**
```
> ./ (chỉ Enter - đúng thư mục hiện tại)
```

**6. Want to modify settings?**
```
> N (No)
```

Vercel sẽ bắt đầu build và deploy! Đợi 1-2 phút...

### 3.4. Kết Quả Deploy

Sau khi xong, bạn sẽ thấy:

```
✅ Deployment ready
   https://elevenlabs-resources-xxx.vercel.app

🔗 Preview:    https://elevenlabs-resources-xxx.vercel.app
🔗 Inspect:    https://vercel.com/...
```

**📋 COPY URL ĐÓ VÀ LƯU LẠI!**

Ví dụ: `https://elevenlabs-resources-abc123.vercel.app`

---

## 🔧 BƯỚC 4: Setup Environment Variables trên Vercel

### 4.1. Vào Vercel Dashboard

```
1. Mở https://vercel.com
2. Login (nếu chưa)
3. Click vào project "elevenlabs-resources"
4. Click tab "Settings"
5. Click "Environment Variables" trong menu trái
```

### 4.2. Thêm Variables

Click "+ Add New" và thêm từng biến sau:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
Name:  NEXT_PUBLIC_SUPABASE_URL
Value: https://[your-project-id].supabase.co
```
Click "Add"

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon key từ Supabase)
```
Click "Add"

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
```
Name:  SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key từ Supabase)
```
Click "Add"

#### Variable 4: JWT_SECRET
```
Name:  JWT_SECRET
Value: my-super-secret-jwt-key-123456
```
Click "Add"

#### Variable 5: ENCRYPTION_KEY
```
Name:  ENCRYPTION_KEY
Value: exactly-32-characters-key-!!!!
```
**⚠️ Phải đúng 32 ký tự!**
Click "Add"

### 4.3. Redeploy

```
1. Vào tab "Deployments"
2. Click vào deployment mới nhất (top)
3. Click "..." (3 dots) → "Redeploy"
4. Click "Redeploy" (confirm)
```

Đợi 1-2 phút để redeploy với environment variables mới.

---

## 👤 BƯỚC 5: Tạo Admin Account

### 5.1. Vào Trang Web

```
Mở browser → Vào:
https://your-app.vercel.app/init-admin
```

### 5.2. Tạo Admin

```
Username: admin
Password: [MẬT KHẨU MẠNH CỦA BẠN - LƯU LẠI!]

Click "Create Admin Account"
```

Thấy "Admin account created successfully!" = OK!

### 5.3. Verify Admin Login

```
1. Vào: https://your-app.vercel.app/login
2. Login với admin/password vừa tạo
3. Vào: https://your-app.vercel.app/dashboard
4. Thấy dashboard = OK!
```

---

## ✅ BƯỚC 6: Kết Nối Tool với Server

### 6.1. Copy Production URL

```
URL của bạn: https://elevenlabs-resources-xxx.vercel.app

VD thật:
https://elevenlabs-resources-abc123.vercel.app
```

### 6.2. Gửi URL cho tôi

**GỬI URL PRODUCTION CHO TÔI**, tôi sẽ:
1. ✅ Cập nhật `src/batch/account_manager.py`
2. ✅ Cập nhật `src/elevenlabs_account_fetcher.py`
3. ✅ Test kết nối

---

## 📊 Checklist Tổng Hợp

### Database Setup ✅
- [ ] Tạo Supabase project
- [ ] Copy URL, anon key, service_role key
- [ ] Chạy `schema.sql` trong SQL Editor
- [ ] Chạy `ADD_ELEVENLABS_ACCOUNTS.sql`
- [ ] Verify 6 tables tồn tại

### Vercel Deploy ✅
- [ ] Install Vercel CLI
- [ ] Login Vercel
- [ ] Deploy project (`vercel`)
- [ ] Copy production URL
- [ ] Thêm 5 environment variables
- [ ] Redeploy

### Admin Account ✅
- [ ] Vào `/init-admin`
- [ ] Tạo admin account
- [ ] Test login tại `/login`
- [ ] Vào dashboard thành công

### Tool Connection ✅
- [ ] Copy production URL
- [ ] Gửi URL cho tôi
- [ ] Tôi cập nhật code
- [ ] Test fetch accounts

---

## 🐛 Troubleshooting

### Lỗi "Failed to connect to database"
```
→ Check SUPABASE_URL có đúng không
→ Check service_role key có đúng không
→ Redeploy sau khi thêm env vars
```

### Lỗi "Cannot create admin"
```
→ Check database migrations đã chạy chưa
→ Check table "users" tồn tại chưa
→ Xem logs: vercel logs --follow
```

### Lỗi "Decryption failed"
```
→ ENCRYPTION_KEY phải đúng 32 ký tự!
→ Đếm: echo "your-key" | wc -c
→ Nếu sai, sửa lại và redeploy
```

### Deploy failed
```
→ Check package.json có đầy đủ dependencies
→ Check next.config.js tồn tại
→ Xem lỗi chi tiết trong Vercel dashboard
```

---

## 📞 Sau Khi Setup Xong

**GỬI CHO TÔI:**
```
✅ Supabase URL: https://xxx.supabase.co
✅ Vercel URL: https://your-app.vercel.app
✅ Admin username: admin
```

Tôi sẽ:
1. Cập nhật code tool kết nối tới server
2. Test login từ tool
3. Test fetch accounts
4. Confirm mọi thứ hoạt động!

---

**🎉 CHÚC BẠN SETUP THÀNH CÔNG!**

Làm theo từng bước, không vội, sẽ OK! 💪
