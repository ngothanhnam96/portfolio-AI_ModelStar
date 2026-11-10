import test from "node:test";
import assert from "node:assert/strict";
import { COLORS, colorById, harmony, hueDistance, shade } from "../src/core/palette.js";

test("colour ids are unique and every colour has a valid hex", () => {
  assert.equal(new Set(COLORS.map((c) => c.id)).size, COLORS.length);
  for (const c of COLORS) {
    assert.match(c.hex, /^#[0-9a-f]{6}$/);
    assert.ok(c.neutral || Number.isFinite(c.hue), `${c.id} needs a hue or to be neutral`);
  }
  assert.throws(() => colorById("plaid"), /Unknown colour/);
});

test("hue distance wraps around the wheel", () => {
  assert.equal(hueDistance(10, 350), 20);
  assert.equal(hueDistance(0, 180), 180);
  assert.equal(hueDistance(90, 90), 0);
});

test("harmony: neutrals are free, monochrome and analogous are best, clashes are worst", () => {
  assert.equal(harmony(["white", "black", "beige"]), 1);
  assert.equal(harmony(["pink", "pink", "white"]), 1);
  assert.equal(harmony(["pink", "red"]), 1, "neighbours on the wheel");
  assert.equal(harmony(["blue", "orange"]), 0.9, "complementary");
  assert.equal(harmony(["green", "pink", "yellow"]), 0.55, "three unrelated colours");
  assert.ok(harmony(["green", "pink", "yellow", "blue"]) < harmony(["green", "pink", "yellow"]));
  assert.ok(harmony(["yellow", "orange", "gold"]) > harmony(["yellow", "purple", "mint"]));
});

test("shade darkens and lightens", () => {
  assert.equal(shade("#808080", -0.5), "#404040");
  assert.equal(shade("#000000", 0.5), "#808080");
  assert.equal(shade("#ffffff", -1), "#000000");
});
