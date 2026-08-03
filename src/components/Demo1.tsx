import { useEffect, useMemo, useRef, useState } from "react";
import { coverage, key, pathToString, standardSuperperm, stringToPath } from "../lib/perms";
import { useStepper } from "../lib/anim";
import { TopDownTspMap } from "./PixelMaps";
import { Btn, Note, Panel, PermChip, PlayBar, Str, Wide } from "./ui";

/* ------------------------------------------------------------------ */
/*  Coverage grid                                                      */
/* ------------------------------------------------------------------ */

export function CoverageGrid({ s, n }: { s: (number | string)[]; n: number }) {
  const cov = useMemo(() => coverage(s, n), [s, n]);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <div className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-soft">
          permutations covered
        </div>
        <div className="font-mono text-[15px] font-bold">
          <span className={cov.found === cov.total ? "text-emerald-700" : "text-accent"}>{cov.found}</span>
          <span className="text-ink/40"> / {cov.total}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cov.foundList.map((f) => (
          <PermChip key={key(f.perm)} p={f.perm} done small />
        ))}
        {cov.missing.map((p) => (
          <PermChip key={key(p)} p={p} dimmed small />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo 2 and 3 · n = 3                                               */
/* ------------------------------------------------------------------ */

const S3 = standardSuperperm(3);

export function N3Explorer() {
  const [route, setRoute] = useState<number[][]>([]);
  const s = useMemo(() => pathToString(route), [route]);
  const [best, setBest] = useState<number | null>(null);
  const cov = useMemo(() => coverage(s, 3), [s]);
  const complete = cov.found === 6;
  const easterEgg = complete && route.length < 6;

  const player = useStepper(S3.length, { speed: 520 });
  const watchS = S3.slice(0, player.step);
  const greedyMapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (complete && !easterEgg && (best === null || s.length < best)) setBest(s.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, easterEgg]);

  const addTown = (p: number[]) => {
    if (easterEgg) return;
    setRoute((old) => (old.some((town) => key(town) === key(p)) ? old : [...old, p]));
  };

  return (
    <div className="space-y-6">
      <Panel label="Demo 2 · build your own string" className="space-y-4">
        <Note>
          Six permutations of 1, 2, 3 must all appear. Tap houses on the map to build a route;
          each click appends only the characters that do not overlap. The record is nine
          characters.
        </Note>

        <div className="flex min-h-20 items-center justify-center border-3 border-ink bg-[#f3ead0] px-4 py-3 text-center shadow-[3px_3px_0_#1d1e33]">
          {s.length === 0 ? (
            <span className="text-ink/40">tap on a house to begin</span>
          ) : (
            <Str s={s} className="text-3xl" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="soft" onClick={() => setRoute((old) => old.slice(0, -1))} disabled={!route.length}>
            undo
          </Btn>
          <Btn variant="soft" onClick={() => setRoute([])} disabled={!route.length}>
            clear
          </Btn>
          <div className="ml-auto flex items-center gap-4 font-mono text-[15px]">
            {best !== null && (
              <span className="text-ink-soft">
                best <span className="font-bold text-accent">{best}</span>
              </span>
            )}
            <span>
              length <strong>{s.length}</strong>
            </span>
          </div>
        </div>

        <CoverageGrid s={s} n={3} />

        <Wide>
          <TopDownTspMap
            n={3}
            path={route}
            title="n = 3 map"
            subtitle={`${route.length}/6 visited · ${cov.found}/6 covered`}
            onTownClick={addTown}
          />
        </Wide>

        {complete && (
          <div
            className={`animate-pop border-4 px-4 py-3 ${
              s.length === 9
                ? "border-emerald-700 bg-[#e3f2d6] shadow-[5px_5px_0_#1f7a5c]"
                : "border-gold bg-[#fff2cd] shadow-[5px_5px_0_#b26a12]"
            }`}
          >
            {easterEgg ? (
              "Damn it I knew this would happen. First impressions are important and you might be confused. Basically, you took such an inefficient path with a 2 cost followed by a 3 cost jump that you ended up being able to smuggle in the value of an unvisited house inside your inefficiency. Consider this message an easter egg, and try again but this time avoiding 3 cost jumps."
            ) : s.length === 9 ? (
              <>
                Nine characters — optimal. You matched the shortest superpermutation on three
                symbols.
              </>
            ) : (
              <>
                Valid at length {s.length}, but {s.length - 9} character
                {s.length - 9 === 1 ? "" : "s"} longer than necessary. Try to make each new
                permutation share more with the one before it.
              </>
            )}
          </div>
        )}
      </Panel>

      <Panel label="Demo 3 · watch the greedy construction" className="space-y-4">
        <Note>
          Did you find the smallest string? You probably naturally used <strong>the greedy rule</strong>:
          start at <strong>123</strong>, then always append the fewest characters that complete a
          permutation you have not seen. Watch it build the record string one character at a time.
        </Note>

        <PlayBar
          playing={player.playing}
          onToggle={player.toggle}
          onReset={player.reset}
          onSkip={player.skipToEnd}
          speed={player.speed}
         onSpeed={player.setSpeed}
          scrollTarget={greedyMapRef}
          label={`character ${player.step}/${S3.length}`}
        />

        <div className="border-3 border-ink bg-[#f3ead0] px-4 py-3 shadow-[3px_3px_0_#1d1e33]">
          {player.step === 0 ? (
            <span className="text-ink/40">press play</span>
          ) : (
            <Str s={watchS} className="text-3xl" highlight={{ from: player.step - 1, to: player.step }} />
          )}
        </div>

        <CoverageGrid s={watchS} n={3} />

        <div ref={greedyMapRef}>
          <Wide>
            <TopDownTspMap
              n={3}
              path={stringToPath(watchS, 3)}
              title="greedy construction"
              subtitle={`character ${player.step}/${S3.length}`}
              spawnHint={player.step > 0 && player.step <= 2}
            />
          </Wide>
        </div>

        {player.done && (
          <div className="animate-pop border-4 border-emerald-700 bg-[#e3f2d6] px-4 py-3 shadow-[5px_5px_0_#1f7a5c]">
            Nine characters. Notice the pattern: after <strong>123</strong> the greedy appends a
            single <strong>1</strong> to reach <strong>231</strong>, then a single{" "}
            <strong>2</strong> to reach <strong>312</strong>. Each of those one-character steps
            reuses as much of the previous permutation as possible. That reuse is called an{" "}
            <strong>overlap</strong>, and the next section is devoted to it.
          </div>
        )}
      </Panel>
    </div>
  );
}
