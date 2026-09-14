import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { Question, QuestionSubmission, FeedStats, ProfileBio } from '@/types/question';

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Please configure it in your environment variables.');
  }
  return neon(connectionString);
}

const DEFAULT_PROFILE: ProfileBio = {
  alias_ar: 'Prof',
  alias_en: 'Prof',
  name_ar: 'Mahmoud Sayed Mohamed',
  name_en: 'Mahmoud Sayed Mohamed',
  bio_ar:
    "I'm Mahmoud, but most people call me Prof. I'm a software developer who likes building things, trying new ideas, and figuring stuff out along the way. If you have a question, opinion, criticism, advice, or just something you want to say — go ahead. I'm listening.",
  bio_en:
    "I'm Mahmoud, but most people call me Prof. I'm a software developer who likes building things, trying new ideas, and figuring stuff out along the way. If you have a question, opinion, criticism, advice, or just something you want to say — go ahead. I'm listening.",
  linkedin: 'https://www.linkedin.com/in/mahmoud-sayed-mohamed',
  github: 'https://github.com/ixProf',
};

interface QuestionDbRow {
  id: string;
  question_text: string;
  answer_text: string | null;
  status: 'pending' | 'answered' | 'dismissed';
  is_anonymous: boolean;
  asker_name: string;
  likes_count: number | string;
  parent_id: string | null;
  parent_question_text?: string | null;
  display_number?: number | string | null;
  created_at: string | Date;
  answered_at: string | Date | null;
}

function formatQuestionRow(row: QuestionDbRow): Question {
  return {
    id: row.id,
    question_text: row.question_text,
    answer_text: row.answer_text,
    status: row.status,
    is_anonymous: Boolean(row.is_anonymous),
    asker_name: row.asker_name,
    likes_count: Number(row.likes_count) || 0,
    parent_id: row.parent_id || null,
    parent_question_text: row.parent_question_text || null,
    display_number: row.display_number != null ? Number(row.display_number) : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    answered_at: row.answered_at ? new Date(row.answered_at).toISOString() : null,
  };
}

/**
 * Get profile information
 */
export async function getProfile(): Promise<ProfileBio> {
  const sql = getSql();
  try {
    const rows = await sql`
      SELECT alias_ar, alias_en, name_ar, name_en, bio_ar, bio_en, linkedin, github
      FROM profile
      WHERE id = 1
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return DEFAULT_PROFILE;
    }

    const p = rows[0] as unknown as ProfileBio;
    return {
      alias_ar: p.alias_ar,
      alias_en: p.alias_en,
      name_ar: p.name_ar,
      name_en: p.name_en,
      bio_ar: p.bio_ar,
      bio_en: p.bio_en,
      linkedin: p.linkedin,
      github: p.github,
    };
  } catch (error) {
    console.error('Error fetching profile from database:', error);
    return DEFAULT_PROFILE;
  }
}

/**
 * Update profile information
 */
export async function updateProfile(bio: Partial<ProfileBio>): Promise<ProfileBio> {
  const current = await getProfile();
  const updated: ProfileBio = { ...current, ...bio };
  const sql = getSql();

  await sql`
    INSERT INTO profile (id, alias_ar, alias_en, name_ar, name_en, bio_ar, bio_en, linkedin, github, updated_at)
    VALUES (
      1,
      ${updated.alias_ar},
      ${updated.alias_en},
      ${updated.name_ar},
      ${updated.name_en},
      ${updated.bio_ar},
      ${updated.bio_en},
      ${updated.linkedin},
      ${updated.github},
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

  return updated;
}

/**
 * Get all answered questions for the public feed with parent question context
 */
export async function getAnsweredQuestions(
  sort: 'recent' | 'liked' = 'recent',
  searchQuery?: string
): Promise<Question[]> {
  const sql = getSql();

  let rows: unknown[];

  if (searchQuery && searchQuery.trim()) {
    const term = `%${searchQuery.trim()}%`;
    if (sort === 'liked') {
      rows = await sql`
        SELECT 
          q.id, q.question_text, q.answer_text, q.status, q.is_anonymous, 
          q.asker_name, q.likes_count, q.parent_id, q.display_number, q.created_at, q.answered_at,
          p.question_text AS parent_question_text
        FROM questions q
        LEFT JOIN questions p ON q.parent_id = p.id
        WHERE q.status = 'answered'
          AND (
            q.question_text ILIKE ${term}
            OR (q.answer_text IS NOT NULL AND q.answer_text ILIKE ${term})
            OR q.asker_name ILIKE ${term}
          )
        ORDER BY q.likes_count DESC, q.created_at DESC;
      `;
    } else {
      rows = await sql`
        SELECT 
          q.id, q.question_text, q.answer_text, q.status, q.is_anonymous, 
          q.asker_name, q.likes_count, q.parent_id, q.display_number, q.created_at, q.answered_at,
          p.question_text AS parent_question_text
        FROM questions q
        LEFT JOIN questions p ON q.parent_id = p.id
        WHERE q.status = 'answered'
          AND (
            q.question_text ILIKE ${term}
            OR (q.answer_text IS NOT NULL AND q.answer_text ILIKE ${term})
            OR q.asker_name ILIKE ${term}
          )
        ORDER BY COALESCE(q.answered_at, q.created_at) DESC;
      `;
    }
  } else {
    if (sort === 'liked') {
      rows = await sql`
        SELECT 
          q.id, q.question_text, q.answer_text, q.status, q.is_anonymous, 
          q.asker_name, q.likes_count, q.parent_id, q.display_number, q.created_at, q.answered_at,
          p.question_text AS parent_question_text
        FROM questions q
        LEFT JOIN questions p ON q.parent_id = p.id
        WHERE q.status = 'answered'
        ORDER BY q.likes_count DESC, q.created_at DESC;
      `;
    } else {
      rows = await sql`
        SELECT 
          q.id, q.question_text, q.answer_text, q.status, q.is_anonymous, 
          q.asker_name, q.likes_count, q.parent_id, q.display_number, q.created_at, q.answered_at,
          p.question_text AS parent_question_text
        FROM questions q
        LEFT JOIN questions p ON q.parent_id = p.id
        WHERE q.status = 'answered'
        ORDER BY COALESCE(q.answered_at, q.created_at) DESC;
      `;
    }
  }

  return (rows as unknown as QuestionDbRow[]).map(formatQuestionRow);
}

/**
 * Public: Get a single answered question by ID (sequential number or opaque ID)
 */
export async function getAnsweredQuestionById(id: string): Promise<Question | null> {
  const sql = getSql();
  const isNumeric = /^\d+$/.test(id.trim());

  let rows: unknown[];
  if (isNumeric) {
    const num = parseInt(id.trim(), 10);
    rows = await sql`
      SELECT 
        q.id, q.question_text, q.answer_text, q.status, q.is_anonymous, 
        q.asker_name, q.likes_count, q.parent_id, q.display_number, q.created_at, q.answered_at,
        p.question_text AS parent_question_text
      FROM questions q
      LEFT JOIN questions p ON q.parent_id = p.id
      WHERE q.display_number = ${num} AND q.status = 'answered'
      LIMIT 1;
    `;
  } else {
    rows = await sql`
      SELECT 
        q.id, q.question_text, q.answer_text, q.status, q.is_anonymous, 
        q.asker_name, q.likes_count, q.parent_id, q.display_number, q.created_at, q.answered_at,
        p.question_text AS parent_question_text
      FROM questions q
      LEFT JOIN questions p ON q.parent_id = p.id
      WHERE q.id = ${id} AND q.status = 'answered'
      LIMIT 1;
    `;
  }

  if (rows.length === 0) return null;
  return formatQuestionRow(rows[0] as unknown as QuestionDbRow);
}

/**
 * Public: Calculate feed statistics
 */
export async function getFeedStats(): Promise<FeedStats> {
  const sql = getSql();
  try {
    const rows = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'answered')::int AS total_answered,
        COALESCE(SUM(likes_count) FILTER (WHERE status = 'answered'), 0)::int AS total_likes,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS total_pending
      FROM questions;
    `;

    if (rows.length === 0) {
      return { total_answered: 0, total_likes: 0, total_pending: 0 };
    }

    const stat = rows[0] as { total_answered: number; total_likes: number; total_pending: number };
    return {
      total_answered: Number(stat.total_answered) || 0,
      total_likes: Number(stat.total_likes) || 0,
      total_pending: Number(stat.total_pending) || 0,
    };
  } catch (error) {
    console.error('Error fetching feed stats from database:', error);
    return { total_answered: 0, total_likes: 0, total_pending: 0 };
  }
}

/**
 * Public: Increment likes on an answered question
 */
export async function incrementLike(id: string): Promise<Question | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE questions
    SET likes_count = likes_count + 1
    WHERE id = ${id} AND status = 'answered'
    RETURNING id, question_text, answer_text, status, is_anonymous, asker_name, likes_count, parent_id, created_at, answered_at;
  `;

  if (rows.length === 0) return null;

  const row = rows[0] as unknown as QuestionDbRow;
  let parentQuestionText: string | null = null;
  if (row.parent_id) {
    const parentRows = await sql`
      SELECT question_text FROM questions WHERE id = ${row.parent_id} LIMIT 1;
    `;
    if (parentRows.length > 0) {
      parentQuestionText = String(parentRows[0].question_text);
    }
  }

  return formatQuestionRow({ ...row, parent_question_text: parentQuestionText });
}

/**
 * Public: Submit a new question (status is ALWAYS pending)
 */
export async function createQuestion(submission: QuestionSubmission): Promise<Question> {
  const sql = getSql();
  const isAnon = submission.is_anonymous !== undefined ? submission.is_anonymous : !submission.asker_name;
  const asker = isAnon || !submission.asker_name?.trim() ? 'Anonymous' : submission.asker_name.trim();

  // Validate parent_id if provided
  let parentId: string | null = null;
  if (submission.parent_id) {
    const parentRows = await sql`
      SELECT id FROM questions WHERE id = ${submission.parent_id} LIMIT 1;
    `;
    if (parentRows.length > 0) {
      parentId = submission.parent_id;
    }
  }

  const id = `q-${crypto.randomBytes(6).toString('hex')}`;
  const questionText = submission.question_text.trim();

  const rows = await sql`
    INSERT INTO questions (
      id, question_text, answer_text, status, is_anonymous, asker_name, likes_count, parent_id, created_at, answered_at
    )
    VALUES (
      ${id},
      ${questionText},
      NULL,
      'pending',
      ${isAnon},
      ${asker},
      0,
      ${parentId},
      NOW(),
      NULL
    )
    RETURNING *;
  `;

  return formatQuestionRow(rows[0] as unknown as QuestionDbRow);
}

/**
 * Admin: Get all questions partitioned into pending and answered
 */
export async function getAllQuestionsAdmin(): Promise<{ pending: Question[]; answered: Question[] }> {
  const sql = getSql();
  const rows = await sql`
    SELECT 
      q.id, q.question_text, q.answer_text, q.status, q.is_anonymous, 
      q.asker_name, q.likes_count, q.parent_id, q.display_number, q.created_at, q.answered_at,
      p.question_text AS parent_question_text
    FROM questions q
    LEFT JOIN questions p ON q.parent_id = p.id
    ORDER BY q.created_at DESC;
  `;

  const all = (rows as unknown as QuestionDbRow[]).map(formatQuestionRow);

  const pending = all
    .filter((q) => q.status === 'pending')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const answered = all
    .filter((q) => q.status === 'answered')
    .sort((a, b) => {
      const timeA = a.answered_at ? new Date(a.answered_at).getTime() : new Date(a.created_at).getTime();
      const timeB = b.answered_at ? new Date(b.answered_at).getTime() : new Date(b.created_at).getTime();
      return timeB - timeA;
    });

  return { pending, answered };
}

/**
 * Admin: Answer and publish a question, or update an existing answer
 */
export async function answerAndPublishQuestion(id: string, answerText: string): Promise<Question | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE questions
    SET 
      answer_text = ${answerText.trim()},
      status = 'answered',
      answered_at = COALESCE(answered_at, NOW()),
      display_number = COALESCE(display_number, nextval('questions_display_number_seq'))
    WHERE id = ${id}
    RETURNING *;
  `;

  if (rows.length === 0) return null;

  const row = rows[0] as unknown as QuestionDbRow;
  let parentQuestionText: string | null = null;
  if (row.parent_id) {
    const parentRows = await sql`
      SELECT question_text FROM questions WHERE id = ${row.parent_id} LIMIT 1;
    `;
    if (parentRows.length > 0) {
      parentQuestionText = String(parentRows[0].question_text);
    }
  }

  return formatQuestionRow({ ...row, parent_question_text: parentQuestionText });
}

/**
 * Admin: Delete or dismiss a question
 */
export async function deleteQuestionAdmin(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    DELETE FROM questions
    WHERE id = ${id}
    RETURNING id;
  `;

  return rows.length > 0;
}
