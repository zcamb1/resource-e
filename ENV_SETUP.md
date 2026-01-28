# 🔐 Environment Variables Setup

## Required Environment Variables

### 1. Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://hniirgxqqzltezdmzuyj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. JWT Secret (for user authentication)
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Generate a random JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. ⭐ API Secret Key (NEW - for tool authentication)
```env
API_SECRET_KEY=your-api-secret-key-here
```

**Generate a random API secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 Setup Instructions

### Local Development (.env.local)

Create file `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hniirgxqqzltezdmzuyj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaWlyZ3hxcXpsdGV6ZG16dXlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY4MTAyMSwiZXhwIjoyMDgzMjU3MDIxfQ.wH0_ypBSFd6Gy5NlKxhMxLFhIo6RG407WCjhCEE-Gk8
JWT_SECRET=dev-jwt-secret-change-in-production
API_SECRET_KEY=dev-api-key-change-in-production
```

### Vercel Production

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add these variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hniirgxqqzltezdmzuyj.supabase.co` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (full key) | Production |
| `JWT_SECRET` | (generated random string) | Production |
| `API_SECRET_KEY` | (generated random string) | Production |

3. **Redeploy** after adding variables

---

## 🔧 Tool Configuration

### Python Tool (.env or config)

Create `.env` file in tool root:

```env
# Resource Management Server
RESOURCE_SERVER_URL=https://your-app.vercel.app
API_SECRET_KEY=same-key-as-vercel-api-secret-key
```

### Or pass directly in code:

```python
from src.resource_fetcher import ResourceFetcher

fetcher = ResourceFetcher(
    server_url="https://your-app.vercel.app",
    api_secret_key="your-api-secret-key-here"
)
```

---

## ✅ Verification

Test API key authentication:

```bash
# Without API key (should fail with 401)
curl https://your-app.vercel.app/api/resources/some-user-id

# With API key (should work)
curl -H "X-API-Key: your-api-key" \
     https://your-app.vercel.app/api/resources/some-user-id
```

---

## 🔐 Security Best Practices

1. ✅ **Never commit** `.env.local` to Git
2. ✅ Use **different keys** for dev and production
3. ✅ **Rotate keys** periodically (every 3-6 months)
4. ✅ Store production keys in Vercel only
5. ✅ Share API_SECRET_KEY securely (password manager, not Slack/email)

---

## 🚨 If API Key is Compromised

1. Generate new API key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Update in Vercel → Environment Variables → API_SECRET_KEY

3. Redeploy application

4. Update all tools with new API key

5. Old API key will stop working immediately

---

## 📝 Summary

**3 Security Layers:**
1. 🔐 **API Secret Key** - Tool authentication (X-API-Key header)
2. 🔑 **JWT Token** - User authentication (Bearer token)
3. 🗄️ **Supabase RLS** - Database row-level security

All 3 layers work together for maximum security! 🛡️





