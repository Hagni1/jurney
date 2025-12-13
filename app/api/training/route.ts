import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const user = await getAuthUser() as any;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const characters = await query('SELECT level FROM characters WHERE id = ?', [user.characterId]) as any[];
    if (characters.length === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const training = await query('SELECT * FROM training WHERE characterId = ?', [user.characterId]) as any[];
    
    if (training.length === 0) {
      return NextResponse.json({ training: null });
    }

    const trainingData = training[0];
    const character = characters[0];
    const maxAfkMinutes = Math.max(10, character.level);
    
    const now = new Date();
    const lastClaim = new Date(trainingData.lastClaimTime);
    const elapsedMinutes = Math.floor((now.getTime() - lastClaim.getTime()) / (1000 * 60));
    const cappedMinutes = Math.min(elapsedMinutes, maxAfkMinutes);
    const statGains = Math.floor(cappedMinutes / 3);

    return NextResponse.json({
      training: trainingData,
      elapsedMinutes,
      cappedMinutes,
      statGains,
      maxAfkMinutes
    });
  } catch (error) {
    console.error('Get training error:', error);
    return NextResponse.json({ error: 'Failed to get training' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser() as any;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stat } = await request.json();

    if (!['dexterity', 'intelligence', 'strength'].includes(stat)) {
      return NextResponse.json({ error: 'Invalid stat' }, { status: 400 });
    }

    const now = new Date();

    await query(
      'INSERT INTO training (characterId, stat, startTime, lastClaimTime) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE stat = ?, startTime = ?, lastClaimTime = ?',
      [user.characterId, stat, now, now, stat, now, now]
    );

    return NextResponse.json({ message: 'Training started', stat });
  } catch (error) {
    console.error('Start training error:', error);
    return NextResponse.json({ error: 'Failed to start training' }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest) {
  try {
    const user = await getAuthUser() as any;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const characters = await query('SELECT level, dexterity, intelligence, strength FROM characters WHERE id = ?', [user.characterId]) as any[];
    if (characters.length === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const training = await query('SELECT * FROM training WHERE characterId = ?', [user.characterId]) as any[];
    
    if (training.length === 0) {
      return NextResponse.json({ error: 'No active training' }, { status: 400 });
    }

    const trainingData = training[0];
    const character = characters[0];
    const maxAfkMinutes = Math.max(10, character.level);
    
    const now = new Date();
    const lastClaim = new Date(trainingData.lastClaimTime);
    const elapsedMinutes = Math.floor((now.getTime() - lastClaim.getTime()) / (1000 * 60));
    const cappedMinutes = Math.min(elapsedMinutes, maxAfkMinutes);
    const statGains = Math.floor(cappedMinutes / 3);

    if (statGains > 0) {
      const newStatValue = character[trainingData.stat] + statGains;
      
      await query(
        `UPDATE characters SET ${trainingData.stat} = ? WHERE id = ?`,
        [newStatValue, user.characterId]
      );
    }

    await query(
      'DELETE FROM training WHERE characterId = ?',
      [user.characterId]
    );

    return NextResponse.json({
      message: 'Training rewards claimed',
      stat: trainingData.stat,
      gains: statGains
    });
  } catch (error) {
    console.error('Claim training error:', error);
    return NextResponse.json({ error: 'Failed to claim training' }, { status: 500 });
  }
}
