'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Question } from '@/types/question';
import { useLanguage } from '@/components/LanguageContext';
import { useTheme } from '@/components/ThemeContext';
import {
  ArrowLeft,
  LogOut,
  Send,
  Trash2,
  Inbox,
  Archive,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import styles from './inbox.module.css';

export default function AdminInboxPage() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Questions state
  const [activeTab, setActiveTab] = useState<'pending' | 'answered'>('pending');
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);

  // Draft answers map: [questionId -> answerText]
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [isPublishingId, setIsPublishingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const fetchQuestions = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/questions');
      if (res.ok) {
        const data = await res.json();
        setPendingQuestions(data.pending || []);
        setAnsweredQuestions(data.answered || []);

        const draftMap: Record<string, string> = {};
        (data.answered || []).forEach((q: Question) => {
          if (q.answer_text) draftMap[q.id] = q.answer_text;
        });
        setDraftAnswers((prev) => ({ ...draftMap, ...prev }));
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    }
  }, []);

  // Check auth on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
        if (data.authenticated) {
          fetchQuestions();
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, [fetchQuestions]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;
    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 429) {
          const waitMin = data.resetInSeconds ? Math.ceil(data.resetInSeconds / 60) : 15;
          setAuthError(`Too many failed attempts. Locked out for ${waitMin} minutes.`);
        } else {
          setAuthError(t.inbox.invalidPass);
        }
        setIsLoggingIn(false);
        return;
      }

      setIsAuthenticated(true);
      fetchQuestions();
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const handleAnswerChange = (id: string, text: string) => {
    setDraftAnswers((prev) => ({ ...prev, [id]: text }));
  };

  const handlePublishAnswer = async (id: string) => {
    const answer = (draftAnswers[id] || '').trim();
    if (!answer) {
      showToast('Please provide an answer before publishing.');
      return;
    }

    setIsPublishingId(id);

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer_text: answer }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Answer published to the public feed.');
        await fetchQuestions();
      } else {
        showToast(data.error || 'Failed to publish.');
      }
    } catch {
      showToast('Network error while publishing.');
    } finally {
      setIsPublishingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmPrompt = 'Are you sure you want to delete this question? This action cannot be undone.';
    if (!window.confirm(confirmPrompt)) return;

    setIsDeletingId(id);

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Question deleted.');
        setPendingQuestions((prev) => prev.filter((q) => q.id !== id));
        setAnsweredQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        showToast(data.error || 'Failed to delete.');
      }
    } catch {
      showToast('Network error while deleting.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // 1. Loading session
  if (isAuthenticated === null) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <p className={styles.authDesc}>Checking session...</p>
        </div>
      </div>
    );
  }

  // 2. Login Screen
  if (!isAuthenticated) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h2 className={styles.authTitle}>{t.inbox.passphraseTitle}</h2>
          <p className={styles.authDesc}>{t.inbox.passphraseDesc}</p>

          {authError && <div className={styles.authError}>{authError}</div>}

          <form onSubmit={handleLogin} className={styles.authForm}>
            <input
              type="password"
              className="vault-input"
              placeholder={t.inbox.passphrasePlaceholder}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
              required
            />
            <button
              type="submit"
              className="btn-red"
              disabled={isLoggingIn || !passwordInput}
            >
              <span>{isLoggingIn ? t.inbox.loggingIn : t.inbox.loginButton}</span>
            </button>
          </form>

          <div className={styles.authFooterLinks}>
            <Link href="/" className={styles.homeBackLink}>
              <ArrowLeft size={14} />
              <span>{t.inbox.returnHome}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Admin Inbox
  return (
    <main className={styles.inboxContainer}>
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className={styles.toast}>
          <Check size={16} />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <div className={styles.inboxTopBar}>
        <div className={styles.inboxBranding}>
          <h1 className={styles.adminWordmark}>
            Ask Prof<span className={styles.brandAccent}>.</span>
          </h1>
          <span className={styles.adminBadge}>Admin</span>
        </div>

        <div className={styles.topActions}>
          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <Link
            href="/"
            className="btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <ArrowLeft size={14} />
            <span>{t.inbox.returnHome}</span>
          </Link>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={13} />
            <span>{t.inbox.logoutButton}</span>
          </button>
        </div>
      </div>

      {/* Tabs & Stats */}
      <div className={styles.dashboardTabs}>
        <div className={styles.tabGroup}>
          <button
            onClick={() => setActiveTab('pending')}
            className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabActive : ''}`}
          >
            <Inbox size={14} />
            <span>{t.inbox.pendingTab}</span>
            <span className={styles.badgePill}>{pendingQuestions.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('answered')}
            className={`${styles.tabBtn} ${activeTab === 'answered' ? styles.tabActive : ''}`}
          >
            <Archive size={14} />
            <span>{t.inbox.answeredTab}</span>
            <span className={styles.badgePill}>{answeredQuestions.length}</span>
          </button>
        </div>
      </div>

      {/* Content for Pending Questions */}
      {activeTab === 'pending' && (
        <section>
          {pendingQuestions.length === 0 ? (
            <div className={styles.emptyStateBox}>
              <h3>{t.inbox.emptyPending}</h3>
              <p>{t.inbox.emptyPendingSub}</p>
            </div>
          ) : (
            pendingQuestions.map((q) => (
              <article
                key={q.id}
                className={`${styles.adminCard} ${styles.adminCardPending}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.askerTag}>
                    <span>{q.is_anonymous ? t.feed.anonymous : q.asker_name}</span>
                  </div>
                  <time className={styles.metaInfo}>
                    {new Date(q.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>

                {q.parent_id && q.parent_question_text && (
                  <div className={styles.followUpNotice}>
                    <span>{t.feed.followUpTo} &ldquo;{q.parent_question_text}&rdquo;</span>
                  </div>
                )}

                <div className={styles.questionText}>{q.question_text}</div>

                <div className={styles.composerSection}>
                  <textarea
                    id={`composer_${q.id}`}
                    className="vault-textarea"
                    placeholder={t.inbox.answerPlaceholder}
                    rows={4}
                    value={draftAnswers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                </div>

                <div className={styles.adminCardActions}>
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={isDeletingId === q.id}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={13} />
                    <span>{isDeletingId === q.id ? t.inbox.deleting : t.inbox.deleteButton}</span>
                  </button>

                  <button
                    onClick={() => handlePublishAnswer(q.id)}
                    disabled={isPublishingId === q.id || !(draftAnswers[q.id] || '').trim()}
                    className="btn-red"
                  >
                    <Send size={13} />
                    <span>
                      {isPublishingId === q.id
                        ? t.inbox.publishing
                        : t.inbox.publishButton}
                    </span>
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      )}

      {/* Content for Answered Questions */}
      {activeTab === 'answered' && (
        <section>
          {answeredQuestions.length === 0 ? (
            <div className={styles.emptyStateBox}>
              <h3>No answered questions yet</h3>
              <p>Answer questions from the Pending tab to publish them here.</p>
            </div>
          ) : (
            answeredQuestions.map((q) => (
              <article
                key={q.id}
                className={styles.adminCard}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.askerTag}>
                    <span>{q.is_anonymous ? t.feed.anonymous : q.asker_name}</span>
                    <span className={styles.likesNote}>· {q.likes_count} likes</span>
                  </div>
                  <time className={styles.metaInfo}>
                    {new Date(q.answered_at || q.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>

                <div className={styles.questionText}>{q.question_text}</div>

                <div className={styles.composerSection}>
                  <textarea
                    id={`edit_${q.id}`}
                    className="vault-textarea"
                    rows={4}
                    value={draftAnswers[q.id] !== undefined ? draftAnswers[q.id] : q.answer_text || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                </div>

                <div className={styles.adminCardActions}>
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={isDeletingId === q.id}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={13} />
                    <span>{isDeletingId === q.id ? t.inbox.deleting : t.inbox.deleteButton}</span>
                  </button>

                  <button
                    onClick={() => handlePublishAnswer(q.id)}
                    disabled={isPublishingId === q.id}
                    className="btn-red"
                  >
                    <span>{isPublishingId === q.id ? t.inbox.publishing : t.inbox.saveChanges}</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      )}
    </main>
  );
}
