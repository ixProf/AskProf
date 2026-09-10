import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAllQuestionsAdmin } from '@/lib/db';

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getAllQuestionsAdmin();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Admin questions GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
