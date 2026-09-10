import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { answerAndPublishQuestion, deleteQuestionAdmin } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const { answer_text } = body;

    if (!answer_text || typeof answer_text !== 'string' || !answer_text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Answer text is required to publish.' },
        { status: 400 }
      );
    }

    const updated = await answerAndPublishQuestion(id, answer_text);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, question: updated });
  } catch (error) {
    console.error('Admin PATCH question error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const deleted = await deleteQuestionAdmin(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Question dismissed and purged.' });
  } catch (error) {
    console.error('Admin DELETE question error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete question' }, { status: 500 });
  }
}
