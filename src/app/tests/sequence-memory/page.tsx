'use client';

import { useI18n } from '@/lib/i18n';
import SequenceMemoryTest from '@/components/SequenceMemoryTest';

export default function SequenceMemoryPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto min-h-[600px] px-4 py-4">
      <div className="mb-4 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
          {t.sequenceMemoryTitle}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t.sequenceMemoryDesc}
        </p>
      </div>

      <SequenceMemoryTest />
    </div>
  );
}
