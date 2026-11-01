# CCR v14 FIELD LIFE — The Complete Guide
### Every system, every mechanic, every emoji, in the build as it actually exists right now

This is a full accounting of what's really in the file — not the vision, not what's planned, what's *shipped and tested*. Where something below isn't built yet, it's marked clearly.

---

## 1. What CCR Actually Is

You are a **MELLA** — a fighter built from three periodic-table elements (**Crown / Core / Root**). Crown is your intel and healing. Core is your attack and bond chemistry. Root is your movement and defense. Every stat you have — HP, movement pattern, blast range, grapple range, prediction — is *computed live* from those three real elements' real atomic data (electronegativity, density, melting point, hardness, etc.). Nothing is hand-set. Pick Fe/Os/W and the game does the chemistry and hands you a character.

**The one law that never bends:** Crown beats Core. Core beats Root. Root beats Crown. Every fight, every clash, every grapple, this triangle is what actually decides things.

---

## 2. The Hub: Realm Hallway

The home screen. Six modes, laid out as story chapters, each gated behind a **Story Briefing** — you don't just pick a mode, you get a short scene first (a courier, a rival, a door opening), then confirm with a **"CHOOSE MELLA →"** button before you even reach fighter select. After you pick your fighter, there's one more screen — the **Identity Seal** — a short ceremony showing your Crown/Core/Root before the actual board loads, confirmed with **"PRESS RECORD · ENTER BOARD →"**.

So the *real* flow every time is: **Hub → Briefing → Fighter Pick → Identity Seal → Board.** Four taps, not one. If something ever looks broken on load, this is usually where — every one of the six modes needs matching entries in three different background tables (story text, world-guide icons, board decorations) or the hub throws. (This bit me twice building Maze Run — now fixed and tested.)

---

## 3. The Six Modes

| Icon | Mode | What it actually is |
|---|---|---|
| ⚔️ | **ARENA CLASSIC** | One duel. No waves. Pure chemistry, Triangle Law, grapples, structures, repositioning. The default. |
| 🌌 | **CHEMISTRY GAUNTLET** | Five seeded survival waves, escalating enemies, residue and minerals circulating the board. |
| 🐾 | **KOPANI BOND TRIAL** | Not a fight for damage — a relationship. Build trust with a companion through reads, care, and shared movement. Win by reaching 5 Bond Petals, *then* beating the guardian. |
| 💿 | **IRAKODI RECORD HUNT** | Investigate roaming "Record Echoes," accept real consequences, and run a visible delayed-Record loadout. Win by integrating 3 Echoes, then the guardian. |
| ☀️ | **MELLA MATCH** | The advanced one. Expanded SP, public Records both sides can see coming, and both fighters can transform mid-match. |
| 🏈 | **MAZE RUN** | The newest mode. Run row 1 to row 10 across the same board while 3 mobile blockers close your lanes every turn. Getting caught isn't a wall — it's a real Triangle clash you can win and keep running, or lose and eat the hit. Juke (1.2 SP) guarantees breaking one contact. Touchdown at row 10 = 8★ + 4 MM. |

Each mode's Story Briefing has real narrative behind it — a door, a pair of WIR worlds it crosses over with, and a **Dream Leaf** it restores when you clear it: **READ** (Arena) → **MEMORY** (Gauntlet) → **BOND** (KoPani) → **TRUTH** (IRaKodi) → **ALIGNMENT** (MELLA) → **GROUND** (Maze Run, the newest — a Gridiron Bolt courier caught in the Hallway, taught by Binary Bark that reaching your target was never supposed to be the same as beating it).

---

## 4. The Chemistry Engine (this is the actual game, everything else sits on top of it)

**24 legal elements**, each with real data — atomic number, molar mass, electronegativity (EN), ionization energy, density, atomic radius, conductivity, melting point, specific heat, hardness, and a **type**: alkali, crystal, gas, metal, heavy, noble, or actinide (Uranium is the only actinide in the game).

```
Li C O Si N F Na Mg P Cl Ca Ti Cr Fe Cu Mo Ag Xe W Os Ir Pt Au U
```

**Root → movement pattern** (this is why some fighters move like chess pieces and some don't):
- Li, Na, K, Rb → **Knight**
- C, Si, B, Cr, W → **Bishop**
- Fe, Co, Ni, Cu, Ag, Au, Os, Ir, Pt, Mo, Ti → **Rook**
- Xe, Ar, Kr, Ne, He → **Queen** (nobody in the current 129-fighter roster actually has this — it's real, just unclaimed)
- Everything else → **King**

**Bond types**, based on ΔEN (the difference in electronegativity between two Core elements):
- **ΔEN > 1.7 → Ionic** (electrons fully transfer — the strongest, most dramatic bond)
- **ΔEN 0.4–1.7 → Polar Covalent** (shared unevenly)
- **ΔEN < 0.4 → Covalent** (shared evenly)
- **Both metal/heavy → Metallic** (delocalized, spreads to neighbors)
- **Either noble → Phase-Through** (chemistry just doesn't grab — kinetic only)

**Known compounds** — if two fighters' elements actually form a real compound, it fires as a damage multiplier with the *real* energy value:

| Compound | Elements | Bond | kJ/mol | Multiplier | Effect |
|---|---|---|---|---|---|
| WF₆ | F + W | Polar | −1747 | ×3.0 | F dissolves W — max damage |
| SiO₂ | Si + O | Polar | −911 | ×2.5 | Quartz — insulated field |
| Fe₂O₃ | Fe + O | Polar | −824 | ×2.2 | Rust — terrain oxidizes |
| LiF | Li + F | Ionic | −617 | ×2.1 | Fast chain |
| MgO | Mg + O | Ionic | −601 | ×2.0 | Magnesia — heals the attacker |
| NaF | Na + F | Ionic | −574 | ×2.5 | Strongest ionic — chains |
| Ca₃P₂ | Ca + P | Polar | −504 | ×1.8 | Bone minerals form |
| Na₂O | Na + O | Ionic | −416 | ×1.9 | Chains |
| NaCl | Na + Cl | Ionic | −411 | ×2.0 | Chains ×3 to adjacent |
| IrO₂ | Ir + O | Polar | −274 | ×1.7 | Iridium armor |
| UC | U + C | Polar | −98 | ×1.4 | Sustained nuclear burn |
| Fe₃C | Fe + C | Polar | −25 | ×1.2 | Cementite hardens terrain |
| Cu₃Si | Cu + Si | Noncovalent | −13 | ×1.1 | Semiconductor efficiency |

---

## 5. Combat, In Order

1. **Triangle**: pick Crown, Core, or Root. Crown > Core > Root > Crown. Win = full damage, tie = partial both ways, lose = they hit back harder.
2. **Grapple** ⛓: range-banded now — Close (adjacent, no cost), then three long bands out to 6 tiles, each costing more SP. Each side auto-commits its strongest stat (Core/Root/Crown), Triangle Law gives a Pack Advantage bonus, and the margin decides: **Whiff** (nothing), **Tag** (small hit), **Bind** (real damage + Root-Locks them a turn), or **Throw** (big damage, thrown 2 tiles, can carve a permanent Void Scar if it's heavy enough).
3. **Blast** 🎯: ranged attack option, own range/cost profile.
4. **Star Charge** ⭐: stand still with no enemy within 2 tiles, spend the turn, +1 SP. New this build.
5. **Reality Alter (RA)**: place a structure. 🧱 Wall (4★, blocks pathing) · ⭐ Nova Star (9★, pulls enemy in) · 🌑 Black Hole (14★, pulls anything within 3 tiles closer every turn, deals tidal damage up close, evaporates after 4 turns in a burst of residue — this used to be flavor-only, it's real now) · 💊 Mineral (3★, heals) · 🔮 Shield (5★, −50% damage inside) · 💎 Spire (6★, crystal field zone).
6. **Void Scars** 🕳️: any hit for 35%+ of a target's max HP carves a permanent, unremovable, impassable tile. New this build.
7. **MELLA** ☀️: the transformation state. Costs SP, changes what's available for a stretch of turns.

---

## 6. The Roster — 129 Fighters

**6 native CCR prebuilts**, each hand-designed:

| Fighter | Elements | Style |
|---|---|---|
| ⚡ JOLT | Cu/Na/Li | Speed, ionic chain lightning |
| 🌿 VERDANT | C/Mg/P | Growth, heals off minerals |
| ☢ OBSIDIAN | Xe/U/Ir | Nuclear ghost, huge AOE |
| 🛡 BASTION | Fe/W/Ti | Tank, magnetic grapple lock |
| ☠ VENOM | F/Cl/N | Corrosion, strips defense |
| ✦ NOVA | Au/Os/Pt | Catalytic, best prediction |

**123 more**, pulled in from the wider WIR universe across 14 franchises — every single one built from their own real Crown/Core/Root, computed the same way as the 6 originals, no exceptions:

🌌 AMU/Octo-Matrix (18) · 🦁 Planet Nem (13) · 🚀 Constellation Saga (14) · 🧵 Denni Denim (8) · 🐝 Alien-Like (13) · 🍽️ Consumption (8) · 🌈 Sounds Like Light (8) · 🌍 Afro A-I (2) · 🐉 Dogon Dragon (1) · 🧠 See My World (11) · 🍞 Bread, Bred & Bready (9) · 📼 Bring Back the 90s (8) · 📡 May Naki Ask (4) · 🧬 Oh No to Mars (6)

The pick screen has search + a franchise filter since 129 cards doesn't fit on one screen. Full stat cards for all 129 already exist as a separate reference (the Build Compendium) if you want the deep dive on any one fighter.

---

## 7. KoPani — The Collection System

**"Select your animal."** 24 KoPani, one for every legal element — each one *is* the living version of that element, not just named after it.

| Element | KoPani | Icon | Role |
|---|---|---|---|
| O | Mistfin | 🦦 | Care |
| Ti | Railwing | 🦇 | Forecast |
| Cl | Coilpaw | 🐍 | Guard |
| Mg | Sunmoth | 🦋 | Dash |
| Cu | Drumcrow | 🐦‍⬛ | Forecast |
| Ca | Stonehare | 🐇 | Dash |
| Si | Glass Beetle | 🪲 | Record |
| Fe | Baobab Jackal | 🦊 | Guard |
| N | Cloudram | 🐏 | Guard |
| C | Ink Octo | 🐙 | Record |
| W | Ember Gecko | 🦎 | Dash |
| P | Moss Lion | 🦁 | Care |
| Li | Sparkhop | 🐁 | Dash |
| F | Tearfang | 🦂 | Dash |
| Na | Embervole | 🐹 | Care |
| Cr | Mirrorfox | 🦝 | Guard |
| Mo | Anvilmole | 🦡 | Guard |
| Ag | Signalwolf | 🐺 | Forecast |
| Xe | Void Owl | 🦉 | Guard |
| Os | Denseboar | 🐗 | Guard |
| Ir | Meteorcrab | 🦀 | Record |
| Pt | Catalysk | 🦌 | Care |
| Au | Sunfinch | 🐦 | Forecast |
| U | Radstrider | 🦏 | Dash |

You find them by searching Free Roam biomes and choosing how to approach based on their temperament (observe / offer / spar) — chasing never works, that's built in on purpose.

**Mixing** 🧪 — once you've collected two, tap them together and the game runs the *real* chemistry: their actual ΔEN, the correct bond type, and — if it's one of the 13 known compounds above — the real name and real kJ/mol energy. Tested live: Sodium × Fluorine correctly returns Ionic, ΔEN 3.05, NaF, −574 kJ/mol. This is genuine chemistry content wearing a game.

**4 story companions** you can actually bond and equip in a match: 🐙 Binary Bark, 🐆 Nebru Kael, 🦁 Kio-Mane, 🌱 Petal Seedling — each with a real in-battle passive.

---

## 8. The Mansa Life Terminal — Free Roam

Nine real locations, each with its own flavor text and function:

- 🏡 **Starter Home** — stores your Dream Seed, provisions, latest groove. Rest advances the day, restores Energy.
- 🚇 **Mansa Market** — earn MM through actual jobs (repair shifts), not loot drops.
- 🥋 **Kio-Mane Dojo** — Footwork / Crown Read / Root Guard training, 3 MM each, changes how later matches actually play.
- 🌱 **KoPani Grove** — search for wild KoPani here.
- 🤝 **Arena Commons** — meet and spar the 12 roaming MELLA rivals.
- 🧂 **Halite Yard** — salvage pressure-marks for MM; greedy extraction destroys the evidence (a real mechanic, not flavor).
- 💿 **Record Library** — learn to queue delayed public IRaKodi decisions.
- 🌳 **Root Gardens** — ecology maintenance; strengthens KoPani trust.
- 🚪 **Realm Transit** — news and travelers from other WIR doors.

**💪 Real-World Rep** — new this build. Claim a workout you actually did, once per real day, +3 MM. No proof required. Honor system, on purpose — that accountability *is* the training.

**Mansa Money (MM)** funds Dojo training and provisions. Earned through the activities above, not randomly.

---

## 9. What Isn't Built Yet (the honest list)

Things you've described that are real direction but not in the file:
- The **Godlet** player identity and the **vinyl-disc gauntlet**
- **Grooves** that hold KoPani inside them and release them mid-fight to act on their own
- **Sound/frequency-trail discovery** replacing "bump into an encounter"
- A true **continuous open-world** free-roam (right now Free Roam is a menu of 9 locations, not a walkable map)
- **Seasons** — multiple story arcs (right now there's one 6-chapter arc)
- Scarab Seals as an in-game badge system (they exist as a design doc, not wired into this build)

---

## 10. Every Emoji In The Build, By Category

**Modes:** ⚔️ Arena · 🌌 Gauntlet · 🐾 KoPani Trial · 💿 IRaKodi Hunt · ☀️ MELLA · 🏈 Maze Run

**Combat actions:** ⛓ Grapple · 🎯 Blast · ⭐ Star Charge · 👑 Crown pick · ❤️ Core pick · 🌱 Root pick

**Reality Alter structures:** 🧱 Wall · ⭐ Nova Star · 🌑 Black Hole · 💊 Mineral · 🔮 Shield · 💎 Spire · 🕳️ Void Scar (created, not placed)

**Terminal locations:** 🏡 Home · 🚇 Market · 🥋 Dojo · 🌱 Grove · 🤝 Commons · 🧂 Halite Yard · 💿 Library · 🌳 Gardens · 🚪 Transit

**KoPani (24):** 🦦🦇🐍🦋🐦‍⬛🐇🪲🦊🐏🐙🦎🦁🐁🦂🐹🦝🦡🐺🦉🐗🦀🦌🐦🦏

**Story/world:** 📜 Chapter text · 🚪 Door · 🐙 Binary Bark · 🦁 Nemzo (guide) · 🛹 Abukani (guide) · 🚀 Melanaris (guide) · 🧵 Denni (guide) · 📚 LEXARA (guide) · 🌈 Sound/Light (guide)

**Franchise icons (roster filter):** 🌌 AMU · 🦁 Planet Nem · 🚀 Constellation · 🧵 Denni Denim · 🐝 Alien-Like · 🍽️ Consumption · 🌈 Sounds Like Light · 🌍 Afro A-I · 🐉 Dogon Dragon · 🧠 See My World · 🍞 Bread Bred Bready · 📼 Bring Back 90s · 📡 May Naki Ask · 🧬 Oh No to Mars

**UI/system:** ✓ Confirm · → Advance · ← Back · ↗↕ Directional · 💥 Impact/Throw · 💪 Workout claim · 🪙 Mansa Money · ❔ Unmet/undiscovered

---

*This reflects the file exactly as tested and shipped. If you play it and something here doesn't match what you see, that's a real bug — tell me exactly what you tapped and I'll go find it the same way I found the last two: load the real file, run the real flow, get a real stack trace.*
