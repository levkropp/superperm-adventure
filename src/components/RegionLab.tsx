import { useMemo, useState } from "react";
import { buildLoopStructure, key, loopWheelSets, Perm } from "../lib/perms";

type RegionModel = {
  n: number;
  clans: Perm[][];
  regions: number[][];
  regionPaths: number[][];
  memberships: number[][];
};

function makeModel(n: number): RegionModel {
  const structure = buildLoopStructure(n);
  const regions = loopWheelSets(structure);
  const memberships = Array.from({ length: structure.wheels.length }, () => [] as number[]);
  regions.forEach((memberIds, regionId) => memberIds.forEach((clanId) => memberships[clanId].push(regionId)));
  const regionPaths = structure.loopMembers.map((members) => {
    const path: number[] = [];
    const seen = new Set<number>();
    members.forEach((permutation) => {
      const clanId = structure.wheelOf.get(key(permutation));
      if (clanId !== undefined && !seen.has(clanId)) {
        seen.add(clanId);
        path.push(clanId);
      }
    });
    return path;
  });
  return { n, clans: structure.wheels, regions, regionPaths, memberships };
}

function clanLabel(clans: Perm[][], id: number) {
  return key(clans[id]?.[0] ?? []);
}

function Selector({ model, selected, onSelect }: { model: RegionModel; selected: number; onSelect: (id: number) => void }) {
  return (
    <label className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-wide text-ink-soft">
      inspect clan
      <select
        value={selected}
        onChange={(event) => onSelect(Number(event.target.value))}
        className="border-2 border-ink bg-[#fffbe9] px-2 py-1 font-mono text-[13px] text-ink"
      >
        {model.clans.map((_, id) => (
          <option key={id} value={id}>
            {clanLabel(model.clans, id)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ModelTag({ model, selected }: { model: RegionModel; selected: number }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-ink/25 pb-2">
      <strong className="font-mono text-[14px] text-accent">n = {model.n}</strong>
      <span className="font-mono text-[12px] text-ink-soft">
        {model.regions.length} federations · {model.memberships[selected].length} contain {clanLabel(model.clans, selected)}
      </span>
    </div>
  );
}

function LabCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="border-4 border-ink bg-[#fffbe9] p-4 shadow-[5px_5px_0_#1d1e33] sm:p-5">
      <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-3xl text-[16px] leading-relaxed text-ink-soft">{description}</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

const REGION_COLORS = ["#e8615d", "#f0aa4f", "#f4d35e", "#a9c94f", "#65c5a2", "#4fb3c9", "#7d6fd6", "#d879b5"];
const MATRIX_X = 116;
const MATRIX_COLUMN_WIDTH = 112;
const MATRIX_CELL_WIDTH = 102;
const MATRIX_ROW_Y = 88;
const MATRIX_ROW_STEP = 40;
const MATRIX_ROW_HEIGHT = 30;

function FederationPath({ model, regionId, selected, selectedRegion }: { model: RegionModel; regionId: number; selected: number; selectedRegion: number | null }) {
  const path = model.regionPaths[regionId] ?? model.regions[regionId];
  return (
    <div className="border-3 border-ink bg-[#f3ead0] p-3 shadow-[3px_3px_0_#1d1e33]">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-dashed border-ink/25 pb-2">
        <strong className="font-mono text-[14px] text-ink">R{regionId + 1} federation route</strong>
        <span className="font-mono text-[11px] text-ink-soft">3 clans · 12 permutations</span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {path.map((clanId, position) => (
          <div key={clanId} className={`border-3 border-ink p-2 ${selectedRegion === null && clanId === selected ? "bg-[#fff176]" : "bg-[#fffbe9]"}`}>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-soft">clan {position + 1}</div>
            <strong className="font-mono text-lg text-ink">{clanLabel(model.clans, clanId)}</strong>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {model.clans[clanId].map((permutation) => (
                <span key={key(permutation)} className="border border-ink/40 bg-[#e3f2d6] px-1 py-0.5 text-center font-mono text-[11px] text-ink">
                  {key(permutation)}
                </span>
              ))}
            </div>
            <div className="mt-2 font-mono text-[10px] text-ink-soft">4 rotations · cost 1 each</div>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-soft">
        Read the route left to right: rotations stay inside a clan, then a cost-2 kick crosses to the next clan.
      </p>
    </div>
  );
}

type VisualPoint = { x: number; y: number };

type FederationVisualProps = {
  model: RegionModel;
  selected: number;
  selectedRegion: number | null;
  activeRegionIds: number[];
  onSelectRegion: (id: number) => void;
};

const CLAN_COLORS = ["#f4d35e", "#65c5a2", "#4fb3c9", "#d879b5", "#7d6fd6", "#a9c94f"];
const CONSTELLATION_CLANS: VisualPoint[] = [
  { x: 450, y: 125 },
  { x: 585, y: 185 },
  { x: 585, y: 335 },
  { x: 450, y: 395 },
  { x: 315, y: 335 },
  { x: 315, y: 185 },
];
const CONSTELLATION_FEDERATIONS: VisualPoint[] = [
  { x: 450, y: 42 },
  { x: 650, y: 72 },
  { x: 790, y: 180 },
  { x: 750, y: 378 },
  { x: 585, y: 448 },
  { x: 315, y: 448 },
  { x: 150, y: 378 },
  { x: 110, y: 180 },
];
const GLOBE_CLANS: VisualPoint[] = [
  { x: 370, y: 165 },
  { x: 460, y: 142 },
  { x: 535, y: 190 },
  { x: 380, y: 285 },
  { x: 465, y: 315 },
  { x: 540, y: 270 },
];
const ORBIT_CLANS: VisualPoint[] = [
  { x: 450, y: 88 },
  { x: 620, y: 170 },
  { x: 605, y: 340 },
  { x: 450, y: 422 },
  { x: 295, y: 340 },
  { x: 280, y: 170 },
];
const MOONS: VisualPoint[] = [
  { x: 145, y: 125 },
  { x: 350, y: 125 },
  { x: 555, y: 125 },
  { x: 760, y: 125 },
  { x: 145, y: 350 },
  { x: 350, y: 350 },
  { x: 555, y: 350 },
  { x: 760, y: 350 },
];
const ARCHIPELAGO_CLANS: VisualPoint[] = [
  { x: 105, y: 370 },
  { x: 245, y: 335 },
  { x: 380, y: 390 },
  { x: 520, y: 335 },
  { x: 655, y: 390 },
  { x: 795, y: 345 },
];
const ARCHIPELAGO_SATELLITES: VisualPoint[] = [
  { x: 65, y: 88 },
  { x: 175, y: 88 },
  { x: 285, y: 88 },
  { x: 395, y: 88 },
  { x: 505, y: 88 },
  { x: 615, y: 88 },
  { x: 725, y: 88 },
  { x: 835, y: 88 },
];

function isClanHighlighted(model: RegionModel, clanId: number, selected: number, selectedRegion: number | null) {
  return selectedRegion === null ? clanId === selected : model.regions[selectedRegion].includes(clanId);
}

function linkPath(from: VisualPoint, to: VisualPoint, control: VisualPoint) {
  return `M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`;
}

function VisualCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 border-3 border-ink bg-[#10231f] p-2 shadow-[3px_3px_0_#1d1e33] sm:p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-1 pb-2">
        <strong className="font-mono text-[14px] text-[#fff4cb]">{title}</strong>
        <span className="font-mono text-[11px] text-[#a3d9b1]">{description}</span>
      </div>
      {children}
    </div>
  );
}

function SatelliteBadge({ point, regionId, color, active, inspected, onSelectRegion }: { point: VisualPoint; regionId: number; color: string; active: boolean; inspected: boolean; onSelectRegion: (id: number) => void }) {
  return (
    <g onClick={() => onSelectRegion(regionId)} className="cursor-pointer" opacity={active ? 1 : 0.18}>
      <circle cx={point.x} cy={point.y} r={inspected ? 24 : 19} fill={inspected ? "#fff176" : color} fillOpacity={active ? 0.9 : 0.3} stroke={inspected ? "#fff176" : color} strokeWidth={inspected ? 4 : 2} />
      <text x={point.x} y={point.y + 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill={inspected ? "#1d1e33" : "#fff4cb"}>R{regionId + 1}</text>
    </g>
  );
}

function FederationWorld({ model, selected, selectedRegion, activeRegionIds, onSelectRegion }: FederationVisualProps) {
  return (
    <VisualCard title="Federation world" description="continents = clans · satellites = federations">
      <svg viewBox="0 0 900 500" className="w-full border-2 border-[#315342]" role="img" aria-label="globe with clan continents and federation satellites">
        <defs>
          <radialGradient id="federation-world-glow" cx="35%" cy="28%">
            <stop offset="0%" stopColor="#47836b" />
            <stop offset="70%" stopColor="#1c4b3d" />
            <stop offset="100%" stopColor="#10231f" />
          </radialGradient>
        </defs>
        <rect width="900" height="500" fill="#10231f" />
        <ellipse cx="450" cy="250" rx="350" ry="190" fill="none" stroke="#315342" strokeWidth="2" strokeDasharray="7 8" />
        <circle cx="450" cy="250" r="138" fill="url(#federation-world-glow)" stroke="#a3d9b1" strokeWidth="3" />
        <text x="450" y="245" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="700" fill="#a3d9b1" opacity="0.7">CLAN WORLD</text>
        <text x="450" y="263" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#a3d9b1" opacity="0.7">6 continents · 4 satellites per clan</text>
        {model.regions.map((memberIds, regionId) => memberIds.map((clanId) => {
          const active = activeRegionIds.includes(regionId);
          return <path key={`${regionId}-${clanId}`} d={linkPath(CONSTELLATION_FEDERATIONS[regionId], GLOBE_CLANS[clanId], { x: 450, y: 250 })} fill="none" stroke={REGION_COLORS[regionId % REGION_COLORS.length]} strokeWidth={active ? 3 : 1.5} opacity={active ? 0.75 : 0.08} />;
        }))}
        {GLOBE_CLANS.map((point, clanId) => {
          const active = isClanHighlighted(model, clanId, selected, selectedRegion);
          return (
            <g key={clanId} opacity={active ? 1 : 0.35}>
              <ellipse cx={point.x} cy={point.y} rx="39" ry="22" fill={CLAN_COLORS[clanId]} stroke={selectedRegion === null && clanId === selected ? "#fff176" : "#10231f"} strokeWidth={selectedRegion === null && clanId === selected ? 4 : 2} transform={`rotate(${clanId % 2 === 0 ? -12 : 14} ${point.x} ${point.y})`} />
              <text x={point.x} y={point.y + 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill="#1d1e33">{clanLabel(model.clans, clanId)}</text>
            </g>
          );
        })}
        {model.regions.map((_, regionId) => <SatelliteBadge key={regionId} point={CONSTELLATION_FEDERATIONS[regionId]} regionId={regionId} color={REGION_COLORS[regionId % REGION_COLORS.length]} active={activeRegionIds.includes(regionId)} inspected={selectedRegion === regionId} onSelectRegion={onSelectRegion} />)}
        <text x="24" y="478" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#a3d9b1">click a continent or satellite · selected relationships beam brighter</text>
      </svg>
    </VisualCard>
  );
}

function FederationConstellation({ model, selected, selectedRegion, activeRegionIds, onSelectRegion }: FederationVisualProps) {
  return (
    <VisualCard title="Federation constellation" description="a direct bipartite network of clans and federations">
      <svg viewBox="0 0 900 500" className="w-full border-2 border-[#315342]" role="img" aria-label="constellation connecting six clans to eight federations">
        <rect width="900" height="500" fill="#10231f" />
        <circle cx="450" cy="260" r="105" fill="#17362d" stroke="#315342" strokeWidth="2" strokeDasharray="5 7" />
        <text x="450" y="255" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="700" fill="#a3d9b1">CLANS</text>
        <text x="450" y="273" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#a3d9b1">shared anchors</text>
        {model.regions.map((memberIds, regionId) => memberIds.map((clanId) => {
          const active = activeRegionIds.includes(regionId);
          const control = { x: 450 + (CONSTELLATION_CLANS[clanId].x - 450) * 0.25, y: 260 + (CONSTELLATION_CLANS[clanId].y - 260) * 0.25 };
          return <path key={`${regionId}-${clanId}`} d={linkPath(CONSTELLATION_FEDERATIONS[regionId], CONSTELLATION_CLANS[clanId], control)} fill="none" stroke={REGION_COLORS[regionId % REGION_COLORS.length]} strokeWidth={active ? 3.5 : 1} opacity={active ? 0.82 : 0.08} />;
        }))}
        {CONSTELLATION_CLANS.map((point, clanId) => {
          const active = isClanHighlighted(model, clanId, selected, selectedRegion);
          return (
            <g key={clanId} opacity={active ? 1 : 0.35}>
              <circle cx={point.x} cy={point.y} r={selectedRegion === null && clanId === selected ? 31 : 26} fill={CLAN_COLORS[clanId]} stroke={selectedRegion === null && clanId === selected ? "#fff176" : "#10231f"} strokeWidth={selectedRegion === null && clanId === selected ? 4 : 2} />
              <text x={point.x} y={point.y + 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill="#1d1e33">{clanLabel(model.clans, clanId)}</text>
            </g>
          );
        })}
        {model.regions.map((_, regionId) => <SatelliteBadge key={regionId} point={CONSTELLATION_FEDERATIONS[regionId]} regionId={regionId} color={REGION_COLORS[regionId % REGION_COLORS.length]} active={activeRegionIds.includes(regionId)} inspected={selectedRegion === regionId} onSelectRegion={onSelectRegion} />)}
        <text x="24" y="478" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#a3d9b1">six stable clan nodes · eight federation nodes · one line per membership</text>
      </svg>
    </VisualCard>
  );
}

function regionLoopPath(memberIds: number[], points: VisualPoint[]) {
  const center = memberIds.reduce((sum, clanId) => ({ x: sum.x + points[clanId].x / memberIds.length, y: sum.y + points[clanId].y / memberIds.length }), { x: 0, y: 0 });
  const orderedIds = [...memberIds].sort((a, b) => Math.atan2(points[a].y - center.y, points[a].x - center.x) - Math.atan2(points[b].y - center.y, points[b].x - center.x));
  return orderedIds.reduce((path, clanId, index) => {
    const current = points[clanId];
    const next = points[orderedIds[(index + 1) % orderedIds.length]];
    const midpoint = { x: (current.x + next.x) / 2, y: (current.y + next.y) / 2 };
    const control = { x: midpoint.x + (midpoint.x - center.x) * 0.55, y: midpoint.y + (midpoint.y - center.y) * 0.55 };
    return `${path}${index === 0 ? `M ${current.x} ${current.y}` : ""} Q ${control.x} ${control.y} ${next.x} ${next.y}`;
  }, "") + " Z";
}

function FederationOrbitalAtlas({ model, selected, selectedRegion, activeRegionIds, onSelectRegion }: FederationVisualProps) {
  return (
    <VisualCard title="Orbital atlas" description="each federation is an orbit passing through its three clans">
      <svg viewBox="0 0 900 500" className="w-full border-2 border-[#315342]" role="img" aria-label="orbital atlas of federation loops around clan planets">
        <rect width="900" height="500" fill="#10231f" />
        <ellipse cx="450" cy="255" rx="225" ry="185" fill="none" stroke="#315342" strokeWidth="2" strokeDasharray="6 8" />
        <ellipse cx="450" cy="255" rx="84" ry="49" fill="#b26a12" fillOpacity="0.85" stroke="#fff176" strokeWidth="3" />
        <text x="450" y="252" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="700" fill="#fff4cb">2-LOOP ATLAS</text>
        <text x="450" y="270" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#fff4cb">eight possible orbits</text>
        {model.regions.map((memberIds, regionId) => {
          const active = activeRegionIds.includes(regionId);
          const center = memberIds.reduce((sum, clanId) => ({ x: sum.x + ORBIT_CLANS[clanId].x / memberIds.length, y: sum.y + ORBIT_CLANS[clanId].y / memberIds.length }), { x: 0, y: 0 });
          return (
            <g key={regionId} onClick={() => onSelectRegion(regionId)} className="cursor-pointer" opacity={active ? 1 : 0.1}>
              <path d={regionLoopPath(memberIds, ORBIT_CLANS)} fill={REGION_COLORS[regionId % REGION_COLORS.length]} fillOpacity={selectedRegion === regionId ? 0.22 : 0.04} stroke={selectedRegion === regionId ? "#fff176" : REGION_COLORS[regionId % REGION_COLORS.length]} strokeWidth={selectedRegion === regionId ? 4 : active ? 2.5 : 1.2} strokeDasharray="8 5" />
              {(active || selectedRegion === regionId) && <text x={center.x} y={center.y} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill={selectedRegion === regionId ? "#fff176" : REGION_COLORS[regionId % REGION_COLORS.length]}>R{regionId + 1}</text>}
            </g>
          );
        })}
        {ORBIT_CLANS.map((point, clanId) => {
          const active = isClanHighlighted(model, clanId, selected, selectedRegion);
          return (
            <g key={clanId} opacity={active ? 1 : 0.35}>
              <circle cx={point.x} cy={point.y} r="30" fill={CLAN_COLORS[clanId]} stroke={selectedRegion === null && clanId === selected ? "#fff176" : "#10231f"} strokeWidth={selectedRegion === null && clanId === selected ? 4 : 2} />
              <text x={point.x} y={point.y + 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill="#1d1e33">{clanLabel(model.clans, clanId)}</text>
            </g>
          );
        })}
        <text x="24" y="478" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#a3d9b1">colored tracks pass through exactly three clan planets · click an orbit to inspect it</text>
      </svg>
    </VisualCard>
  );
}

function FederationMoons({ model, selected, selectedRegion, activeRegionIds, onSelectRegion }: FederationVisualProps) {
  const moonClanOffsets = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
  return (
    <VisualCard title="Federation moons" description="each moon contains the three clans in one federation">
      <svg viewBox="0 0 900 500" className="w-full border-2 border-[#315342]" role="img" aria-label="eight federation moons each containing three clan labels">
        <rect width="900" height="500" fill="#10231f" />
        <text x="24" y="28" fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="700" fill="#fff4cb">eight federation worlds · repeated clan colors show overlap</text>
        {model.regions.map((memberIds, regionId) => {
          const point = MOONS[regionId];
          const color = REGION_COLORS[regionId % REGION_COLORS.length];
          const active = activeRegionIds.includes(regionId);
          const inspected = selectedRegion === regionId;
          return (
            <g key={regionId} onClick={() => onSelectRegion(regionId)} className="cursor-pointer" opacity={active ? 1 : 0.22}>
              <circle cx={point.x} cy={point.y} r="84" fill="#17362d" stroke={inspected ? "#fff176" : color} strokeWidth={inspected ? 5 : 3} />
              <circle cx={point.x - 26} cy={point.y - 30} r="52" fill={color} fillOpacity="0.11" />
              <text x={point.x} y={point.y - 55} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700" fill={inspected ? "#fff176" : color}>R{regionId + 1}</text>
              {memberIds.map((clanId, position) => {
                const angle = moonClanOffsets[position];
                const mini = { x: point.x + Math.cos(angle) * 48, y: point.y + Math.sin(angle) * 48 };
                const clanActive = isClanHighlighted(model, clanId, selected, selectedRegion);
                return (
                  <g key={clanId} opacity={clanActive ? 1 : 0.65}>
                    <circle cx={mini.x} cy={mini.y} r="22" fill={CLAN_COLORS[clanId]} stroke={selectedRegion === null && clanId === selected ? "#fff176" : "#10231f"} strokeWidth={selectedRegion === null && clanId === selected ? 3 : 1.5} />
                    <text x={mini.x} y={mini.y + 3} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fontWeight="700" fill="#1d1e33">{clanLabel(model.clans, clanId)}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
        <text x="24" y="478" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#a3d9b1">the same clan label appears on every moon that contains it · click a moon to select a federation</text>
      </svg>
    </VisualCard>
  );
}

export function FederationArchipelago({ model, selected, selectedRegion, activeRegionIds, onSelectRegion }: FederationVisualProps) {
  return (
    <VisualCard title="Federation archipelago" description="satellites beam to the three islands they govern">
      <svg viewBox="0 0 900 500" className="w-full border-2 border-[#315342]" role="img" aria-label="archipelago of clans connected to federation satellites">
        <rect width="900" height="500" fill="#10231f" />
        <path d="M 24 245 C 180 215 300 270 450 242 S 720 210 876 250 L 876 470 L 24 470 Z" fill="#16382d" stroke="#315342" strokeWidth="2" />
        <text x="24" y="28" fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="700" fill="#fff4cb">six clan islands · eight federation satellites</text>
        {model.regions.map((memberIds, regionId) => {
          const active = activeRegionIds.includes(regionId);
          const color = REGION_COLORS[regionId % REGION_COLORS.length];
          return memberIds.map((clanId) => (
            <line key={`${regionId}-${clanId}`} x1={ARCHIPELAGO_SATELLITES[regionId].x} y1={ARCHIPELAGO_SATELLITES[regionId].y + 13} x2={ARCHIPELAGO_CLANS[clanId].x} y2={ARCHIPELAGO_CLANS[clanId].y - 30} stroke={color} strokeWidth={active ? 3 : 1} strokeDasharray={active ? undefined : "5 6"} opacity={active ? 1 : 0.2} />
          ));
        })}
        {ARCHIPELAGO_CLANS.map((point, clanId) => {
          const active = isClanHighlighted(model, clanId, selected, selectedRegion);
          return (
            <g key={clanId} opacity={active ? 1 : 0.3}>
              <path d={`M ${point.x - 48} ${point.y + 15} L ${point.x - 34} ${point.y - 24} L ${point.x - 7} ${point.y - 35} L ${point.x + 37} ${point.y - 22} L ${point.x + 52} ${point.y + 10} L ${point.x + 27} ${point.y + 31} L ${point.x - 22} ${point.y + 33} Z`} fill={CLAN_COLORS[clanId]} stroke={selectedRegion === null && clanId === selected ? "#fff176" : "#10231f"} strokeWidth={selectedRegion === null && clanId === selected ? 4 : 2} />
              <text x={point.x} y={point.y + 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill="#1d1e33">{clanLabel(model.clans, clanId)}</text>
            </g>
          );
        })}
        {model.regions.map((_, regionId) => {
          const point = ARCHIPELAGO_SATELLITES[regionId];
          const color = REGION_COLORS[regionId % REGION_COLORS.length];
          const active = activeRegionIds.includes(regionId);
          const inspected = selectedRegion === regionId;
          return (
            <g key={regionId} onClick={() => onSelectRegion(regionId)} className="cursor-pointer" opacity={active ? 1 : 0.2}>
              <path d={`M ${point.x - 19} ${point.y + 13} L ${point.x + 19} ${point.y + 13} L ${point.x + 13} ${point.y - 5} L ${point.x - 13} ${point.y - 5} Z`} fill={inspected ? "#fff176" : color} stroke={inspected ? "#fff176" : color} strokeWidth={inspected ? 3 : 1.5} />
              <path d={`M ${point.x - 13} ${point.y - 5} L ${point.x} ${point.y - 22} L ${point.x + 13} ${point.y - 5} Z`} fill={color} stroke="#10231f" strokeWidth="1.5" />
              <text x={point.x} y={point.y + 9} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fontWeight="700" fill={inspected ? "#1d1e33" : "#fff4cb"}>R{regionId + 1}</text>
              {active && <path d={`M ${point.x - 29} ${point.y - 25} L ${point.x + 29} ${point.y - 25}`} stroke={color} strokeWidth={inspected ? 3 : 1.5} opacity="0.8" />}
            </g>
          );
        })}
        <text x="24" y="478" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#a3d9b1">each satellite sends exactly three beams · select a clan or satellite to follow its relationships</text>
      </svg>
    </VisualCard>
  );
}

type VisualizationId = "world" | "constellation" | "orbital" | "moons" | "archipelago";

const VISUALIZATIONS: { id: VisualizationId; label: string }[] = [
  { id: "world", label: "federation world" },
  { id: "constellation", label: "constellation" },
  { id: "orbital", label: "orbital atlas" },
  { id: "moons", label: "federation moons" },
  { id: "archipelago", label: "archipelago" },
];

function FederationGallery(props: FederationVisualProps) {
  const [visualization, setVisualization] = useState<VisualizationId>("archipelago");
  return (
    <div className="mt-4 border-t-4 border-dashed border-ink/25 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">compare views</span>
        {VISUALIZATIONS.map((option) => (
          <button key={option.id} onClick={() => setVisualization(option.id)} className={`border-2 border-ink px-2 py-1 font-mono text-[11px] font-bold ${visualization === option.id ? "bg-[#fff176] shadow-[2px_2px_0_#1d1e33]" : "bg-[#fffbe9]"}`}>
            {option.label}
          </button>
        ))}
      </div>
      {visualization === "world" && <FederationWorld {...props} />}
      {visualization === "constellation" && <FederationConstellation {...props} />}
      {visualization === "orbital" && <FederationOrbitalAtlas {...props} />}
      {visualization === "moons" && <FederationMoons {...props} />}
      {visualization === "archipelago" && <FederationArchipelago {...props} />}
    </div>
  );
}

function N4FederationView({ model, selected, onSelect, showGallery = true }: { model: RegionModel; selected: number; onSelect: (id: number) => void; showGallery?: boolean }) {
  const regionIds = model.regions.map((_, regionId) => regionId);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const activeRegionIds = selectedRegion === null ? model.memberships[selected] : [selectedRegion];
  const highlightedClans = new Set(selectedRegion === null ? [selected] : model.regions[selectedRegion]);
  const inspectedRegionId = selectedRegion ?? activeRegionIds[0] ?? 0;

  return (
    <div>
      <ModelTag model={model} selected={selected} />
      <div className="grid gap-3 lg:grid-cols-[7rem_minmax(0,1fr)_7rem] lg:items-start">
        <aside className="order-2 space-y-2 lg:order-1">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">clans</div>
          {model.clans.map((_, clanId) => (
            <button
              key={clanId}
              onClick={() => {
                setSelectedRegion(null);
                onSelect(clanId);
              }}
              className={`block w-full border-2 border-ink px-1 py-1 font-mono text-[11px] font-bold ${clanId === selected && selectedRegion === null ? "bg-[#fff176] shadow-[2px_2px_0_#1d1e33]" : highlightedClans.has(clanId) ? "bg-[#f6dcab]" : "bg-[#fffbe9]"}`}
            >
              {clanLabel(model.clans, clanId)}
            </button>
          ))}
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <svg
            viewBox="0 0 900 440"
            className="w-full border-3 border-ink bg-[#10231f]"
            role="img"
            aria-label="n equals 4 federation membership matrix"
          >
          <rect width="900" height="440" fill="#10231f" />
          <text x="24" y="28" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700" fill="#fff4cb">membership map · each row is one federation</text>
          <text x="24" y="48" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#a3d9b1">select a clan to see its four memberships, or select a row to inspect that 2-loop</text>
          <text x="34" y="78" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill="#a3d9b1">FEDERATION</text>
          {model.clans.map((_, clanId) => {
            const x = MATRIX_X + clanId * MATRIX_COLUMN_WIDTH;
            const active = highlightedClans.has(clanId);
            return (
              <g key={clanId} onClick={() => { setSelectedRegion(null); onSelect(clanId); }} className="cursor-pointer">
                <rect x={x} y="54" width={MATRIX_CELL_WIDTH} height="30" fill={active ? "#fff176" : "#244f35"} stroke="#69a24a" strokeWidth="1.5" />
                <text x={x + MATRIX_CELL_WIDTH / 2} y="74" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700" fill={active ? "#1d1e33" : "#d8f0dc"}>{clanLabel(model.clans, clanId)}</text>
              </g>
            );
          })}
          {regionIds.map((regionId) => {
            const y = MATRIX_ROW_Y + regionId * MATRIX_ROW_STEP;
            const memberIds = model.regions[regionId];
            const color = REGION_COLORS[regionId % REGION_COLORS.length];
            const active = activeRegionIds.includes(regionId);
            const inspected = selectedRegion === regionId;
            return (
              <g key={regionId} onClick={() => setSelectedRegion(regionId)} className="cursor-pointer" opacity={active ? 1 : 0.22}>
                <rect x="18" y={y} width="864" height={MATRIX_ROW_HEIGHT} fill={inspected ? "#fff176" : active ? "#244f35" : "#17362d"} stroke={inspected ? "#fff176" : "#406954"} strokeWidth={inspected ? 2.5 : 1} />
                <text x="34" y={y + 20} fontFamily="IBM Plex Mono, monospace" fontSize="12" fontWeight="700" fill={inspected ? "#1d1e33" : "#fff4cb"}>R{regionId + 1}</text>
                {model.clans.map((_, clanId) => {
                  const x = MATRIX_X + clanId * MATRIX_COLUMN_WIDTH;
                  const member = memberIds.includes(clanId);
                  return (
                    <g key={clanId}>
                      <rect x={x} y={y + 4} width={MATRIX_CELL_WIDTH} height={MATRIX_ROW_HEIGHT - 8} fill={member ? color : "#10231f"} stroke={member ? color : "#315342"} strokeWidth="1" />
                      {member && <text x={x + MATRIX_CELL_WIDTH / 2} y={y + 20} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fontWeight="700" fill="#1d1e33">IN</text>}
                    </g>
                  );
                })}
                <text x="820" y={y + 20} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill={inspected ? "#1d1e33" : "#a3d9b1"}>3 CLANS</text>
              </g>
            );
          })}
          <text x="24" y="420" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#a3d9b1">IN = this clan belongs to the federation · highlighted rows share the selected clan</text>
          </svg>
          {showGallery ? (
            <FederationGallery
              model={model}
              selected={selected}
              selectedRegion={selectedRegion}
              activeRegionIds={activeRegionIds}
              onSelectRegion={setSelectedRegion}
            />
          ) : (
            <FederationArchipelago
              model={model}
              selected={selected}
              selectedRegion={selectedRegion}
              activeRegionIds={activeRegionIds}
              onSelectRegion={setSelectedRegion}
            />
          )}
          <FederationPath model={model} regionId={inspectedRegionId} selected={selected} selectedRegion={selectedRegion} />
        </div>

        <aside className="order-3 space-y-2">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-soft">federations</div>
          {model.regions.map((memberIds, regionId) => {
            const active = activeRegionIds.includes(regionId);
            return (
              <button
                key={regionId}
                onClick={() => setSelectedRegion(regionId)}
                className={`block w-full border-2 border-ink px-1 py-1 font-mono text-[11px] font-bold ${selectedRegion === regionId ? "bg-[#fff176] shadow-[2px_2px_0_#1d1e33]" : active ? "bg-[#f6dcab]" : "bg-[#fffbe9]"}`}
              >
                R{regionId + 1} <span className="font-normal">({memberIds.length})</span>
              </button>
            );
          })}
        </aside>
      </div>
    </div>
  );
}

export function FederationMainDemo4() {
  const model = useMemo(() => makeModel(4), []);
  const [selected, setSelected] = useState(0);
  return <N4FederationView model={model} selected={selected} onSelect={setSelected} showGallery={false} />;
}

function LabModel({ model, selected, onSelect, children, showSelector = true }: { model: RegionModel; selected: number; onSelect: (id: number) => void; children: React.ReactNode; showSelector?: boolean }) {
  return (
    <div className="border-3 border-ink bg-[#f7efcf] p-3">
      {showSelector && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Selector model={model} selected={selected} onSelect={onSelect} />
          <span className="font-mono text-[11px] text-ink-soft">{model.clans.length} clans · {model.regions.length} federations</span>
        </div>
      )}
      {children}
    </div>
  );
}

export default function RegionLab() {
  const model4 = useMemo(() => makeModel(4), []);
  const [selected4, setSelected4] = useState(0);

  return (
    <main className="min-h-screen bg-[#f7efcf] px-4 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="border-b-8 border-ink pb-6">
          <div className="font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-accent">Visualization lab</div>
          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-6xl">How should a 2-loop federation look?</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">
            This focused n = 4 explorer shows exactly how the six rotation clans overlap across eight
            possible 2-loop federations. The main article is unchanged while this side lab is open at <code>?lab=regions</code>.
          </p>
        </header>

        <LabCard title="Federation membership" description="Each row is one n = 4 2-loop federation. The map makes overlap explicit, then expands one federation into its three rotation clans.">
          <div className="lg:col-span-2">
            <LabModel model={model4} selected={selected4} onSelect={setSelected4} showSelector={false}><N4FederationView model={model4} selected={selected4} onSelect={setSelected4} /></LabModel>
          </div>
        </LabCard>


      </div>
    </main>
  );
}
