'use client';

import { useI18n } from '@/lib/i18n';
import TypingTest from '@/components/TypingTest';

export default function TypingTestPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto min-h-[600px] px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
          {t.typingTitle}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t.typingDesc}
        </p>
      </div>

      <TypingTest />
    </div>
  );
}
