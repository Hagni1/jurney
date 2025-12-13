import type { CharacterWithStats } from "@/types";

interface CharacterTabProps {
  character: CharacterWithStats | null;
}

export default function CharacterTab({ character }: CharacterTabProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Character Stats</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Nickname</p>
          <p className="text-xl font-bold">{character?.nickname}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Level</p>
          <p className="text-xl font-bold">{character?.level}</p>
          <p className="text-xs text-gray-500 mt-1">
            every level grants: +10 HP, +1 Damage, +1 Max AFK Time, +1 all
            attributes
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Experience</span>
          <span>
            {character?.exp} / {character?.expToNextLevel}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full"
            style={{
              width: `${Math.min(
                ((character?.exp ?? 0) / (character?.expToNextLevel ?? 1)) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Strength</p>
          <p className="text-2xl font-bold text-red-400">
            {character?.strength}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            every point grants: +1 HP, +1 Damage
          </p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Dexterity</p>
          <p className="text-2xl font-bold text-green-400">
            {character?.dexterity}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            every point grants: +1 Attack Speed, +0.5% Dodge (max 60%)
          </p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Intelligence</p>
          <p className="text-2xl font-bold text-blue-400">
            {character?.intelligence}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            every point grants: +5 Shield
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">HP</p>
          <p className="text-xl font-bold">{character?.hp}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Shield</p>
          <p className="text-xl font-bold">{character?.shield}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Damage</p>
          <p className="text-xl font-bold">{character?.damage}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Attack Speed</p>
          <p className="text-xl font-bold">{character?.attackSpeed}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Dodge Chance</p>
          <p className="text-xl font-bold">
            {character?.dodgeChance?.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Max AFK Time</p>
          <p className="text-xl font-bold">{character?.maxAfkTime} min</p>
        </div>
      </div>
    </div>
  );
}
