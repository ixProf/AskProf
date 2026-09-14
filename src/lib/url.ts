/**
 * Get the fully qualified base URL for canonical URLs, Open Graph tags, and social previews.
 * Resolves dynamically across Vercel production, preview deployments, and local dev.
 */
export function getBaseUrl(): string {
  // 1. Explicitly configured URL in environment variables
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }

  // 2. Vercel production system variables
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Fallback for deployed production environments
  if (process.env.NODE_ENV === 'production') {
    return 'https://askyabasha.vercel.app';
  }

  // 4. Local development default
  return 'http://localhost:3000';
}
