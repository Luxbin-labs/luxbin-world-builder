"use client";
import { useState, useCallback } from "react";
import type { WorldData, WorldObject } from "@/lib/world-types";
import WorldCanvas from "@/components/WorldCanvas";
import WorldPrompt from "@/components/WorldPrompt";
import ChatExplorer from "@/components/ChatExplorer";
import LightSpectrum from "@/components/LightSpectrum";
import WorldStats from "@/components/WorldStats";
import { encodeText } from "@/lib/luxbin-encoder";

export default function Home() {
  const [world, setWorld] = useState<WorldData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lightShow, setLightShow] = useState<ReturnType<typeof encodeText>>([]);

  const generate = useCallback(async (prompt: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWorld(data);
      setLightShow(encodeText(data.name));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWorldUpdate = useCallback((newObjects: unknown[]) => {
    setWorld((prev) => {
      if (!prev) return prev;
      return { ...prev, objects: [...prev.objects, ...(newObjects as WorldObject[])] };
    });
  }, []);

  return (
    <div className="h-screen flex flex-col p-4 gap-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-luxbin-orange to-luxbin-purple flex items-center justify-center text-xs font-bold">
            L
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-wider">LUXBIN PHOTONIC WORLD BUILDER</h1>
            <p className="text-white/30 text-[10px] font-mono">Powered by Gemini 3 Flash + LUXBIN Light Language</p>
          </div>
        </div>
        {lightShow.length > 0 && (
          <div className="flex gap-0.5">
            {lightShow.slice(0, 20).map((c, i) => (
              <div
                key={i}
                className="w-2 h-6 rounded-sm animate-pulse"
                style={{
                  background: c.hexColor,
                  animationDelay: `${i * 100}ms`,
                  boxShadow: `0 0 4px ${c.hexColor}`,
                }}
                title={`${c.char}: ${c.wavelength}nm`}
              />
            ))}
          </div>
        )}
      </header>

      {/* Prompt */}
      <WorldPrompt onGenerate={generate} loading={loading} />

      {error && (
        <div className="text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <WorldCanvas world={world} />
        </div>

        {/* Sidebar */}
        <div className="w-[300px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <WorldStats world={world} />
          </div>
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <LightSpectrum world={world} />
          </div>
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-4 flex-1 min-h-[200px] flex flex-col">
            <ChatExplorer world={world} onWorldUpdate={handleWorldUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}
