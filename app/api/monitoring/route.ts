import { NextResponse } from 'next/server';
import { getLogs, logger } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

export async function GET() {
  logger.info('monitoring api called', {
    at: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    logs: getLogs(),
  });
}