import { Footer, Hero } from "./components/Chrome";
import { N3Explorer } from "./components/Demo1";
import { OverlapSlider, RegionFederationDemo4, TourBuilder3, TourViewer4 } from "./components/Demo2";
import { SlidingWindowDemo } from "./components/Slider";
import {
  ArcDemo,
  ExactCoverDemo,
  KickDemo,
  KickNecessityDemo,
  LiveChecker,
  LoopExplorer,
  RegionCoverageDemo,
  RegionNeighborhoodDemo,
  WheelViz,
} from "./components/Demo3";
import { Callout, P, Section, Wide } from "./components/ui";
import TeX, { V, VarKey } from "./lib/tex";
import { DemoErrorBoundary } from "./components/DemoErrorBoundary";
import RegionLab from "./components/RegionLab";

/* ------------------------------------------------------------------ */
/*  The paper                                                          */
/* ------------------------------------------------------------------ */

export default function App() {
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("lab") === "regions") {
    return <RegionLab />;
  }

  return (
    <div className="min-h-screen">
      <Hero />

      {/* ========================= 1 · THE PROBLEM ===================== */}
      <Section
        id="problem"
        num="01"
        kicker="The problem"
        title="One string, every ordering"
        lead={null}
      >
        <P>
          How many ways can you arrange <TeX>123</TeX>? There are six: <TeX>123</TeX>,{" "}
          <TeX>132</TeX>, <TeX>213</TeX>, <TeX>231</TeX>, <TeX>312</TeX>, and <TeX>321</TeX>. Each
          one is a <em>permutation</em>. Now imagine putting all six inside one long string, with
          each one appearing as a consecutive block — like <TeX>312</TeX> sitting inside{" "}
          <TeX>43121</TeX>.
        </P>

        <P>
          The string <TeX>123121321</TeX> does it for <TeX>n = 3</TeX>. Watch the window
          slide across it below and see all six orderings light up.
        </P>

        <Wide>
          <DemoErrorBoundary title="Window demo error">
            <SlidingWindowDemo s={[1, 2, 3, 1, 2, 1, 3, 2, 1]} n={3} label="" />
          </DemoErrorBoundary>
        </Wide>

        <Callout variant="definition" title="Definition">
          A <strong>superpermutation</strong> on <TeX>n</TeX> symbols is a string containing
          every permutation of those symbols as a contiguous substring. Write{" "}
          <TeX>s(n)</TeX> for the length of the shortest one.
        </Callout>

        <P>
          We know the shortest answers for one through five symbols: <TeX>s(1)=1</TeX>,{" "}
          <TeX>s(2)=3</TeX>, <TeX>s(3)=9</TeX>, <TeX>s(4)=33</TeX>, and <TeX>s(5)=153</TeX>. For{" "}
          <TeX>n = 6</TeX>, the answer was very hard to find.
        </P>

        <Callout variant="story" title="Origin">
          In September 2011 an anonymous user on 4chan asked how short a binge could be if you
          wanted to watch the fourteen episodes of <em>The Melancholy of Haruhi Suzumiya</em> in
          every possible order — and, in the same post, proved a lower bound for all{" "}
          <TeX>n</TeX>. The argument sat unnoticed until 2018, when Houston, Pantone and Vatter
          formalised it; the published version credits “Anonymous 4chan poster” as first author.
        </Callout>

      </Section>

      {/* ========================= 2 · EXPLORE ========================= */}
      <Section
        id="explore"
        num="02"
        kicker="Getting a feel"
        title="Six permutations, nine characters"
        lead={null}
      >
        <P>
          The record <TeX>123121321</TeX> has length <TeX>9 = 3! + 2! + 1!</TeX>. It is clearly
          built by reuse: each new permutation shares a chunk with the previous one. Build your
          own string below, then watch the greedy algorithm assemble the record.
        </P>

        <Wide>
          <DemoErrorBoundary title="Demo 2 & 3 Error">
            <N3Explorer />
          </DemoErrorBoundary>
        </Wide>

      </Section>

      {/* ========================= 3 · OVERLAPS ======================== */}
      <Section
        id="overlap"
        num="03"
        kicker="The engine"
        title="Overlap, cost, and why this is a map problem"
        lead={null}
      >
        <P>
          To list all six permutations of the symbols <TeX>1, 2, 3</TeX> you could write them one
          after another:
        </P>

        <div className="border-3 border-ink bg-[#f3ead0] px-4 py-3 font-mono text-lg shadow-[3px_3px_0_#1d1e33]">
          123&nbsp;&nbsp;231&nbsp;&nbsp;312&nbsp;&nbsp;213&nbsp;&nbsp;132&nbsp;&nbsp;321
          <span className="ml-3 text-[15px] text-ink-soft">— 18 characters</span>
        </div>

        <P>
          But look at the join between <TeX>123</TeX> and <TeX>231</TeX>. The first ends with{" "}
          <TeX>23</TeX> and the second begins with <TeX>23</TeX>. Those two characters need not
          be written twice: <TeX>123</TeX> followed by just the single character <TeX>1</TeX>{" "}
          gives <TeX>1231</TeX>, which contains both permutations. We paid one character
          instead of three.
        </P>

        <Callout variant="definition" title="Overlap and cost">
          The <strong>overlap</strong> of <TeX>A</TeX> and <TeX>B</TeX> is the largest{" "}
          <TeX>k</TeX> such that the last <TeX>k</TeX> characters of <TeX>A</TeX> equal the
          first <TeX>k</TeX> characters of <TeX>B</TeX>. The <strong>cost</strong> of writing{" "}
          <TeX>B</TeX> after <TeX>A</TeX> is what is left over:
          <TeX block>{"\\text{cost}(A,B) \\;=\\; n - \\text{overlap}(A,B)"}</TeX>
          Cost is always between 1 and <TeX>n</TeX>. It can never be 0, because two different
          permutations cannot occupy the same window.
        </Callout>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["123 then 231", "overlap 23, so k = 2", "cost = 3 − 2 = 1", "1231"],
            ["123 then 312", "overlap 3, so k = 1", "cost = 3 − 1 = 2", "12312"],
            ["123 then 132", "no overlap, so k = 0", "cost = 3 − 0 = 3", "123132"],
          ].map(([pair, why, cost, result]) => (
            <div key={pair} className="border-3 border-ink bg-[#fffbe9] p-3 shadow-[3px_3px_0_#1d1e33]">
              <div className="font-mono text-[12px] font-bold uppercase tracking-wider text-accent">{pair}</div>
              <div className="mt-1 text-[15px] text-ink-soft">{why}</div>
              <div className="font-mono text-[14px] font-bold text-ember">{cost}</div>
              <div className="mt-1 font-mono text-[16px]">string: {result}</div>
            </div>
          ))}
        </div>

        <P>
          Finding the overlap is a mechanical search: try to share <TeX>n-1</TeX> characters,
          and if the letters disagree, settle for <TeX>n-2</TeX>, and so on. The next demo runs
          that search in slow motion.
        </P>

        <Wide>
          <DemoErrorBoundary title="Demo 4 Error">
            <OverlapSlider />
          </DemoErrorBoundary>
        </Wide>

        <Callout variant="idea" title="The rotation rule">
          For any permutation there is <strong>exactly one</strong> neighbour reachable for a
          single character: its <strong>rotation</strong>, formed by moving the first symbol to
          the end. To overlap <TeX>n-1</TeX> characters, the last <TeX>n-1</TeX> symbols of{" "}
          <TeX>A</TeX> must be the first <TeX>n-1</TeX> symbols of <TeX>B</TeX>, which pins down
          every character of <TeX>B</TeX>. Cheap travel exists, but it is unique.
        </Callout>

        <P>
          Because chaining <em>any</em> ordering of the permutations produces a valid
          superpermutation, the problem now reads: <em>visit all <TeX>n!</TeX> permutations in
          the order that pays the least</em>. Permutations are towns, cost is road length, and
          we are solving a travelling salesman problem.
        </P>

        <Wide>
          <DemoErrorBoundary title="Demo 6 Error">
            <TourBuilder3 />
          </DemoErrorBoundary>
        </Wide>

        <P>
          The same game at <TeX>n = 4</TeX> has 24 towns and an optimal route of 33 characters,
          proved minimal by computer in 2013. Watching a random route next to the optimal one
          shows where the waste comes from: every time the traveller ignores a cheap rotation, a
          toll gate appears.
        </P>

        <Wide>
          <DemoErrorBoundary title="Demo 7 Error">
            <TourViewer4 />
          </DemoErrorBoundary>
        </Wide>

        <Wide>
          <DemoErrorBoundary title="2-loop federation demo error">
            <RegionFederationDemo4 />
          </DemoErrorBoundary>
        </Wide>
      </Section>

      {/* ========================= 4 · RECORDS ========================= */}
      <Section
        id="records"
        num="04"
        kicker="Where we stand"
        title="The record bounds"
        lead={null}
      >
        <P>
          The classical recursive construction produces lengths{" "}
          <TeX>1! + 2! + \cdots + n!</TeX>, giving 9, 33 and 153 for <TeX>n = 3, 4, 5</TeX> —
          each of them optimal. For <TeX>n = 6</TeX> it produces 873, and in 2014 Robin Houston
          found a string of length <strong>872</strong>.
        </P>

        <P>
          So we know a 872-character string exists, which means <TeX>s(6)</TeX> is at most 872.
          But what's the largest we can prove it <em>has</em> to be?
        </P>
      </Section>

      {/* ========================= 5 · 867 ============================= */}
      <Section
        id="lower"
        num="05"
        kicker="The classical bound"
        title="Every valid string needs at least 867 characters"
        lead={null}
      >
        <P>
          <strong>Setup.</strong> Take any superpermutation of length <TeX>L</TeX> and list its
          permutations in order of first appearance. Each consecutive pair contributes its cost,
          so
        </P>
        <TeX block>{"L \\;=\\; n \\;+\\; \\textcolor{#b23a48}{w}, \\qquad \\textcolor{#b23a48}{w} = \\text{total cost of the tour}"}</TeX>
        <P>
          Bounding <TeX>L</TeX> from below is exactly bounding <V n="w">w</V> from below.
        </P>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border-3 border-ink bg-[#fffbe9] p-4 shadow-[3px_3px_0_#1d1e33]">
            <div className="mb-1 font-mono text-[12px] font-bold uppercase tracking-wider text-accent">
              n = 2 · string 121
            </div>
            <div className="font-mono text-[15px] leading-relaxed">
              12 <span className="text-ember">+1</span> 21
            </div>
            <div className="mt-1 text-[15px] leading-relaxed text-ink-soft">
              Start with 2 characters, pay 1 more. So <V n="w">w</V> = 1 and length ={" "}
              <strong>2 + 1 = 3</strong>.
            </div>
          </div>
          <div className="border-3 border-ink bg-[#fffbe9] p-4 shadow-[3px_3px_0_#1d1e33]">
            <div className="mb-1 font-mono text-[12px] font-bold uppercase tracking-wider text-accent">
              n = 3 · string 123121321
            </div>
            <div className="font-mono text-[15px] leading-relaxed">
              123 <span className="text-ember">+1</span> 231 <span className="text-ember">+1</span> 312{" "}
              <span className="text-ember">+2</span> 213 <span className="text-ember">+1</span> 132{" "}
              <span className="text-ember">+1</span> 321
            </div>
            <div className="mt-1 text-[15px] leading-relaxed text-ink-soft">
              Start with 3 characters, pay 1+1+2+1+1 = 6 more. So <V n="w">w</V> = 6 and length ={" "}
              <strong>3 + 6 = 9</strong>.
            </div>
          </div>
        </div>

        {/* Lemma 1: Rotation Clans */}
        <Callout variant="proof" title="Lemma 1 · review: clans and rotation chains">
          The coats of arms in the earlier demos show the rule we already know: each clan is a
          closed rotation chain. For <TeX>n = 6</TeX>, rotating six times returns you to where you
          began, so the cheap roads carve the 720 permutations into <strong>120 clans of six</strong>.
          Inside a clan, travel costs 1 per step; leaving costs at least 2.
        </Callout>

        <div className="grid gap-7 lg:grid-cols-[13fr_7fr] lg:items-center">
          <WheelViz />
          <P>
            Clans are closed rings, so lapping one gets you six houses and then strands you: the
            cheap road just brings you back to where you started. To reach the other 714 houses the
            traveller has to leave, and leaving is where the money goes. It turns out there is only
            one affordable way out.
          </P>
        </div>

        {/* The Kick */}

        <Callout variant="idea" title="Crossing between clans: the kick">
          A <strong>kick</strong> takes the first two symbols, swaps them, and sends them to the
          back: <TeX>123456 \to 345621</TeX>. It costs <strong>2</strong>, and it always lands in a
          different clan. It is the cheapest exit that exists, and the next two figures show
          why nothing else comes close.
        </Callout>

        <Wide>
          <DemoErrorBoundary title="Kick demo error">
            <KickDemo />
          </DemoErrorBoundary>
        </Wide>

        <Wide>
          <DemoErrorBoundary title="Kick necessity demo error">
            <KickNecessityDemo />
          </DemoErrorBoundary>
        </Wide>

        {/* Lemma 2: Finish Your Clans */}
        <Callout variant="proof" title="Lemma 2 · finish your clans">
          <P>
            Obviously, you should clear a clan before leaving for another one. The only cheap roads
            live inside a clan, and a half-lapped clan has to be revisited — and revisiting always
            costs a fresh, expensive entrance. Leaving early can never save
            characters; it can only add them.
          </P>
          <P>
            Call a clan <strong>completed</strong> when the tour laps all six of its houses in one
            unbroken run of cheap roads. Every one of the 120 clans must be visited, and each
            unfinished one forces an extra entry toll later in the tour. The cheapest way to arrange
            a full tour therefore completes at least <V n="c">c</V> = 119 of them.
          </P>
        </Callout>

        <Wide>
          <DemoErrorBoundary title="Arc demo error">
            <ArcDemo />
          </DemoErrorBoundary>
        </Wide>

        {/* Defining Arcs */}
        <Callout variant="definition" title="What is an arc?">
          <P>
            An <strong>arc</strong> is an unbroken run of cheap moves: the traveller pays 1, then 1,
            then 1 again, never spending more. Since the only price-1 move is a rotation, an arc
            never leaves the clan it starts in — it is simply a stretch of walking around one
            ring.
          </P>
          <P>
            An arc ends the moment the traveller pays 2 or more, which we call a{" "}
            <strong>jump</strong>. So a walk is just arcs separated by jumps, like words separated
            by spaces: a walk made of <TeX>R</TeX> arcs contains exactly <TeX>R - 1</TeX> jumps.
            And because the traveller must set foot in all 120 clans, and no arc can be in two clans
            at once, he needs at least <TeX>R \ge 120</TeX> arcs — and therefore at least
            119 jumps.
          </P>
        </Callout>

        {/* 2-Loops */}
        <P>
          We now know the traveller's whole vocabulary: lap a clan with cheap rotations, and
          leave it with a kick. So ask the obvious question — what happens if he only ever does
          that? Lap, kick, lap, kick, and so on, never paying more than he must.
        </P>

        <P>
          The answer is surprisingly tidy. After the fifth kick he arrives back exactly where he
          started, having toured <strong>five clans and thirty houses</strong> and closed a
          circuit. He cannot wander forever on cheap moves; the cheap moves themselves fence him
          into a district. That district is what the proofs call a <strong>2-loop</strong>, and we
          will call it a <strong>region</strong>.
        </P>

        <Callout variant="definition" title="Regions (2-loops)">
          A <strong>region</strong> is the closed circuit you get by alternating “lap a clan” with
          “take a kick”: 5 clans, 30 houses. There are <strong>144</strong> regions
          covering the world. They are not a partition — regions overlap, and in fact every
          clan belongs to 6 different regions — so a region is best thought of as a natural
          neighbourhood rather than a fixed county boundary.
        </Callout>

        <P>
          Here is the fact that makes regions worth all this setup. Of the 30 houses in a region,
          only <strong>five</strong> can be used as an entrance from outside; the proofs call them{" "}
          <strong>generators</strong>, and we will call them <strong>gates</strong>. Land anywhere
          else and you are not in the region's circuit at all. Explore a region below, and switch
          to the overworld view to see where it sits among the other 143.
        </P>

        <Wide>
          <DemoErrorBoundary title="2-loop explorer error">
            <LoopExplorer />
          </DemoErrorBoundary>
        </Wide>

        <P>
          The local view shows one region clearly. Before using it in a proof, it helps to zoom
          out once more: regions overlap with neighbouring regions, and the same rotation clan
          can sit in several different 2-loop regions.
        </P>

        <Wide>
          <DemoErrorBoundary title="Region neighbourhood demo error">
            <RegionNeighborhoodDemo />
          </DemoErrorBoundary>
        </Wide>

        {/* Lemma 3: Absorption */}
        <Callout variant="proof" title="Lemma 3 · counting regions">
          Every 2-loop region has exactly five generator gates, and a jump (any move of price 2 or
          more) can only enter a region by landing on one of those gates. Each open region can
          therefore absorb at most five jumps.
          Therefore, a tour with <TeX>R</TeX> arcs (<TeX>R - 1</TeX> jumps) requires:
          <TeX block>{"\\textcolor{#b26a12}{v} \\;\\ge\\; \\left\\lceil \\frac{R-1}{5} \\right\\rceil"}</TeX>
          Every clan needs at least one arc, so <TeX>R \ge 120</TeX> and hence{" "}
          <V n="v">v</V> ≥ ⌈119/5⌉ = 24.
        </Callout>

        <Wide>
          <DemoErrorBoundary title="Region coverage demo error">
            <RegionCoverageDemo />
          </DemoErrorBoundary>
        </Wide>

        {/* Lemma 4: HPV Inequality */}
        <Callout variant="proof" title="Lemma 4 · the HPV inequality">
          Houston, Pantone and Vatter package the count into a single inequality:
          <TeX block>{"\\textcolor{#b23a48}{w} \\;\\ge\\; \\textcolor{#5b3fbf}{p} + \\textcolor{#1f7a5c}{c} + \\textcolor{#b26a12}{v} - 2"}</TeX>
          With <V n="p">p</V> = 720, <V n="c">c</V> ≥ 119 and <V n="v">v</V> ≥ 24 this gives{" "}
          <V n="w">w</V> ≥ 861, hence <TeX>L \ge 6 + 861 = 867</TeX>.
        </Callout>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <VarKey n="p" value="720" note="houses that must be visited" />
          <VarKey n="c" value="≥ 119" note="clans lapped in one run" />
          <VarKey n="v" value="≥ 24" note="2-loop regions entered" />
          <VarKey n="w" value="≥ 861" note="characters the tour must pay" />
        </div>

        <P>
          Every one of these quantities is computable for a concrete walk, so the inequality is
          something you can watch rather than take on trust. The traveller below crosses all 720
          houses while the four counters track him.
        </P>

        <Wide>
          <DemoErrorBoundary title="Demo 13 Error">
            <LiveChecker />
          </DemoErrorBoundary>
        </Wide>
      </Section>

      {/* ========================= 6 · 868 ============================= */}
      <Section
        id="upper"
        num="06"
        kicker="The new proof"
        title="One more character: s(6) ≥ 868"
        lead={
          <>
            The classical argument stops at 867. Proving 868 requires ruling out every walk of total
            cost <V n="w">w</V> ≤ 861. Here is the full two-case proof.
          </>
        }
      >
        <P>
          Suppose a tour of cost <V n="w">w</V> ≤ 861 existed, giving a string of length 867 or
          less. It must enter some number <V n="v">v</V> of regions. We divide all walks into two cases:
        </P>

        <div className="space-y-4">
          <div className="border-4 border-accent bg-[#f1ecff] p-5 shadow-[5px_5px_0_#5b3fbf]">
            <div className="mb-2 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-accent">
              Case A · twenty-five or more regions (v ≥ 25)
            </div>
            <P>
              If <V n="v">v</V> ≥ 25, the HPV inequality alone finishes the job immediately:
              <TeX block>{"\\textcolor{#b23a48}{w} \\;\\ge\\; 720 + 119 + \\textcolor{#b26a12}{v} - 2 \\;=\\; 837 + \\textcolor{#b26a12}{v} \\;\\ge\\; 862"}</TeX>
              which forces length <TeX>6 + 862 = 868</TeX>. So any hypothetical 867-string MUST enter{" "}
              <em>exactly</em> 24 regions.
            </P>
          </div>

          <div className="border-4 border-ember bg-[#ffe6da] p-5 shadow-[5px_5px_0_#b23a48]">
            <div className="mb-2 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-ember">
              Case B · exactly twenty-four regions (v = 24)
            </div>
            <P>
              Only one possibility is left: a tour that opens exactly 24 regions. At first this
              looks like the hard case, because 24 is the smallest number the absorption lemma
              allows and the HPV inequality gives only <V n="w">w</V> ≥ 861 — one short of what we
              need. But 24 turns out to be the <em>most</em> constrained number of all, and the
              reason is a seating problem you can check on your fingers.
            </P>
            <P>
              Each region holds 30 houses. Twenty-four of them hold 24 × 30 = 720 houses — and the
              world has exactly 720 houses. The traveller must visit every one of them, and he can
              only stand inside a region he has opened. So his 24 regions have to accommodate all
              720 houses using exactly 720 places: a perfect fit, with no room for two regions to
              claim the same house.
            </P>
            <P>
              That single observation removes almost all of the freedom in the problem, and turns
              an infinite search into a finite one small enough for a computer to finish. The
              figure below walks through the whole argument one step at a time.
            </P>
          </div>
        </div>

        <Wide>
          <DemoErrorBoundary title="Case B demo error">
            <ExactCoverDemo />
          </DemoErrorBoundary>
        </Wide>

        <Callout variant="proof" title="Case B, written out">
          <P>
            Suppose <V n="v">v</V> = 24. Since the 24 regions must contain all 720 houses and have
            exactly 720 places between them, they are pairwise disjoint: an{" "}
            <strong>exact cover</strong>. Every clan then lies in exactly one region and so has
            exactly one gate. A gate is the only entrance, and a clan cannot be re-entered
            through a gate that does not exist, so the traveller laps each clan once and in
            full — that is <TeX>R = 120</TeX> arcs of five cheap steps, costing 600 characters.
          </P>
          <P>
            What remains is only the order in which the 120 clans are visited, plus the price of
            each hop between consecutive clans. Enumerating every exact cover gives 10,068 of them,
            falling into 29 classes once you allow the six symbols to be relabelled; solving each
            class exactly gives a cheapest clan-order cost of 265. Hence
          </P>
          <TeX block>{"\\textcolor{#b23a48}{w} \\;=\\; 600 + 265 \\;=\\; 865 \\;>\\; 861 ."}</TeX>
        </Callout>

        <P>
          Both branches give <V n="w">w</V> ≥ 862, therefore{" "}
          <TeX>{"s(6) = 6 + \\textcolor{#b23a48}{w} \\ge 868"}</TeX>. ∎ The lower bound <TeX>s(6) \ge 868</TeX>{" "}
          is fully proved!
        </P>

        <Callout variant="status" title="Status, 2026 — and thanks for reading">
          <P>
            Thanks for reading. This was an independent proof discovered by me with{" "}
            <strong>Kimi K3</strong>. It was very elegant and easy to understand, so I thought it
            was worth sharing — even if <TeX>s(6)</TeX> is probably already solved by an
            AI-powered Lean monster and equal to <strong>872</strong>.
          </P>
          <P>
            Here is the honest state of the field, because it moved very fast in mid-2026.
          </P>
        </Callout>

        <div className="space-y-3">
          <div className="border-4 border-emerald-700 bg-[#e3f2d6] p-5 shadow-[5px_5px_0_#1f7a5c]">
            <div className="mb-2 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-emerald-800">
              s(6) = 872 · very high confidence, with audits still invited
            </div>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong>2 July 2026 — two independent AI-assisted proof efforts, on the same
                day.</strong> They appeared without knowledge of one another and independently
                supported the 872 conclusion.
              </li>
              <li>
                <strong>2021 — Cole Fritsch.</strong> Years earlier, Cole Fritsch posted a
                lower-bound argument plus an exhaustive computer search for 871-character
                strings to the Superpermutators group; the search returned nothing. The write-up
                was acknowledged at the time to still have gaps, but its conclusion —{" "}
                <TeX>s(6) = 872</TeX> — matches what the Lean proofs later certified.
              </li>
              <li>
                <strong>vlad-ds — a direct computer-assisted exact result.</strong>{" "}
                <a
                  className="font-mono text-accent underline decoration-accent/40 underline-offset-2"
                  href="https://github.com/vlad-ds/a6-872"
                  target="_blank"
                  rel="noreferrer"
                >
                  vlad-ds/a6-872
                </a>{" "}
                gives a preliminary computer-assisted proof of <TeX>s(6)=872</TeX> exactly.
                Audits are explicitly invited, so “settled with very high probability” is a
                better description than “fully closed beyond review”.
              </li>
            </ul>
            <P className="mt-2">
              Taken together, <TeX>s(6) = 872</TeX> should now be regarded as true with very high
              probability.
            </P>
          </div>

          <div className="border-4 border-accent bg-[#f1ecff] p-5 shadow-[5px_5px_0_#5b3fbf]">
            <div className="mb-2 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-accent">
              The lower-bound race that led up to it
            </div>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong>2011 / 2018 — 867.</strong> The anonymous 4chan bound, later formalised
                by Houston, Pantone and Vatter. It stood untouched for roughly fifteen years.
              </li>
              <li>
                <strong>Raudvere — a second 868 route.</strong>{" "}
                <a
                  className="font-mono text-accent underline decoration-accent/40 underline-offset-2"
                  href="https://github.com/urdvr/superperm-coeff2"
                  target="_blank"
                  rel="noreferrer"
                >
                  urdvr/superperm-coeff2
                </a>{" "}
                is Lean-4 machine-checked and tightens the HPV coefficient to prove, for all{" "}
                <TeX>n\ge5</TeX>, bounds including <TeX>s(6)\ge868</TeX> and{" "}
                <TeX>s(7)\ge5886</TeX>.
              </li>
              <li>
                <strong>Hunter &amp; Raudvere — 869 and beyond.</strong>{" "}
                <a
                  className="font-mono text-accent underline decoration-accent/40 underline-offset-2"
                  href="https://github.com/urdvr/superpermutations-hunter"
                  target="_blank"
                  rel="noreferrer"
                >
                  urdvr/superpermutations-hunter
                </a>{" "}
                is Lean-4 machine-checked and completes Zach Hunter's 2019 draft, proving{" "}
                <TeX>s(6)\ge869</TeX>, <TeX>s(7)\ge5888</TeX>, and{" "}
                <TeX>s(8)\ge46103</TeX>. The 869 result appeared three days before the
                simultaneous AI proof announcements.
              </li>
              <li>
                <strong>2 July 2026 — 872.</strong> The lower bound met the upper bound, and the
                question closed.
              </li>
            </ul>
          </div>

          <div className="border-4 border-gold bg-[#fff2cd] p-5 shadow-[5px_5px_0_#b26a12]">
            <div className="mb-2 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-gold">
              Where that leaves this paper
            </div>
            <P>
              The 868 proof you just read is no longer the frontier — it was overtaken within
              days by 869, and then by the exact answer. What makes it worth keeping is that it
              is <em>elementary</em>: two lemmas and one finite check, all of which you can hold
              in your head and watch happen on a map. The Lean proofs are stronger and the
              machines are faster, but nobody has to trust a solver to follow the argument here.
            </P>
            <P className="mt-2">
              For <TeX>s(7)</TeX>, the unconditional machine-checked lower bound is 5888 and the
              best known upper bound is 5906. There is also a <strong>conditional lower bound</strong>{" "}
              <TeX>s(7)\ge5896</TeX> assuming the preliminary exact result{" "}
              <TeX>s(6)=872</TeX> from{" "}
              <a
                className="font-mono text-accent underline decoration-accent/40 underline-offset-2"
                href="https://github.com/vlad-ds/a6-872"
                target="_blank"
                rel="noreferrer"
              >
                vlad-ds/a6-872
              </a>{" "}
              is accepted. Thus the best summary is <TeX>5888\le s(7)\le5906</TeX>{" "}
              unconditionally, or <TeX>5896\le s(7)\le5906</TeX> conditional on that exact
              <TeX>n=6</TeX> certificate. The Haruhi number <TeX>s(14)</TeX> remains wide open.
            </P>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
