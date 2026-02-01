-- AlterTable - Try both table names (User and users) to handle schema differences
DO $$ 
BEGIN
    -- Try to alter "User" table (if it exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
        ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "image" TEXT;
        ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "subscriptionPlan" TEXT DEFAULT 'MONTHLY';
        ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT DEFAULT 'ACTIVE';
        ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3);
        ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "username" TEXT;
        
        -- Create index if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_username_key') THEN
            CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");
        END IF;
    END IF;
    
    -- Try to alter "users" table (if it exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "image" TEXT;
        ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "subscriptionPlan" TEXT DEFAULT 'MONTHLY';
        ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT DEFAULT 'ACTIVE';
        ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3);
        ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "username" TEXT;
        
        -- Create index if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_username_key') THEN
            CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");
        END IF;
    END IF;
END $$;
