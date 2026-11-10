/** Career progress: coins, wardrobe, stars per show, unlocks. Plain data, never mutated. */

import { itemById, STARTER_ITEMS } from "./catalog.js";
import { SHOWS, rankFor } from "./shows.js";

export const START_COINS = 60;
export const HINT_COST = 15;
/** Coins for walking a show, per star earned, and per star earned for the first time. */
export const PAY = { show: 20, star: 15, newStar: 40 };

export function createProgress() {
  return { coins: START_COINS, owned: [...STARTER_ITEMS], stars: {}, best: {} };
}

/** Restore saved progress, ignoring anything unknown or malformed. */
export function restoreProgress(saved) {
  const fresh = createProgress();
  if (!saved || typeof saved !== "object") return fresh;
  const known = (id) => {
    try {
      itemById(id);
      return true;
    } catch {
      return false;
    }
  };
  const showIds = new Set(SHOWS.map((s) => s.id));
  const owned = new Set([...fresh.owned, ...(Array.isArray(saved.owned) ? saved.owned.filter(known) : [])]);
  const pick = (obj, max) =>
    Object.fromEntries(
      Object.entries(obj && typeof obj === "object" ? obj : {}).filter(
        ([id, n]) => showIds.has(id) && Number.isFinite(n) && n >= 0 && n <= max,
      ),
    );
  return {
    coins: Number.isFinite(saved.coins) && saved.coins >= 0 ? Math.floor(saved.coins) : fresh.coins,
    owned: [...owned],
    stars: pick(saved.stars, 3),
    best: pick(saved.best, 30),
  };
}

export function totalStars(progress) {
  return Object.values(progress.stars).reduce((sum, n) => sum + n, 0);
}

export function isUnlocked(progress, index) {
  const show = SHOWS[index];
  if (!show) return false;
  if (index === 0) return true;
  return (progress.stars[SHOWS[index - 1].id] ?? 0) >= 1 && totalStars(progress) >= show.needStars;
}

/** Why a show is locked, for the career map. */
export function lockReason(progress, index) {
  if (isUnlocked(progress, index)) return null;
  const previous = SHOWS[index - 1];
  if ((progress.stars[previous.id] ?? 0) < 1) return `Đạt 1 ⭐ ở "${previous.name}"`;
  return `Cần tổng ${SHOWS[index].needStars} ⭐`;
}

export function payFor(previousStars, stars) {
  return PAY.show + PAY.star * stars + PAY.newStar * Math.max(0, stars - previousStars);
}

/** Record a finished show. Returns the new progress and what changed, for the result screen. */
export function applyResult(progress, showId, result) {
  const previousStars = progress.stars[showId] ?? 0;
  const rankBefore = rankFor(totalStars(progress));
  const coins = payFor(previousStars, result.stars);
  const next = {
    ...progress,
    coins: progress.coins + coins,
    stars: { ...progress.stars, [showId]: Math.max(previousStars, result.stars) },
    best: { ...progress.best, [showId]: Math.max(progress.best[showId] ?? 0, result.total) },
  };
  const rankAfter = rankFor(totalStars(next));
  return {
    progress: next,
    coins,
    newStars: Math.max(0, result.stars - previousStars),
    newBest: result.total > (progress.best[showId] ?? 0),
    rankUp: rankAfter !== rankBefore ? rankAfter : null,
  };
}

export function canBuy(progress, itemId) {
  return !progress.owned.includes(itemId) && progress.coins >= itemById(itemId).price;
}

export function buy(progress, itemId) {
  const item = itemById(itemId);
  if (progress.owned.includes(itemId)) throw new Error(`${itemId} already owned`);
  if (progress.coins < item.price) throw new Error(`Not enough coins for ${itemId}`);
  return { ...progress, coins: progress.coins - item.price, owned: [...progress.owned, itemId] };
}

export function spend(progress, amount) {
  if (progress.coins < amount) throw new Error("Not enough coins");
  return { ...progress, coins: progress.coins - amount };
}
