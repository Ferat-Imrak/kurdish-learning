# Fix Database Schema Issues

## Problem
Prisma errors indicating missing columns:
- `users.image` does not exist
- `users.subscriptionStatus` does not exist

## Root Cause
The database schema is out of sync with the Prisma schema. The initial migration created a `User` table (capital U) but Prisma expects `users` (lowercase), and the subscription fields were never added.

## Solution

### Option 1: Run the Migration (Recommended)

1. **Set DATABASE_URL** in frontend `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/kurdish_learning"
   ```

2. **Run the migration**:
   ```bash
   cd frontend
   npx prisma migrate deploy
   ```

   Or if you want to create a new migration:
   ```bash
   npx prisma migrate dev --name add_missing_user_fields
   ```

### Option 2: Manual SQL Fix

If migrations don't work, run this SQL directly on your database:

```sql
-- Check which table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('User', 'users');

-- Add columns to the correct table (replace 'User' or 'users' with actual table name)
ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "subscriptionPlan" TEXT DEFAULT 'MONTHLY';
ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT DEFAULT 'ACTIVE';
ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3);
ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Create unique index for username
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "public"."User"("username");
```

### Option 3: Reset and Recreate (⚠️ Deletes Data)

**WARNING: This will delete all data!**

```bash
cd frontend
npx prisma migrate reset
```

## Verify Fix

After running the migration, verify the columns exist:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('User', 'users')
ORDER BY column_name;
```

You should see:
- `image` (text, nullable)
- `subscriptionPlan` (text, nullable)
- `subscriptionStatus` (text, nullable)
- `subscriptionEndDate` (timestamp, nullable)
- `username` (text, nullable, unique)

## Next Steps

After fixing the schema:
1. Restart the frontend server
2. The Prisma errors should disappear
3. Progress sync should work correctly


