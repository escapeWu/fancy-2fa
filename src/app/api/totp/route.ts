import { NextRequest, NextResponse } from 'next/server';
import * as OTPAuth from 'otpauth';
import { AccountRepository } from '@/lib/db/supabase-repository';

const DEFAULT_PERIOD = 30;

function generateTOTP(secret: string, issuer: string, account: string, period: number = DEFAULT_PERIOD): string {
  const totp = new OTPAuth.TOTP({
    issuer,
    label: account,
    algorithm: 'SHA1',
    digits: 6,
    period,
    secret: OTPAuth.Secret.fromBase32(secret.replace(/\s/g, '').toUpperCase()),
  });
  return totp.generate();
}

export async function GET(request: NextRequest) {
  // 验证 Authorization header
  const authHeader = request.headers.get('Authorization');
  const expectedToken = process.env.API_AUTH_TOKEN;

  if (!expectedToken) {
    return NextResponse.json(
      { error: 'API authentication not configured' },
      { status: 500 }
    );
  }

  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authorization header required' },
      { status: 401 }
    );
  }

  // 支持 Bearer token 格式
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (token !== expectedToken) {
    return NextResponse.json(
      { error: 'Invalid authorization token' },
      { status: 401 }
    );
  }

  // 获取查询参数
  const { searchParams } = new URL(request.url);
  const issuer = searchParams.get('issuer');
  const account = searchParams.get('account');

  if (!issuer) {
    return NextResponse.json(
      { error: 'issuer parameter is required' },
      { status: 400 }
    );
  }

  // 查询账户
  const foundAccount = await AccountRepository.findByIssuerAndAccount(issuer, account || undefined);

  if (!foundAccount) {
    return NextResponse.json(
      { error: 'Account not found' },
      { status: 404 }
    );
  }

  // 生成 TOTP
  try {
    const code = generateTOTP(
      foundAccount.secret,
      foundAccount.issuer,
      foundAccount.account,
      foundAccount.period || DEFAULT_PERIOD
    );

    const now = Math.floor(Date.now() / 1000);
    const period = foundAccount.period || DEFAULT_PERIOD;
    const remaining = period - (now % period);

    return NextResponse.json({
      issuer: foundAccount.issuer,
      account: foundAccount.account,
      code,
      remaining,
      period,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate TOTP code' },
      { status: 500 }
    );
  }
}
