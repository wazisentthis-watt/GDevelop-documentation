# CCR / WIR — Claude Code Handoff

*A technical + canon briefing for continuing CCR/WIR development in Claude Code. This is a companion to the real files, not a replacement — bring the actual files listed in §8 into the workspace alongside this document.*

**Contents:** 1. What's shipped · 2. v14 engine internals · 3. Known gotchas · 4. The five rule-threads · 5. World/map overlap · 6. Design philosophy · 7. Recommended entry point · 8. Files to bring

---

## 1. What's actually shipped

Four separate single-file HTML artifacts exist. There is no unified codebase yet — that's the real opportunity here, not a missing feature.

| File | Role | Size (last verified) |
|---|---|---|
| `CCR_v14_FIELD_LIFE_WIR.html` | Combat engine — 6 modes (Arena Classic, Chemistry Gauntlet, KoPani Bond Trial, IRaKodi Record Hunt, MELLA Match, Maze Run), 129-fighter roster, 24-element real chemistry | 3,531 lines / ~330KB |
| `CCR_Realm_Walk.html` | Walkable overworld — 9 locations, Vinyl Playlist (5-petal KoPani bonding), Garden/Groove loop, Kopani Accord (piano/rhythm catching) | bring separately, not verified this session |
| `CCR_Octoverse.html` | Vertical slice of the *other* ruleset (Thread C — see §4) — Element Architect MELLA, Crown Clash resolver, one region, 4 nodes | bring separately, not verified this session |
| `wir-ccr-character-select.html` | Roster / build-pick screen | 492 lines |

**The one proven cross-file connection:** v14 has a working `EMBEDDER BRIDGE` (search the file for that comment) — on match end it fires `window.parent.postMessage({type:'ccr-match-result', outcome, fighter, rival, starPts, turn}, '*')`. Realm Walk iframes v14 into an overlay when the player challenges Arena Commons, listens for that message, awards Mansa Money, closes the overlay. One-way notification, not a merge — v14 doesn't know it's embedded and stays fully playable standalone. **Both files have to stay in the same folder** — the iframe `src` is a relative path.

Every other connection named in the project's own Game Overview doc (KoPani mixing sharing the Builder's bond-classification math, Garden growth unlocking a Playlist petal, BrainBloom/WishBorn sharing one 8-stage loop) is real in the sense that the *same logic* runs in two places — not in the sense that there's a shared module. That duplication is worth fixing before it happens a third and fourth time across new Continents (see §7).

**Persistence, today:** v14 itself only persists one small thing — `localStorage['ccr_nexus_profile']` → `{leaves, clears}` (a story-progress leaf count + chapter-clears map). Realm Walk has its own, separate, much heavier save system (Playlist bond state, Garden/Groove state, Mansa Money, KoPani collection) — also `localStorage`-based, with a base64 JSON export/import code as the actual account-portability answer, because **there is no live server anywhere in this. A real login system has never been buildable from inside Claude.ai, and that hasn't changed.**

One thing worth flagging so it isn't confused for a fix: Claude.ai artifacts can now hold persistent storage tied to a Claude.ai account (`window.storage`) instead of plain browser `localStorage`. That's being tested right now, purely as an in-Claude.ai upgrade path. **It doesn't apply here.** `window.storage` is injected by Claude.ai's own artifact renderer — it won't exist at all in a standalone build Claude Code deploys elsewhere. If real accounts are ever wanted for a shipped, standalone version, that's a real backend + database, built from scratch, independent of anything tested in Claude.ai chat.

---

## 2. v14 engine internals — the load-bearing names

Confirmed directly from the shipped file (names, not guesses):

- **`ELEM`** — the 24-element atomic-data table (EN, ionization energy, density, radius, conductivity, melting point, specific heat, hardness). This *is* the chemistry — every stat, bond type, and compound traces back to it. Expanding it is a real, deliberate decision, not a quick add (the project already scoped "24, not 118" on purpose — see §6).
- **`CMPDS`** — 13 real compounds (NaCl, WF₆, Ca₃P₂, Fe₂O₃, UC, NaF, SiO₂, MgO, LiF, Cu₃Si, IrO₂, Na₂O, Fe₃C), each with real ΔH (kJ/mol), a bond type, a damage multiplier, and a named battle effect (chain reactions, toxicity, healing, terrain hardening). Looked up via `findC(a,b)`; best-matchup selection via `bestRxn` / `bestTerrRxn`.
- **`BUILDS`** — the 129-fighter roster (6 original MELLA bodies + 123 WIR-franchise characters), each with a Crown/Core/Root elemental build.
- **`ROAM_KOPANI`** — the 24 KoPani, one per legal element (deliberately capped at 24, not the original "118, one per periodic element" pitch — see §6 for why that's a feature, not a shortfall).
- **`MODES`** — the 6-mode config object (`arena`, `gauntlet`, `kopani`, `irakodi`, `mella`, `maze`).
- **`STORY_ARC`, `V13_GUIDES`, `V13_NODES`** — three separate per-mode config tables (narrative briefing, world-guide icons, board decorations). The sharpest edge in the codebase — see the gotcha below.
- **`calcStats` / `mvPattern`** — the canonical formulas: element→stat derivation, Root-element→chess-style movement pattern. Any build tool (the standalone `CCRBuilder.jsx` does this already) must call these, never re-derive them.
- **`addMM` / `onceToday` / `renderDojo`** — the Mansa Money economy and the once-per-real-day gating (also what the honor-system fitness claim reuses). **IIFE-scoped — see gotcha below.**
- **`checkOver` / `initG` / `startGame` / `doGrapple`** — the core match loop. **Each has been reassigned/wrapped multiple times as features layered on — see gotcha below before patching any of them.**
- **`tickRes`** — the shared per-turn tick that Black Holes, Void Scars, and residue all hook through.

---

## 3. Known gotchas — hard-won, worth not rediscovering the expensive way

- **Adding a mode is a three-table commitment.** `MODES.<id>` alone isn't enough — `STORY_ARC`, `V13_GUIDES`, and `V13_NODES` all need a matching entry or the hub/match-start throws. This has broken the shipped build in production once already (a real "Uncaught Error: Script error." ×3" bug, caught from a user screenshot, fixed by writing the missing entries — not by removing the requirement).
- **New code touching the Mansa economy has to live inside v14's IIFE.** `addMM`, `onceToday`, `renderDojo`, `PROFILE` aren't reachable from an appended top-level `<script>` — confirmed the hard way via a `ReferenceError` in testing.
- **`initG` / `startGame` / `doGrapple` / `checkOver` are each layered** — 2–3 stacked reassignments as systems got added over time. When patching combat-end or turn-start behavior, find and wrap the *last* live layer, not the first `function` declaration a text search turns up — editing an earlier, already-shadowed layer has zero effect and looks like the patch silently did nothing.
- **Grapple margin needs rounding before comparison.** An unrounded float once made two of the four grapple outcomes (Tag/Bind) mathematically unreachable — it shipped and passed casual testing before a 180-attempt tally caught it.
- **The Builder's PRED stat has a known ceiling issue:** Copper's real conductivity sits outside the original formula's calibrated range and pushes PRED past 400% uncapped. Currently clamped 0–100 in the builder. Pre-existing and documented — not a regression to "fix" by changing the formula.
- **The test discipline that's actually caught real, shipping-blocking bugs:** full `jsdom`-driven playthroughs — every mode, every branch, save/export/import round-trips — not just "does it render." This has caught a deleted variable, a missing `V13_NODES` entry, and the grapple-margin bug, none of which surfaced from just opening the file. Worth keeping as the real bar before anything ships.

---

## 4. The five rule-threads — what's canon, what's reference, what's genuinely open

This project has five separate, incompatible design documents describing "what CCR is," accumulated over its life. They aren't drafts of each other — they disagree on fundamentals (what a KoPani even is, board size, how stats are derived). Naming the conflict has been a deliberate choice every time it's come up, not an oversight to clean up.

| Thread | Source | Status | Core mechanic |
|---|---|---|---|
| **A** | "CCR Game Bible" PDF | Reference only | KoPani = board pickup, not a companion; 16 elements; 10×8 board |
| **B** | "WIR Creation Ledger" v10–v14 "Field Life" | **Active / shipped** — v14 and Realm Walk both run this | KoPani = independent bonded companions; 24 elements, real atomic data; 10×10 board; 1 element per KoPani |
| **C** | Ani-Elements Codex + the later "Lil Logic" 56-section expansion | **Partially built** — Octoverse runs this | 5-element KoPani (2 collaborating lineages), 9-point Crown/Core/Root allocation, Nakikaru, 8 Philosophy Continents, TNA/Soldering |
| **D** | CCR Transfer Scroll v1.2 | Reference only | 8-World Carousel, Dream Engine Leaves→Trees→Apples, "3R" axes |
| **E** | Science Expansion Module 06 | Reference only | mod-8 damage formula, HALITE/UMBARA/COGNARA terrain-elemental worlds |

**The open fork, stated plainly:** Thread B is what's shipped and tested. Thread C is what the *unbuilt* world content (the other 7 Continents) is written in — different math, different KoPani model, not a superset of B. Which engine those Continents actually run on when built is a decision that's been asked and left open more than once. **This isn't Claude Code's call to make by default.** If a task would require deciding it — a new Continent, or unifying the KoPani model — stop and flag it rather than picking a side silently. Threads A, D, and E are settled as reference-only; that part isn't in question.

---

## 5. World/map overlap — also unresolved, same rule applies

At least four different regional maps exist for this universe and have never been laid on top of each other to check where they'd agree:

1. The 8 Philosophy Continents (Thread C) — Lotus/Buddha, Ubuntu Savannah, Socratic Plateau, Tao Forest, Da Vinci Foundry, Nietzsche Ridge, Darwin Isles, Octoverse.
2. The ARK/Greenhollow layout (BrainBloom's own map — Echo Canopy, Jenga Reach, Kemia Wetlands, and more) — overlapping content, a different draft, never reconciled with #1.
3. The 8-World Carousel (Thread D) — its own separate structure.
4. HALITE / UMBARA / COGNARA (Thread E) — terrain-elemental worlds; COGNARA specifically maps real brain regions onto terrain.

Octoverse is the only one built as real, walkable geography so far — one continent out of eight. Same instruction as §4: this is a naming problem to flag, not a merge to perform unprompted.

---

## 6. Design philosophy — real constraints, not vibes

- **KoPani exist to teach real chemistry experientially.** Catching and mixing them is about the player discovering which elements react and how, not being told. Any new KoPani-adjacent feature should preserve "find out by doing" over "display the answer."
- **The fitness/Mansa Money claim is an honor system on purpose.** No verification or photo-proof was ever wanted — the lack of enforcement is explicitly what builds the player's own self-accountability. Don't "fix" this by adding a check.
- **The pacing target is deliberate:** casual button-mashing works early, until the game demands real strategy later. Validated directly by a real playthrough where coasting on a big lead led to a real loss. Don't smooth that spike out.
- **Explicit anti-attention-capture stance:** the game should hold attention because being in it is genuinely good for the player — contrasted directly, unprompted, against attention-engineering design. Any new progression or retention system should be judged against this before being added.
- **Origin context, for tone:** conceived to slow combat down into something that stays strategic the whole way through, instead of ending the moment one side is clearly stronger — pulled partly from football (blocking, open lanes) against chess's "no strategy left once you're in range" problem. New combat systems should serve that, not add complexity for its own sake.

---

## 7. Recommended entry point

The engine itself has already been assessed as "damn near complete" — playable, mechanically real, genuinely tested. The actual blocker to "every mode, every connection, every world" isn't design maturity — it's that four files are each growing independently with real duplicated logic between them (the bond-classification math alone already exists in both the shipped engine and the standalone Builder app).

**Before adding new Continents or modes**, the highest-leverage first task is extracting the proven-stable core — `ELEM`, `CMPDS`, `findC`, `calcStats`, `mvPattern` — into one shared module that v14, Octoverse, and any future Continent all import, instead of each file re-deriving or duplicating it. That's infrastructure, not new content, and it's what stops the bugs in §3 from getting hit a third and fourth time as the codebase keeps splitting.

---

## 8. Files to bring into the workspace

This document is a map, not the territory — Claude Code needs the actual files alongside it:

- `CCR_v14_FIELD_LIFE_WIR.html`
- `CCR_Realm_Walk.html`
- `CCR_Octoverse.html`
- `wir-ccr-character-select.html`
- `CCR_Game_Overview.md` — the existing modes/connections/worlds reference; no need to re-derive what it already covers.

If a fuller canon document exists from an earlier session (a "Master Reference" or "Official Game Document" covering all five threads in more narrative depth than the table in §4), bring that too — this handoff is deliberately the technical/architecture cut, not a replacement for the lore-level one.
