import React from 'react';
import Link from 'next/link';
import { getProfile, getFeedStats } from '@/lib/db';
import styles from './about.module.css';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const [profile, stats] = await Promise.all([
    getProfile(),
    getFeedStats(),
  ]);

  const realName = profile?.name_en || 'Mahmoud Sayed Mohamed';
  const bio = profile?.bio_en || "I'm Mahmoud, but most people call me Prof. I'm a software developer who likes building things, trying new ideas, and figuring stuff out along the way.";

  return (
    <main className={styles.aboutContainer}>
      {/* Back Link */}
      <div className={styles.backRow}>
        <Link href="/" className={styles.backLink}>
          ← Back to Q&A
        </Link>
      </div>

      {/* Hero */}
      <header className={styles.aboutHeader}>
        <h1 className={styles.aboutTitle}>
          About Prof<span className={styles.accentDot}>.</span>
        </h1>
        <p className={styles.authorSubtitle}>
          {realName} <span className={styles.accentDot}>·</span> Backend Developer
        </p>
      </header>

      {/* Main Bio Card */}
      <section className={styles.bioCard}>
        <h2 className={styles.bioHeading}>Background & Focus</h2>
        <p className={styles.bioParagraph}>{bio}</p>

        <h2 className={styles.bioHeading} style={{ marginTop: 'var(--space-6)' }}>
          About this Terminal
        </h2>
        <p className={styles.bioParagraph}>
          This platform is an open, anonymous Q&amp;A space. You can ask technical questions about backend engineering, system architecture, career trajectory, or anything on your mind. Questions are received anonymously, answered directly, and published to the public archive.
        </p>

        {/* Stats Pill */}
        <div className={styles.statsRow}>
          <span className={styles.statItem}>
            <strong>{stats.total_answered}</strong> Answers Published
          </span>
          <span className={styles.accentDot}>·</span>
          <span className={styles.statItem}>
            <strong>{stats.total_likes}</strong> Community Likes
          </span>
        </div>
      </section>

      {/* Connect Links */}
      <section className={styles.linksSection}>
        <h3 className={styles.linksHeading}>Verified Profiles</h3>
        <div className={styles.linksGrid}>
          <a
            href={profile?.linkedin || 'https://www.linkedin.com/in/mahmoud-sayed-mohamed'}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.profileLinkCard}
          >
            <span className={styles.linkPlatform}>LinkedIn</span>
            <span className={styles.linkHandle}>/in/mahmoud-sayed-mohamed</span>
          </a>

          <a
            href={profile?.github || 'https://github.com/ixProf'}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.profileLinkCard}
          >
            <span className={styles.linkPlatform}>GitHub</span>
            <span className={styles.linkHandle}>@ixProf</span>
          </a>

          <a
            href="https://x.com/v2PROF"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.profileLinkCard}
          >
            <span className={styles.linkPlatform}>X (Twitter)</span>
            <span className={styles.linkHandle}>@v2PROF</span>
          </a>
        </div>
      </section>

      {/* CTA Bottom */}
      <div className={styles.ctaBottom}>
        <Link href="/" className="btn-red">
          Ask a Question
        </Link>
      </div>
    </main>
  );
}
