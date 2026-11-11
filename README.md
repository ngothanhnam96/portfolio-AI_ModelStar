# ✨ Model Star — Sàn Diễn Mơ Ước

An original fashion styling and runway game for the browser. Dress a tall anime model for 12 themed
shows, walk the catwalk under the camera flashes, and win over three judges, from
*Người mẫu tập sự* (trainee model) to *Huyền thoại thời trang* (fashion legend).

Zero dependencies, no build step, no image or sound files: the doll and all 59 items are drawn
in SVG by code, and the music is synthesised with WebAudio.

## How to play

1. **Pick a show** from the career map (school day, beach, job interview, jogging, café,
   highland winter, Tết, music festival, birthday party, fairy-tale ball, red carpet, the final).
2. **Read the brief**: the styles it wants and the ones to avoid, its colour palette, the
   must-have items and a hint about the trending item.
3. **Dress the model before time runs out**: 11 wardrobe slots (hair, top, bottom, dress,
   outerwear, shoes, bag, hat, earrings, necklace, glasses), each item in up to 16 colours, plus
   skin tone, hair colour, eye colour, lipstick and blush.
4. **Walk the runway.** Three judges score 0–10 each:
   - ✂️ **Cô Vy**, designer: does the style fit the theme?
   - 📷 **Anh Khoa**, photographer: do the colours go together and match the palette?
   - 📱 **Bé Mây**, fashion blogger: accessories, lipstick and the trending item.
5. **17 / 22 / 26 points out of 30 = 1 / 2 / 3 stars.** Stars unlock the next shows and pay
   coins; spend them on new clothes right in the wardrobe, or on a 💡 stylist tip.

The studio shows the model full length in an illustrated room, with a tool rail: **undo**,
**search** (by name or style, accents optional), **saved outfits** (up to 6), **background**
(bedroom, boutique, garden, beach, night street, photo studio), **take everything off**, the
**stylist** tip and a **random outfit**. Wardrobe cards show each item's rarity (♥–♥♥♥♥), a check
on what is worn and a lock with the price on what is still in the shop.

There is also a **free dressing room**, and every look can be saved as a PNG photo with its
background.

## Run it

```bash
npm start    # http://127.0.0.1:5173
npm test     # 52 tests, no dependencies
```

Requires Node 20+. Deploys to GitHub Pages on every push to `main` (see
[docs/05-DEPLOY.md](docs/05-DEPLOY.md)).

## What the tests prove

- **Every show can be won with 3 stars** using the full wardrobe (a hill-climbing stylist
  searches for the best look).
- **A whole career can be finished from scratch**: starting with the starter wardrobe and 60
  coins, a greedy player buys clothes with the coins it earns and wins at least one star at every
  show, in order, with no replays, reaching the stars the final requires.
- The plain tee + jeans never earns 3 stars anywhere, and the last shows need clothes from the shop.
- Every item renders well-formed SVG in every colour, and no two items look the same.

## Docs

| | |
|---|---|
| [01-SPEC](docs/01-SPEC.md) | Goal, game loop, requirements |
| [02-DESIGN](docs/02-DESIGN.md) | Architecture, scoring formula, economy, art |
| [03-TASKS](docs/03-TASKS.md) | Done and backlog |
| [04-TESTING](docs/04-TESTING.md) | Test suites, proofs, browser check |
| [05-DEPLOY](docs/05-DEPLOY.md) | Local, CI, GitHub Pages |

## Originality

Model Star is an original game in the dress-up / fashion-show genre. Its name, characters,
judges, shows, items, art and music were all made for this project; it does not use names,
characters or assets from any existing fashion game.

## License

[MIT](LICENSE)
