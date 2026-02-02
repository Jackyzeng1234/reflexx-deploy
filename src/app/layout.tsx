import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import StructuredData from '@/components/StructuredData';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReflexX - Professional Reaction Time Testing | Test Your Limits',
  description: 'Free online reaction time tests by ReflexX. Measure your reflexes and reaction speed with professional-grade tools. Test your limits and track your progress.',
  keywords: ['reflex test', 'reflexx', 'reaction time test', 'reaction test', 'click speed test', 'cps test', 'aim trainer', 'reflex training'],
  authors: [{ name: 'ReflexX' }],
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    title: 'ReflexX - Professional Reaction Time Testing | Test Your Limits',
    description: 'Free online reaction time tests by ReflexX. Measure your reflexes and reaction speed with professional-grade tools.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReflexX - Professional Reaction Time Testing | Test Your Limits',
    description: 'Free online reaction time tests by ReflexX. Measure your reflexes and reaction speed.',
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
  // 网站级别的结构化数据
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ReflexX",
    "alternateName": "ReflexX - Professional Reaction Time Testing",
    "url": "https://reflextest-online.com",
    "description": "Professional reaction time testing by ReflexX. Measure your reflexes, clicking speed, memory, and cognitive abilities with professional-grade tools. Test your limits today.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://reflextest-online.com/tests?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ReflexX",
      "url": "https://reflextest-online.com"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData data={websiteStructuredData} />
      </head>
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
