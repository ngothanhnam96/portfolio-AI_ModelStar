import test from "node:test";
import assert from "node:assert/strict";
import { applyMove, bestLook, bestMove, moves } from "../src/core/stylist.js";
import { STARTER_ITEMS, ITEMS } from "../src/core/catalog.js";
import { basicLook, isCovered } from "../src/core/look.js";
import { evaluate } from "../src/core/scoring.js";
import { showById } from "../src/core/shows.js";

const beach = showById("beach");

test("moves only use the owned wardrobe", () => {
  const all = moves(basicLook(), STARTER_ITEMS);
  assert.ok(all.length > 50);
  for (const m of all) if (m.slot !== "lips" && m.id) assert.ok(STARTER_ITEMS.includes(m.id), m.id);
  assert.ok(!all.some((m) => m.id === "hat-sun"));
});

test("the hint improves the score and never undresses the model", () => {
  let look = basicLook();
  for (let i = 0; i < 15; i += 1) {
    const move = bestMove(look, beach, STARTER_ITEMS);
    if (!move) break;
    const next = applyMove(look, move);
    assert.ok(isCovered(next));
    assert.ok(evaluate(next, beach).total > evaluate(look, beach).total);
    look = next;
  }
  assert.equal(bestMove(look, beach, STARTER_ITEMS), null, "settles on a local best");
});

test("bestLook finds a dressed look at least as good as the basic one", () => {
  const owned = ITEMS.map((i) => i.id);
  const tet = showById("tet");
  const { look, result } = bestLook(tet, owned, basicLook());
  assert.ok(isCovered(look));
  assert.ok(result.total >= evaluate(basicLook(), tet).total);
  assert.equal(look.items.dress?.id, "dress-aodai", "Tết calls for an áo dài");
});
