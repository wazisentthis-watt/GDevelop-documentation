# CCR / WIR

This folder is unrelated to GDevelop's own documentation elsewhere in this
repo — it holds a separate game project (CCR/WIR) that was asked to be
developed here. See `handoff/CCR_Claude_Code_Handoff.md` for the full
technical + canon briefing this folder was built from.

## Layout

- `app/` — the playable/buildable artifacts.
  - `CCR_v14_FIELD_LIFE_WIR.html` — the combat engine (6 modes, 129-fighter
    roster, real chemistry). Must stay in the same folder as
    `CCR_Realm_Walk.html` and `ccr-core.js` — both are loaded by relative path.
  - `CCR_Realm_Walk.html` — the walkable overworld; iframes v14 for its Arena
    Commons challenge.
  - `CCR_Octoverse.html` — vertical slice of the other ruleset (Thread C).
  - `wir-ccr-character-select.html`, `ccr-wir-build-compendium.html`,
    `ccr_storage_persistence_check.html` — supporting/reference artifacts.
  - `CCRBuilder.jsx`, `CCRFullSetArena.jsx` — standalone React tools.
  - `ccr-core.js` — **new**: the shared chemistry/stat module (see below).
- `docs/` — the five-thread canon reference material (Master Reference,
  Official Game Document, KoPani File, Character File, Complete
  Guide/Vision, ARK Canon, BrainBloom 118).
- `handoff/` — the Claude Code handoff doc and the Game Overview doc this
  folder was assembled from.

## What changed: the `ccr-core.js` extraction

The handoff's own recommended entry point (§7) was to extract the
proven-stable chemistry core — `ELEM`, `CMPDS`, `findC`, `calcStats`,
`mvPattern`, and their direct dependencies (`MX`, `DEF_REF`, `STR_REF`,
`eStat`, `mvCells`, `bestRxn`, `bestTerrRxn`, `terrElems`, `rxnHarm`,
`rxnHeal`) — into one shared module, instead of letting each file re-derive
or duplicate it. That's done:

- `ccr-core.js` is the single source of truth for Thread B's real-chemistry
  engine. It's a small UMD module: a plain `<script src="ccr-core.js">`
  works for classic-script consumers (v14), and `require`/`import` works
  for bundled consumers (CCRBuilder.jsx, tests).
- `CCR_v14_FIELD_LIFE_WIR.html` now loads `ccr-core.js` instead of
  inlining its own copy of that block. Nothing else in v14 changed — the
  extracted functions were verified byte-for-byte identical to the
  originals before the swap (see the commit for the diff check), and the
  file's fragile layered `initG`/`startGame`/`doGrapple`/`checkOver`
  reassignments were left untouched.
- `CCRBuilder.jsx` now imports the same module instead of keeping its own
  copy. That copy had genuinely drifted from the shipped numbers — wrong
  conductivity units on several heavy elements, Xenon's electronegativity
  changed from `0.00` to `2.60`, a few atomic radii off by tens of
  picometers — a real instance of exactly the bug class the handoff was
  warning about. It's fixed by this change, not by hand-patching the old
  duplicate.

**Deliberately left alone**, per the handoff's own instruction not to
resolve open forks silently:

- `CCR_Octoverse.html` keeps its own, smaller `ELEM` table. It runs Thread
  C (5-element KoPani, different Crown/Core/Root math) — genuinely
  different rules, not a stale copy of Thread B.
- `CCRFullSetArena.jsx` also keeps its own data. Its 16-element table and
  10×8 board match Thread A's spec, not Thread B's — a separate ruleset
  implementation, not duplication to fix.

Which engine future Continents should run on, and whether the four
regional maps should ever be reconciled, are both still open — see §4 and
§5 of the handoff. Nothing in this change decides either question.
