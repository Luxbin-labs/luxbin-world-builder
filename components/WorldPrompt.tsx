"use client";
import { useState } from "react";

interface Props {
  onGenerate: (prompt: string) => void;
  loading: boolean;
}

const EXAMPLES = [
  "A quantum crystal forest where trees are made of entangled photons, with a diamond NV-center sun",
  "An underwater city lit by bioluminescent coral, where data flows as colored light streams",
  "A Mars colony using LUXBIN light-language beacons to communicate across the red desert",
  "A floating island made of pure light, orbited by quantum-entangled moons",
];

export default function WorldPrompt({ onGenerate, loading }: Props) {
  const [prompt, setPrompt] = useState("");

  const submit = () => {
    if (prompt.trim() && !loading) onGenerate(prompt.trim());
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Describe your photonic world..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-luxbin-orange/50 transition-colors"
          disabled={loading}
        />
        <button
          onClick={submit}
          disabled={loading || !prompt.trim()}
          className="px-6 py-3 bg-luxbin-orange hover:bg-luxbin-orange/80 disabled:opacity-30 rounded-lg font-mono text-sm font-bold text-white transition-all"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating
            </span>
          ) : (
            "Generate World"
          )}
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => { setPrompt(ex); onGenerate(ex); }}
            disabled={loading}
            className="text-xs px-3 py-1.5 bg-white/5 hover:bg-luxbin-purple/20 border border-white/10 rounded-full text-white/50 hover:text-white/80 font-mono transition-all disabled:opacity-30 truncate max-w-[240px]"
          >
            {ex.slice(0, 50)}...
          </button>
        ))}
      </div>
    </div>
  );
}
