// LUXBIN Light Language Encoder
// Encodes text into photonic wavelengths (400-700nm visible spectrum)
// Based on the 77-character LUXBIN photonic alphabet

const LUXBIN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?-:;'\"@#$%";
const WAVELENGTH_MIN = 400; // nm (violet)
const WAVELENGTH_MAX = 700; // nm (red)

export interface PhotonicChar {
  char: string;
  wavelength: number;
  hue: number;
  saturation: number;
  lightness: number;
  hexColor: string;
}

export function wavelengthToHSL(wavelength: number): { h: number; s: number; l: number } {
  // Map wavelength to hue (inverted: violet=270, blue=240, green=120, yellow=60, red=0)
  const normalized = (wavelength - WAVELENGTH_MIN) / (WAVELENGTH_MAX - WAVELENGTH_MIN);
  const h = 270 - normalized * 270; // violet to red
  const s = 90 + Math.sin(normalized * Math.PI) * 10; // 90-100%
  const l = 50 + Math.sin(normalized * Math.PI) * 15; // 50-65%
  return { h, s, l };
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function encodeChar(char: string): PhotonicChar {
  const index = LUXBIN_ALPHABET.indexOf(char);
  const safeIndex = index >= 0 ? index : 0;
  const wavelength = WAVELENGTH_MIN + (safeIndex / (LUXBIN_ALPHABET.length - 1)) * (WAVELENGTH_MAX - WAVELENGTH_MIN);
  const { h, s, l } = wavelengthToHSL(wavelength);
  return {
    char,
    wavelength: Math.round(wavelength),
    hue: Math.round(h),
    saturation: Math.round(s),
    lightness: Math.round(l),
    hexColor: hslToHex(h, s, l),
  };
}

export function encodeText(text: string): PhotonicChar[] {
  return text.split("").map(encodeChar);
}

export function getSpectrumGradient(text: string): string {
  const chars = encodeText(text);
  if (chars.length === 0) return "linear-gradient(90deg, #7C3AED, #FF6B35)";
  const stops = chars.map((c, i) => `${c.hexColor} ${(i / (chars.length - 1)) * 100}%`);
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}
