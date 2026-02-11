'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/supabase/client';
import { loadAllBestScoresToCache, clearUserBestScoreCache } from '@/lib/scores';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_QUERY_TIMEOUT = 5000; // 5秒超时保护

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    let subscription: any = null;

    // 动态导入 supabase 客户端，确保只在浏览器环境加载
    const initAuth = async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          if (isMounted) setLoading(false);
          return;
        }

        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);

          // 设置超时保护
          timeoutId = setTimeout(() => {
            if (isMounted) {
              setProfile({
                id: session.user.id,
                username: 'User',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              setLoading(false);
            }
          }, PROFILE_QUERY_TIMEOUT);

          // 获取 profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, created_at, updated_at')
            .eq('id', session.user.id)
            .single();

          // 清除超时
          if (timeoutId) clearTimeout(timeoutId);

          if (!isMounted) return;

          if (profileError || !profileData) {
            // 使用默认值
            setProfile({
              id: session.user.id,
              username: 'User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } else {
            setProfile(profileData);
          }

          setLoading(false);
        } else {
          setLoading(false);
        }

        // 监听认证状态变化
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;

          // 处理登出事件
          if (event === 'SIGNED_OUT' || (event as string) === 'USER_DELETED') {
            // 清理用户缓存（在 session?.user 变为 null 之前获取 userId）
            const prevUserId = user?.id;
            if (prevUserId) {
              clearUserBestScoreCache(prevUserId);
            }
          }

          setUser(session?.user ?? null);

          if (session?.user) {
            // 处理登录/注册事件 - 加载最佳记录到缓存
            if (event === 'SIGNED_IN' || (event as string) === 'USER_CREATED' || event === 'TOKEN_REFRESHED') {
              loadAllBestScoresToCache(session.user.id).catch(console.error);
            }

            // 获取 profile
            supabase
              .from('profiles')
              .select('id, username, created_at, updated_at')
              .eq('id', session.user.id)
              .single()
              .then(({ data, error }) => {
                if (!isMounted) return;

                if (error || !data) {
                  setProfile({
                    id: session.user.id,
                    username: 'User',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  });
                } else {
                  setProfile(data);
                }
                setLoading(false);
              });
          } else {
            setProfile(null);
            setLoading(false);
          }
        });

        // 保存 subscription 到外部变量
        subscription = sub;
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user?.id) {
      const { supabase } = await import('@/lib/supabase/client');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { supabase } = await import('@/lib/supabase/client');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { supabase } = await import('@/lib/supabase/client');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', data.user.id);

      if (updateError) {
        console.warn('Username update failed:', updateError);
      }
    }
  };

  const signOut = async () => {
    const { supabase } = await import('@/lib/supabase/client');

    // 清理当前用户的缓存
    if (user?.id) {
      clearUserBestScoreCache(user.id);
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
