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
    console.error('❌ Error: DATABASE_URL is not defined in your environment or .env.local file.');
    process.exit(1);
  }

  console.log('🔄 Connecting to Neon Postgres...');
  const sql = neon(dbUrl);

  // 1. Run 001_init.sql migration
  const migrationPath = path.join(process.cwd(), 'migrations', '001_init.sql');
  if (fs.existsSync(migrationPath)) {
    console.log('📄 Applying schema migration from migrations/001_init.sql...');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Split statements safely
    const statements = migrationSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await (sql as any).query(stmt);
    }
    console.log('✅ Schema migration applied successfully.');
  }

  // 2. Migrate Profile
  const profilePath = path.join(process.cwd(), 'data', 'profile.json');
  if (fs.existsSync(profilePath)) {
    console.log('👤 Reading existing profile from data/profile.json...');
    const raw = fs.readFileSync(profilePath, 'utf8');
    const profile = JSON.parse(raw);

    await sql`
      INSERT INTO profile (id, alias_ar, alias_en, name_ar, name_en, bio_ar, bio_en, linkedin, github, updated_at)
      VALUES (
        1,
        ${profile.alias_ar || ''},
        ${profile.alias_en || ''},
        ${profile.name_ar || ''},
        ${profile.name_en || ''},
        ${profile.bio_ar || ''},
        ${profile.bio_en || ''},
        ${profile.linkedin || ''},
        ${profile.github || ''},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        alias_ar = EXCLUDED.alias_ar,
        alias_en = EXCLUDED.alias_en,
        name_ar = EXCLUDED.name_ar,
        name_en = EXCLUDED.name_en,
        bio_ar = EXCLUDED.bio_ar,
        bio_en = EXCLUDED.bio_en,
        linkedin = EXCLUDED.linkedin,
        github = EXCLUDED.github,
        updated_at = NOW();
    `;
    console.log('✅ Profile successfully migrated to Neon.');
  } else {
    console.log('ℹ️ No data/profile.json found to migrate.');
  }

  // 3. Migrate Questions
  const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
  if (fs.existsSync(questionsPath)) {
    console.log('💬 Reading questions from data/questions.json...');
    const raw = fs.readFileSync(questionsPath, 'utf8');
    const questions: any[] = JSON.parse(raw);

    console.log(`Found ${questions.length} questions in local backup.`);

    // First insert questions without parents, then with parents to satisfy FK constraints
    const rootQuestions = questions.filter((q) => !q.parent_id);
    const childQuestions = questions.filter((q) => Boolean(q.parent_id));
    const sortedToInsert = [...rootQuestions, ...childQuestions];

    let insertedCount = 0;
    for (const q of sortedToInsert) {
      const isAnon = q.is_anonymous !== undefined ? Boolean(q.is_anonymous) : true;
      const asker = q.asker_name ? String(q.asker_name).trim() : 'Anonymous';
      const likes = Number(q.likes_count) || 0;
      const status = q.status === 'answered' || q.status === 'pending' || q.status === 'dismissed' ? q.status : 'pending';
      const createdAt = q.created_at ? new Date(q.created_at).toISOString() : new Date().toISOString();
      const answeredAt = q.answered_at ? new Date(q.answered_at).toISOString() : null;

      await sql`
        INSERT INTO questions (
          id, question_text, answer_text, status, is_anonymous, asker_name, likes_count, parent_id, created_at, answered_at
        )
        VALUES (
          ${q.id},
          ${q.question_text},
          ${q.answer_text || null},
          ${status},
          ${isAnon},
          ${asker},
          ${likes},
          ${q.parent_id || null},
          ${createdAt},
          ${answeredAt}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
      insertedCount++;
    }

    console.log(`✅ Processed ${insertedCount} questions into Neon Postgres table.`);
  } else {
    console.log('ℹ️ No data/questions.json found to migrate.');
  }

  console.log('\n🎉 Migration completed successfully! Local JSON files are preserved as backups.');
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err.message || err);
  process.exit(1);
});
