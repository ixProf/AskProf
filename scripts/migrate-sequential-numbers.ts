import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load .env.local first, then fallback to .env
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL is not defined.');
    process.exit(1);
  }

  console.log('🔄 Connecting to Neon Postgres...');
  const sql = neon(dbUrl);

  // 1. Run 002_add_display_number.sql
  console.log('📄 Applying schema migration from migrations/002_add_display_number.sql...');
  const migrationPath = path.join(process.cwd(), 'migrations', '002_add_display_number.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  const statements = migrationSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await (sql as any).query(stmt);
  }
  console.log('✅ Schema migration applied.');

  // 2. Fetch existing answered questions ordered by answered_at / created_at
  const rows = await sql`
    SELECT id, question_text, answered_at, created_at, display_number
    FROM questions
    WHERE status = 'answered'
    ORDER BY COALESCE(answered_at, created_at) ASC;
  `;

  console.log(`📊 Found ${rows.length} answered questions to assign sequential numbers.`);

  let maxNum = 0;
  for (let i = 0; i < rows.length; i++) {
    const q = rows[i];
    const seqNum = i + 1;
    maxNum = seqNum;

    await sql`
      UPDATE questions
      SET display_number = ${seqNum}
      WHERE id = ${q.id};
    `;

    console.log(`  ✓ Assigned #${seqNum} -> ID: ${q.id} ("${q.question_text.slice(0, 30)}...")`);
  }

  // 3. Update sequence to maxNum + 1 (or 1 if no questions)
  const nextVal = Math.max(maxNum, 1);
  await sql`
    SELECT setval('questions_display_number_seq', ${nextVal}, true);
  `;
  console.log(`🔢 Sequence 'questions_display_number_seq' set to ${nextVal} (next will be ${nextVal + 1}).`);

  console.log('🎉 Migration completed successfully!');
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
