# Deployment Guide - Vercel

Hướng dẫn deploy Resource Management Server lên Vercel.

## Prerequisites

1. Account Vercel: https://vercel.com
2. Supabase project đã setup (xem README.md)
3. Git repository (optional, có thể deploy trực tiếp)

## Step 1: Cài Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login Vercel

```bash
vercel login
```

## Step 3: Setup Environment Variables

Tạo file `.env.local` (hoặc config trên Vercel dashboard):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-random-secret-key-here
```

## Step 4: Deploy

### Option A: Deploy qua CLI

```bash
cd resource-management-server
vercel
```

Vercel sẽ hỏi:
- Project name: `elevenlabs-resource-manager`
- Framework: Next.js (auto-detect)
- Deploy: Yes

### Option B: Deploy qua Git

1. Push code lên GitHub/GitLab
2. Vào Vercel Dashboard
3. "New Project" → Import từ Git
4. Chọn repository
5. Add environment variables
6. Deploy!

## Step 5: Set Environment Variables trên Vercel

Vào Project Settings → Environment Variables, thêm:

```
NEXT_PUBLIC_SUPABASE_URL = https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
JWT_SECRET = your-secret-key
```

## Step 6: Verify Deployment

Visit: `https://your-project.vercel.app`

Test API:
```bash
curl https://your-project.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "ElevenLabs Resource Manager",
  "version": "1.0.0"
}
```

## Step 7: Update Tool Config

Trong file `resource_fetcher.py`, update:

```python
fetcher = ResourceFetcher(
    server_url="https://your-project.vercel.app"
)
```

## Testing

### 1. Register User

```bash
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login

```bash
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Save the `token` từ response.

### 3. Get Resources

```bash
curl https://your-project.vercel.app/api/resources/{user_id} \
  -H "Authorization: Bearer {token}"
```

## Troubleshooting

### Error: Supabase connection failed

- Check `NEXT_PUBLIC_SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY`
- Verify Supabase project is running

### Error: JWT verification failed

- Check `JWT_SECRET` is set correctly
- Make sure token is not expired (30 days)

### Error: CORS issues

Vercel Next.js API routes handle CORS automatically. Nếu vẫn có issue, thêm headers trong `route.ts`:

```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json({...});
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

## Production Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations run
- [ ] Sample admin user created
- [ ] API endpoints tested
- [ ] Tool integration tested
- [ ] Monitoring setup (optional)
- [ ] Custom domain configured (optional)

## Monitoring

Vercel provides:
- Real-time logs
- Analytics
- Performance metrics

Access via: Vercel Dashboard → Your Project → Analytics

## Updates

Để update server:

```bash
git push origin main
```

Vercel sẽ tự động rebuild và deploy.

Hoặc:

```bash
vercel --prod
```

## Support

Issues? Check:
- Vercel logs: `vercel logs`
- Supabase logs: Supabase Dashboard → Logs
- Server logs: Vercel Dashboard → Deployments → View Logs


