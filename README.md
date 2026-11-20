# Leonida Trophy Guide — GTA VI Platinum Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Kojeck86/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Kojeck86/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline, open-source guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze — 28 hidden, 0 online). No account, no network, no ads: open `app/index.html` from any static server and it works with the network off.

## What it does

- **Tracker** — a checklist over every trophy with its official name, description and grade. Progress saves in the browser (localStorage), with export to a file and import back. Counted trophies (250 stunts, 42 shooting-range golds, 18 meditations…) have steppers that tick the trophy off when the target is reached.
- **Filters** — by kind (story, missable, collectibles, activities, crime, odd ones), by grade, by free-text search, plus sort by roadmap order, grade or name, and a hide-earned switch.
- **Spoiler-safe mode** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to the Platinum** — six stages in play order (~200 hours, one playthrough), built from the official descriptions: story first, then Strangers & Freaks, activities, crime with your partner, collecting, and the 100% checklist.
- **Missables flagged** — exactly one trophy is flagged possibly missable: **Positive Mental Attitude** (meditate at all 18 spots; the first meditation, at Jason's house in Chapter 1, is the only missable interaction). Every other trophy is earnable after the story in free roam.
- **Cited guides** — each trophy has a guide written for this entry in its own words, naming its sources beside it. No guide text is copied from any source.

## Run it

Serve `app/` with any static server and open `index.html`:

```sh
cd app && python3 -m http.server 8080
```

Then open http://localhost:8080. Everything runs from local files; the app fetches only `data/trophies.json` from its own server.

## Layout

- `app/index.html` — the page: progress, controls, roadmap, checklist, guide panel, sources.
- `app/style.css` — original styling (Vice City sunset palette, CSS only, no images).
- `app/app.js` — tracker logic: render, filters, spoiler mode, localStorage, export/import, counters.
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, hidden flag, kinds, missable flag, count target, roadmap stage, guide and sources.
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`. Run with `MAKEFUN_OUTPUT_DIR=out node main.ts`.
- `screenshots/` — four renders of the app taken in a headless browser.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## Sources

Trophy names, descriptions and grades are shown as PlayStation publishes them, as collected by PSNProfiles and Exophase and cross-checked across these guides (checked 20 November 2026):

- KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap – All 55 Trophies — https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/
- GTA Spotter — GTA VI trophies and achievements: the full official list — https://gtaspotter.com/en/guides/gta-6-trophies-and-achievements/
- GamesFuze — GTA 6 Trophy List: All 55 Trophies & Achievements — https://gamesfuze.com/gta-6-wiki/achievements/
- PowerPyx GTA 6 trophy roadmap, via KeenGamer and GTA Spotter

Guides here are cited, never copied. The trophies whose methods are still unconfirmed by players (`Bad Luck, I Guess`, `The Truth Is Out There`, `In The Beginning…`, `Capital Offense`) say so in their guides instead of guessing.

## License

MIT — see `LICENSE`. An unofficial fan guide; Grand Theft Auto and GTA are trademarks of Take-Two Interactive. This project uses no Rockstar artwork, logos or game screenshots.
