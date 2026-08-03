import { useMemo, useState } from "react";
import {
  HOUSTON_872,
  allPerms,
  factorial,
  key,
  pathToString,
  randomTour,
  rot,
  standardSuperperm,
  stringToPath,
  weight,
} from "../lib/perms";
import { useStepper } from "../lib/anim";
import { OverlapRoadMap, PermWorldMap, TopDownTspMap } from "./PixelMaps";
import { Btn, Note, Panel, PermChip, PermText, PlayBar, Str, Wide } from "./ui";
import { CostLensLegend } from "./CostLens";
import { FederationMainDemo4 } from "./RegionLab";

/* ------------------------------------------------------------------ */
/*  Demo 4 · the sliding overlap: where does "cost" come from?         */
/* ------------------------------------------------------------------ */

const SLIDE_PAIRS: [number[], number[], string][] = [
  [[1, 2, 3], [2, 3, 1], "a rotation: the biggest possible overlap, so the cheapest possible step"],
  [[1, 2, 3], [3, 1, 2], "still cheap, but one character worse"],
  [[1, 2, 3], [2, 1, 3], "a poor match: nothing can be reused"],
  [[1, 2, 3], [1, 3, 2], "nothing lines up at all"],
];

interface SlideFrame {
  /** characters of b that sit under a's tail; n = words written separately */
  k: number;
  matches: boolean[];
  ok: boolean;
  start: boolean;
}

export function OverlapSlider() {
  const [pair, setPair] = useState(0);
  const [a, b, verdict] = SLIDE_PAIRS[pair];
  const n = a.length;

  // Frames of the slide: k = n (words apart) → n-1 → n-2 → ... → 0.
  const candidates = useMemo<SlideFrame[]>(() => {
    const out: SlideFrame[] = [{ k: n, matches: [], ok: false, start: true }];
    for (let k = n - 1; k >= 0; k--) {
      const matches: boolean[] = [];
      for (let i = 0; i < k; i++) matches.push(a[n - k + i] === b[i]);
      out.push({ k, matches, ok: matches.every(Boolean), start: false });
    }
    return out;
  }, [a, b, n]);

  // First frame (after the start frame) where every shared column agrees.
  const best = candidates.findIndex((c) => c.ok);
  const player = useStepper(best, { speed: 900 });
  const shownIndex = Math.min(player.step, best);
  const current = candidates[shownIndex];
  const settled = player.step >= best;
  const cost = n - current.k;

  const cell = "flex h-11 w-11 items-center justify-center border-3 border-ink font-mono text-xl font-bold";

  return (
    <Panel label="Demo 4 · where the cost of a step comes from" className="space-y-4">
      <Note>
        Two permutations can share characters only if the <em>tail</em> of the first is
        literally the <em>head</em> of the second. Press play and watch the second word
        slide left: it first tries to share the most characters, and gives up one at a
        time until the letters agree.
      </Note>

      <div className="flex flex-wrap gap-2">
        {SLIDE_PAIRS.map(([x, y], i) => (
          <Btn
            key={i}
            variant={i === pair ? "primary" : "soft"}
            onClick={() => {
              setPair(i);
              player.reset();
            }}
          >
            {key(x)} then {key(y)}
          </Btn>
        ))}
      </div>

      <PlayBar
        playing={player.playing}
        onToggle={player.toggle}
        onReset={player.reset}
        onSkip={player.skipToEnd}
        speed={player.speed}
        onSpeed={player.setSpeed}
        playLabel="slide it"
        label={current.start ? "words written separately" : `trying overlap k = ${current.k}`}
      />

      <div className="space-y-2 border-3 border-ink bg-[#f3ead0] p-4 shadow-[3px_3px_0_#1d1e33]">
        {/* fixed first word */}
        <div className="flex gap-1">
          {a.map((d, i) => (
            <span key={i} className={`${cell} bg-white`}>
              {d}
            </span>
          ))}
        </div>

        {/* sliding second word */}
        <div className="flex gap-1" style={{ paddingLeft: `${(n - current.k) * 48}px` }}>
          {b.map((d, i) => {
            const inOverlap = !current.start && i < current.k;
            const good = inOverlap && current.matches[i];
            return (
              <span
                key={i}
                className={`${cell} ${
                  !inOverlap
                    ? "bg-[#fff2cd]"
                    : good
                      ? "bg-emerald-300"
                      : "bg-[#f19a9a]"
                }`}
              >
                {d}
              </span>
            );
          })}
        </div>

        <div className="pt-1 font-mono text-[14px] text-ink-soft">
          {current.start ? (
            <>
              start: the two words are written one after the other — nothing shared yet.
              Press play to slide <PermText p={b} /> left.
            </>
          ) : current.ok ? (
            <span className="font-bold text-emerald-700">
              every shared column agrees — overlap is k = {current.k}
            </span>
          ) : (
            <span className="font-bold text-ember">
              a column disagrees, so drop to k = {current.k - 1}
            </span>
          )}
        </div>
      </div>

      {settled && (
        <div className="animate-pop border-4 border-emerald-700 bg-[#e3f2d6] px-4 py-3 shadow-[5px_5px_0_#1f7a5c]">
          <div className="font-mono text-[15px]">
            best overlap <strong>k = {current.k}</strong> &nbsp;→&nbsp; you must append{" "}
            <strong>{cost}</strong> new character{cost === 1 ? "" : "s"} &nbsp;→&nbsp; chained
            result <PermText p={[...a, ...b.slice(current.k)]} />
          </div>
          <div className="mt-1 text-[15px] text-ink-soft">{verdict}.</div>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo 5 · the neighbourhood tour: every cost from one permutation   */
/* ------------------------------------------------------------------ */

export function OverlapLab() {
  const perms = useMemo(() => allPerms(3), []);
  const [a, setA] = useState(perms[0]);
  const others = useMemo(() => perms.filter((p) => key(p) !== key(a)), [perms, a]);

  const player = useStepper(others.length, { speed: 850 });
  const shown = Math.min(player.step, others.length);
  const b = others[Math.max(0, shown - 1)];

  const rotation = rot(a);

  return (
    <Panel label="Demo 5 · visit every neighbour and record the toll" className="space-y-4">
      <Note>
        Fix a starting permutation, then price every possible next step. Press play to send
        the traveller out to each neighbour in turn; the map shows the road and its toll
        gates, and the table below fills in as each price is discovered.
      </Note>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-soft">start at</span>
        {perms.map((p) => (
          <PermChip key={key(p)} p={p} selected={key(p) === key(a)} onClick={() => setA(p)} small />
        ))}
      </div>

      <PlayBar
        playing={player.playing}
        onToggle={player.toggle}
        onReset={player.reset}
        onSkip={player.skipToEnd}
        speed={player.speed}
        onSpeed={player.setSpeed}
        playLabel="tour the neighbours"
        label={`${shown}/${others.length} priced`}
      />

      <Wide>
        <OverlapRoadMap a={a} b={shown === 0 ? others[0] : b} />
      </Wide>

      <div className="grid gap-2 sm:grid-cols-5">
        {others.map((p, i) => {
          const c = weight(a, p);
          const revealed = i < shown;
          const isRot = key(p) === key(rotation);
          return (
            <div
              key={key(p)}
              className={`border-3 border-ink px-3 py-2 text-center font-mono shadow-[3px_3px_0_#1d1e33] transition-all ${
                !revealed
                  ? "bg-white/40 text-ink/25"
                  : isRot
                    ? "bg-emerald-200 text-emerald-900"
                    : "bg-[#fffbe9]"
              }`}
            >
              <div className="text-[15px] font-bold">{key(p)}</div>
              <div className="text-[13px]">{revealed ? `cost ${c}` : "…"}</div>
              {revealed && isRot && (
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide">rotation</div>
              )}
            </div>
          );
        })}
      </div>

      {player.done && (
        <div className="animate-pop border-4 border-gold bg-[#fff2cd] px-4 py-3 shadow-[5px_5px_0_#b26a12]">
          Out of all five neighbours, exactly one costs a single character:{" "}
          <PermText p={rotation} /> — the <strong>rotation</strong> of <PermText p={a} />,
          made by moving the first symbol to the back. Everything else costs 2 or 3. Cheap
          travel is rare, and that scarcity is what the whole lower bound exploits.
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo 6 · tour builder for n = 3, with a watchable optimal tour     */
/* ------------------------------------------------------------------ */

const OPTIMAL_3: number[][] = [
  [1, 2, 3],
  [2, 3, 1],
  [3, 1, 2],
  [2, 1, 3],
  [1, 3, 2],
  [3, 2, 1],
];

export function TourBuilder3() {
  const [path, setPath] = useState<number[][]>([]);
  const [auto, setAuto] = useState<number[][] | null>(null);

  const player = useStepper(auto ? auto.length : 0, { speed: 750 });
  const shownPath = auto ? auto.slice(0, player.step) : path;

  const s = pathToString(shownPath);
  const total = shownPath.length ? 3 + shownPath.slice(1).reduce((acc, p, i) => acc + weight(shownPath[i], p), 0) : 0;
  const complete = shownPath.length === 6;
  const optimal = complete && total === 9;

  const startAuto = (tour: number[][]) => {
    setAuto(tour);
    setPath([]);
    player.reset();
    setTimeout(player.play, 30);
  };

  const manualClick = (p: number[]) => {
    setAuto(null);
    setPath((old) => (old.some((q) => key(q) === key(p)) ? old : [...old, p]));
  };

  return (
    <Panel label="Demo 6 · chain the towns into one route" className="space-y-4">
      <Note>
        Any ordering of the six permutations, chained with maximum overlap, is a valid
        superpermutation. So the only question left is <em>which ordering is cheapest</em>.
        The permutations can be arranged into two clans of three: the <strong>123 clan</strong>{" "}
        and the <strong>213 clan</strong>. Each clan shares a{" "}
            <strong>rotation chain</strong> (which we will refer to as an <strong>arc</strong> later)
            of cheap 1-cost moves. At the end of a rotation chain, only one of the three options in
            the other clan has a cost of 2; the rest have a cost of 3.
        Press “watch the optimal tour” to see the traveller walk it, or click towns on the
        map to build your own.
      </Note>

      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => startAuto(OPTIMAL_3)}>watch the optimal tour</Btn>
        <Btn variant="soft" onClick={() => startAuto(randomTour(3))}>
          watch a random tour
        </Btn>
        <Btn
          variant="soft"
          onClick={() => {
            setAuto(null);
            setPath([]);
          }}
        >
          clear and build my own
        </Btn>
      </div>

      {auto && (
        <PlayBar
          playing={player.playing}
          onToggle={player.toggle}
          onReset={player.reset}
          onSkip={player.skipToEnd}
          speed={player.speed}
          onSpeed={player.setSpeed}
          playLabel="resume"
          label={`town ${player.step}/${auto.length}`}
        />
      )}

      <Wide>
        <TopDownTspMap
          n={3}
          path={shownPath}
          title="n = 3 salesman quest"
          subtitle={`${shownPath.length}/6 towns · ${total || 0} characters`}
          villageLayout
          onTownClick={manualClick}
        />
      </Wide>

      <CostLensLegend />

      <div className="border-3 border-ink bg-[#f3ead0] px-4 py-3 shadow-[3px_3px_0_#1d1e33]">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {shownPath.map((p, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="border-2 border-ink bg-white px-1.5 py-0.5 font-mono font-semibold">
                <PermText p={p} />
              </span>
              {i < shownPath.length - 1 && (
                <span className="font-mono text-[13px] text-ember">+{weight(shownPath[i], shownPath[i + 1])}</span>
              )}
            </span>
          ))}
          {shownPath.length === 0 && <span className="text-ink-soft">no towns visited yet</span>}
        </div>
        <div className="mt-3 min-h-8 border-t-2 border-dashed border-ink/30 pt-2">
          <Str s={s} className="text-2xl" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[15px] text-ink-soft">
          3 starting characters + tolls paid ={" "}
          <strong className="text-2xl text-ink">{total || "—"}</strong>
          <span className="text-ink/50"> / 9 optimal</span>
        </div>
        {optimal && (
          <span className="animate-pop border-3 border-emerald-700 bg-emerald-200 px-3 py-1 font-mono text-[13px] font-bold text-emerald-900">
            optimal: 1+1+2+1+1 = 6 tolls
          </span>
        )}
        {complete && !optimal && (
          <span className="border-3 border-ember bg-[#ffe6da] px-3 py-1 font-mono text-[13px] font-bold text-ember">
            valid but wasteful — {total - 9} characters over
          </span>
        )}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo 7 · n = 4, watch the route being walked                       */
/* ------------------------------------------------------------------ */

const OPT4 = stringToPath(standardSuperperm(4), 4);

export function TourViewer4() {
  const [order, setOrder] = useState<number[][]>(OPT4);
  const [isRandom, setIsRandom] = useState(false);
  const player = useStepper(order.length, { speed: 260 });

  const shownPath = order.slice(0, player.step);
  const s = pathToString(shownPath);
  const total = shownPath.length ? 4 + shownPath.slice(1).reduce((acc, p, i) => acc + weight(shownPath[i], p), 0) : 0;
  const finalTotal = 4 + order.slice(1).reduce((acc, p, i) => acc + weight(order[i], p), 0);

  const load = (tour: number[][], random: boolean) => {
    setOrder(tour);
    setIsRandom(random);
    player.reset();
    setTimeout(player.play, 30);
  };

  return (
      <Panel label="Demo 7 · the same game with 24 towns" className="space-y-4">
        <Note>
          At n = 4 there are 24 permutations and the shortest superpermutation has 33
          characters. The map arranges them into six clans of four — the <strong>1234</strong>,{" "}
          <strong>2314</strong>, <strong>3124</strong>, <strong>2134</strong>, <strong>1324</strong>,
          and <strong>3214</strong> clans — each sharing a rotation chain of cheap 1-cost moves.
          Watch the traveller walk the optimal route, then watch a random route waste characters
          at almost every step.
        </Note>

      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => load(OPT4, false)}>watch the optimal route</Btn>
        <Btn variant="soft" onClick={() => load(randomTour(4), true)}>
          watch a random route
        </Btn>
      </div>

      <PlayBar
        playing={player.playing}
        onToggle={player.toggle}
        onReset={player.reset}
        onSkip={player.skipToEnd}
        speed={player.speed}
        onSpeed={player.setSpeed}
        label={`town ${player.step}/${order.length} · ${total || 0} characters`}
      />

      <Wide>
        <TopDownTspMap
          n={4}
          path={shownPath}
          title={isRandom ? "n = 4 random route" : "n = 4 optimal route"}
          subtitle={`${shownPath.length}/24 towns · ${total || 0} characters`}
          villageLayout
        />
      </Wide>

      <CostLensLegend />

      <div className="border-3 border-ink bg-[#f3ead0] px-4 py-3 shadow-[3px_3px_0_#1d1e33]">
        <Str s={s} className="text-lg" max={300} />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-3 font-mono text-[15px]">
        <span className="text-ink-soft">
          running total <strong className="text-2xl text-ink">{total || "—"}</strong>
        </span>
        <span className={isRandom ? "text-ember" : "text-emerald-700"}>
          this route finishes at {finalTotal} characters
          {isRandom && ` — ${finalTotal - 33} more than optimal`}
        </span>
      </div>
    </Panel>
  );
}

export function RegionFederationDemo4() {
  return (
    <Panel label="Demo 8 · federation membership and archipelago" className="space-y-4">
      <Note>
        Notice the first 3-cost jump in the optimal route: it leaves <strong>4312</strong> in the
        <strong>3124</strong> clan and lands on <strong>2134</strong> in the <strong>2134</strong> clan.
        The jump shares only the final <strong>2</strong> with the next permutation, so it costs 3.
        A useful analogy for a 2-loop region is a <strong>federation</strong>: it gathers{" "}
        three clans linked by 2-cost jumps, but it is not itself a clan. A clan
        can belong to several federations, which is why their boundaries overlap.
      </Note>
      <FederationMainDemo4 />
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Checker                                                             */
/* ------------------------------------------------------------------ */

export function Verifier() {
  const [n, setN] = useState(6);
  const [raw, setRaw] = useState("");

  const { clean, ignored } = useMemo(() => {
    const allowed = new Set(Array.from({ length: n }, (_, i) => String(i + 1)));
    let bad = 0;
    const out: (number | string)[] = [];
    for (const ch of raw) {
      if (allowed.has(ch)) out.push(Number(ch));
      else if (ch !== "\n" && ch !== " " && ch !== "\r") bad++;
    }
    return { clean: out, ignored: bad };
  }, [raw, n]);

  const cov = useMemo(() => {
    if (clean.length < n) return null;
    const perms = allPerms(n);
    const need = new Set(perms.map(key));
    const seen = new Set<string>();
    for (let i = 0; i <= clean.length - n; i++) {
      const k = clean.slice(i, i + n).join("");
      if (need.has(k)) seen.add(k);
    }
    return { found: seen.size, total: perms.length, missing: perms.filter((p) => !seen.has(key(p))) };
  }, [clean, n]);

  const verifierPath = useMemo(() => stringToPath(clean, n), [clean, n]);

  const loads: Record<number, { label: string; s: string }[]> = {
    3: [{ label: "optimal · 9", s: "123121321" }],
    4: [{ label: "optimal · 33", s: standardSuperperm(4).join("") }],
    5: [{ label: "optimal · 153", s: standardSuperperm(5).join("") }],
    6: [
      { label: "greedy · 873", s: standardSuperperm(6).join("") },
      { label: "Houston's record · 872", s: HOUSTON_872 },
    ],
  };

  return (
    <Panel label="Demo 8 · superpermutation checker" className="space-y-4">
      <Note>
        Paste any string of digits, or load a famous one. The checker slides a window of
        length n across it and reports exactly which permutations appear. Loading Houston's
        872-character record proves the upper bound in your own browser.
      </Note>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-soft">n =</span>
        {[3, 4, 5, 6].map((v) => (
          <button
            key={v}
            onClick={() => setN(v)}
            className={`border-3 border-ink px-3 py-1 font-mono font-bold shadow-[3px_3px_0_#1d1e33] ${
              n === v ? "bg-accent text-white" : "bg-[#fffbe9] hover:bg-[#f4d35e]"
            }`}
          >
            {v}
          </button>
        ))}
        {(loads[n] ?? []).map((l) => (
          <Btn key={l.label} variant="soft" onClick={() => setRaw(l.s)}>
            load {l.label}
          </Btn>
        ))}
        <Btn variant="ghost" onClick={() => setRaw("")}>
          clear
        </Btn>
      </div>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        spellCheck={false}
        placeholder={`Type or paste a string using digits 1 to ${n}`}
        className="h-24 w-full resize-y border-3 border-ink bg-[#fffbe9] px-3 py-2 font-mono text-[15px] leading-relaxed shadow-[inset_2px_2px_0_rgba(29,30,51,0.12)] outline-none placeholder:text-ink/35 focus:border-accent"
      />

      {ignored > 0 && (
        <div className="font-mono text-[13px] text-ember">
          {ignored} character{ignored > 1 ? "s" : ""} outside 1–{n} ignored
        </div>
      )}

      {cov && (
        <>
          <div className="border-3 border-ink bg-[#f3ead0] p-4 shadow-[3px_3px_0_#1d1e33]">
            <div className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono">
              <span className="text-xl font-bold">
                <span className={cov.found === cov.total ? "text-emerald-700" : "text-accent"}>{cov.found}</span>
                <span className="text-ink/40"> / {cov.total}</span> permutations
              </span>
              <span className="text-[15px] text-ink-soft">length {clean.length}</span>
              {cov.found === cov.total && (
                <span className="animate-pop border-2 border-emerald-800 bg-emerald-200 px-2 py-0.5 text-[12px] font-bold uppercase text-emerald-900">
                  valid superpermutation
                </span>
              )}
            </div>
            <div className="h-3 w-full border-2 border-ink bg-white">
              <div
                className={`h-full ${cov.found === cov.total ? "bg-emerald-500" : "bg-accent"}`}
                style={{ width: `${(cov.found / cov.total) * 100}%` }}
              />
            </div>
            {cov.missing.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cov.missing.slice(0, 18).map((p) => (
                  <PermChip key={key(p)} p={p} dimmed small />
                ))}
                {cov.missing.length > 18 && (
                  <span className="font-mono text-[13px] text-ink/50">+{cov.missing.length - 18} more</span>
                )}
              </div>
            )}
          </div>

          <Wide>
            {n <= 4 ? (
              <TopDownTspMap
                n={n as 3 | 4}
                path={verifierPath}
                title={`n = ${n} checker map`}
                subtitle={`${verifierPath.length}/${factorial(n)} towns`}
              />
            ) : (
              <PermWorldMap
                n={n}
                path={verifierPath}
                title={`n = ${n} checker map`}
                subtitle={`${verifierPath.length}/${factorial(n)} houses`}
              />
            )}
          </Wide>
        </>
      )}
    </Panel>
  );
}
