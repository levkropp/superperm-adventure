import { useMemo, useRef, useState } from "react";
import { buildLoopStructure, key, loopWheelSets, Perm } from "../lib/perms";
import { ClanCoat } from "./PixelMaps";

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

type Lab3DPoint = { x: number; y: number; z: number };

const N4_BASE: Lab3DPoint[] = [
  { x: -4, y: -2, z: 0 },
  { x: 0, y: -2.6, z: 0 },
  { x: 4, y: -2, z: 0 },
  { x: -3.4, y: 1.8, z: 0 },
  { x: 0, y: 1.2, z: 0 },
  { x: 3.4, y: 1.8, z: 0 },
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
  const regionIds = model.regions.map((_, regionId) => regionId);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const activeRegionIds = selectedRegion === null ? model.memberships[selected] : [selectedRegion];
  const highlightedClans = new Set(selectedRegion === null ? [selected] : model.regions[selectedRegion]);

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
      <div className="grid gap-3 lg:grid-cols-[7rem_minmax(0,1fr)_7rem] lg:items-stretch">
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

        <svg
          viewBox="0 0 900 520"
          className="order-1 min-h-[24rem] w-full touch-none cursor-grab border-3 border-ink bg-[#10231f] active:cursor-grabbing lg:order-2"
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
          const radiusZ = 1.55;
          const color = i === 0 ? "#65c5a2" : "#f0aa4f";
          const active = activeRegionIds.includes(regionId);
          const particles = Array.from({ length: 96 }, (_, particle) => {
            const theta = ((particle * 137 + regionId * 41) % 360) * (Math.PI / 180);
            const phi = ((particle * 83 + regionId * 17) % 180) * (Math.PI / 180);
            const radial = 0.32 + ((particle * 47) % 100) / 100 * 0.68;
            return projectLabPoint(
              {
                x: center.x + Math.cos(theta) * Math.sin(phi) * radiusX * radial,
                y: center.y + Math.sin(theta) * Math.sin(phi) * radiusY * radial,
                z: center.z + Math.cos(phi) * radiusZ * radial,
              },
              camera.yaw,
              camera.pitch,
            );
          }).sort((a, b) => b.depth - a.depth);
          const rings = [
            Array.from({ length: 25 }, (_, point) => {
              const angle = (point * Math.PI * 2) / 24;
              return projectLabPoint({ x: center.x + Math.cos(angle) * radiusX, y: center.y + Math.sin(angle) * radiusY, z: center.z }, camera.yaw, camera.pitch);
            }),
            Array.from({ length: 25 }, (_, point) => {
              const angle = (point * Math.PI * 2) / 24;
              return projectLabPoint({ x: center.x + Math.cos(angle) * radiusX, y: center.y, z: center.z + Math.sin(angle) * radiusZ }, camera.yaw, camera.pitch);
            }),
            Array.from({ length: 25 }, (_, point) => {
              const angle = (point * Math.PI * 2) / 24;
              return projectLabPoint({ x: center.x, y: center.y + Math.cos(angle) * radiusY, z: center.z + Math.sin(angle) * radiusZ }, camera.yaw, camera.pitch);
            }),
          ];
          return (
            <g key={regionId}>
              {particles.map((point, particle) => <circle key={particle} cx={point.x} cy={point.y} r={Math.max(1.2, 2.8 - point.depth * 0.025)} fill={color} opacity={active ? 0.3 : 0.035} />)}
              {rings.map((ring, ringId) => <polyline key={ringId} points={ring.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke={color} strokeWidth={active ? 1.8 : 1} strokeDasharray="4 5" opacity={active ? 0.55 : 0.12} />)}
              {memberIds.map((clanId) => {
                const regionCenter = projectLabPoint({ ...center, z: 1.35 }, camera.yaw, camera.pitch);
                return <line key={clanId} x1={projectedBase[clanId].x} y1={projectedBase[clanId].y} x2={regionCenter.x} y2={regionCenter.y} stroke={clanId === selected ? "#fff176" : color} strokeWidth={clanId === selected ? 4 : 2} opacity={active ? 0.78 : 0.15} />;
              })}
              {(() => {
                const labelPoint = projectLabPoint({ ...center, z: 2.7 }, camera.yaw, camera.pitch);
                return <text x={labelPoint.x} y={labelPoint.y - 8} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700" fill={color} opacity={active ? 1 : 0.35}>R{regionId + 1} federation</text>;
              })()}
            </g>
          );
        })}
        {model.clans.map((clan, clanId) => {
          const point = projectedBase[clanId];
          return (
            <g key={clanId} transform={`translate(${point.x} ${point.y})`} onClick={() => !suppressClick.current && (setSelectedRegion(null), onSelect(clanId))} opacity={highlightedClans.has(clanId) ? 1 : 0.28} className="cursor-pointer">
              <ClanCoat clan={clan[0]} at={{ x: 0, y: -32 }} scale={0.55} />
            </g>
          );
        })}
        <text x="24" y="30" fontFamily="IBM Plex Mono, monospace" fontSize="13" fontWeight="700" fill="#fff4cb">drag to orbit · use the buttons or click a coat</text>
        <text x="24" y="50" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#a3d9b1">filled cloud = selected federation · bright coat = selected clan</text>
        </svg>

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

function LabModel({ model, selected, onSelect, children, showSelector = true }: { model: RegionModel; selected: number; onSelect: (id: number) => void; children: React.ReactNode; showSelector?: boolean }) {
  return (
    <div className="border-3 border-ink bg-[#f7efcf] p-3">
      {showSelector && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Selector model={model} selected={selected} onSelect={onSelect} />
          <span className="font-mono text-[11px] text-ink-soft">{model.clans.length} clans · {model.regions.length} regions</span>
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
          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-6xl">How should a 2-loop region look?</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">
            This focused n = 4 explorer shows clans, towns, and their federation clouds in one draggable 3D scene.
            The main article is unchanged while this side lab is open at <code>?lab=regions</code>.
          </p>
        </header>

        <LabCard title="Gas-cloud incidence" description="Clouds surround the three clans in each federation; the selected clan’s membership edges glow.">
          <div className="lg:col-span-2">
            <LabModel model={model4} selected={selected4} onSelect={setSelected4} showSelector={false}><N4FederationView model={model4} selected={selected4} onSelect={setSelected4} /></LabModel>
          </div>
        </LabCard>


      </div>
    </main>
  );
}
