import { supabase } from './supabase/client';

export interface ScoreData {
  test_type: string;
  score: number;
  details?: Record<string, any>;
}

/**
 * 提交成绩到Supabase
 * 如果用户已登录，提交到服务器；否则只保存到localStorage
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
