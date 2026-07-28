# CCR / WIR — Game Overview
### Every mode. Every connection. Every world.

---

# EVERY MODE

## Shipped and playable right now (in `CCR_v14_FIELD_LIFE_WIR.html`)

- **⚔️ Arena Classic** — 1v1 duel. Real win condition isn't just HP to zero — a hidden Dissonance layer has to be exposed first.
- **🌌 Chemistry Gauntlet** — 5-wave survival run.
- **🐾 KoPani Bond Trial** — 5 Bond Petals, then a guardian encounter.
- **💿 IRaKodi Record Hunt** — 3 Echoes, then a guardian.
- **☀️ MELLA Match** — transformation mode, generates public Records.
- **🏈 Maze Run** — row 1 to row 10, 3 mobile blockers, tackles are real Triangle-Law clashes, JUKE costs SP.

## Shipped and playable right now (in `CCR_Realm_Walk.html`)

- **Free Roam** — the actual walkable overworld. Not a menu, a real map with a camera that follows you.
- **The Vinyl Playlist** (new) — your KoPani collection as a real, ongoing relationship: 5-petal bond growth, three care actions, not a one-time catch.
- **The Garden/Groove loop** — plant, grow across real days, press into a groove, load a KoPani into it.

## Playable right now (in `CCR_Octoverse.html`)

- **The Octoverse vertical slice** — one region, a real Crown Clash resolver, the 5-Petal Accord as actual choices, one combat encounter (the Nakikaru Sentinel).

## Designed, real, not yet built

- **Free Roam / MansaLife** (Thread A/D) — a broader life-sim layer: home, jobs, routines
- **Dojo Training** — footwork, Crown Read, Root Guard paths (partially real — the Dojo panel exists and takes Mansa Money, but as a simple claim, not a training minigame)
- **Story Mode / Realm Hallway** — the 6-chapter campaign structure already exists narratively (Doorwake → Heart Spiral → Halite Memory → World Garden → Living Archive → False Convergence → First Return) but isn't a separate playable mode, it's the story skin already wrapping the 6 shipped modes
- **Co-op Raids** — multiplayer against ecological/mechanical/dimensional threats
- **Sim Life** — home, rest, relationships, companion care, food, recovery (Realm Walk is the seed of this)
- **Rap Mode** — rhythm, lyrics, call-and-response, verbal tactics
- **Hallways and Door Worlds** — a grapple or collision can trigger a compact 4-door micro-world (short battle, puzzle, rhythm challenge, survival, animal encounter)
- **Snake and Stars** — board traversal, risk, climbing, falling
- **Reality Overwrite / Singularity / "Black-Sun"** — the 25 chaos mutators, explicitly ruled to be a contained anomaly mode layered on top of everything else, never the default
- **Guild, Vehicle, Home Building, Companion (Moto-Maji)** — Thread A modes, not carried into the shipped build

---

# EVERY CONNECTION

This is the part that's usually invisible until it's drawn out — how any of this actually reaches any other part of it.

- **Realm Walk → Combat Engine**: the Arena Bridge. Walk to Arena Commons, a real match opens in an iframe overlay, a result posts back, Mansa Money is awarded. One proven connection, currently used exactly once.
- **Realm Walk's Garden → the Playlist**: growing a seedling to maturity is the unlock condition for a KoPani's 4th bond petal (Shared Function). Two systems that already existed, wired together for the first time this session.
- **The Playlist → Mansa Money**: completing a bond (the 5th petal, Return) costs 3 MM. The KoPani economy and the money economy are the same economy.
- **KoPani mixing → real chemistry**: any two KoPani you've caught can be mixed to see their actual ΔEN, bond classification, and — if it's a real compound — its name and energy. This is the same bond-classification logic that also drives move generation in the Builder app. One formula, two different surfaces.
- **The Builder app → the real roster**: the Builder computes stats with the exact same formula the shipped engine uses, so anything it generates is provably "legal" in CCR terms, not just similarly-flavored.
- **BrainBloom/ARK's loop → WishBorn's loop**: both run the same 8-stage shape (Discover→Practice→Recall→Apply→Create→Cooperate→Teach→Return for skills; DreamSeed→Leaf→Orb→RootRealizer for emotion). Different names, same engine, not yet actually shared in code.
- **Attunement Strings → the grapple**: the shipped grapple/throw system speaks in String-Anchor language ("the string snaps taut," "no reciprocal ping") as direct flavor from that TV property, without importing its full authentication mechanic as literal rules.
- **The proposed Octopus World's connective tissue** (not yet built, fully designed):
  - The **head** (home/Dojo/Garden) is where a DreamSeed gets chosen
  - Each of the **8 arms** (the Philosophy Continents) is where that Seed's Leaves would actually grow
  - The Orb would return to the Garden at the head to burst into a RootRealizer
  - **Nakikaru** would live at the joints — every return trip from an arm back to the head, not fixed in one place
  - Every arm would get its **own Arena Bridge**, the same pattern reused 8 times instead of living once
  - The **Ring Mall** orbits above the whole shape, reached through Realm Transit — the existing 9th location that's currently just a name

---

# EVERY WORLD

## Real, walkable, shipped

- **Realm Walk's overworld** — 24×16 tiles, 9 named locations: Starter Home, Mansa Market, Kio-Mane Dojo, KoPani Grove, Arena Commons, Halite Yard, Record Library, Root Gardens, Realm Transit.
- **Octoverse Archipelago** — the one region of the deeper ruleset that's actually been built and walked, with 4 real nodes (Tide Pool, Soldering Pair, Free Ground DNA, Nakikaru Shrine).

## Named and designed, not yet walkable

- **The other 7 Philosophy Continents**: Lotus (Buddha), Ubuntu Savannah, Socratic Plateau, Tao Forest, Da Vinci Foundry, Nietzsche Ridge, Darwin Isles — each with a signature animal-pair hybrid and its own field principle.
- **Greenhollow Valley** and the rest of the ARK/BrainBloom map — Echo Canopy, Jenga Reach, Kemia Wetlands, Nuru Circuit City, Sanaa Foldlands, Amani Basin, Mansa Commons, Motion Wilds — a second, overlapping regional layout from a different draft that never got reconciled with the Continents.
- **The Ring Mall** — rings around a planet, one ring per WIR franchise.
- **LEXARA** — the Story World where books and ideas function as terrain, home to the 5 Dissonance lieutenants.
- **HALITE, UMBARA, COGNARA** — three named worlds from the Science Expansion thread, each with its own terrain-elemental "jump" mechanic; COGNARA specifically maps real brain regions onto terrain.
- **The 8-World Carousel** — Thread D's own separate world structure, never reconciled with the Continents or with LEXARA/HALITE/UMBARA/COGNARA.
- **The Attuned Star's setting** — wherever Abukani actually lives and skates; connected to CCR only through the grapple's borrowed language so far, never through shared geography.

## The unresolved overlap, named plainly

Right now there are at minimum **four different regional maps** for this universe that have never been laid on top of each other to check where they agree: the 8 Philosophy Continents, the ARK/Greenhollow regional layout, the 8-World Carousel, and the HALITE/UMBARA/COGNARA trio. The Octopus World proposal only resolves one of these (the Continents) into real geography. The other three still don't know where they'd stand relative to it.

---

*Every mode, connection, and world above was named directly somewhere in this project — nothing here was invented to fill a gap. Where two designs genuinely disagree about the same ground, this document says so instead of picking a winner.*
