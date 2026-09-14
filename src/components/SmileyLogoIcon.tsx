'use client';

import React from 'react';

interface SmileyLogoIconProps {
  size?: number;
  className?: string;
  color?: string;
  withBackground?: boolean;
}

/**
 * Hand-drawn marker-style smiley face icon in brand red:
 * - A slightly irregular, organic circle outline (marker-drawn feel without dripping/bleeding).
 * - Two simple small dot/oval eyes.
 * - One simple curved smile line.
 * - Transparent background by default for inline navbar use; optional dark rounded-square background for app icon/favicon use.
 */
export const SmileyLogoIcon: React.FC<SmileyLogoIconProps> = ({
  size = 24,
  className,
  color = 'var(--accent-red, #dc2626)',
  withBackground = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {/* Optional dark rounded-square background for favicon/app icon mode */}
      {withBackground && (
        <rect
          width="32"
          height="32"
          rx="7"
          fill="#121216"
        />
      )}

      {/* Slightly irregular hand-drawn marker circle outline with organic variation */}
      <path
        d="M23.5 7.8C19 4.3 11.2 4.8 7 10.2C2.8 15.8 4.2 24.2 10.2 27.2C16.2 30.2 24.8 27.2 27.5 20.5C29.8 14.5 26.2 7.5 19.8 6.2"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Two simple small oval dot eyes */}
      <ellipse
        cx="12.2"
        cy="13.6"
        rx="1.3"
        ry="1.7"
        fill={color}
      />
      <ellipse
        cx="19.8"
        cy="13.6"
        rx="1.3"
        ry="1.7"
        fill={color}
      />

      {/* One simple curved smile line */}
      <path
        d="M11.8 18.8C13.6 22.4 18.4 22.4 20.2 18.8"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
};
