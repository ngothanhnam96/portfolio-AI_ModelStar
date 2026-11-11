# 04 · Testing

`npm test` runs `node --test`: 52 tests in about 6 seconds, no dependencies.

## Suites

| Suite | What it proves |
|-------|----------------|
| `palette.test.js` | Unique colours, hue distance wraps, harmony ranks monochrome/analogous > complementary > clashes, shade maths |
| `catalog.test.js` | Unique ids, valid slots/tags/colours/prices, every item has art and no art lacks an item, ≥ 3 items per slot, the starter wardrobe can dress the model |
| `look.test.js` | Basic look, dress ⇄ separates, toggle off (not hair), colours (default, explicit, recolour, invalid), looks never mutated |
| `scoring.test.js` | Item fit (second tag, avoided tags, hair never a misstep), on-theme beats off-theme, colour clash, accent, completeness, details and lipstick, trend, undressed penalty, judge and star ranges, specific tips, determinism |
| `shows.test.js` | 12 valid shows, each trend item suits its show, the career gets harder, judge weights sum to 1, ranks |
| `career.test.js` | New career, unlock rules, pay (first-time star bonus only once), stars never go down, rank-ups, buying, restoring junk saves |
| `stylist.test.js` | Moves use only owned items, the hint always raises the score and never undresses, áo dài for Tết |
| `proof.test.js` | **Every show 3★ with the full wardrobe; a full career from scratch with earned coins, no replays**; tee + jeans never 3★; the last shows need the shop |
| `backdrops.test.js` | Every background is well-formed and fills its box; every show has one; gradient ids never repeat across pictures |
| `doll.test.js` | Mirror maths; every item in every colour renders well-formed SVG containing that colour; every item looks different; body options show; floor-length clothes over shoes; thumbnails cropped per slot; gradients defined once per render with ids unique to each picture, thumbnail gradients inside their own `<svg>` |

## Browser end-to-end check (v0.1.0)

Headless Edge over the DevTools protocol, using real button clicks and the `?debug` hook
(`window.__ms`: state, `setTime`, `evaluate`):

| Check | Result |
|-------|--------|
| Home, help, career map; a locked show explains why | ✅ |
| Brief → studio; dress for show 1 (skirt, blouse in pink, flats, backpack, studs, lipstick, hair colour) | ✅ |
| Stylist tip: −15 coins, one change applied, toast | ✅ |
| Walk button disabled when undressed | ✅ |
| Runway, judges, result 28.2/30 ★★★, +185 coins, show 2 unlocked | ✅ |
| Buy the sun hat (−60 coins) and wear it | ✅ |
| Time runs out → walks automatically → result | ✅ |
| Free room: random outfit, photo saved | ✅ |
| Reload keeps coins, stars and the free look | ✅ |
| Phone 390 × 844: home, career, brief, studio, runway, result | ✅ |
| Console errors | none |

## Tuning found by the proofs and the playthrough

| Problem | Fix |
|---------|-----|
| An all-white outfit had perfect colour everywhere | Accent rule: the photographer wants one colour from the theme's palette |
| An undressed model still scored ~16/30 | All judge scores × 0.4 when not dressed |
| The stylist "put on" the T-shirt the model already wore, which took it off | Equip with an explicit colour |
| A bob haircut carried over from free play counted as an office misstep at the beach | Hairstyles can only help, never count as a misstep |
| The career proof took 38 s | The simulated shopper only looks at items that suit the show and restyles from the current best look (3 s) |
