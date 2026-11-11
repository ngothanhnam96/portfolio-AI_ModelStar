import test from "node:test";
import assert from "node:assert/strict";
import { ITEMS, HAIR_COLORS, SLOTS, itemById } from "../src/core/catalog.js";
import { colorById } from "../src/core/palette.js";
import { basicLook, equip } from "../src/core/look.js";
import { THUMB_VIEW, dollMarkup, dollSVG, mirror, thumbSVG } from "../src/ui/doll.js";

/** Every opened tag is closed, attribute values are quoted and contain no NaN/undefined. */
function assertWellFormed(svg) {
  const stack = [];
  for (const match of svg.matchAll(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g)) {
    const [, closing, name, attrs, selfClosing] = match;
    assert.ok(!/=\s*[^"\s]/.test(attrs.replace(/="[^"]*"/g, "")), `unquoted attribute in <${name}${attrs}>`);
    assert.ok(!/NaN|undefined/.test(attrs), `bad value in <${name}${attrs}>`);
    if (selfClosing) continue;
    if (closing) assert.equal(stack.pop(), name);
    else stack.push(name);
  }
  assert.deepEqual(stack, []);
}

test("mirror flips x across the centre line and keeps y", () => {
  assert.equal(mirror("M70 10 L 90 20 Z"), "M 130 10 L 110 20 Z");
  assert.equal(mirror("M66 122 C 58 126 54 146 53 168"), "M 134 122 C 142 126 146 146 147 168");
  assert.equal(mirror("M100 0 Q 80 5 60 10"), "M 100 0 Q 120 5 140 10");
});

test("the basic doll is a well-formed SVG", () => {
  const svg = dollSVG(basicLook());
  assert.match(svg, /^<svg class="doll" viewBox="0 0 200 428"/);
  assertWellFormed(svg);
});

test("every item in every colour renders well-formed markup that uses the colour", () => {
  for (const item of ITEMS) {
    for (const color of item.colors ?? [null]) {
      const svg = dollSVG(equip(basicLook(), item.id, color ?? undefined));
      assertWellFormed(svg);
      if (color) assert.ok(svg.includes(colorById(color).hex), `${item.id} in ${color}`);
    }
  }
});

test("each item changes the picture, and differently from every other item", () => {
  const base = dollMarkup(basicLook());
  const seen = new Map();
  for (const item of ITEMS) {
    if (["hair-long", "top-tee", "bottom-jeans", "shoes-sneaker"].includes(item.id)) continue;
    const markup = dollMarkup(equip(basicLook(), item.id));
    assert.notEqual(markup, base, item.id);
    assert.ok(!seen.has(markup), `${item.id} looks the same as ${seen.get(markup)}`);
    seen.set(markup, item.id);
  }
});

test("hair colour, skin, lipstick and blush show up", () => {
  for (const hair of HAIR_COLORS) assert.ok(dollSVG(basicLook({ hairColor: hair.id })).includes(hair.hex));
  assert.ok(dollSVG(basicLook({ skin: "#8d5a3b" })).includes("#8d5a3b"));
  assert.ok(dollSVG(basicLook({ lips: "red" })).includes("#cf2238"));
  assert.ok(dollSVG(basicLook({ blush: true })).includes("#ff7f98"));
  assert.ok(!dollSVG(basicLook({ blush: false })).includes("#ff7f98"));
});

test("floor-length clothes are drawn over the shoes, everything else under them", () => {
  const wide = dollMarkup(equip(equip(basicLook(), "bottom-wide", "navy"), "shoes-heel", "gold"));
  assert.ok(wide.indexOf(colorById("gold").hex) < wide.indexOf(colorById("navy").hex));
  const jeans = dollMarkup(equip(equip(basicLook(), "bottom-jeans", "navy"), "shoes-boot", "red"));
  assert.ok(jeans.indexOf(colorById("navy").hex) < jeans.indexOf(colorById("red").hex));
});

test("thumbnails are cropped to the item's slot", () => {
  for (const slot of SLOTS) assert.ok(THUMB_VIEW[slot.id], slot.id);
  for (const item of ITEMS) {
    const svg = thumbSVG(item.id, undefined, basicLook());
    assert.ok(svg.includes(`viewBox="${THUMB_VIEW[item.slot]}"`));
    assertWellFormed(svg);
    if (item.colors) assert.ok(svg.includes(colorById(itemById(item.id).color).hex), item.id);
  }
});

test("soft shading: gradients are defined once per render, with ids unique to that picture", () => {
  const a = dollSVG(equip(basicLook(), "dress-gown", "purple"));
  const b = dollSVG(equip(basicLook(), "dress-gown", "purple"));
  const ids = (svg) => [...svg.matchAll(/<linearGradient id="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids(a).length >= 3, "cloth, hair and skin gradients");
  assert.equal(new Set(ids(a)).size, ids(a).length, "each gradient defined once");
  assert.ok(ids(a).every((id) => !ids(b).includes(id)), "two dolls on one page never share ids");
  for (const id of ids(a)) assert.ok(a.includes(`url(#${id})`), `${id} is used`);
  const thumb = thumbSVG("dress-gown", "gold", basicLook());
  assert.match(thumb, /<defs>.*<\/defs><\/svg>$/s, "thumbnail gradients live inside its <svg>");
});
