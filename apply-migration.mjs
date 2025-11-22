#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import pg from 'pg';

config({ path: '.env.local' });

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: node apply-migration.mjs <migration-file>');
  process.exit(1);
}

async function applyMigration() {
  console.log(`📂 Reading: ${migrationFile}`);
  const sql = readFileSync(migrationFile, 'utf-8');

  console.log(`🔗 Connecting to database...`);
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log(`🚀 Applying migration...`);

    await client.query(sql);

    console.log(`✅ Migration applied successfully!`);
  } catch (error) {
    console.error(`❌ Migration failed:`, error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
