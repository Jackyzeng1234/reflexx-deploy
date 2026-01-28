'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Check if we have a valid session (from the email link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError(t.authInvalidResetLink);
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    };

    checkSession();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate passwords
      if (password.length < 6) {
        setError(t.authErrorPasswordTooShort);
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError(t.authErrorPasswordMismatch);
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message || t.authPasswordUpdateError);
        setSuccess(false);
      } else {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || t.authPasswordUpdateError);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 pt-20 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
            {t.authResetPasswordTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.authResetPasswordSubtitle}
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
                <div className="mb-2 text-4xl">✅</div>
                <h3 className="mb-2 text-xl font-bold text-green-800 dark:text-green-300">
                  {t.authPasswordUpdated}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {t.authPasswordUpdatedDesc}
                </p>
                <p className="mt-2 text-xs text-green-600 dark:text-green-500">
                  {t.authLoginNow} →
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.authNewPassword}
                  </label>
                  <input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    required
                    minLength={6}
                    disabled={!isValid}
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={t.authNewPasswordPlaceholder}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.authConfirmNewPassword}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    required
                    minLength={6}
                    disabled={!isValid}
                    className={`w-full rounded-lg border-2 px-4 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500'
                        : confirmPassword && password === confirmPassword
                        ? 'border-green-500'
                        : 'border-gray-300'
                    }`}
                    placeholder={t.authConfirmNewPasswordPlaceholder}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {t.authErrorPasswordMismatch}
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                      ✓
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="w-full rounded-lg bg-primary-600 px-6 py-2 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t.authProcessing : t.authUpdatePassword}
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
      </div>
    </div>
  );
}
