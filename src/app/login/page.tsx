'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Question } from '@/types/question';
import { useLanguage } from '@/components/LanguageContext';
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  LogOut,
  Send,
  Trash2,
  Inbox,
  Archive,
  CheckCircle2,
  ShieldAlert,
  GitCommit,
  Globe,
  Sparkles,
} from 'lucide-react';
import styles from './inbox.module.css';

export default function AdminInboxPage() {
  const { locale, t, toggleLanguage, dir } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Questions state
  const [activeTab, setActiveTab] = useState<'pending' | 'answered'>('pending');
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Draft answers map: [questionId -> answerText]
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [isPublishingId, setIsPublishingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

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
  }, []);

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const res = await fetch('/api/admin/questions');
      if (res.ok) {
        const data = await res.json();
        setPendingQuestions(data.pending || []);
        setAnsweredQuestions(data.answered || []);

        // Prepopulate draft answers for answered ones
        const draftMap: Record<string, string> = {};
        (data.answered || []).forEach((q: Question) => {
          if (q.answer_text) draftMap[q.id] = q.answer_text;
        });
        setDraftAnswers((prev) => ({ ...draftMap, ...prev }));
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
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
          setAuthError(
            locale === 'ar'
              ? `تم تجاوز عدد المحاولات المسموح بها. تم حظر الدخول مؤقتاً لمدة ${waitMin} دقيقة.`
              : `Too many failed attempts. Locked out for ${waitMin} minutes.`
          );
        } else {
          setAuthError(t.inbox.invalidPass);
        }
        setIsLoggingIn(false);
        return;
      }

      setIsAuthenticated(true);
      fetchQuestions();
    } catch {
      setAuthError('Connection error to vault.');
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
      showToast(locale === 'ar' ? 'يُرجى كتابة إجابة قبل النشر' : 'Please provide an answer before publishing');
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
        showToast(locale === 'ar' ? 'تم اعتماد الإجابة ونشرها في السجل العام بنجاح!' : 'Dispatch published successfully to the public feed!');
        // Refresh question sets
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
    const confirmPrompt = locale === 'ar'
      ? 'هل أنت متأكد من حذف واستبعاد هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.'
      : 'Are you sure you want to dismiss and purge this question?';

    if (!window.confirm(confirmPrompt)) return;

    setIsDeletingId(id);

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(locale === 'ar' ? 'تم استبعاد وحذف السؤال من الخزينة.' : 'Question purged from vault.');
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

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  // 1. Loading screen while verifying initial session
  if (isAuthenticated === null) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authIconLock}>
            <Lock size={32} />
          </div>
          <h2 className={styles.authTitle}>
            {locale === 'ar' ? 'جارٍ التحقق من تصريح الخزينة...' : 'Verifying vault credentials...'}
          </h2>
        </div>
      </div>
    );
  }

  // 2. Auth Challenge Screen if not logged in
  if (!isAuthenticated) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authIconLock}>
            <Lock size={30} />
          </div>
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
              <Sparkles size={16} />
              <span>{isLoggingIn ? t.inbox.loggingIn : t.inbox.loginButton}</span>
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link href="/" className={styles.homeBackLink}>
              <BackIcon size={14} />
              <span>{t.inbox.returnHome}</span>
            </Link>
            <button onClick={toggleLanguage} className={styles.homeBackLink} style={{ cursor: 'pointer' }}>
              <Globe size={14} />
              <span>{t.header.langToggle}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Admin Command Room / Inbox
  return (
    <main className={styles.inboxContainer}>
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          style={{
            position: 'fixed',
            top: '1.5rem',
            insetInlineEnd: '1.5rem',
            zIndex: 999,
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-red)',
            boxShadow: '0 8px 30px var(--accent-red-glow)',
            color: '#ffffff',
            padding: '0.85rem 1.4rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <CheckCircle2 size={18} color="var(--accent-red)" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <div className={styles.inboxTopBar}>
        <div className={styles.inboxBranding}>
          <div className={styles.miniMaskIcon}>
            <Image
              src="/dali-mask.png"
              alt="Prof Dalí Mask"
              width={38}
              height={38}
              className={styles.miniMaskImg}
            />
          </div>
          <div className={styles.titleArea}>
            <h1>{t.inbox.title}</h1>
            <p>{t.inbox.subtitle}</p>
          </div>
        </div>

        <div className={styles.topActions}>
          <button
            onClick={toggleLanguage}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
          >
            <Globe size={14} />
            <span>{t.header.langToggle}</span>
          </button>

          <Link href="/" className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
            <BackIcon size={14} />
            <span>{t.inbox.returnHome}</span>
          </Link>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={14} />
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
            <Inbox size={15} />
            <span>{t.inbox.pendingTab}</span>
            <span className={styles.badgePill}>{pendingQuestions.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('answered')}
            className={`${styles.tabBtn} ${activeTab === 'answered' ? styles.tabActive : ''}`}
          >
            <Archive size={15} />
            <span>{t.inbox.answeredTab}</span>
            <span className={styles.badgePill}>{answeredQuestions.length}</span>
          </button>
        </div>

        <div className="gold-badge">
          <ShieldAlert size={14} />
          <span>
            {locale === 'ar'
              ? `${pendingQuestions.length} ${t.inbox.pendingCount}`
              : `${pendingQuestions.length} ${t.inbox.pendingCount}`}
          </span>
        </div>
      </div>

      {/* Content for Pending Questions */}
      {activeTab === 'pending' && (
        <section>
          {pendingQuestions.length === 0 ? (
            <div className={styles.emptyStateBox}>
              <CheckCircle2 size={50} color="var(--accent-red)" />
              <h3>{t.inbox.emptyPending}</h3>
              <p>{t.inbox.emptyPendingSub}</p>
            </div>
          ) : (
            pendingQuestions.map((q) => (
              <article
                key={q.id}
                className={`${styles.adminCard} ${styles.adminCardPending}`}
              >
                {/* Asker & Meta info */}
                <div className={styles.cardHeader}>
                  <div className={styles.askerTag}>
                    <span>{q.is_anonymous ? t.feed.anonymous : q.asker_name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>·</span>
                    <span className="gold-badge" style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>
                      {locale === 'ar' ? 'قيد الانتظار' : 'Pending'}
                    </span>
                  </div>
                  <div className={styles.metaInfo}>
                    <span>{new Date(q.created_at).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </div>
                </div>

                {/* Follow-up context if any */}
                {q.parent_id && q.parent_question_text && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      color: 'var(--accent-gold)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <GitCommit size={14} />
                    <span>{t.feed.followUpTo} "{q.parent_question_text}"</span>
                  </div>
                )}

                {/* Question body */}
                <div className={styles.questionText}>{q.question_text}</div>

                {/* Answer Composer Area */}
                <div className={styles.composerSection}>
                  <label htmlFor={`composer_${q.id}`} className={styles.composerLabel}>
                    <Send size={14} />
                    <span>{t.inbox.answerPlaceholder}</span>
                  </label>
                  <textarea
                    id={`composer_${q.id}`}
                    className="vault-textarea"
                    placeholder={t.inbox.answerPlaceholder}
                    rows={4}
                    value={draftAnswers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className={styles.adminCardActions}>
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={isDeletingId === q.id}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={14} />
                    <span>{isDeletingId === q.id ? t.inbox.deleting : t.inbox.deleteButton}</span>
                  </button>

                  <button
                    onClick={() => handlePublishAnswer(q.id)}
                    disabled={isPublishingId === q.id || !(draftAnswers[q.id] || '').trim()}
                    className="btn-red"
                  >
                    <Send size={15} />
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

      {/* Content for Answered Questions Archive */}
      {activeTab === 'answered' && (
        <section>
          {answeredQuestions.length === 0 ? (
            <div className={styles.emptyStateBox}>
              <Archive size={50} color="var(--text-muted)" />
              <h3>{locale === 'ar' ? 'لا توجد إجابات منشورة بعد' : 'No Published Dispatches Yet'}</h3>
            </div>
          ) : (
            answeredQuestions.map((q) => (
              <article
                key={q.id}
                className={`${styles.adminCard} ${styles.adminCardAnswered}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.askerTag}>
                    <span>{q.is_anonymous ? t.feed.anonymous : q.asker_name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>·</span>
                    <span className="gold-badge" style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>
                      {locale === 'ar' ? `❤️ ${q.likes_count} إعجاب` : `❤️ ${q.likes_count} Likes`}
                    </span>
                  </div>
                  <div className={styles.metaInfo}>
                    <span>{new Date(q.answered_at || q.created_at).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </div>
                </div>

                <div className={styles.questionText}>{q.question_text}</div>

                <div className={styles.composerSection}>
                  <label htmlFor={`edit_${q.id}`} className={styles.composerLabel}>
                    <Sparkles size={14} />
                    <span>{t.inbox.editAnswer}</span>
                  </label>
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
                    <Trash2 size={14} />
                    <span>{isDeletingId === q.id ? t.inbox.deleting : t.inbox.deleteButton}</span>
                  </button>

                  <button
                    onClick={() => handlePublishAnswer(q.id)}
                    disabled={isPublishingId === q.id}
                    className="btn-red"
                  >
                    <CheckCircle2 size={15} />
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
