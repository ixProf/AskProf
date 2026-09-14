'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Question } from '@/types/question';
import { CornerDownRight, Check } from 'lucide-react';
import styles from './AskSection.module.css';

interface AskSectionProps {
  replyToQuestion?: Question | null;
  onClearReplyTo?: () => void;
}

const MAX_CHARACTERS = 2000;

export const AskSection: React.FC<AskSectionProps> = ({
  replyToQuestion,
  onClearReplyTo,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [askerName, setAskerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyToQuestion && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyToQuestion]);

  const charactersLeft = MAX_CHARACTERS - questionText.length;
  const hasText = questionText.trim().length > 0;
  const hasValidLength = questionText.trim().length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasText) {
      setErrorMessage('Please type a question before sending.');
      if (textareaRef.current) textareaRef.current.focus();
      return;
    }

    if (!hasValidLength) {
      setErrorMessage('Please write a question with at least 8 characters.');
      if (textareaRef.current) textareaRef.current.focus();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: questionText.trim(),
          asker_name: askerName.trim() || undefined,
          is_anonymous: !askerName.trim(),
          parent_id: replyToQuestion?.id || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 429) {
          setErrorMessage('Too many submissions. Please wait a few minutes.');
        } else {
          setErrorMessage(data.error || 'Failed to submit question. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      setSubmittedSuccess(true);
      setQuestionText('');
      setAskerName('');
      if (onClearReplyTo) onClearReplyTo();
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskAnother = () => {
    setSubmittedSuccess(false);
    setErrorMessage(null);
  };

  return (
    <section id="ask-section" className={styles.askSectionCard} aria-labelledby="ask-heading">
      {/* Editorial Headline & Inviting Subtitle */}
      <div className={styles.sectionHeader}>
        <h2 id="ask-heading" className={styles.sectionTitle}>
          What&apos;s on your mind<span className={styles.accentDot}>?</span>
        </h2>
        <p className={styles.sectionSubtitle}>
          Got a question? Ask away — anonymously. I read every question and publish the answers here.
        </p>
      </div>

      {/* Success State */}
      {submittedSuccess ? (
        <div className={styles.successState}>
          <div className={styles.successIconWrap}>
            <Check size={22} />
          </div>
          <h3 className={styles.successTitle}>Question sent!</h3>
          <p className={styles.successDesc}>
            Thanks for reaching out. Prof will review your question and publish an answer on the feed soon.
          </p>
          <button
            type="button"
            onClick={handleAskAnother}
            className={styles.askAnotherBtn}
          >
            Ask another question
          </button>
        </div>
      ) : (
        /* Form View */
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          {/* Thread context banner if replying */}
          {replyToQuestion && (
            <div className={styles.replyBanner}>
              <div className={styles.replyContent}>
                <CornerDownRight size={13} className={styles.replyIcon} />
                <span>
                  REPLYING TO: &ldquo;{replyToQuestion.question_text}&rdquo;
                </span>
              </div>
              {onClearReplyTo && (
                <button
                  type="button"
                  onClick={onClearReplyTo}
                  className={styles.cancelReplyBtn}
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className={styles.errorBanner}>
              {errorMessage}
            </div>
          )}

          {/* Large, Prominent Textarea */}
          <div className={styles.textareaWrapper}>
            <textarea
              ref={textareaRef}
              id="landing-question-input"
              className={styles.prominentTextarea}
              placeholder="Type your question here..."
              rows={4}
              maxLength={MAX_CHARACTERS}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
            />
          </div>

          {/* Bottom Bar: Name Input + Live Counter + Prominent Submit */}
          <div className={styles.bottomBar}>
            <div className={styles.bottomLeftControls}>
              <input
                type="text"
                className={styles.compactNameInput}
                placeholder="Name (optional)"
                maxLength={40}
                value={askerName}
                onChange={(e) => setAskerName(e.target.value)}
              />
              <span className={styles.metaDot}>·</span>
              <span
                className={`${styles.charCounter} ${charactersLeft < 100 ? styles.charCounterWarning : ''}`}
              >
                {charactersLeft} left
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              <span>{isSubmitting ? 'Sending...' : 'Send question'}</span>
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
