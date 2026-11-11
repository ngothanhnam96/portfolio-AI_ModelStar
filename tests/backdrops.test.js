import test from "node:test";
import assert from "node:assert/strict";
import { BACKDROPS, SHOW_BACKDROP, backdropSVG } from "../src/ui/backdrops.js";
import { SHOWS } from "../src/core/shows.js";

function balanced(svg) {
  const stack = [];
  for (const [, closing, name, , self] of svg.matchAll(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g)) {
    if (self) continue;
    if (closing) assert.equal(stack.pop(), name);
    else stack.push(name);
  }
  assert.deepEqual(stack, []);
}

test("every background is a well-formed SVG that fills its box", () => {
  assert.equal(new Set(BACKDROPS.map((b) => b.id)).size, BACKDROPS.length);
  for (const b of BACKDROPS) {
    const svg = backdropSVG(b.id);
    assert.match(svg, /preserveAspectRatio="xMidYMax slice"/);
    assert.ok(!/NaN|undefined/.test(svg), b.id);
    balanced(svg);
  }
  balanced(backdropSVG("night", { snow: true }));
});

test("every show has a background, and gradient ids never repeat across pictures", () => {
  for (const show of SHOWS) assert.ok(BACKDROPS.some((b) => b.id === SHOW_BACKDROP[show.id]), show.id);
  const ids = (svg) => [...svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  const a = ids(backdropSVG("bedroom"));
  const b = ids(backdropSVG("bedroom"));
  assert.ok(a.length && a.every((id) => !b.includes(id)));
});
