import { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowRight, Check, Clock, Sparkles } from 'lucide-react';
import { MEASURED_BENCHMARKS } from '../../data/pricing';
import { AnimatedNumber } from './AnimatedNumber';

const CHAPTERS = [
  {
    index: '01',
    label: 'The Markup',
    title: "You're paying for markup, not compute.",
    body: 'Hosted CI providers rent the exact same cloud VMs you can rent directly — then charge 5× to 10× for the privilege. Every month, 87% of your CI invoice disappears into vendor margin.',
    targetProgress: 0.18,
  },
  {
    index: '02',
    label: 'The Speed',
    title: 'Faster builds on machines twice the size.',
    body: 'Because raw Spot instances cost a fraction of hosted runners, you can run 4–8 vCPU VMs with local NVMe scratch and instant caching — cutting real monorepo suites up to 45%.',
    targetProgress: 0.56,
  },
  {
    index: '03',
    label: 'The Payoff',
    title: 'Your cloud. Your credits. $25,020 back every year.',
    body: 'Compute bills go straight to your existing AWS and GCP accounts. Burn cloud credits you already have, keep code inside your VPC, and pay $0 to us forever.',
    targetProgress: 0.88,
  },
] as const;

const MAX_BENCH_SEC = 633;

function formatRaceClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem.toString().padStart(2, '0')}s`;
}

function ChapterOneVisual({ riseFactor }: { riseFactor: number }) {
  // Minimum 0.45 so the towers are immediately legible on entry and grow smoothly to 1.0 as you scroll
  const t = 0.45 + 0.55 * Math.max(0, Math.min(1, riseFactor));
  const githubH = Math.round(236 * t);
  const saasH = Math.round(158 * t);
  const spotH = Math.round(34 * t);
  const gapH = Math.max(40, githubH - spotH);

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6B736E]">
            Monthly CI Spend · 40-Dev Team (200k 4-vCPU min)
          </div>
          <div className="mt-1 text-[14px] text-[#525A55]">
            Exact same Linux compute. Dramatically different invoice.
          </div>
        </div>
        <span className="rounded-full border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1 font-mono text-[11px] font-medium text-[#DC2626] whitespace-nowrap">
          8× markup
        </span>
      </div>

      {/* Architectural Towers */}
      <div className="relative mt-6 flex flex-1 items-end justify-around gap-4 border-b border-[#E2E7E4] px-2 pt-8 pb-0 sm:gap-8 sm:px-6">
        {/* Horizontal subtle guide lines */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[236px] border-t border-dashed border-[#E2E7E4]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[118px] border-t border-dashed border-[#F0F1F3]" />

        {/* Tower 1: GitHub Actions */}
        <div className="flex w-32 flex-col items-center">
          <div className="mb-2 text-center">
            <div className="font-mono text-[18px] font-medium text-[#0B0D0E] tabular-nums">
              $2,400
            </div>
            <div className="font-mono text-[10.5px] text-[#6B736E]">$0.012/min</div>
          </div>
          <div
            className="w-full rounded-t-xl border border-b-0 border-[#D3D9D5] bg-gradient-to-b from-[#E2E7E4] to-[#D3D9D5] transition-[height] duration-75"
            style={{ height: `${githubH}px` }}
          />
        </div>

        {/* Tower 2: Managed SaaS */}
        <div className="flex w-32 flex-col items-center">
          <div className="mb-2 text-center">
            <div className="font-mono text-[18px] font-medium text-[#525A55] tabular-nums">
              $1,600
            </div>
            <div className="font-mono text-[10.5px] text-[#6B736E]">$0.008/min</div>
          </div>
          <div
            className="w-full rounded-t-xl border border-b-0 border-[#E2E7E4] bg-gradient-to-b from-[#F0F3F1] to-[#E2E7E4] transition-[height] duration-75"
            style={{ height: `${saasH}px` }}
          />
        </div>

        {/* Tower 3: open-ci Spot + Markup Bracket */}
        <div className="relative flex w-36 flex-col items-center">
          {/* Translucent Vendor Markup Bracket filling the gap above Spot */}
          <div
            className="mb-1 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#047857]/35 bg-[#ECFDF5]/70 px-2 text-center transition-[height,opacity] duration-150"
            style={{
              height: `${Math.max(88, gapH - 54)}px`,
              opacity: Math.min(1, 0.35 + riseFactor * 0.9),
            }}
          >
            <span className="font-mono text-[14px] font-medium text-[#047857] tabular-nums">
              −$2,085/mo
            </span>
            <span className="mt-0.5 text-[11px] font-medium text-[#047857]/85">
              87% vendor markup
            </span>
          </div>

          <div className="mb-1.5 text-center">
            <div className="font-mono text-[18px] font-semibold text-[#047857] tabular-nums">
              $315
            </div>
            <div className="font-mono text-[10.5px] text-[#047857]/80">$0.0012/min</div>
          </div>
          <div
            className="w-full rounded-t-xl border border-b-0 border-[#047857] bg-gradient-to-b from-[#10B981] to-[#047857] transition-[height] duration-75"
            style={{ height: `${spotH}px` }}
          />
        </div>
      </div>

      {/* Baseline Labels */}
      <div className="mt-3 flex items-center justify-around gap-4 px-2 text-center text-[12.5px] font-medium sm:gap-8 sm:px-6">
        <div className="w-32 text-[#525A55]">GitHub Actions</div>
        <div className="w-32 text-[#525A55]">Managed SaaS</div>
        <div className="w-36 text-[#0B0D0E]">open-ci (Spot)</div>
      </div>
    </div>
  );
}

function ChapterTwoVisual({ raceSeconds }: { raceSeconds: number }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6B736E]">
            Measured Production Monorepo Benchmarks
          </div>
          <div className="mt-1 text-[14px] text-[#525A55]">
            Scroll to scrub the live 20-shard build race.
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[#E2E7E4] bg-[#F7F9F8] px-2.5 py-1 font-mono text-[12px] font-medium text-[#0B0D0E] tabular-nums">
          <Clock className="h-3.5 w-3.5 text-[#6B736E]" />
          <span>{formatRaceClock(raceSeconds)}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-5 text-[11.5px] text-[#525A55]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#CDD4CF]" />
          GitHub Hosted
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium text-[#0B0D0E]">
          <span className="h-2 w-2 rounded-full bg-[#10B981]" />
          open-ci Spot + NVMe Cache
        </span>
      </div>

      {/* 4 Synchronized Race Pairs */}
      <div className="mt-4 flex flex-1 flex-col justify-center gap-4">
        {MEASURED_BENCHMARKS.map((row) => {
          const hostedElapsed = Math.min(raceSeconds, row.beforeSeconds);
          const openCiElapsed = Math.min(raceSeconds, row.afterSeconds);
          const hostedPct = (hostedElapsed / MAX_BENCH_SEC) * 100;
          const openCiPct = (openCiElapsed / MAX_BENCH_SEC) * 100;
          const openCiFinished = raceSeconds >= row.afterSeconds;

          return (
            <div key={row.suite} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#0B0D0E]">
                    {row.suite}
                  </span>
                  <span className="font-mono text-[10.5px] text-[#6B736E]">
                    {row.shards}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#6B736E] tabular-nums">
                    {row.beforeLabel} →{' '}
                    <span className="font-medium text-[#047857]">
                      {row.afterLabel}
                    </span>
                  </span>
                  <motion.span
                    initial={false}
                    animate={{
                      opacity: openCiFinished ? 1 : 0.25,
                      scale: openCiFinished ? 1 : 0.94,
                    }}
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    className="rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2 py-0.5 font-mono text-[10.5px] font-medium text-[#047857] whitespace-nowrap"
                  >
                    {row.fasterPct}% faster
                  </motion.span>
                </div>
              </div>

              {/* Dual Bar Track */}
              <div className="space-y-1">
                {/* Hosted bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F0F3F1]">
                  <div
                    className="h-full rounded-full bg-[#CDD4CF]"
                    style={{ width: `${Math.max(2, hostedPct)}%` }}
                  />
                </div>
                {/* open-ci bar */}
                <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-[#F0F3F1]">
                  <div
                    className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-[#10B981] to-[#047857] pr-1.5"
                    style={{ width: `${Math.max(2, openCiPct)}%` }}
                  >
                    {openCiFinished && (
                      <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#F0F3F1] pt-3 font-mono text-[11px] text-[#6B736E]">
        <span>0m 00s</span>
        <span>5m 00s</span>
        <span>10m 33s</span>
      </div>
    </div>
  );
}

function ChapterThreeVisual({ payoffFactor }: { payoffFactor: number }) {
  const showStrike = payoffFactor > 0.15;

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6B736E]">
            Annual Bottom-Line Impact
          </div>
          <div className="mt-1 text-[14px] text-[#525A55]">
            Your AWS &amp; GCP accounts. Zero vendor fees.
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 font-mono text-[11px] font-medium text-[#047857]">
          <Sparkles className="h-3 w-3" />
          87% reduction
        </span>
      </div>

      {/* Invoice Compression Card */}
      <div className="my-auto py-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-[#E2E7E4] bg-[#FAFBFA] p-5 sm:gap-5 sm:p-6">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#6B736E]">
              Before · GitHub Hosted
            </div>
            <div className="relative mt-1.5 inline-block">
              <span className="font-mono text-[26px] font-medium text-[#6B736E] tabular-nums sm:text-[32px]">
                $2,400
              </span>
              <motion.span
                initial={false}
                animate={{ scaleX: showStrike ? 1 : 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-1/2 h-[2px] origin-left bg-[#DC2626]"
              />
            </div>
            <div className="mt-0.5 text-[12px] text-[#6B736E]">per month</div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E7E4] bg-[#FFFFFF] text-[#0B0D0E] shadow-xs">
            <ArrowRight className="h-4 w-4" />
          </div>

          <div className="text-right">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#047857]">
              After · open-ci Spot
            </div>
            <div className="mt-1.5 font-mono text-[28px] font-semibold text-[#0B0D0E] tabular-nums sm:text-[34px]">
              $315
            </div>
            <div className="mt-0.5 text-[12px] text-[#525A55]">
              per month (all-in)
            </div>
          </div>
        </div>

        {/* Hero Annual Savings Counter */}
        <div className="mt-6 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6B736E]">
            Back in your budget every year
          </div>
          <div className="mt-1 font-sans text-[48px] leading-none font-semibold tracking-[-0.04em] text-[#047857] sm:text-[58px]">
            <AnimatedNumber
              value={payoffFactor > 0.05 ? 25020 : 18500}
              format={(n) => `$${Math.round(n).toLocaleString('en-US')}`}
            />
            <span className="ml-1.5 text-[20px] font-normal tracking-normal text-[#525A55]">
              / yr saved
            </span>
          </div>
        </div>
      </div>

      {/* Three Quiet Value Badges */}
      <div className="grid grid-cols-3 gap-2.5 border-t border-[#F0F3F1] pt-4">
        {[
          'Burns AWS & GCP credits',
          'Zero per-seat fees',
          'Apache-2.0 · Free forever',
        ].map((badge) => (
          <div
            key={badge}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E7E4] bg-[#FAFBFA] px-2.5 py-2 text-center text-[11.5px] font-medium text-[#1F2937]"
          >
            <Check className="h-3.5 w-3.5 shrink-0 text-[#047857]" />
            <span>{badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [chapter1Rise, setChapter1Rise] = useState(0.5);
  const [raceSeconds, setRaceSeconds] = useState(420);
  const [payoffFactor, setPayoffFactor] = useState(0);

  const railScaleY = useTransform(smoothProgress, [0, 1], [0.08, 1]);

  useMotionValueEvent(smoothProgress, 'change', (v) => {
    if (v < 0.34) {
      setActiveIndex(0);
    } else if (v < 0.68) {
      setActiveIndex(1);
    } else {
      setActiveIndex(2);
    }

    // Chapter 1 tower growth (0 -> 0.24)
    setChapter1Rise(Math.max(0, Math.min(1, v / 0.24)));

    // Chapter 2 race clock (0.34 -> 0.62 sweeps 90s -> 633s so bars are always visibly moving)
    const ch2Norm = Math.max(0, Math.min(1, (v - 0.34) / 0.28));
    setRaceSeconds(110 + ch2Norm * (MAX_BENCH_SEC - 110));

    // Chapter 3 payoff reveal (0.68 -> 0.88)
    const ch3Norm = Math.max(0, Math.min(1, (v - 0.68) / 0.2));
    setPayoffFactor(ch3Norm);
  });

  const scrollToChapter = (targetProgress: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const topAbs = rect.top + window.scrollY;
    const scrollableDist = el.offsetHeight - window.innerHeight;
    const destY = topAbs + scrollableDist * targetProgress;
    window.scrollTo({ top: destY, behavior: 'smooth' });
  };

  const activeChapter = CHAPTERS[activeIndex];

  return (
    <section
      id="how-it-works"
      aria-label="How open-ci saves time and money"
      className="relative border-t border-[#E2E7E4]"
    >
      {/* ================= DESKTOP STICKY CHOREOGRAPHY ================= */}
      <div ref={containerRef} className="relative hidden h-[270vh] md:block">
        <div className="sticky top-16 flex h-[calc(100vh-64px)] items-center">
          <div className="mx-auto grid w-full max-w-[1160px] grid-cols-12 items-center gap-10 px-8">
            {/* Left Editorial Narrative & Progress Rail */}
            <div className="col-span-5 flex gap-6">
              {/* Vertical Progress Rail */}
              <div className="relative flex flex-col items-center pt-1">
                <div className="relative h-[220px] w-[2px] overflow-hidden rounded-full bg-[#E2E7E4]">
                  <motion.div
                    style={{ scaleY: railScaleY }}
                    className="h-full w-full origin-top rounded-full bg-[#0B0D0E]"
                  />
                </div>
              </div>

              {/* Chapter Buttons + Active Narrative */}
              <div className="flex flex-1 flex-col">
                {/* Clickable Step Indicators */}
                <div className="flex items-center gap-2">
                  {CHAPTERS.map((ch, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={ch.index}
                        type="button"
                        onClick={() => scrollToChapter(ch.targetProgress)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-[#0B0D0E] font-medium text-[#FFFFFF]'
                            : 'bg-[#F0F3F1] text-[#6B736E] hover:bg-[#E2E7E4] hover:text-[#0B0D0E]'
                        }`}
                      >
                        <span>{ch.index}</span>
                        <span className="font-sans text-[11.5px]">{ch.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Cross-fading Editorial Headline & Copy */}
                <div className="mt-7 min-h-[210px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeChapter.index}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <h2 className="text-[32px] leading-[1.12] font-medium tracking-[-0.03em] text-[#0B0D0E] lg:text-[38px]">
                        {activeChapter.title}
                      </h2>
                      <p className="mt-4 text-[16px] leading-[1.6] text-[#525A55]">
                        {activeChapter.body}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-4 font-mono text-[11px] text-[#9AA39E]">
                  {activeIndex < 2
                    ? 'Scroll to continue ↓'
                    : 'Run your own numbers below ↓'}
                </div>
              </div>
            </div>

            {/* Right Continuous Morphing Visual Canvas */}
            <div className="col-span-7">
              <div className="studio-stage relative h-[480px] w-full overflow-hidden rounded-2xl border border-[#E2E7E4] bg-[#FFFFFF] p-7 lg:p-8">
                <AnimatePresence mode="wait">
                  {activeIndex === 0 && (
                    <motion.div
                      key="chapter-01"
                      initial={{ opacity: 0, y: 16, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -16, scale: 0.985 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full"
                    >
                      <ChapterOneVisual riseFactor={chapter1Rise} />
                    </motion.div>
                  )}

                  {activeIndex === 1 && (
                    <motion.div
                      key="chapter-02"
                      initial={{ opacity: 0, y: 16, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -16, scale: 0.985 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full"
                    >
                      <ChapterTwoVisual raceSeconds={raceSeconds} />
                    </motion.div>
                  )}

                  {activeIndex === 2 && (
                    <motion.div
                      key="chapter-03"
                      initial={{ opacity: 0, y: 16, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -16, scale: 0.985 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full"
                    >
                      <ChapterThreeVisual payoffFactor={payoffFactor} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE GRACEFUL STACKED REVEALS ================= */}
      <div className="space-y-12 px-5 py-16 md:hidden">
        {CHAPTERS.map((ch, idx) => (
          <motion.div
            key={ch.index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B0D0E] px-2.5 py-0.5 font-mono text-[10.5px] text-white">
                {ch.index} · {ch.label}
              </span>
              <h2 className="mt-3 text-[28px] leading-[1.15] font-medium tracking-[-0.03em] text-[#0B0D0E]">
                {ch.title}
              </h2>
              <p className="mt-2.5 text-[15px] leading-[1.6] text-[#525A55]">
                {ch.body}
              </p>
            </div>
            <div className="studio-card min-h-[380px] rounded-2xl border border-[#E2E7E4] bg-[#FFFFFF] p-5">
              {idx === 0 && <ChapterOneVisual riseFactor={1} />}
              {idx === 1 && <ChapterTwoVisual raceSeconds={MAX_BENCH_SEC} />}
              {idx === 2 && <ChapterThreeVisual payoffFactor={1} />}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
