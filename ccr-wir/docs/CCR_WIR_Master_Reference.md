# CCR / WIR — Master Reference
### Everything needed to pick this universe up cold. Written to be handed to a different AI with zero prior context.

**Creator:** goes by AMukKani (Irvin Riley III). Former professional footballer, self-directed systems architect. Works nomadically, mostly voice-to-text from a phone. Communication style is stream-of-consciousness and highly associative — expects whoever's helping to extract structure from unpolished input, not wait for a polished spec.

**The one-paragraph pitch:** CCR (Crown-Core-Root) is a chemistry-combat tactics game where every character is built from real periodic-table elements — Crown governs perception/intel, Core governs attack/energy, Root governs movement/structure. It sits inside a much larger universe called WIR (What Is Reality™), which also contains a real-world skill-learning system (BrainBloom), an animal-biology curriculum (the Animal Rhythm Atlas / ARK), an emotional-growth engine (WishBorn), and a separate TV property (The Attuned Star) whose power-visualization language has been folding into CCR's combat.

---

## PART 0 — READ THIS FIRST: what's real vs. what's vision

This is the single most important section. Everything below falls into exactly one of these three buckets, and they must not be blurred:

| Status | What it means | What's in it |
|---|---|---|
| **🟢 SHIPPED & TESTED** | Real code, downloaded, played, verified with an actual test harness before every ship | `CCR_v14_FIELD_LIFE_WIR.html` (combat engine), `CCR_Realm_Walk.html` (walkable world), `CCR_Octoverse.html` (Rule-of-Nine vertical slice) |
| **🟡 ACTIVE CONVERSATIONAL CANON** | Being played right now via tracked state in chat, not (yet) code | The Octoverse tabletop session — see Part 5 |
| **⚪ REFERENCE / VISION** | Real design material, richly developed, NOT reflected in any shipped code | Everything in Parts 2-4 below unless explicitly marked shipped |

If you are a fresh AI reading this to help going forward: **default to asking which bucket a request falls into before building anything.** The single biggest risk in this project is quietly treating vision material as if it were already real, or vice versa.

---

## PART 1 — The three shipped, tested files

### 1A. `CCR_v14_FIELD_LIFE.HTML` — the combat engine (aka "Thread B")

The actual playable game. Single HTML file, vanilla JS, no build step, `localStorage` persistence (wrapped in try/catch everywhere so it degrades safely).

**Core math:** every fighter = 3 real elements (Crown/Core/Root) chosen from a **24-element table** with full real atomic data (Z, molar mass, EN, ionization energy, density, radius, conductivity, melting point, specific heat, hardness): `Li C O Si N F Na Mg P Cl Ca Ti Cr Fe Cu Mo Ag Xe W Os Ir Pt Au U`. Stats are **computed directly from that atomic data** — there is no point-buy, no "Rule of Nine," nothing invented. Root element also determines a chess-style movement pattern (Knight/Bishop/Rook/Queen/King via a lookup table).

**Triangle Law (never varies, anywhere in the whole universe):** Crown beats Core. Core beats Root. Root beats Crown.

**Six modes:** ⚔️ Arena Classic (1v1 duel) · 🌌 Chemistry Gauntlet (5-wave survival) · 🐾 KoPani Bond Trial (5 Bond Petals then guardian) · 💿 IRaKodi Record Hunt (3 Echoes then guardian) · ☀️ MELLA Match (transformation, public Records) · 🏈 Maze Run (row 1→10, 3 mobile blockers, tackle = real Triangle clash, JUKE costs SP).

**The real user flow (4 confirms, not 1):** Hub → Story Briefing screen → Fighter Pick → Identity Seal screen → Board. Every mode needs matching entries in **three separate per-mode tables** (`STORY_ARC`, `V13_NODES`, `V13_GUIDES`) or the hub throws — this bit us twice building Maze Run, now fixed and tested.

**Combat systems:** Triangle pick (Crown/Core/Root) each turn · Grapple (range-banded, GCV clash, Whiff/Tag/Bind/Throw outcomes, Throw travels up to 6 tiles with wall-impact bonus damage and a residue trail, flavored with Attunement-String language) · Blast (ranged) · Star Charge (+1 SP for standing still, no enemy within 2 tiles) · Reality Alter structures (🧱Wall 🌟NovaStar 🌑BlackHole 💊Mineral 🔮Shield 💎Spire) · Black Holes (real pull/tidal-damage/evaporate-into-residue mechanic) · Void Scars (any hit ≥35% max HP carves a permanent impassable tile) · MELLA transformation.

**Roster:** 129 fighters — 6 CCR-native (JOLT, VERDANT, OBSIDIAN, BASTION, VENOM, NOVA) + 123 pulled from 14 WIR franchises (AMU/Octo-Matrix, Planet Nem, Constellation Saga, Denni Denim, Alien-Like, Consumption, Sounds Like Light, Afro A-I, Dogon Dragon, See My World, Bread Bred Bready, Bring Back 90s, May Naki Ask, Oh No to Mars), each with a full Crown/Core/Root build.

**KoPani (real, in-game, not the 5-element kind):** 24 total, exactly one per legal element — each literally *is* the living version of that element. Real "mix two KoPani" feature computes actual ΔEN, correct bond classification, and surfaces the real compound name + kJ/mol if one exists in the game's own compound table (13 known compounds: NaCl, WF₆, Ca₃P₂, Fe₂O₃, UC, NaF, SiO₂, MgO, LiF, Cu₃Si, IrO₂, Na₂O, Fe₃C).

**Story layer:** 6 chapters, each with a door/pair-of-WIR-worlds/Dream Leaf: Arena=READ, Gauntlet=MEMORY, KoPani=BOND, IRaKodi=TRUTH, MELLA=ALIGNMENT, Maze Run=GROUND. Arena's *real* win condition is not "reduce HP to 0" — a Dissonance layer requires exposing a hidden lie (`counterDissonance()`) first.

**A pattern worth knowing if you ever edit this file:** core functions get silently reassigned 2-3 times across dev layers (v10→v11→v13). `initG`, `startGame`, `doGrapple`, `checkOver` have all bitten us this way — editing an early-layer definition can have zero effect because a later layer completely replaces it. Always grep for every reassignment (`functionName\s*=`) before editing, and test with a real DOM simulation (jsdom), not just a syntax check.

### 1B. `CCR_Realm_Walk.html` — the walkable world

A real top-down, Pokémon-style free-roam world. 24×16 tile map, camera follows a "Godlet" avatar wearing a vinyl-disc gauntlet. Arrow-keys/WASD + on-screen d-pad.

**The 9 real locations**, placed as physical points (same names/flavor as the terminal in the combat engine): Starter Home, Mansa Market, Kio-Mane Dojo, KoPani Grove, Arena Commons, Halite Yard, Record Library, Root Gardens, Realm Transit.

**Sound-trail discovery (no bump encounters):** 8 of the real 24 KoPani are placed as sound sources. A signal meter, a real Web Audio tone (pitch/volume scale with distance), and a visual pulse ring all intensify as you approach.

**The KoPani Accord (Orbit Bond tier — the piano-bonding mechanic):** catching a KoPani is a mini call-and-response. The KoPani plays its own 3-note phrase (real Web Audio tones, synced key-lighting) on an 8-key piano (`A S D F G H J K` = `C D E F G A B C`, matching real octave layout). You echo it back — tap or keyboard. A wrong note never loses the KoPani; it just clears your input and replays the phrase. This is deliberately scoped down from the full documented design (Hear→Echo→**Answer**→**Duet**→Return, 6 difficulty tiers up to Return Bond) — Orbit Bond (Echo only, 3 notes, hint visible) is genuinely all that's built.

**Garden → Groove → KoPani loop:** plant a seedling at Root Gardens, rest at Home to advance the day, it matures at day 3, press it into a groove, load any caught KoPani into an empty groove.

**The Arena Bridge:** walking into Arena Commons opens the real combat engine in an iframe overlay (both files must live in the same folder — relative path). The combat engine posts a small `postMessage` back on real match end; Realm Walk listens, awards Mansa Money (+6 win / +1 loss), and returns you to the world. The two codebases are not merged — this is a one-way notification hook, nothing more.

### 1C. `CCR_Octoverse.html` — the Rule-of-Nine vertical slice (newest)

The first real, coded implementation of the "Thread C" expanded ruleset (see Part 2) — built specifically because five independent expert-review documents in the source material all converged on the same advice: *build one small complete slice before the full 118.*

**What it actually implements:** the player's pre-specced "Element Architect" MELLA (Crown Au, Core Ga+Ir, Root Si+Se, Catalyst Bi, Core-animal Peregrine Falcon, Root-animal Mimic Octopus) · a real, deterministic **Crown Clash** resolver (same-element or ΔEN<0.5 = RESONANCE, ΔEN 0.5–1.7 = REACTION, ΔEN>1.7 = REPULSION, either side a noble gas = NEUTRAL) · the real **LP12/AP24/DP10/SP5-10/MP3** resource baseline · a playable **5-Petal Accord** (Notice/Match already resolved narratively for the starting Copper-lineage KoPani; Adapt/Shared Function/Return are real interactive choices in-game) · one region (Octoverse Archipelago) with 4 nodes (Tide Pool, Soldering Pair, Free Ground DNA, Nakikaru Shrine) · one real combat encounter (a Nakikaru Sentinel, reached only if you over-extract from the DNA site) · `localStorage` autosave **plus** an export/import save-code (base64 JSON) since this environment can't host real user accounts/login — that's a hard infrastructure limit, not a scope choice.

Everything past this slice (the other 7 continents, the full Rule-of-Nine character creation, Nakikaru's deeper governance, Binary Bark's IIC, the 25 Reality Overwrites) is real, written, and NOT yet code.

---

## PART 2 — The deep canon ("Thread C," massively expanded)

This is a separate, larger, **mechanically incompatible** ruleset from Part 1. It was originally a modest "Ani-Elements Codex" (Crown+Core+Root sums to 9, IRaKodi as a Pokémon-like creature) and got expanded enormously in a different AI conversation, then pasted in wholesale across many documents. It is **not** what the shipped files run on.

**The Rule of Nine:** every KoPani/MELLA distributes 9 points across Crown/Core/Root (not derived from atomic data).

**Five-element KoPani body:** 1 Crown element (species identity, 118 possible lineages) + 2 Core elements (from a "Core animal" lineage) + 2 Root elements (from a "Root animal" lineage). Two animal lineages that "discovered survival was better together" — symbiogenesis as game mythology. Life cycle: **Dream Egg** (unopened) → **Hatchling** (Core parent expressed, Root parent dormant) → **Second Form** (Root parent physically emerges) → **Adult** (full 5-node body).

**Nakikaru:** the world's environmental intelligence and "Balancer" — explicitly *not* always on the player's side. Described in-universe as "Rendering Nuanced Adaptabilities." Its core ethical tension (a real recurring conflict in the material): does correcting imbalance protect freedom, or does it become quiet control? No settled answer — that's the point.

**The 8 Philosophy Continents**, each with a signature animal-pair hybrid: Lotus (Buddha, Crane+Turtle), Ubuntu Savannah (Lion+Elephant), Socratic Plateau (Owl+Fox), Tao Forest (Panda+Snake), Da Vinci Foundry (Falcon+Mantis), Nietzsche Ridge (Jaguar+Hawk — flagged in its own source material as needing careful framing so it doesn't glorify domination), Darwin Isles (Falcon+Shark/Iguana), Octoverse Archipelago (Octopus+Dolphin — the one with no single-philosopher anchor, whose principle is "intelligence doesn't need to live in one center").

**Elemental Soldering:** two KoPani sharing a Crown lineage can consciously reconfigure their Core/Root partnership — not breeding, a real identity choice ("you are not morally obligated to remain inside a bond merely because your ancestors selected it"). What's released becomes **Free Ground DNA**, enters the mycelial network as DNA spores, and can recombine into wild **Mushroom Eggs** — nothing is ever permanently wasted.

**TNA (Traversal Neural Abilities):** the neurological layer that determines whether a body *can* use anatomy it has. Ties to a real (separate, actual) biomechanics/movement-coaching project called **Mi'Wendo** (Sense → Interpret → Coach → Reward → Protect, edge-first privacy, Crown=intent/Core=mechanics/Root=safety as real movement-scoring lenses).

**Binary Bark:** in this thread, not the simple 4-ability story companion from the shipped file — a full robot containing an internal insect civilization (**IIC**, Inspectoral Insect City) with real districts (Sensor/Signal/Hardware/Armor/Cooling/Composition) that can fabricate new body parts mid-battle from consumed matter ("Available Assembly Potential").

**The player's own pre-built MELLA** ("the Element Architect / Balancer"): Crown Gold · Core Gallium+Iridium · Root Silicon+Selenium · Catalyst Bismuth · Core-animal Peregrine Falcon · Root-animal Mimic Octopus. This is the character now active in the Octoverse slice.

**The 25 Reality Overwrites ("Singularity"/"Black-Sun" mode):** an explicitly separate, deliberately-broken chaos layer — half-life decay, phase-state inversion, Nakikaru turning dictatorial, hardware-failure-as-gameplay. Canon ruling from the source material itself: **this is a contained anomaly mode layered on top of the normal Constitution, never the default ruleset**, and real hardware must always fail safely regardless of what the fiction portrays.

### The 5 expert-council critique passes — what they actually agreed on

Five separate ~27-specialist simulated review documents arrived independently at the *same* core fixes. This is the real signal, extracted:

1. **Label every rule**: real science / plausible extrapolation / game abstraction / deliberate override — never let one impersonate another
2. **Individual variation, not fixed traits** — no animal (real or KoPani) behaves identically to every member of its species
3. **Accessibility and consent/welfare designed in from day one**, not patched on later
4. **Nakikaru/any Balancer AI must be auditable** — no secretly thumbing the scale
5. **Real hardware safety is completely walled off from fictional failure** — a device can simulate overheating; it can never actually overheat someone
6. **Ship one vertical slice before the full 118** — said independently, almost verbatim, by every single one of the five documents. `CCR_Octoverse.html` exists specifically because of this.

---

## PART 3 — The parallel systems

### 3A. BrainBloom 1000 / the Animal Rhythm Atlas / ARK (canon-resolved)

Mission stated directly: *"think of 1000 things a person can learn that positively impact their brain, doable on phone or PC with AI help, to make the world more brain healthy."*

**A skill only counts if it passes 4 tests:** Action (can you *do* it) · Proof (how demonstrated) · Progress (measurably improvable) · Transfer (helps outside the game). "Knowledge" and "skill" are explicitly different things.

**118 real skills** across 12 domains (music/rhythm, memory/attention, language, math/logic, science, AI/digital literacy, creativity, emotional/social, life/financial, animals/ecology, body coordination, community/leadership) × **8 forms** (Discover→Practice→Recall→Apply→Create→Cooperate→Teach→Return) = 944, + 56 rare surprise encounters = **1,000 total experiences**. Full itemized 118-list exists (delivered as `BrainBloom_118.md`).

**5 mastery levels:** 0 Unopened → 1 First Contact → 2 Assisted Use → 3 **Independent Use (officially "learned" here)** → 4 Transfer → 5 Teach/Create.

**The surprise encounters** ("shocking Pokémon pop-ups," done on purpose): Wild KoPani Appeared, Memory Mimic, Element Storm, Glitch KoPani, **Golden Rest Encounter** (the challenge is literally to stop, put the device down, and come back later — earns real progress), Mystery Egg, Rival Attuner, Community Rescue.

**A parallel 118-item Animal Rhythm Atlas** (real animals, real biology as the actual teaching mechanism, never an arbitrary "elemental type") went through 4 independent redrafts under different names (The Attunement World / The Living Groove World / Ani-Mdundo Attunement / ARK). Resolved into one blended canon (delivered as `ARK_Canon.md`):

- **12 Rhythm Houses** = the 12 skill domains, 1:1: Pulsekeepers, Strideweavers, Choruskeepers, Grounddrummers, Swarmfields, Sunclockers, Tidekeepers, Routebearers, Display Architects, Decision Strikers, Cyclebearers, Pulse-Lighters
- **Greenhollow Valley** = the starting hub (maps onto Realm Walk's real locations — Home, Dojo, Commons, etc.)
- **8 starter paths**, each a lens not a monster: Piga Finch (rhythm), Kumbuka Owl (memory), Uliza Gecko (questions), Jenga Pangolin (building), Kemia Mantis (science), Nuru Cuttle (digital), Sanaa Weaver (creative), Amani Otter (attunement)
- **The Metronome** — the antagonist philosophy, consistent across every draft: believes all rhythm should be standardized/synchronized. Its weapon is **False Synchronization** (copies the outer shape of a real bond without the consent/context underneath). The whole world's thesis in one line: *healthy rhythm isn't everybody moving identically — it's different systems finding compatible timing.*
- Core loop: **Notice → Match → Disrupt → Adapt → Join → Return**
- KoPani bond arc: **Five-Petal Accord** (Notice/Match/Adapt/Shared Function/Return) — this is the same 5-petal shape now playable for real in `CCR_Octoverse.html`

### 3B. WishBorn — "the soul" of the universe

Explicit role given: *"CCR is the fight. WIR is the world. G.O.R.E. is the multiverse. AI-&-US is the reflection. WishBorn is the soul."*

**The loop:** choose a **DreamSeed** (Courage, Patience, Focus, Boundary, Curiosity, Rhythm, Recovery...) → grow 5 **Leaves** through real experience → the Seed becomes a **Wish Orb** → it bursts into a **RootRealizer** (explicitly NOT a Pokémon/pet/default-fighter — an emotional mirror whose abilities come from the player's own emotional rhythm) → it evolves through CCR/KoPani/ARK play → the player's [[ai-and-us]] constellation updates.

Real mechanical hooks specified (not just flavor): a Seed changes SP gain/spend rhythm, a RootRealizer modifies the board rather than fighting directly, an Orb determines which MELLA variant unlocks, and every Leaf doubles as a star in the exact same 8-stage BrainBloom loop — one engine, worn as three names.

### 3C. Attunement Strings / The Attuned Star

A separate WIR TV property (protagonist Abukani, a skater), whose power-visualization language is now folding into CCR's grapple mechanic specifically.

**Core law:** Attunement is the relationship; **Nora** is the living-system readout of it; **Attunement Strings** are the visible routes through which Nora is coordinated. Six-stage cycle: Notice → Regulate → Exchange → Kujieleza (personal expression) → Àṣẹ (real consequence) → Amava (integration). Hard rule: no external string without an internal origin — nothing floats as decoration. Mastery is quieter, not bigger.

Later passes added a harder-sci-fi "Neurological Handshake" layer (three laws: **Reciprocal Ping**, **Physical Anchor**, **Return Fork**) and a "Purple Deep" revision reframing authentication as co-regulated emergence rather than a biometric lock.

**What actually made it into shipped code:** the grapple/throw rework uses String-Anchor *language* only ("the string snaps taut," "no reciprocal ping") — real long-distance throw mechanics, not the full authentication system as literal rules. That stays intentionally scoped as TV-bible depth, not game-mechanic depth.

---

## PART 4 — Design philosophy (stated directly, not inferred)

- Conceived CCR around age 6-10, sparring with cousins — fighting stopped being fun once he was clearly stronger than them, and he wanted a way to slow combat down while keeping it a real fight. Straight chess felt boring because a piece just loses on contact, no strategy left once you reach it. Football (blocking, open paths) became the seed for Maze Run — "combat as a moving maze."
- Explicit anti-engagement-capture ethic: the game should hold attention because being here is genuinely good for the player, not through attention-capture engineering — stated in direct contrast to how he reads GTA's expansion into other activities as being about not losing the player's attention to something else.
- The fitness/Mansa Money honor-system claim is deliberate, not a flaw to patch — the honor system itself is what builds the player's self-accountability.
- KoPani exist to teach real chemistry experientially, not to be told facts — "the living version of the elements."
- Wants CCR run through an LLM game master specifically because per-piece movement legality and live chemistry explanation only work with something tracking both at once — direct validation for this whole mode of building it.

---

## PART 5 — Current session state (as of the last turn)

Live in `CCR_Octoverse.html` + tracked conversationally:

**MELLA:** Element Architect. LP 12/12 · AP 24/24 · DP 10/10 · SP 5/10 · MP 3/3. Crown Au, Core Ga+Ir, Root Si+Se, Catalyst Bi.

**Roster:** Octopus-Dolphin (founder, adult) · Solar Falcon (hatchling, Root dormant) · Dream Egg (unopened).

**In progress:** a wild Copper-lineage KoPani at the Tide Pool, Notice+Match already resolved (Resonance clash, freed it from the rocks before the tide reached it) — Adapt/Shared Function/Return are live, playable choices in the shipped slice, not yet resolved.

**Untouched nodes:** the Soldering Pair (Falcon-Turtle mid-reorganization), the Free Ground DNA site, the Nakikaru Shrine.

---

## PART 6 — Open questions (genuinely unresolved, flag before assuming an answer)

1. **Canon hierarchy vs. shipped code:** Part 2's ruleset is not reconciled with Part 1's. Current working answer: Part 2 is deep canon + an active conversational/vertical-slice layer (Part 1C); Parts 1A/1B keep running their own simpler, already-tested math. Nothing has been asked to migrate wholesale.
2. **Threads A, D, E** (an earlier "Game Bible" PDF with a 16-element/10×8-board version; a "Transfer Scroll" with an 8-World Carousel and a Timbuktu-gated bank; a "Science Expansion Module" with mod-8 damage and Black-Hole-Grappling-as-7-astrophysical-phenomena) are logged as reference only — real material, never chosen as the active direction.
3. **Scarab Seals** (129 emoji-coded UI badges) — designed, never wired into any build.
4. Whether the full Rule-of-Nine character creator, the other 7 continents, and Nakikaru's deeper governance layer get built as more code, or stay reference — open, pending direction.

---

*If you're a fresh AI picking this up: the fastest way to be useful is to ask which Part the person wants to work in before writing anything. This universe is real enough, and large enough, that guessing wrong costs real time.*
