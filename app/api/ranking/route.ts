import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  calculateHP,
  calculateShield,
  calculateDamage,
  calculateAttackSpeed,
  calculateDodgeChance,
} from "@/lib/gameLogic";

export async function GET(_request: NextRequest) {
  try {
    const characters = (await query(
      "SELECT id, nickname, completedStage, dexterity, intelligence, strength, level, exp FROM characters ORDER BY completedStage DESC, level DESC, exp DESC LIMIT 100",
      []
    )) as any[];

    const rankings = characters.map((char, index) => ({
      rank: index + 1,
      nickname: char.nickname,
      level: char.level,
      completedStage: char.completedStage,
      dexterity: char.dexterity,
      intelligence: char.intelligence,
      strength: char.strength,
      hp: calculateHP(char.level, char.strength),
      shield: calculateShield(char.intelligence),
      damage: calculateDamage(char.level, char.strength),
      attackSpeed: calculateAttackSpeed(char.dexterity, 10),
      dodgeChance: calculateDodgeChance(char.dexterity),
    }));

    return NextResponse.json(rankings);
  } catch (error) {
    console.error("Get ranking error:", error);
    return NextResponse.json(
      { error: "Failed to get ranking" },
      { status: 500 }
    );
  }
}
