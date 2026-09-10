'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from './LanguageContext';
import { FeedStats, ProfileBio } from '@/types/question';
import { Globe, MessageSquare, Heart, Shield } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  stats: FeedStats;
  profile?: ProfileBio;
}

export const Header: React.FC<HeaderProps> = ({ stats, profile }) => {
  const { locale, t, toggleLanguage } = useLanguage();

  const alias = locale === 'ar' ? (profile?.alias_ar || 'بروف') : (profile?.alias_en || 'Prof');
  const realName = locale === 'ar' ? (profile?.name_ar || 'محمود سيد محمد') : (profile?.name_en || 'Mahmoud Sayed Mohamed');
  const bio = locale === 'ar' ? (profile?.bio_ar || t.brand.bio) : (profile?.bio_en || t.brand.bio);

  return (
    <header className={styles.headerWrapper}>
      <div className={styles.topControls}>
        <div className={styles.brandSign}>
          <Shield size={16} color="var(--accent-gold)" />
          <span>{locale === 'ar' ? 'اسأل يا باشا' : 'Ask Ya Basha'}</span>
        </div>

        <div className={styles.controlActions}>
          <button
            onClick={toggleLanguage}
            className={styles.langBtn}
            title={locale === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            aria-label="Toggle language"
          >
            <Globe size={15} />
            <span>{t.header.langToggle}</span>
          </button>
        </div>
      </div>

      {/* Salvador Dali Mask Crest */}
      <div className={styles.maskContainer}>
        <div className={styles.maskOuterRing} />
        <div className={styles.maskInnerRing}>
          <Image
            src="/dali-mask.png"
            alt="Salvador Dalí Mask - Prof Mastermind Emblem"
            width={140}
            height={140}
            priority
            className={styles.maskImage}
          />
        </div>
        <span className={styles.identityBadge}>MASTERMIND</span>
      </div>

      {/* Alias & Real Name */}
      <h1 className={`${styles.aliasTitle} font-display`}>{alias}</h1>
      <h2 className={styles.realName}>{realName}</h2>

      {/* CV-style bio line */}
      <p className={styles.bioLine}>{bio}</p>

      {/* Verified CV Social Links */}
      <div className={styles.socialLinks}>
        <a
          href="https://www.linkedin.com/in/mahmoud-sayed-mohamed"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLinkItem}
          aria-label="LinkedIn Profile"
        >
          <span className={styles.socialIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2" />
            </svg>
          </span>
          <span>LinkedIn</span>
        </a>

        <a
          href="https://github.com/ixProf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialLinkItem}
          aria-label="GitHub Profile"
        >
          <span className={styles.socialIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </span>
          <span>GitHub</span>
        </a>
      </div>

      {/* Stats Counter Pill */}
      <div className={styles.statsPill}>
        <div className={styles.statItem}>
          <MessageSquare size={16} color="var(--accent-red)" />
          <span className={styles.statNumber}>{stats.total_answered}</span>
          <span>{t.header.answeredCounter}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <Heart size={16} color="var(--accent-red)" />
          <span className={styles.statNumber}>{stats.total_likes}</span>
          <span>{t.header.likesCounter}</span>
        </div>
      </div>
    </header>
  );
};
