import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageContext';
import { ThemeProvider } from '@/components/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { getBaseUrl } from '@/lib/url';

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'AskProf — Ask Me Anything | Mahmoud Sayed Mohamed',
  description:
    'Ask Me Anything terminal for Prof (Mahmoud Sayed Mohamed). Ask technical questions, get advice, or ask anything anonymously.',
  keywords: [
    'Prof',
    'Mahmoud Sayed Mohamed',
    'Ask Me Anything',
    'Backend Developer',
    'ASP.NET Core',
    'Software Engineer',
    'System Design',
  ],
  authors: [{ name: 'Mahmoud Sayed Mohamed' }],
  icons: {
    icon: [
      { url: '/smiley-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  openGraph: {
    title: 'AskProf — Ask Me Anything',
    description:
      'Ask Me Anything platform for Prof (Mahmoud Sayed Mohamed). Ask technical questions, get advice, or ask anything anonymously.',
    type: 'website',
    url: baseUrl,
    siteName: 'Ask Prof',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'AskProf — Ask Me Anything',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AskProf — Ask Me Anything',
    description:
      'Ask Me Anything platform for Prof (Mahmoud Sayed Mohamed). Ask technical questions, get advice, or ask anything anonymously.',
    images: [`${baseUrl}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
