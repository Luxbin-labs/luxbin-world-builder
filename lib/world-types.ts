export interface WorldObject {
  id: string;
  name: string;
  type: "terrain" | "structure" | "creature" | "vegetation" | "celestial" | "effect";
  description: string;
  x: number;
  y: number;
  z: number;
  scale: number;
  color: string;
  wavelength: number; // nm (400-700)
  intensity: number; // 0-1
  animation?: "pulse" | "orbit" | "drift" | "shimmer" | "grow";
}

export interface WorldAtmosphere {
  baseColor: string;
  particles: string[];
  density: number;
  luminosity: number;
}

export interface WorldData {
  name: string;
  description: string;
  atmosphere: WorldAtmosphere;
  objects: WorldObject[];
  physics: {
    gravity: number;
    lightSpeed: number;
    quantumCoherence: number;
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
