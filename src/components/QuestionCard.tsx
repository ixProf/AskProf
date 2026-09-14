'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Question } from '@/types/question';
import { Heart, CornerDownRight, Share2, Check } from 'lucide-react';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
  question: Question;
  onFollowUp: (parentQuestion: Question) => void;
  onLikeChanged?: (id: string, newLikes: number) => void;
  isHighlighted?: boolean;
}

function formatDisplayDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getAnswerPreview(text: string, maxLength = 175): { snippet: string; isTruncated: boolean } {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return { snippet: trimmed, isTruncated: false };
  }
  const slice = trimmed.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(' ');
  const cleanSlice = lastSpace > 110 ? slice.slice(0, lastSpace) : slice;
  return {
    snippet: `${cleanSlice}...`,
    isTruncated: true,
  };
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onFollowUp,
  onLikeChanged,
  isHighlighted = false,
}) => {
  const router = useRouter();
  const [likes, setLikes] = useState(question.likes_count);
  const [hasLiked, setHasLiked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return Boolean(localStorage.getItem(`prof_liked_${question.id}`));
    }
    return false;
  });
  const [copied, setCopied] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const answerUrl = `/answers/${question.display_number ?? question.id}`;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(answerUrl);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked || isLiking) return;
    setIsLiking(true);

    const newCount = likes + 1;
    setLikes(newCount);
    setHasLiked(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`prof_liked_${question.id}`, 'true');
    }
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${answerUrl}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const answerRaw = question.answer_text || '';
  const { snippet } = getAnswerPreview(answerRaw);

  const dateValue = question.answered_at || question.created_at;
  const formattedDate = formatDisplayDate(dateValue);

  return (
    <article
      id={`q-${question.id}`}
      className={`${styles.card} ${isHighlighted ? styles.cardHighlighted : ''}`}
      onClick={handleCardClick}
    >
      {/* Thread Context Banner if this is a follow-up */}
      {question.parent_id && question.parent_question_text && (
        <div className={styles.threadBanner}>
          <span className={styles.threadLabel}>Follow-up to</span>
          <Link
            href={`/answers/${question.parent_id}`}
            className={styles.threadText}
            onClick={(e) => e.stopPropagation()}
            title={question.parent_question_text}
          >
            &ldquo;{question.parent_question_text}&rdquo;
          </Link>
        </div>
      )}

      {/* 1. Prominent Bold Question Text at the top linking to detail */}
      <h3 className={styles.questionTitle}>
        <Link
          href={answerUrl}
          className={styles.titleLink}
          onClick={(e) => e.stopPropagation()}
        >
          {question.question_text}
        </Link>
      </h3>

      {/* 2. Preview/Snippet of the Answer in muted gray text */}
      {answerRaw && (
        <div className={styles.answerContainer}>
          <p className={styles.answerSnippet}>{snippet}</p>
        </div>
      )}

      {/* 3. Bottom Row: "Answered [date]" bottom-left, "Read answer →" bottom-right */}
      <div className={styles.cardBottomRow}>
        <div className={styles.bottomLeft}>
          <span className={styles.answeredLabel}>
            Answered {formattedDate}
          </span>

          <button
            type="button"
            onClick={handleLike}
            disabled={hasLiked}
            className={`${styles.likeBtn} ${hasLiked ? styles.likeBtnActive : ''}`}
            title={hasLiked ? 'Liked' : 'Like question'}
            aria-label={`Like question (${likes})`}
          >
            <Heart size={12} className={hasLiked ? styles.heartFilled : ''} />
            <span>{likes}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={styles.toolBtn}
            title="Copy direct link"
          >
            {copied ? <Check size={12} className={styles.copiedIcon} /> : <Share2 size={12} />}
            <span className={copied ? styles.copiedText : ''}>
              {copied ? 'Copied' : 'Share'}
            </span>
          </button>
        </div>

        {answerRaw && (
          <Link
            href={answerUrl}
            className={styles.readAnswerLink}
            onClick={(e) => e.stopPropagation()}
          >
            <span>Read answer</span>
            <span className={styles.arrowIcon} aria-hidden="true">
              →
            </span>
          </Link>
        )}
      </div>
    </article>
  );
};