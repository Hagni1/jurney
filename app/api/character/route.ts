import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { calculateHP, calculateShield, calculateDamage, calculateAttackSpeed, calculateExpToNextLevel, calculateDodgeChance } from '@/lib/gameLogic';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser() as any;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const characters = await query('SELECT * FROM characters WHERE id = ?', [user.characterId]) as any[];
    
    if (characters.length === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const character = characters[0];
    
    const stats = {
      ...character,
      hp: calculateHP(character.level, character.strength),
      shield: calculateShield(character.intelligence),
      damage: calculateDamage(character.level, character.strength),
      attackSpeed: calculateAttackSpeed(character.dexterity, 10),
      dodgeChance: calculateDodgeChance(character.dexterity),
      expToNextLevel: calculateExpToNextLevel(character.level),
      maxAfkTime: 10 + character.level
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get character error:', error);
    return NextResponse.json({ error: 'Failed to get character' }, { status: 500 });
  }
}
