import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Ilustrasi sampul artikel budaya.
 *
 * Setiap artikel punya pemandangan flat sendiri (SVG inline) supaya tidak
 * bergantung pada gambar eksternal. Warna memakai token tema, jadi otomatis
 * ikut light/dark mode. Bila slug tidak dikenal, dipakai ilustrasi kategori;
 * bila kategori juga tidak dikenal, dipakai pola batik netral.
 */

type ArtProps = { className?: string };

type SceneProps = ArtProps & {
  children: ReactNode;
  bg?: string;
};

function Scene({ className, children, bg = "fill-budaya/10" }: SceneProps) {
  return (
    <svg
      viewBox="0 0 320 180"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
    >
      <rect width="320" height="180" className={bg} />
      {children}
    </svg>
  );
}

function UnggahUngguh({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <path d="M0 148c54-12 108-12 160 0s106 12 160 0v32H0Z" className="fill-budaya/15" />
      <g className="fill-white/95 stroke-budaya/30" strokeWidth="2">
        <path d="M44 34h72a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H78l-14 12 3-12H44a10 10 0 0 1-10-10V44a10 10 0 0 1 10-10Z" />
        <path d="M212 28h62a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10h-10v11l-13-11h-39a10 10 0 0 1-10-10V38a10 10 0 0 1 10-10Z" />
      </g>
      <g className="stroke-budaya/45" strokeWidth="3" strokeLinecap="round">
        <path d="M50 46h50M50 57h34" />
        <path d="M218 41h42M218 51h26" />
      </g>
      <circle cx="112" cy="86" r="15" className="fill-secondary/80" />
      <path d="M97 84c2-12 28-12 30 0Z" className="fill-budaya/80" />
      <rect x="88" y="102" width="48" height="60" rx="22" className="fill-budaya/70" />
      <path d="M112 102v52" className="stroke-card/60" strokeWidth="4" />
      <circle cx="216" cy="92" r="14" className="fill-accent/70" />
      <path d="M203 88c3-10 23-10 26 0Z" className="fill-budaya/80" />
      <rect x="193" y="108" width="46" height="54" rx="20" className="fill-budaya/45" />
      <path d="M216 108v50" className="stroke-card/50" strokeWidth="4" />
      <g className="fill-budaya/25">
        <circle cx="66" cy="142" r="4" />
        <circle cx="86" cy="152" r="3" />
        <circle cx="252" cy="144" r="4" />
        <circle cx="272" cy="154" r="3" />
      </g>
    </Scene>
  );
}

function Sangkuriang({ className }: ArtProps) {
  return (
    <Scene className={className} bg="fill-secondary/15">
      <circle cx="258" cy="42" r="22" className="fill-secondary/80" />
      <path d="M0 150c44-10 86-10 128 0s106 10 160 0h32v30H0Z" className="fill-budaya/15" />
      <path d="M18 151 160 36l142 115Z" className="fill-budaya/40" />
      <path d="M160 36 302 151H160Z" className="fill-budaya/60" />
      <path d="M56 151c34-28 70-28 104 0Z" className="fill-budaya/70" />
      <path d="M100 132c30-16 90-16 120 0" fill="none" className="stroke-card/30" strokeWidth="3" />
      <path d="M34 148h36l-6 11H40Z" className="fill-budaya/75" />
      <path d="M52 120v28M52 122l15 11" fill="none" className="stroke-budaya/60" strokeWidth="3" strokeLinecap="round" />
      <path d="M204 30c4-4 8-4 12 0M228 22c4-4 8-4 12 0" fill="none" className="stroke-budaya/45" strokeWidth="2.5" strokeLinecap="round" />
      <g className="fill-budaya/25">
        <circle cx="76" cy="164" r="2.5" />
        <circle cx="92" cy="168" r="2" />
        <circle cx="234" cy="162" r="2.5" />
      </g>
    </Scene>
  );
}

function AksaraJawa({ className }: ArtProps) {
  return (
    <Scene className={className} bg="fill-secondary/15">
      <rect x="84" y="36" width="176" height="122" rx="12" transform="rotate(-3 172 97)" className="fill-budaya/15" />
      <rect x="72" y="28" width="176" height="122" rx="12" className="fill-card" />
      <rect x="72" y="28" width="176" height="122" rx="12" fill="none" className="stroke-budaya/20" strokeWidth="2" />
      <g fill="none" className="stroke-budaya/70" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M92 52h18v13H92Zm0 0c0 9 18 9 18 0M124 52h14v13h-14Zm7 0v13M152 52c-5 6-5 13 1 13s7-7 2-13M176 52h16v13h-16Zm16 0-16 13M206 52h14v13h-14Zm0 0c4 4 10 4 14 0" />
        <path d="M92 82h18v13H92Zm0 0c0 9 18 9 18 0M124 82h14v13h-14Zm14 0-14 13M152 82c-5 6-5 13 1 13s7-7 2-13M176 82h16v13h-16Zm0 0c4 4 10 4 16 0M206 82h14v13h-14Zm7 0v13" />
        <path d="M92 112h18v13H92Zm0 0c0 9 18 9 18 0M124 112h14v13h-14Zm7 0v13M152 112c-5 6-5 13 1 13s7-7 2-13M176 112h16v13h-16Zm16 0-16 13M206 112h14v13h-14Zm0 0c4 4 10 4 14 0" />
      </g>
      <g transform="rotate(-34 238 132)">
        <rect x="218" y="126" width="52" height="10" rx="4" className="fill-budaya/70" />
        <path d="M270 126l13 5-13 5Z" className="fill-secondary/90" />
      </g>
    </Scene>
  );
}

function Nyepi({ className }: ArtProps) {
  return (
    <Scene className={className} bg="fill-budaya/15">
      <circle cx="262" cy="38" r="18" className="fill-secondary/80" />
      <g className="fill-secondary/70">
        <circle cx="52" cy="28" r="2" />
        <circle cx="92" cy="20" r="1.6" />
        <circle cx="132" cy="38" r="2.2" />
        <circle cx="206" cy="22" r="1.8" />
        <circle cx="238" cy="70" r="1.6" />
      </g>
      <path d="M0 124c46-18 92-18 138 0s106 18 182 0v56H0Z" className="fill-budaya/25" />
      <path d="M104 150V88h20v14h14v-14h20v62Z" className="fill-budaya/70" />
      <path d="M164 150V88h20v14h14v-14h20v62Z" className="fill-budaya/70" />
      <g className="fill-budaya/15">
        <path d="M96 88h36l-6-10h-24Z" />
        <path d="M156 88h36l-6-10h-24Z" />
      </g>
      <path d="M0 156h320" className="stroke-budaya/30" strokeWidth="3" />
      <path d="M48 160c10-58 8-94 0-122" fill="none" className="stroke-secondary/80" strokeWidth="4" strokeLinecap="round" />
      <g className="fill-secondary/70">
        <path d="M48 48c-12 4-16 12-14 20 8-2 14-8 14-14Z" />
        <path d="M48 70c12 4 16 12 14 20-8-2-14-8-14-14Z" />
        <path d="M48 96c-10 3-13 10-12 17 7-2 12-7 12-12Z" />
      </g>
      <path d="M118 150v10M188 150v10" className="stroke-budaya/40" strokeWidth="3" />
    </Scene>
  );
}

function RumohAceh({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <path d="M0 150h320v30H0Z" className="fill-budaya/15" />
      <g className="fill-budaya/70">
        <rect x="106" y="134" width="8" height="24" rx="2" />
        <rect x="136" y="134" width="8" height="24" rx="2" />
        <rect x="168" y="134" width="8" height="24" rx="2" />
        <rect x="200" y="134" width="8" height="24" rx="2" />
      </g>
      <path d="M84 84c0-16 30-26 68-26s68 10 68 26Z" className="fill-accent/70" />
      <rect x="94" y="82" width="124" height="48" rx="4" className="fill-budaya/50" />
      <rect x="94" y="124" width="124" height="10" rx="3" className="fill-budaya/70" />
      <g className="fill-card/85">
        <rect x="110" y="96" width="20" height="22" rx="2" />
        <rect x="146" y="96" width="20" height="22" rx="2" />
        <rect x="182" y="96" width="20" height="22" rx="2" />
      </g>
      <g className="stroke-budaya/40" strokeWidth="2">
        <path d="M110 107h20M146 107h20M182 107h20" />
      </g>
      <path d="M218 134h34M226 134v24M244 134v24" className="stroke-budaya/40" strokeWidth="3" />
      <path d="M236 84v-8h12v8" className="fill-budaya/70" />
      <path d="M52 152c-4-38-2-58 2-78" fill="none" className="stroke-budaya/60" strokeWidth="4" strokeLinecap="round" />
      <g className="fill-budaya/45">
        <path d="M56 78c-16 2-24 12-22 22 12-2 22-10 22-16Z" />
        <path d="M56 78c16 2 24 12 22 22-12-2-22-10-22-16Z" />
        <path d="M56 68c-12 0-20 8-18 16 10-1 18-8 18-12Z" />
        <path d="M56 68c12 0 20 8 18 16-10-1-18-8-18-12Z" />
      </g>
      <circle cx="286" cy="30" r="16" className="fill-secondary/70" />
    </Scene>
  );
}

function Ulos({ className }: ArtProps) {
  return (
    <Scene className={className} bg="fill-secondary/15">
      <g className="stroke-budaya/15" strokeWidth="3">
        <path d="M62 20v140M92 20v110M228 20v110M258 20v140" />
      </g>
      <path d="M64 40h192l-16 102H80Z" className="fill-accent/70" />
      <path d="M64 40h192l-4 24H68Z" className="fill-budaya/75" />
      <path d="M72 96h176l-3 12H75Z" className="fill-budaya/45" />
      <path d="M76 118h168l-2 10H78Z" className="fill-secondary/80" />
      <g className="fill-white/85">
        <path d="M124 74l9 12-9 12-9-12Z" />
        <path d="M160 74l9 12-9 12-9-12Z" />
        <path d="M196 74l9 12-9 12-9-12Z" />
      </g>
      <g className="fill-budaya/60">
        <path d="M88 74l6 8-6 8-6-8Z" />
        <path d="M232 74l6 8-6 8-6-8Z" />
      </g>
      <g className="stroke-secondary/90" strokeWidth="3" strokeLinecap="round">
        <path d="M104 142v12M120 142v14M136 142v12M152 142v14M168 142v12M184 142v14M200 142v12M216 142v14" />
      </g>
      <circle cx="268" cy="146" r="12" className="fill-budaya/25" />
      <path d="M260 146h16M268 138v16" className="stroke-budaya/50" strokeWidth="2" />
    </Scene>
  );
}

function Minangkabau({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <path d="M0 146c52-16 104-16 160 0s108 16 160 0v34H0Z" className="fill-budaya/15" />
      <circle cx="270" cy="34" r="17" className="fill-secondary/75" />
      <path d="M66 90c12-28 34-40 58-40-16 13-22 27-24 40 22-15 40-21 60-21s38 6 60 21c-2-13-8-27-24-40 24 0 46 12 58 40Z" className="fill-accent/70" />
      <rect x="82" y="88" width="156" height="44" rx="3" className="fill-budaya/50" />
      <rect x="82" y="126" width="156" height="10" className="fill-budaya/70" />
      <g className="fill-budaya/70">
        <rect x="96" y="136" width="7" height="20" rx="2" />
        <rect x="126" y="136" width="7" height="20" rx="2" />
        <rect x="158" y="136" width="7" height="20" rx="2" />
        <rect x="190" y="136" width="7" height="20" rx="2" />
        <rect x="218" y="136" width="7" height="20" rx="2" />
      </g>
      <g className="fill-card/85">
        <rect x="104" y="98" width="18" height="20" rx="2" />
        <rect x="138" y="98" width="18" height="20" rx="2" />
        <rect x="172" y="98" width="18" height="20" rx="2" />
        <rect x="204" y="98" width="18" height="20" rx="2" />
      </g>
      <path d="M154 124v14h12v-14" className="fill-budaya/40" />
      <g className="fill-budaya/75">
        <ellipse cx="262" cy="136" rx="20" ry="11" />
        <circle cx="282" cy="126" r="8" />
        <path d="M282 120c-8-2-12-8-12-12 6 0 11 4 14 8M282 120c8-2 12-8 12-12-6 0-11 4-14 8" />
        <path d="M248 146v12M256 146v12M268 146v12M276 146v12" className="stroke-budaya/75" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="stroke-budaya/35" strokeWidth="2" strokeLinecap="round">
        <path d="M28 142c4-10 4-18 0-26M40 142c4-8 4-14 0-20M298 146c4-9 4-16 0-22" />
      </g>
    </Scene>
  );
}

function KarapanSapi({ className }: ArtProps) {
  return (
    <Scene className={className} bg="fill-secondary/15">
      <circle cx="268" cy="32" r="16" className="fill-secondary/80" />
      <path d="M0 138c58-12 112-12 160 0s102 12 160 0v42H0Z" className="fill-budaya/20" />
      <g className="fill-card/80">
        <circle cx="46" cy="128" r="14" />
        <circle cx="62" cy="120" r="10" />
        <circle cx="36" cy="118" r="8" />
      </g>
      <g>
        <ellipse cx="128" cy="122" rx="34" ry="17" className="fill-budaya/60" />
        <circle cx="160" cy="112" r="11" className="fill-budaya/75" />
        <path d="M158 104c-7-3-11-8-11-13M160 103c7-3 10-9 10-13M162 103c8-1 13-5 15-9" fill="none" className="stroke-secondary/90" strokeWidth="3" strokeLinecap="round" />
        <path d="M102 138v14M116 140v12M140 140v12M154 138v14" className="stroke-budaya/70" strokeWidth="5" strokeLinecap="round" />
        <circle cx="98" cy="106" r="7" className="fill-accent/80" />
        <path d="M94 112l-4 24M104 112l6 22" className="stroke-accent/80" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g>
        <ellipse cx="222" cy="124" rx="34" ry="17" className="fill-budaya/45" />
        <circle cx="254" cy="114" r="11" className="fill-budaya/60" />
        <path d="M252 106c-7-3-11-8-11-13M254 105c7-3 10-9 10-13M256 105c8-1 13-5 15-9" fill="none" className="stroke-secondary/80" strokeWidth="3" strokeLinecap="round" />
        <path d="M196 140v14M210 142v12M234 142v12M248 140v14" className="stroke-budaya/60" strokeWidth="5" strokeLinecap="round" />
        <circle cx="192" cy="108" r="7" className="fill-accent/70" />
        <path d="M188 114l-4 24M198 114l6 22" className="stroke-accent/70" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g>
        <path d="M282 78v54" className="stroke-budaya/60" strokeWidth="4" />
        <path d="M282 78l26 8-26 8Z" className="fill-budaya/70" />
      </g>
      <g className="fill-budaya/10">
        <circle cx="76" cy="146" r="10" />
        <circle cx="174" cy="148" r="8" />
      </g>
    </Scene>
  );
}

function Lontara({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <path d="M226 116V54l34 22-34 16Z" className="fill-budaya/15" />
      <path d="M222 118V70l-28 18 28 14Z" className="fill-budaya/10" />
      <g transform="rotate(-5 160 100)">
        <rect x="52" y="38" width="212" height="28" rx="9" className="fill-secondary/70" />
        <rect x="58" y="76" width="206" height="28" rx="9" className="fill-secondary/50" />
        <rect x="52" y="114" width="212" height="28" rx="9" className="fill-secondary/70" />
        <g fill="none" className="stroke-budaya/60" strokeWidth="3" strokeLinecap="round">
          <path d="M78 50h16v8H78Zm16 0-16 8M110 50h14v8h-14Zm14 0-14 8M142 50c-4 4-4 8 0 8s4-4 0-8M168 50h16v8h-16Zm0 0 16 8M198 50h14v8h-14Zm7 0v8M226 50h16v8h-16Zm0 0c4 3 12 3 16 0" />
          <path d="M84 88h16v8H84Zm16 0-16 8M116 88h14v8h-14Zm7 0v8M144 88c-4 4-4 8 0 8s4-4 0-8M170 88h16v8h-16Zm0 0 16 8M200 88h14v8h-14Zm0 0c4 3 10 3 14 0M228 88h16v8h-16Z" />
          <path d="M78 126h16v8H78Zm0 0c4 3 12 3 16 0M110 126h14v8h-14Zm14 0-14 8M142 126c-4 4-4 8 0 8s4-4 0-8M168 126h16v8h-16Zm16 0-16 8M198 126h14v8h-14Zm7 0v8M226 126h16v8h-16Zm0 0c4 3 12 3 16 0" />
        </g>
        <path d="M160 36v110" className="stroke-budaya/30" strokeWidth="2" strokeDasharray="4 6" />
      </g>
      <g className="fill-budaya/30">
        <circle cx="292" cy="138" r="8" />
        <circle cx="30" cy="42" r="5" />
      </g>
    </Scene>
  );
}

function HumaBetang({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <path d="M0 148c50-10 100-10 160 0s110 10 160 0v32H0Z" className="fill-budaya/15" />
      <g className="fill-budaya/70">
        <rect x="48" y="132" width="8" height="26" rx="2" />
        <rect x="84" y="132" width="8" height="26" rx="2" />
        <rect x="120" y="132" width="8" height="26" rx="2" />
        <rect x="192" y="132" width="8" height="26" rx="2" />
        <rect x="228" y="132" width="8" height="26" rx="2" />
        <rect x="264" y="132" width="8" height="26" rx="2" />
      </g>
      <rect x="38" y="78" width="244" height="54" rx="3" className="fill-budaya/50" />
      <path d="M28 80 160 38l132 42Z" className="fill-accent/70" />
      <path d="M28 80 160 38l132 42" fill="none" className="stroke-accent/80" strokeWidth="4" strokeLinejoin="round" />
      <rect x="38" y="124" width="244" height="12" className="fill-budaya/70" />
      <g className="fill-card/85">
        <rect x="58" y="96" width="18" height="24" rx="2" />
        <rect x="96" y="96" width="18" height="24" rx="2" />
        <rect x="134" y="96" width="18" height="24" rx="2" />
        <rect x="172" y="96" width="18" height="24" rx="2" />
        <rect x="210" y="96" width="18" height="24" rx="2" />
        <rect x="248" y="96" width="18" height="24" rx="2" />
      </g>
      <path d="M214 38V22h10v16" className="fill-budaya/70" />
      <path d="M219 20c-10-8-4-16 0-18 6 6 8 12 0 18Z" className="fill-muted-foreground/20" />
      <g className="fill-budaya/30">
        <path d="M24 140c-2-24 2-40 10-52 2 16 2 32 2 52Z" />
        <path d="M296 144c0-28 4-44 12-54 2 18 0 34-2 54Z" />
      </g>
      <path d="M152 20c-5-5-10-5-13 0M160 16c-4-4-8-4-11 0" fill="none" className="stroke-budaya/40" strokeWidth="2.5" strokeLinecap="round" />
    </Scene>
  );
}

function PasarTerapung({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <circle cx="266" cy="32" r="17" className="fill-secondary/75" />
      <path d="M0 104c42-10 86-10 128 0s112 10 192 0v76H0Z" className="fill-budaya/15" />
      <g>
        <rect x="18" y="48" width="76" height="42" rx="3" className="fill-budaya/40" />
        <path d="M10 50 56 28l46 22Z" className="fill-accent/60" />
        <rect x="208" y="54" width="84" height="36" rx="3" className="fill-budaya/30" />
        <path d="M200 56 250 34l50 22Z" className="fill-accent/50" />
      </g>
      <g className="fill-budaya/60">
        <rect x="30" y="90" width="6" height="18" />
        <rect x="70" y="90" width="6" height="18" />
        <rect x="220" y="90" width="6" height="18" />
        <rect x="262" y="90" width="6" height="18" />
      </g>
      <g>
        <path d="M60 124h84l-12 20H72Z" className="fill-accent/70" />
        <path d="M86 124c0-14 30-14 30 0" className="fill-budaya/20" />
        <circle cx="100" cy="112" r="8" className="fill-secondary/80" />
        <path d="M88 112h24" className="stroke-budaya/60" strokeWidth="3" />
      </g>
      <g>
        <path d="M184 132h76l-10 18h-56Z" className="fill-budaya/50" />
        <g className="fill-secondary/80">
          <circle cx="204" cy="126" r="7" />
          <circle cx="220" cy="122" r="6" />
          <circle cx="234" cy="126" r="7" />
        </g>
        <circle cx="246" cy="116" r="7" className="fill-accent/70" />
      </g>
      <g fill="none" className="stroke-card/50" strokeWidth="2.5" strokeLinecap="round">
        <path d="M0 130c18-5 30 5 48 0s30 5 48 0 30 5 48 0" />
        <path d="M140 156c22-5 38 5 60 0s40 5 62 0 32 5 58 0" />
      </g>
    </Scene>
  );
}

function Saman({ className }: ArtProps) {
  const dancers = [52, 104, 156, 208, 260];
  return (
    <Scene className={className}>
      <g className="fill-budaya/8">
        <path d="M28 22l14 18-14 18-14-18Z" />
        <path d="M76 12l10 14-10 14-10-14Z" />
        <path d="M244 16l10 14-10 14-10-14Z" />
        <path d="M292 26l14 18-14 18-14-18Z" />
      </g>
      <path d="M0 148h320v32H0Z" className="fill-budaya/20" />
      {dancers.map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={90} r="10" className={i % 2 ? "fill-secondary/75" : "fill-secondary/90"} />
          <path d={`M${x - 17} 148c0-24 7-40 17-40s17 16 17 40Z`} className={i % 2 ? "fill-budaya/50" : "fill-budaya/65"} />
        </g>
      ))}
      <g className="stroke-budaya/70" strokeWidth="5" strokeLinecap="round">
        <path d="M69 116h70M123 116h66M173 116h70M227 116h44" />
      </g>
      <g className="stroke-secondary/90" strokeWidth="4" strokeLinecap="round">
        <path d="M156 78 140 54M156 78l16-24" />
      </g>
      <g className="fill-secondary/90">
        <circle cx="140" cy="52" r="3.5" />
        <circle cx="172" cy="52" r="3.5" />
      </g>
      <path d="M120 60c10-10 70-10 80 0" fill="none" className="stroke-secondary/40" strokeWidth="2.5" strokeLinecap="round" />
      <g className="fill-white/75">
        <circle cx="120" cy="64" r="2.5" />
        <circle cx="192" cy="64" r="2.5" />
      </g>
    </Scene>
  );
}

function Kecak({ className }: ArtProps) {
  const circle = [
    [96, 96],
    [112, 78],
    [140, 68],
    [172, 68],
    [200, 78],
    [216, 96],
    [208, 116],
    [184, 128],
    [152, 132],
    [120, 128],
    [102, 116],
  ];
  return (
    <Scene className={className} bg="fill-budaya/20">
      <circle cx="270" cy="32" r="16" className="fill-secondary/75" />
      <g className="fill-secondary/60">
        <circle cx="52" cy="26" r="2" />
        <circle cx="220" cy="22" r="1.7" />
        <circle cx="244" cy="62" r="1.7" />
      </g>
      <path d="M122 76V40h16v10h10V40h16v36Z" className="fill-budaya/35" />
      <path d="M186 76V40h16v10h10V40h16v36Z" className="fill-budaya/35" />
      <path d="M0 148h320v32H0Z" className="fill-budaya/25" />
      {circle.map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y - 14} r="7" className={i % 2 ? "fill-budaya/60" : "fill-budaya/45"} />
          <path d={`M${x - 11} ${y + 16}c0-16 4-24 11-24s11 8 11 24Z`} className={i % 2 ? "fill-budaya/60" : "fill-budaya/45"} />
        </g>
      ))}
      <g>
        <path d="M142 138c-8-16 2-24 0-38 12 8 16 18 12 26 8-10 20-14 30-18-2 14-8 24-18 30Z" className="fill-accent/85" />
        <path d="M154 138c-4-10 2-16 0-24 8 6 10 14 6 20 6-6 14-8 20-10-2 8-6 12-12 14Z" className="fill-secondary/90" />
      </g>
      <g className="fill-secondary/80">
        <circle cx="172" cy="86" r="2.5" />
        <circle cx="138" cy="94" r="2" />
        <circle cx="206" cy="94" r="2" />
      </g>
    </Scene>
  );
}

function TariPiring({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <path d="M0 146h320v34H0Z" className="fill-budaya/15" />
      <g className="fill-budaya/10">
        <circle cx="34" cy="40" r="26" />
        <circle cx="290" cy="52" r="32" />
      </g>
      <g>
        <circle cx="160" cy="58" r="13" className="fill-secondary/85" />
        <path d="M146 54c4-9 24-9 28 0Z" className="fill-budaya/80" />
        <circle cx="160" cy="42" r="7" className="fill-budaya/70" />
        <path d="M144 72h32l8 56h-48Z" className="fill-budaya/65" />
        <path d="M132 138h56l14 8h-84Z" className="fill-accent/70" />
        <path d="M144 72c-18 4-30 16-38 30M176 72c18 4 30 16 38 30" fill="none" className="stroke-secondary/90" strokeWidth="6" strokeLinecap="round" />
        <g>
          <ellipse cx="102" cy="100" rx="17" ry="6" className="fill-white/95" />
          <ellipse cx="102" cy="100" rx="17" ry="6" fill="none" className="stroke-budaya/40" strokeWidth="2" />
          <ellipse cx="218" cy="100" rx="17" ry="6" className="fill-white/95" />
          <ellipse cx="218" cy="100" rx="17" ry="6" fill="none" className="stroke-budaya/40" strokeWidth="2" />
        </g>
        <path d="M148 128l-8 22M172 128l8 22" className="stroke-budaya/70" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g className="fill-budaya/25">
        <circle cx="72" cy="150" r="6" />
        <circle cx="244" cy="150" r="6" />
        <circle cx="96" cy="160" r="4" />
        <circle cx="224" cy="160" r="4" />
      </g>
    </Scene>
  );
}

function Gudeg({ className }: ArtProps) {
  return (
    <Scene className={className} bg="fill-secondary/15">
      <path d="M0 136h320v44H0Z" className="fill-budaya/15" />
      <path d="M54 136c22-22 190-22 212 0-22 22-190 22-212 0Z" className="fill-budaya/40" />
      <path d="M84 122c14-12 138-12 152 0-14 12-138 12-152 0Z" className="fill-budaya/25" />
      <g>
        <path d="M138 92h64c0 26-14 42-32 42s-32-16-32-42Z" className="fill-white/95" />
        <path d="M138 92h64" className="stroke-budaya/25" strokeWidth="3" />
        <path d="M150 96c6-8 34-8 40 0-2 12-8 18-20 18s-18-6-20-18Z" className="fill-accent/75" />
        <g className="fill-budaya/50">
          <circle cx="158" cy="104" r="4" />
          <circle cx="172" cy="108" r="3.5" />
          <circle cx="184" cy="102" r="4" />
        </g>
      </g>
      <ellipse cx="94" cy="122" rx="30" ry="14" className="fill-white/95" />
      <ellipse cx="94" cy="118" rx="22" ry="9" className="fill-secondary/40" />
      <g>
        <ellipse cx="224" cy="122" rx="24" ry="13" className="fill-white/95" />
        <ellipse cx="224" cy="120" rx="10" ry="7" className="fill-secondary/80" />
      </g>
      <g fill="none" className="stroke-budaya/30" strokeWidth="3" strokeLinecap="round">
        <path d="M156 84c-5-8 5-12 0-20M172 84c-5-8 5-12 0-20M188 86c-4-7 4-10 0-17" />
      </g>
      <g className="fill-accent/60">
        <circle cx="256" cy="140" r="5" />
        <circle cx="270" cy="148" r="4" />
        <circle cx="58" cy="148" r="4" />
      </g>
    </Scene>
  );
}

function Rendang({ className }: ArtProps) {
  return (
    <Scene className={className} bg="fill-accent/15">
      <g>
        <path d="M116 160c-10-20 8-26 2-42 14 10 16 22 10 30 10-14 26-18 40-24-2 18-12 28-26 36Z" className="fill-secondary/85" />
        <path d="M140 160c-6-12 4-16 0-26 8 6 10 14 6 20 6-8 16-10 24-14-2 10-8 16-16 20Z" className="fill-accent/80" />
      </g>
      <path d="M76 92h168c-4 38-38 60-84 60s-80-22-84-60Z" className="fill-budaya/75" />
      <ellipse cx="160" cy="92" rx="84" ry="13" className="fill-budaya/50" />
      <path d="M244 96h18c10 0 12 10 2 12h-20" className="fill-budaya/60" />
      <g>
        <ellipse cx="128" cy="88" rx="18" ry="8" className="fill-accent/85" />
        <ellipse cx="158" cy="84" rx="20" ry="9" className="fill-accent/70" />
        <ellipse cx="190" cy="88" rx="17" ry="8" className="fill-accent/85" />
        <ellipse cx="172" cy="94" rx="16" ry="7" className="fill-accent/60" />
      </g>
      <g fill="none" className="stroke-budaya/35" strokeWidth="3" strokeLinecap="round">
        <path d="M126 76c-5-8 5-12 0-20M154 70c-5-8 5-12 0-20M186 76c-4-7 4-11 0-18" />
      </g>
      <g className="fill-secondary/70">
        <path d="M66 70l7 9-7 9-7-9Z" />
        <path d="M254 62l5 7-5 7-5-7Z" />
        <circle cx="80" cy="58" r="4" />
        <circle cx="244" cy="80" r="3.5" />
      </g>
    </Scene>
  );
}

function Sisingamangaraja({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <circle cx="264" cy="38" r="18" className="fill-secondary/75" />
      <path d="M0 112c44-26 88-26 132 0s100 26 188 0v68H0Z" className="fill-budaya/15" />
      <path d="M0 132c50-18 96-18 146 0s118 18 174 0v48H0Z" className="fill-budaya/25" />
      <path d="M96 146V60h16v12h12V60h16v86Z" className="fill-budaya/40" />
      <path d="M188 146V60h16v12h12V60h16v86Z" className="fill-budaya/40" />
      <g>
        <circle cx="160" cy="54" r="13" className="fill-secondary/85" />
        <path d="M144 50c2-14 30-14 32 0l-6 4c-4-8-16-8-20 0Z" className="fill-budaya/80" />
        <path d="M146 68h28l6 52h-40Z" className="fill-budaya/70" />
        <path d="M142 82c-10 14-10 30 0 44M178 82c10 14 10 30 0 44" fill="none" className="stroke-budaya/70" strokeWidth="5" strokeLinecap="round" />
        <path d="M144 82 160 96l16-14 8 30-24 12-24-12Z" className="fill-accent/60" />
        <path d="M160 96v28" className="stroke-card/50" strokeWidth="3" />
        <path d="M208 148V44" className="stroke-budaya/70" strokeWidth="4" strokeLinecap="round" />
        <path d="M208 44l12 7-12 7Z" className="fill-secondary/90" />
      </g>
      <g className="fill-budaya/35">
        <path d="M44 140c-4-18 0-32 8-42 2 14 0 28 0 42Z" />
        <path d="M284 146c0-22 4-36 12-46 2 16 0 32-2 46Z" />
      </g>
      <path d="M84 34c-5-5-10-5-13 0M94 28c-4-4-8-4-11 0" fill="none" className="stroke-budaya/40" strokeWidth="2.5" strokeLinecap="round" />
    </Scene>
  );
}

function Bugis({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <circle cx="268" cy="34" r="17" className="fill-secondary/75" />
      <path d="M0 124h320v56H0Z" className="fill-budaya/20" />
      <g>
        <path d="M82 124h156l-20 24H104Z" className="fill-accent/80" />
        <path d="M82 124h156" className="stroke-budaya/60" strokeWidth="3" />
        <path d="M142 124V42" className="stroke-budaya/70" strokeWidth="4" strokeLinecap="round" />
        <path d="M142 48 206 112H142Z" className="fill-white/95" />
        <path d="M134 60 94 112h40Z" className="fill-white/80" />
        <path d="M142 42l20 7-20 8Z" className="fill-secondary/90" />
        <path d="M120 124l24-16M104 124l24-16" className="stroke-card/50" strokeWidth="3" />
      </g>
      <g fill="none" className="stroke-card/40" strokeWidth="2.5" strokeLinecap="round">
        <path d="M0 136c20-5 34 5 54 0s34 5 54 0" />
        <path d="M180 150c20-5 34 5 54 0s34 5 54 0" />
        <path d="M24 164c22-5 38 5 60 0s38 5 60 0" />
      </g>
      <path d="M226 56c5-5 10-5 15 0M246 46c5-5 10-5 15 0" fill="none" className="stroke-budaya/40" strokeWidth="2.5" strokeLinecap="round" />
    </Scene>
  );
}

function BatikCover({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <g className="fill-budaya/20">
        {[24, 88, 152, 216, 280].map((x) =>
          [30, 90, 150].map((y) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
              <ellipse rx="18" ry="10" />
              <ellipse rx="10" ry="18" />
            </g>
          )),
        )}
      </g>
      <g className="fill-secondary/40">
        {[56, 120, 184, 248].map((x) =>
          [60, 120].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />),
        )}
      </g>
      <circle cx="160" cy="90" r="34" className="fill-budaya/25" />
      <circle cx="160" cy="90" r="20" className="fill-budaya/40" />
    </Scene>
  );
}

const BY_SLUG: Record<string, (props: ArtProps) => JSX.Element> = {
  "unggah-ungguh-basa-jawa": UnggahUngguh,
  "legenda-sangkuriang": Sangkuriang,
  "aksara-jawa-hanacaraka": AksaraJawa,
  "nyepi-hari-sunyi-bali": Nyepi,
  "rumoh-aceh": RumohAceh,
  "ulos-dalihan-na-tolu": Ulos,
  "asal-usul-nama-minangkabau": Minangkabau,
  "karapan-sapi-madura": KarapanSapi,
  "aksara-lontara": Lontara,
  "huma-betang-dayak-ngaju": HumaBetang,
  "pasar-terapung-banjar": PasarTerapung,
  "tari-saman-gayo": Saman,
  "tari-kecak-bali": Kecak,
  "tari-piring-minang": TariPiring,
  "gudeg-yogyakarta": Gudeg,
  "rendang-minang": Rendang,
  "sisingamangaraja-toba": Sisingamangaraja,
  "jejak-maritim-bugis": Bugis,
};

const BY_CATEGORY: Record<string, (props: ArtProps) => JSX.Element> = {
  tarian: TariPiring,
  kuliner: Rendang,
  sejarah: Sisingamangaraja,
  cerita_rakyat: Sangkuriang,
  pakaian_adat: Ulos,
  upacara: Nyepi,
  aksara: Lontara,
  lainnya: BatikCover,
};

export function ArticleIllustration({
  slug,
  category,
  className,
}: {
  slug: string;
  category: string;
  className?: string;
}) {
  const Art = BY_SLUG[slug] ?? BY_CATEGORY[category] ?? BatikCover;
  return <Art className={className} />;
}
