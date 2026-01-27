import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '⚡ Reaction Time Test',
  description: 'Free online reaction time tests. Measure your reflexes and cognitive abilities with professional-grade tools. Test your reaction speed, click speed, and more.',
  keywords: ['reaction time test', 'reaction test', 'click speed test', 'cps test', 'aim trainer', 'reflex test'],
  authors: [{ name: 'ReactionTest' }],
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    title: 'Reaction Time Test - Measure Your Reflexes',
    description: 'Free online reaction time tests. Measure your reflexes and cognitive abilities with professional-grade tools.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reaction Time Test - Measure Your Reflexes',
    description: 'Free online reaction time tests. Measure your reflexes and cognitive abilities.',
  },
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'zh': '/zh',
      'es': '/es',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <I18nProvider>
            <div className="flex min-h-screen flex-col">
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
