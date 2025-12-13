"use client";

import { useState, useEffect } from "react";
import type { CharacterWithStats, Stage, CombatAction } from "@/types";

interface JourneyTabProps {
  character: CharacterWithStats | null;
  onUpdate: () => void;
}

export default function JourneyTab({ character, onUpdate }: JourneyTabProps) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [combat, setCombat] = useState<any>(null);
  const [fighting, setFighting] = useState(false);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [message, setMessage] = useState("");

  const fetchStages = async () => {
    const response = await fetch("/api/stages");
    const data = await response.json();
    setStages(data);
  };

  useEffect(() => {
    (async () => {
      await fetchStages();
    })();
  }, []);

  const availableStages = stages
    .filter((stage) => stage.id <= (character?.completedStage || 0) + 1)
    .sort((a, b) => b.id - a.id);

  const startCombat = async () => {
    if (!selectedStage) return;

    setFighting(true);
    setMessage("");
    setCombat(null);
    setCurrentActionIndex(0);

    try {
      const response = await fetch("/api/combat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: selectedStage }),
      });

      const data = await response.json();
      setCombat(data);
      onUpdate();
    } catch {
      setMessage("Combat failed");
      setFighting(false);
    }
  };

  useEffect(() => {
    if (combat && currentActionIndex < combat.actions.length) {
      const timer = setTimeout(() => {
        setCurrentActionIndex((prev) => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [combat, currentActionIndex]);

  useEffect(() => {
    if (
      combat &&
      currentActionIndex === combat.actions.length &&
      currentActionIndex > 0
    ) {
      const timer = setTimeout(() => {
        setFighting(false);
        if (combat.isWin) {
          const expToNext = character ? character.expToNextLevel : 0;
          setMessage(
            `Victory! Gained ${combat.expGained} EXP (${
              combat.newExp || 0
            }/${expToNext} to next level)${
              combat.leveledUp ? ` - Level Up to ${combat.newLevel}!` : ""
            }`
          );
        } else {
          setMessage(`Defeat! Lost ${combat.expLost} EXP`);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [combat, currentActionIndex, character]);
  const displayedActions = combat?.actions?.slice(0, currentActionIndex) || [];
  const reversedActions = [...displayedActions].reverse();

  const getCurrentStats = () => {
    if (!combat || displayedActions.length === 0 || !character) return null;

    // Get player name from character, not from first action
    const playerName = character.nickname;
    const firstAction = combat.actions[0];
    const enemyName =
      firstAction.attacker === playerName
        ? firstAction.defender
        : firstAction.attacker;

    // Initialize with starting values from first time each appears as defender
    console.log(combat.actions);
    const playerFirstDefense = combat.actions.find(
      (a: CombatAction) => a.defender === playerName
    );
    const enemyFirstDefense = combat.actions.find(
      (a: CombatAction) => a.defender === enemyName
    );
    // If player never got attacked, use their max HP from character stats
    const playerMaxHP = 100 + character.level * 10 + character.strength;
    const playerMaxShield = character.intelligence * 5;
    let playerHP = playerFirstDefense?.hpBefore || playerMaxHP;
    let playerShield = playerFirstDefense?.shieldBefore || playerMaxShield;
    let enemyHP = enemyFirstDefense?.hpBefore || 0;
    let enemyShield = enemyFirstDefense?.shieldBefore || 0;

    let playerHPChange = 0;
    let playerShieldChange = 0;
    let enemyHPChange = 0;
    let enemyShieldChange = 0;

    // Update with latest values from displayed actions
    for (const action of displayedActions) {
      if (action.defender === playerName) {
        playerHP = action.hpAfter;
        playerShield = action.shieldAfter;
      } else if (action.defender === enemyName) {
        enemyHP = action.hpAfter;
        enemyShield = action.shieldAfter;
      }
    }

    // Get changes from the most recent action only
    if (displayedActions.length > 0) {
      const lastAction = displayedActions[displayedActions.length - 1];
      if (lastAction.defender === playerName) {
        playerHPChange = lastAction.hpAfter - lastAction.hpBefore;
        playerShieldChange = lastAction.shieldAfter - lastAction.shieldBefore;
      } else if (lastAction.defender === enemyName) {
        enemyHPChange = lastAction.hpAfter - lastAction.hpBefore;
        enemyShieldChange = lastAction.shieldAfter - lastAction.shieldBefore;
      }
    }

    return {
      player: {
        hp: playerHP,
        shield: playerShield,
        hpChange: playerHPChange,
        shieldChange: playerShieldChange,
      },
      enemy: {
        hp: enemyHP,
        shield: enemyShield,
        hpChange: enemyHPChange,
        shieldChange: enemyShieldChange,
      },
    };
  };

  const currentStats = getCurrentStats();

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Journey</h2>

      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Select Stage</label>
        <select
          value={selectedStage || ""}
          onChange={(e) => setSelectedStage(Number(e.target.value))}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
          disabled={fighting}
        >
          <option value="">Choose a stage</option>
          {availableStages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              Stage {stage.id}
              {stage.id % 10 === 0 ? " [BOSS]" : ""} - {stage.enemyName} (Level{" "}
              {stage.enemyLvl})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={startCombat}
        disabled={!selectedStage || fighting}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded mb-6"
      >
        {fighting ? "Fighting..." : "Start Combat"}
      </button>

      {message && (
        <div
          className={`p-4 rounded mb-6 ${
            combat?.isWin ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {combat && (
        <div className="space-y-4">
          {currentStats && displayedActions.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-bold mb-2 text-green-400">Player</h4>
                <p className="text-sm">
                  HP:{" "}
                  <span className="font-bold">{currentStats.player.hp}</span>
                  {currentStats.player.hpChange !== 0 && (
                    <span
                      className={
                        currentStats.player.hpChange > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {" "}
                      ({currentStats.player.hpChange > 0 ? "+" : ""}
                      {currentStats.player.hpChange})
                    </span>
                  )}
                </p>
                <p className="text-sm">
                  Shield:{" "}
                  <span className="font-bold text-blue-400">
                    {currentStats.player.shield}
                  </span>
                  {currentStats.player.shieldChange !== 0 && (
                    <span
                      className={
                        currentStats.player.shieldChange > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {" "}
                      ({currentStats.player.shieldChange > 0 ? "+" : ""}
                      {currentStats.player.shieldChange})
                    </span>
                  )}
                </p>
                <p className="text-sm">
                  Attack Speed:{" "}
                  <span className="font-bold text-yellow-400">
                    {combat.playerAttackSpeed}
                  </span>
                </p>
                {combat.playerStats && (
                  <p className="text-xs text-gray-400 mt-2">
                    Stats: (
                    <span className="text-red-400">
                      {combat.playerStats.strength}
                    </span>
                    ,{" "}
                    <span className="text-green-400">
                      {combat.playerStats.dexterity}
                    </span>
                    ,{" "}
                    <span className="text-blue-400">
                      {combat.playerStats.intelligence}
                    </span>
                    )
                  </p>
                )}
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-bold mb-2 text-red-400">Enemy</h4>
                <p className="text-sm">
                  HP: <span className="font-bold">{currentStats.enemy.hp}</span>
                  {currentStats.enemy.hpChange !== 0 && (
                    <span
                      className={
                        currentStats.enemy.hpChange > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {" "}
                      ({currentStats.enemy.hpChange > 0 ? "+" : ""}
                      {currentStats.enemy.hpChange})
                    </span>
                  )}
                </p>
                <p className="text-sm">
                  Shield:{" "}
                  <span className="font-bold text-blue-400">
                    {currentStats.enemy.shield}
                  </span>
                  {currentStats.enemy.shieldChange !== 0 && (
                    <span
                      className={
                        currentStats.enemy.shieldChange > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {" "}
                      ({currentStats.enemy.shieldChange > 0 ? "+" : ""}
                      {currentStats.enemy.shieldChange})
                    </span>
                  )}
                </p>
                <p className="text-sm">
                  Attack Speed:{" "}
                  <span className="font-bold text-yellow-400">
                    {combat.enemyAttackSpeed}
                  </span>
                </p>
                {combat.enemyStats && (
                  <p className="text-xs text-gray-400 mt-2">
                    Stats: (
                    <span className="text-red-400">
                      {combat.enemyStats.strength}
                    </span>
                    ,{" "}
                    <span className="text-green-400">
                      {combat.enemyStats.dexterity}
                    </span>
                    ,{" "}
                    <span className="text-blue-400">
                      {combat.enemyStats.intelligence}
                    </span>
                    )
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-bold mb-4">Combat Log</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {reversedActions.map((action: CombatAction, index: number) => (
                <div
                  key={displayedActions.length - 1 - index}
                  className="bg-gray-600 p-3 rounded text-sm"
                >
                  <p className="font-semibold">
                    {action.attacker} → {action.defender}
                  </p>
                  {action.dodged ? (
                    <p className="text-yellow-400">DODGED!</p>
                  ) : (
                    <>
                      <p className="text-red-400">
                        Damage Dealt: {action.damage}
                      </p>
                      {action.shieldBefore > 0 && (
                        <p className="text-blue-400">
                          Shield: {action.shieldBefore} → {action.shieldAfter}
                          {action.hpBefore === action.hpAfter && " (absorbed)"}
                        </p>
                      )}
                      {action.hpBefore !== action.hpAfter && (
                        <p className="text-green-400">
                          HP: {action.hpBefore} → {action.hpAfter}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
