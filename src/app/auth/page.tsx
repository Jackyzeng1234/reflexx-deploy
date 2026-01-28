'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function AuthPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 邮箱格式验证
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // 登录
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // 检查是否是邮箱未确认错误
          if (signInError.message.includes('Email not confirmed')) {
            setError(t.authErrorEmailNotConfirmed);
            setLoading(false);
            return;
          }
          throw signInError;
        }

        // 跳转到首页
        router.push('/');
      } else {
        // 注册前验证
        if (!isValidEmail(email)) {
          setError(t.authErrorEmailInvalid);
          setLoading(false);
          return;
        }

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

        if (username.length < 3) {
          setError(t.authUsername);
          setLoading(false);
          return;
        }

        // 检查用户名是否已存在
        const { data: usernameCheck } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .limit(1);

        if (usernameCheck && usernameCheck.length > 0) {
          setError(t.authErrorUsernameExists);
          setLoading(false);
          return;
        }

        // 注册
        console.log('开始注册，邮箱:', email);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            },
          },
        });

        console.log('注册结果:', { data, signUpError });

        if (signUpError) {
          console.log('注册错误:', signUpError.message);

          // 处理常见错误
          if (
            signUpError.message.includes('User already registered') ||
            signUpError.message.includes('already been registered') ||
            signUpError.message.includes('already been taken') ||
            signUpError.message.includes('A user with this email') ||
            signUpError.message === 'Duplicate email' ||
            signUpError.status === 400
          ) {
            setError(t.authErrorEmailExists);
            setLoading(false);
            return;
          } else if (signUpError.message.includes('Password')) {
            setError(t.authErrorPasswordTooShort);
            setLoading(false);
            return;
          } else {
            setError(signUpError.message);
            setLoading(false);
            return;
          }
        }

        // 检查是否真正注册成功（data.user 应该存在）
        if (!data.user) {
          console.log('注册未返回用户数据，data:', data);
          // 如果没有返回 user 但有 session，说明是已登录用户
          if (data.session) {
            console.log('用户已登录，邮箱可能已存在');
            setError(t.authErrorEmailExists);
            setLoading(false);
            return;
          }
          setError(t.authErrorEmailExists);
          setLoading(false);
          return;
        }

        // 检查是否是已存在用户（identity_id 已存在表示用户已注册）
        if (data.user.identities && data.user.identities.length === 0) {
          console.log('用户 identities 为空，可能是邮箱已注册但通过其他方式登录');
          setError(t.authErrorEmailExists);
          setLoading(false);
          return;
        }

        console.log('注册成功，用户ID:', data.user.id);

        router.push('/');
      }
    } catch (err: any) {
      console.log('捕获到异常:', err);
      setError(err.message || t.authError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 pt-20 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
            {isLogin ? t.authLoginTitle : t.authRegisterTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? t.authLoginSubtitle : t.authRegisterSubtitle}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-white bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          {/* Toggle */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setConfirmPassword('');
              }}
              className={`flex-1 px-6 py-3 text-center font-semibold transition-all ${
                isLogin
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {t.authLogin}
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setConfirmPassword('');
              }}
              className={`flex-1 px-6 py-3 text-center font-semibold transition-all ${
                !isLogin
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {t.authRegister}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-3 rounded-lg border-2 border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {!isLogin && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.authUsername}
                  </label>
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError('');
                    }}
                    required
                    minLength={3}
                    maxLength={20}
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                    placeholder={t.authUsernamePlaceholder}
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.authEmail}
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete={isLogin ? "email" : "email"}
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

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.authPassword}
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                  minLength={6}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                  placeholder={t.authPasswordPlaceholder}
                />
              </div>

              {/* Forgot Password Link - Only show in login mode */}
              {isLogin && (
                <div className="text-right">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    {t.authForgotPassword}
                  </Link>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.authConfirmPassword}
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
                    className={`w-full rounded-lg border-2 px-4 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500'
                        : confirmPassword && password === confirmPassword
                        ? 'border-green-500'
                        : ''
                    }`}
                    placeholder={t.authConfirmPasswordPlaceholder}
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
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary-600 px-6 py-2 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t.authProcessing : (isLogin ? t.authLoginButton : t.authRegisterButton)}
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? t.authNoAccount : t.authHasAccount}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setConfirmPassword('');
                }}
                className="ml-2 font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                {isLogin ? t.authRegisterNow : t.authLoginNow}
              </button>
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
