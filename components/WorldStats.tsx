"use client";
import type { WorldData } from "@/lib/world-types";

interface Props {
  world: WorldData | null;
}

export default function WorldStats({ world }: Props) {
  if (!world) return null;

  const avgWavelength = Math.round(
    world.objects.reduce((s, o) => s + o.wavelength, 0) / world.objects.length
  );
  const totalIntensity = world.objects.reduce((s, o) => s + o.intensity, 0).toFixed(1);
  const types = new Set(world.objects.map((o) => o.type));

  return (
    <div>
      <h3 className="text-xs font-mono text-luxbin-gold font-bold mb-2 uppercase tracking-wider">
        World Data
      </h3>
      <p className="text-white/60 text-xs font-mono mb-3">{world.description}</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Objects", value: world.objects.length },
          { label: "Types", value: types.size },
          { label: "Avg λ", value: `${avgWavelength}nm` },
          { label: "Luminosity", value: `${(world.atmosphere.luminosity * 100).toFixed(0)}%` },
          { label: "Total E", value: totalIntensity },
          { label: "Gravity", value: `${world.physics.gravity}g` },
          { label: "Light Speed", value: `${world.physics.lightSpeed}c` },
          { label: "Q-Coherence", value: `${(world.physics.quantumCoherence * 100).toFixed(0)}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 rounded-lg p-2">
            <div className="text-white/30 text-[10px] font-mono uppercase">{s.label}</div>
            <div className="text-white text-sm font-mono font-bold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
