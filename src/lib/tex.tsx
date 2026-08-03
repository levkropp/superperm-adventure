import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface TeXProps {
  children: string;
  block?: boolean;
  className?: string;
}

/** Render a LaTeX string with KaTeX. */
export default function TeX({ children, block = false, className = "" }: TeXProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(children, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return children;
    }
  }, [children, block]);

  if (block) {
    return (
      <div
        className={`my-4 overflow-x-auto overflow-y-hidden py-1 text-ink ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <span
      className={`whitespace-nowrap text-ink ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Colour-coded proof variables                                       */
/* ------------------------------------------------------------------ */

export type VarName = "p" | "c" | "v" | "w";

export const VAR_HEX: Record<VarName, string> = {
  p: "#5b3fbf",
  c: "#1f7a5c",
  v: "#b26a12",
  w: "#b23a48",
};

export const VAR_LABEL: Record<VarName, string> = {
  p: "permutations visited",
  c: "completed wheels",
  v: "entered 2-loops",
  w: "total cost of the tour",
};

/** An inline, colour-coded proof variable, e.g. <V n="v" />. */
export function V({ n, children }: { n: VarName; children?: React.ReactNode }) {
  return (
    <span className={`var var-${n}`} title={VAR_LABEL[n]}>
      {children ?? n}
    </span>
  );
}

/** A legend chip explaining one variable. */
export function VarKey({ n, value, note }: { n: VarName; value?: React.ReactNode; note?: string }) {
  return (
    <div
      className="border-3 border-ink bg-[#fffbe9] px-3 py-2 shadow-[3px_3px_0_#1d1e33]"
      style={{ borderLeft: `10px solid ${VAR_HEX[n]}` }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className={`var var-${n} text-lg`}>{n}</span>
        {value !== undefined && <span className="font-mono text-lg font-bold">{value}</span>}
      </div>
      <div className="mt-0.5 text-[15px] leading-snug text-ink-soft">{note ?? VAR_LABEL[n]}</div>
    </div>
  );
}
