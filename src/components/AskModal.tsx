'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Question } from '@/types/question';
import { MessageSquarePlus, X, CornerDownRight, Check } from 'lucide-react';
import styles from './AskModal.module.css';

interface AskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  replyToQuestion?: Question | null;
  onClearReplyTo?: () => void;
}

export const AskModal: React.FC<AskModalProps> = ({
  isOpen,
  onClose,
  onOpen,
  replyToQuestion,
  onClearReplyTo,
}) => {
  const { t } = useLanguage();
  const [questionText, setQuestionText] = useState('');
  const [askerName, setAskerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = React.useCallback(() => {
    setQuestionText('');
    setAskerName('');
    setSubmittedSuccess(false);
    setErrorMessage(null);
    if (onClearReplyTo) onClearReplyTo();
    onClose();
  }, [onClearReplyTo, onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText || questionText.trim().length < 8) {
      setErrorMessage(t.askModal.validationError);
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
          setErrorMessage(t.askModal.rateLimitError);
        } else {
          setErrorMessage(data.error || 'Failed to submit question. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      setSubmittedSuccess(true);
    } catch (err) {
      console.error('Submit error:', err);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Persistent Floating Action Button */}
      {!isOpen && (
        <div className={styles.floatingCtaContainer}>
          <button
            onClick={onOpen}
            className={styles.floatingCtaBtn}
            aria-label={t.askModal.triggerButton}
          >
            <MessageSquarePlus size={16} />
            <span>{t.askModal.triggerButton}</span>
          </button>
        </div>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className={styles.modalBackdrop} onClick={handleClose}>
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <h3 className={styles.modalTitle}>
                  {replyToQuestion ? t.feed.followUp : t.askModal.title}
                </h3>
                <p className={styles.modalDesc}>{t.askModal.desc}</p>
              </div>

              <button
                onClick={handleClose}
                className={styles.closeBtn}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Success State */}
            {submittedSuccess ? (
              <div className={styles.successBox}>
                <div className={styles.successIconWrap}>
                  <Check size={24} />
                </div>
                <h4 className={styles.successTitle}>{t.askModal.successTitle}</h4>
                <p className={styles.successDesc}>{t.askModal.successDesc}</p>
                <button onClick={handleClose} className="btn-red">
                  {t.askModal.closeButton}
                </button>
              </div>
            ) : (
              /* Submission Form */
              <form onSubmit={handleSubmit}>
                {/* Follow-up parent context */}
                {replyToQuestion && (
                  <div className={styles.parentContextBox}>
                    <div className={styles.parentContextContent}>
                      <CornerDownRight size={13} className={styles.parentContextIcon} />
                      <span className={styles.parentContextText}>
                        &ldquo;{replyToQuestion.question_text}&rdquo;
                      </span>
                    </div>
                    {onClearReplyTo && (
                      <button
                        type="button"
                        onClick={onClearReplyTo}
                        className={styles.clearParentBtn}
                      >
                        {t.askModal.cancelReply}
                      </button>
                    )}
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className={styles.errorBanner}>{errorMessage}</div>
                )}

                {/* Question Textarea */}
                <div className={styles.formGroup}>
                  <div className={styles.formLabelRow}>
                    <label htmlFor="question_input" className={styles.formLabel}>
                      {t.askModal.questionLabel}
                    </label>
                    <span className={styles.charCount}>
                      {questionText.length} / 2000
                    </span>
                  </div>
                  <textarea
                    id="question_input"
                    className="vault-textarea"
                    placeholder={t.askModal.questionPlaceholder}
                    rows={4}
                    maxLength={2000}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {/* Optional Asker Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="asker_input" className={styles.formLabel}>
                    {t.askModal.nameLabel}
                  </label>
                  <input
                    id="asker_input"
                    type="text"
                    className="vault-input"
                    placeholder={t.askModal.namePlaceholder}
                    maxLength={50}
                    value={askerName}
                    onChange={(e) => setAskerName(e.target.value)}
                  />
                  <p className={styles.fieldHint}>{t.askModal.anonymousNote}</p>
                </div>

                {/* Actions */}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-secondary"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-red"
                    disabled={isSubmitting || questionText.trim().length < 8}
                  >
                    <span>
                      {isSubmitting ? t.askModal.submitting : t.askModal.submitButton}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
