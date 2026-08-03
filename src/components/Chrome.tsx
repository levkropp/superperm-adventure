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
    <footer className="border-t-8 border-[#0b121f] bg-[#1d1e33]">
      <div className="mx-auto px-5 py-10 text-center">
        <div
          aria-hidden="true"
          className="mx-auto h-5 w-5 bg-[#f4d35e] shadow-[20px_0_0_#65c5a2,-20px_0_0_#b23a48]"
        />
      </div>
    </footer>
  );
}
