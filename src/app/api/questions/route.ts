import { NextRequest, NextResponse } from 'next/server';
import { getAnsweredQuestions, createQuestion, getFeedStats, getProfile } from '@/lib/db';
import { checkRateLimit } from '@/lib/ratelimit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = (searchParams.get('sort') as 'recent' | 'liked') || 'recent';
    const search = searchParams.get('search') || undefined;

    const [questions, stats, profile] = await Promise.all([
      getAnsweredQuestions(sort, search),
      getFeedStats(),
      getProfile(),
    ]);

    return NextResponse.json({
      success: true,
      questions,
      stats,
      profile,
    });
  } catch (error) {
    console.error('API /api/questions GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP or header
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'local-client';

    const rateLimit = checkRateLimit(ip, 6, 10 * 60 * 1000); // 6 submissions per 10 min
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait before submitting another question.',
          resetInSeconds: rateLimit.resetInSeconds,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { question_text, asker_name, is_anonymous, parent_id } = body;

    if (!question_text || typeof question_text !== 'string' || question_text.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: 'Question text must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (question_text.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Question text exceeds 2000 characters limit.' },
        { status: 400 }
      );
    }

    const created = await createQuestion({
      question_text,
      asker_name: asker_name || undefined,
      is_anonymous: Boolean(is_anonymous),
      parent_id: parent_id || null,
    });

    return NextResponse.json({
      success: true,
      message: 'Question submitted successfully.',
      data: {
        id: created.id,
        created_at: created.created_at,
        status: created.status,
      },
    });
  } catch (error) {
    console.error('API /api/questions POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit question' }, { status: 500 });
  }
}
