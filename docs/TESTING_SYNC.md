# Testing Progress Sync Functionality

## Prerequisites

1. **Backend server running**
   ```bash
   cd backend
   npm run dev
   # Should be running on http://localhost:5001
   ```

2. **Database connected** (PostgreSQL)

3. **Test user account** (or use existing)

## Automated Testing

### Run Test Script

```bash
# Using default test credentials
node scripts/test-progress-sync.js

# Using custom credentials
node scripts/test-progress-sync.js user@example.com password123
```

The script will test:
- ✅ Login authentication
- ✅ GET /api/progress/user (fetch all progress)
- ✅ POST /api/progress/user/:lessonId (update single lesson)
- ✅ POST /api/progress/user/sync (bulk sync)
- ✅ Merge logic (conflicting progress)

## Manual Testing

### 1. Test Backend Endpoints

#### Get All Progress
```bash
curl -X GET http://localhost:5001/api/progress/user \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "progress": {
    "lesson-id-1": {
      "lessonId": "lesson-id-1",
      "progress": 50,
      "status": "IN_PROGRESS",
      "lastAccessed": "2024-01-01T00:00:00.000Z",
      "score": 50,
      "timeSpent": 10
    }
  }
}
```

#### Update Single Lesson
```bash
curl -X POST http://localhost:5001/api/progress/user/nature \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progress": 75,
    "status": "IN_PROGRESS",
    "score": 75,
    "timeSpent": 15
  }'
```

#### Bulk Sync
```bash
curl -X POST http://localhost:5001/api/progress/user/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progress": {
      "nature": {
        "progress": 80,
        "status": "IN_PROGRESS",
        "score": 80,
        "timeSpent": 20,
        "lastAccessed": "2024-01-01T00:00:00.000Z"
      },
      "colors": {
        "progress": 100,
        "status": "COMPLETED",
        "score": 100,
        "timeSpent": 30,
        "lastAccessed": "2024-01-01T00:00:00.000Z"
      }
    }
  }'
```

### 2. Test Frontend Sync

1. **Open frontend** (http://localhost:3000)
2. **Login** with test account
3. **Open browser DevTools** → Network tab
4. **Complete a lesson** (e.g., Nature)
5. **Check Network requests**:
   - Should see `POST /api/progress/user/sync` after 2 seconds
   - Should see progress saved to localStorage
6. **Refresh page**:
   - Should see `GET /api/progress/user` on mount
   - Progress should be restored from backend

### 3. Test Mobile Sync

1. **Open mobile app**
2. **Login** with same account
3. **Complete a lesson** (e.g., Nature)
4. **Check logs** for sync activity:
   ```bash
   # In terminal running Expo
   # Look for: "Failed to sync progress" or sync success
   ```
5. **Check AsyncStorage** (if using React Native Debugger)

### 4. Test Cross-Platform Sync

#### Scenario: Desktop → Mobile
1. **On Desktop**: Complete "Nature" lesson → 50% progress
2. **Wait 2 seconds** (for sync to complete)
3. **On Mobile**: Open "Nature" lesson
4. **Expected**: Should show 50% progress (synced from backend)

#### Scenario: Conflicting Progress
1. **On Desktop**: Complete "Nature" → 50% progress
2. **On Mobile**: Complete "Nature" → 100% progress
3. **On Desktop**: Refresh page
4. **Expected**: Should show 100% (highest progress wins)

#### Scenario: Time Accumulation
1. **On Desktop**: Spend 10 minutes in "Nature" → timeSpent: 10
2. **On Mobile**: Spend 5 minutes in "Nature" → timeSpent: 15 (accumulated)
3. **Check backend**: Should show timeSpent: 15

### 5. Test Offline Mode

1. **Disable network** (airplane mode or disable WiFi)
2. **Make progress** on lesson
3. **Check localStorage/AsyncStorage**: Should save locally
4. **Re-enable network**
5. **Wait 2 seconds**: Should sync to backend automatically

## Expected Behaviors

### ✅ Success Cases

- Progress syncs between desktop and mobile
- Highest progress value is preserved
- Time spent accumulates across sessions
- Latest timestamp is used for conflicts
- COMPLETED status is preserved
- Offline changes sync when online

### ❌ Error Cases (Should Handle Gracefully)

- No internet connection → Continue with local storage
- Backend down → Continue with local storage
- Invalid token → Skip sync, use local storage
- Network timeout → Retry or skip

## Debugging

### Check Backend Logs
```bash
# Backend should log:
# - "Get user progress error:" (if error)
# - "Update user progress error:" (if error)
# - "Sync progress error:" (if error)
```

### Check Frontend Console
```javascript
// Should see:
// - "Failed to sync progress from backend:" (if error)
// - "Failed to sync progress to backend:" (if error)
```

### Check Mobile Logs
```bash
# Expo logs should show:
# - "Failed to sync progress from backend:" (if error)
# - "Failed to sync progress to backend:" (if error)
```

### Check Database
```sql
-- Check progress table
SELECT * FROM progress WHERE "childId" IN (
  SELECT id FROM children WHERE "parentId" = 'USER_ID'
);

-- Check if default child was created
SELECT * FROM children WHERE "parentId" = 'USER_ID' AND name = 'Default';
```

## Common Issues

### Issue: "Unauthorized" error
**Solution**: Check that token is valid and included in Authorization header

### Issue: Progress not syncing
**Solution**: 
- Check network connection
- Check backend is running
- Check token is valid
- Check browser console for errors

### Issue: Progress resets on reload
**Solution**: This is expected until we apply the helper utility to restore refs

### Issue: Merge not working correctly
**Solution**: Check merge logic in `mergeProgress` function

## Next Steps After Testing

Once sync is verified working:
1. Apply progress helper utility to lessons
2. Fix ref restoration
3. Implement unique audio tracking
4. Test end-to-end progress persistence


