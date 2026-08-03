import { useMemo } from "react";
import { allPerms, factorial, key } from "../lib/perms";
import { useStepper } from "../lib/anim";
import { Panel, PlayBar } from "./ui";

const dClass = (d: number) => `d${d}`;

export function SlidingWindowDemo({
  s,
  n,
  label = "",
  monochrome = false,
}: {
  s: (number | string)[];
  n: number;
  label?: string;
  monochrome?: boolean;
}) {
  const player = useStepper(s.length - n + 1, { speed: 380 });

  const frames = Math.min(player.step, s.length - n + 1);
  const seen = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < frames; i++) {
      const w = s.slice(i, i + n).map(Number);
      if (new Set(w).size === n) set.add(w.join(""));
    }
    return set;
  }, [s, n, frames]);
  const total = factorial(n);

  return (
    <Panel
      label={label || `Every ordering appears · sliding window, length ${n}`}
      className="space-y-4"
    >
      <PlayBar
        playing={player.playing}
        onToggle={player.toggle}
        onReset={player.reset}
        onSkip={player.skipToEnd}
        speed={player.speed}
        onSpeed={player.setSpeed}
        playLabel="slide the window"
        label={`window ${frames}/${s.length - n + 1}`}
      />
      <div className="overflow-x-auto border-3 border-ink bg-[#f3ead0] py-3 font-mono leading-relaxed shadow-[3px_3px_0_#1d1e33]">
        <span className="inline-block min-w-max px-2 text-2xl whitespace-nowrap">
          {s.map((c, i) => {
            const inWindow =
              i >= Math.max(0, frames - 1) && i < Math.max(0, frames - 1) + n;
            return (
              <span
                key={i}
                className={`px-0.5 ${inWindow ? "bg-[#f4d35e] shadow-[0_0_0_3px_#f4d35e]" : ""}`}
              >
                <span className={monochrome ? "text-ink" : dClass(Number(c))}>{c}</span>
              </span>
            );
          })}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {allPerms(n).map((p) => {
            const k = key(p);
            return (
              <span
                key={k}
                className={`rounded border-2 border-ink px-1.5 py-0.5 font-mono text-[13px] font-semibold transition-colors ${
                  seen.has(k)
                    ? "bg-emerald-200 text-emerald-900"
                    : "bg-white/60 text-ink/35"
                }`}
              >
                {k}
              </span>
            );
          })}
        </div>
        <div className="min-w-[90px] text-right font-mono text-[15px] font-bold">
          <span className={seen.size === total ? "text-emerald-700" : "text-accent"}>
            {seen.size}
          </span>
          <span className="text-ink/40"> / {total}</span>
        </div>
      </div>
    </Panel>
  );
}
