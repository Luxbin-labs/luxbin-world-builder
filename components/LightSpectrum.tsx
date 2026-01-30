"use client";
import type { WorldData } from "@/lib/world-types";

interface Props {
  world: WorldData | null;
}

function wavelengthToCSS(wl: number): string {
  if (wl < 450) return `hsl(${270 - ((wl - 400) / 50) * 30}, 90%, 55%)`;
  if (wl < 490) return `hsl(${240 - ((wl - 450) / 40) * 60}, 90%, 55%)`;
  if (wl < 510) return `hsl(${180 - ((wl - 490) / 20) * 60}, 90%, 50%)`;
  if (wl < 580) return `hsl(${120 - ((wl - 510) / 70) * 60}, 90%, 50%)`;
  if (wl < 645) return `hsl(${60 - ((wl - 580) / 65) * 30}, 95%, 50%)`;
  return `hsl(${30 - ((wl - 645) / 55) * 30}, 100%, 50%)`;
}

export default function LightSpectrum({ world }: Props) {
  if (!world) return null;

  const sorted = [...world.objects].sort((a, b) => a.wavelength - b.wavelength);

  return (
    <div>
      <h3 className="text-xs font-mono text-luxbin-gold font-bold mb-2 uppercase tracking-wider">
        Photonic Spectrum
      </h3>
      {/* Spectrum bar */}
      <div className="h-3 rounded-full overflow-hidden flex mb-3">
        {sorted.map((obj) => (
          <div
            key={obj.id}
            className="h-full transition-all"
            style={{
              flex: obj.intensity,
              background: wavelengthToCSS(obj.wavelength),
            }}
            title={`${obj.name}: ${obj.wavelength}nm`}
          />
        ))}
      </div>
      {/* Object list */}
      <div className="space-y-1 max-h-[200px] overflow-y-auto">
        {sorted.map((obj) => (
          <div key={obj.id} className="flex items-center gap-2 text-xs font-mono">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: wavelengthToCSS(obj.wavelength), boxShadow: `0 0 6px ${wavelengthToCSS(obj.wavelength)}` }}
            />
            <span className="text-white/60 truncate flex-1">{obj.name}</span>
            <span className="text-white/30">{obj.wavelength}nm</span>
          </div>
        ))}
      </div>
    </div>
  );
}
