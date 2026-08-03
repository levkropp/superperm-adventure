import { ReactNode, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Shared UI primitives                                               */
/* ------------------------------------------------------------------ */

export function Section({
  id,
  num,
  kicker,
  title,
  lead,
  children,
  className = "",
}: {
  id: string;
  num: string;
  kicker: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 sm:py-20 ${className}`}>
      <div className="mb-9">
        <div className="mb-4 flex items-center gap-3">
          <span className="border-4 border-ink bg-accent px-3 py-2 font-display text-[11px] text-white shadow-[4px_4px_0_#1d1e33]">
            {num}
          </span>
          <span className="h-1 flex-1 bg-[repeating-linear-gradient(90deg,#1d1e33_0_8px,transparent_8px_12px)]" />
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {kicker}
          </span>
        </div>
        <h2 className="font-serif text-[2rem] leading-[1.18] font-semibold tracking-tight text-ink sm:text-[2.7rem]">
          {title}
        </h2>
        {lead && (
          <div className="mt-5 border-l-4 border-gold pl-4 text-[1.16rem] leading-relaxed text-ink-soft italic">
            {lead}
          </div>
        )}
      </div>
      <div className="space-y-7 text-ink">{children}</div>
    </section>
  );
}

export function P({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`leading-[1.72] ${className}`}>{children}</p>;
}

/** Lets a demo break out of the prose column on wide screens. */
export function Wide({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`lg:-mx-16 xl:-mx-28 ${className}`}>{children}</div>;
}

/* ------------------------------ callouts --------------------------- */

const calloutStyles: Record<string, { box: string; tag: string; label: string }> = {
  definition: {
    box: "border-accent bg-[#f1ecff] shadow-[5px_5px_0_#5b3fbf]",
    tag: "bg-accent text-white",
    label: "Definition",
  },
  idea: {
    box: "border-gold bg-[#fff2cd] shadow-[5px_5px_0_#b26a12]",
    tag: "bg-gold text-white",
    label: "Key idea",
  },
  story: {
    box: "border-ember bg-[#ffe6da] shadow-[5px_5px_0_#b23a48]",
    tag: "bg-ember text-white",
    label: "Story",
  },
  proof: {
    box: "border-emerald-700 bg-[#e3f2d6] shadow-[5px_5px_0_#1f7a5c]",
    tag: "bg-emerald-700 text-white",
    label: "Lemma",
  },
  status: {
    box: "border-sky-700 bg-[#ddeef5] shadow-[5px_5px_0_#1f6fae]",
    tag: "bg-sky-700 text-white",
    label: "Status",
  },
};

export function Callout({
  variant = "idea",
  title,
  children,
  className = "",
}: {
  variant?: keyof typeof calloutStyles;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const s = calloutStyles[variant];
  return (
    <div className={`border-4 px-5 py-5 ${s.box} ${className}`}>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`border-2 border-ink px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] ${s.tag}`}
        >
          {title ?? s.label}
        </span>
      </div>
      <div className="leading-[1.7] text-ink">{children}</div>
    </div>
  );
}

/* --------------------------- permutation bits ---------------------- */

const digitClass = (d: number) => `d${d}`;

export function PermText({
  p,
  className = "",
  active = false,
}: {
  p: (number | string)[];
  className?: string;
  active?: boolean;
}) {
  return (
    <span className={`font-mono font-semibold ${active ? "text-accent" : ""} ${className}`}>
      {p.map((d, i) => (
        <span key={i} className={digitClass(Number(d))}>
          {d}
        </span>
      ))}
    </span>
  );
}

export function PermChip({
  p,
  onClick,
  selected = false,
  dimmed = false,
  done = false,
  small = false,
}: {
  p: (number | string)[];
  onClick?: () => void;
  selected?: boolean;
  dimmed?: boolean;
  done?: boolean;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`border-2 border-ink font-mono font-semibold transition-all duration-150 ${
        small ? "px-1.5 py-0.5 text-[12px]" : "px-2.5 py-1.5 text-[15px]"
      } ${
        selected
          ? "-translate-y-0.5 bg-accent text-white shadow-[3px_3px_0_#1d1e33]"
          : done
            ? "bg-emerald-100 text-emerald-800 shadow-[2px_2px_0_#1f7a5c]"
            : dimmed
              ? "border-ink/30 bg-white/40 text-ink/30"
              : "bg-[#fffbe9] text-ink shadow-[2px_2px_0_#1d1e33] hover:-translate-y-0.5 hover:bg-[#fff2cd]"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      {p.map((d, i) => (
        <span key={i} className={selected ? "" : digitClass(Number(d))}>
          {d}
        </span>
      ))}
    </button>
  );
}

export function Str({
  s,
  className = "",
  highlight,
  max = 2000,
}: {
  s: (number | string)[];
  className?: string;
  highlight?: { from: number; to: number } | null;
  max?: number;
}) {
  const shown = s.slice(0, max);
  return (
    <span className={`font-mono leading-relaxed break-all ${className}`}>
      {shown.map((d, i) => {
        const hl = highlight && i >= highlight.from && i < highlight.to;
        return (
          <span key={i} className={`${hl ? "bg-[#f4d35e]" : ""} ${digitClass(Number(d))}`}>
            {d}
          </span>
        );
      })}
      {s.length > max && <span className="text-ink/40"> … +{s.length - max} more</span>}
    </span>
  );
}

/* ------------------------------ controls --------------------------- */

export function Btn({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "soft" | "ghost" | "danger";
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const styles = {
    primary: "bg-accent text-white shadow-[4px_4px_0_#1d1e33] hover:bg-accent-deep disabled:bg-ink/20 disabled:shadow-none",
    soft: "bg-[#f6dcab] text-ink shadow-[4px_4px_0_#1d1e33] hover:bg-[#f4d35e] disabled:opacity-40",
    ghost: "bg-transparent text-accent shadow-none hover:bg-accent/10 disabled:opacity-40",
    danger: "bg-ember text-white shadow-[4px_4px_0_#1d1e33] hover:bg-[#8f2c39] disabled:opacity-40",
  }[variant];
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`border-3 border-ink px-4 py-1.5 font-mono text-[13px] font-bold uppercase tracking-[0.08em] transition-all hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

/** Standard play / reset / speed strip used by every animated demo. */
export function PlayBar({
  playing,
  onToggle,
  onReset,
  onSkip,
  speed,
  onSpeed,
  speeds = [
    ["slow", 620],
    ["normal", 300],
    ["fast", 110],
  ],
  progress,
  label,
  playLabel = "watch it happen",
}: {
  playing: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSkip?: () => void;
  speed: number;
  onSpeed: (s: number) => void;
  speeds?: [string, number][];
  progress?: string;
  label?: ReactNode;
  playLabel?: string;
}) {
  const playBarRef = useRef<HTMLDivElement>(null);
  const handleToggle = () => {
    if (!playing && typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      playBarRef.current?.closest<HTMLElement>(".pixel-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    onToggle();
  };

  return (
    <div ref={playBarRef} className="flex flex-wrap items-center gap-2 border-3 border-ink bg-[#f3ead0] px-3 py-2 shadow-[3px_3px_0_#1d1e33]">
      <Btn onClick={handleToggle}>{playing ? "pause" : playLabel}</Btn>
      <Btn variant="soft" onClick={onReset}>
        reset
      </Btn>
      {onSkip && (
        <Btn variant="soft" onClick={onSkip}>
          skip to end
        </Btn>
      )}
      <div className="flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">
        speed
        {speeds.map(([name, val]) => (
          <button
            key={name}
            onClick={() => onSpeed(val)}
            className={`border-2 border-ink px-2 py-0.5 ${
              speed === val ? "bg-accent text-white" : "bg-white/70 text-ink hover:bg-[#f4d35e]"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      {(progress || label) && (
        <span className="ml-auto font-mono text-[13px] text-ink-soft">{label ?? progress}</span>
      )}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`border-3 border-ink px-4 py-3 shadow-[3px_3px_0_#1d1e33] ${
        accent ? "bg-accent/10" : "bg-[#fffbe9]"
      }`}
    >
      <div className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">{label}</div>
      <div className="mt-1 font-mono text-2xl font-bold text-ink">{value}</div>
      {sub && <div className="mt-0.5 text-[14px] text-ink-soft">{sub}</div>}
    </div>
  );
}

export function Panel({
  children,
  className = "",
  label,
  innerRef,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={innerRef} className={`pixel-panel p-5 sm:p-6 ${className}`}>
      {label && <div className="pixel-window-title mb-5">{label}</div>}
      {children}
    </div>
  );
}

/** Narrow explanatory note under a demo. */
export function Note({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-ink-soft">{children}</p>;
}
