import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageContext';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Prof (بروف) — Ask Me Anything | Mahmoud Sayed Mohamed',
  description:
    'Encrypted Ask Me Anything terminal for Prof (Mahmoud Sayed Mohamed) — Saraha Clone. Ask technical or any thing anonymously.',
  keywords: [
    'Prof',
    'بروف',
    'Mahmoud Sayed Mohamed',
    'محمود سيد محمد',
    'Ask Me Anything',
    'Backend Developer',
    'ASP.NET Core',
    'System Design',
  ],
  authors: [{ name: 'Mahmoud Sayed Mohamed' }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/dali-mask-transparent.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
      { url: '/dali-mask-transparent.png' },
    ],
  },
  openGraph: {
    title: 'Prof (بروف) — Ask Me Anything',
    description:
      'Encrypted Ask Me Anything platform for Prof (Mahmoud Sayed Mohamed). Submit technical or any thing anonymously.',
    images: [{ url: '/dali-mask.png', width: 500, height: 500, alt: 'Prof Dali Mask' }],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
