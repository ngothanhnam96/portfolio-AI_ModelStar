/** How the judges score a look for a show. Pure and deterministic. */

import { slotById, STYLES } from "./catalog.js";
import { colorById, harmony } from "./palette.js";
import { isCovered, worn } from "./look.js";
import { JUDGES, STAR_SCORES } from "./shows.js";

/**
 * How well one item fits the show, -0.6…1. Clothing with an avoided tag is a misstep; a hairstyle
 * never is (it can only help).
 */
export function itemFit(item, show) {
  if (item.slot !== "hair" && item.tags.some((tag) => show.avoid.includes(tag))) return -0.6;
  const weights = item.tags.map((tag) => show.styles[tag] ?? 0).sort((a, b) => b - a);
  // Best tag counts fully, a second matching tag adds a little.
  return Math.min(1, (weights[0] ?? 0) + 0.25 * (weights[1] ?? 0));
}

/** Weighted average fit of everything worn, 0–1. */
export function styleScore(look, show) {
  let total = 0;
  let weight = 0;
  for (const { slot, item } of worn(look)) {
    const w = slotById(slot).weight;
    total += w * itemFit(item, show);
    weight += w;
  }
  return weight ? clamp01(total / weight) : 0;
}

/** Colour harmony of the fabrics plus how many of them are in the show's palette, 0–1. */
export function colorScore(look, show) {
  const fabrics = worn(look).filter((w) => w.color);
  if (!fabrics.length) return 0;
  const ids = fabrics.map((w) => w.color);
  let inPalette = 0;
  let weight = 0;
  for (const w of fabrics) {
    const slotWeight = slotById(w.slot).weight;
    const color = colorById(w.color);
    const fits = show.colors.includes(w.color) ? 1 : color.neutral ? 0.5 : 0;
    inPalette += slotWeight * fits;
    weight += slotWeight;
  }
  return 0.45 * harmony(ids) + 0.35 * (inPalette / weight) + 0.2 * accent(ids, show);
}

/**
 * The photographer wants a pop of the theme's colour: 1 if any fabric is a non-neutral colour from
 * the show's palette (or the palette is all neutrals anyway), else 0.2.
 */
export function accent(colorIds, show) {
  const vivid = show.colors.filter((id) => !colorById(id).neutral);
  if (!vivid.length) return 1;
  return colorIds.some((id) => vivid.includes(id)) ? 1 : 0.2;
}

/** Dressed (top + bottom or a dress), shoes, and whatever the show needs, 0–1. */
export function completeScore(look, show) {
  const checks = [isCovered(look), Boolean(look.items.shoes), ...show.needs.map((slot) => Boolean(look.items[slot]))];
  return checks.filter(Boolean).length / checks.length;
}

/** Accessories that suit the show (two or three is the sweet spot) and fitting lipstick, 0–1. */
export function detailScore(look, show) {
  const accessories = worn(look).filter((w) => slotById(w.slot).accessory);
  const fitting = accessories.filter((w) => itemFit(w.item, show) >= 0.4).length;
  const clashing = accessories.filter((w) => itemFit(w.item, show) < 0).length;
  const count = [0, 0.5, 0.85, 1, 0.9, 0.75][fitting];
  const lips = show.lips.includes(look.lips) ? 1 : 0.3;
  return clamp01(0.8 * count + 0.2 * lips - 0.25 * clashing);
}

export function evaluate(look, show) {
  const parts = {
    style: styleScore(look, show),
    color: colorScore(look, show),
    complete: completeScore(look, show),
    detail: detailScore(look, show),
    trend: Object.values(look.items).some((entry) => entry.id === show.trend) ? 1 : 0,
  };
  // A model who is not dressed (top + bottom, or a dress) does not impress anyone.
  const factor = isCovered(look) ? 1 : 0.4;
  const judges = JUDGES.map((judge) => {
    let score = 0;
    for (const [part, weight] of Object.entries(judge.weights)) score += weight * parts[part];
    return { judge, score: round1(10 * score * factor) };
  });
  const total = round1(judges.reduce((sum, j) => sum + j.score, 0));
  return { parts, judges, total, stars: starsFor(total), tips: tips(look, show, parts) };
}

export function starsFor(total) {
  return STAR_SCORES.filter((min) => total >= min).length;
}

/** Up to three short, specific pieces of feedback, worst problem first. */
export function tips(look, show, parts) {
  const out = [];
  if (!isCovered(look)) out.push("Người mẫu cần mặc áo và quần/váy, hoặc một chiếc đầm.");
  for (const slot of ["shoes", ...show.needs]) {
    if (!look.items[slot]) out.push(`Chủ đề này cần thêm ${slotById(slot).name.toLowerCase()}.`);
  }
  const misfits = worn(look).filter((w) => itemFit(w.item, show) < 0);
  for (const w of misfits.slice(0, 2)) out.push(`${w.item.name} không hợp với "${show.name}".`);
  const hues = new Set(worn(look).filter((w) => w.color && !colorById(w.color).neutral).map((w) => w.color));
  if (hues.size >= 3 && harmony([...hues]) < 0.7) out.push("Quá nhiều màu nổi đối chọi nhau: thử bớt một màu hoặc dùng màu trung tính.");
  if (parts.style < 0.6 && !misfits.length) {
    const wanted = Object.entries(show.styles).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([tag]) => STYLES[tag].name);
    out.push(`Thử thêm món đồ phong cách ${wanted.join(" hoặc ").toLowerCase()}.`);
  }
  if (parts.detail < 0.5) out.push("Phụ kiện hợp chủ đề sẽ làm bộ đồ nổi bật hơn.");
  if (!parts.trend) out.push("Bé Mây đang mong chờ một món đồ đang hot…");
  return out.slice(0, 3);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}
