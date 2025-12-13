export interface CharacterStats {
  dexterity: number;
  intelligence: number;
  strength: number;
  level: number;
  exp: number;
}

export interface EntityStats extends CharacterStats {
  id: number;
  name?: string;
  baseSpeed?: number;
}

export function calculateHP(level: number, strength: number): number {
  return 100 + level * 10 + strength;
}

export function calculateShield(intelligence: number): number {
  return intelligence * 5;
}

export function calculateDamage(level: number, strength: number): number {
  return 10 + level + strength;
}

export function calculateAttackSpeed(
  dexterity: number,
  baseSpeed: number = 10
): number {
  return baseSpeed + dexterity;
}

export function calculateDodgeChance(dexterity: number): number {
  return Math.min(dexterity * 0.5, 60);
}

export function calculateExpToNextLevel(level: number): number {
  return 100 * level * level;
}

export function calculateStageExp(stage: number): number {
  return 50 * stage;
}

export interface TurnMeterEntity {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  damage: number;
  attackSpeed: number;
  dodgeChance: number;
  meter: number;
  isPlayer: boolean;
}

export interface CombatAction {
  attacker: string;
  defender: string;
  damage: number;
  dodged: boolean;
  hpBefore: number;
  hpAfter: number;
  shieldBefore: number;
  shieldAfter: number;
  attackerDamage: number;
}

export interface CombatResult {
  isWin: boolean;
  actions: CombatAction[];
  expGained: number;
  leveledUp: boolean;
  newLevel?: number;
  died: boolean;
  expLost: number;
  playerAttackSpeed: number;
  enemyAttackSpeed: number;
}

export function simulateCombat(
  player: EntityStats & { nickname: string },
  enemy: EntityStats & { name: string; baseSpeed: number },
  isFirstCompletion: boolean
): CombatResult {
  const playerMaxHp = calculateHP(player.level, player.strength);
  const playerMaxShield = calculateShield(player.intelligence);
  const playerDamage = calculateDamage(player.level, player.strength);
  const playerAttackSpeed = calculateAttackSpeed(player.dexterity, 10);
  const playerDodge = calculateDodgeChance(player.dexterity);

  const enemyMaxHp = calculateHP(enemy.level, enemy.strength);
  const enemyMaxShield = calculateShield(enemy.intelligence);
  const enemyDamage = calculateDamage(enemy.level, enemy.strength);
  const enemyAttackSpeed = calculateAttackSpeed(
    enemy.dexterity,
    enemy.baseSpeed
  );
  const enemyDodge = calculateDodgeChance(enemy.dexterity);

  const playerEntity: TurnMeterEntity = {
    id: player.id,
    name: player.nickname,
    hp: playerMaxHp,
    maxHp: playerMaxHp,
    shield: playerMaxShield,
    maxShield: playerMaxShield,
    damage: playerDamage,
    attackSpeed: playerAttackSpeed,
    dodgeChance: playerDodge,
    meter: 0,
    isPlayer: true,
  };

  const enemyEntity: TurnMeterEntity = {
    id: enemy.id,
    name: enemy.name,
    hp: enemyMaxHp,
    maxHp: enemyMaxHp,
    shield: enemyMaxShield,
    maxShield: enemyMaxShield,
    damage: enemyDamage,
    attackSpeed: enemyAttackSpeed,
    dodgeChance: enemyDodge,
    meter: 0,
    isPlayer: false,
  };

  const actions: CombatAction[] = [];
  const maxTurns = 1000;
  let turnCount = 0;

  while (playerEntity.hp > 0 && enemyEntity.hp > 0 && turnCount < maxTurns) {
    turnCount++;

    playerEntity.meter += playerEntity.attackSpeed;
    enemyEntity.meter += enemyEntity.attackSpeed;

    const attacker =
      playerEntity.meter >= 100 && playerEntity.meter >= enemyEntity.meter
        ? playerEntity
        : enemyEntity.meter >= 100
        ? enemyEntity
        : null;

    if (!attacker) continue;

    const defender = attacker.isPlayer ? enemyEntity : playerEntity;

    const dodged = Math.random() * 100 < defender.dodgeChance;
    const damage = dodged ? 0 : attacker.damage;

    const hpBefore = defender.hp;
    const shieldBefore = defender.shield;

    let remainingDamage = damage;
    if (defender.shield > 0) {
      const shieldDamage = Math.min(defender.shield, remainingDamage);
      defender.shield -= shieldDamage;
      remainingDamage -= shieldDamage;
    }

    if (remainingDamage > 0) {
      defender.hp -= remainingDamage;
    }

    const shieldAfter = defender.shield;
    const hpAfter = defender.hp;

    actions.push({
      attacker: attacker.name,
      defender: defender.name,
      damage,
      dodged,
      hpBefore,
      hpAfter,
      shieldBefore,
      shieldAfter,
      attackerDamage: attacker.damage,
    });

    attacker.meter = 0;

    if (defender.hp <= 0) {
      break;
    }
  }

  const isWin = playerEntity.hp > 0;
  let expGained = 0;
  let expLost = 0;
  const leveledUp = false;
  const newLevel = player.level;
  let died = false;

  if (isWin) {
    const baseExp = calculateStageExp(enemy.level);
    expGained = isFirstCompletion ? baseExp : Math.floor(baseExp * 0.2);
  } else {
    died = true;
    expLost = Math.floor(player.exp * 0.1);
  }

  return {
    isWin,
    actions,
    expGained,
    leveledUp,
    newLevel,
    died,
    expLost,
    playerAttackSpeed: playerEntity.attackSpeed,
    enemyAttackSpeed: enemyEntity.attackSpeed,
  };
}

export function processExpGain(
  currentExp: number,
  currentLevel: number,
  expGained: number
): { exp: number; level: number; leveledUp: boolean } {
  let exp = currentExp + expGained;
  let level = currentLevel;
  let leveledUp = false;

  while (exp >= calculateExpToNextLevel(level)) {
    exp -= calculateExpToNextLevel(level);
    level++;
    leveledUp = true;
  }

  return { exp, level, leveledUp };
}
