import { useMemo, useState } from "react";
import { buildLoopStructure, key, loopWheelSets, Perm } from "../lib/perms";
import { RegionStackMap } from "./PixelMaps";

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

function IncidenceWeb({ model, selected }: { model: RegionModel; selected: number }) {
  const regionIds = model.memberships[selected];
  const width = 640;
  const height = model.n === 4 ? 260 : 340;
  const center = { x: width / 2, y: height / 2 };
  const radius = model.n === 4 ? 70 : 105;
  const regionPoints = regionIds.map((_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / regionIds.length;
    return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
  });

  return (
    <div>
      <ModelTag model={model} selected={selected} />
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full border-3 border-ink bg-[#10231f]" role="img" aria-label="clan and federation incidence web">
        {regionIds.map((regionId, i) => {
          const regionPoint = regionPoints[i];
          const members = model.regions[regionId].filter((clanId) => clanId !== selected);
          return (
            <g key={regionId}>
              <line x1={center.x} y1={center.y} x2={regionPoint.x} y2={regionPoint.y} stroke="#f4d35e" strokeWidth="2" />
              {members.map((clanId, j) => {
                const angle = -Math.PI / 2 + (j * Math.PI * 2) / members.length;
                const point = { x: regionPoint.x + Math.cos(angle) * 32, y: regionPoint.y + Math.sin(angle) * 32 };
                return (
                  <g key={`${regionId}-${clanId}`}>
                    <line x1={regionPoint.x} y1={regionPoint.y} x2={point.x} y2={point.y} stroke="#65c5a2" strokeWidth="1.5" opacity="0.8" />
                    <circle cx={point.x} cy={point.y} r="12" fill="#286f75" stroke="#65c5a2" strokeWidth="2" />
                    <text x={point.x} y={point.y + 3} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="7" fontWeight="700" fill="#fff4cb">
                      {clanLabel(model.clans, clanId)}
                    </text>
                  </g>
                );
              })}
              <circle cx={regionPoint.x} cy={regionPoint.y} r="16" fill="#b23a48" stroke="#fff4cb" strokeWidth="2" />
              <text x={regionPoint.x} y={regionPoint.y + 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" fontWeight="700" fill="#fff4cb">
                R{regionId + 1}
              </text>
            </g>
          );
        })}
        <circle cx={center.x} cy={center.y} r="28" fill="#fff176" stroke="#081b18" strokeWidth="4" />
        <text x={center.x} y={center.y + 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill="#1d1e33">
          {clanLabel(model.clans, selected)}
        </text>
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
            Choose a clan in each column, then compare five ways to show the same overlapping-region data.
            The main article is unchanged while this side lab is open at <code>?lab=regions</code>.
          </p>
        </header>

        <LabCard title="1. Exploded federations" description="Each federation gets its own card. The highlighted clan repeats wherever it belongs.">
          <LabModel model={model4} selected={selected4} onSelect={setSelected4}><ExplodedFederations model={model4} selected={selected4} /></LabModel>
          <LabModel model={model6} selected={selected6} onSelect={setSelected6}><ExplodedFederations model={model6} selected={selected6} /></LabModel>
        </LabCard>

        <LabCard title="2. Incidence web" description="The center is one clan, the red nodes are its regions, and the outer nodes are the other clans each region contains.">
          <LabModel model={model4} selected={selected4} onSelect={setSelected4}><IncidenceWeb model={model4} selected={selected4} /></LabModel>
          <LabModel model={model6} selected={selected6} onSelect={setSelected6}><IncidenceWeb model={model6} selected={selected6} /></LabModel>
        </LabCard>

        <LabCard title="3. Membership matrix" description="A row is a region and a column is a clan. A dot means that region contains that clan.">
          <LabModel model={model4} selected={selected4} onSelect={setSelected4}><MembershipMatrix model={model4} selected={selected4} /></LabModel>
          <LabModel model={model6} selected={selected6} onSelect={setSelected6}><MembershipMatrix model={model6} selected={selected6} /></LabModel>
        </LabCard>

        <LabCard title="4. Clan rows" description="Each region is a horizontal federation route. Repeated clan labels make overlaps visible without pretending the clans are geographically adjacent.">
          <LabModel model={model4} selected={selected4} onSelect={setSelected4}><ClanRows model={model4} selected={selected4} /></LabModel>
          <LabModel model={model6} selected={selected6} onSelect={setSelected6}><ClanRows model={model6} selected={selected6} /></LabModel>
        </LabCard>

        <LabCard title="5. Draggable 3D stack" description="The selected clan stays on the base plane while each containing region rises above it as a separate plane.">
          <LabModel model={model4} selected={selected4} onSelect={setSelected4}><RegionStackMap clans={model4.clans} regions={model4.regions} selectedClanKey={clanLabel(model4.clans, selected4)} /></LabModel>
          <LabModel model={model6} selected={selected6} onSelect={setSelected6}><RegionStackMap clans={model6.clans} regions={model6.regions} selectedClanKey={clanLabel(model6.clans, selected6)} /></LabModel>
        </LabCard>
      </div>
    </main>
  );
}
