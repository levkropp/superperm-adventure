import { HeroWorld } from "./PixelMaps";

export function Hero() {
  return (
    <div id="top" className="relative min-h-[92vh] overflow-hidden border-b-8 border-[#1d1e33] bg-[#11192a] text-white">
      <div className="absolute inset-0 opacity-80">
        <HeroWorld />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#11192a_0%,rgba(17,25,42,0.96)_36%,rgba(17,25,42,0.5)_70%,rgba(17,25,42,0.1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#11192a_0%,transparent_34%)]" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-6xl items-center px-4 pt-16 pb-14 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="font-serif text-[2.7rem] leading-[1.06] font-semibold tracking-tight text-[#fff4cb] sm:text-[4rem]">
            Superpermutations Adventure
          </h1>

          <a
            href="#problem"
            className="mt-10 inline-block font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-[#f4d35e] underline decoration-2 underline-offset-8 hover:text-white"
          >
            scroll down to begin
          </a>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t-8 border-[#0b121f] bg-[#1d1e33] text-[#ddd4b5]">
      <div className="mx-auto max-w-3xl px-5 py-14 text-center">
        <div className="mx-auto mb-7 h-5 w-5 bg-[#f4d35e] shadow-[20px_0_0_#65c5a2,-20px_0_0_#b23a48]" />
        <p className="font-serif text-2xl leading-relaxed text-[#fff4cb] italic">
          “The shortest binge that covers every order.”
        </p>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed">
          A problem small enough for a high-schooler to hold, and deep enough to resist
          everyone.
        </p>
        <div className="mx-auto mt-8 grid max-w-xl gap-4 text-left text-[16px] leading-relaxed sm:grid-cols-2">
          <div className="border-3 border-[#080e18] bg-[#2d304e] p-4 shadow-[4px_4px_0_#080e18]">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#fff176]">
              Primary source
            </div>
            <a className="text-[#7fdcb4] underline" href="https://github.com/levkropp/superperm-adventure" target="_blank" rel="noreferrer">
              github.com/levkropp/superperm-adventure
            </a>
          </div>
          <div className="border-3 border-[#080e18] bg-[#2d304e] p-4 shadow-[4px_4px_0_#080e18]">
            <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#fff176]">
              Background
            </div>
            <a className="text-[#7fdcb4] underline" href="https://oeis.org/A180632" target="_blank" rel="noreferrer">
              OEIS A180632
            </a>
            , Engen and Vatter (2021), Quanta, Numberphile.
          </div>
        </div>
        <p className="mt-8 font-mono text-[11px] tracking-wide text-[#8f91a3]">
          Every figure is computed live in your browser.
        </p>
      </div>
    </footer>
  );
}
