import test from "node:test";
import assert from "node:assert/strict";
import { showById, STAR_SCORES } from "../src/core/shows.js";
import { itemById } from "../src/core/catalog.js";
import { accent, colorScore, completeScore, detailScore, evaluate, itemFit, starsFor, styleScore } from "../src/core/scoring.js";
import { dress } from "./support/helpers.js";

const beach = showById("beach");
const gala = showById("redcarpet");
const winter = showById("winter");

test("item fit: matching tags score, a second tag adds a little, avoided tags are a misstep", () => {
  assert.equal(itemFit(itemById("hat-sun"), beach), 1);
  assert.equal(itemFit(itemById("top-tank"), showById("jogging")), 1);
  assert.equal(itemFit(itemById("hair-twin"), beach), 0.5, "cute only");
  assert.equal(itemFit(itemById("outer-puffer"), beach), -0.6, "cozy is avoided at the beach");
  assert.equal(itemFit(itemById("ear-stud"), showById("festival")), -0.6, "office is avoided at the festival");
  assert.equal(itemFit(itemById("hair-bun"), beach), 0, "a hairstyle is never a misstep");
  assert.ok(Math.abs(itemFit(itemById("hair-bob"), beach) - 0.575) < 1e-9, "cute, plus a little for street");
});

test("an on-theme outfit beats an off-theme one", () => {
  const onTheme = dress([["dress-sun", "yellow"], ["shoes-sandal", "white"], ["hat-sun", "beige"], ["glass-sun"]]);
  const offTheme = dress([["top-blouse", "white"], ["bottom-pencil", "black"], ["shoes-heel", "black"], ["outer-blazer", "navy"]]);
  assert.ok(styleScore(onTheme, beach) > 0.85);
  assert.ok(styleScore(offTheme, beach) < 0.3);
  assert.ok(evaluate(onTheme, beach).total > evaluate(offTheme, beach).total + 8);
});

test("colour: a clash of unrelated brights scores lower than one accent plus neutrals", () => {
  const calm = dress([["top-tee", "yellow"], ["bottom-shorts", "white"], ["shoes-sandal", "beige"]]);
  const clash = dress([["top-tee", "green"], ["bottom-shorts", "purple"], ["shoes-sandal", "red"]]);
  assert.ok(colorScore(calm, beach) > colorScore(clash, beach) + 0.3);
});

test("accent: all-neutral looks miss the pop of colour unless the palette is all neutral", () => {
  assert.equal(accent(["white", "black"], beach), 0.2);
  assert.equal(accent(["white", "yellow"], beach), 1);
  assert.equal(accent(["white", "navy"], showById("interview")), 1);
  assert.equal(accent(["white", "black"], { colors: ["white", "black", "gray"] }), 1);
});

test("completeness counts dressed, shoes and the show's must-haves", () => {
  const noCoat = dress([["top-sweater"], ["bottom-jeans"], ["shoes-boot"]]);
  assert.equal(completeScore(noCoat, winter), 3 / 4);
  assert.equal(completeScore(dress([["top-sweater"], ["bottom-jeans"], ["shoes-boot"], ["outer-trench"]]), winter), 1);
  assert.equal(completeScore(dress([["top-sweater"]]), winter), 0);
});

test("details: two or three fitting accessories and the right lipstick", () => {
  const base = [["dress-bodycon", "red"], ["shoes-heel", "black"]];
  const none = dress(base);
  const three = dress([...base, ["bag-clutch"], ["ear-pearl"], ["neck-pearl"]]);
  const wrong = dress([...base, ["hat-cap"], ["bag-backpack"]]);
  assert.ok(detailScore(three, gala) > 0.75);
  assert.ok(detailScore({ ...three, lips: "red" }, gala) > detailScore(three, gala));
  assert.ok(detailScore(none, gala) < 0.1);
  assert.equal(detailScore(wrong, gala), 0, "clashing accessories");
});

test("the trend item pleases the blogger", () => {
  const look = dress([["dress-sun"], ["shoes-sandal"]]);
  const withTrend = dress([["dress-sun"], ["shoes-sandal"], ["hat-sun"]]);
  assert.equal(evaluate(look, beach).parts.trend, 0);
  assert.equal(evaluate(withTrend, beach).parts.trend, 1);
  const blogger = (r) => r.judges.find((j) => j.judge.id === "blogger").score;
  assert.ok(blogger(evaluate(withTrend, beach)) > blogger(evaluate(look, beach)) + 1.4);
});

test("an undressed model is heavily penalised", () => {
  const half = dress([["top-tee", "yellow"], ["shoes-sandal"], ["hat-sun"]]);
  const full = dress([["top-tee", "yellow"], ["bottom-shorts", "white"], ["shoes-sandal"], ["hat-sun"]]);
  assert.ok(evaluate(half, beach).total <= evaluate(full, beach).total * 0.4 + 0.2);
  assert.ok(evaluate(half, beach).total < STAR_SCORES[0] / 1.5, "nowhere near a star");
  assert.match(evaluate(half, beach).tips[0], /áo và quần/);
});

test("three judges, each 0–10, total 0–30, stars from thresholds", () => {
  const r = evaluate(dress([["dress-sun", "yellow"], ["shoes-sandal"]]), beach);
  assert.equal(r.judges.length, 3);
  for (const j of r.judges) assert.ok(j.score >= 0 && j.score <= 10);
  assert.equal(r.total, Math.round(r.judges.reduce((s, j) => s + j.score, 0) * 10) / 10);
  assert.deepEqual(STAR_SCORES.map(starsFor), [1, 2, 3]);
  assert.equal(starsFor(STAR_SCORES[0] - 0.1), 0);
  assert.equal(starsFor(30), 3);
});

test("tips are specific: missing must-haves, misfits, colour clashes, at most three", () => {
  const look = dress([["top-tee", "green"], ["bottom-shorts", "purple"], ["outer-puffer", "red"]]);
  const { tips } = evaluate(look, beach);
  assert.ok(tips.length <= 3);
  assert.ok(tips.some((t) => /giày/.test(t)), "no shoes");
  assert.ok(tips.some((t) => /Áo phao/.test(t)), "puffer at the beach");
  const clash = evaluate(dress([["top-tee", "green"], ["bottom-shorts", "purple"], ["shoes-sandal", "red"]]), beach).tips;
  assert.ok(clash.some((t) => /màu/.test(t)));
});

test("scoring is deterministic", () => {
  const look = dress([["dress-gown", "gold"], ["shoes-heel", "black"], ["ear-pearl"]]);
  assert.deepEqual(evaluate(look, gala), evaluate(look, gala));
});
