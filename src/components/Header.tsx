'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import { FeedStats, ProfileBio } from '@/types/question';
import { Sun, Moon } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  stats: FeedStats;
  profile?: ProfileBio;
}

export const Header: React.FC<HeaderProps> = ({ stats, profile }) => {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const realName = profile?.name_en || 'Mahmoud Sayed Mohamed';
  const bio = profile?.bio_en || t.brand.bio;

  return (
    <header className={styles.headerWrapper}>
      {/* Top Controls: System tag & Theme Switcher */}
      <div className={styles.topControls}>
        <div className={styles.brandContext}>
          <span className={styles.brandLabel}>
            Q&A<span className={styles.accentDot}> /</span> DIRECT
          </span>
        </div>

        <div className={styles.controlActions}>
          <button
            onClick={toggleTheme}
            className={styles.themeToggleBtn}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            <span className={styles.themeText}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>

      {/* Characterful Typographic Masthead */}
      <div className={styles.brandingBlock}>
        <h1 className={styles.brandWordmark}>
          Ask Prof<span className={styles.brandAccent}>.</span>
        </h1>
        <p className={styles.authorName}>{realName}</p>
      </div>

      {/* Tightened, legible bio */}
      <p className={styles.bioText}>{bio}</p>

      {/* Integrated Sidebar Meta: Social & Live Stats */}
      <div className={styles.metaStack}>
        <div className={styles.socialLinks}>
          <a
            href={profile?.linkedin || 'https://www.linkedin.com/in/mahmoud-sayed-mohamed'}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLinkItem}
            aria-label="LinkedIn Profile"
          >
            LinkedIn
          </a>
          <span className={styles.accentDot}>·</span>
          <a
            href={profile?.github || 'https://github.com/ixProf'}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLinkItem}
            aria-label="GitHub Profile"
          >
            GitHub
          </a>
        </div>

        <div className={styles.statsCard}>
          <span className={styles.statSegment}>
            <strong>{stats.total_answered}</strong> {t.header.answeredCounter}
          </span>
          <span className={styles.accentDot}>·</span>
          <span className={styles.statSegment}>
            <strong>{stats.total_likes}</strong> {t.header.likesCounter}
          </span>
        </div>

        <div className={styles.adminAccessRow}>
          <Link href="/login" className={styles.adminLink}>
            Admin Access →
          </Link>
        </div>
      </div>
    </header>
  );
};
