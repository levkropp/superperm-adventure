import { useMemo, useRef, useState } from "react";
import { buildLoopStructure, key, loopWheelSets, Perm } from "../lib/perms";
import { ClanCoat, House } from "./PixelMaps";

type RegionModel = {
  n: number;
  clans: Perm[][];
  regions: number[][];
  memberships: number[][];
};

function makeModel(n: number): RegionModel {
  const structure = buildLoopStructure(n);
  const regions = loopWheelSets(structure);
  const memberships = Array.from({ length: structure.wheels.length }, () => [] as number[]);
  regions.forEach((memberIds, regionId) => memberIds.forEach((clanId) => memberships[clanId].push(regionId)));
  return { n, clans: structure.wheels, regions, memberships };
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
        {model.regions.length} regions · {model.memberships[selected].length} contain {clanLabel(model.clans, selected)}
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

function ExplodedFederations({ model, selected }: { model: RegionModel; selected: number }) {
  const regionIds = model.memberships[selected];
  return (
    <div className="space-y-3">
      <ModelTag model={model} selected={selected} />
      <div className="border-3 border-accent bg-[#f1ecff] p-3 text-center font-mono text-[14px] font-bold">
        selected clan: {clanLabel(model.clans, selected)}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {regionIds.map((regionId) => (
          <div key={regionId} className="border-3 border-ink bg-[#f3ead0] p-2 shadow-[3px_3px_0_#1d1e33]">
            <div className="font-mono text-[12px] font-bold uppercase tracking-wider text-accent">federation R{regionId + 1}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {model.regions[regionId].map((clanId) => (
                <span key={clanId} className={`border-2 border-ink px-1.5 py-0.5 font-mono text-[12px] ${clanId === selected ? "bg-[#fff176] font-bold" : "bg-white"}`}>
                  {clanLabel(model.clans, clanId)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Lab3DPoint = { x: number; y: number; z: number };

const N4_BASE: Lab3DPoint[] = [
  { x: -4, y: -2, z: 0 },
  { x: 0, y: -2.6, z: 0 },
  { x: 4, y: -2, z: 0 },
  { x: -3.4, y: 1.8, z: 0 },
  { x: 0, y: 1.2, z: 0 },
  { x: 3.4, y: 1.8, z: 0 },
];

const N4_TOWN_OFFSETS: Lab3DPoint[] = [
  { x: -0.45, y: -0.3, z: 0.05 },
  { x: 0.45, y: -0.3, z: 0.1 },
  { x: -0.45, y: 0.3, z: 0 },
  { x: 0.45, y: 0.3, z: 0.08 },
];

function projectLabPoint(point: Lab3DPoint, yaw: number, pitch: number, scale = 54) {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const x = point.x * cosYaw - point.y * sinYaw;
  const depth = point.x * sinYaw + point.y * cosYaw;
  const vertical = point.z * cosPitch - depth * sinPitch;
  return { x: 450 + x * scale, y: 255 - vertical * scale, depth: point.z * sinPitch + depth * cosPitch };
}

function N4FederationView({ model, selected, onSelect }: { model: RegionModel; selected: number; onSelect: (id: number) => void }) {
  const [camera, setCamera] = useState({ yaw: -0.55, pitch: 0.65 });
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const regionIds = model.memberships[selected];
  const offsets = [{ x: -14, y: 12 }, { x: 14, y: 12 }, { x: -14, y: 36 }, { x: 14, y: 36 }];

  const handleDown = (event: React.PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    suppressClick.current = false;
    drag.current = { x: event.clientX, y: event.clientY, moved: false };
  };
  const handleMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
    drag.current.x = event.clientX;
    drag.current.y = event.clientY;
    setCamera((previous) => ({
      yaw: previous.yaw + dx * 0.012,
      pitch: Math.max(-1.1, Math.min(1.1, previous.pitch + dy * 0.012)),
    }));
  };
  const handleUp = (event: React.PointerEvent<SVGSVGElement>) => {
    suppressClick.current = drag.current?.moved ?? false;
    drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  const projectedBase = N4_BASE.map((point) => projectLabPoint(point, camera.yaw, camera.pitch));

  return (
    <div>
      <ModelTag model={model} selected={selected} />
      <svg
        viewBox="0 0 900 520"
        className="w-full touch-none cursor-grab border-3 border-ink bg-[#10231f] active:cursor-grabbing"
        role="img"
        aria-label="draggable three-dimensional n equals 4 federation view"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      >
        <rect width="900" height="520" fill="#10231f" />
        {regionIds.map((regionId, i) => {
          const memberIds = model.regions[regionId];
          const centers = memberIds.map((clanId) => N4_BASE[clanId]);
          const center = centers.reduce((sum, point) => ({ x: sum.x + point.x / centers.length, y: sum.y + point.y / centers.length, z: 1.35 }), { x: 0, y: 0, z: 1.35 });
          const radiusX = Math.max(...centers.map((point) => Math.abs(point.x - center.x))) + 1.3;
          const radiusY = Math.max(...centers.map((point) => Math.abs(point.y - center.y))) + 1.1;
          const color = i === 0 ? "#65c5a2" : "#f0aa4f";
          return (
            <g key={regionId}>
              {Array.from({ length: 7 }, (_, slice) => {
                const t = slice / 6;
                const z = t * 2.7;
                const width = radiusX * (0.25 + Math.sin(Math.PI * t) * 0.9);
                const height = radiusY * (0.25 + Math.sin(Math.PI * t) * 0.9);
                const cloud = Array.from({ length: 12 }, (_, point) => {
                  const angle = (point * Math.PI * 2) / 12;
                  return projectLabPoint({ x: center.x + Math.cos(angle) * width, y: center.y + Math.sin(angle) * height, z }, camera.yaw, camera.pitch);
                });
                return <polygon key={slice} points={cloud.map((point) => `${point.x},${point.y}`).join(" ")} fill={color} fillOpacity={0.04} stroke={color} strokeWidth="1.5" strokeDasharray="5 5" />;
              })}
              {memberIds.map((clanId) => {
                const regionCenter = projectLabPoint({ ...center, z: 1.35 }, camera.yaw, camera.pitch);
                return <line key={clanId} x1={projectedBase[clanId].x} y1={projectedBase[clanId].y} x2={regionCenter.x} y2={regionCenter.y} stroke={clanId === selected ? "#fff176" : color} strokeWidth={clanId === selected ? 4 : 2} opacity="0.78" />;
              })}
              {(() => {
                const labelPoint = projectLabPoint({ ...center, z: 2.7 }, camera.yaw, camera.pitch);
                return <text x={labelPoint.x} y={labelPoint.y - 8} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700" fill={color}>R{regionId + 1} federation</text>;
              })()}
            </g>
          );
        })}
        {model.clans.map((clan, clanId) => {
          const point = projectedBase[clanId];
          return (
            <g key={clanId} transform={`translate(${point.x} ${point.y})`} onClick={() => !suppressClick.current && onSelect(clanId)} className="cursor-pointer">
              {clan.map((permutation, i) => {
                const town = N4_TOWN_OFFSETS[i];
                const townPoint = projectLabPoint({ x: N4_BASE[clanId].x + town.x, y: N4_BASE[clanId].y + town.y, z: town.z }, camera.yaw, camera.pitch);
                return <House key={key(permutation)} p={permutation} at={{ x: townPoint.x - point.x + offsets[i].x, y: townPoint.y - point.y + offsets[i].y }} size="sm" state={clanId === selected ? "current" : "unvisited"} />;
              })}
              <ClanCoat clan={clan[0]} at={{ x: 0, y: -32 }} scale={0.55} />
            </g>
          );
        })}
        <text x="24" y="30" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700" fill="#fff4cb">drag to orbit · click a labeled clan</text>
        <text x="24" y="50" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#a3d9b1">town points cluster inside clans · translucent clouds are federations</text>
      </svg>
    </div>
  );
}

function MembershipMatrix({ model, selected }: { model: RegionModel; selected: number }) {
  const regionIds = model.memberships[selected];
  const clanIds = [...new Set(regionIds.flatMap((regionId) => model.regions[regionId]))];
  return (
    <div>
      <ModelTag model={model} selected={selected} />
      <div className="overflow-x-auto border-3 border-ink bg-[#f3ead0]">
        <table className="min-w-full border-collapse font-mono text-[12px]">
          <thead>
            <tr>
              <th className="sticky left-0 border-b-2 border-r-2 border-ink bg-[#f3ead0] px-2 py-2 text-left">region</th>
              {clanIds.map((clanId) => (
                <th key={clanId} className={`border-b-2 border-ink px-2 py-2 ${clanId === selected ? "bg-[#fff176]" : ""}`}>
                  {clanLabel(model.clans, clanId)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regionIds.map((regionId) => (
              <tr key={regionId}>
                <th className="sticky left-0 border-r-2 border-ink bg-[#f3ead0] px-2 py-2 text-left text-accent">R{regionId + 1}</th>
                {clanIds.map((clanId) => (
                  <td key={clanId} className={`border-b border-ink/20 px-2 py-2 text-center ${clanId === selected ? "bg-[#fff176]" : ""}`}>
                    {model.regions[regionId].includes(clanId) ? "●" : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClanRows({ model, selected }: { model: RegionModel; selected: number }) {
  const regionIds = model.memberships[selected];
  return (
    <div className="space-y-2">
      <ModelTag model={model} selected={selected} />
      {regionIds.map((regionId) => (
        <div key={regionId} className="flex items-center gap-2 overflow-x-auto border-3 border-ink bg-[#f3ead0] p-2">
          <span className="w-9 shrink-0 font-mono text-[12px] font-bold text-accent">R{regionId + 1}</span>
          {model.regions[regionId].map((clanId, i) => (
            <span key={clanId} className="flex shrink-0 items-center gap-2">
              {i > 0 && <span className="font-mono text-ink/50">→</span>}
              <span className={`border-2 border-ink px-2 py-1 font-mono text-[12px] ${clanId === selected ? "bg-[#fff176] font-bold" : "bg-white"}`}>
                {clanLabel(model.clans, clanId)}
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function LabModel({ model, selected, onSelect, children }: { model: RegionModel; selected: number; onSelect: (id: number) => void; children: React.ReactNode }) {
  return (
    <div className="border-3 border-ink bg-[#f7efcf] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Selector model={model} selected={selected} onSelect={onSelect} />
        <span className="font-mono text-[11px] text-ink-soft">{model.clans.length} clans · {model.regions.length} regions</span>
      </div>
      {children}
    </div>
  );
}

export default function RegionLab() {
  const model4 = useMemo(() => makeModel(4), []);
  const model6 = useMemo(() => makeModel(6), []);
  const [selected4, setSelected4] = useState(0);
  const [selected6, setSelected6] = useState(0);

  return (
    <main className="min-h-screen bg-[#f7efcf] px-4 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="border-b-8 border-ink pb-6">
          <div className="font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-accent">Visualization lab</div>
          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-6xl">How should a 2-loop region look?</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">
            Choose a clan in each column, then compare four ways to show the same overlapping-region data.
            The main article is unchanged while this side lab is open at <code>?lab=regions</code>.
          </p>
        </header>

        <LabCard title="1. Exploded federations" description="Each federation gets its own card. The highlighted clan repeats wherever it belongs.">
          <LabModel model={model4} selected={selected4} onSelect={setSelected4}><ExplodedFederations model={model4} selected={selected4} /></LabModel>
          <LabModel model={model6} selected={selected6} onSelect={setSelected6}><ExplodedFederations model={model6} selected={selected6} /></LabModel>
        </LabCard>

        <LabCard title="2. Incidence web + draggable 3D · n = 4" description="Each house cluster is a clan. The two floating nodes are federations, and the selected clan is connected to each federation it belongs to.">
          <div className="lg:col-span-2">
            <LabModel model={model4} selected={selected4} onSelect={setSelected4}><N4FederationView model={model4} selected={selected4} onSelect={setSelected4} /></LabModel>
          </div>
        </LabCard>

        <LabCard title="3. Membership matrix" description="A row is a region and a column is a clan. A dot means that region contains that clan.">
          <LabModel model={model4} selected={selected4} onSelect={setSelected4}><MembershipMatrix model={model4} selected={selected4} /></LabModel>
          <LabModel model={model6} selected={selected6} onSelect={setSelected6}><MembershipMatrix model={model6} selected={selected6} /></LabModel>
        </LabCard>

        <LabCard title="4. Clan rows" description="Each region is a horizontal federation route. Repeated clan labels make overlaps visible without pretending the clans are geographically adjacent.">
          <LabModel model={model4} selected={selected4} onSelect={setSelected4}><ClanRows model={model4} selected={selected4} /></LabModel>
          <LabModel model={model6} selected={selected6} onSelect={setSelected6}><ClanRows model={model6} selected={selected6} /></LabModel>
        </LabCard>

      </div>
    </main>
  );
}
