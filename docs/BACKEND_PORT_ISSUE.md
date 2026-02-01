# Backend Port Configuration Issue

## Problem
Mobile app is trying to connect to `http://10.0.0.45:8080/api`, but getting 404 for `/api/progress/user`.

## Root Cause
The backend is configured to run on port **5001** (default), but the mobile app is configured to use port **8080**.

## Solution

### Option 1: Update Backend to Use Port 8080 (Recommended for Mobile)

1. **Set PORT in backend `.env`**:
   ```bash
   cd backend
   echo "PORT=8080" >> .env
   ```

2. **Restart backend server**:
   ```bash
   npm run dev
   ```

3. **Verify backend is running on 8080**:
   ```bash
   curl http://localhost:8080/health
   ```

### Option 2: Update Mobile to Use Port 5001

1. **Update mobile `.env`**:
   ```bash
   cd mobile
   # Edit .env file
   EXPO_PUBLIC_API_URL=http://10.0.0.45:5001/api
   ```

2. **Restart mobile app** (Expo will pick up the new env var)

### Option 3: Use Environment-Specific Ports

**Backend `.env`**:
```env
PORT=5001
```

**Mobile `.env`** (for development):
```env
EXPO_PUBLIC_API_URL=http://10.0.0.45:5001/api
```

**Mobile `app.json`** (for production):
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.yourdomain.com/api"
    }
  }
}
```

## Current Status

- ✅ Backend routes are correctly ordered (fixed)
- ✅ `/api/progress/user` route exists
- ❌ Backend on port 8080 doesn't have the new routes (needs restart)
- ❌ Port mismatch between mobile (8080) and backend default (5001)

## Next Steps

1. **Decide on port**: Use 8080 or 5001 consistently
2. **Update configuration**: Set PORT in backend `.env` or update mobile `.env`
3. **Restart backend**: Ensure new routes are loaded
4. **Test**: Verify `/api/progress/user` endpoint works

## Testing

After fixing the port:

```bash
# Test with auth token
TOKEN="your_token_here"
curl -X GET http://10.0.0.45:8080/api/progress/user \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `{ "progress": {} }` (empty if no progress)


