import { supabase } from './supabase/client';

export interface ScoreData {
  test_type: string;
  score: number;
  details?: Record<string, any>;
}

/**
 * 提交成绩到Supabase
 * 如果用户已登录，提交到服务器并更新缓存；否则只保存到localStorage
 */
export async function submitScore(data: ScoreData): Promise<boolean> {
  try {
    // 检查用户是否登录
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // 用户已登录，提交到Supabase
      const { error } = await supabase
        .from('scores')
        .insert({
          user_id: session.user.id,
          test_type: data.test_type,
          score: data.score,
          details: data.details,
        });

      if (error) {
        console.error('Failed to submit score:', error);
        return false;
      }

      // 更新缓存：重新查询该测试类型的最佳记录
      const bestScore = await getUserBestScoreFromDB(data.test_type, session.user.id);
      const cacheKey = getUserCacheKey(session.user.id, data.test_type);
      localStorage.setItem(cacheKey, JSON.stringify({ score: bestScore }));
      console.log(`💾 [缓存] 更新 ${data.test_type} 最佳记录:`, bestScore);

      return true;
    } else {
      // 用户未登录，只保存到localStorage（由组件处理）
      return false;
    }
  } catch (error) {
    console.error('Error submitting score:', error);
    return false;
  }
}

/**
 * 获取排行榜数据
 */
export async function getLeaderboard(testType: string, limit: number = 100) {
  const startTime = performance.now();
  console.log(`📊 [性能] 开始查询排行榜 (${testType}), limit: ${limit}...`);

  try {
    const queryStart = performance.now();
    const { data, error } = await supabase
      .from('scores')
      .select(`
        id,
        score,
        details,
        created_at,
        user_id,
        profiles!inner(username)
      `)
      .eq('test_type', testType)
      .order('score', { ascending: false })
      .limit(limit);

    const queryTime = performance.now() - queryStart;
    const totalTime = performance.now() - startTime;

    console.log(`📊 [性能] 排行榜查询完成，查询耗时: ${queryTime.toFixed(2)}ms，总耗时: ${totalTime.toFixed(2)}ms，结果数量: ${data?.length || 0}`);

    if (error) throw error;

    return { scores: data, error: null };
  } catch (error: any) {
    const errorTime = performance.now() - startTime;
    console.error(`❌ [性能] 排行榜查询失败，耗时: ${errorTime.toFixed(2)}ms:`, error);
    return { scores: [], error: error.message };
  }
}

/**
 * 获取用户历史最佳成绩
 */
export async function getUserBestScores(testType?: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return { scores: [], error: 'Not authenticated' };
    }

    let query = supabase
      .from('scores')
      .select('*')
      .eq('user_id', session.user.id);

    if (testType) {
      query = query.eq('test_type', testType);
    }

    const { data, error } = await query.order('score', { ascending: false });

    if (error) throw error;

    return { scores: data, error: null };
  } catch (error: any) {
    console.error('Error fetching user scores:', error);
    return { scores: [], error: error.message };
  }
}

// ==================== 最佳记录获取系统 ====================

// 所有测试类型
const ALL_TEST_TYPES = [
  'simple-reaction',
  'auditory-reaction',
  'click-speed',
  'choice-reaction',
  'sequence-memory',
  'typing',
  'chimp',
  'stroop',
  'number-memory',
];

/**
 * 从 localStorage 获取访客最佳分数
 */
function getGuestBestScore(testType: string): number | null {
  const localStorageKey = `${testType}-results`;

  try {
    const results = JSON.parse(localStorage.getItem(localStorageKey) || '[]');

    if (results.length === 0) return null;

    // 根据测试类型计算最佳分数
    switch (testType) {
      case 'simple-reaction':
      case 'auditory-reaction':
      case 'choice-reaction':
        // 反应时间测试：越小越好
        return Math.min(...results.map((r: any) => r.average));

      case 'click-speed':
        // 点击速度：越大越好
        return Math.max(...results.map((r: any) => r.cps));

      case 'sequence-memory':
      case 'chimp':
      case 'number-memory':
        // 记忆测试：分数越高越好
        return Math.max(...results.map((r: any) => r.level || r.digits));

      case 'typing':
        // 打字测试：WPM 越高越好
        return Math.max(...results.map((r: any) => r.wpm));

      case 'stroop':
        // Stroop 测试：分数越高越好
        return Math.max(...results.map((r: any) => r.score));

      default:
        return null;
    }
  } catch (error) {
    console.error(`读取 ${testType} localStorage 数据失败:`, error);
    return null;
  }
}

/**
 * 从 Supabase 获取已登录用户的最佳分数
 */
async function getUserBestScoreFromDB(
  testType: string,
  userId: string
): Promise<number | null> {
  try {
    console.log(`📊 [DB] 查询 ${testType} 最佳记录...`);

    const { data, error } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', userId)
      .eq('test_type', testType)
      .order('score', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      const bestScore = data[0].score;
      console.log(`✅ [DB] ${testType} 最佳记录:`, bestScore);
      return bestScore;
    }

    return null;
  } catch (error) {
    console.error(`❌ [DB] 查询 ${testType} 最佳记录失败:`, error);
    return null;
  }
}

/**
 * 获取用户缓存 key
 */
function getUserCacheKey(userId: string, testType: string): string {
  return `bestscore_cache_user_${userId}_${testType}`;
}

/**
 * 获取最佳分数（统一接口，带缓存）
 * @param testType 测试类型（如 'simple-reaction', 'number-memory' 等）
 * @returns 最佳分数，如果不存在则返回 null
 */
export async function getBestScore(testType: string): Promise<number | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (userId) {
    // 已登录用户：先查缓存
    const cacheKey = getUserCacheKey(userId, testType);
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const { score } = JSON.parse(cached);
        console.log(`✅ [缓存] ${testType} 最佳记录:`, score);
        return score;
      } catch (error) {
        console.warn('缓存数据损坏，重新查询');
      }
    }

    // 缓存未命中，从 Supabase 查询
    const score = await getUserBestScoreFromDB(testType, userId);

    if (score !== null) {
      // 写入缓存
      localStorage.setItem(cacheKey, JSON.stringify({ score }));
      console.log(`💾 [缓存] 保存 ${testType} 最佳记录:`, score);
    }

    return score;
  }

  // 访客用户：从 localStorage 获取
  return getGuestBestScore(testType);
}

/**
 * 用户登录时，加载所有最佳记录到缓存
 */
export async function loadAllBestScoresToCache(userId: string): Promise<void> {
  console.log('🔄 [缓存] 开始加载用户所有最佳记录...');

  for (const testType of ALL_TEST_TYPES) {
    try {
      const score = await getUserBestScoreFromDB(testType, userId);
      const cacheKey = getUserCacheKey(userId, testType);

      if (score !== null) {
        localStorage.setItem(cacheKey, JSON.stringify({ score }));
        console.log(`✅ [缓存] ${testType}: ${score}`);
      } else {
        // 没有记录，也缓存 null
        localStorage.setItem(cacheKey, JSON.stringify({ score: null }));
      }
    } catch (error) {
      console.error(`❌ [缓存] 加载 ${testType} 失败:`, error);
    }
  }

  console.log('✅ [缓存] 所有最佳记录加载完成');
}

/**
 * 用户登出时，清理该用户的缓存
 */
export function clearUserBestScoreCache(userId: string): void {
  console.log(`🗑️ [缓存] 清理用户 ${userId} 的缓存...`);

  Object.keys(localStorage)
    .filter(key => key.startsWith(`bestscore_cache_user_${userId}_`))
    .forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ [缓存] 删除: ${key}`);
    });

  console.log('✅ [缓存] 用户缓存清理完成');
}
