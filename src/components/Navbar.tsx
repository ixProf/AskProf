'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeContext';
import { SmileyLogoIcon } from './SmileyLogoIcon';
import { Sun, Moon } from 'lucide-react';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={styles.navbar} aria-label="Main Navigation">
      <div className={styles.navInner}>
        {/* Left: Hand-drawn Red Smiley Mark + Wordmark */}
        <Link href="/" className={styles.brandLink}>
          <SmileyLogoIcon size={24} className={styles.logoMark} />
          <span className={styles.brandWordmark}>
            AskProf<span className={styles.brandAccent}>.</span>
          </span>
        </Link>

        {/* Right: Nav items */}
        <div className={styles.navActions}>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>

          <a
            href="https://x.com/v2PROF"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navLink}
            aria-label="X Profile (@v2PROF)"
          >
            <span className={styles.xIconLabel}>X</span>
          </a>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={styles.themeToggleBtn}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </nav>
  );
};
