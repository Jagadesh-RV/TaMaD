import { ParticleField } from './ParticleField';

export function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.055)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_35%,transparent_78%)]" />
      <div className="absolute -top-52 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[130px] animate-[aurora-shift_18s_ease-in-out_infinite] dark:bg-brand-600/25" />
      <div className="absolute -left-48 top-[28%] h-[440px] w-[440px] rounded-full bg-indigo-500/[0.16] blur-[110px] animate-[aurora-shift_22s_ease-in-out_infinite_reverse] dark:bg-indigo-500/20" />
      <div className="absolute -right-40 bottom-0 h-[460px] w-[560px] rounded-full bg-sky-500/[0.16] blur-[120px] animate-[aurora-shift_26s_ease-in-out_infinite] dark:bg-sky-600/20" />
    </div>
  );
}

export function HeroBackdrop({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Backdrop />
      <ParticleField className="absolute inset-0 h-full w-full" />
    </div>
  );
}
