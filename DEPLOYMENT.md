# Deployment Guide

This guide covers deploying the Kurdish Learning App to production.

## 🚀 Quick Deploy Options

### Option 1: Vercel + Railway (Recommended)

**Frontend (Vercel):**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**Backend (Railway):**
1. Connect your GitHub repository to Railway
2. Add PostgreSQL database service
3. Set environment variables
4. Deploy automatically

### Option 2: Docker Compose (Self-hosted)

```bash
# Clone repository
git clone <your-repo-url>
cd kurdish-learning-app

# Set up environment variables
cp frontend/env.example frontend/.env.local
cp backend/env.example backend/.env

# Start with Docker Compose
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Git
- Docker (optional)

## 🔧 Environment Setup

### Frontend (.env.local or Vercel env)
- **Register on Vercel:** The app uses the frontend’s own `/api/register` (no separate backend needed for sign-up). Set **DATABASE_URL** on Vercel to your Postgres URL so register and NextAuth login work.
- **Backend base URL (optional):** If you deploy the backend and want progress/games/achievements from it, set **NEXT_PUBLIC_API_URL** = `https://YOUR-BACKEND-URL/api` (e.g. `https://your-app.railway.app/api`).

```env
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api   # optional, for progress/games
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

## 🗄️ Database Setup

### Local Development
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### Production
```bash
npx prisma migrate deploy
npx prisma db seed
```

## 🌐 Domain Configuration

### Custom Domain (Vercel)
1. Add domain in Vercel dashboard
2. Update DNS records
3. Configure SSL certificate

### Subdomain Setup
- Frontend: `app.yourdomain.com`
- Backend: `api.yourdomain.com`

## 📱 PWA Configuration

### Service Worker
The app includes a service worker for offline functionality:
- Caches static assets
- Enables offline lesson access
- Provides push notifications

### App Icons
Generate app icons in multiple sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use strong JWT secrets
- Rotate secrets regularly

### CORS Configuration
```javascript
// Backend CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
```

### Rate Limiting
```javascript
// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

## 📊 Monitoring & Analytics

### Error Tracking
- Sentry integration for error monitoring
- Log aggregation with services like LogRocket

### Performance Monitoring
- Vercel Analytics for frontend
- Custom metrics for backend API

### User Analytics
- Google Analytics (optional)
- Custom learning progress tracking

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: railway-app/railway-action@v1
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:e2e
```

### Backend Tests
```bash
cd backend
npm run test
npm run test:integration
```

## 📈 Scaling Considerations

### Database
- Use connection pooling
- Consider read replicas for heavy read workloads
- Implement database indexing

### CDN
- Use Vercel Edge Network
- Consider CloudFlare for additional caching

### Caching
- Implement Redis for session storage
- Use CDN for static assets
- Cache API responses where appropriate

## 🆘 Troubleshooting

### Common Issues

**Database Connection Errors:**
- Check DATABASE_URL format
- Verify database server is running
- Check firewall settings

**CORS Errors:**
- Verify FRONTEND_URL matches actual domain
- Check HTTPS vs HTTP protocol

**Build Failures:**
- Check Node.js version compatibility
- Verify all environment variables are set
- Check for TypeScript errors

### Support
- Check logs in deployment platform
- Use debugging tools in development
- Monitor error tracking service

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
