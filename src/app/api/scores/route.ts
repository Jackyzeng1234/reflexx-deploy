import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { ScoreInsert } from '@/lib/supabase/client';

// GET - 获取排行榜
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const testType = searchParams.get('test_type');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!testType) {
      return NextResponse.json({ error: 'test_type is required' }, { status: 400 });
    }

    // 获取排行榜（包含用户信息）
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

    if (error) throw error;

    return NextResponse.json({ scores: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - 提交成绩
export async function POST(req: NextRequest) {
  try {
    // 获取用户session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { test_type, score, details } = body;

    if (!test_type || score === undefined) {
      return NextResponse.json(
        { error: 'test_type and score are required' },
        { status: 400 }
      );
    }

    // 插入成绩
    const { data: newScore, error } = await supabase
      .from('scores')
      .insert({
        user_id: session.user.id,
        test_type,
        score,
        details,
      } as ScoreInsert)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ score: newScore });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
