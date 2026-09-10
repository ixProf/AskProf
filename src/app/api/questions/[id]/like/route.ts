import { NextRequest, NextResponse } from 'next/server';
import { incrementLike } from '@/lib/db';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing question ID' }, { status: 400 });
    }

    const updated = await incrementLike(id);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Question not found or not eligible for likes' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      likes_count: updated.likes_count,
    });
  } catch (error) {
    console.error('API like error:', error);
    return NextResponse.json({ success: false, error: 'Failed to like question' }, { status: 500 });
  }
}
