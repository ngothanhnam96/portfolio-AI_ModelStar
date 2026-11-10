/**
 * The stylist: searches the wardrobe for a high-scoring look. Used by the in-game hint
 * ("change this one thing") and by the tests that prove every show can be won.
 */

import { ITEMS, LIPS, SLOTS } from "./catalog.js";
import { equip, isCovered, unequip } from "./look.js";
import { evaluate } from "./scoring.js";

/** Every single change to one slot (or the lipstick) that the owned wardrobe allows. */
export function moves(look, owned, slotIds = SLOTS.map((s) => s.id)) {
  const ownedSet = new Set(owned);
  const out = [];
  for (const slotId of slotIds) {
    const slot = SLOTS.find((s) => s.id === slotId);
    if (!slot.required && look.items[slotId]) out.push({ slot: slotId, id: null, color: null });
    for (const item of ITEMS) {
      if (item.slot !== slotId || !ownedSet.has(item.id)) continue;
      for (const color of item.colors ?? [null]) {
        const current = look.items[slotId];
        if (current && current.id === item.id && current.color === color) continue;
        out.push({ slot: slotId, id: item.id, color });
      }
    }
  }
  for (const lip of LIPS) if (lip.id !== look.lips) out.push({ slot: "lips", id: lip.id, color: null });
  return out;
}

export function applyMove(look, move) {
  if (move.slot === "lips") return { ...look, lips: move.id };
  if (move.id === null) return unequip(look, move.slot);
  return equip(look, move.id, move.color);
}

/** The one change that raises the total most while keeping the model dressed, or null. */
export function bestMove(look, show, owned, slotIds) {
  const base = evaluate(look, show).total;
  let best = null;
  for (const move of moves(look, owned, slotIds)) {
    const next = applyMove(look, move);
    if (isCovered(look) && !isCovered(next)) continue;
    const gain = evaluate(next, show).total - base;
    if (gain > 0.05 && (!best || gain > best.gain)) best = { ...move, gain };
  }
  return best;
}

/**
 * Hill-climb from `start`, once wearing a dress and once wearing separates, and keep the
 * better result. Not guaranteed optimal, which only makes the tests' proofs stricter.
 */
export function bestLook(show, owned, start) {
  const results = [];
  const dresses = ITEMS.filter((i) => i.slot === "dress" && owned.includes(i.id));
  const tops = ITEMS.filter((i) => i.slot === "top" && owned.includes(i.id));
  const bottoms = ITEMS.filter((i) => i.slot === "bottom" && owned.includes(i.id));
  const others = SLOTS.map((s) => s.id).filter((id) => !["top", "bottom", "dress"].includes(id));

  if (dresses.length) {
    let look = equip(start, dresses[0].id, dresses[0].color);
    look = climb(look, show, owned, ["dress", ...others]);
    results.push(look);
  }
  if (tops.length && bottoms.length) {
    let look = equip(equip(start, tops[0].id, tops[0].color), bottoms[0].id, bottoms[0].color);
    look = climb(look, show, owned, ["top", "bottom", ...others]);
    results.push(look);
  }
  let best = null;
  for (const look of results) {
    const result = evaluate(look, show);
    if (!best || result.total > best.result.total) best = { look, result };
  }
  return best;
}

/** Keep applying the best single change until nothing helps. */
export function improve(look, show, owned) {
  return climb(look, show, owned, SLOTS.map((s) => s.id));
}

function climb(look, show, owned, slotIds) {
  for (let step = 0; step < 40; step += 1) {
    const move = bestMove(look, show, owned, slotIds);
    if (!move) break;
    look = applyMove(look, move);
  }
  return look;
}
