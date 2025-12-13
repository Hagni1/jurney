import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const stages = await query('SELECT s.id, s.enemyLvl, e.name as enemyName FROM stages s JOIN enemies e ON s.enemyId = e.id ORDER BY s.id') as any[];
    
    return NextResponse.json(stages);
  } catch (error) {
    console.error('Get stages error:', error);
    return NextResponse.json({ error: 'Failed to get stages' }, { status: 500 });
  }
}
