# Fix Registration Error on peyvi.com

## Problem
The frontend is deployed as a static export, so Next.js API routes (`/api/register`) don't work. The frontend needs to call the backend API directly.

## Solution

### 1. Set Backend API URL

Create/update `frontend/.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_API_URL/api
```

**For production, you need your backend API URL.** This should be:
- Your ECS/EC2 backend URL (once deployed)
- Or your API Gateway URL (if using Lambda)

**For now (testing):** Use your backend URL from Terraform outputs:
```bash
cd infrastructure/prod
terraform output database_endpoint
# Use this to construct your API URL
```

### 2. Update Backend Database Schema

The backend schema has been updated to include `passwordHash` and `subscriptionEndDate`. Run migrations:

```bash
cd backend
npx prisma migrate dev --name add_password_and_subscription
npx prisma generate
```

### 3. Rebuild Frontend with API URL

```bash
cd frontend
# Set the API URL
echo "NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_URL/api" > .env.production

# Build
npm run build

# Deploy to S3
cd ../infrastructure/prod
BUCKET=$(terraform output -raw frontend_s3_bucket)
cd ../../frontend
aws s3 sync out/ s3://$BUCKET/ --delete

# Invalidate CloudFront
cd ../infrastructure/prod
DIST_ID=$(terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

### 4. Deploy Backend

You still need to deploy your backend API. The backend should be accessible at a URL that the frontend can call.

**Quick fix for testing:** If your backend is running locally, you can't use it from peyvi.com. You need to deploy the backend to AWS first.

## What Was Fixed

1. ✅ Frontend now calls `${API_BASE_URL}/auth/register` instead of `/api/register`
2. ✅ Backend schema updated with `passwordHash` and `subscriptionEndDate`
3. ✅ Backend registration route stores password hash and subscription info

## Next Steps

1. **Deploy backend API** to AWS (ECS/EC2/Lambda)
2. **Set `NEXT_PUBLIC_API_URL`** in frontend build
3. **Rebuild and redeploy** frontend
4. **Run database migrations** on backend

