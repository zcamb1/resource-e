# ⚡ Quick Start - Setup trong 10 phút

## 📋 Chuẩn Bị

- [ ] Account GitHub (để login Vercel & Supabase)
- [ ] Notepad để lưu credentials

---

## 🗄️ 1. Supabase Database (3 phút)

### Tạo Project
```
https://supabase.com → New Project
Name: elevenlabs-resources
Region: Southeast Asia (Singapore)
Password: [STRONG_PASSWORD]
```

### Copy Credentials
```
Settings → API → Copy:
✅ Project URL
✅ anon public key
✅ service_role key
```

### Run SQL
```
SQL Editor → New Query →

1. Paste schema.sql → Run
2. New Query → Paste ADD_ELEVENLABS_ACCOUNTS.sql → Run

Table Editor → Check 6 tables exist
```

---

## 🚀 2. Deploy Vercel (5 phút)

### Install & Login
```bash
npm install -g vercel
vercel login
```

### Deploy
```bash
cd "d:\backup project\elevenlab tool\resource-management-server"
vercel
```

Trả lời:
```
Set up and deploy? Y
Link to existing? N
Project name? elevenlabs-resources
Directory? ./
Modify settings? N
```

**📋 COPY URL: `https://xxx.vercel.app`**

### Add Environment Variables
```
Vercel Dashboard → Project → Settings → Environment Variables

Add 5 variables:
1. NEXT_PUBLIC_SUPABASE_URL = [Supabase URL]
2. NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon key]
3. SUPABASE_SERVICE_ROLE_KEY = [service_role key]
4. JWT_SECRET = my-super-secret-jwt-key-123456
5. ENCRYPTION_KEY = exactly-32-characters-key-!!!!

Deployments → Redeploy
```

---

## 👤 3. Create Admin (1 phút)

```
https://your-app.vercel.app/init-admin

Username: admin
Password: [YOUR_PASSWORD]

Create → Login tại /login
```

---

## ✅ 4. Test

```
https://your-app.vercel.app/dashboard
→ Thấy dashboard = OK!
```

---

## 📤 5. Gửi Link Cho Tôi

```
GỬI CHO TÔI:
✅ Vercel URL: https://your-app.vercel.app
```

Tôi sẽ cập nhật code tool kết nối tới server! 🎉

---

**⏱️ Total: ~10 phút**
