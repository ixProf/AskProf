'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Question } from '@/types/question';
import { useLanguage } from './LanguageContext';
import { QuestionCard } from './QuestionCard';
import { Clock, Flame, Search, X, MessageSquareDashed } from 'lucide-react';
import styles from './PublicFeed.module.css';

interface PublicFeedProps {
  initialQuestions: Question[];
  onFollowUp: (question: Question) => void;
  onLikeChanged?: (id: string, newLikes: number) => void;
}

export const PublicFeed: React.FC<PublicFeedProps> = ({
  initialQuestions,
  onFollowUp,
  onLikeChanged,
}) => {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [sortTab, setSortTab] = useState<'recent' | 'liked'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Sync state if initial questions change
  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  // Handle hash anchoring on load / hashchange
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#q-')) {
        const id = hash.replace('#q-', '');
        setHighlightedId(id);
        setTimeout(() => {
          const el = document.getElementById(`q-${id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Filter & Sort
  const filteredAndSorted = useMemo(() => {
    let list = [...questions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (q) =>
          q.question_text.toLowerCase().includes(query) ||
          (q.answer_text && q.answer_text.toLowerCase().includes(query)) ||
          q.asker_name.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortTab === 'liked') {
      list.sort((a, b) => b.likes_count - a.likes_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      list.sort((a, b) => {
        const timeA = a.answered_at ? new Date(a.answered_at).getTime() : new Date(a.created_at).getTime();
        const timeB = b.answered_at ? new Date(b.answered_at).getTime() : new Date(b.created_at).getTime();
        return timeB - timeA;
      });
    }

    return list;
  }, [questions, sortTab, searchQuery]);

  const handleLikeUpdate = (id: string, count: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, likes_count: count } : q))
    );
    if (onLikeChanged) onLikeChanged(id, count);
  };

  return (
    <section className={styles.feedSection} aria-label={t.feed.title}>
      <div className={styles.feedControls}>
        <div className={styles.controlsTopRow}>
          <div className={styles.feedTitleGroup}>
            <h3 className={styles.feedHeading}>{t.feed.title}</h3>
            <p className={styles.feedSubheading}>{t.feed.subtitle}</p>
          </div>

          {/* Sorting Tabs */}
          <div className={styles.tabsContainer} role="tablist">
            <button
              onClick={() => setSortTab('recent')}
              className={`${styles.tabBtn} ${sortTab === 'recent' ? styles.tabActive : ''}`}
              role="tab"
              aria-selected={sortTab === 'recent'}
            >
              <Clock size={14} />
              <span>{t.feed.tabRecent}</span>
            </button>
            <button
              onClick={() => setSortTab('liked')}
              className={`${styles.tabBtn} ${sortTab === 'liked' ? styles.tabActive : ''}`}
              role="tab"
              aria-selected={sortTab === 'liked'}
            >
              <Flame size={14} />
              <span>{t.feed.tabLiked}</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className={styles.searchContainer}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t.feed.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.clearSearchBtn}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Feed List */}
      {filteredAndSorted.length > 0 ? (
        <div className={styles.questionsList}>
          {filteredAndSorted.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onFollowUp={onFollowUp}
              onLikeChanged={handleLikeUpdate}
              isHighlighted={highlightedId === question.id}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <MessageSquareDashed size={42} className={styles.emptyIcon} />
          <h4 className={styles.emptyTitle}>{t.feed.noQuestions}</h4>
          <p className={styles.emptyDesc}>{t.feed.noQuestionsSub}</p>
        </div>
      )}
    </section>
  );
};
