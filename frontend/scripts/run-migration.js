#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🔄 Running migration to add missing columns...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/20250101000001_add_subscription_status/migration.sql'),
      'utf8'
    );

    // Execute the migration SQL
    await prisma.$executeRawUnsafe(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify columns were added
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name IN ('User', 'users')
        AND column_name IN ('image', 'subscriptionStatus', 'subscriptionPlan', 'subscriptionEndDate', 'username')
      ORDER BY column_name;
    `;
    
    console.log('📊 Columns found:', result.map(r => r.column_name).join(', '));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('⚠️  Some columns may already exist. This is okay.');
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();


