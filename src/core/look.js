/** A look = body settings + one item per slot. Looks are plain data and never mutated. */

import { itemById, slotById, SKIN_TONES, HAIR_COLORS, EYE_COLORS } from "./catalog.js";

/**
 * items: { [slotId]: { id, color } }. Hair has no fabric colour (hairColor sets it).
 */
export function createLook(overrides = {}) {
  return {
    skin: SKIN_TONES[1],
    hairColor: HAIR_COLORS[1].id,
    eyes: EYE_COLORS[0],
    lips: "nude",
    blush: true,
    items: { hair: { id: "hair-long", color: null } },
    ...overrides,
  };
}

/** The starting look for a show: a plain tee, jeans and sneakers. */
export function basicLook(body = {}) {
  let look = createLook(body);
  look = equip(look, "top-tee");
  look = equip(look, "bottom-jeans");
  look = equip(look, "shoes-sneaker");
  return look;
}

/**
 * Put an item on. A dress takes off the top and bottom and the other way round.
 * Equipping the same item again takes it off (hair can't be taken off).
 */
export function equip(look, itemId, color) {
  const item = itemById(itemId);
  const items = { ...look.items };
  const current = items[item.slot];
  if (current?.id === itemId && color === undefined) {
    if (slotById(item.slot).required) return look;
    delete items[item.slot];
    return { ...look, items };
  }
  if (color !== undefined && color !== null && item.colors && !item.colors.includes(color)) {
    throw new Error(`${itemId} does not come in ${color}`);
  }
  const chosen = item.colors ? color ?? (current?.id === itemId ? current.color : item.color) : null;
  items[item.slot] = { id: itemId, color: chosen };
  if (item.slot === "dress") {
    delete items.top;
    delete items.bottom;
  }
  if (item.slot === "top" || item.slot === "bottom") delete items.dress;
  return { ...look, items };
}

export function unequip(look, slotId) {
  if (slotById(slotId).required || !look.items[slotId]) return look;
  const items = { ...look.items };
  delete items[slotId];
  return { ...look, items };
}

/** Change the fabric colour of what is worn in a slot. */
export function recolor(look, slotId, color) {
  const worn = look.items[slotId];
  if (!worn) return look;
  return equip(look, worn.id, color);
}

export function isCovered(look) {
  const { items } = look;
  return Boolean(items.dress || (items.top && items.bottom));
}

/** [{ slot, item, color }] in slot order. */
export function worn(look) {
  return Object.entries(look.items).map(([slot, entry]) => ({ slot, item: itemById(entry.id), color: entry.color }));
}

export function sameLook(a, b) {
  return JSON.stringify(normalise(a)) === JSON.stringify(normalise(b));
}

function normalise(look) {
  const items = Object.keys(look.items).sort().map((slot) => [slot, look.items[slot].id, look.items[slot].color]);
  return [look.skin, look.hairColor, look.eyes, look.lips, look.blush, items];
}
