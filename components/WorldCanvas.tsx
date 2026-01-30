"use client";
import { useRef, useEffect, useCallback } from "react";
import type { WorldData, WorldObject } from "@/lib/world-types";

interface Props {
  world: WorldData | null;
}

function wavelengthToRGB(wl: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (wl >= 400 && wl < 450) {
    r = -(wl - 450) / 50; b = 1;
  } else if (wl >= 450 && wl < 490) {
    g = (wl - 450) / 40; b = 1;
  } else if (wl >= 490 && wl < 510) {
    g = 1; b = -(wl - 510) / 20;
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / 70; g = 1;
  } else if (wl >= 580 && wl < 645) {
    r = 1; g = -(wl - 645) / 65;
  } else if (wl >= 645 && wl <= 700) {
    r = 1;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export default function WorldCanvas({ world }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const timeRef = useRef(0);

  const drawObject = useCallback((ctx: CanvasRenderingContext2D, obj: WorldObject, w: number, h: number, t: number) => {
    const cx = ((obj.x + 1) / 2) * w;
    const cy = ((obj.y + 1) / 2) * h;
    const size = obj.scale * 40 * (1 + obj.z * 0.5);
    const [r, g, b] = wavelengthToRGB(obj.wavelength);

    let dx = 0, dy = 0, scale = 1, alpha = obj.intensity;

    switch (obj.animation) {
      case "pulse":
        scale = 1 + 0.2 * Math.sin(t * 2);
        alpha = obj.intensity * (0.7 + 0.3 * Math.sin(t * 2));
        break;
      case "orbit":
        dx = Math.cos(t) * 30;
        dy = Math.sin(t) * 15;
        break;
      case "drift":
        dx = Math.sin(t * 0.5) * 20;
        dy = Math.cos(t * 0.3) * 10;
        break;
      case "shimmer":
        alpha = obj.intensity * (0.5 + 0.5 * Math.sin(t * 5 + obj.wavelength));
        break;
      case "grow":
        scale = 0.5 + 0.5 * (1 + Math.sin(t * 0.5));
        break;
    }

    const x = cx + dx;
    const y = cy + dy;
    const s = size * scale;

    // Glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, s * 2.5);
    glow.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.6})`);
    glow.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.15})`);
    glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(x - s * 2.5, y - s * 2.5, s * 5, s * 5);

    // Core shape based on type
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.beginPath();
    switch (obj.type) {
      case "terrain":
        // Triangle mountain
        ctx.moveTo(x - s, y + s * 0.6);
        ctx.lineTo(x, y - s * 0.8);
        ctx.lineTo(x + s, y + s * 0.6);
        break;
      case "structure":
        // Diamond
        ctx.moveTo(x, y - s);
        ctx.lineTo(x + s * 0.7, y);
        ctx.lineTo(x, y + s);
        ctx.lineTo(x - s * 0.7, y);
        break;
      case "creature":
        // Organic blob
        ctx.ellipse(x, y, s * 0.8, s * 0.5, Math.sin(t) * 0.2, 0, Math.PI * 2);
        break;
      case "celestial":
        // Circle with rays
        ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.4})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + t * 0.5;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * s * 0.8, y + Math.sin(angle) * s * 0.8);
          ctx.lineTo(x + Math.cos(angle) * s * 1.5, y + Math.sin(angle) * s * 1.5);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
        break;
      case "vegetation":
        // Organic circle cluster
        for (let i = 0; i < 3; i++) {
          const ox = Math.cos((i / 3) * Math.PI * 2) * s * 0.3;
          const oy = Math.sin((i / 3) * Math.PI * 2) * s * 0.3 - s * 0.2;
          ctx.moveTo(x + ox + s * 0.4, y + oy);
          ctx.arc(x + ox, y + oy, s * 0.4, 0, Math.PI * 2);
        }
        break;
      default:
        ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(obj.name, x, y + s + 16);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.5})`;
    ctx.font = "9px monospace";
    ctx.fillText(`${obj.wavelength}nm`, x, y + s + 28);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !world) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Background
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
      bg.addColorStop(0, world.atmosphere.baseColor + "33");
      bg.addColorStop(1, "#0f0f23");
      ctx.fillStyle = "#0f0f23";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Ambient particles
      for (let i = 0; i < 40; i++) {
        const px = (Math.sin(t * 0.2 + i * 73.7) * 0.5 + 0.5) * w;
        const py = (Math.cos(t * 0.15 + i * 47.3) * 0.5 + 0.5) * h;
        const pa = 0.1 + 0.1 * Math.sin(t + i);
        ctx.fillStyle = `rgba(255,255,255,${pa * world.atmosphere.density})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sort by z for depth
      const sorted = [...world.objects].sort((a, b) => a.z - b.z);
      sorted.forEach((obj) => drawObject(ctx, obj, w, h, t));

      // World name
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`LUXBIN WORLD: ${world.name.toUpperCase()}`, 16, 24);

      frameRef.current = requestAnimationFrame(animate);
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [world, drawObject]);

  if (!world) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-luxbin-bg rounded-xl border border-white/10">
        <p className="text-white/30 font-mono text-sm">Describe a world to generate...</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl"
      style={{ background: "#0f0f23" }}
    />
  );
}
