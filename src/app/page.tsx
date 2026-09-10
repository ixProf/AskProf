import { getAnsweredQuestions, getFeedStats, getProfile } from '@/lib/db';
import { AmaClientView } from '@/components/AmaClientView';

// Revalidate dynamically or on demand
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [initialQuestions, initialStats, profile] = await Promise.all([
    getAnsweredQuestions('recent'),
    getFeedStats(),
    getProfile(),
  ]);

  return (
    <AmaClientView
      initialQuestions={initialQuestions}
      initialStats={initialStats}
      profile={profile}
    />
  );
}
