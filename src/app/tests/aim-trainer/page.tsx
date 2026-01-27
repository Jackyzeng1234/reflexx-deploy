'use client';

import { Metadata } from 'next';
import { useI18n } from '@/lib/i18n';
import AimTrainer from '@/components/AimTrainer';

export default function AimTrainerPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto min-h-[600px] px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
          {t.aimTrainer}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t.aimTrainerDesc}
        </p>
      </div>

      <div className="h-[600px]">
        <AimTrainer />
      </div>
    </div>
  );
}
