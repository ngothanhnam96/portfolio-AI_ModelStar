import test from "node:test";
import assert from "node:assert/strict";
import {
  HINT_COST, PAY, START_COINS, applyResult, buy, canBuy, createProgress, isUnlocked, lockReason, payFor, restoreProgress, spend, totalStars,
} from "../src/core/career.js";
import { SHOWS } from "../src/core/shows.js";
import { STARTER_ITEMS } from "../src/core/catalog.js";

const result = (stars, total = 20) => ({ stars, total });

test("a new career: starter wardrobe, some coins, only the first show open", () => {
  const p = createProgress();
  assert.equal(p.coins, START_COINS);
  assert.deepEqual(p.owned, STARTER_ITEMS);
  assert.equal(totalStars(p), 0);
  assert.ok(isUnlocked(p, 0));
  assert.ok(!isUnlocked(p, 1));
  assert.match(lockReason(p, 1), /1 ⭐/);
  assert.equal(lockReason(p, 0), null);
  assert.ok(!isUnlocked(p, 99));
});

test("a show opens when the previous one has a star and the total is high enough", () => {
  let p = createProgress();
  for (const id of ["school", "beach", "interview", "jogging"]) p = applyResult(p, id, result(1)).progress;
  assert.ok(isUnlocked(p, 4), "cafe needs 1 star in total");
  p = applyResult(p, "cafe", result(1)).progress;
  assert.ok(isUnlocked(p, 5), "winter needs 3");
  p = applyResult(p, "winter", result(1)).progress;
  assert.equal(totalStars(p), 6);
  assert.ok(isUnlocked(p, 6), "tet needs 5");
  p = applyResult(p, "tet", result(1)).progress;
  assert.ok(isUnlocked(p, 7));
  p = applyResult(p, "festival", result(1)).progress;
  assert.ok(!isUnlocked(p, 8), "birthday needs 10, only 8");
  assert.match(lockReason(p, 8), /10 ⭐/);
});

test("pay: walking, each star, and a bonus only for stars earned the first time", () => {
  assert.equal(payFor(0, 0), PAY.show);
  assert.equal(payFor(0, 3), PAY.show + 3 * PAY.star + 3 * PAY.newStar);
  assert.equal(payFor(3, 3), PAY.show + 3 * PAY.star);
  assert.equal(payFor(2, 1), PAY.show + PAY.star);
  let p = createProgress();
  const first = applyResult(p, "school", result(2, 23));
  assert.equal(first.coins, payFor(0, 2));
  assert.equal(first.newStars, 2);
  assert.ok(first.newBest);
  p = first.progress;
  const worse = applyResult(p, "school", result(1, 18));
  assert.equal(worse.progress.stars.school, 2, "stars never go down");
  assert.equal(worse.progress.best.school, 23);
  assert.equal(worse.newStars, 0);
  assert.ok(!worse.newBest);
});

test("rank-ups are reported", () => {
  let p = createProgress();
  let rankUp = null;
  for (const show of SHOWS.slice(0, 2)) ({ progress: p, rankUp } = applyResult(p, show.id, result(3, 28)));
  assert.equal(rankUp.name, "Người mẫu ảnh");
});

test("buying: costs coins, can't buy twice or without coins", () => {
  let p = createProgress();
  assert.ok(canBuy(p, "hat-beanie"));
  p = buy(p, "hat-beanie");
  assert.equal(p.coins, START_COINS - 40);
  assert.ok(p.owned.includes("hat-beanie"));
  assert.throws(() => buy(p, "hat-beanie"), /already owned/);
  assert.throws(() => buy(p, "dress-gown"), /Not enough/);
  assert.ok(!canBuy(p, "dress-gown"));
  assert.equal(spend(p, HINT_COST).coins, p.coins - HINT_COST);
  assert.throws(() => spend({ ...p, coins: 3 }, HINT_COST));
});

test("restoring saved progress keeps valid data and drops junk", () => {
  assert.deepEqual(restoreProgress(null), createProgress());
  assert.deepEqual(restoreProgress("junk"), createProgress());
  const p = restoreProgress({
    coins: 250.7, owned: ["hat-tiara", "bogus", 7], stars: { school: 3, beach: 9, nope: 2 }, best: { school: 27.5, beach: -1 },
  });
  assert.equal(p.coins, 250);
  assert.ok(p.owned.includes("hat-tiara") && p.owned.includes("top-tee") && !p.owned.includes("bogus"));
  assert.deepEqual(p.stars, { school: 3 });
  assert.deepEqual(p.best, { school: 27.5 });
  assert.equal(restoreProgress({ coins: -5 }).coins, START_COINS);
});
