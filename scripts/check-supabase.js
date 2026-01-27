/**
 * Supabase配置检查脚本
 * 运行: node scripts/check-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');

// 从.env.local读取配置
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 开始检查Supabase配置...\n');

// 1. 检查环境变量
console.log('1️⃣ 检查环境变量:');
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL 未设置');
  process.exit(1);
}
console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置');
  process.exit(1);
}
console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey.substring(0, 20) + '...');

// 2. 创建Supabase客户端
console.log('\n2️⃣ 创建Supabase客户端:');
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ 客户端创建成功');

// 3. 测试连接
async function checkConnection() {
  console.log('\n3️⃣ 测试数据库连接:');

  try {
    // 检查profiles表是否存在
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      console.error('❌ profiles表访问失败:', profilesError.message);
      console.log('   提示: 请确保已在Supabase中创建profiles表');
    } else {
      console.log('✅ profiles表可访问');
    }

    // 检查scores表是否存在
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('count')
      .limit(1);

    if (scoresError) {
      console.error('❌ scores表访问失败:', scoresError.message);
      console.log('   提示: 请确保已在Supabase中创建scores表');
    } else {
      console.log('✅ scores表可访问');
    }

    // 检查RLS策略
    console.log('\n4️⃣ 检查Row Level Security (RLS):');

    const { data: publicProfiles, error: publicError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (publicError) {
      console.error('❌ 无法读取公开数据:', publicError.message);
      console.log('   提示: 请确保已设置RLS策略允许公开读取profiles表');
    } else {
      console.log('✅ 公开数据读取正常');
    }

    const { data: publicScores, error: scoresPublicError } = await supabase
      .from('scores')
      .select('*')
      .limit(1);

    if (scoresPublicError) {
      console.error('❌ 无法读取公开数据:', scoresPublicError.message);
      console.log('   提示: 请确保已设置RLS策略允许公开读取scores表');
    } else {
      console.log('✅ 公开数据读取正常');
    }

    // 获取一些统计信息
    console.log('\n5️⃣ 数据库统计:');

    const { count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: scoresCount } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 profiles记录数: ${profilesCount || 0}`);
    console.log(`📊 scores记录数: ${scoresCount || 0}`);

    console.log('\n✅ Supabase配置检查完成！');
    console.log('\n下一步:');
    console.log('1. 访问 http://localhost:3000/auth 注册账号');
    console.log('2. 完成一些测试');
    console.log('3. 访问 http://localhost:3000/profile 查看个人中心');
    console.log('4. 访问 http://localhost:3000/leaderboard 查看排行榜');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    process.exit(1);
  }
}

checkConnection();
