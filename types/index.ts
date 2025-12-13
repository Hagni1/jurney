export interface User {
  userId: number;
  characterId: number;
}

export interface Character {
  id: number;
  nickname: string;
  completedStage: number;
  dexterity: number;
  intelligence: number;
  strength: number;
  level: number;
  exp: number;
}

export interface CharacterWithStats extends Character {
  hp: number;
  shield: number;
  damage: number;
  attackSpeed: number;
  dodgeChance: number;
  expToNextLevel: number;
  maxAfkTime: number;
}

export interface Stage {
  id: number;
  enemyId: number;
  enemyLvl: number;
  enemyName?: string;
}

export interface Enemy {
  id: number;
  name: string;
  dexterityPerLvl: number;
  intelligencePerLvl: number;
  strengthPerLvl: number;
  baseSpeed: number;
}

export interface Training {
  id: number;
  characterId: number;
  stat: 'dexterity' | 'intelligence' | 'strength';
  startTime: Date;
  lastClaimTime: Date;
}

export interface TrainingResponse {
  training: Training | null;
  elapsedMinutes?: number;
  cappedMinutes?: number;
  statGains?: number;
  maxAfkMinutes?: number;
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
}

export interface CombatResult {
  isWin: boolean;
  actions: CombatAction[];
  expGained: number;
  leveledUp: boolean;
  newLevel?: number;
  died: boolean;
  expLost: number;
  combatId?: number;
  newExp?: number;
}
