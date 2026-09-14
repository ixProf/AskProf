import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAnsweredQuestionById } from '@/lib/db';
import { getBaseUrl } from '@/lib/url';
import { AnswerDetailClient } from './AnswerDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

function truncateText(text: string, maxLength: number): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLength) return trimmed;
  const slice = trimmed.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(' ');
  const cleanSlice = lastSpace > maxLength * 0.7 ? slice.slice(0, lastSpace) : slice;
  return `${cleanSlice}…`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = getBaseUrl();
  const question = await getAnsweredQuestionById(id);

  if (!question || question.status !== 'answered') {
    const fallbackImage = `${baseUrl}/og-image.png`;
    return {
      title: 'Answer Not Found | Ask Prof',
      description: 'The requested question and answer could not be found.',
      openGraph: {
        images: [
          {
            url: fallbackImage,
            width: 1200,
            height: 630,
            alt: 'Ask Prof',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        images: [fallbackImage],
      },
    };
  }

  const rawQuestion = question.question_text || '';
  const rawAnswer = question.answer_text || '';

  // og:title / twitter:title: truncated to ~90 characters if very long
  const shareTitle = truncateText(rawQuestion, 90);
  
  // og:description / twitter:description: first ~150-200 characters of the answer text
  const shareDesc = truncateText(rawAnswer, 180);

  const canonicalUrl = `${baseUrl}/answers/${question.display_number ?? id}`;
  const ogImageUrl = `${baseUrl}/api/og?id=${question.display_number ?? id}`;

  return {
    title: `${shareTitle} | Ask Prof`,
    description: shareDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: shareTitle,
      description: shareDesc,
      url: canonicalUrl,
      siteName: 'Ask Prof',
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: shareTitle,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: shareDesc,
      images: [ogImageUrl],
    },
  };
}

export default async function AnswerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const question = await getAnsweredQuestionById(id);

  if (!question || question.status !== 'answered') {
    notFound();
  }

  return <AnswerDetailClient question={question} />;
}
