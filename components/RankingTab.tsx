"use client";

import { useState, useEffect } from "react";

interface RankingPlayer {
  rank: number;
  nickname: string;
  level: number;
  completedStage: number;
  dexterity: number;
  intelligence: number;
  strength: number;
  hp: number;
  shield: number;
  damage: number;
  attackSpeed: number;
  dodgeChance: number;
}

export default function RankingTab() {
  const [rankings, setRankings] = useState<RankingPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ranking");
      const data = await response.json();
      setRankings(data);
    } catch (error) {
      console.error("Failed to fetch rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Player Rankings</h2>

      {loading ? (
        <div className="text-center text-gray-400 py-8">
          Loading rankings...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-2">Rank</th>
                <th className="text-left py-3 px-2">Nickname</th>
                <th className="text-center py-3 px-2">Level</th>
                <th className="text-center py-3 px-2">Stage</th>
                <th className="text-center py-3 px-2">STR</th>
                <th className="text-center py-3 px-2">DEX</th>
                <th className="text-center py-3 px-2">INT</th>
                <th className="text-center py-3 px-2">HP</th>
                <th className="text-center py-3 px-2">Shield</th>
                <th className="text-center py-3 px-2">DMG</th>
                <th className="text-center py-3 px-2">Speed</th>
                <th className="text-center py-3 px-2">Dodge%</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((player) => (
                <tr
                  key={player.rank}
                  className="border-b border-gray-700 hover:bg-gray-750"
                >
                  <td className="py-3 px-2">
                    <span
                      className={`font-bold ${
                        player.rank === 1
                          ? "text-yellow-400"
                          : player.rank === 2
                          ? "text-gray-300"
                          : player.rank === 3
                          ? "text-orange-400"
                          : "text-white"
                      }`}
                    >
                      #{player.rank}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-semibold">{player.nickname}</td>
                  <td className="py-3 px-2 text-center">{player.level}</td>
                  <td className="py-3 px-2 text-center font-bold text-blue-400">
                    {player.completedStage}
                  </td>
                  <td className="py-3 px-2 text-center text-red-400">
                    {player.strength}
                  </td>
                  <td className="py-3 px-2 text-center text-green-400">
                    {player.dexterity}
                  </td>
                  <td className="py-3 px-2 text-center text-blue-400">
                    {player.intelligence}
                  </td>
                  <td className="py-3 px-2 text-center">{player.hp}</td>
                  <td className="py-3 px-2 text-center">{player.shield}</td>
                  <td className="py-3 px-2 text-center">{player.damage}</td>
                  <td className="py-3 px-2 text-center">
                    {player.attackSpeed}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {player.dodgeChance.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
