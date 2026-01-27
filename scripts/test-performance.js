/**
 * Supabase 性能测试脚本
 * 运行: node scripts/test-performance.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
});

console.log('🚀 开始 Supabase 性能测试...\n');

async function testQuery(description, queryFn) {
  const start = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - start;

    const dataCount = result.data?.length || 0;
    console.log(`✅ ${description}`);
    console.log(`   耗时: ${duration}ms`);
    console.log(`   结果数量: ${dataCount}`);

    if (duration > 1000) {
      console.log(`   ⚠️  警告: 查询时间超过1秒!`);
    } else if (duration > 500) {
      console.log(`   ⚠️  注意: 查询时间超过500ms`);
    } else {
      console.log(`   ✓ 性能良好`);
    }

    return { duration, data: result.data, success: true };
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`❌ ${description}`);
    console.log(`   耗时: ${duration}ms`);
    console.log(`   错误:`, error.message);
    return { duration, error, success: false };
  }
}

async function runTests() {
  const results = [];

  // 测试 1: 简单查询 - profiles 表
  console.log('📊 测试 1: 查询 profiles 表...');
  const test1 = await testQuery(
    '简单查询 profiles',
    () => supabase.from('profiles').select('*').limit(10)
  );
  results.push({ name: 'Profiles 查询', ...test1 });
  console.log('');

  // 测试 2: 简单查询 - scores 表
  console.log('📊 测试 2: 查询 scores 表...');
  const test2 = await testQuery(
    '简单查询 scores',
    () => supabase.from('scores').select('*').limit(10)
  );
  results.push({ name: 'Scores 查询', ...test2 });
  console.log('');

  // 测试 3: 带条件的查询 - scores
  console.log('📊 测试 3: 条件查询 scores (test_type)...');
  const test3 = await testQuery(
    '条件查询 scores',
    () => supabase.from('scores').select('*').eq('test_type', 'simple-reaction').limit(10)
  );
  results.push({ name: 'Scores 条件查询', ...test3 });
  console.log('');

  // 测试 4: 排序查询 - scores
  console.log('📊 测试 4: 排序查询 scores...');
  const test4 = await testQuery(
    '排序查询 scores',
    () => supabase
      .from('scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(10)
  );
  results.push({ name: 'Scores 排序查询', ...test4 });
  console.log('');

  // 测试 5: JOIN 查询 - scores + profiles
  console.log('📊 测试 5: JOIN 查询 (scores + profiles)...');
  const test5 = await testQuery(
    'JOIN 查询',
    () => supabase
      .from('scores')
      .select('*, profiles(username)')
      .limit(10)
  );
  results.push({ name: 'JOIN 查询', ...test5 });
  console.log('');

  // 测试 6: 排行榜查询
  console.log('📊 测试 6: 排行榜查询 (实际使用的查询)...');
  const test6 = await testQuery(
    '排行榜查询',
    () => supabase
      .from('scores')
      .select(`
        id,
        score,
        details,
        created_at,
        user_id,
        profiles!inner(username)
      `)
      .eq('test_type', 'simple-reaction')
      .order('score', { ascending: false })
      .limit(100)
  );
  results.push({ name: '排行榜查询', ...test6 });
  console.log('');

  // 测试 7: 批量查询 - 所有测试类型
  console.log('📊 测试 7: 批量查询 (10种测试类型)...');
  const batchStart = Date.now();
  const testTypes = ['simple-reaction', 'auditory-reaction', 'choice-reaction', 'click-speed', 'sequence-memory', 'typing', 'chimp', 'aim-trainer', 'stroop', 'number-memory'];
  let successCount = 0;

  for (const testType of testTypes) {
    try {
      await supabase
        .from('scores')
        .select('*')
        .eq('test_type', testType)
        .limit(10);
      successCount++;
    } catch (error) {
      console.error(`   ❌ ${testType}:`, error.message);
    }
  }

  const batchDuration = Date.now() - batchStart;
  console.log(`✅ 批量查询完成`);
  console.log(`   总耗时: ${batchDuration}ms`);
  console.log(`   成功: ${successCount}/${testTypes.length}`);
  console.log(`   平均: ${(batchDuration / testTypes.length).toFixed(2)}ms/查询`);
  results.push({ name: '批量查询', duration: batchDuration, success: successCount === testTypes.length });
  console.log('');

  // 测试 8: 聚合查询 - 统计
  console.log('📊 测试 8: 统计查询...');
  const test8 = await testQuery(
    '统计查询',
    () => supabase.from('scores').select('*', { count: 'exact', head: true })
  );
  results.push({ name: '统计查询', ...test8 });
  console.log('');

  // 总结
  console.log('═══════════════════════════════════════════════════');
  console.log('📊 性能测试总结');
  console.log('═══════════════════════════════════════════════════\n');

  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
  const avgTime = totalTime / results.length;

  console.log(`总测试数: ${results.length}`);
  console.log(`成功: ${successfulTests.length}`);
  console.log(`失败: ${failedTests.length}`);
  console.log(`总耗时: ${totalTime}ms`);
  console.log(`平均耗时: ${avgTime.toFixed(2)}ms`);
  console.log('');

  // 性能评估
  console.log('性能评估:');
  if (avgTime < 200) {
    console.log('✅ 优秀 - 平均响应时间小于200ms');
  } else if (avgTime < 500) {
    console.log('⚠️  良好 - 平均响应时间在200-500ms之间');
  } else if (avgTime < 1000) {
    console.log('⚠️  一般 - 平均响应时间在500-1000ms之间');
  } else {
    console.log('❌ 较慢 - 平均响应时间超过1秒，建议优化！');
  }

  console.log('');

  // 慢查询提示
  const slowQueries = results.filter(r => r.duration > 500);
  if (slowQueries.length > 0) {
    console.log('⚠️  慢查询列表 (超过500ms):');
    slowQueries.forEach(q => {
      console.log(`   - ${q.name}: ${q.duration}ms`);
    });
    console.log('');
    console.log('优化建议:');
    console.log('1. 检查 Supabase 项目区域是否离你的用户最近');
    console.log('2. 考虑添加数据库索引');
    console.log('3. 减少查询返回的字段数量');
    console.log('4. 考虑使用 Supabase Edge Functions');
  }

  console.log('\n═══════════════════════════════════════════════════');
}

runTests().catch(console.error);
