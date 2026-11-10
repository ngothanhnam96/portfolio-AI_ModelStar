import test from "node:test";
import assert from "node:assert/strict";
import { SHOWS, JUDGES, RANKS, rankFor, showById } from "../src/core/shows.js";
import { STYLES, itemById, slotById } from "../src/core/catalog.js";
import { colorById } from "../src/core/palette.js";
import { itemFit } from "../src/core/scoring.js";

test("12 shows with unique ids and valid data", () => {
  assert.equal(SHOWS.length, 12);
  assert.equal(new Set(SHOWS.map((s) => s.id)).size, 12);
  for (const show of SHOWS) {
    for (const tag of [...Object.keys(show.styles), ...show.avoid]) assert.ok(STYLES[tag], `${show.id}: ${tag}`);
    assert.ok(Object.values(show.styles).includes(1), `${show.id} has a main style`);
    for (const tag of show.avoid) assert.ok(!(tag in show.styles), `${show.id} wants and avoids ${tag}`);
    show.colors.forEach(colorById);
    show.needs.forEach(slotById);
    assert.ok(show.lips.length >= 1);
    assert.equal(show.stage.length, 2);
    assert.ok(show.brief.length > 20);
  }
  assert.throws(() => showById("nope"));
});

test("each show's trend item really suits the show", () => {
  for (const show of SHOWS) assert.ok(itemFit(itemById(show.trend), show) >= 0.6, `${show.id}: ${show.trend}`);
});

test("the career gets harder: less time, more stars needed", () => {
  for (let i = 1; i < SHOWS.length; i += 1) {
    assert.ok(SHOWS[i].time <= SHOWS[i - 1].time, SHOWS[i].id);
    assert.ok(SHOWS[i].needStars >= SHOWS[i - 1].needStars, SHOWS[i].id);
    assert.ok(SHOWS[i].needStars <= 3 * i, `${SHOWS[i].id} asks for more stars than exist before it`);
  }
});

test("judges' weights sum to 1; ranks climb to the maximum of 36 stars", () => {
  for (const judge of JUDGES) {
    const sum = Object.values(judge.weights).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, judge.id);
  }
  assert.equal(rankFor(0).name, RANKS[0].name);
  assert.equal(rankFor(36).name, RANKS.at(-1).name);
  assert.equal(RANKS.at(-1).stars, 3 * SHOWS.length);
  assert.equal(rankFor(13).name, "Gương mặt trang bìa");
});
