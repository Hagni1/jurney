import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { simulateCombat, processExpGain } from '@/lib/gameLogic';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser() as any;
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stage } = await request.json();

    if (!stage || stage < 1) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    const characters = await query('SELECT * FROM characters WHERE id = ?', [user.characterId]) as any[];
    if (characters.length === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    const character = characters[0];

    const stages = await query('SELECT * FROM stages WHERE id = ?', [stage]) as any[];
    if (stages.length === 0) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }
    const stageData = stages[0];

    const enemies = await query('SELECT * FROM enemies WHERE id = ?', [stageData.enemyId]) as any[];
    if (enemies.length === 0) {
      return NextResponse.json({ error: 'Enemy not found' }, { status: 404 });
    }
    const enemyBase = enemies[0];

    const enemy = {
      id: enemyBase.id,
      name: enemyBase.name,
      level: stageData.enemyLvl,
      dexterity: enemyBase.dexterityPerLvl * stageData.enemyLvl,
      intelligence: enemyBase.intelligencePerLvl * stageData.enemyLvl,
      strength: enemyBase.strengthPerLvl * stageData.enemyLvl,
      baseSpeed: enemyBase.baseSpeed,
      exp: 0
    };

    const completions = await query(
      'SELECT completions FROM stageCompletions WHERE characterId = ? AND stage = ?',
      [user.characterId, stage]
    ) as any[];
    
    const isFirstCompletion = completions.length === 0 || completions[0].completions === 0;

    const combatResult = simulateCombat(character, enemy, isFirstCompletion);

    const combatInsert = await query(
      'INSERT INTO combats (stage, characterId, enemyId, enemyLvl, isWin) VALUES (?, ?, ?, ?, ?)',
      [stage, user.characterId, enemy.id, enemy.level, combatResult.isWin]
    ) as any;
    const combatId = combatInsert.insertId;

    for (const action of combatResult.actions) {
      const isPlayerAttacker = action.attacker === character.nickname;
      
      await query(
        'INSERT INTO combatLog (combatId, characterId, enemyId, attacker, damage, hpBefore, hpAfter, shieldBefore, shieldAfter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [combatId, isPlayerAttacker ? user.characterId : null, isPlayerAttacker ? null : enemy.id, action.attacker, action.damage, action.hpBefore, action.hpAfter, action.shieldBefore, action.shieldAfter]
      );
    }

    let newExp = character.exp;
    let newLevel = character.level;
    let newStr = character.strength;
    let newDex = character.dexterity;
    let newInt = character.intelligence;

    if (combatResult.isWin) {
      const expResult = processExpGain(character.exp, character.level, combatResult.expGained);
      newExp = expResult.exp;
      newLevel = expResult.level;
      combatResult.leveledUp = expResult.leveledUp;
      combatResult.newLevel = newLevel;

      if (expResult.leveledUp) {
        const levelsGained = newLevel - character.level;
        newStr = character.strength + levelsGained;
        newDex = character.dexterity + levelsGained;
        newInt = character.intelligence + levelsGained;
      }

      await query(
        'INSERT INTO stageCompletions (characterId, stage, completions) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE completions = completions + 1',
        [user.characterId, stage]
      );

      if (stage > character.completedStage) {
        await query('UPDATE characters SET completedStage = ? WHERE id = ?', [stage, user.characterId]);
      }
    } else {
      newExp = Math.max(0, character.exp - combatResult.expLost);
    }

    await query(
      'UPDATE characters SET exp = ?, level = ?, strength = ?, dexterity = ?, intelligence = ? WHERE id = ?',
      [newExp, newLevel, newStr, newDex, newInt, user.characterId]
    );

    return NextResponse.json({
      ...combatResult,
      combatId,
      newExp,
      newLevel,
      playerStats: {
        strength: character.strength,
        dexterity: character.dexterity,
        intelligence: character.intelligence
      },
      enemyStats: {
        strength: enemy.strength,
        dexterity: enemy.dexterity,
        intelligence: enemy.intelligence
      }
    });
  } catch (error) {
    console.error('Combat error:', error);
    return NextResponse.json({ error: 'Combat failed' }, { status: 500 });
  }
}
