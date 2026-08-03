import { overlap, Perm, weight } from "../lib/perms";
import { PermText } from "./ui";

/**
 * Turns an edge cost back into the string fact that caused it. Used next to
 * town maps so a coloured link is never just a mysterious price tag.
 */
export function LinkReason({
  from,
  to,
  compact = false,
}: {
  from: Perm | null;
  to: Perm | null;
  compact?: boolean;
}) {
  if (!from || !to) {
    return (
      <div className="border-3 border-ink bg-[#f3ead0] px-4 py-3 text-[15px] text-ink-soft shadow-[3px_3px_0_#1d1e33]">
        Choose a starting house. The pale links will show the price of every possible next
        move.
      </div>
    );
  }

  const k = overlap(from, to);
  const cost = weight(from, to);
  const sharedA = k ? from.slice(from.length - k) : [];
  const append = to.slice(k);

  return (
    <div className="border-3 border-ink bg-[#f3ead0] px-4 py-3 shadow-[3px_3px_0_#1d1e33]">
      <div className="font-mono text-[12px] font-bold uppercase tracking-wider text-ink-soft">
        Why this link costs {cost}
      </div>
      <div className="mt-1.5 text-[16px] leading-relaxed">
        <PermText p={from} /> <span className="mx-1 text-ink/45">→</span> <PermText p={to} />
        {k > 0 ? (
          <>
            {" "}shares <span className="border-b-3 border-emerald-600 bg-emerald-100 px-1 font-mono font-bold"><PermText p={sharedA} /></span>
            {" "}at the join: the tail of the first word is the head of the second. So the
            overlap is {k}, and you append only <strong><PermText p={append} /></strong> — {cost}
            character{cost === 1 ? "" : "s"}.
          </>
        ) : (
          <>
            {" "}has no shared tail/head at all: <PermText p={from.slice(-2)} /> does not match{" "}
            <PermText p={to.slice(0, 2)} /> (and even the last/first symbols disagree). The
            overlap is 0, so you append all of <strong><PermText p={to} /></strong> — {cost}
            characters.
          </>
        )}
      </div>
      {!compact && (
        <div className="mt-2 font-mono text-[13px] text-ink-soft">
          formula: cost = {from.length} − overlap {k} = {cost}
        </div>
      )}
    </div>
  );
}

export function CostLensLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] text-ink-soft">
      <span><span className="mr-1 inline-block h-3 w-3 bg-[#65c5a2] align-middle" />cost 1: maximum overlap</span>
      <span><span className="mr-1 inline-block h-3 w-3 bg-[#f0aa4f] align-middle" />cost 2</span>
      <span><span className="mr-1 inline-block h-3 w-3 bg-[#e8615d] align-middle" />cost 3 or more</span>
    </div>
  );
}