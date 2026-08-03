import { ReactNode, useMemo } from "react";
import { allPerms, key, Perm, weight, wheelOfPerm } from "../lib/perms";

type Point = { x: number; y: number };

/* ------------------------------------------------------------------ */
/*  Shared pixel scenery                                               */
/* ------------------------------------------------------------------ */

function TileField({ w, h, dense = false }: { w: number; h: number; dense?: boolean }) {
  const tiles = useMemo(() => {
    const count = dense ? Math.round((w * h) / 5200) : Math.round((w * h) / 8000);
    return Array.from({ length: count }, (_, i) => ({
      x: (i * 83 + 29) % (w - 20),
      y: (i * 47 + 37) % (h - 20),
      kind: i % 5,
    }));
  }, [w, h, dense]);

  return (
    <g aria-hidden="true">
      <rect width={w} height={h} fill="#143d2a" />
      <path
        d={`M0 ${h * 0.72} L${w * 0.15} ${h * 0.64} L${w * 0.3} ${h * 0.74} L${w * 0.45} ${h * 0.63} L${w * 0.6} ${h * 0.72} L${w * 0.78} ${h * 0.62} L${w} ${h} L0 ${h} Z`}
        fill="#194b31"
      />
      {tiles.map((t, i) =>
        t.kind === 0 ? (
          <g key={i} opacity="0.7">
            <rect x={t.x} y={t.y} width="4" height="9" fill="#6f9f3d" />
            <rect x={t.x - 3} y={t.y + 4} width="10" height="3" fill="#8bbf46" />
          </g>
        ) : t.kind === 1 ? (
          <g key={i} opacity="0.68">
            <rect x={t.x} y={t.y} width="8" height="6" fill="#2f6e3a" />
            <rect x={t.x + 3} y={t.y - 5} width="3" height="10" fill="#4f8a42" />
          </g>
        ) : t.kind === 2 ? (
          <rect key={i} x={t.x} y={t.y} width="5" height="5" fill="#c3d65b" opacity="0.45" />
        ) : null,
      )}
      <rect x="4" y="4" width={w - 8} height={h - 8} fill="none" stroke="#081b18" strokeWidth="8" />
      <rect x="12" y="12" width={w - 24} height={h - 24} fill="none" stroke="#2a6840" strokeWidth="3" />
    </g>
  );
}

function Player({ at, scale = 1 }: { at: Point; scale?: number }) {
  return (
    <g transform={`translate(${at.x - 9 * scale} ${at.y - 30 * scale}) scale(${scale})`}>
      <g className="pixel-player">
        <rect x="5" y="0" width="8" height="5" fill="#f6c453" />
        <rect x="3" y="5" width="12" height="9" fill="#f5d6a0" />
        <rect x="1" y="7" width="3" height="4" fill="#39273a" />
        <rect x="14" y="7" width="3" height="4" fill="#39273a" />
        <rect x="4" y="14" width="10" height="9" fill="#7755d9" />
        <rect x="1" y="16" width="4" height="4" fill="#54c5a4" />
        <rect x="13" y="16" width="4" height="4" fill="#54c5a4" />
        <rect x="4" y="23" width="4" height="5" fill="#292744" />
        <rect x="10" y="23" width="4" height="5" fill="#292744" />
      </g>
    </g>
  );
}

/** One house = one permutation. Always. */
function House({
  p,
  at,
  state,
  size = "md",
  gate = false,
  onClick,
}: {
  p: Perm;
  at: Point;
  state: "unvisited" | "visited" | "current";
  size?: "sm" | "md" | "lg";
  gate?: boolean;
  onClick?: () => void;
}) {
  const s = size === "lg" ? 15 : size === "md" ? 10 : 7;
  const body = state === "unvisited" ? "#93a488" : state === "current" ? "#fff6cf" : "#f2cd5d";
  const roof = gate ? "#f4a300" : state === "unvisited" ? "#4d6360" : state === "current" ? "#ef6f6c" : "#bd554a";
  const stroke = gate ? "#5a2f00" : "#0b1c1c";

  return (
    <g
      transform={`translate(${at.x} ${at.y})`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      className={onClick ? "cursor-pointer outline-none" : ""}
    >
      <title>{key(p)}</title>
      {state === "current" && (
        <rect x={-s - 6} y={-s - 10} width={(s + 6) * 2} height={(s + 10) * 2} fill="#fff176" opacity="0.2" />
      )}
      <rect
        x={-s}
        y={-s / 2}
        width={s * 2}
        height={s * 1.4}
        fill={body}
        stroke={stroke}
        strokeWidth={size === "sm" ? 1.5 : 3}
      />
      <path
        d={`M${-s - 3} ${-s / 2} L0 ${-s - (size === "sm" ? 6 : 11)} L${s + 3} ${-s / 2} Z`}
        fill={roof}
        stroke={stroke}
        strokeWidth={size === "sm" ? 1.5 : 3}
      />
      {size !== "sm" && <rect x={-2.5} y={size === "lg" ? 3 : 1} width="5" height={size === "lg" ? 10 : 7} fill="#2f354d" />}
    </g>
  );
}

function TownLabel({ p, at, size = "md" }: { p: Perm; at: Point; size?: "sm" | "md" }) {
  const w = Math.max(22, p.length * (size === "md" ? 9 : 7) + 8);
  const y = size === "md" ? 20 : 13;
  return (
    <g transform={`translate(${at.x} ${at.y})`} aria-hidden="true">
      <rect x={-w / 2} y={y} width={w} height={size === "md" ? 16 : 12} fill="#081b18" opacity="0.94" />
      <text
        x="0"
        y={y + (size === "md" ? 12 : 9)}
        textAnchor="middle"
        fontSize={size === "md" ? 11 : 8}
        fill="#ffe9a8"
        fontFamily="IBM Plex Mono, monospace"
        fontWeight="700"
      >
        {key(p)}
      </text>
    </g>
  );
}

/** Colour of a link by what it costs: 1 cheap, 2 medium, 3+ expensive. */
function costColor(cost: number): string {
  if (cost <= 1) return "#65c5a2";
  if (cost === 2) return "#f0aa4f";
  return "#e8615d";
}

/**
 * A link between two houses. The price is written as a plain number in a badge
 * at the midpoint — one number, one cost, nothing to misalign.
 */
function Road({
  from,
  to,
  cost,
  active = false,
  faded = false,
  size = "md",
  showCost = true,
}: {
  from: Point;
  to: Point;
  cost: number;
  active?: boolean;
  faded?: boolean;
  size?: "sm" | "md";
  showCost?: boolean;
}) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const col = costColor(cost);
  const r = size === "sm" ? 8 : 11;

  return (
    <g opacity={faded ? 0.4 : 1}>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#071917" strokeWidth={size === "sm" ? 7 : 10} strokeLinecap="round" />
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={active ? "#fff176" : col}
        strokeWidth={size === "sm" ? 3 : 5}
        strokeDasharray={cost > 1 ? "7 4" : undefined}
        strokeLinecap="round"
      />
      {showCost && (
        <g>
          <rect
            x={mx - r}
            y={my - r}
            width={r * 2}
            height={r * 2}
            fill="#0d1b1a"
            stroke={active ? "#fff176" : col}
            strokeWidth="2.5"
          />
          <text
            x={mx}
            y={my + (size === "sm" ? 3.5 : 4.5)}
            textAnchor="middle"
            fontFamily="IBM Plex Mono, monospace"
            fontWeight="700"
            fontSize={size === "sm" ? 10 : 13}
            fill={active ? "#fff176" : col}
          >
            {cost}
          </text>
        </g>
      )}
    </g>
  );
}

/** A quiet, direct "price preview" shown from the selected house to every option. */
function PreviewRoad({ from, to, cost, size = "md" }: { from: Point; to: Point; cost: number; size?: "sm" | "md" }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const col = costColor(cost);
  const r = size === "sm" ? 7 : 9;
  return (
    <g opacity="0.37" pointerEvents="none">
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={col} strokeWidth={size === "sm" ? 2 : 3} strokeDasharray="4 5" />
      <rect x={mx - r} y={my - r} width={r * 2} height={r * 2} fill="#10201c" stroke={col} strokeWidth="1.5" />
      <text
        x={mx}
        y={my + (size === "sm" ? 3 : 4)}
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontWeight="700"
        fontSize={size === "sm" ? 9 : 11}
        fill={col}
      >
        {cost}
      </text>
    </g>
  );
}

export function MapFrame({
  title,
  subtitle,
  w,
  h,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  w: number;
  h: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="pixel-map-shell">
      <div className="pixel-map-hud">
        <span>{title}</span>
        {subtitle && <span className="pixel-map-hud__right">{subtitle}</span>}
      </div>
      <div className="pixel-map-screen" style={{ aspectRatio: `${w} / ${h}` }}>
        {children}
      </div>
      {footer && <div className="pixel-map-footer">{footer}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small-n overworld: every town is one permutation                   */
/* ------------------------------------------------------------------ */

const MAP_W = 640;
const MAP_H = 340;

const N2_POINTS: Point[] = [
  { x: 170, y: 175 },
  { x: 470, y: 175 },
];

const N3_POINTS: Point[] = [
  { x: 110, y: 105 },
  { x: 320, y: 72 },
  { x: 530, y: 112 },
  { x: 498, y: 268 },
  { x: 288, y: 288 },
  { x: 96, y: 252 },
];

const N3_VILLAGE_POINTS: Point[] = [
  { x: 70, y: 195 },
  { x: 130, y: 155 },
  { x: 190, y: 195 },
  { x: 450, y: 195 },
  { x: 510, y: 155 },
  { x: 570, y: 195 },
];

const N4_VILLAGE_POINTS: Point[] = [
  ...[105, 320, 535].flatMap((x) => [-75, -25, 25, 75].map((offset, i) => ({ x: x + offset, y: i === 0 || i === 3 ? 115 : 90 }))),
  ...[105, 320, 535].flatMap((x) => [-75, -25, 25, 75].map((offset, i) => ({ x: x + offset, y: i === 0 || i === 3 ? 265 : 240 }))),
];

const N3_VILLAGE_ORDER: Perm[] = [
  [1, 2, 3],
  [2, 3, 1],
  [3, 1, 2],
  [2, 1, 3],
  [1, 3, 2],
  [3, 2, 1],
];

const N4_VILLAGE_ORDER: Perm[] = [
  [1, 2, 3, 4],
  [2, 3, 4, 1],
  [3, 4, 1, 2],
  [4, 1, 2, 3],
  [2, 3, 1, 4],
  [3, 1, 4, 2],
  [1, 4, 2, 3],
  [4, 2, 3, 1],
  [3, 1, 2, 4],
  [1, 2, 4, 3],
  [2, 4, 3, 1],
  [4, 3, 1, 2],
  [2, 1, 3, 4],
  [1, 3, 4, 2],
  [3, 4, 2, 1],
  [4, 2, 1, 3],
  [1, 3, 2, 4],
  [3, 2, 4, 1],
  [2, 4, 1, 3],
  [4, 1, 3, 2],
  [3, 2, 1, 4],
  [2, 1, 4, 3],
  [1, 4, 3, 2],
  [4, 3, 2, 1],
];

function pointFor(n: number, index: number, villageLayout: boolean): Point {
  if (n === 2) return N2_POINTS[index];
  if (n === 3) return villageLayout ? N3_VILLAGE_POINTS[index] : N3_POINTS[index];
  if (villageLayout) return N4_VILLAGE_POINTS[index];
  const col = index % 6;
  const row = Math.floor(index / 6);
  const jx = ((row * 17 + col * 11) % 17) - 8;
  const jy = ((row * 13 + col * 7) % 13) - 6;
  return { x: 76 + col * 99 + jx, y: 66 + row * 80 + jy };
}

function villageOrder(perms: Perm[], n: number): Perm[] {
  if (n === 2) return perms;
  if (n === 3) return N3_VILLAGE_ORDER;
  if (n === 4) return N4_VILLAGE_ORDER;
  const out: Perm[] = [];
  const seen = new Set<string>();
  for (const p of perms) {
    if (seen.has(key(p))) continue;
    const village = wheelOfPerm(p);
    out.push(...village);
    village.forEach((house) => seen.add(key(house)));
  }
  return out;
}

function VillageFields({ n, villageLayout }: { n: 2 | 3 | 4; villageLayout: boolean }) {
  if (n === 2 || !villageLayout) return null;
  const fields =
    n === 3
      ? [
          { x: 35, y: 115, w: 190, h: 125 },
          { x: 415, y: 115, w: 190, h: 125 },
        ]
      : [
          ...[105, 320, 535].map((x) => ({ x: x - 100, y: 55, w: 200, h: 100 })),
          ...[105, 320, 535].map((x) => ({ x: x - 100, y: 205, w: 200, h: 100 })),
        ];

  return (
    <g aria-hidden="true" opacity="0.58">
      {fields.map((field, i) => (
        <rect
          key={i}
          x={field.x}
          y={field.y}
          width={field.w}
          height={field.h}
          fill="#1d5135"
          stroke="#65c5a2"
          strokeWidth="2"
          strokeDasharray="7 6"
        />
      ))}
    </g>
  );
}

function ClanCoat({ clan, at }: { clan: Perm; at: Point }) {
  const orbitRadius = clan.length === 3 ? 14 : 12;
  const markerId = `clan-arrow-${key(clan)}`;
  const points = clan.map((_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / clan.length;
    return { x: Math.cos(angle) * orbitRadius, y: Math.sin(angle) * orbitRadius };
  });

  return (
    <g transform={`translate(${at.x} ${at.y})`} aria-hidden="true">
      <defs>
        <marker id={markerId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L8 4 L0 8 Z" fill="#b23a48" />
        </marker>
      </defs>
      <text
        x="0"
        y={clan.length === 3 ? -37 : -30}
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize={clan.length === 3 ? 10 : 8}
        fontWeight="700"
        fill="#fff4cb"
      >
        the {key(clan)} clan
      </text>
      <path
        d={clan.length === 3 ? "M-27-25 H27 V-5 Q27 21 0 32 Q-27 21-27-5 Z" : "M-24-22 H24 V-4 Q24 18 0 28 Q-24 18-24-4 Z"}
        fill="#fff2cd"
        stroke="#081b18"
        strokeWidth="3"
      />
      <circle r={orbitRadius + 5} fill="none" stroke="#5b3fbf" strokeWidth="2" />
      {points.map((point, i) => {
        const next = points[(i + 1) % points.length];
        return (
          <line
            key={`edge-${i}`}
            x1={point.x}
            y1={point.y}
            x2={next.x}
            y2={next.y}
            stroke="#b23a48"
            strokeWidth="2"
            markerEnd={`url(#${markerId})`}
          />
        );
      })}
      {points.map((point, i) => (
        <g key={`digit-${i}`}>
          <circle cx={point.x} cy={point.y} r={clan.length === 3 ? 5 : 4.5} fill="#5b3fbf" stroke="#081b18" strokeWidth="1.5" />
          <text
            x={point.x}
            y={point.y + 3}
            textAnchor="middle"
            fontFamily="IBM Plex Mono, monospace"
            fontSize={clan.length === 3 ? 8 : 7}
            fontWeight="700"
            fill="#fff4cb"
          >
            {clan[i]}
          </text>
        </g>
      ))}
    </g>
  );
}

function ClanCoats({ n, villageLayout }: { n: 2 | 3 | 4; villageLayout: boolean }) {
  if (n === 2 || !villageLayout) return null;
  const order = n === 3 ? N3_VILLAGE_ORDER : N4_VILLAGE_ORDER;
  const size = n;
  const centers =
    n === 3
      ? [
          { x: 130, y: 62 },
          { x: 510, y: 62 },
        ]
      : [
          ...[105, 320, 535].map((x) => ({ x, y: 45 })),
          ...[105, 320, 535].map((x) => ({ x, y: 188 })),
        ];

  return (
    <g>
      {centers.map((at, i) => (
        <ClanCoat key={i} clan={order[i * size]} at={at} />
      ))}
    </g>
  );
}

export function TopDownTspMap({
  n,
  path,
  title = "OVERWORLD ROUTE",
  subtitle,
  onTownClick,
  onEdgeSelected,
  costLens = true,
  spawnHint = false,
  villageLayout = false,
}: {
  n: 2 | 3 | 4;
  path: Perm[];
  title?: string;
  subtitle?: string;
  onTownClick?: (p: Perm) => void;
  /** Fired before a manually chosen road is committed to the route. */
  onEdgeSelected?: (from: Perm | null, to: Perm) => void;
  /** Shows translucent links from the current house to every possible next house. */
  costLens?: boolean;
  /** Points to the 123 house before the animated route has a valid window. */
  spawnHint?: boolean;
  /** Groups houses into rotation villages for the larger route demos. */
  villageLayout?: boolean;
}) {
  const perms = useMemo(() => allPerms(n), [n]);
  const arrangedPerms = useMemo(
    () => (villageLayout ? villageOrder(perms, n) : perms),
    [perms, n, villageLayout],
  );
  const positions = useMemo(
    () => new Map(arrangedPerms.map((p, i) => [key(p), pointFor(n, i, villageLayout)])),
    [n, arrangedPerms, villageLayout],
  );
  const route = path.filter((p) => positions.has(key(p)));
  const visited = new Set(route.map(key));
  const activeKey = route.length ? key(route[route.length - 1]) : "";
  const active = route.length ? route[route.length - 1] : null;
  const cost = route.slice(1).reduce((sum, p, i) => sum + weight(route[i], p), 0);
  const size = n === 4 ? "sm" : "lg";
  // Auto-fade the cost lens once all towns are visited — no next move exists.
  const complete = visited.size >= perms.length;
  const showLens = costLens && !complete;

  return (
    <MapFrame
      title={title}
      w={MAP_W}
      h={MAP_H}
      subtitle={subtitle ?? `${visited.size}/${perms.length} towns`}
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          <span>1 house = 1 permutation</span>
          <span>{active && showLens ? "pale links = possible next steps; number = price" : "number on a link = characters appended"}</span>
          <span>road cost {cost}</span>
        </div>
      }
    >
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={`top-down map for n = ${n}`}>
        <TileField w={MAP_W} h={MAP_H} dense={n === 4} />
        <VillageFields n={n} villageLayout={villageLayout} />
        <ClanCoats n={n} villageLayout={villageLayout} />
        {active && showLens &&
          perms
            .filter((p) => key(p) !== activeKey)
            .map((p) => (
              <PreviewRoad
                key={`preview-${key(active)}-${key(p)}`}
                from={positions.get(activeKey)!}
                to={positions.get(key(p))!}
                cost={weight(active, p)}
                size={n === 4 ? "sm" : "md"}
              />
            ))}
        {route.slice(1).map((p, i) => {
          const stale = n === 4 && i < route.length - 6;
          return (
            <Road
              key={`${key(route[i])}-${key(p)}-${i}`}
              from={positions.get(key(route[i]))!}
              to={positions.get(key(p))!}
              cost={weight(route[i], p)}
              active={i === route.length - 2}
              faded={stale}
              size={n === 4 ? "sm" : "md"}
              showCost={!stale}
            />
          );
        })}
        {perms.map((p) => (
          <House
            key={key(p)}
            p={p}
            at={positions.get(key(p))!}
            size={size}
            state={key(p) === activeKey ? "current" : visited.has(key(p)) ? "visited" : "unvisited"}
            onClick={
              onTownClick
                ? () => {
                    if (key(p) === activeKey) return;
                    onEdgeSelected?.(active, p);
                    onTownClick(p);
                  }
                : undefined
            }
          />
        ))}
        {perms.map((p) => (
          <TownLabel key={`l-${key(p)}`} p={p} at={positions.get(key(p))!} size={n === 4 ? "sm" : "md"} />
        ))}
        {spawnHint && n === 3 && (
          <g pointerEvents="none">
            <rect x="154" y="14" width="226" height="25" fill="#081b18" stroke="#fff176" strokeWidth="2" />
            <text x="267" y="31" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="700" fill="#fff176">
              traveler spawning here
            </text>
            <path d="M 202 40 L 117 87" fill="none" stroke="#fff176" strokeWidth="3" />
            <path d="M 117 87 L 127 85 L 122 95 Z" fill="#fff176" />
          </g>
        )}
        {route.length > 0 && <Player at={positions.get(activeKey)!} scale={n === 4 ? 0.72 : 1} />}
      </svg>
    </MapFrame>
  );
}

/* ------------------------------------------------------------------ */
/*  Big-n world: villages of six houses, one house per permutation     */
/* ------------------------------------------------------------------ */

interface WorldLayout {
  w: number;
  h: number;
  villages: { at: Point; label: string; houses: { p: Perm; at: Point }[] }[];
  index: Map<string, Point>;
}

function buildWorldLayout(n: number): WorldLayout {
  const perms = allPerms(n);
  const seen = new Set<string>();
  const wheels: Perm[][] = [];
  for (const p of perms) {
    if (seen.has(key(p))) continue;
    const wheel = wheelOfPerm(p);
    wheel.forEach((m) => seen.add(key(m)));
    wheels.push(wheel);
  }

  const cols = wheels.length > 100 ? 12 : wheels.length > 40 ? 8 : wheels.length > 10 ? 6 : 3;
  const rows = Math.ceil(wheels.length / cols);
  const cellW = 108;
  const cellH = 104;
  const w = cols * cellW + 24;
  const h = rows * cellH + 24;

  const index = new Map<string, Point>();
  const villages = wheels.map((wheel, i) => {
    const cx = 12 + (i % cols) * cellW;
    const cy = 12 + Math.floor(i / cols) * cellH;
    const houses = wheel.map((p, k) => {
      const at = {
        x: cx + 24 + (k % 3) * 30,
        y: cy + 34 + Math.floor(k / 3) * 36,
      };
      index.set(key(p), at);
      return { p, at };
    });
    const label = wheel.map(key).sort()[0];
    return { at: { x: cx, y: cy }, label, houses };
  });

  return { w, h, villages, index };
}

const layoutCache = new Map<number, WorldLayout>();
function worldLayout(n: number): WorldLayout {
  let l = layoutCache.get(n);
  if (!l) {
    l = buildWorldLayout(n);
    layoutCache.set(n, l);
  }
  return l;
}

export function PermWorldMap({
  n,
  path,
  title,
  subtitle,
  footer,
  highlight,
  regionOf,
}: {
  n: number;
  path: Perm[];
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  highlight?: Set<string>;
  /** village label -> 2-loop region index, used to tint the region groups */
  regionOf?: Map<string, number>;
}) {
  const layout = useMemo(() => worldLayout(n), [n]);

  const walkPos = useMemo(() => {
    const m = new Map<string, number>();
    path.forEach((p, i) => {
      if (!m.has(key(p))) m.set(key(p), i);
    });
    return m;
  }, [path]);

  const current = path.length ? key(path[path.length - 1]) : "";

  // Every jump ever made, kept on screen; colour encodes what it cost.
  const jumps = useMemo(() => {
    const out: { a: Point; b: Point; cost: number; i: number }[] = [];
    for (let i = 1; i < path.length; i++) {
      const c = weight(path[i - 1], path[i]);
      if (c < 2) continue;
      const a = layout.index.get(key(path[i - 1]));
      const b = layout.index.get(key(path[i]));
      if (a && b) out.push({ a, b, cost: c, i });
    }
    return out;
  }, [path, layout]);

  const scenery = useMemo(
    () => (
      <>
        <TileField w={layout.w} h={layout.h} dense />
        {layout.villages.map((v, i) => {
          const region = regionOf?.get(v.label);
          const tint = region === undefined ? null : REGION_COLORS[region % REGION_COLORS.length];
          return (
            <g key={i}>
              <rect
                x={v.at.x + 6}
                y={v.at.y + 10}
                width={96}
                height={88}
                fill={tint ?? "#1f4a33"}
                fillOpacity={tint ? 0.22 : 1}
                stroke={tint ?? "#4f8a52"}
                strokeWidth={tint ? 2.5 : 2}
                strokeDasharray="6 4"
                opacity="0.9"
              />
              {tint && (
                <text
                  x={v.at.x + 12}
                  y={v.at.y + 22}
                  fontFamily="IBM Plex Mono, monospace"
                  fontSize="8"
                  fontWeight="700"
                  fill={tint}
                >
                  R{region! + 1}
                </text>
              )}
            </g>
          );
        })}
      </>
    ),
    [layout, regionOf],
  );

  return (
    <MapFrame
      title={title}
      w={layout.w}
      h={layout.h}
      subtitle={subtitle ?? `${walkPos.size}/${layout.index.size} houses visited`}
      footer={
        footer ?? (
          <div className="flex flex-wrap justify-between gap-2">
            <span>1 house = 1 permutation · 1 dashed box = 1 village</span>
            <span>green hop = 2 · orange = 3 · red = 4+</span>
            <span>{jumps.length} jumps so far</span>
          </div>
        )
      }
    >
      <svg viewBox={`0 0 ${layout.w} ${layout.h}`} role="img" aria-label={`world map of all ${layout.index.size} permutations`}>
        {scenery}
        {jumps.map((j) => (
          <line
            key={j.i}
            x1={j.a.x}
            y1={j.a.y}
            x2={j.b.x}
            y2={j.b.y}
            stroke={costColor(j.cost)}
            strokeWidth={j.i === path.length - 1 ? 3.5 : 1.6}
            strokeDasharray="5 3"
            opacity={j.i === path.length - 1 ? 1 : 0.55}
          />
        ))}
        {layout.villages.map((v) =>
          v.houses.map(({ p, at }) => {
            const k = key(p);
            const visited = walkPos.has(k);
            return (
              <House
                key={k}
                p={p}
                at={at}
                size="sm"
                gate={highlight?.has(k) ?? false}
                state={k === current ? "current" : visited ? "visited" : "unvisited"}
              />
            );
          }),
        )}
        {current && <Player at={layout.index.get(current)!} scale={0.6} />}
      </svg>
    </MapFrame>
  );
}

/* ------------------------------------------------------------------ */
/*  Focused scenes & road tests                                        */
/* ------------------------------------------------------------------ */

export function OverlapRoadMap({ a, b }: { a: Perm; b: Perm }) {
  const cost = weight(a, b);
  const from = { x: 150, y: 172 };
  const to = { x: 490, y: 172 };
  const shared = a.length - cost;

  return (
    <MapFrame
      title="Road test"
      w={MAP_W}
      h={MAP_H}
      subtitle={`${key(a)} to ${key(b)}`}
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          <span>overlap reuses {shared} character{shared === 1 ? "" : "s"}</span>
          <span>price on the link = {cost} new character{cost === 1 ? "" : "s"}</span>
        </div>
      }
    >
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={`link from ${key(a)} to ${key(b)} costs ${cost}`}>
        <TileField w={MAP_W} h={MAP_H} />
        <Road from={from} to={to} cost={cost} active />
        <text
          x={(from.x + to.x) / 2}
          y={128}
          textAnchor="middle"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="12"
          fontWeight="700"
          fill="#cfe9dd"
        >
          price of this link
        </text>
        <House p={a} at={from} state="visited" size="lg" />
        <TownLabel p={a} at={from} />
        <House p={b} at={to} state="current" size="lg" />
        <TownLabel p={b} at={to} />
        <Player at={to} />
      </svg>
    </MapFrame>
  );
}

/** A single rotation wheel drawn as a village of neighbours. */
export function RotationVillageMap({
  wheel,
  selected,
  visitedKeys,
  onSelect,
  title = "Rotation village",
  subtitle = "every road inside costs 1",
}: {
  wheel: Perm[];
  selected: Perm;
  visitedKeys?: Set<string>;
  onSelect?: (p: Perm) => void;
  title?: string;
  subtitle?: string;
}) {
  const center = { x: 320, y: 168 };
  const points = wheel.map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / wheel.length;
    return { x: center.x + Math.cos(a) * 208, y: center.y + Math.sin(a) * 108 };
  });
  const selIndex = wheel.findIndex((p) => key(p) === key(selected));

  return (
    <MapFrame
      title={title}
      w={MAP_W}
      h={MAP_H}
      subtitle={subtitle}
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          <span>{wheel.length} houses, all neighbours</span>
          <span>one lap = {wheel.length - 1} tolls</span>
        </div>
      }
    >
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="rotation wheel drawn as a village">
        <TileField w={MAP_W} h={MAP_H} />
        <ellipse cx={center.x} cy={center.y} rx="118" ry="66" fill="#286f75" stroke="#081b18" strokeWidth="8" />
        <ellipse cx={center.x} cy={center.y} rx="100" ry="52" fill="#3d92a0" stroke="#73c9bd" strokeWidth="3" strokeDasharray="6 5" />
        <text x={center.x} y={center.y - 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="13" fill="#eafaf4">
          VILLAGE WELL
        </text>
        <text x={center.x} y={center.y + 16} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#bfe8df">
          neighbours cost 1
        </text>
        {points.map((p, i) => (
          <Road key={i} from={p} to={points[(i + 1) % points.length]} cost={1} />
        ))}
        {wheel.map((p, i) => (
          <House
            key={key(p)}
            p={p}
            at={points[i]}
            size="lg"
            state={
              key(p) === key(selected)
                ? "current"
                : visitedKeys
                  ? visitedKeys.has(key(p))
                    ? "visited"
                    : "unvisited"
                  : "visited"
            }
            onClick={onSelect ? () => onSelect(p) : undefined}
          />
        ))}
        {wheel.map((p, i) => (
          <TownLabel key={`l-${key(p)}`} p={p} at={points[i]} />
        ))}
        {selIndex >= 0 && <Player at={points[selIndex]} />}
      </svg>
    </MapFrame>
  );
}

/** Demonstration of the Kick: a cost-2 move between two rotation villages. */
export function KickVillageMap({ from, to, crossed = false }: { from: Perm; to: Perm; crossed?: boolean }) {
  const village1 = wheelOfPerm(from);
  const village2 = wheelOfPerm(to);

  const center1 = { x: 170, y: 170 };
  const center2 = { x: 470, y: 170 };

  const points1 = village1.map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 6;
    return { x: center1.x + Math.cos(a) * 90, y: center1.y + Math.sin(a) * 80 };
  });
  const points2 = village2.map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 6;
    return { x: center2.x + Math.cos(a) * 90, y: center2.y + Math.sin(a) * 80 };
  });

  const idx1 = village1.findIndex((p) => key(p) === key(from));
  const idx2 = village2.findIndex((p) => key(p) === key(to));

  const p1 = points1[idx1 >= 0 ? idx1 : 0];
  const p2 = points2[idx2 >= 0 ? idx2 : 0];

  return (
    <MapFrame
      title="The Kick (Cost = 2)"
      w={MAP_W}
      h={MAP_H}
      subtitle={crossed ? `crossed: ${key(from)} -> ${key(to)}` : `still in village A, at ${key(from)}`}
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          <span>Kick = swap first 2 symbols and move to end</span>
          <span>pay 2 to cross between rotation villages</span>
        </div>
      }
    >
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="Kick connecting two rotation villages">
        <TileField w={MAP_W} h={MAP_H} />

        {/* Village 1 ring */}
        <ellipse cx={center1.x} cy={center1.y} rx="100" ry="88" fill="#1f4a33" stroke="#4f8a52" strokeWidth="2" strokeDasharray="6 4" />
        <text x={center1.x} y={center1.y} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="10" fill="#a3d9b1">
          VILLAGE A
        </text>

        {/* Village 2 ring */}
        <ellipse cx={center2.x} cy={center2.y} rx="100" ry="88" fill="#1f4a33" stroke="#4f8a52" strokeWidth="2" strokeDasharray="6 4" />
        <text x={center2.x} y={center2.y} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="10" fill="#a3d9b1">
          VILLAGE B
        </text>

        {/* Village 1 cost-1 roads */}
        {points1.map((p, i) => (
          <Road key={`a${i}`} from={p} to={points1[(i + 1) % 6]} cost={1} size="sm" />
        ))}
        {/* Village 2 cost-1 roads */}
        {points2.map((p, i) => (
          <Road key={`b${i}`} from={p} to={points2[(i + 1) % 6]} cost={1} size="sm" />
        ))}

        {/* The Kick Bridge (Cost 2): only visible once the traveller pays it */}
        {crossed ? (
          <Road from={p1} to={p2} cost={2} active />
        ) : (
          <line
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="#a77a52"
            strokeWidth="3"
            strokeDasharray="3 6"
            opacity="0.35"
          />
        )}

        {/* Houses */}
        {village1.map((p, i) => (
          <House key={key(p)} p={p} at={points1[i]} size="md" state={key(p) === key(from) ? "visited" : "unvisited"} />
        ))}
        {village1.map((p, i) => (
          <TownLabel key={`l1-${key(p)}`} p={p} at={points1[i]} size="sm" />
        ))}

        {village2.map((p, i) => (
          <House key={key(p)} p={p} at={points2[i]} size="md" state={key(p) === key(to) ? "current" : "unvisited"} />
        ))}
        {village2.map((p, i) => (
          <TownLabel key={`l2-${key(p)}`} p={p} at={points2[i]} size="sm" />
        ))}

        <Player at={crossed ? p2 : p1} scale={0.8} />
      </svg>
    </MapFrame>
  );
}

/** The 30 houses of one 2-loop, with EVERY house labelled and zoom control. */
export function LoopRegionMap({
  walk,
  shown,
  generators,
  zoom = "local",
}: {
  walk: Perm[];
  shown: number;
  generators: Set<string>;
  zoom?: "local" | "world";
}) {
  const centers: Point[] = [
    { x: 116, y: 96 },
    { x: 320, y: 84 },
    { x: 524, y: 96 },
    { x: 208, y: 248 },
    { x: 432, y: 248 },
  ];
  const points = walk.map((_, i) => {
    const c = centers[Math.floor(i / 6)] ?? centers[centers.length - 1];
    const local = i % 6;
    const a = -Math.PI / 2 + (local * Math.PI * 2) / 6;
    return { x: c.x + Math.cos(a) * 58, y: c.y + Math.sin(a) * 40 };
  });
  const visible = Math.min(shown, walk.length);

  if (zoom === "world") {
    return (
      <PermWorldMap
        n={6}
        path={walk.slice(0, visible)}
        title="2-Loop in World Perspective (144 Regions)"
        subtitle="Zoomed out: 30 houses highlighted inside 720 total houses"
        highlight={generators}
        footer={
          <div className="flex flex-wrap justify-between gap-2">
            <span>Highlighted region = 30 houses in 5 villages</span>
            <span>Orange = 5 generator gates</span>
          </div>
        }
      />
    );
  }

  return (
    <MapFrame
      title="2-Loop Region (30 Permutations)"
      w={MAP_W}
      h={MAP_H}
      subtitle={`${visible}/${walk.length} houses revealed`}
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          <span>5 villages x 6 houses = 30 permutations</span>
          <span>Orange roofs = the 5 entrance gates</span>
          <span>Red bridges = kicks (cost 2)</span>
        </div>
      }
    >
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="map of a 30-permutation 2-loop">
        <TileField w={MAP_W} h={MAP_H} dense />
        {centers.map((c, i) => (
          <g key={i}>
            <rect
              x={c.x - 76}
              y={c.y - 58}
              width="152"
              height="116"
              fill="#244f35"
              stroke="#69a24a"
              strokeWidth="3"
              strokeDasharray="7 5"
              opacity="0.8"
            />
            <text x={c.x} y={c.y - 44} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" fontWeight="700" fill="#a3d9b1">
              VILLAGE {i + 1}
            </text>
          </g>
        ))}
        {walk.slice(1, visible).map((p, i) => {
          const isKick = (i + 1) % 6 === 0;
          return isKick ? (
            <Road key={`${key(p)}-${i}`} from={points[i]} to={points[i + 1]} cost={2} size="sm" />
          ) : (
            <line
              key={`${key(p)}-${i}`}
              x1={points[i].x}
              y1={points[i].y}
              x2={points[i + 1].x}
              y2={points[i + 1].y}
              stroke="#65c5a2"
              strokeWidth={3}
            />
          );
        })}
        {walk.map((p, i) => (
          <g key={key(p)} opacity={i < visible ? 1 : 0.25}>
            <House
              p={p}
              at={points[i]}
              size="sm"
              gate={generators.has(key(p))}
              state={i === visible - 1 ? "current" : i < visible ? "visited" : "unvisited"}
            />
            <TownLabel p={p} at={points[i]} size="sm" />
          </g>
        ))}
        {visible > 0 && <Player at={points[visible - 1]} scale={0.72} />}
      </svg>
    </MapFrame>
  );
}

/** Absorption capacity diagram showing legal vs overflow stranded jumps! */
export function AbsorptionMap({
  regions,
  placed,
  maxRegions,
}: {
  regions: number;
  placed: number;
  maxRegions?: number;
}) {
  const activeRegions = maxRegions ?? regions;
  const capacity = activeRegions * 5;
  const stranded = Math.max(0, placed - capacity);

  const cols = 8;
  const rows = Math.ceil(activeRegions / cols);
  const w = 640;
  const h = Math.max(220, rows * 68 + 40);

  return (
    <MapFrame
      title={stranded > 0 ? "ABSORPTION CAPACITY OVERFLOW!" : "ABSORPTION CAPACITY"}
      w={w}
      h={h}
      subtitle={`${Math.min(placed, capacity)}/${capacity} gates filled (${placed} jumps)`}
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          <span>Each region has 5 gates</span>
          {stranded > 0 ? (
            <span className="font-bold text-[#ff7272]">{stranded} JUMPS ARE STRANDED WITH NO LANDING PAD!</span>
          ) : (
            <span>Every jump lands legally on an open gate</span>
          )}
        </div>
      }
    >
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="absorption capacity diagram">
        <TileField w={w} h={h} dense />
        {Array.from({ length: activeRegions }, (_, i) => {
          const x = 18 + (i % cols) * 77;
          const y = 16 + Math.floor(i / cols) * 68;
          const used = Math.max(0, Math.min(5, placed - i * 5));
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect width="66" height="52" fill="#26523c" stroke={used > 0 ? "#8fcf5d" : "#456957"} strokeWidth="3" />
              <rect x="25" y="16" width="16" height="13" fill="#d9c994" stroke="#081b18" strokeWidth="2" />
              <path d="M22 16 L33 7 L44 16 Z" fill={used === 5 ? "#f4a300" : "#a75850"} stroke="#081b18" strokeWidth="2" />
              {Array.from({ length: 5 }, (_, j) => (
                <rect
                  key={j}
                  x={7 + j * 11}
                  y="38"
                  width="8"
                  height="8"
                  fill={j < used ? "#fff176" : "#506c59"}
                  stroke="#081b18"
                  strokeWidth="1.5"
                />
              ))}
              <text x="5" y="11" fontFamily="IBM Plex Mono, monospace" fontSize="8" fontWeight="700" fill="#a3d9b1">
                R{i + 1}
              </text>
            </g>
          );
        })}

        {stranded > 0 && (
          <g transform={`translate(${w / 2 - 160} ${h - 50})`}>
            <rect width="320" height="40" fill="#8f3638" stroke="#220d18" strokeWidth="4" />
            <text x="160" y="25" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="13" fill="#fff4d6">
              CRITICAL: {stranded} STRANDED JUMPS!
            </text>
          </g>
        )}
      </svg>
    </MapFrame>
  );
}

/* ------------------------------------------------------------------ */
/*  Case B · the tiling board                                          */
/* ------------------------------------------------------------------ */

const REGION_COLORS = [
  "#e8615d", "#f0aa4f", "#f4d35e", "#a9c94f", "#65c5a2", "#4fb3c9",
  "#5b8fd6", "#7d6fd6", "#a862c9", "#d165b0", "#d1657f", "#c98a5b",
  "#b0a04f", "#7fb85e", "#4fc4a8", "#4f9fb8", "#6f86cf", "#8f6fcf",
  "#b567c4", "#c76796", "#bf6b6b", "#a8874f", "#89a84f", "#57b98a",
];

export interface TilingCell {
  label: string;
  region: number;
}

/**
 * The 120 rotation villages laid out as a board. Each 2-loop in the cover
 * claims exactly five villages, so a legal cover paints the board with 24
 * colours and no square left over.
 */
export function ExactCoverTilingMap({
  cells,
  revealedRegions,
  highlightRegion = null,
  collision = null,
  title = "The tiling board · 120 villages",
  subtitle,
}: {
  cells: TilingCell[];
  revealedRegions: number;
  highlightRegion?: number | null;
  /** Show the impossible case: one village double-booked, one left stranded. */
  collision?: { doubleBooked: number; stranded: number } | null;
  title?: string;
  subtitle?: string;
}) {
  const cols = 12;
  const cellW = 50;
  const cellH = 30;
  const w = 640;
  const h = Math.ceil(cells.length / cols) * cellH + 46;

  const painted = cells.filter((c) => c.region >= 0 && c.region < revealedRegions).length;

  return (
    <MapFrame
      title={title}
      w={w}
      h={h}
      subtitle={subtitle ?? `${painted}/120 villages claimed`}
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          <span>1 square = 1 village (6 houses)</span>
          <span>1 colour = 1 two-loop region (5 villages)</span>
          <span>{collision ? "illegal: overlap detected" : `${Math.min(revealedRegions, 24)}/24 regions placed`}</span>
        </div>
      }
    >
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="board of 120 villages coloured by region">
        <rect width={w} height={h} fill="#10231f" />
        <rect x="4" y="4" width={w - 8} height={h - 8} fill="none" stroke="#081b18" strokeWidth="8" />

        {cells.map((c, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = 22 + col * cellW;
          const y = 20 + row * cellH;

          const isStranded = collision?.stranded === i;
          const isDouble = collision?.doubleBooked === i;
          const shown = c.region >= 0 && c.region < revealedRegions;
          const dim = highlightRegion !== null && c.region !== highlightRegion;

          let fill = "#1b3a30";
          let stroke = "#2f5f4c";
          if (isStranded) {
            fill = "#3a1520";
            stroke = "#ff6b6b";
          } else if (isDouble) {
            fill = "#5d2a6b";
            stroke = "#f07cf0";
          } else if (shown) {
            fill = REGION_COLORS[c.region % REGION_COLORS.length];
            stroke = "#0b1c1c";
          }

          return (
            <g key={i} transform={`translate(${x} ${y})`} opacity={dim && !isStranded && !isDouble ? 0.25 : 1}>
              <rect
                width={cellW - 6}
                height={cellH - 6}
                fill={fill}
                stroke={stroke}
                strokeWidth={isStranded || isDouble ? 3 : 2}
              />
              <text
                x={(cellW - 6) / 2}
                y={15}
                textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="8.5"
                fontWeight="700"
                fill={shown && !isStranded && !isDouble ? "#15201d" : "#9fc4b4"}
              >
                {c.label}
              </text>
              {isStranded && (
                <text x={(cellW - 6) / 2} y={-2} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" fontWeight="700" fill="#ff8f8f">
                  ?
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </MapFrame>
  );
}

export function HeroWorld() {
  const towns: Point[] = [
    { x: 75, y: 210 },
    { x: 180, y: 105 },
    { x: 285, y: 225 },
    { x: 390, y: 92 },
    { x: 500, y: 205 },
    { x: 585, y: 115 },
  ];
  const labels = ["123", "231", "312", "213", "132", "321"];

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label="pixel art traveling salesman world"
    >
      <TileField w={MAP_W} h={MAP_H} dense />
      <polyline points={towns.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#071917" strokeWidth="14" />
      <polyline points={towns.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#f4d35e" strokeWidth="6" strokeDasharray="10 6" />
      {towns.map((p, i) => (
        <g key={i}>
          <House p={[1, 2, 3]} at={p} state={i === 5 ? "current" : "visited"} size="lg" />
          <g transform={`translate(${p.x} ${p.y})`}>
            <rect x="-22" y="20" width="44" height="16" fill="#071917" />
            <text x="0" y="32" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill="#fff176">
              {labels[i]}
            </text>
          </g>
        </g>
      ))}
      <Player at={towns[5]} />
    </svg>
  );
}
