'use client';

import React, { useState } from 'react';
import { Question, FeedStats, ProfileBio } from '@/types/question';
import { AskSection } from './AskSection';
import { PublicFeed } from './PublicFeed';
import { SmileyLogoIcon } from './SmileyLogoIcon';
import styles from './AmaClientView.module.css';

interface AmaClientViewProps {
  initialQuestions: Question[];
  initialStats: FeedStats;
  profile: ProfileBio;
}

export const AmaClientView: React.FC<AmaClientViewProps> = ({
  initialQuestions,
  profile,
}) => {
  const [replyToQuestion, setReplyToQuestion] = useState<Question | null>(null);

  const handleFollowUp = (question: Question) => {
    setReplyToQuestion(question);
    const element = document.getElementById('ask-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const realName = profile?.name_en || 'Mahmoud Sayed Mohamed';

  return (
    <div className={styles.pageContainer}>
      {/* Intro Hero */}
      <header className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          <SmileyLogoIcon size={34} />
          <span>Ask Prof<span className={styles.brandAccent}>.</span></span>
        </h1>
        <p className={styles.heroSubtitle}>
          {realName} <span className={styles.accentDot}>·</span> Backend Developer
        </p>
      </header>

      {/* Primary Focal Point: Enlarged, Centered Ask Card */}
      <main className={styles.mainContent}>
        <AskSection
          replyToQuestion={replyToQuestion}
          onClearReplyTo={() => setReplyToQuestion(null)}
        />

        {/* Subtle Visual Section Divider */}
        <div className={styles.sectionBreak}>
          <div className={styles.sectionBreakLine} />
          <span className={styles.sectionBreakLabel}>
            Public Archive <span className={styles.sectionBreakDot}>·</span> Q&amp;A
          </span>
          <div className={styles.sectionBreakLine} />
        </div>

        {/* Public Q&A Feed */}
        <PublicFeed
          initialQuestions={initialQuestions}
          onFollowUp={handleFollowUp}
        />
      </main>
    </div>
  );
};
