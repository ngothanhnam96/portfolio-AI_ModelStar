/** Fabric colours and colour-harmony maths. Pure, no DOM. */

/**
 * `hue` in degrees; neutrals have no hue and go with everything.
 * `pastel` and `metal` are used by show palettes and tips.
 */
export const COLORS = [
  { id: "white", name: "Trắng", hex: "#f7f4ee", neutral: true },
  { id: "black", name: "Đen", hex: "#2d2b36", neutral: true },
  { id: "gray", name: "Xám", hex: "#a2a1ab", neutral: true },
  { id: "beige", name: "Be", hex: "#e6d2b0", neutral: true },
  { id: "brown", name: "Nâu", hex: "#8b5a3c", neutral: true },
  { id: "red", name: "Đỏ", hex: "#e03a4b", hue: 355 },
  { id: "pink", name: "Hồng", hex: "#f491b4", hue: 338, pastel: true },
  { id: "orange", name: "Cam", hex: "#f2913f", hue: 28 },
  { id: "yellow", name: "Vàng", hex: "#f5cf45", hue: 48 },
  { id: "mint", name: "Bạc hà", hex: "#98e0c6", hue: 158, pastel: true },
  { id: "green", name: "Xanh lá", hex: "#4aa868", hue: 140 },
  { id: "sky", name: "Xanh trời", hex: "#8cc8f0", hue: 205, pastel: true },
  { id: "blue", name: "Xanh dương", hex: "#3f6ed6", hue: 222 },
  { id: "navy", name: "Xanh than", hex: "#2c3d73", hue: 226 },
  { id: "purple", name: "Tím", hex: "#8a55c8", hue: 272 },
  { id: "lilac", name: "Tím pastel", hex: "#cbb5ee", hue: 262, pastel: true },
  { id: "gold", name: "Vàng kim", hex: "#d6ab48", hue: 44, metal: true },
];

const BY_ID = new Map(COLORS.map((color) => [color.id, color]));

export function colorById(id) {
  const color = BY_ID.get(id);
  if (!color) throw new Error(`Unknown colour "${id}"`);
  return color;
}

/** Smallest angle between two hues, 0–180. */
export function hueDistance(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * How well a set of fabric colours goes together, 0–1.
 * Neutrals are free. One colour (monochrome) or neighbours on the wheel are best,
 * opposites are bold but fine, three unrelated colours start to clash, four or more clash.
 */
export function harmony(colorIds) {
  const hues = [...new Set(colorIds)].map(colorById).filter((c) => !c.neutral).map((c) => c.hue);
  if (hues.length <= 1) return 1;
  let widest = 0;
  for (let i = 0; i < hues.length; i += 1) {
    for (let j = i + 1; j < hues.length; j += 1) widest = Math.max(widest, hueDistance(hues[i], hues[j]));
  }
  if (hues.length === 2) {
    if (widest <= 50) return 1; // analogous
    if (widest >= 150) return 0.9; // complementary
    return 0.7;
  }
  if (hues.length === 3) return widest <= 70 ? 0.9 : 0.55;
  return widest <= 70 ? 0.7 : 0.35;
}

/** Darken (amount < 0) or lighten (amount > 0) a #rrggbb colour. */
export function shade(hex, amount) {
  const n = Number.parseInt(hex.slice(1), 16);
  const channel = (shift) => {
    const v = (n >> shift) & 255;
    const out = amount < 0 ? v * (1 + amount) : v + (255 - v) * amount;
    return Math.round(Math.max(0, Math.min(255, out)));
  };
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, "0")).join("")}`;
}
