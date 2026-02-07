import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const KEEP_ALIVE_COUNT = 20;
const KEEP_ALIVE_PREFIX = '__keepalive__';

export async function GET(request: NextRequest) {
  // 可选：验证 cron secret（用于 Vercel Cron 或其他 cron 服务）
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  // 如果设置了 CRON_SECRET，则验证
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // 1. 创建 20 个临时账号
    const tempAccounts = Array.from({ length: KEEP_ALIVE_COUNT }, (_, i) => ({
      issuer: KEEP_ALIVE_PREFIX,
      account: `temp_${Date.now()}_${i}`,
      secret: 'JBSWY3DPEHPK3PXP', // 固定的测试密钥
      remark: 'auto-generated for keep-alive'
    }));

    const { data: insertedAccounts, error: insertError } = await supabaseAdmin
      .from('accounts')
      .insert(tempAccounts)
      .select('id');

    if (insertError) {
      throw new Error(`Failed to insert accounts: ${insertError.message}`);
    }

    const insertedIds = insertedAccounts?.map(acc => acc.id) || [];

    // 2. 删除刚刚创建的账号
    const { error: deleteError } = await supabaseAdmin
      .from('accounts')
      .delete()
      .in('id', insertedIds);

    if (deleteError) {
      throw new Error(`Failed to delete accounts: ${deleteError.message}`);
    }

    // 3. 同时清理可能遗留的旧保活账号（以 __keepalive__ 开头的）
    await supabaseAdmin
      .from('accounts')
      .delete()
      .eq('issuer', KEEP_ALIVE_PREFIX);

    return NextResponse.json({
      success: true,
      message: `Keep-alive completed: created and deleted ${insertedIds.length} accounts`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
