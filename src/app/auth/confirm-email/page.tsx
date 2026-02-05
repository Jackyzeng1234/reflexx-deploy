'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

function ConfirmEmailContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // 启动倒计时
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!canResend || resending) return;

    setResending(true);
    setMessage('');

    try {
      // 重新发送确认邮件
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        // 处理 429 错误（速率限制）
        if (error.status === 429 || error.message?.includes('rate limit')) {
          setMessage(t.authConfirmEmailRateLimit);
          setMessageType('error');
        } else {
          setMessage(t.authConfirmEmailError);
          setMessageType('error');
        }
      } else {
        setMessage(t.authConfirmEmailSent);
        setMessageType('success');
        // 重置倒计时
        setCountdown(60);
        setCanResend(false);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error: any) {
      // 处理网络错误等
      if (error?.status === 429 || error?.message?.includes('rate limit')) {
        setMessage(t.authConfirmEmailRateLimit);
        setMessageType('error');
      } else {
        setMessage(t.authConfirmEmailError);
        setMessageType('error');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 pt-20 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-4 text-6xl">✉️</div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
            {t.authConfirmEmailTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.authConfirmEmailSubtitle}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-white bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          <div className="p-8">
            {/* Email Display */}
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="mb-6 text-center text-gray-700 dark:text-gray-300">
              <p>{t.authConfirmEmailDesc}</p>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 rounded-lg border-2 p-4 text-center text-sm ${
                messageType === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {message}
              </div>
            )}

            {/* Resend Button */}
            <div>
              <button
                onClick={handleResendEmail}
                disabled={!canResend || resending}
                className="w-full rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {resending
                  ? t.authProcessing
                  : canResend
                  ? t.authConfirmEmailResend
                  : t.authConfirmEmailResendWait.replace('{seconds}', countdown.toString())
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}
