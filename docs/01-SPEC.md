# 01 · Specification

## Goal

An original browser game in the fashion styling genre: dress a model for a themed show against
the clock, walk the runway, get scored by judges, earn coins and grow a wardrobe. Desktop and
mobile, no install, no dependencies, Vietnamese UI.

## Game loop

Career map → show brief → studio (dress before the timer ends) → runway walk → judges reveal
scores one by one → result (stars, coins, feedback) → next show, retry, or shop.

## Functional requirements

| ID    | Requirement |
|-------|-------------|
| FR-1  | A paper-doll model with skin tone, hair colour, eye colour, lipstick and blush settings. |
| FR-2  | 11 wardrobe slots; a dress replaces top + bottom and the other way round; tapping a worn item takes it off (hair can't be removed). |
| FR-3  | Every item (except hair) comes in a set of colours chosen with swatches. |
| FR-4  | 12 shows, each with: main and secondary styles, styles to avoid, a colour palette, must-have slots, a trending item, suitable lipsticks, a time limit and a star requirement. |
| FR-5  | Three judges score 0–10 with different priorities (style, colour, details); total out of 30; 17 / 22 / 26 = 1 / 2 / 3 stars. |
| FR-6  | The runway can't start until the model is dressed (top + bottom or a dress). When time runs out she walks anyway; if undressed, the assistant adds a tee and jeans. |
| FR-7  | Results show stars, total, a breakdown (style, colour, complete, accessories), coins earned, new best, rank-up, unlocks and up to three specific tips. |
| FR-8  | Coins: paid for each show, each star, and a bonus for stars earned for the first time. Spent on items (bought from the wardrobe, then worn) and stylist tips (15 coins: applies the single change that raises the score most). |
| FR-9  | Show *n* opens when show *n−1* has a star and the total stars reach the show's requirement. 6 ranks from 0 to 36 stars. |
| FR-10 | Free dressing room: whole owned wardrobe, random outfit, no timer, look saved. |
| FR-11 | Save a look as a PNG photo (from the free room or the result screen). |
| FR-12 | Progress, appearance, free look, sound and music settings persist on the device. |

## Non-functional requirements

| ID    | Requirement |
|-------|-------------|
| NFR-1 | Zero runtime dependencies, no build step, static hosting. |
| NFR-2 | Original name, characters, items, art and music. |
| NFR-3 | Every show is provably winnable with 3 stars; a full career is provably finishable from the starter wardrobe without replays. |
| NFR-4 | Phone portrait layout: doll on top, wardrobe below. |
| NFR-5 | Corrupt or old saved data never breaks the game. |
