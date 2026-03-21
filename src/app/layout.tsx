import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import StructuredData from '@/components/StructuredData';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReflexX - Free Reaction & Memory Tests',
  description: 'Test your reaction time, memory, and cognitive abilities with 9+ free online tests. Global leaderboard, no signup required. Start testing now!',
  keywords: ['reflex test', 'reflexx', 'reaction time test', 'reaction test', 'click speed test', 'cps test', 'aim trainer', 'reflex training', 'memory test', 'cognitive test'],
  authors: [{ name: 'ReflexX' }],
  verification: {
    google: '1nnkbQnsfU1QeeL_1Uxy_mnK5aSGUGYeSoDa7bsXs0s',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    title: 'ReflexX - Free Reaction & Memory Tests',
    description: 'Test your reaction time, memory, and cognitive abilities with 9+ free online tests. Global leaderboard, no signup required.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReflexX - Free Reaction & Memory Tests',
    description: 'Test your reaction time, memory, and cognitive abilities with 9+ free online tests. Global leaderboard, no signup.',
  },
  alternates: {
    canonical: 'https://reflexx.uk',
    languages: {
      'en': 'https://reflexx.uk/en',
      'zh': 'https://reflexx.uk/zh',
      'es': 'https://reflexx.uk/es',
    },
  },
  other: {
    'msvalidate.01': 'BA889168A79214B6442EE82A4F80695E',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 网站级别的结构化数据
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ReflexX",
    "alternateName": "ReflexX - Professional Reaction Time Testing",
    "url": "https://reflexx.uk",
    "description": "Professional reaction time testing by ReflexX. Measure your reflexes, clicking speed, memory, and cognitive abilities with professional-grade tools. Test your limits today.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://reflexx.uk/tests?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ReflexX",
      "url": "https://reflexx.uk"
    }
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <StructuredData data={websiteStructuredData} />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
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
