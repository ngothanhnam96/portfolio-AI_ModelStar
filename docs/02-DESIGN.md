# 02 · Design

## Architecture

```text
src/main.js  (screens, studio, timer, runway sequence, results, photo)
   ├── src/ui/    doll (SVG strings) · audio · storage · analytics
   └── src/core/  pure, no DOM, unit-tested
         palette ── catalog ── look ── scoring ── stylist
                       shows ───────┘      career
```

Looks and progress are plain data and never mutated: `equip(look, id, color)` returns a new look.
`doll.js` builds SVG markup strings, so the art is tested in Node too.

## Scoring

Each part is 0–1.

| Part | How |
|------|-----|
| **style** | Weighted average of each worn item's fit (dress 3, top/bottom 1.5, outer/shoes 1.2, hair 1, bag/hat 0.6, jewellery/glasses 0.4). Fit = best matching style weight + 0.25 × the second, capped at 1; clothing with an avoided style scores −0.6 (hair never does). |
| **color** | 0.45 × harmony + 0.35 × share in the show's palette (neutrals count half) + 0.2 × accent (a non-neutral palette colour is worn). Harmony: one colour or neighbours ≤ 50° = 1, complementary ≥ 150° = 0.9, other pairs 0.7, three colours 0.9 if within 70° else 0.55, four or more 0.35–0.7. |
| **complete** | Share of: dressed, shoes, each must-have slot. |
| **detail** | 0.8 × accessory count curve (fitting ones: 0, 0.5, 0.85, 1, 0.9, 0.75) + 0.2 × lipstick fits − 0.25 per clashing accessory. |
| **trend** | 1 if the show's trending item is worn. |

| Judge | style | color | complete | detail | trend |
|-------|-------|-------|----------|--------|-------|
| ✂️ Cô Vy | 0.6 | 0.2 | 0.2 | | |
| 📷 Anh Khoa | 0.25 | 0.55 | 0.2 | | |
| 📱 Bé Mây | 0.35 | 0.1 | 0.1 | 0.3 | 0.15 |

Judge score = 10 × weighted sum (× 0.4 if not dressed). Total = sum of the three.

## Economy

| | Coins |
|---|---|
| Start | 60 |
| Each show walked | 20 |
| Each star | 15 |
| Each star earned for the first time | +40 |
| Stylist tip | −15 |
| Items | 0 (starter, 16 items) to 240 (evening gown) |

## Shows

| # | Show | Main style | Must-have | Trend | Time | Stars needed |
|---|------|-----------|-----------|-------|------|--------------|
| 1 | Ngày đầu đến trường | cute | bag | backpack | 2:30 | 0 |
| 2 | Dạo biển mùa hè | beach | | sun hat | 2:30 | 0 |
| 3 | Buổi phỏng vấn đầu tiên | office | | blazer | 2:20 | 0 |
| 4 | Chạy bộ công viên | sporty | | cap | 2:10 | 0 |
| 5 | Cà phê cuối tuần | street | bag | crossbody bag | 2:10 | 1 |
| 6 | Mùa đông cao nguyên | cozy | outerwear | scarf | 2:10 | 3 |
| 7 | Tết sum vầy | traditional | | nón lá | 2:00 | 5 |
| 8 | Lễ hội âm nhạc | street | | sunglasses | 2:00 | 7 |
| 9 | Tiệc sinh nhật bạn thân | party | | tutu | 1:55 | 10 |
| 10 | Vũ hội cổ tích | fairy | | tiara | 1:50 | 13 |
| 11 | Thảm đỏ lễ trao giải | party + elegant | earrings | clutch | 1:45 | 16 |
| 12 | Chung kết Siêu Mẫu | elegant | earrings, necklace | evening gown | 1:40 | 20 |

All shows also need shoes.

## Stylist

`bestMove` tries every single change (any owned item in any colour in any slot, removing an
accessory, or a lipstick) and returns the one that raises the total most without undressing the
model. `bestLook` hill-climbs with it twice (from a dress and from separates) and keeps the
better. The game sells it as a tip; the tests use it to prove every show can be won.

## Art

- **Tall anime style**: slim fashion proportions, large sparkly anime eyes (layered iris, two
  highlights, lash flick, blush strokes), the bangs' shadow on the forehead, and anime hair:
  a back mass with pointed strand tips, spiky bangs, face-framing locks, strand lines and a glossy
  halo highlight.
- **Soft shading**: clothes, hair and skin are filled with linear gradients (light from the upper
  left). Each render collects the gradients it needs into its own `<defs>` with ids unique to
  that picture, so dozens of dolls and thumbnails can share a page. Strokes use the flat colour
  (a gradient on a zero-height line would not render).
- Everything is drawn in one "body space" (a fashion-doll figure, 200 × 420, centre x = 100), then
  the head layers (head, face, hair, hat, earrings, glasses) are scaled × 1.14 around the chin and
  the body layers (body, clothes, shoes, bag, necklace) are slimmed × 0.95 around the neck.
  Clothes keep fitting because they scale with the body. Final viewBox 200 × 428.
- **Backgrounds** (`src/ui/backdrops.js`): six illustrated scenes (bedroom, boutique, garden,
  beach, night street, photo studio), SVG 400 × 300 cropped to fill. Each show has its own; the
  free room lets the player choose; photos are drawn on top of the chosen scene.

## Studio UX

- The stage shows the model full length in the scene; a tool rail on the right holds undo
  (also Ctrl+Z, 40 steps), search (diacritics-insensitive, by item name or style), saved outfits
  (6, re-validated against the wardrobe when worn or loaded), background (free room), take
  everything off, the stylist tip (career) and random outfit (free room). The big pill button walks
  the runway (career) or takes a photo (free room).
- The wardrobe has two rows of category tabs (a green dot marks a worn slot) and a grid of cards:
  number, picture, rarity hearts by price (free ♥, ≤ 70 ♥♥, ≤ 130 ♥♥♥, more ♥♥♥♥), name, style
  icons, a check on the worn item, a lock with the price on items still in the shop.
- Left-side shapes are written once and mirrored (`mirror()` flips x in M/L/Q/C paths).
- Layers: bag (back) → hair (back) → body → face → plain slip → [shoes under floor-length
  clothes] → bottom → shoes → top → dress → outerwear → necklace → bag → hair (front) → earrings →
  glasses → hat.
- Each item takes its colour plus a darker shade, a lighter shade and an outline derived from it.
- Wardrobe thumbnails reuse the same art, cropped to the slot with a faint silhouette.

## Runway

CSS animation: the model walks from the back of the catwalk (scale 0.42) to the front, with a step
sway, spotlights and random camera flashes; then applause, and the judges' cards turn over one by
one. A click skips ahead.
