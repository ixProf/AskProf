'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Question } from '@/types/question';
import { useLanguage } from '@/components/LanguageContext';
import { Heart, Share2, Check, ArrowLeft, CornerDownRight, User } from 'lucide-react';
import styles from './AnswerDetail.module.css';

interface AnswerDetailClientProps {
  question: Question;
}

function formatFullDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export const AnswerDetailClient: React.FC<AnswerDetailClientProps> = ({ question }) => {
  const { t } = useLanguage();
  const [likes, setLikes] = useState(question.likes_count);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const likedInStorage = localStorage.getItem(`prof_liked_${question.id}`);
      if (likedInStorage) {
        setHasLiked(true);
      }
    }
  }, [question.id]);

  const handleLike = async () => {
    if (hasLiked || isLiking) return;
    setIsLiking(true);

    const newCount = likes + 1;
    setLikes(newCount);
    setHasLiked(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`prof_liked_${question.id}`, 'true');
    }

    try {
      const res = await fetch(`/api/questions/${question.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success && typeof data.likes_count === 'number') {
        setLikes(data.likes_count);
      }
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    const directUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/answers/${question.display_number ?? question.id}`
      : '';
    if (!directUrl) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(directUrl).then(() => {
        setCopied(true);
        setToastVisible(true);
        setTimeout(() => setCopied(false), 2500);
        setTimeout(() => setToastVisible(false), 2500);
      }).catch((err) => {
        console.error('Failed to copy to clipboard', err);
      });
    }
  };

  const dateValue = question.answered_at || question.created_at;
  const formattedFullDate = formatFullDate(dateValue);

  // Submitter name: "Anonymous" if is_anonymous or asker_name is empty/Anonymous
  const submitterName = question.is_anonymous || !question.asker_name?.trim()
    ? (t.feed?.anonymous || 'Anonymous')
    : question.asker_name.trim();

  // Split answer by double-newlines into paragraphs for clean typography
  const answerParagraphs = (question.answer_text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main className={styles.container}>
      {/* Top Back Navigation */}
      <div className={styles.backRow}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={14} className={styles.backLinkIcon} />
          <span>Back to Q&amp;A</span>
        </Link>
      </div>

      {/* Main Detail Card */}
      <article className={styles.detailCard}>
        {/* Thread Banner if follow-up */}
        {question.parent_id && (
          <div className={styles.threadBanner}>
            <span className={styles.threadLabel}>Follow-up to</span>
            <Link
              href={`/answers/${question.parent_id}`}
              className={styles.threadText}
              title={question.parent_question_text || 'View parent question'}
            >
              &ldquo;{question.parent_question_text || 'Original Question'}&rdquo;
            </Link>
          </div>
        )}

        {/* Card Header: Submitter alias + full date */}
        <header className={styles.cardHeader}>
          <div className={styles.submitterGroup}>
            <span className={styles.submitterBadge}>
              <User size={12} aria-hidden="true" />
              <span>{submitterName}</span>
            </span>
          </div>

          <time dateTime={dateValue} className={styles.fullDate}>
            Answered on {formattedFullDate}
          </time>
        </header>

        {/* Full Question Text (Bold Headline) */}
        <h1 className={styles.questionHeadline}>{question.question_text}</h1>

        {/* Visual Divider */}
        <hr className={styles.visualDivider} />

        {/* Full Answer Body with normal paragraph spacing */}
        <section className={styles.answerSection} aria-label="Prof's Answer">
          <div className={styles.answerAuthor}>
            <span className={styles.authorPill}>
              Prof &bull; Verified Answer
            </span>
          </div>

          {answerParagraphs.length > 0 ? (
            answerParagraphs.map((para, idx) => (
              <p key={idx} className={styles.answerParagraph}>
                {para}
              </p>
            ))
          ) : (
            <p className={styles.answerParagraph}>
              {question.answer_text}
            </p>
          )}
        </section>

        {/* Bottom Action Bar */}
        <footer className={styles.bottomActionBar}>
          <div className={styles.actionsLeft}>
            <button
              type="button"
              onClick={handleLike}
              disabled={hasLiked}
              className={`${styles.likeBtn} ${hasLiked ? styles.likeBtnActive : ''}`}
              title={hasLiked ? 'Liked' : 'Like this answer'}
              aria-label={`Like question (${likes})`}
            >
              <Heart size={14} className={hasLiked ? styles.heartFilled : ''} />
              <span>{likes}</span>
            </button>

            <Link
              href={`/?replyTo=${question.id}#ask-section`}
              className={styles.followUpBtn}
              title="Ask a follow-up question"
            >
              <CornerDownRight size={13} />
              <span>Follow up</span>
            </Link>
          </div>

          <div className={styles.actionsRight}>
            <button
              type="button"
              onClick={handleShare}
              className={`${styles.shareBtn} ${copied ? styles.shareBtnCopied : ''}`}
              title="Copy direct link to this answer"
              aria-label="Share direct link"
            >
              {copied ? <Check size={14} className={styles.copiedIcon} /> : <Share2 size={14} />}
              <span>{copied ? (t.feed?.copied || 'Copied!') : (t.feed?.share || 'Share')}</span>
            </button>
          </div>
        </footer>
      </article>

      {/* Floating Confirmation Toast */}
      {toastVisible && (
        <div className={styles.toastContainer} role="status" aria-live="polite">
          <Check size={16} className={styles.toastIcon} />
          <span className={styles.toastText}>Direct link copied to clipboard</span>
        </div>
      )}
    </main>
  );
};
