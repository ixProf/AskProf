'use client';

import React, { useState } from 'react';
import { Question, FeedStats, ProfileBio } from '@/types/question';
import { Header } from './Header';
import { PublicFeed } from './PublicFeed';
import { AskModal } from './AskModal';

interface AmaClientViewProps {
  initialQuestions: Question[];
  initialStats: FeedStats;
  profile: ProfileBio;
}

export const AmaClientView: React.FC<AmaClientViewProps> = ({
  initialQuestions,
  initialStats,
  profile,
}) => {
  const [stats, setStats] = useState<FeedStats>(initialStats);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyToQuestion, setReplyToQuestion] = useState<Question | null>(null);

  const handleFollowUp = (question: Question) => {
    setReplyToQuestion(question);
    setIsModalOpen(true);
  };

  const handleLikeChanged = (_id: string, _count: number) => {
    // Increment total likes counter in header
    setStats((prev) => ({
      ...prev,
      total_likes: prev.total_likes + 1,
    }));
  };

  return (
    <main className="site-container">
      <Header stats={stats} profile={profile} />
      <PublicFeed
        initialQuestions={initialQuestions}
        onFollowUp={handleFollowUp}
        onLikeChanged={handleLikeChanged}
      />
      <AskModal
        isOpen={isModalOpen}
        onOpen={() => {
          setReplyToQuestion(null);
          setIsModalOpen(true);
        }}
        onClose={() => setIsModalOpen(false)}
        replyToQuestion={replyToQuestion}
        onClearReplyTo={() => setReplyToQuestion(null)}
      />
    </main>
  );
};
