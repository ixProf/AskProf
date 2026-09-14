import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageContext';
import { ThemeProvider } from '@/components/ThemeContext';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
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
