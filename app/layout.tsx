import type { Metadata, Viewport } from 'next';
import { Montserrat, Montserrat_Alternates } from 'next/font/google';
import { SessionProvider } from '@/lib/session/session-provider';
import { LocaleProvider } from '@/lib/i18n/locale-provider';
import './globals.css';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '700'],
});

const montserratAlternates = Montserrat_Alternates({
  variable: '--font-montserrat-alternates',
  subsets: ['latin'],
  weight: ['700'],
});

export const metadata: Metadata = {
  title: 'Sun* Annual Awards 2025 | Root Further',
  description:
    'Trang chủ Sun* Annual Awards 2025 — chủ đề Root Further, đếm ngược sự kiện, hệ thống giải thưởng và Sun* Kudos.',
};

export const viewport: Viewport = {
  themeColor: '#00101a',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${montserratAlternates.variable}`}
    >
      <body className="min-h-full">
        <SessionProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
