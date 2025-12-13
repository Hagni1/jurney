"use client";

import { useState, useEffect } from "react";
import type { CharacterWithStats, TrainingResponse } from "@/types";

interface TrainTabProps {
  character: CharacterWithStats | null;
  onUpdate: () => void;
}

export default function TrainTab({ character, onUpdate }: TrainTabProps) {
  const [selectedStat, setSelectedStat] = useState<
    "dexterity" | "intelligence" | "strength"
  >("strength");
  const [training, setTraining] = useState<TrainingResponse | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTraining();
  }, []);

  const fetchTraining = async () => {
    try {
      const response = await fetch("/api/training");
      const data = await response.json();
      setTraining(data);
    } catch {
      console.error("Failed to fetch training");
    }
  };

  const startTraining = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stat: selectedStat }),
      });

      await response.json();
      setMessage(`Started training ${selectedStat}`);
      await fetchTraining();
    } catch {
      setMessage("Failed to start training");
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/training", {
        method: "PUT",
      });

      const data = await response.json();

      if (data.gains > 0) {
        setMessage(`Claimed ${data.gains} ${data.stat} points!`);
      } else {
        setMessage("No rewards to claim yet");
      }

      await fetchTraining();
      onUpdate();
    } catch {
      setMessage("Failed to claim rewards");
    } finally {
      setLoading(false);
    }
  };

  const elapsedMinutes = training?.elapsedMinutes ?? 0;
  const cappedMinutes = training?.cappedMinutes ?? 0;
  const statGains = training?.statGains ?? 0;
  const maxAfkMinutes = character?.maxAfkTime || 10;

  const showProgress = elapsedMinutes >= 0 && cappedMinutes >= 0;

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Training</h2>

      <div className="bg-gray-700 p-4 rounded mb-6">
        <p className="text-gray-400 text-sm mb-2">Max AFK Time</p>
        <p className="text-xl font-bold">{maxAfkMinutes} minutes</p>
        <p className="text-gray-400 text-xs mt-1">
          Gain 1 stat point per 3 minutes
        </p>
      </div>

      {training?.training ? (
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-gray-400 text-sm">Currently Training</p>
            <p className="text-2xl font-bold capitalize">
              {training.training.stat}
            </p>
          </div>

          {showProgress && (
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm mb-2">Progress</p>
              <p className="text-lg">
                Elapsed: <span className="font-bold">{elapsedMinutes}</span>{" "}
                minutes
              </p>
              <p className="text-lg">
                Capped: <span className="font-bold">{cappedMinutes}</span> /{" "}
                {maxAfkMinutes} minutes
              </p>
              <p className="text-xl font-bold text-green-400 mt-2">
                Rewards Ready: +{statGains} {training.training.stat}
              </p>
            </div>
          )}

          <button
            onClick={claimRewards}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded"
          >
            {loading ? "Claiming..." : "Claim Rewards"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">
              Select Stat to Train
            </label>
            <select
              value={selectedStat}
              onChange={(e) =>
                setSelectedStat(
                  e.target.value as "dexterity" | "intelligence" | "strength"
                )
              }
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600"
              disabled={loading}
            >
              <option value="strength">Strength</option>
              <option value="dexterity">Dexterity</option>
              <option value="intelligence">Intelligence</option>
            </select>
          </div>

          <button
            onClick={startTraining}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded"
          >
            {loading ? "Starting..." : "Start Training"}
          </button>
        </div>
      )}

      {message && <div className="mt-4 p-4 rounded bg-blue-600">{message}</div>}

      <div className="mt-6 bg-gray-700 p-4 rounded">
        <h3 className="font-bold mb-2">Training Info</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Training continues while you&apos;re offline</li>
          <li>
            • Progress is capped at {maxAfkMinutes} minutes based on your level
          </li>
          <li>• Claim rewards to increase your stats</li>
          <li>• Switch stat to start training a different attribute</li>
        </ul>
      </div>
    </div>
  );
}
