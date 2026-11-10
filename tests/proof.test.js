/**
 * The two proofs: every show can be won with three stars, and a whole career can be played from
 * the starter wardrobe to the final, buying clothes with the coins it earns, without replays.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { ITEMS, STARTER_ITEMS } from "../src/core/catalog.js";
import { basicLook } from "../src/core/look.js";
import { SHOWS } from "../src/core/shows.js";
import { evaluate, itemFit } from "../src/core/scoring.js";
import { bestLook, improve } from "../src/core/stylist.js";
import { applyResult, buy, canBuy, createProgress, isUnlocked, totalStars } from "../src/core/career.js";

const ALL = ITEMS.map((i) => i.id);

test("the full wardrobe wins 3 stars at every show", () => {
  for (const show of SHOWS) {
    const { result } = bestLook(show, ALL, basicLook());
    assert.equal(result.stars, 3, `${show.id}: ${result.total}`);
  }
});

test("the plain tee + jeans never earns 3 stars, and late shows need new clothes", () => {
  for (const show of SHOWS) assert.ok(evaluate(basicLook(), show).stars < 3, show.id);
  const starterBest = SHOWS.map((show) => bestLook(show, STARTER_ITEMS, basicLook()).result.stars);
  assert.ok(starterBest.slice(-3).every((s) => s < 3), `starter wardrobe: ${starterBest}`);
  assert.ok(starterBest[0] >= 1, "the first show is winnable from the start");
});

test("a whole career from scratch: shop with earned coins, win every show, no replays", () => {
  let progress = createProgress();
  const log = [];
  SHOWS.forEach((show, index) => {
    assert.ok(isUnlocked(progress, index), `${show.id} should be open (stars ${totalStars(progress)}; ${log.join(" ")})`);
    // Greedy shopper: of the clothes that suit this show, buy whatever raises its best score
    // most, while coins last.
    const shortlist = ITEMS.filter((item) => itemFit(item, show) >= 0.5);
    for (;;) {
      const best = bestLook(show, progress.owned, basicLook());
      const current = best.result.total;
      let pick = null;
      for (const item of shortlist) {
        if (!canBuy(progress, item.id)) continue;
        // Estimate: restyle the current best look with the new item available.
        const total = evaluate(improve(best.look, show, [...progress.owned, item.id]), show).total;
        if (total > current + 0.3 && (!pick || total > pick.total)) pick = { id: item.id, total };
      }
      if (!pick) break;
      progress = buy(progress, pick.id);
    }
    const { result } = bestLook(show, progress.owned, basicLook());
    assert.ok(result.stars >= 1, `${show.id}: ${result.total}`);
    progress = applyResult(progress, show.id, result).progress;
    log.push(`${show.id}:${result.stars}`);
  });
  assert.ok(totalStars(progress) >= SHOWS.at(-1).needStars, log.join(" "));
});
