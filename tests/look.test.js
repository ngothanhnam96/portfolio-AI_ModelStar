import test from "node:test";
import assert from "node:assert/strict";
import { basicLook, createLook, equip, isCovered, recolor, sameLook, unequip, worn } from "../src/core/look.js";

test("the basic look is dressed: tee, jeans, sneakers, long hair", () => {
  const look = basicLook();
  assert.ok(isCovered(look));
  assert.deepEqual(Object.keys(look.items).sort(), ["bottom", "hair", "shoes", "top"]);
  assert.equal(look.items.top.color, "white");
});

test("a dress replaces top and bottom, and a top replaces a dress", () => {
  let look = equip(basicLook(), "dress-sun");
  assert.equal(look.items.top, undefined);
  assert.equal(look.items.bottom, undefined);
  assert.ok(isCovered(look));
  look = equip(look, "top-blouse");
  assert.equal(look.items.dress, undefined);
  assert.equal(isCovered(look), false, "a top alone is not dressed");
  look = equip(look, "bottom-pencil");
  assert.ok(isCovered(look));
});

test("equipping the same item again takes it off, except the hair", () => {
  const look = equip(basicLook(), "hat-cap");
  assert.ok(look.items.hat);
  assert.equal(equip(look, "hat-cap").items.hat, undefined);
  assert.equal(equip(look, "hair-long"), look);
  assert.equal(unequip(look, "hair"), look);
  assert.equal(unequip(look, "hat").items.hat, undefined);
});

test("colours: default, explicit, recolour keeps the item, invalid colours throw", () => {
  let look = equip(basicLook(), "hat-cap");
  assert.equal(look.items.hat.color, "red");
  look = equip(look, "hat-cap", "navy");
  assert.equal(look.items.hat.color, "navy");
  look = recolor(look, "hat", "pink");
  assert.deepEqual(look.items.hat, { id: "hat-cap", color: "pink" });
  assert.throws(() => equip(look, "bag-basket", "purple"), /does not come in/);
  assert.equal(recolor(look, "glasses", "red"), look, "nothing to recolour");
});

test("looks are never mutated", () => {
  const look = basicLook();
  const copy = JSON.parse(JSON.stringify(look));
  equip(look, "dress-sun");
  recolor(look, "top", "red");
  unequip(look, "shoes");
  assert.deepEqual(look, copy);
});

test("worn lists items and sameLook compares content", () => {
  const look = basicLook();
  assert.deepEqual(worn(look).map((w) => w.item.id).sort(), ["bottom-jeans", "hair-long", "shoes-sneaker", "top-tee"]);
  assert.ok(sameLook(look, basicLook()));
  assert.ok(!sameLook(look, recolor(look, "top", "red")));
  assert.ok(!isCovered(createLook()));
});
