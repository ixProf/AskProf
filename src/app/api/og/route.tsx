import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getAnsweredQuestionById } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function truncate(text: string, maxLen: number): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLen) return trimmed;
  const slice = trimmed.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  const cleanSlice = lastSpace > maxLen * 0.7 ? slice.slice(0, lastSpace) : slice;
  return `${cleanSlice}...`;
}

// Load Cairo bold font for Arabic + Latin typography
let fontData: Buffer | null = null;
try {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'cairo-bold.ttf');
  if (fs.existsSync(fontPath)) {
    fontData = fs.readFileSync(fontPath);
  }
} catch (e) {
  console.error('Failed to load local font for OG image:', e);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  let questionText = 'Ask Prof — Ask Me Anything';
  let answerSnippet = 'Direct, thoughtful answers to technical, architecture, and career questions.';
  let badgeLabel = 'Q&A Archive';
  let submitter = 'Anonymous';
  let isSpecificQuestion = false;

  if (id) {
    try {
      const question = await getAnsweredQuestionById(id);
      if (question && question.status === 'answered') {
        isSpecificQuestion = true;
        questionText = truncate(question.question_text, 180);
        if (question.answer_text) {
          answerSnippet = truncate(question.answer_text, 120);
        } else {
          answerSnippet = '';
        }
        badgeLabel = question.display_number ? `Answer #${question.display_number}` : 'Answer';
        submitter = question.is_anonymous || !question.asker_name?.trim()
          ? 'Anonymous'
          : question.asker_name.trim();
      }
    } catch (err) {
      console.error('Error fetching question for OG image:', err);
    }
  }

  // Adjust font size based on question length
  const questionFontSize = questionText.length > 120 ? 34 : questionText.length > 70 ? 40 : 46;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#09090b',
          padding: '40px 48px',
          fontFamily: fontData ? 'Cairo' : 'sans-serif',
        }}
      >
        {/* Main Card Container */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#121216',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '36px 44px',
            position: 'relative',
          }}
        >
          {/* Top Decorative Red Accent Bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '44px',
              right: '44px',
              height: '4px',
              backgroundColor: '#dc2626',
              borderRadius: '0 0 4px 4px',
            }}
          />

          {/* Top Bar: Wordmark on Left, Badge on Right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            {/* Wordmark + Smiley */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* Hand-drawn red marker smiley SVG */}
              <svg
                width="36"
                height="36"
                viewBox="0 0 32 32"
                fill="none"
                style={{ marginRight: '14px' }}
              >
                <path
                  d="M23.5 7.8C19 4.3 11.2 4.8 7 10.2C2.8 15.8 4.2 24.2 10.2 27.2C16.2 30.2 24.8 27.2 27.5 20.5C29.8 14.5 26.2 7.5 19.8 6.2"
                  stroke="#dc2626"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <ellipse cx="12.2" cy="13.6" rx="1.4" ry="1.8" fill="#dc2626" />
                <ellipse cx="19.8" cy="13.6" rx="1.4" ry="1.8" fill="#dc2626" />
                <path
                  d="M11.8 18.8C13.6 22.4 18.4 22.4 20.2 18.8"
                  stroke="#dc2626"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>

              <span
                style={{
                  color: '#f4f4f6',
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                AskProf
              </span>
              <span style={{ color: '#dc2626', fontSize: '28px', fontWeight: 700 }}>.</span>
            </div>

            {/* Pill Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(220, 38, 38, 0.12)',
                border: '1px solid rgba(220, 38, 38, 0.35)',
                borderRadius: '9999px',
                padding: '6px 18px',
                color: '#ef4444',
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {badgeLabel}
            </div>
          </div>

          {/* Middle Body: Red divider + Large Question Headline + Snippet */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              margin: 'auto 0',
              padding: '16px 0',
            }}
          >
            {/* Small red accent tick */}
            <div
              style={{
                width: '48px',
                height: '4px',
                backgroundColor: '#dc2626',
                borderRadius: '2px',
                marginBottom: '18px',
              }}
            />

            {/* Question Text */}
            <div
              style={{
                color: '#f4f4f6',
                fontSize: `${questionFontSize}px`,
                fontWeight: 700,
                lineHeight: 1.32,
                display: 'flex',
                flexWrap: 'wrap',
                maxHeight: '220px',
                overflow: 'hidden',
              }}
            >
              {questionText}
            </div>

            {/* Answer Snippet (if available) */}
            {answerSnippet && (
              <div
                style={{
                  color: '#a1a1aa',
                  fontSize: '21px',
                  lineHeight: 1.5,
                  marginTop: '16px',
                  display: 'flex',
                }}
              >
                {answerSnippet}
              </div>
            )}
          </div>

          {/* Bottom Bar: Submitter & Domain info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              width: '100%',
            }}
          >
            <div
              style={{
                color: '#71717a',
                fontSize: '17px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {isSpecificQuestion ? `Submitted by ${submitter}` : 'Mahmoud Sayed Mohamed • Backend Developer'}
            </div>

            <div
              style={{
                color: '#ef4444',
                fontSize: '17px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              askyabasha.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [
            {
              name: 'Cairo',
              data: fontData,
              weight: 700,
              style: 'normal',
            },
          ]
        : undefined,
      headers: {
        'Cache-Control': isSpecificQuestion
          ? 'public, max-age=86400, stale-while-revalidate=604800'
          : 'public, max-age=3600',
      },
    }
  );
}
