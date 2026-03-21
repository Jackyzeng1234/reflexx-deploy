'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setError(t.authResetLinkSentError);
        setSuccess(false);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || t.authResetLinkSentError);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
            {t.authForgotPasswordTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.authForgotPasswordSubtitle}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-white bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-3 rounded-lg border-2 border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {success ? (
              <div className="mb-3 rounded-lg border-2 border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20">
                <div className="mb-2 text-4xl">✉️</div>
                <h3 className="mb-2 text-xl font-bold text-green-800 dark:text-green-300">
                  {t.authResetLinkSent}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {t.authResetLinkSentDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.authEmail}
                  </label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                    placeholder={t.authEmailPlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary-600 px-6 py-2 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t.authProcessing : t.authSendResetLink}
                </button>
              </div>
            )}

            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              <Link
                href="/auth"
                className="inline-flex items-center font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t.authBackToLogin}
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.authBackToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
