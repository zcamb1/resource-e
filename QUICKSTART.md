# 🚀 Quick Start Guide

Setup Resource Management Server trong 10 phút!

## 📋 Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account
- [ ] Vercel account (cho deployment)

## Step 1: Setup Supabase (5 phút)

### 1.1 Tạo Project

1. Đi tới https://supabase.com
2. "New Project"
3. Đặt tên: `elevenlabs-resources`
4. Chọn region gần nhất
5. Set database password (lưu lại!)
6. "Create Project"

### 1.2 Run Database Schema

1. Vào Project → "SQL Editor"
2. Copy toàn bộ nội dung từ `database/schema.sql`
3. Paste vào editor
4. Click "Run"
5. ✅ Thấy "Success" → Done!

### 1.3 Lấy API Keys

Vào Project Settings → API:
- Copy `URL` → Save
- Copy `anon public` → Save
- Copy `service_role` (secret!) → Save

## Step 2: Setup Local Development (3 phút)

### 2.1 Install Dependencies

```bash
cd resource-management-server
npm install
```

### 2.2 Create .env.local

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=change-this-to-random-string
```

**Generate JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Run Development Server

```bash
npm run dev
```

Open: http://localhost:3000

## Step 3: Test API (2 phút)

### 3.1 Health Check

```bash
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok",...}`

### 3.2 Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 3.3 Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Save `user_id` và `token` từ response!

### 3.4 Add Test Resources

Vào Supabase → Table Editor:

**Add API Key:**
```sql
INSERT INTO api_keys (user_id, api_key, provider, credits, is_active)
VALUES ('your-user-id', 'sk_test123456789', 'elevenlabs', 10000, true);
```

**Add Proxy:**
```sql
INSERT INTO proxies (user_id, proxy_type, host, port, is_active)
VALUES ('your-user-id', 'http', '1.2.3.4', 8080, true);
```

### 3.5 Get Resources

```bash
curl http://localhost:3000/api/resources/your-user-id \
  -H "Authorization: Bearer your-token"
```

Expected: List of API keys & proxies!

## Step 4: Deploy to Vercel (Optional)

```bash
vercel
```

Follow prompts, add environment variables when asked.

## Step 5: Integrate with Tool

### 5.1 Copy Resource Fetcher

```bash
cp tool-integration/resource_fetcher.py ../src/
```

### 5.2 Update Server URL

Edit `src/resource_fetcher.py`:

```python
fetcher = ResourceFetcher(
    server_url="https://your-project.vercel.app"  # Or http://localhost:3000 for dev
)
```

### 5.3 Add to Tool

Follow `tool-integration/INTEGRATION_GUIDE.md`

## ✅ Done!

Tool sẽ tự động:
1. Fetch API keys từ server
2. Fetch proxies từ server
3. Fetch rotating proxy keys từ server

## 🎯 Next Steps

### Add Resources via Supabase UI

Vào Supabase → Table Editor:

**api_keys table:**
- Add ElevenLabs API keys của bạn

**proxies table:**
- Add proxy servers

**rotating_proxy_keys table:**
- Add proxy rotating keys (proxyxoay.shop)

### Tool sẽ tự động fetch!

Khi tool khởi động:
```
[ResourceFetch] 🌐 Auto-fetching resources from server...
[ResourceFetch] ✅ Added 10 API keys
[ResourceFetch] ✅ Added 5 proxies
[ResourceFetch] ✅ Started 2 rotating proxy key(s)
```

## 📚 Full Documentation

- API Reference: `README.md`
- Tool Integration: `tool-integration/INTEGRATION_GUIDE.md`
- Deployment: `DEPLOYMENT.md`
- Database Schema: `database/schema.sql`

## 🆘 Troubleshooting

### "Supabase connection failed"

Check:
- `.env.local` có đúng URL và keys không
- Supabase project đang chạy không

### "Unauthorized" error

- Token expired (30 days) → Login lại
- JWT_SECRET khác nhau giữa local và production → Sync lại

### "No resources fetched"

- Check user đã có resources trong Supabase chưa
- Verify `user_id` đúng không
- Check `is_active = true` trong database

## 💡 Tips

1. **Multiple Users**: Mỗi user có resources riêng
2. **Resource Updates**: Realtime, không cần restart tool
3. **Security**: JWT tokens expire sau 30 ngày
4. **Backup**: Export Supabase database định kỳ

## 🎉 Enjoy!

Questions? Issues? Check GitHub Issues or Discord!


