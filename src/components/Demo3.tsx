import { useMemo, useState } from "react";
import {
  HOUSTON_872,
  buildLoopStructure,
  classifyStep,
  departureLedger,
  fullWalkStats,
  key,
  kick,
  loopWheelSets,
  loopsPerWheel,
  randomTour,
  rot,
  standardSuperperm,
  stringToPath,
  weight,
  wheelOfPerm,
} from "../lib/perms";
import { useStepper } from "../lib/anim";
import {
  AbsorptionMap,
  ExactCoverTilingMap,
  KickVillageMap,
  LoopRegionMap,
  PermWorldMap,
  RotationVillageMap,
  TilingCell,
} from "./PixelMaps";
import { Btn, Callout, Note, P, Panel, PermText, PlayBar, Wide } from "./ui";
import TeX, { V, VarKey } from "../lib/tex";
import { DemoErrorBoundary } from "./DemoErrorBoundary";

const STRUCT = buildLoopStructure(6);
const REGION_WHEELS = loopWheelSets(STRUCT);
const GREEDY_PATH = stringToPath(standardSuperperm(6), 6);
const HOUSTON_PATH = stringToPath(HOUSTON_872.split(""), 6);

/* ------------------------------------------------------------------ */
/*  Demo 9 · rotation clans                                             */
/* ------------------------------------------------------------------ */

export function WheelViz() {
  const [sel, setSel] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const wheel = useMemo(() => wheelOfPerm(sel), [sel]);
  const player = useStepper(6, { speed: 700 });

  const walking = player.step > 0;
  const shown = walking ? wheel[(player.step - 1) % 6] : sel;
  const visited = new Set(wheel.slice(0, Math.max(1, player.step)).map(key));

  return (
    <DemoErrorBoundary title="Rotation Clan Demo Error">
      <div className="space-y-4">
        <PlayBar
          playing={player.playing}
          onToggle={player.toggle}
          onReset={player.reset}
          onSkip={player.skipToEnd}
          speed={player.speed}
          onSpeed={player.setSpeed}
          playLabel="walk one lap"
          label={`house ${Math.min(player.step, 6)}/6`}
        />

        <RotationVillageMap
          wheel={wheel}
          selected={shown}
          visitedKeys={walking ? visited : undefined}
          onSelect={(p) => {
            setSel(p);
            player.reset();
          }}
          title="Rotation clan"
          subtitle={walking ? `lap in progress · ${player.step - 1} tolls paid` : "click a house to re-centre"}
        />

      </div>
    </DemoErrorBoundary>
  );
}

/* ------------------------------------------------------------------ */
/*  NEW Demo 9B · The Kick (Moving between rotation clans)              */
/* ------------------------------------------------------------------ */

export function KickDemo() {
  const [start, setStart] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const kicked = useMemo(() => kick(start), [start]);
  const player = useStepper(2, { speed: 800 });

  return (
    <DemoErrorBoundary title="The Kick Demo Error">
      <Panel label="The Kick: traveling between rotation clans" className="space-y-4">
        <Note>
          How do you move between two different rotation clans? By using a special move called a{" "}
          <strong>Kick</strong>: swap the first two symbols and move them to the back. For example,{" "}
          <PermText p={start} /> becomes <PermText p={kicked} />. This costs exactly <strong>2</strong> tolls
          and lands in a completely new rotation clan!
        </Note>

        <PlayBar
          playing={player.playing}
          onToggle={player.toggle}
          onReset={player.reset}
          onSkip={player.skipToEnd}
          speed={player.speed}
          onSpeed={player.setSpeed}
          playLabel="take the kick bridge"
          label={player.step === 0 ? "at Clan A" : "crossed bridge to Clan B"}
        />

        <Wide>
          <KickVillageMap from={start} to={kicked} crossed={player.step >= 1} />
        </Wide>

        <div className="flex flex-wrap gap-2">
          <Btn variant="soft" onClick={() => setStart([1, 2, 3, 4, 5, 6])}>
            start at 123456
          </Btn>
          <Btn variant="soft" onClick={() => setStart([1, 3, 2, 4, 5, 6])}>
            start at 132456
          </Btn>
          <Btn
            variant="soft"
            onClick={() => {
              const p = STRUCT.perms[Math.floor(Math.random() * 720)];
              setStart(p);
            }}
          >
            random clan
          </Btn>
        </div>
      </Panel>
    </DemoErrorBoundary>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo 9C · why leaving a clan must be a kick                        */
/* ------------------------------------------------------------------ */

const LEDGERS = [
  { label: "classical greedy · 873", path: GREEDY_PATH },
  { label: "Houston's record · 872", path: HOUSTON_PATH },
];

export function KickNecessityDemo() {
  const [open, setOpen] = useState(false);
  const [u, setU] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [which, setWhich] = useState(0);

  // Classify every one of the 719 possible next moves, live.
  const census = useMemo(() => {
    const rotation: number[][] = [];
    const kickTargets: number[][] = [];
    const skip: number[][] = [];
    let costlyExit = 0;
    for (const p of STRUCT.perms) {
      if (key(p) === key(u)) continue;
      switch (classifyStep(u, p)) {
        case "rotation":
          rotation.push(p);
          break;
        case "skip":
          skip.push(p);
          break;
        case "kick":
          kickTargets.push(p);
          break;
        default:
          costlyExit++;
      }
    }
    return { rotation, kickTargets, skip, costlyExit };
  }, [u]);

  const ledger = useMemo(() => departureLedger(LEDGERS[which].path), [which]);
  const floor = 719 + 119; // every step ≥ 1, every one of the ≥119 departures ≥ 2

  return (
    <DemoErrorBoundary title="Kick necessity demo error">
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full border-4 border-ink bg-[#f1ecff] px-5 py-3 text-left shadow-[5px_5px_0_#5b3fbf] transition-colors hover:bg-[#e8e0ff]"
          aria-expanded={open}
        >
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
            {open ? "▾ hide — " : "▸ show — "}
            why leaving a clan is always a kick
          </span>
        </button>

        {open && (
          <Panel label="Why leaving a clan is always a kick" className="mt-4 space-y-4">
            <Note>
          We keep saying “take a kick to reach the next clan”. Here is why there is no
          alternative. Every possible next move from a permutation is sorted below by price, and
          by whether it stays in the clan or leaves it — all 719 of them, checked live.
        </Note>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-soft">standing at</span>
          <span className="border-2 border-ink bg-white px-2 py-1 font-mono font-bold">
            <PermText p={u} />
          </span>
          <Btn variant="soft" onClick={() => setU(STRUCT.perms[Math.floor(Math.random() * 720)])}>
            stand somewhere else
          </Btn>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-3 border-emerald-700 bg-[#e3f2d6] px-4 py-3 shadow-[3px_3px_0_#1f7a5c]">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-800">price 1 · stays</div>
            <div className="font-mono text-2xl font-bold">{census.rotation.length}</div>
            <div className="mt-1 font-mono text-[13px]">
              {census.rotation.map((p) => key(p)).join(", ") || "—"}
            </div>
            <div className="mt-1 text-[13px] text-ink-soft">the rotation</div>
          </div>

          <div className="border-3 border-ink bg-[#fff2cd] px-4 py-3 shadow-[3px_3px_0_#1d1e33]">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold">price 2–5 · stays</div>
            <div className="font-mono text-2xl font-bold">{census.skip.length}</div>
            <div className="mt-1 font-mono text-[13px]">
              {census.skip.map((p) => key(p)).join(", ") || "—"}
            </div>
            <div className="mt-1 text-[13px] text-ink-soft">
              double, triple … rotations: they skip houses you still owe
            </div>
          </div>

          <div className="border-3 border-ink bg-[#fff2cd] px-4 py-3 shadow-[3px_3px_0_#1d1e33]">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold">price 2 · leaves</div>
            <div className="font-mono text-2xl font-bold">{census.kickTargets.length}</div>
            <div className="mt-1 font-mono text-[13px]">
              {census.kickTargets.map((p) => key(p)).join(", ") || "—"}
            </div>
            <div className="mt-1 text-[13px] text-ink-soft">the kick — the only cheap way out</div>
          </div>

          <div className="border-3 border-ember bg-[#ffe6da] px-4 py-3 shadow-[3px_3px_0_#b23a48]">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-ember">price 3+ · leaves</div>
            <div className="font-mono text-2xl font-bold">{census.costlyExit}</div>
            <div className="mt-1 text-[13px] text-ink-soft">every other clan in the world</div>
          </div>
        </div>

        <Callout variant="proof" title="Why there is exactly one cheap exit">
          <P>
            A move costs 2 exactly when the last four symbols of where you are match the first
            four symbols of where you land. Standing at <PermText p={u} />, that forces the
            destination to begin <PermText p={u.slice(2)} /> and to end with the two leftover
            symbols <PermText p={[u[0], u[1]]} /> in some order. There are only two ways to
            order two symbols, so there are only ever two price-2 moves:
          </P>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="border-2 border-ink bg-white/70 px-3 py-2">
              <div className="font-mono font-bold">
                <PermText p={[...u.slice(2), u[0], u[1]]} />
              </div>
              <div className="text-[14px] text-ink-soft">original order — this is just two rotations, still in the clan</div>
            </div>
            <div className="border-2 border-ink bg-white/70 px-3 py-2">
              <div className="font-mono font-bold">
                <PermText p={kick(u)} />
              </div>
              <div className="text-[14px] text-ink-soft">swapped order — the kick, and it lands in a new clan</div>
            </div>
          </div>
          <P className="mt-2">
            So the cheapest possible way to leave a clan costs 2, and the kick is the only
            move that achieves it. Any other exit costs 3 or more.
          </P>
        </Callout>

        <Callout variant="idea" title="A quick proof that non-kick exits cannot be affordable">
          <P>
            A full tour makes 719 moves and must set foot in all 120 clans, so it changes clan at
            least 119 times. Price every move at its cheapest legal value: an in-clan move costs at
            least 1, and a clan change costs at least 2. That alone
            gives
          </P>
          <TeX block>
            {"\\textcolor{#b23a48}{w} \\;\\ge\\; \\underbrace{(719 - J)}_{\\text{inside clans}} \\;+\\; \\underbrace{2J}_{\\text{departures}} \\;=\\; 719 + J \\;\\ge\\; 838"}
          </TeX>
          <P>
            Now suppose <TeX>K</TeX> of those departures are <em>not</em> kicks. We just proved
            each of those costs at least 3 rather than 2, so each one adds a character on top:
          </P>
          <TeX block>{"\\textcolor{#b23a48}{w} \\;\\ge\\; 838 + K"}</TeX>
          <P>
            Every non-kick exit is therefore pure waste — one character thrown away that no
            later cleverness can win back. In particular, a tour with even one such exit cannot
            attain the kick-only baseline. Near the lower bound the slack is tiny, so expensive
            exits are a strictly limited resource, not something a shortest tour can use freely.
            The two champion walks let you inspect that budget directly:
          </P>
          <p className="mt-2 border-l-4 border-gold pl-3 text-[14px] leading-relaxed text-ink-soft">
            Precise claim: this does not by itself prove that an optimal tour uses no expensive
            exits at all. It proves the stronger-looking intuition correctly: a non-kick exit
            can never help you save length; it only spends one extra character of the very small
            budget left above the kick-only floor.
          </p>
        </Callout>

        <div className="flex flex-wrap gap-2">
          {LEDGERS.map((l, i) => (
            <Btn key={l.label} variant={i === which ? "primary" : "soft"} onClick={() => setWhich(i)}>
              {l.label}
            </Btn>
          ))}
        </div>

        <div className="overflow-x-auto border-3 border-ink shadow-[3px_3px_0_#1d1e33]">
          <table className="w-full min-w-[26rem] text-left font-mono text-[14px]">
            <tbody>
              {[
                ["moves in total", ledger.steps],
                ["cheap rotations inside a clan", ledger.rotations],
                ["skips inside a clan (wasteful)", ledger.skips],
                ["clan departures", ledger.departures],
                ["…of which are kicks (price 2)", ledger.kickDepartures],
                ["…of which cost 3 or more", ledger.costlyDepartures],
                ["cheapest conceivable total", floor],
                ["actual total cost w", ledger.wt],
              ].map(([k, v], i) => (
                <tr key={i} className={i % 2 ? "bg-[#f3ead0]" : "bg-[#fffbe9]"}>
                  <td className="px-3 py-1.5 text-ink-soft">{k}</td>
                  <td className="px-3 py-1.5 text-right font-bold">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-4 border-gold bg-[#fff2cd] px-4 py-3 shadow-[5px_5px_0_#b26a12]">
          {ledger.costlyDepartures === 0 ? (
            <>
              Every single one of the {ledger.kickDepartures} clan departures in this champion
              is a kick. Not one expensive exit anywhere — exactly as the ledger predicts.
            </>
          ) : (
            <>
              This walk uses {ledger.kickDepartures} kicks and only {ledger.costlyDepartures}{" "}
              expensive exits. Record-holders hoard cheap exits, because each expensive one costs
              a character they cannot get back.
            </>
          )}
        </div>
          </Panel>
        )}
      </div>
    </DemoErrorBoundary>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo 10 · the 2-loop explorer (with labels & zoom toggle)          */
/* ------------------------------------------------------------------ */

function twoloopWalk(start: number[]): number[][] {
  const seen = new Set<string>();
  const out: number[][] = [];
  let u = start;
  while (!seen.has(key(u))) {
    seen.add(key(u));
    out.push(u);
    for (let i = 0; i < 5; i++) {
      u = rot(u);
      seen.add(key(u));
      out.push(u);
    }
    u = kick(u);
  }
  return out;
}

export function LoopExplorer() {
  const [start, setStart] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [input, setInput] = useState("123456");
  const [zoom, setZoom] = useState<"local" | "world">("local");
  const walk = useMemo(() => twoloopWalk(start), [start]);
  const player = useStepper(walk.length, { speed: 190 });

  const loopId = STRUCT.genOf.get(key(start)) ?? 0;
  const gens = STRUCT.gensOfLoop[loopId];
  return (
    <DemoErrorBoundary title="2-Loop Explorer Error">
      <Panel label="Demo 11 · 2-loop region (30 houses in 5 clans)" className="space-y-4">
        <Note>
          Clans are joined into circuits. Lap a clan, take a <strong>kick bridge</strong> (cost 2),
          and you land in a new clan. Five kicks bring you home, touring 30 permutations in a{" "}
          <strong>2-loop region</strong>. There are 144 such regions in the world. Switch to the
          overworld to lift the six regions containing the selected clan above a shared map.
        </Note>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={input}
            onChange={(e) => {
              const v = e.target.value.replace(/[^1-6]/g, "").slice(0, 6);
              setInput(v);
              if (v.length === 6 && new Set(v.split("")).size === 6) setStart(v.split("").map(Number));
            }}
            className="w-40 border-3 border-ink bg-[#fffbe9] px-3 py-1.5 font-mono text-[15px] shadow-[inset_2px_2px_0_rgba(29,30,51,0.12)] outline-none focus:border-accent"
          />
          <Btn
            variant="soft"
            onClick={() => {
              const p = STRUCT.perms[Math.floor(Math.random() * 720)];
              setStart(p);
              setInput(key(p));
            }}
          >
            random start
          </Btn>

          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-[12px] font-bold uppercase text-ink-soft">map view:</span>
            <Btn variant={zoom === "local" ? "primary" : "soft"} onClick={() => setZoom("local")}>
              zoomed (30 houses)
            </Btn>
            <Btn variant={zoom === "world" ? "primary" : "soft"} onClick={() => setZoom("world")}>
              overworld (144 regions)
            </Btn>
          </div>
        </div>

        <PlayBar
          playing={player.playing}
          onToggle={player.toggle}
          onReset={player.reset}
          onSkip={player.skipToEnd}
          speed={player.speed}
          onSpeed={player.setSpeed}
          label={`house ${player.step}/${walk.length}`}
        />

        <Wide>
          <LoopRegionMap
            walk={walk}
            shown={player.step}
            generators={gens}
            zoom={zoom}
            clans={STRUCT.wheels}
            regions={REGION_WHEELS}
          />
        </Wide>

        <div className="border-4 border-gold bg-[#fff2cd] px-4 py-3 shadow-[5px_5px_0_#b26a12]">
          Every 2-loop region has exactly <strong>5 generator gates</strong> (orange roofs). A traveller
          arriving from outside can ONLY enter this region by landing on one of these five gates!
        </div>
      </Panel>
    </DemoErrorBoundary>
  );
}

/* ------------------------------------------------------------------ */
/*  Arc demo                                                           */
/* ------------------------------------------------------------------ */

export function ArcDemo() {
  const steps = [
    { label: "123456", cost: null, arc: 1 },
    { label: "234561", cost: 1, arc: 1 },
    { label: "345612", cost: 1, arc: 1 },
    { label: "456123", cost: 1, arc: 1 },
    { label: "612354", cost: 2, arc: 2 },
    { label: "123546", cost: 1, arc: 2 },
    { label: "235461", cost: 2, arc: 3 },
    { label: "354612", cost: 1, arc: 3 },
  ];

  return (
    <Panel label="Arc picture · cheap runs separated by jumps" className="space-y-4">
      <Note>
        Read left to right. A cost-1 rotation keeps extending the same arc. The moment a
        link costs 2 or more, the current arc stops and a new one begins.
      </Note>
      <div className="overflow-x-auto border-3 border-ink bg-[#f3ead0] p-4 shadow-[3px_3px_0_#1d1e33]">
        <div className="flex min-w-[760px] items-start gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              {i > 0 && (
                <div className="mt-7 text-center">
                  <div
                    className={`border-2 border-ink px-2 py-0.5 font-mono text-[13px] font-bold ${
                      (s.cost ?? 1) === 1 ? "bg-emerald-200 text-emerald-900" : "bg-[#ffe6da] text-ember"
                    }`}
                  >
                    {s.cost}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                    {(s.cost ?? 1) === 1 ? "same arc" : "jump"}
                  </div>
                </div>
              )}
              <div>
                <div
                  className={`border-3 border-ink px-3 py-2 font-mono text-[14px] font-bold shadow-[2px_2px_0_#1d1e33] ${
                    s.arc === 1 ? "bg-[#e3f2d6]" : s.arc === 2 ? "bg-[#fff2cd]" : "bg-[#f1ecff]"
                  }`}
                >
                  {s.label}
                </div>
                <div className="mt-1 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  arc {s.arc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-4 border-accent bg-[#f1ecff] px-4 py-3 shadow-[5px_5px_0_#5b3fbf]">
        This picture has 3 arcs and 2 jumps. In general: <TeX>R</TeX> arcs means exactly{" "}
        <TeX>R-1</TeX> jumps.
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Region neighbourhood and coverage demos                            */
/* ------------------------------------------------------------------ */

export function RegionNeighborhoodDemo() {
  return (
    <Panel label="Zoomed out · neighbouring 2-loop regions" className="space-y-4">
      <Note>
        This board shows rotation clans rather than individual houses. One coloured tile
        is one 2-loop region; each region contains five clans. Regions overlap in the full
        720-house world, so a region is a neighbourhood, not an isolated island.
      </Note>
      <Wide>
        <ExactCoverTilingMap
          cells={COVER.cells}
          revealedRegions={8}
          highlightRegion={0}
          title="Neighbouring 2-loop regions"
          subtitle="one colour = one 30-house region; five squares per region"
        />
      </Wide>
      <div className="border-4 border-gold bg-[#fff2cd] px-4 py-3 shadow-[5px_5px_0_#b26a12]">
        In the full universe, every clan belongs to {COVER.perWheel} different possible regions.
        Later, Case B will choose exactly one region for each clan.
      </div>
    </Panel>
  );
}

export function RegionCoverageDemo() {
  return (
    <Panel label="Why 24 regions is the first possible number" className="space-y-4">
      <Note>
        One region contains 5 clans, and each clan contains 6 houses. Thus one region
        accounts for 5 × 6 = 30 houses. To have enough region-capacity for all 720 houses,
        you need 24 regions.
      </Note>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["one region", "5 clans"],
          ["one clan", "6 houses"],
          ["one region", "30 houses"],
          ["twenty-four regions", "720 houses"],
        ].map(([a, b]) => (
          <div key={a} className="border-3 border-ink bg-[#fffbe9] p-3 text-center shadow-[3px_3px_0_#1d1e33]">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">{a}</div>
            <div className="font-mono text-xl font-bold text-var-v">{b}</div>
          </div>
        ))}
      </div>
      <Wide>
        <ExactCoverTilingMap
          cells={COVER.cells}
          revealedRegions={24}
          title="24 regions have exactly enough room"
          subtitle="24 × 5 clans = 120 clans = 720 houses"
        />
      </Wide>
      <div className="border-4 border-emerald-700 bg-[#e3f2d6] px-4 py-3 shadow-[5px_5px_0_#1f7a5c]">
        This picture gives the right scale: 24 regions is the first number large enough to cover
        the whole world. The generator-gate argument above explains why jumps force at least
        this many regions in the classical lower bound.
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo 12 · absorption capacity (showing legal vs overflow stranded)  */
/* ------------------------------------------------------------------ */

const ABSORPTION_PRESETS: { label: string; jumps: number; regions: number; note: string }[] = [
  {
    label: "try to cheat with 20 regions",
    jumps: 119,
    regions: 20,
    note: "A real tour makes at least 119 jumps. Twenty regions offer only 100 gates, so 19 jumps have nowhere to land.",
  },
  {
    label: "the legal minimum: 24 regions",
    jumps: 119,
    regions: 24,
    note: "Twenty-four regions offer 120 gates, just enough for 119 jumps. This is why v can never be smaller than 24.",
  },
  {
    label: "a 100-jump walk on 19 regions",
    jumps: 100,
    regions: 19,
    note: "Even a walk with fewer jumps is not free: 100 jumps need 20 regions, so 19 leaves 5 jumps stranded.",
  },
  {
    label: "the same walk on 20 regions",
    jumps: 100,
    regions: 20,
    note: "Twenty regions is exactly enough for 100 jumps. Nothing is wrong with a 100-jump walk — it simply forces v ≥ 20.",
  },
];

export function AbsorptionDemo() {
  const [preset, setPreset] = useState(0);
  const [jumps, setJumps] = useState(ABSORPTION_PRESETS[0].jumps);
  const [regions, setRegions] = useState(ABSORPTION_PRESETS[0].regions);
  const needed = Math.ceil(jumps / 5);
  const player = useStepper(jumps, { speed: 30 });

  const placed = player.step;
  const capacity = regions * 5;
  const overflow = Math.max(0, placed - capacity);

  return (
    <DemoErrorBoundary title="Absorption Capacity Demo Error">
      <Panel label="Demo 12 · absorption capacity: what happens if you try too few regions?" className="space-y-4">
        <Note>
          Each region offers exactly 5 gates, and every jump has to land on one. So the real
          question is: <em>how few regions can a tour possibly get away with?</em> Pick a scenario
          and watch the jumps arrive one at a time — when the gates run out, the remaining jumps
          have nowhere to go and the walk is impossible.
        </Note>

        <div className="flex flex-wrap gap-2">
          {ABSORPTION_PRESETS.map((p, i) => (
            <Btn
              key={p.label}
              variant={i === preset ? "primary" : "soft"}
              onClick={() => {
                setPreset(i);
                setJumps(p.jumps);
                setRegions(p.regions);
              }}
            >
              {p.label}
            </Btn>
          ))}
        </div>

        <div className="border-l-4 border-gold bg-[#fff2cd] px-4 py-2 text-[16px] leading-relaxed">
          {ABSORPTION_PRESETS[preset].note}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-3 border-ink bg-[#fffbe9] p-3 shadow-[3px_3px_0_#1d1e33]">
            <div className="flex justify-between font-mono text-sm font-bold">
              <span>jumps made (R - 1)</span>
              <span className="text-ember">{jumps}</span>
            </div>
            <input
              type="range"
              min={60}
              max={150}
              value={jumps}
              onChange={(e) => setJumps(+e.target.value)}
              className="mt-2 w-full"
            />
            <div className="font-mono text-[11px] text-ink-soft">needs ≥ {needed} regions</div>
          </div>

          <div className="border-3 border-ink bg-[#fffbe9] p-3 shadow-[3px_3px_0_#1d1e33]">
            <div className="flex justify-between font-mono text-sm font-bold">
              <span>open 2-loop regions (v)</span>
              <span className="text-var-v">{regions}</span>
            </div>
            <input
              type="range"
              min={10}
              max={32}
              value={regions}
              onChange={(e) => setRegions(+e.target.value)}
              className="mt-2 w-full"
            />
            <div className="font-mono text-[11px] text-ink-soft">provides {capacity} landing gates</div>
          </div>
        </div>

        <PlayBar
          playing={player.playing}
          onToggle={player.toggle}
          onReset={player.reset}
          onSkip={player.skipToEnd}
          speed={player.speed}
          onSpeed={player.setSpeed}
          speeds={[
            ["slow", 100],
            ["normal", 30],
            ["fast", 10],
          ]}
          label={`${placed}/${jumps} jumps placed`}
        />

        <Wide>
          <AbsorptionMap regions={needed} maxRegions={regions} placed={placed} />
        </Wide>

        {overflow > 0 ? (
          <div className="animate-pop border-4 border-ember bg-[#ffe6da] px-4 py-3 shadow-[5px_5px_0_#b23a48]">
            <strong>IMPOSSIBLE WALK:</strong> You have {jumps} jumps but only {regions} open regions ({capacity} gates).{" "}
            <strong>{overflow} jumps are stranded</strong> in red with no gate to land on! You MUST open at least{" "}
            <V n="v">v</V> = {needed} regions.
          </div>
        ) : (
          <div className="border-4 border-emerald-700 bg-[#e3f2d6] px-4 py-3 shadow-[5px_5px_0_#1f7a5c]">
            <strong>LEGAL CAPACITY:</strong> {regions} open regions provide {capacity} gates, which is enough to land all{" "}
            {jumps} jumps legally. The absorption lemma <V n="v">v</V> ≥ ⌈(R−1)/5⌉ holds!
          </div>
        )}
      </Panel>
    </DemoErrorBoundary>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo 13 · watching the HPV inequality hold                         */
/* ------------------------------------------------------------------ */

const WALKS: { label: string; path: number[][]; note: string }[] = [
  { label: "classical greedy · 873", path: GREEDY_PATH, note: "the recursive construction" },
  { label: "Houston's record · 872", path: HOUSTON_PATH, note: "the shortest string known" },
];

export function LiveChecker() {
  const [walkIdx, setWalkIdx] = useState(0);
  const [custom, setCustom] = useState<number[][] | null>(null);
  const [showRegions, setShowRegions] = useState(true);
  const path = custom ?? WALKS[walkIdx].path;
  const player = useStepper(path.length, { speed: 24 });

  const prefix = useMemo(() => path.slice(0, Math.max(1, player.step)), [path, player.step]);
  const stats = useMemo(() => fullWalkStats(prefix, STRUCT), [prefix]);

  // Tally of what each clan-to-clan hop cost so far.
  const hopTally = useMemo(() => {
    const t: Record<number, number> = {};
    for (let i = 1; i < prefix.length; i++) {
      const c = weight(prefix[i - 1], prefix[i]);
      if (c >= 2) t[c] = (t[c] ?? 0) + 1;
    }
    return t;
  }, [prefix]);
  const maxHop = Math.max(1, ...Object.values(hopTally));

  const rhs = stats.p + stats.c + stats.v - 2;
  const holds = stats.wt >= rhs;
  const finished = player.step >= path.length;

  return (
    <DemoErrorBoundary title="HPV Inequality Demo Error">
      <Panel label="Demo 13 · watch the inequality hold character by character" className="space-y-4">
        <Note>
          Press play and follow the traveller across all 720 houses. The four counters below are
          the exact variables in the HPV inequality <V n="w">w</V> ≥ <V n="p">p</V> + <V n="c">c</V> + <V n="v">v</V> − 2.
          Watch them update dynamically as the walk progresses!
        </Note>

        <div className="flex flex-wrap gap-2">
          {WALKS.map((w, i) => (
            <Btn
              key={w.label}
              variant={!custom && i === walkIdx ? "primary" : "soft"}
              onClick={() => {
                setCustom(null);
                setWalkIdx(i);
              }}
            >
              {w.label}
            </Btn>
          ))}
          <Btn variant="soft" onClick={() => setCustom(randomTour(6))}>
            random tour
          </Btn>
          <Btn variant={showRegions ? "primary" : "soft"} onClick={() => setShowRegions((s) => !s)}>
            {showRegions ? "hide 2-loop groups" : "show 2-loop groups"}
          </Btn>
        </div>

        <PlayBar
          playing={player.playing}
          onToggle={player.toggle}
          onReset={player.reset}
          onSkip={player.skipToEnd}
          speed={player.speed}
          onSpeed={player.setSpeed}
          speeds={[
            ["slow", 90],
            ["normal", 24],
            ["fast", 6],
          ]}
          label={`house ${player.step}/${path.length}`}
        />

        <Wide>
          <PermWorldMap
            n={6}
            path={prefix}
            title={custom ? "random tour" : WALKS[walkIdx].label}
            subtitle={`${stats.p}/720 houses · cost ${stats.wt}`}
            regionOf={showRegions ? COVER.labelToRegion : undefined}
          />
        </Wide>

        <div className="border-3 border-ink bg-[#f3ead0] p-4 shadow-[3px_3px_0_#1d1e33]">
          <div className="mb-2 font-mono text-[12px] font-bold uppercase tracking-wider text-ink-soft">
            what the hops between clans cost
          </div>
          <div className="space-y-1.5">
            {[2, 3, 4, 5, 6].map((c) => {
              const count = hopTally[c] ?? 0;
              const pct = maxHop > 0 ? (count / maxHop) * 100 : 0;
              return (
                <div key={c} className="flex items-center gap-2">
                  <span className="w-16 font-mono text-[13px] text-ink-soft">cost {c}</span>
                  <div className="h-4 flex-1 border-2 border-ink bg-white/60">
                    <div
                      className="h-full transition-[width] duration-150"
                      style={{
                        width: `${pct}%`,
                        background: c === 2 ? "#65c5a2" : c === 3 ? "#f0aa4f" : "#e8615d",
                      }}
                    />
                  </div>
                  <span className="w-20 text-right font-mono text-[13px] font-bold">
                    {count} × {c} = {count * c}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 font-mono text-[13px] text-ink-soft">
            cheap kicks are the bulk of the budget; every orange or red bar is a clan exit that
            cost more than it had to.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <VarKey n="p" value={stats.p} note="houses visited" />
          <VarKey n="c" value={stats.c} note="clans fully lapped" />
          <VarKey n="v" value={stats.v} note="2-loop regions entered" />
          <VarKey n="w" value={stats.wt} note="characters appended" />
        </div>

        <div
          className={`border-4 px-4 py-3 font-mono text-[16px] ${
            holds ? "border-emerald-700 bg-[#e3f2d6] shadow-[5px_5px_0_#1f7a5c]" : "border-ember bg-[#ffe6da]"
          }`}
        >
          <span className="var var-w">{stats.wt}</span> ≥ <span className="var var-p">{stats.p}</span> +{" "}
          <span className="var var-c">{stats.c}</span> + <span className="var var-v">{stats.v}</span> − 2 ={" "}
          {rhs} &nbsp; {holds ? "HOLDS ✓" : "VIOLATED ✗"}
        </div>

        {finished && !custom && (
          <div className="animate-pop border-4 border-accent bg-[#f1ecff] px-4 py-3 shadow-[5px_5px_0_#5b3fbf]">
            Final tally: length = 6 + <V n="w">w</V> = {6 + stats.wt}. The walk used{" "}
            <V n="v">v</V> = {stats.v} regions and completed <V n="c">c</V> = {stats.c} clans,
            and the inequality holds with total cost <V n="w">w</V> = {stats.wt}.
          </div>
        )}
      </Panel>
    </DemoErrorBoundary>
  );
}

/* ------------------------------------------------------------------ */
/*  NEW Demo 14 · Case B: Exact Cover Tiling                           */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Case B · the tiling argument, one step at a time                   */
/* ------------------------------------------------------------------ */

/**
 * Real data: the 24 entered loops of the classical greedy n=6 tour. The
 * certificate verifies these loops are an exact cover; deriving it directly
 * here avoids any expensive search in the browser.
 */
const COVER = (() => {
  const wheelSets = loopWheelSets(STRUCT);
  const chosen = [...new Set(
    fullWalkStats(GREEDY_PATH, STRUCT).targets
      .map((p) => STRUCT.genOf.get(key(p)))
      .filter((id): id is number => id !== undefined),
  )];
  const regionOfWheel = new Array<number>(STRUCT.wheels.length).fill(-1);
  chosen.forEach((loopId, regionIdx) => {
    wheelSets[loopId].forEach((wheelId) => {
      regionOfWheel[wheelId] = regionIdx;
    });
  });
  const cells: TilingCell[] = STRUCT.wheels.map((wheel, i) => {
    const label = wheel.map(key).sort()[0];
    return { label, region: regionOfWheel[i] };
  });
  const labelToRegion = new Map<string, number>();
  cells.forEach((c) => {
    if (c.region >= 0) labelToRegion.set(c.label, c.region);
  });
  return { chosen, cells, labelToRegion, perWheel: loopsPerWheel(STRUCT) };
})();

const CASE_B_STAGES = [
  {
    tag: "Step 1",
    head: "Count the seats",
    body: (
      <>
        Each 2-loop region holds exactly 30 houses, which is exactly 5 whole clans. If the
        traveller opens <V n="v">v</V> = 24 regions, those regions have room for 24 × 30 ={" "}
        <strong>720 houses</strong> — or, counting in clans, 24 × 5 = <strong>120 clans</strong>.
        The world contains exactly 720 houses in 120 clans. The capacity matches the world
        with nothing to spare.
      </>
    ),
  },
  {
    tag: "Step 2",
    head: "Everyone must get a seat",
    body: (
      <>
        The traveller has to visit all 720 houses, and he can only ever be inside a region he has
        opened. So every single house must lie in one of his 24 regions. Nobody is allowed to be
        left out.
      </>
    ),
  },
  {
    tag: "Step 3",
    head: "So no two regions may overlap",
    body: (
      <>
        Here is the squeeze. 24 regions provide exactly 120 clan-seats and there are exactly
        120 clans. If two regions were to share even one clan, they would waste a seat — the 24
        regions would then reach at most 119 clans, and some clan would be stranded with no way in.
        Below, two regions have been forced to overlap: watch a clan go dark.
      </>
    ),
  },
  {
    tag: "Step 4",
    head: "The only survivor is a perfect tiling",
    body: (
      <>
        Overlap is banned, so the 24 regions must fit together like tiles on a floor: every clan
        painted exactly once, no gaps and no double-cover. Mathematicians call this an{" "}
        <strong>exact cover</strong>. Watch a genuine one being laid down, region by region.
      </>
    ),
  },
  {
    tag: "Step 5",
    head: "A tiling takes away all the freedom",
    body: (
      <>
        Each clan belongs to {COVER.perWheel} different regions in general, but in a tiling only
        one of them is chosen — so each clan has exactly <strong>one</strong> open gate. A gate is
        the only way in, so the traveller enters each clan at a fixed house, and
        since he cannot come back through a second gate, he must lap all six houses in one go.
        That is 120 clans × 5 cheap steps = <strong>600 characters</strong> locked in before he
        has travelled between any clans at all.
      </>
    ),
  },
  {
    tag: "Step 6",
     head: "One freedom left: the order of the clans",
    body: (
      <>
        The only choice remaining is the order in which to visit the 120 clans, paying the
        hop cost between consecutive ones. That is a small travelling-salesman puzzle. There are
        exactly <strong>10,068</strong> possible tilings; relabelling the six symbols groups them
        into <strong>29</strong> genuinely different ones, and an exact solver checked all 29.
        The cheapest ordering that exists anywhere costs <strong>265</strong>.
      </>
    ),
  },
  {
    tag: "Step 7",
    head: "Case B is impossible",
    body: (
      <>
        Add it up: <V n="w">w</V> = 600 + 265 = <strong>865</strong>. But a string of length 867
        needs <V n="w">w</V> ≤ 861. A tour entering exactly 24 regions is therefore at least 4
        characters too expensive, and Case B collapses.
      </>
    ),
  },
];

export function ExactCoverDemo() {
  const [stage, setStage] = useState(0);

  // Region-by-region reveal used by stage 4 onwards.
  const laying = useStepper(24, { speed: 260 });

  const s = CASE_B_STAGES[stage];
  const collisionStage = stage === 2;

  // For the collision picture: pretend region 1 was swallowed by region 0, so
  // one of its clans is double-booked and another has nobody left to cover it.
  const collisionCells = useMemo<TilingCell[]>(() => {
    const region1 = COVER.cells
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.region === 1)
      .map(({ i }) => i);
    return COVER.cells.map((c, i) => {
      if (region1.length && i === region1[0]) return { ...c, region: 0 };
      return c;
    });
  }, []);

  const collisionMarks = useMemo(() => {
    const region1 = COVER.cells
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c.region === 1)
      .map(({ i }) => i);
    return region1.length >= 2
      ? { doubleBooked: region1[0], stranded: region1[region1.length - 1] }
      : null;
  }, []);

  const revealed =
    stage < 3 ? 0 : stage === 3 ? laying.step : 24;

  return (
    <DemoErrorBoundary title="Case B demo error">
      <Panel label="Demo 14 · Case B, one step at a time" className="space-y-4">
        <Note>
          This is the part of the proof that sounds hardest and is actually the most concrete.
          Take it one step at a time; each step is just counting.
        </Note>

        <div className="flex flex-wrap items-center gap-2">
          {CASE_B_STAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setStage(i)}
              className={`border-2 border-ink px-2.5 py-1 font-mono text-[12px] font-bold transition-all ${
                i === stage
                  ? "bg-accent text-white shadow-[3px_3px_0_#1d1e33]"
                  : i < stage
                    ? "bg-emerald-200 text-emerald-900"
                    : "bg-[#fffbe9] text-ink-soft hover:bg-[#f4d35e]"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <Btn variant="soft" onClick={() => setStage((x) => Math.max(0, x - 1))} disabled={stage === 0}>
              back
            </Btn>
            <Btn
              onClick={() => setStage((x) => Math.min(CASE_B_STAGES.length - 1, x + 1))}
              disabled={stage === CASE_B_STAGES.length - 1}
            >
              next step
            </Btn>
          </div>
        </div>

        <div className="border-4 border-accent bg-[#f1ecff] px-5 py-4 shadow-[5px_5px_0_#5b3fbf]">
          <div className="font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-accent">
            {s.tag} · {s.head}
          </div>
          <div className="mt-2 leading-relaxed text-ink">{s.body}</div>
        </div>

        {/* Step 1 gets a pure counting panel rather than the board. */}
        {stage === 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["1 region", "30 houses", "= 5 clans"],
              ["24 regions", "720 houses", "= 120 clans"],
              ["the world", "720 houses", "= 120 clans"],
            ].map(([a, b, c], i) => (
              <div
                key={a}
                className={`border-3 border-ink px-4 py-3 shadow-[3px_3px_0_#1d1e33] ${
                  i === 2 ? "bg-[#fff2cd]" : "bg-[#fffbe9]"
                }`}
              >
                <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">{a}</div>
                <div className="font-mono text-xl font-bold">{b}</div>
                <div className="font-mono text-[13px] text-ink-soft">{c}</div>
              </div>
            ))}
          </div>
        )}

        {stage >= 1 && (
          <>
            {stage === 3 && (
              <PlayBar
                playing={laying.playing}
                onToggle={laying.toggle}
                onReset={laying.reset}
                onSkip={laying.skipToEnd}
                speed={laying.speed}
                onSpeed={laying.setSpeed}
                playLabel="lay the tiles"
                label={`${laying.step}/24 regions placed`}
              />
            )}
            <Wide>
              <ExactCoverTilingMap
                cells={collisionStage ? collisionCells : COVER.cells}
                revealedRegions={collisionStage ? 24 : revealed}
                collision={collisionStage ? collisionMarks : null}
                title={
                  collisionStage
                    ? "What overlap would cost you"
                    : stage >= 4
                      ? "A finished tiling · 24 regions, 120 clans"
                      : "The tiling board · 120 clans"
                }
                subtitle={
                  collisionStage
                    ? "two regions share a clan, so one clan is stranded"
                    : undefined
                }
              />
            </Wide>
          </>
        )}

        {collisionStage && collisionMarks && (
          <div className="border-4 border-ember bg-[#ffe6da] px-4 py-3 shadow-[5px_5px_0_#b23a48]">
            The purple square is claimed twice. Because the 24 regions only ever had 120 seats,
            that double-booking leaves the red square with a question mark: no region contains it,
            so the traveller can never legally enter it. To reach it he would have to open a{" "}
            <strong>25th region</strong> — and that is Case A, which we have already ruled out.
          </div>
        )}

        {stage === 4 && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-3 border-ink bg-[#fffbe9] px-4 py-3 shadow-[3px_3px_0_#1d1e33]">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">gates per clan</div>
              <div className="font-mono text-2xl font-bold">1</div>
            </div>
            <div className="border-3 border-ink bg-[#fffbe9] px-4 py-3 shadow-[3px_3px_0_#1d1e33]">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">forced full laps</div>
              <div className="font-mono text-2xl font-bold">R = 120</div>
            </div>
            <div className="border-3 border-ink bg-[#fff2cd] px-4 py-3 shadow-[3px_3px_0_#1d1e33]">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">locked-in cost</div>
              <div className="font-mono text-2xl font-bold">600</div>
            </div>
          </div>
        )}

        {stage === 5 && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["possible tilings", "10,068"],
                ["after symmetry", "29"],
                ["cheapest ordering", "265"],
              ].map(([a, b]) => (
                <div key={a} className="border-3 border-ink bg-[#fffbe9] px-4 py-3 shadow-[3px_3px_0_#1d1e33]">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">{a}</div>
                  <div className="font-mono text-2xl font-bold">{b}</div>
                </div>
              ))}
            </div>

            {/* Mini TSP bar chart: 29 orbits, one bar each */}
            <div className="overflow-x-auto border-3 border-ink bg-[#f3ead0] p-4 shadow-[3px_3px_0_#1d1e33]">
              <div className="mb-2 font-mono text-[12px] font-bold uppercase tracking-wider text-ink-soft">
                Orbit TSP lower bounds (29 orbits × CP‑SAT certified)
              </div>
              <svg viewBox="0 0 860 220" className="w-full min-w-[760px]" role="img" aria-label="orbit TSP lower bound chart">
                <line x1="48" y1="170" x2="48" y2="20" stroke="#1d1e33" strokeWidth="2" />
                <line x1="48" y1="170" x2="850" y2="170" stroke="#1d1e33" strokeWidth="2" />
                {[260, 265, 270, 275].map((v) => {
                  const gy = 170 - ((v - 256) / 20) * 140;
                  return (
                    <g key={v}>
                      <line x1="44" y1={gy} x2="850" y2={gy} stroke="#1d1e33" strokeOpacity="0.12" strokeDasharray="4 4" />
                      <text x="40" y={gy + 4} textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#5a5268">{v}</text>
                    </g>
                  );
                })}
                {[
                  267, 267, 267, 267, 267, 267, 267, 267,
                  268, 268, 268, 268, 268,
                  269, 269, 269, 269,
                  270, 270, 270, 270, 270,
                  271, 271, 271,
                  272, 272,
                  273, 273,
                  265,
                ].map((val, i) => {
                  const x = 60 + i * 27;
                  const h = ((val - 256) / 20) * 140;
                  const y = 170 - h;
                  const fill = val === 265 ? "#e8615d" : val <= 269 ? "#f0aa4f" : "#65c5a2";
                  return (
                    <g key={i}>
                      <rect x={x - 10} y={y} width="20" height={h} fill={fill} stroke="#0b1c1c" strokeWidth="1" />
                      <text x={x} y={y - 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="7" fontWeight="700" fill="#1d1e33">{val}</text>
                    </g>
                  );
                })}
                <text x="450" y="15" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill="#1d1e33">
                  29 orbits · all ≥ 265 · 28 optimal · cheapest: 265
                </text>
              </svg>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-ink-soft">
                <span><span className="mr-1 inline-block h-2.5 w-2.5 bg-[#65c5a2]" />≥ 270</span>
                <span><span className="mr-1 inline-block h-2.5 w-2.5 bg-[#f0aa4f]" />267–269</span>
                <span><span className="mr-1 inline-block h-2.5 w-2.5 bg-[#e8615d]" />265 (tight)</span>
              </div>
            </div>
          </div>
        )}

        {stage === 6 && (
          <div className="animate-pop border-4 border-emerald-700 bg-[#e3f2d6] px-4 py-4 shadow-[5px_5px_0_#1f7a5c]">
            <TeX block>
              {"\\textcolor{#b23a48}{w} \\;=\\; \\underbrace{600}_{\\text{forced laps}} \\;+\\; \\underbrace{265}_{\\text{cheapest clan order}} \\;=\\; 865 \\;>\\; 861"}
            </TeX>
            <div className="mt-1 leading-relaxed">
              Case A needed 25 or more regions and cost at least 862. Case B allows exactly 24 and
              costs at least 865. There is no third option, so every tour costs at least 862 and{" "}
              <strong>s(6) ≥ 868</strong>.
            </div>
          </div>
        )}

      </Panel>
    </DemoErrorBoundary>
  );
}
