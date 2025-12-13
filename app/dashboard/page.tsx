"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import JourneyTab from "@/components/JourneyTab";
import TrainTab from "@/components/TrainTab";
import CharacterTab from "@/components/CharacterTab";
import RankingTab from "@/components/RankingTab";
import type { CharacterWithStats } from "@/types";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "journey" | "train" | "character" | "ranking"
  >("journey");
  const [character, setCharacter] = useState<CharacterWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCharacter = async () => {
    try {
      const response = await fetch("/api/character");

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      setCharacter(data);
      setLoading(false);
    } catch {
      router.push("/login");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadCharacter = async () => {
      const response = await fetch("/api/character");

      if (!isMounted) return;

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      if (isMounted) {
        setCharacter(data);
        setLoading(false);
      }
    };

    loadCharacter().catch(() => {
      if (isMounted) {
        router.push("/login");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Journey Game</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{character?.nickname}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("journey")}
            className={`px-6 py-3 rounded font-semibold whitespace-nowrap ${
              activeTab === "journey"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Journey
          </button>
          <button
            onClick={() => setActiveTab("train")}
            className={`px-6 py-3 rounded font-semibold whitespace-nowrap ${
              activeTab === "train"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Train
          </button>
          <button
            onClick={() => setActiveTab("character")}
            className={`px-6 py-3 rounded font-semibold whitespace-nowrap ${
              activeTab === "character"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Character
          </button>
          <button
            onClick={() => setActiveTab("ranking")}
            className={`px-6 py-3 rounded font-semibold whitespace-nowrap ${
              activeTab === "ranking"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Ranking
          </button>
        </div>

        <div>
          {activeTab === "journey" && (
            <JourneyTab character={character} onUpdate={fetchCharacter} />
          )}
          {activeTab === "train" && (
            <TrainTab character={character} onUpdate={fetchCharacter} />
          )}
          {activeTab === "character" && <CharacterTab character={character} />}
          {activeTab === "ranking" && <RankingTab />}
        </div>
      </div>
    </div>
  );
}
