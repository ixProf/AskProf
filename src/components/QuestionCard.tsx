'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Question } from '@/types/question';
import { useLanguage } from './LanguageContext';
import { Heart, CornerDownRight, Share2, Check, GitCommit } from 'lucide-react';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
  question: Question;
  onFollowUp: (parentQuestion: Question) => void;
  onLikeChanged?: (id: string, newLikes: number) => void;
  isHighlighted?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onFollowUp,
  onLikeChanged,
  isHighlighted = false,
}) => {
  const { locale, t } = useLanguage();
  const [likes, setLikes] = useState(question.likes_count);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Check localStorage only after mount (client-side), to avoid SSR/client
  // hydration mismatches since localStorage doesn't exist on the server.
  useEffect(() => {
    if (localStorage.getItem(`prof_liked_${question.id}`)) {
      setHasLiked(true);
    }
  }, [question.id]);

  // Format relative date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffMin < 2) return t.time.justNow;
      if (diffMin < 60) return t.time.minutesAgo.replace('{n}', diffMin.toString());
      if (diffHr < 24) return t.time.hoursAgo.replace('{n}', diffHr.toString());
      return t.time.daysAgo.replace('{n}', diffDay.toString());
    } catch {
      return dateStr;
    }
  };

  const handleLike = async () => {
    if (hasLiked || isLiking) return;
    setIsLiking(true);

    // Optimistic update
    const newCount = likes + 1;
    setLikes(newCount);
    setHasLiked(true);
    localStorage.setItem(`prof_liked_${question.id}`, 'true');
    if (onLikeChanged) onLikeChanged(question.id, newCount);

    try {
      const res = await fetch(`/api/questions/${question.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success && typeof data.likes_count === 'number') {
        setLikes(data.likes_count);
        if (onLikeChanged) onLikeChanged(question.id, data.likes_count);
      }
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/#q-${question.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const askerDisplay = question.is_anonymous
    ? t.feed.anonymous
    : question.asker_name || t.feed.anonymous;

  return (
    <article
      id={`q-${question.id}`}
      className={`${styles.card} ${isHighlighted ? 'flash-highlight' : ''}`}
    >
      {/* Thread Parent Banner if follow-up */}
      {question.parent_id && question.parent_question_text && (
        <div className={styles.threadBanner}>
          <GitCommit size={14} />
          <span>{t.feed.followUpTo}</span>
          <span className={styles.threadText}>"{question.parent_question_text}"</span>
        </div>
      )}

      {/* Asker info header */}
      <div className={styles.askerMeta}>
        <div className={styles.askerInfo}>
          <div className={styles.askerAvatar}>
            {question.is_anonymous ? '?' : askerDisplay.charAt(0).toUpperCase()}
          </div>
          <span className={styles.askerName}>{askerDisplay}</span>
        </div>
        <time className={styles.askDate} dateTime={question.created_at}>
          {formatDate(question.created_at)}
        </time>
      </div>

      {/* Question Text */}
      <p className={styles.questionBody}>{question.question_text}</p>

      {/* Prof Mastermind Answer */}
      {question.answer_text && (
        <div className={styles.answerBox}>
          <div className={styles.answerHeader}>
            <div className={styles.profMiniMask}>
              <Image
                src="/dali-mask.png"
                alt="Prof Seal"
                width={24}
                height={24}
                className={styles.profMiniImage}
              />
            </div>
            <span className={styles.profTitle}>{t.feed.profSignature}</span>
            {question.answered_at && (
              <span className={styles.answerDate}>
                {formatDate(question.answered_at)}
              </span>
            )}
          </div>
          <div className={styles.answerText}>{question.answer_text}</div>
        </div>
      )}

      {/* Footer Actions */}
      <div className={styles.cardFooter}>
        <div className={styles.footerLeft}>
          <button
            onClick={handleLike}
            disabled={hasLiked}
            className={`${styles.likeBtn} ${hasLiked ? styles.likeBtnActive : ''}`}
            title={hasLiked ? t.feed.liked : t.feed.like}
            aria-label={`Like question (${likes})`}
          >
            <Heart size={15} />
            <span>{likes}</span>
          </button>

          <button
            onClick={() => onFollowUp(question)}
            className={styles.followUpBtn}
            title={t.feed.followUp}
            aria-label="Send a follow up question"
          >
            <CornerDownRight size={14} />
            <span>{t.feed.followUp}</span>
          </button>
        </div>

        <button
          onClick={handleShare}
          className={styles.shareBtn}
          title={t.feed.share}
          aria-label="Copy link to question"
        >
          {copied ? <Check size={14} className={styles.copiedBadge} /> : <Share2 size={14} />}
          <span className={copied ? styles.copiedBadge : ''}>
            {copied ? t.feed.copied : t.feed.share}
          </span>
        </button>
      </div>
    </article>
  );
};