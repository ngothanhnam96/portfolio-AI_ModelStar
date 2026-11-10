import test from "node:test";
import assert from "node:assert/strict";
import { ITEMS, SLOTS, STYLES, STARTER_ITEMS, HAIR_COLORS, LIPS, itemById, itemsInSlot, slotById } from "../src/core/catalog.js";
import { colorById } from "../src/core/palette.js";
import { ART_IDS, HAIR_IDS } from "../src/ui/doll.js";

test("item ids are unique and look-ups fail loudly", () => {
  assert.equal(new Set(ITEMS.map((i) => i.id)).size, ITEMS.length);
  assert.throws(() => itemById("nope"), /Unknown item/);
  assert.throws(() => slotById("nope"), /Unknown slot/);
});

test("every item is well formed: known slot and tags, a price, colours it can be worn in", () => {
  for (const item of ITEMS) {
    slotById(item.slot);
    assert.ok(item.tags.length >= 1, item.id);
    for (const tag of item.tags) assert.ok(STYLES[tag], `${item.id}: unknown tag ${tag}`);
    assert.ok(Number.isInteger(item.price) && item.price >= 0, item.id);
    if (item.slot === "hair") {
      assert.equal(item.colors, undefined, "hair colour is chosen separately");
    } else {
      assert.ok(item.colors.length >= 3, `${item.id} needs a few colours`);
      item.colors.forEach(colorById);
      assert.ok(item.colors.includes(item.color), `${item.id}: default colour must be offered`);
    }
  }
});

test("every item and hairstyle has art", () => {
  for (const item of ITEMS) {
    const list = item.slot === "hair" ? HAIR_IDS : ART_IDS;
    assert.ok(list.includes(item.id), `missing art for ${item.id}`);
  }
  assert.equal(ART_IDS.length + HAIR_IDS.length, ITEMS.length, "no art without an item");
});

test("every slot has at least three items, and the starter wardrobe can dress the model", () => {
  for (const slot of SLOTS) assert.ok(itemsInSlot(slot.id).length >= 3, slot.id);
  for (const slot of ["hair", "top", "bottom", "dress", "shoes"]) {
    assert.ok(STARTER_ITEMS.some((id) => itemById(id).slot === slot), `starter ${slot}`);
  }
  assert.ok(STARTER_ITEMS.includes("hair-long") && STARTER_ITEMS.includes("top-tee") && STARTER_ITEMS.includes("bottom-jeans") && STARTER_ITEMS.includes("shoes-sneaker"));
});

test("body options exist", () => {
  assert.ok(HAIR_COLORS.length >= 6);
  assert.ok(LIPS.length >= 4);
});
