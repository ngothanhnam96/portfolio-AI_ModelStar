/** Model Star: screens, studio, runway and results. Game rules live in src/core. */

import { ITEMS, SLOTS, STYLES, SKIN_TONES, HAIR_COLORS, EYE_COLORS, LIPS, itemById, slotById } from "./core/catalog.js";
import { COLORS, colorById } from "./core/palette.js";
import { basicLook, createLook, equip, isCovered, recolor } from "./core/look.js";
import { SHOWS, JUDGES, rankFor } from "./core/shows.js";
import { evaluate } from "./core/scoring.js";
import { bestMove, applyMove } from "./core/stylist.js";
import {
  HINT_COST, applyResult, buy, isUnlocked, lockReason, restoreProgress, spend, totalStars,
} from "./core/career.js";
import { dollSVG, thumbSVG } from "./ui/doll.js";
import { BACKDROPS, SHOW_BACKDROP, backdropSVG } from "./ui/backdrops.js";
import { sfx, playMusic, stopMusic, setMuted, setMusic, isMuted, isMusicOn } from "./ui/audio.js";
import { load, save } from "./ui/storage.js";
import { initAnalytics, track } from "./ui/analytics.js";

const $ = (id) => document.getElementById(id);
const DEBUG = new URLSearchParams(location.search).has("debug");

const BODY_KEYS = ["skin", "hairColor", "eyes", "lips", "blush"];
const MAX_OUTFITS = 6;

/** 1–4 hearts by price: how rare (and how dazzling) an item is. */
const rarity = (item) => (item.price === 0 ? 1 : item.price <= 70 ? 2 : item.price <= 130 ? 3 : 4);
/** Lower-case, no Vietnamese diacritics: "Áo dài" → "ao dai". */
const fold = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase();

let progress = restoreProgress(load("progress", null));
let bodySettings = restoreBody(load("body", null));
let freeLook = restoreLook(load("free-look", null), bodySettings);

/** "career" while dressing for a show, "free" in the free dressing room. */
let mode = null;
let showIndex = 0;
let look = freeLook;
let tab = "hair";
let timeLeft = 0;
let timerId = null;
let lastTick = 0;
let lastResult = null;
let skipRunway = false;
let runwayToken = 0;
/** Studio conveniences: undo history, search, saved outfits, chosen background (free mode). */
let history = [];
let searching = false;
let query = "";
let backdrop = BACKDROPS.some((b) => b.id === load("backdrop", "")) ? load("backdrop", "") : "bedroom";
/** Saved outfits, re-validated: unknown or unaffordable items are dropped on load. */
let outfits = (Array.isArray(load("outfits", null)) ? load("outfits", []) : [])
  .filter((o) => o && typeof o.name === "string" && o.look && typeof o.look.items === "object")
  .slice(0, MAX_OUTFITS)
  .map((o) => ({ name: o.name.slice(0, 20), look: restoreLook(o.look, bodySettings) }));
const MAX_HISTORY = 40;

// Restoring saved data -------------------------------------------------------------------------------

function restoreBody(saved) {
  const base = createLook();
  const out = Object.fromEntries(BODY_KEYS.map((k) => [k, base[k]]));
  if (!saved || typeof saved !== "object") return out;
  if (SKIN_TONES.includes(saved.skin)) out.skin = saved.skin;
  if (HAIR_COLORS.some((h) => h.id === saved.hairColor)) out.hairColor = saved.hairColor;
  if (EYE_COLORS.includes(saved.eyes)) out.eyes = saved.eyes;
  if (LIPS.some((l) => l.id === saved.lips)) out.lips = saved.lips;
  if (typeof saved.blush === "boolean") out.blush = saved.blush;
  return out;
}

function restoreLook(saved, body) {
  if (!saved || typeof saved !== "object" || !saved.items) return basicLook(body);
  let out = createLook(body);
  for (const entry of Object.values(saved.items)) {
    try {
      if (!progress.owned.includes(entry.id)) continue;
      out = equip(out, entry.id, itemById(entry.id).colors ? entry.color : undefined);
    } catch {
      /* skip anything stale */
    }
  }
  return isCovered(out) ? out : basicLook(body);
}

function persist() {
  save("progress", progress);
  save("body", bodySettings);
  save("free-look", freeLook);
}

// Screens and HUD ------------------------------------------------------------------------------------

function setScreen(name) {
  document.body.dataset.screen = name;
  playMusic(name === "runway" ? "runway" : name === "studio" ? "studio" : "home");
  window.scrollTo(0, 0);
}

function updateHud() {
  const stars = totalStars(progress);
  $("stars").textContent = stars;
  $("coins").textContent = progress.coins;
  $("rank").textContent = rankFor(stars).name;
}

function toast(message, ms = 2400) {
  const el = $("toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    el.hidden = true;
  }, ms);
}

function openPanel(html, { onClose } = {}) {
  $("panel").innerHTML = html;
  $("overlay").hidden = false;
  openPanel.onClose = onClose ?? null;
  $("panel").querySelector("button")?.focus({ preventScroll: true });
}

function closePanel() {
  $("overlay").hidden = true;
  const cb = openPanel.onClose;
  openPanel.onClose = null;
  cb?.();
}

const starString = (n) => "★".repeat(n) + "☆".repeat(3 - n);

// Home --------------------------------------------------------------------------------------------------

function showHome() {
  stopTimer();
  mode = null;
  $("home-doll").innerHTML = dollSVG(freeLook);
  $("home-bg").innerHTML = backdropSVG(backdrop);
  setScreen("home");
}

function showHelp() {
  openPanel(`
    <h2>Cách chơi</h2>
    <ol class="help">
      <li><b>Chọn một show</b> trong Lịch diễn và đọc kỹ đề bài: phong cách, bảng màu và món đồ bắt buộc.</li>
      <li><b>Phối đồ</b> trước khi hết giờ. Chạm một món để mặc, chạm lần nữa để cởi. Chọn màu ở hàng màu bên dưới.</li>
      <li><b>Lên sàn diễn</b>. Ba giám khảo chấm tối đa 10 điểm mỗi người:
        <ul>
          <li>✂️ <b>Cô Vy</b> xem phong cách có đúng chủ đề không.</li>
          <li>📷 <b>Anh Khoa</b> mê màu sắc hài hòa và đúng bảng màu.</li>
          <li>📱 <b>Bé Mây</b> để ý phụ kiện, son môi và món đồ đang hot.</li>
        </ul>
      </li>
      <li><b>17 điểm = 1 ⭐, 22 = 2 ⭐, 26 = 3 ⭐.</b> Sao mới mở show tiếp theo và cho nhiều xu.</li>
      <li><b>Dùng xu</b> mua đồ mới ngay trong tủ đồ, hoặc hỏi 💡 Stylist một gợi ý (15 xu).</li>
    </ol>
    <p class="muted">Mẹo: 1–2 màu nổi cùng màu trung tính (trắng, đen, xám, be, nâu) luôn an toàn. Đồ "lạc đề" bị trừ điểm nặng!</p>
    <div class="panel-buttons"><button class="btn primary" data-close>Đã hiểu</button></div>`);
}

// Career map ---------------------------------------------------------------------------------------------

function showCareer() {
  stopTimer();
  mode = null;
  const stars = totalStars(progress);
  const rank = rankFor(stars);
  $("career-rank").textContent = `${rank.name} · ${stars}/36 ⭐`;
  $("shows").innerHTML = SHOWS.map((show, i) => {
    const unlocked = isUnlocked(progress, i);
    const got = progress.stars[show.id] ?? 0;
    const best = progress.best[show.id];
    return `<li><button class="show-card${unlocked ? "" : " locked"}" data-show="${i}" style="--a:${show.stage[0]};--b:${show.stage[1]}" ${unlocked ? "" : 'aria-disabled="true"'}>
      <span class="show-num">${i + 1}</span>
      <span class="show-icon" aria-hidden="true">${unlocked ? show.icon : "🔒"}</span>
      <span class="show-name">${show.name}</span>
      <span class="show-stars" aria-label="${got} sao">${starString(got)}</span>
      <span class="show-best">${unlocked ? (best !== undefined ? `Kỷ lục ${best}/30` : "Chưa diễn") : lockReason(progress, i)}</span>
    </button></li>`;
  }).join("");
  setScreen("career");
}

function openBrief(index, { inStudio = false } = {}) {
  const show = SHOWS[index];
  const played = (progress.stars[show.id] ?? 0) >= 1;
  const trend = itemById(show.trend);
  const styles = Object.entries(show.styles).sort((a, b) => b[1] - a[1])
    .map(([tag, w]) => `<span class="chip${w >= 1 ? " strong" : ""}">${STYLES[tag].icon} ${STYLES[tag].name}</span>`).join("");
  const avoid = show.avoid.map((tag) => `<span class="chip no">${STYLES[tag].icon} ${STYLES[tag].name}</span>`).join("");
  const colors = show.colors.map((id) => `<span class="dot" style="background:${colorById(id).hex}" title="${colorById(id).name}"></span>`).join("");
  const needs = ["shoes", ...show.needs.filter((s) => s !== "shoes")].map((s) => `${slotById(s).icon} ${slotById(s).name}`).join(" · ");
  const trendText = played
    ? `Bé Mây đang mê <b>${trend.name}</b>.`
    : `Bé Mây đang mê một món trong mục <b>${slotById(trend.slot).name}</b>… 👀`;
  openPanel(`
    <div class="brief" style="--a:${show.stage[0]};--b:${show.stage[1]}">
      <p class="eyebrow">Show ${index + 1} · ${Math.floor(show.time / 60)}:${String(show.time % 60).padStart(2, "0")} phút thay đồ</p>
      <h2>${show.icon} ${show.name}</h2>
      <p>${show.brief}</p>
    </div>
    <dl class="brief-list">
      <dt>Phong cách</dt><dd>${styles}</dd>
      <dt>Tránh</dt><dd>${avoid}</dd>
      <dt>Bảng màu</dt><dd class="dots">${colors}</dd>
      <dt>Bắt buộc</dt><dd>👗 Áo + quần/váy hoặc đầm · ${needs}</dd>
      <dt>Xu hướng</dt><dd>${trendText}</dd>
    </dl>
    <div class="panel-buttons">
      ${inStudio ? '<button class="btn primary" data-close>Tiếp tục thay đồ</button>' : `<button class="btn primary" data-start="${index}">✨ Vào phòng thay đồ</button><button class="btn ghost" data-close>Để sau</button>`}
    </div>`);
}

// Studio ---------------------------------------------------------------------------------------------------

function startShow(index) {
  closePanel();
  mode = "career";
  showIndex = index;
  const show = SHOWS[index];
  look = { ...basicLook(bodySettings), items: { ...basicLook(bodySettings).items, hair: freeLook.items.hair } };
  tab = "top";
  timeLeft = show.time;
  track("modelstar/show-start");
  enterStudio();
  startTimer();
}

function startFree() {
  mode = "free";
  look = freeLook;
  tab = "hair";
  stopTimer();
  track("modelstar/free");
  enterStudio();
}

function enterStudio() {
  document.body.dataset.mode = mode;
  history = [];
  closeSearch();
  if (mode === "career") {
    const show = SHOWS[showIndex];
    $("brief-btn").innerHTML = `<span aria-hidden="true">${show.icon}</span> ${show.name} <small>📋 Đề bài</small>`;
    $("brief-btn").disabled = false;
    $("stage-bg").innerHTML = backdropSVG(SHOW_BACKDROP[show.id], { snow: show.id === "winter" });
  } else {
    $("brief-btn").innerHTML = '<span aria-hidden="true">🪞</span> Phòng thay đồ tự do';
    $("brief-btn").disabled = true;
    $("stage-bg").innerHTML = backdropSVG(backdrop);
  }
  updateTimer();
  renderStudio();
  setScreen("studio");
}

function setLook(next, { record = true } = {}) {
  if (record && next !== look) {
    history.push(look);
    if (history.length > MAX_HISTORY) history.shift();
  }
  look = next;
  for (const key of BODY_KEYS) bodySettings[key] = look[key];
  if (mode === "free") freeLook = look;
  else freeLook = { ...freeLook, ...Object.fromEntries(BODY_KEYS.map((k) => [k, look[k]])), items: { ...freeLook.items, hair: look.items.hair } };
  persist();
  renderStudio();
}

function renderStudio() {
  $("doll-wrap").innerHTML = dollSVG(look);
  const tabs = [{ id: "body", name: "Trang điểm", icon: "💄" }, ...SLOTS];
  $("tabs").innerHTML = tabs.map((t) => {
    const wearing = t.id !== "body" && look.items[t.id];
    const active = !searching && t.id === tab;
    return `<button role="tab" class="tab${active ? " active" : ""}${wearing ? " wearing" : ""}" data-tab="${t.id}" aria-selected="${active}" title="${t.name}"><span aria-hidden="true">${t.icon}</span><span class="tab-name">${t.name}</span></button>`;
  }).join("");
  const walk = $("walk-btn");
  walk.disabled = !isCovered(look);
  walk.title = isCovered(look) ? "Lên sàn diễn (Enter)" : "Cần mặc áo + quần/váy hoặc một chiếc đầm";
  $("undo-btn").disabled = history.length === 0;
  $("search-btn").classList.toggle("active", searching);
  if (searching) renderSearch();
  else if (tab === "body") renderBodyTab();
  else renderSlotTab();
}

/** One wardrobe card: picture, number, name, rarity hearts, worn check, lock with price. */
function itemCard(item, index) {
  const owned = progress.owned.includes(item.id);
  const worn = look.items[item.slot];
  const on = worn?.id === item.id;
  const color = on ? worn.color : item.color;
  const hearts = "♥".repeat(rarity(item));
  return `<button class="item${on ? " on" : ""}${owned ? "" : " locked"}" data-item="${item.id}" aria-pressed="${on}" title="${item.name}">
    <span class="item-num">${index + 1}</span>
    ${on ? '<span class="item-check" aria-label="Đang mặc">✓</span>' : ""}
    <span class="item-pic">${thumbSVG(item.id, color, look)}</span>
    <span class="item-hearts r${rarity(item)}" aria-label="Độ hiếm ${rarity(item)}">${hearts}</span>
    <span class="item-name">${item.name}</span>
    <span class="item-tags" aria-hidden="true">${item.tags.map((t) => STYLES[t].icon).join("")}</span>
    ${owned ? "" : `<span class="price">🔒 ${item.price} 🪙</span>`}
  </button>`;
}

function renderSearch() {
  const q = fold(query.trim());
  const found = q ? ITEMS.filter((item) => fold(item.name).includes(q) || item.tags.some((t) => fold(STYLES[t].name).includes(q))) : [];
  $("tab-title").innerHTML = q ? `🔍 ${found.length} kết quả` : "🔍 Gõ tên món đồ hoặc phong cách (vd: váy, dạ tiệc)";
  $("items").innerHTML = found.length
    ? found.map(itemCard).join("")
    : q ? '<p class="empty">Không tìm thấy món nào. Thử từ khác nhé!</p>' : "";
  $("swatches").innerHTML = '<span class="muted">Chọn một mục ở trên để đổi màu</span>';
}

function renderSlotTab() {
  const slot = slotById(tab);
  const worn = look.items[tab];
  $("tab-title").innerHTML = `${slot.icon} ${slot.name}${slot.required ? "" : ' <span class="muted">· chạm lần nữa để bỏ</span>'}`;
  $("items").innerHTML = ITEMS.filter((item) => item.slot === tab).map(itemCard).join("");

  if (tab === "hair") {
    $("swatches").innerHTML = HAIR_COLORS.map((h) =>
      `<button class="swatch${look.hairColor === h.id ? " on" : ""}" data-hair="${h.id}" style="background:${h.hex}" aria-label="Màu tóc ${h.id}"></button>`).join("");
    return;
  }
  const item = worn ? itemById(worn.id) : null;
  $("swatches").innerHTML = item?.colors
    ? item.colors.map((id) => {
      const c = colorById(id);
      return `<button class="swatch${worn.color === id ? " on" : ""}" data-color="${id}" style="background:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`;
    }).join("")
    : `<span class="muted">${worn ? "" : "Chọn một món để đổi màu"}</span>`;
}

function renderBodyTab() {
  $("tab-title").innerHTML = "💄 Ngoại hình và trang điểm";
  const row = (label, html) => `<div class="body-row"><span class="body-label">${label}</span><div class="body-options">${html}</div></div>`;
  $("items").innerHTML = [
    row("Màu da", SKIN_TONES.map((hex) => `<button class="swatch${look.skin === hex ? " on" : ""}" data-skin="${hex}" style="background:${hex}" aria-label="Màu da"></button>`).join("")),
    row("Màu tóc", HAIR_COLORS.map((h) => `<button class="swatch${look.hairColor === h.id ? " on" : ""}" data-hair="${h.id}" style="background:${h.hex}" aria-label="Màu tóc"></button>`).join("")),
    row("Màu mắt", EYE_COLORS.map((hex) => `<button class="swatch${look.eyes === hex ? " on" : ""}" data-eyes="${hex}" style="background:${hex}" aria-label="Màu mắt"></button>`).join("")),
    row("Son môi", LIPS.map((l) => `<button class="swatch lip${look.lips === l.id ? " on" : ""}" data-lips="${l.id}" style="background:${l.hex}" title="${l.name}" aria-label="Son ${l.name}"></button>`).join("")),
    row("Má hồng", `<button class="btn small" data-blush>${look.blush ? "🌸 Đang bật" : "Tắt"}</button>`),
  ].join("");
  $("swatches").innerHTML = "";
}

function onItem(itemId) {
  const item = itemById(itemId);
  if (!progress.owned.includes(itemId)) {
    offerBuy(item);
    return;
  }
  const wasOn = look.items[item.slot]?.id === itemId;
  const next = equip(look, itemId);
  if (next === look) return;
  if (wasOn) sfx.remove();
  else sfx.equip();
  if (!wasOn && item.slot === "dress" && (look.items.top || look.items.bottom)) toast("Đầm thay cho áo và quần/váy");
  setLook(next);
}

function offerBuy(item) {
  const enough = progress.coins >= item.price;
  const tags = item.tags.map((t) => `<span class="chip">${STYLES[t].icon} ${STYLES[t].name}</span>`).join("");
  openPanel(`
    <div class="buy">
      <div class="buy-thumb">${thumbSVG(item.id, item.color, look)}</div>
      <div>
        <h2>${item.name}</h2>
        <p>${tags}</p>
        <p class="price-big">🪙 ${item.price}</p>
        ${enough ? "" : `<p class="muted">Bạn còn ${progress.coins} xu. Diễn thêm để kiếm xu nhé!</p>`}
      </div>
    </div>
    <div class="panel-buttons">
      ${enough ? `<button class="btn primary" data-buy="${item.id}">Mua và mặc thử</button>` : ""}
      <button class="btn ghost" data-close>${enough ? "Để sau" : "Đóng"}</button>
    </div>`);
}

function doBuy(itemId) {
  try {
    progress = buy(progress, itemId);
  } catch {
    sfx.wrong();
    return;
  }
  sfx.buy();
  track("modelstar/buy");
  closePanel();
  updateHud();
  toast(`Đã mua ${itemById(itemId).name}!`);
  setLook(equip(look, itemId));
}

function askStylist() {
  const show = SHOWS[showIndex];
  if (progress.coins < HINT_COST) {
    sfx.wrong();
    toast(`Stylist cần ${HINT_COST} xu cho một lời khuyên.`);
    return;
  }
  const move = bestMove(look, show, progress.owned);
  if (!move) {
    toast("Stylist: Bộ này đã rất ổn với tủ đồ hiện tại rồi! 👌");
    return;
  }
  progress = spend(progress, HINT_COST);
  updateHud();
  sfx.hint();
  let text;
  if (move.slot === "lips") text = `đổi son sang ${LIPS.find((l) => l.id === move.id).name}`;
  else if (move.id === null) text = `bỏ ${itemById(look.items[move.slot].id).name}`;
  else text = `thử ${itemById(move.id).name}${move.color ? ` màu ${colorById(move.color).name.toLowerCase()}` : ""}`;
  toast(`💡 Stylist: ${text}!`, 3200);
  tab = move.slot === "lips" ? "body" : move.slot;
  setLook(applyMove(look, move));
}

// Tools ------------------------------------------------------------------------------------------------------

function undo() {
  const previous = history.pop();
  if (!previous) return;
  sfx.remove();
  setLook(previous, { record: false });
}

function openSearch() {
  searching = true;
  query = "";
  $("search").hidden = false;
  $("search").value = "";
  renderStudio();
  $("search").focus();
}

function closeSearch() {
  searching = false;
  query = "";
  $("search").hidden = true;
}

function clearAll() {
  if (Object.keys(look.items).length <= 1) return;
  sfx.remove();
  setLook(createLook({ ...Object.fromEntries(BODY_KEYS.map((k) => [k, look[k]])), items: { hair: look.items.hair } }));
  toast("Đã cởi hết đồ. Chọn áo + quần/váy hoặc một chiếc đầm nhé!");
}

function showOutfits() {
  const cards = outfits.map((o, i) => `
    <div class="outfit">
      <div class="outfit-pic">${dollSVG(o.look)}</div>
      <b>${o.name}</b>
      <div class="outfit-buttons"><button class="btn small primary" data-wear="${i}">Mặc</button><button class="btn small ghost" data-forget="${i}" aria-label="Xóa ${o.name}">🗑</button></div>
    </div>`).join("");
  openPanel(`
    <h2>👗 Bộ đồ đã lưu</h2>
    <p class="muted">Lưu tối đa ${MAX_OUTFITS} bộ để mặc lại bằng một chạm. Món chưa mua sẽ được bỏ qua.</p>
    <div class="outfits">${cards || '<p class="empty">Chưa có bộ nào.</p>'}</div>
    <div class="panel-buttons">
      <button class="btn primary" data-save-outfit ${isCovered(look) ? "" : "disabled"}>💾 Lưu bộ đang mặc</button>
      <button class="btn ghost" data-close>Đóng</button>
    </div>`);
}

function saveOutfit() {
  if (!isCovered(look)) return;
  const used = new Set(outfits.map((o) => o.name));
  let n = 1;
  while (used.has(`Bộ ${n}`)) n += 1;
  const name = `Bộ ${n}`;
  outfits = [{ name, look: { ...look } }, ...outfits].slice(0, MAX_OUTFITS);
  save("outfits", outfits);
  sfx.buy();
  toast(`Đã lưu "${name}"`);
  showOutfits();
}

function wearOutfit(index) {
  const saved = outfits[index];
  if (!saved) return;
  const next = restoreLook({ items: saved.look.items }, Object.fromEntries(BODY_KEYS.map((k) => [k, look[k]])));
  closePanel();
  sfx.equip();
  setLook(next);
}

function forgetOutfit(index) {
  outfits = outfits.filter((_, i) => i !== index);
  save("outfits", outfits);
  showOutfits();
}

function showBackdrops() {
  openPanel(`
    <h2>🖼️ Chọn nền</h2>
    <div class="backdrops">${BACKDROPS.map((b) => `<button class="backdrop-card${b.id === backdrop ? " on" : ""}" data-backdrop="${b.id}">${backdropSVG(b.id)}<span>${b.icon} ${b.name}</span></button>`).join("")}</div>
    <div class="panel-buttons"><button class="btn ghost" data-close>Đóng</button></div>`);
}

function setBackdrop(id) {
  backdrop = id;
  save("backdrop", id);
  $("stage-bg").innerHTML = backdropSVG(id);
  sfx.color();
  closePanel();
}

/** Random outfit from the owned wardrobe (free mode). */
function randomOutfit() {
  const owned = (slot) => ITEMS.filter((i) => i.slot === slot && progress.owned.includes(i.id));
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const vivid = COLORS.filter((c) => !c.neutral && !c.metal).map((c) => c.id);
  const neutral = COLORS.filter((c) => c.neutral).map((c) => c.id);
  const theme = [pick(vivid), pick(neutral), pick(neutral)];
  const colorFor = (item) => {
    const options = item.colors.filter((c) => theme.includes(c));
    return options.length ? pick(options) : pick(item.colors);
  };
  let next = createLook({ ...bodySettings, items: { hair: { id: pick(owned("hair")).id, color: null } } });
  const dresses = owned("dress");
  if (dresses.length && Math.random() < 0.4) {
    const d = pick(dresses);
    next = equip(next, d.id, colorFor(d));
  } else {
    for (const slot of ["top", "bottom"]) {
      const it = pick(owned(slot));
      next = equip(next, it.id, colorFor(it));
    }
  }
  for (const slot of ["outer", "shoes", "bag", "hat", "earrings", "necklace", "glasses"]) {
    const list = owned(slot);
    const chance = slot === "shoes" ? 1 : slot === "outer" ? 0.35 : 0.45;
    if (list.length && Math.random() < chance) {
      const it = pick(list);
      next = equip(next, it.id, colorFor(it));
    }
  }
  sfx.equip();
  setLook(next);
}

// Timer ----------------------------------------------------------------------------------------------------

function startTimer() {
  stopTimer();
  lastTick = performance.now();
  timerId = setInterval(tickTimer, 200);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function tickTimer() {
  const now = performance.now();
  const dt = Math.min(0.5, (now - lastTick) / 1000);
  lastTick = now;
  if (document.hidden || mode !== "career") return;
  const before = Math.ceil(timeLeft);
  timeLeft = Math.max(0, timeLeft - dt);
  if (Math.ceil(timeLeft) !== before && timeLeft <= 10 && timeLeft > 0) sfx.tick();
  updateTimer();
  if (timeLeft <= 0) timeUp();
}

function updateTimer() {
  const show = SHOWS[showIndex];
  const total = mode === "career" ? show.time : 1;
  const left = Math.ceil(timeLeft);
  $("timer-text").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  $("timer-fill").style.transform = `scaleX(${mode === "career" ? timeLeft / total : 1})`;
  $("timer").classList.toggle("hurry", mode === "career" && timeLeft <= 15);
}

function timeUp() {
  stopTimer();
  closePanel();
  let next = look;
  if (!isCovered(next)) {
    if (!next.items.top) next = equip(next, "top-tee");
    if (!next.items.bottom) next = equip(next, "bottom-jeans");
    toast("Hết giờ! Trợ lý mặc vội áo thun và quần jean cho bạn…", 3000);
  } else {
    toast("Hết giờ! Lên sàn thôi!");
  }
  look = next;
  walkRunway();
}

// Runway and results ---------------------------------------------------------------------------------------

const sleep = (ms) => new Promise((resolve) => {
  const started = performance.now();
  const check = () => (skipRunway || performance.now() - started >= ms ? resolve() : setTimeout(check, 30));
  check();
});

async function walkRunway() {
  if (mode !== "career" || !isCovered(look)) return;
  stopTimer();
  const show = SHOWS[showIndex];
  const result = evaluate(look, show);
  lastResult = { result, look, show, index: showIndex };
  const token = ++runwayToken;
  skipRunway = false;

  const runway = $("runway");
  runway.style.setProperty("--a", show.stage[0]);
  runway.style.setProperty("--b", show.stage[1]);
  $("walker").innerHTML = dollSVG(look);
  $("walker").classList.remove("walking");
  void $("walker").offsetWidth; // restart the animation
  $("walker").classList.add("walking");
  $("judges").innerHTML = JUDGES.map((j) => `<div class="judge" data-judge="${j.id}"><span class="judge-icon" aria-hidden="true">${j.icon}</span><span class="judge-name">${j.name}</span><span class="judge-role">${j.role}</span><span class="judge-score">?</span></div>`).join("");
  setScreen("runway");

  for (let i = 0; i < 5; i += 1) {
    await sleep(500 + Math.random() * 300);
    if (token !== runwayToken) return;
    flash();
  }
  sfx.applause(1.4);
  await sleep(700);
  for (const { judge, score } of result.judges) {
    if (token !== runwayToken) return;
    const card = $("judges").querySelector(`[data-judge="${judge.id}"]`);
    card.classList.add("shown");
    card.querySelector(".judge-score").textContent = score.toFixed(1);
    sfx.score(score);
    await sleep(800);
  }
  if (token !== runwayToken) return;
  showResult();
}

function flash() {
  sfx.camera();
  const el = document.createElement("i");
  el.style.left = `${10 + Math.random() * 80}%`;
  el.style.top = `${20 + Math.random() * 50}%`;
  $("flashes").append(el);
  setTimeout(() => el.remove(), 600);
}

function showResult() {
  const { result, show, index } = lastResult;
  const wasUnlocked = isUnlocked(progress, index + 1);
  const outcome = applyResult(progress, show.id, result);
  progress = outcome.progress;
  persist();
  updateHud();
  track(`modelstar/stars-${result.stars}`);
  const nowUnlocked = isUnlocked(progress, index + 1);
  const titles = ["Chưa thuyết phục được giám khảo…", "Khá lắm!", "Tuyệt vời!", "Hoàn hảo! Siêu mẫu đây rồi!"];
  const parts = [
    ["Phong cách", result.parts.style],
    ["Màu sắc", result.parts.color],
    ["Đầy đủ", result.parts.complete],
    ["Phụ kiện", result.parts.detail],
  ].map(([name, v]) => `<div class="meter"><span>${name}</span><span class="bar"><i style="width:${Math.round(v * 100)}%"></i></span></div>`).join("");
  const news = [
    outcome.newBest ? "🏆 Kỷ lục mới cho show này!" : "",
    outcome.rankUp ? `🎉 Thăng hạng: <b>${outcome.rankUp.name}</b>` : "",
    !wasUnlocked && nowUnlocked ? `🔓 Mở khóa: <b>${SHOWS[index + 1].name}</b>` : "",
    result.parts.trend ? "📱 Bé Mây thích món đồ hot của bạn!" : "",
  ].filter(Boolean).map((t) => `<li>${t}</li>`).join("");
  const tips = result.tips.length && result.stars < 3
    ? `<h3>Nhận xét của giám khảo</h3><ul class="tips">${result.tips.map((t) => `<li>${t}</li>`).join("")}</ul>` : "";
  openPanel(`
    <div class="result">
      <p class="eyebrow">${show.icon} ${show.name}</p>
      <h2>${titles[result.stars]}</h2>
      <div class="result-stars" aria-label="${result.stars} sao">${[0, 1, 2].map((i) => `<span class="rs${i < result.stars ? " got" : ""}" style="--i:${i}">★</span>`).join("")}</div>
      <p class="total"><b>${result.total}</b> / 30 điểm · <span class="coins-won">+${outcome.coins} 🪙</span></p>
      <div class="meters">${parts}</div>
      ${news ? `<ul class="news">${news}</ul>` : ""}
      ${tips}
    </div>
    <div class="panel-buttons">
      ${nowUnlocked && index + 1 < SHOWS.length ? `<button class="btn primary" data-brief="${index + 1}">▶ Show tiếp theo</button>` : ""}
      <button class="btn${nowUnlocked ? "" : " primary"}" data-retry>🔁 Diễn lại</button>
      <button class="btn" data-photo>📸 Lưu ảnh</button>
      <button class="btn ghost" data-career>📋 Lịch diễn</button>
    </div>`, { onClose: showCareer });
  result.stars ? sfx.fanfare() : sfx.wrong();
  for (let i = 0; i < result.stars; i += 1) setTimeout(() => sfx.star(i), 500 + i * 350);
  if (index === SHOWS.length - 1 && result.stars >= 1 && outcome.newStars) {
    setTimeout(() => toast("👑 Bạn đã chinh phục đêm Chung kết! Hãy thử săn đủ 36 ⭐ nhé!", 4200), 1600);
  }
}

// Photo -----------------------------------------------------------------------------------------------------

async function savePhoto(photoLook, caption, colors, scene = backdrop, snow = false) {
  try {
    const W = 720;
    const H = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, colors[0]);
    bg.addColorStop(1, colors[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    const drawSvg = async (svg, x, y, w, h) => {
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        ctx.drawImage(img, x, y, w, h);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    await drawSvg(backdropSVG(scene, { snow }).replace("<svg ", `<svg width="${W}" height="${H}" `), 0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.ellipse(W / 2, H - 112, 210, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    await drawSvg(dollSVG(photoLook).replace("<svg ", '<svg width="440" height="942" '), (W - 440) / 2, 50, 440, 942);
    ctx.fillStyle = "rgba(40,20,40,0.78)";
    ctx.fillRect(0, H - 70, W, 70);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`✨ Model Star · ${caption}`, W / 2, H - 25);
    const link = document.createElement("a");
    link.download = "model-star.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    sfx.camera();
    track("modelstar/photo");
    toast("📸 Đã lưu ảnh!");
  } catch {
    toast("Không lưu được ảnh trên trình duyệt này.");
  }
}

// Wiring ------------------------------------------------------------------------------------------------------

function toggleSound() {
  setMuted(!isMuted());
  save("sound", !isMuted());
  $("sound-btn").textContent = isMuted() ? "🔇" : "🔊";
}

function toggleMusic() {
  setMusic(!isMusicOn());
  save("music", isMusicOn());
  $("music-btn").classList.toggle("off", !isMusicOn());
}

function wire() {
  document.addEventListener("pointerdown", () => sfx.unlock(), { once: true });
  $("home-btn").addEventListener("click", () => { closePanel(); runwayToken += 1; showHome(); });
  $("career-btn").addEventListener("click", () => { sfx.tap(); showCareer(); });
  $("free-btn").addEventListener("click", () => { sfx.tap(); startFree(); });
  $("help-btn").addEventListener("click", () => { sfx.tap(); showHelp(); });
  $("sound-btn").addEventListener("click", toggleSound);
  $("music-btn").addEventListener("click", toggleMusic);
  $("walk-btn").addEventListener("click", walkRunway);
  $("brief-btn").addEventListener("click", () => openBrief(showIndex, { inStudio: true }));
  $("hint-btn").addEventListener("click", askStylist);
  $("random-btn").addEventListener("click", randomOutfit);
  $("photo-btn").addEventListener("click", () => savePhoto(look, "Phòng thay đồ", ["#ffe7ef", "#f4d7ff"]));
  $("undo-btn").addEventListener("click", undo);
  $("search-btn").addEventListener("click", () => {
    sfx.tap();
    if (searching) {
      closeSearch();
      renderStudio();
    } else openSearch();
  });
  $("search").addEventListener("input", (e) => {
    query = e.target.value;
    renderSearch();
  });
  $("outfits-btn").addEventListener("click", () => { sfx.tap(); showOutfits(); });
  $("backdrop-btn").addEventListener("click", () => { sfx.tap(); showBackdrops(); });
  $("clear-btn").addEventListener("click", clearAll);
  $("runway").addEventListener("click", () => { skipRunway = true; });

  $("shows").addEventListener("click", (e) => {
    const card = e.target.closest("[data-show]");
    if (!card) return;
    const index = Number(card.dataset.show);
    if (!isUnlocked(progress, index)) {
      sfx.wrong();
      toast(`🔒 ${lockReason(progress, index)}`);
      return;
    }
    sfx.tap();
    openBrief(index);
  });

  $("tabs").addEventListener("click", (e) => {
    const t = e.target.closest("[data-tab]");
    if (!t) return;
    sfx.tap();
    tab = t.dataset.tab;
    closeSearch();
    renderStudio();
  });

  $("items").addEventListener("click", (e) => {
    const el = e.target.closest("button");
    if (!el) return;
    if (el.dataset.item) onItem(el.dataset.item);
    else onBodyOption(el);
  });

  $("swatches").addEventListener("click", (e) => {
    const el = e.target.closest("button");
    if (!el) return;
    if (el.dataset.color) {
      sfx.color();
      setLook(recolor(look, el.dataset.slot ?? tab, el.dataset.color));
    } else onBodyOption(el);
  });

  $("overlay").addEventListener("click", (e) => {
    if (e.target === $("overlay")) {
      if (!document.querySelector("#panel .result")) closePanel();
      return;
    }
    const el = e.target.closest("button");
    if (!el) return;
    if (el.hasAttribute("data-close")) closePanel();
    else if (el.dataset.start) startShow(Number(el.dataset.start));
    else if (el.dataset.buy) doBuy(el.dataset.buy);
    else if (el.hasAttribute("data-retry")) startShow(lastResult.index);
    else if (el.hasAttribute("data-career")) closePanel();
    else if (el.dataset.brief) { openPanel.onClose = null; showCareer(); openBrief(Number(el.dataset.brief)); }
    else if (el.hasAttribute("data-photo")) savePhoto(lastResult.look, `${lastResult.show.name} · ${lastResult.result.total}/30`, lastResult.show.stage, SHOW_BACKDROP[lastResult.show.id], lastResult.show.id === "winter");
    else if (el.dataset.wear) wearOutfit(Number(el.dataset.wear));
    else if (el.dataset.forget) forgetOutfit(Number(el.dataset.forget));
    else if (el.hasAttribute("data-save-outfit")) saveOutfit();
    else if (el.dataset.backdrop) setBackdrop(el.dataset.backdrop);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("overlay").hidden && !document.querySelector("#panel .result")) closePanel();
    else if (e.key === "Enter" && document.body.dataset.screen === "studio" && $("overlay").hidden && mode === "career") walkRunway();
    else if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z") && document.body.dataset.screen === "studio") {
      e.preventDefault();
      undo();
    } else if (e.target.matches?.("input")) return;
    else if (e.key === "m" || e.key === "M") toggleSound();
    else if (e.key === "n" || e.key === "N") toggleMusic();
  });
}

function onBodyOption(el) {
  const d = el.dataset;
  let next = look;
  if (d.skin) next = { ...look, skin: d.skin };
  else if (d.hair) next = { ...look, hairColor: d.hair };
  else if (d.eyes) next = { ...look, eyes: d.eyes };
  else if (d.lips) next = { ...look, lips: d.lips };
  else if ("blush" in d) next = { ...look, blush: !look.blush };
  else return;
  sfx.color();
  setLook(next);
}

// Start ----------------------------------------------------------------------------------------------------

setMuted(!load("sound", true));
setMusic(load("music", true));
$("sound-btn").textContent = isMuted() ? "🔇" : "🔊";
$("music-btn").classList.toggle("off", !isMusicOn());
wire();
updateHud();
showHome();
initAnalytics();

if (DEBUG) {
  window.__ms = {
    get state() {
      return { screen: document.body.dataset.screen, mode, showIndex, look, timeLeft, progress };
    },
    setLook,
    setTime(seconds) { timeLeft = seconds; updateTimer(); },
    setProgress(p) { progress = restoreProgress(p); persist(); updateHud(); },
    evaluate: () => evaluate(look, SHOWS[showIndex]),
    skip() { skipRunway = true; },
  };
}
