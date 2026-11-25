import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, RotateCcw, Zap } from 'lucide-react';
import {
  CALCULATOR_PRESETS,
  MEASURED_BENCHMARKS,
  RunnerVcpu,
  calculateCosts,
  formatMinutes,
  formatUsd,
} from '../../data/pricing';
import { AnimatedNumber } from './AnimatedNumber';

export type PlaygroundTab = 'savings' | 'race' | 'failover' | 'setup';

const TABS: { id: PlaygroundTab; label: string }[] = [
  { id: 'savings', label: 'Savings' },
  { id: 'race', label: 'Speed Race' },
  { id: 'failover', label: 'Spot Failover' },
  { id: 'setup', label: '1-Line Setup' },
];

const EASE = [0.22, 1, 0.36, 1] as const;
const usd = (n: number) => formatUsd(Math.round(n));

const btnDark =
  'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#0B0D0E] px-3.5 text-[12.5px] font-medium text-white transition-all duration-150 hover:bg-[#1F2422] active:scale-[0.97] disabled:cursor-default disabled:opacity-60';
const winBadge =
  'inline-flex items-center gap-1.5 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 text-[12.5px] font-semibold text-[#047857] tabular-nums';

/* ───────────────────────────── Savings ───────────────────────────── */

const TEAM_CHIPS = [
  { id: 'startup', label: '10 devs' },
  { id: 'growth', label: '40 devs' },
  { id: 'monorepo', label: '150 devs' },
] as const;

// Log-scale slider over 10k → 1M monthly minutes.
const MIN_MINUTES = 10_000;
const MAX_MINUTES = 1_000_000;
const SLIDER_STEPS = 200;
const toSlider = (m: number) =>
  Math.round((Math.log(m / MIN_MINUTES) / Math.log(MAX_MINUTES / MIN_MINUTES)) * SLIDER_STEPS);
const fromSlider = (v: number) => {
  const raw = MIN_MINUTES * Math.pow(MAX_MINUTES / MIN_MINUTES, v / SLIDER_STEPS);
  const step = raw < 100_000 ? 1_000 : 10_000;
  return Math.round(raw / step) * step;
};

function CostBar({ label, value, pct, tone }: { label: string; value: number; pct: number; tone: 'muted' | 'soft' }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[12.5px]">
        <span className="text-[#525A55]">{label}</span>
        <span className="font-mono text-[12.5px] text-[#6B736E] tabular-nums">
          <AnimatedNumber value={value} format={(n) => `${usd(n)}/mo`} />
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#F0F3F1]">
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 22 }}
          className={`h-full rounded-full ${tone === 'muted' ? 'bg-[#C9D0CB]' : 'bg-[#DCE2DE]'}`}
        />
      </div>
    </div>
  );
}

function SavingsPanel() {
  const [presetId, setPresetId] = useState<string>('growth');
  const [vcpu, setVcpu] = useState<RunnerVcpu>(4);
  const [minutes, setMinutes] = useState(200_000);
  const [pulseKey, setPulseKey] = useState(0);

  const costs = useMemo(() => calculateCosts(minutes, vcpu, 'gcp-x64', 0), [minutes, vcpu]);
  const base = Math.max(1, costs.githubMonthly);
  const saasPct = Math.max(3, (costs.managedSaasMonthly / base) * 100);
  const openCiPct = Math.max(3, Math.min(100, (costs.openCiMonthly / base) * 100));

  const applyPreset = (id: string) => {
    const preset = CALCULATOR_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setVcpu(preset.vcpu);
    setMinutes(preset.monthlyMinutes);
    setPulseKey((k) => k + 1);
  };

  const onSlide = (v: number) => {
    const next = fromSlider(v);
    setMinutes(next);
    setPresetId(CALCULATOR_PRESETS.find((p) => p.monthlyMinutes === next && p.vcpu === vcpu)?.id ?? 'custom');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Team selector + custom minutes */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="inline-flex shrink-0 rounded-xl border border-[#E2E7E4] bg-[#F7F9F8] p-0.5" role="group" aria-label="Team size">
          {TEAM_CHIPS.map((chip) => {
            const active = presetId === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => applyPreset(chip.id)}
                aria-pressed={active}
                className={`cursor-pointer rounded-[10px] px-3 py-1.5 text-[12.5px] font-medium transition-all duration-150 active:scale-[0.97] ${
                  active
                    ? 'bg-white text-[#0B0D0E] shadow-[0_1px_2px_rgba(11,13,14,0.08),0_0_0_1px_rgba(11,13,14,0.05)]'
                    : 'text-[#6B736E] hover:text-[#0B0D0E]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <label htmlFor="hero-minutes" className="sr-only">
            Monthly GitHub Actions minutes
          </label>
          <input
            id="hero-minutes"
            type="range"
            min={0}
            max={SLIDER_STEPS}
            value={toSlider(minutes)}
            onChange={(e) => onSlide(Number(e.target.value))}
            className="ledger-slider h-5 min-w-0 flex-1"
          />
          <span className="min-w-[124px] shrink-0 text-right font-mono text-[12px] whitespace-nowrap text-[#0B0D0E] tabular-nums">
            {formatMinutes(minutes)} min · {vcpu} vCPU
          </span>
        </div>
      </div>

      {/* Split comparison */}
      <div className="mt-auto grid grid-cols-1 gap-4 pt-4 sm:grid-cols-[1fr_1.05fr] sm:items-stretch sm:gap-5">
        <div className="flex flex-col justify-center gap-3.5">
          <CostBar label="GitHub Actions" value={costs.githubMonthly} pct={100} tone="muted" />
          <CostBar label="Managed runner SaaS" value={costs.managedSaasMonthly} pct={saasPct} tone="soft" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-[#A7F3D0] bg-[linear-gradient(180deg,#F3FDF8_0%,#FFFFFF_100%)] p-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0B0D0E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              open-ci on your cloud
            </span>
            <span className="font-mono text-[10.5px] text-[#6B736E]">GCP Spot</span>
          </div>
          <div className="mt-1 font-mono text-[26px] leading-tight font-semibold tracking-[-0.02em] text-[#0B0D0E] tabular-nums">
            ~<AnimatedNumber value={costs.openCiMonthly} format={(n) => usd(n)} />
            <span className="text-[13px] font-medium text-[#6B736E]">/mo</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E3F5EC]">
            <motion.div
              initial={false}
              animate={{ width: `${openCiPct}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              className="h-full rounded-full bg-[#10B981]"
            />
          </div>
          <motion.span
            key={pulseKey}
            initial={{ scale: 0.94, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className={`mt-3 ${winBadge}`}
          >
            Save <AnimatedNumber value={costs.savingsVsGithubAnnual} format={(n) => `${usd(n)}/yr`} /> ·{' '}
            {costs.savingsVsGithubPct}% less
          </motion.span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Speed Race ───────────────────────────── */

const RACE = MEASURED_BENCHMARKS[0];
const RACE_WALL_SECONDS = 3.4;

function formatClock(totalSec: number) {
  const s = Math.max(0, Math.round(totalSec));
  return `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, '0')}s`;
}

function RacePanel() {
  const [simSeconds, setSimSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef(0);

  const start = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSimSeconds(RACE.beforeSeconds);
      return;
    }
    setRunning(true);
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1000 / RACE_WALL_SECONDS);
      setSimSeconds(k * RACE.beforeSeconds);
      if (k < 1) rafRef.current = requestAnimationFrame(tick);
      else setRunning(false);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(start, 250);
    return () => {
      window.clearTimeout(id);
      cancelAnimationFrame(rafRef.current);
    };
  }, [start]);

  const hosted = Math.min(simSeconds, RACE.beforeSeconds);
  const openCi = Math.min(simSeconds, RACE.afterSeconds);
  const openCiDone = simSeconds >= RACE.afterSeconds;
  const hostedDone = simSeconds >= RACE.beforeSeconds;
  const savedSec = RACE.beforeSeconds - RACE.afterSeconds;

  const lanes = [
    {
      key: 'hosted',
      label: 'GitHub-hosted',
      spec: '2 vCPU',
      elapsed: hosted,
      done: hostedDone,
      pct: (hosted / RACE.beforeSeconds) * 100,
      bar: 'bg-[#C9D0CB]',
      text: 'text-[#525A55]',
    },
    {
      key: 'open-ci',
      label: 'open-ci Spot',
      spec: '4–8 vCPU',
      elapsed: openCi,
      done: openCiDone,
      pct: (openCi / RACE.beforeSeconds) * 100,
      bar: openCiDone ? 'bg-[#10B981]' : 'bg-[#0B0D0E]',
      text: 'text-[#0B0D0E]',
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-left">
          <div className="text-[14px] font-medium text-[#0B0D0E]">{RACE.suite}</div>
          <div className="font-mono text-[11.5px] text-[#6B736E]">{RACE.shards} · measured on a production monorepo</div>
        </div>
        <button type="button" onClick={start} disabled={running} className={btnDark}>
          {simSeconds > 0 && !running ? <RotateCcw className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5 text-[#34D399]" />}
          {simSeconds > 0 && !running ? 'Run again' : 'Run 10-shard build →'}
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {lanes.map((lane) => (
          <div key={lane.key}>
            <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
              <span className={`font-medium ${lane.text}`}>
                {lane.label} <span className="font-mono text-[11.5px] font-normal text-[#6B736E]">· {lane.spec}</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 font-mono text-[13px] tabular-nums ${lane.done ? 'font-semibold' : ''} ${lane.text}`}
              >
                {lane.done && <Check className={`h-3.5 w-3.5 ${lane.key === 'open-ci' ? 'text-[#059669]' : 'text-[#6B736E]'}`} />}
                {formatClock(lane.elapsed)}
              </span>
            </div>
            {/* 10 shard segments per lane */}
            <div className="relative h-3 overflow-hidden rounded-md bg-[#F0F3F1]">
              <div
                className={`h-full rounded-md transition-colors duration-300 ${lane.bar}`}
                style={{ width: `${Math.max(1.5, lane.pct)}%` }}
              />
              <div className="pointer-events-none absolute inset-0 grid grid-cols-10">
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className={i === 0 ? '' : 'border-l-2 border-white'} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        <AnimatePresence mode="wait">
          {openCiDone ? (
            <motion.span
              key="done"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 16 }}
              className={winBadge}
            >
              <Zap className="h-3.5 w-3.5" />
              {RACE.fasterPct}% faster · {formatClock(savedSec)} back every run
            </motion.span>
          ) : (
            <motion.span
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[12px] text-[#6B736E]"
            >
              {running ? 'Shards running…' : 'Ready'}
            </motion.span>
          )}
        </AnimatePresence>
        <span className="font-mono text-[11.5px] text-[#6B736E]">
          {RACE.beforeLabel} → {RACE.afterLabel}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────────── Spot Failover ───────────────────────────── */

type FailoverPhase = 'idle' | 'preempted' | 'rerouting' | 'running' | 'done';
type NodeTone = 'idle' | 'live' | 'amber' | 'emerald' | 'muted';

function RegionNode({
  cloud,
  region,
  machine,
  status,
  tone,
}: {
  cloud: string;
  region: string;
  machine: string;
  status: string;
  tone: NodeTone;
}) {
  const toneClass: Record<NodeTone, string> = {
    idle: 'border-[#E2E7E4] bg-white',
    muted: 'border-[#E2E7E4] bg-[#FAFBFA]',
    live: 'border-[#0B0D0E]/70 bg-white shadow-[0_8px_20px_-12px_rgba(11,13,14,0.45)]',
    amber: 'border-[#F59E0B]/60 bg-[#FFFBEB]',
    emerald: 'border-[#10B981]/55 bg-white shadow-[0_8px_20px_-12px_rgba(5,150,105,0.55)]',
  };
  const chipClass: Record<NodeTone, string> = {
    idle: 'bg-[#F0F3F1] text-[#6B736E]',
    muted: 'bg-[#F0F3F1] text-[#9AA39E]',
    live: 'bg-[#0B0D0E] text-white',
    amber: 'bg-[#FEF3C7] text-[#B45309]',
    emerald: 'bg-[#ECFDF5] text-[#047857]',
  };
  const dotClass: Record<NodeTone, string> = {
    idle: 'bg-[#CDD4CF]',
    muted: 'bg-[#D3D9D5]',
    live: 'bg-[#10B981] animate-pulse',
    amber: 'bg-[#F59E0B]',
    emerald: 'bg-[#10B981]',
  };

  return (
    <motion.div
      layout
      animate={tone === 'amber' ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full rounded-xl border p-3 text-left transition-colors duration-300 ${toneClass[tone]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10.5px] font-semibold tracking-[0.06em] text-[#6B736E]">{cloud}</span>
        <span className={`h-2 w-2 rounded-full ${dotClass[tone]}`} />
      </div>
      <div className="mt-1 text-[14px] font-medium text-[#0B0D0E]">{region}</div>
      <div className="font-mono text-[11px] text-[#6B736E]">{machine}</div>
      <span className={`mt-2 inline-block rounded-md px-2 py-0.5 font-mono text-[10.5px] font-medium ${chipClass[tone]}`}>
        {status}
      </span>
    </motion.div>
  );
}

function FailoverPanel() {
  const [phase, setPhase] = useState<FailoverPhase>('idle');
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const trigger = () => {
    clear();
    if (phase === 'done') {
      setPhase('idle');
      return;
    }
    setPhase('preempted');
    timers.current.push(window.setTimeout(() => setPhase('rerouting'), 750));
    timers.current.push(window.setTimeout(() => setPhase('running'), 1650));
    timers.current.push(window.setTimeout(() => setPhase('done'), 2700));
  };

  const gcpTone: NodeTone = phase === 'idle' ? 'live' : phase === 'preempted' ? 'amber' : 'muted';
  const gcpStatus = phase === 'idle' ? 'Running shard 7' : phase === 'preempted' ? 'Spot preempted' : 'Reclaimed · 0 leaked';
  const awsTone: NodeTone = phase === 'running' ? 'live' : phase === 'done' ? 'emerald' : 'idle';
  const awsStatus =
    phase === 'running' ? 'Running shard 7' : phase === 'done' ? 'Shard 7 passed ✓' : phase === 'rerouting' ? 'Booting…' : 'Standby';
  const arcActive = phase === 'rerouting' || phase === 'running' || phase === 'done';
  const ARC = 'M 36 34 C 130 2, 270 2, 364 34';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-left">
          <div className="text-[14px] font-medium text-[#0B0D0E]">Spot capacity disappears. Your build doesn’t.</div>
          <div className="font-mono text-[11.5px] text-[#6B736E]">Preempted shards reroute across clouds automatically</div>
        </div>
        <button type="button" onClick={trigger} disabled={phase !== 'idle' && phase !== 'done'} className={btnDark}>
          {phase === 'done' ? <RotateCcw className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5 text-[#FBBF24]" />}
          {phase === 'done' ? 'Reset' : 'Preempt us-central1 →'}
        </button>
      </div>

      <div className="relative mt-3 flex flex-1 items-end justify-between pt-8">
        <svg
          viewBox="0 0 400 38"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-[17%] top-0 z-0 h-[36px] w-[66%] overflow-visible"
          aria-hidden="true"
        >
          <path d={ARC} fill="none" stroke="#E2E7E4" strokeWidth="1.5" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
          <motion.path
            d={ARC}
            fill="none"
            stroke={phase === 'done' ? '#10B981' : '#F59E0B'}
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={false}
            animate={{ pathLength: arcActive ? 1 : 0, opacity: arcActive ? 1 : 0 }}
            transition={{ duration: arcActive ? 0.85 : 0.2, ease: EASE }}
          />
          {phase === 'rerouting' && (
            <circle r="4.5" fill="#F59E0B">
              <animateMotion dur="0.9s" repeatCount="1" fill="freeze" path={ARC} />
            </circle>
          )}
        </svg>

        <div className="relative z-10 w-[44%] max-w-[240px]">
          <RegionNode cloud="GCP" region="us-central1" machine="c3-standard-4 · Spot" status={gcpStatus} tone={gcpTone} />
        </div>
        <div className="relative z-10 w-[44%] max-w-[240px]">
          <RegionNode cloud="AWS" region="us-east-1" machine="c7a.xlarge · Spot" status={awsStatus} tone={awsTone} />
        </div>
      </div>

      <div className="mt-3 flex h-7 items-center justify-between gap-2">
        <AnimatePresence mode="wait">
          {phase === 'done' ? (
            <motion.span
              key="ok"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 16 }}
              className={winBadge}
            >
              <Check className="h-3.5 w-3.5" />0 failed jobs · automatic fallback
            </motion.span>
          ) : (
            <motion.span
              key={phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[12px] text-[#6B736E]"
            >
              {phase === 'idle' && '22 jobs queued · GCP primary, AWS standby'}
              {phase === 'preempted' && 'GCP reclaimed the instance — requeueing shard 7…'}
              {phase === 'rerouting' && 'Rerouting to AWS us-east-1…'}
              {phase === 'running' && 'Replacement runner online in your AWS account'}
            </motion.span>
          )}
        </AnimatePresence>
        <span className="hidden font-mono text-[11.5px] text-[#6B736E] sm:inline">GitHub-hosted fallback ready</span>
      </div>
    </div>
  );
}

/* ───────────────────────────── 1-Line Setup ───────────────────────────── */

const NEW_LINE = 'runs-on: open-ci-linux-x64';

function SetupPanel() {
  const [typed, setTyped] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(NEW_LINE.length);
      return;
    }
    let i = 0;
    let intervalId = 0;
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        i += 1;
        setTyped(i);
        if (i >= NEW_LINE.length) window.clearInterval(intervalId);
      }, 26);
    }, 380);
    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(NEW_LINE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable
    }
  };

  const gutter = 'mr-3 inline-block w-3 select-none';

  return (
    <div className="flex h-full flex-col">
      <div className="overflow-hidden rounded-xl border border-[#1E2422] bg-[#0B0D0E] text-left font-mono text-[12.5px] leading-[1.7]">
        <div className="flex items-center justify-between border-b border-white/[0.07] py-1.5 pr-1.5 pl-3.5 text-[11.5px] text-[#8A938E]">
          <span>.github/workflows/ci.yml</span>
          <div className="flex items-center gap-2">
            <span className="hidden text-[#34D399] sm:inline">1 line changed</span>
            <button
              type="button"
              onClick={copy}
              className={`inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border px-2 text-[11px] transition-colors ${
                copied
                  ? 'border-[#10B981]/50 bg-[#10B981]/15 text-[#6EE7B7]'
                  : 'border-white/10 bg-white/[0.04] text-[#C9D0CB] hover:border-white/20 hover:text-white'
              }`}
              aria-label="Copy runs-on line"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="py-2">
          <div className="px-3.5 text-[#8A938E]">
            <span className={gutter} />
            jobs:
          </div>
          <div className="px-3.5 text-[#8A938E]">
            <span className={gutter} />
            <span className="whitespace-pre">{'  test:'}</span>
          </div>
          <div className="bg-[#F87171]/[0.09] px-3.5 text-[#FCA5A5]">
            <span className={`${gutter} text-[#F87171]`}>−</span>
            <span className="whitespace-pre line-through decoration-[#F87171]/50">{'    runs-on: ubuntu-latest'}</span>
          </div>
          <div className="border-l-2 border-[#10B981] bg-[#10B981]/[0.12] pr-3.5 pl-[12px] text-[#6EE7B7]">
            <span className={`${gutter} text-[#34D399]`}>+</span>
            <span className="whitespace-pre font-medium">
              {'    '}
              {NEW_LINE.slice(0, typed)}
            </span>
            {typed < NEW_LINE.length && (
              <span className="ml-px inline-block h-[14px] w-[7px] translate-y-[2px] animate-pulse bg-[#34D399]" />
            )}
          </div>
          <div className="px-3.5 text-[#8A938E]">
            <span className={gutter} />
            <span className="whitespace-pre">{'    steps:'}</span>
          </div>
          <div className="flex items-center justify-between px-3.5 text-[#C9D0CB]">
            <span>
              <span className={gutter} />
              <span className="whitespace-pre">{'      - uses: actions/cache@v4'}</span>
            </span>
            <span className="text-[10.5px] text-[#5E6762]">unchanged</span>
          </div>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[12.5px] text-[#525A55]">
        <span>Same workflows, secrets and caches. Only the runner changes.</span>
        <span className="hidden font-mono text-[11.5px] text-[#6B736E] sm:inline">~5 min setup</span>
      </div>
    </div>
  );
}

/* ───────────────────────────── Live Runner Deck ───────────────────────────── */

export function HeroPlayground({
  tab,
  onTabChange,
}: {
  tab: PlaygroundTab;
  onTabChange: (tab: PlaygroundTab) => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E2E7E4] bg-white text-left shadow-[0_24px_64px_-24px_rgba(11,13,14,0.14),0_2px_8px_-2px_rgba(5,150,105,0.08)]">
      <div className="deck-accent pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px]" aria-hidden="true" />

      {/* Chrome bar */}
      <div className="flex flex-col gap-2 border-b border-[#ECEFEA] bg-[#FAFBFA] px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 font-mono text-[11.5px] text-[#525A55]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-45 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
          </span>
          <span>
            <span className="font-medium text-[#0B0D0E]">open-ci</span>
            <span className="text-[#9AA39E]"> · </span>
            <span className="hidden md:inline">live interactive preview</span>
            <span className="md:hidden">live preview</span>
          </span>
        </span>

        <div
          role="tablist"
          aria-label="Interactive demos"
          className="-mx-1 flex max-w-full overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="inline-flex rounded-xl border border-[#E2E7E4] bg-white p-0.5">
            {TABS.map(({ id, label }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onTabChange(id)}
                  className={`relative cursor-pointer rounded-[10px] px-2.5 py-1 text-[12.5px] font-medium whitespace-nowrap transition-colors duration-150 sm:px-3 ${
                    active ? 'text-white' : 'text-[#6B736E] hover:text-[#0B0D0E]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="deck-tab-pill"
                      transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                      className="absolute inset-0 rounded-[10px] bg-[#0B0D0E]"
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body: fixed height so switching tabs never shifts layout */}
      <div className="relative h-[384px] p-4 sm:h-[268px] sm:px-5 sm:py-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="h-full"
          >
            {tab === 'savings' && <SavingsPanel />}
            {tab === 'race' && <RacePanel />}
            {tab === 'failover' && <FailoverPanel />}
            {tab === 'setup' && <SetupPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
