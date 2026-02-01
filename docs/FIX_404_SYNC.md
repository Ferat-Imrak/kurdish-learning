# Fixing 404 Error in Progress Sync

## Issue
Mobile app getting `404` error when trying to sync progress from backend:
```
ERROR Failed to sync progress from backend: [AxiosError: Request failed with status code 404]
```

## Root Cause
The route order in `backend/src/routes/progress.ts` was incorrect. Express matches routes in order, and `/user` routes were defined AFTER `/:lessonId`, causing `/user` to be matched as a `lessonId` parameter.

## Fix Applied
✅ Moved `/user` routes BEFORE `/:lessonId` route
✅ Removed duplicate route definitions
✅ Added better error logging

## Route Order (Now Correct)
1. `router.get('/user', ...)` - Get all progress
2. `router.post('/user/sync', ...)` - Bulk sync
3. `router.post('/user/:lessonId', ...)` - Update single lesson
4. `router.post('/:lessonId', ...)` - Child-based (backward compatibility)

## Next Steps

### 1. Restart Backend Server
```bash
cd backend
# Stop current server (Ctrl+C)
npm run dev
```

### 2. Verify Routes Are Registered
Check backend logs for:
```
🚀 Server running on port 5001
📚 Kurdish Learning API is ready!
```

### 3. Test Endpoint Manually
```bash
# Get auth token first (login)
TOKEN="your_token_here"

# Test GET /api/progress/user
curl -X GET http://localhost:5001/api/progress/user \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

Expected: `{ "progress": {} }` (empty if no progress)

### 4. Check Mobile API URL
In mobile app logs, you should see:
```
🔗 API URL: http://localhost:5001/api
```

If using physical device, make sure:
- Backend is accessible from device (not `localhost`, use computer's IP)
- API URL in `.env` or `app.json` is correct

### 5. Verify Authentication
Make sure mobile app has valid auth token:
- User is logged in
- Token is stored in SecureStore
- Token is included in Authorization header

## Debugging

### Check Backend Logs
Look for:
- Route registration: `app.use('/api/progress', progressRoutes)`
- Request logs: Should see `GET /api/progress/user` requests
- Error logs: `Get user progress error:`

### Check Mobile Logs
Look for:
- `🔗 API URL: ...` - Confirms API URL
- `🔄 Syncing progress from backend...` - Confirms sync attempt
- `❌ Progress endpoint not found (404)` - Route issue
- `⚠️ Not authenticated` - Auth issue

### Common Issues

1. **Backend not running**
   - Solution: Start backend server

2. **Wrong API URL**
   - Solution: Check `EXPO_PUBLIC_API_URL` in mobile `.env` or `app.json`

3. **Route not registered**
   - Solution: Restart backend after code changes

4. **Authentication failed**
   - Solution: Re-login to get new token

5. **Network issue (mobile device)**
   - Solution: Use computer's IP address, not `localhost`

## Testing After Fix

1. Restart backend
2. Open mobile app
3. Login
4. Open any lesson
5. Check logs for sync messages
6. Should see: `✅ Synced X lessons from backend`


