import { basicLook, equip } from "../../src/core/look.js";

/** Build a look from [itemId, colour?] pairs on top of an undressed model with long hair. */
export function dress(pairs, body = {}) {
  let look = { ...basicLook(body), items: { hair: { id: "hair-long", color: null } } };
  for (const [id, color] of pairs) look = equip(look, id, color);
  return look;
}
