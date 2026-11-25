import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Calculator,
  Check,
  Copy,
  GitCompareArrows,
  RotateCcw,
  Shuffle,
  Timer,
  Zap,
} from 'lucide-react';
import {
  CALCULATOR_PRESETS,
  MEASURED_BENCHMARKS,
  RunnerVcpu,
  calculateCosts,
  formatUsd,
} from '../../data/pricing';
import { AnimatedNumber } from './AnimatedNumber';

export type PlaygroundTab = 'estimate' | 'race' | 'failover' | 'switch';

const TABS: { id: PlaygroundTab; label: string; icon: typeof Calculator }[] = [
  { id: 'estimate', label: 'Estimate Bill', icon: Calculator },
  { id: 'race', label: 'Speed Race', icon: Timer },
  { id: 'failover', label: 'Spot Failover', icon: Shuffle },
  { id: 'switch', label: '1-Line Switch', icon: GitCompareArrows },
];

const EASE = [0.22, 1, 0.36, 1] as const;
const usd = (n: number) => formatUsd(Math.round(n));

/* ───────────────────────────── Estimate Bill ───────────────────────────── */

const PRESET_CHIPS = [
  { id: 'startup', label: '10 devs · 40k min' },
  { id: 'growth', label: '40 devs · 200k min' },
  { id: 'monorepo', label: '150 devs · 500k min' },
] as const;

function parseMinutes(raw: string): number | null {
  const cleaned = raw.trim().toLowerCase().replace(/[,\s_]/g, '').replace(/min.*$/, '');
  const match = cleaned.match(/^(\d+(?:\.\d+)?)([km]?)$/);
  if (!match) return null;
  const mult = match[2] === 'm' ? 1_000_000 : match[2] === 'k' ? 1_000 : 1;
  const value = Math.round(parseFloat(match[1]) * mult);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.min(5_000_000, Math.max(1_000, value));
}

function EstimatePanel() {
  const [presetId, setPresetId] = useState<string>('growth');
  const [query, setQuery] = useState('200,000');
  const [vcpu, setVcpu] = useState<RunnerVcpu>(4);
  const [minutes, setMinutes] = useState(200_000);
  const [invalid, setInvalid] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const costs = useMemo(() => calculateCosts(minutes, vcpu, 'gcp-x64', 0), [minutes, vcpu]);
  const openCiPct = Math.max(3, Math.min(100, (costs.openCiMonthly / Math.max(1, costs.githubMonthly)) * 100));

  const applyPreset = (id: string) => {
    const preset = CALCULATOR_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setVcpu(preset.vcpu);
    setMinutes(preset.monthlyMinutes);
    setQuery(preset.monthlyMinutes.toLocaleString('en-US'));
    setInvalid(false);
    setPulseKey((k) => k + 1);
  };

  const run = () => {
    const parsed = parseMinutes(query);
    if (parsed === null) {
      setInvalid(true);
      return;
    }
    const match = CALCULATOR_PRESETS.find((p) => p.monthlyMinutes === parsed);
    setPresetId(match?.id ?? 'custom');
    if (!match) setVcpu(4);
    else setVcpu(match.vcpu);
    setMinutes(parsed);
    setQuery(parsed.toLocaleString('en-US'));
    setInvalid(false);
    setPulseKey((k) => k + 1);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Dot-matrix command bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className={`dot-well flex h-12 items-center gap-2 rounded-xl border pr-1.5 pl-3.5 transition-colors ${
          invalid ? 'border-[#FCA5A5]' : 'border-[#E5E7EB] focus-within:border-[#2563EB]/60'
        }`}
      >
        <span className="font-mono text-[13px] text-[#2563EB] select-none">$</span>
        <span className="hidden font-mono text-[13px] text-[#6B7280] select-none sm:inline">estimate</span>
        <label htmlFor="hero-minutes" className="sr-only">
          Monthly GitHub Actions minutes
        </label>
        <input
          id="hero-minutes"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setInvalid(false);
          }}
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent font-mono text-[14px] font-medium text-[#0A0A0A] outline-none placeholder:text-[#9CA3AF]"
          placeholder="200,000"
        />
        <span className="hidden font-mono text-[12px] whitespace-nowrap text-[#6B7280] select-none sm:inline">
          min/mo · {vcpu} vCPU
        </span>
        <button
          type="submit"
          aria-label="Estimate my bill"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-[0_2px_8px_-2px_rgba(37,99,235,0.6)] transition-all duration-150 hover:bg-[#1D4ED8] active:scale-[0.94]"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* Presets */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {PRESET_CHIPS.map((chip) => {
          const active = presetId === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => applyPreset(chip.id)}
              className={`cursor-pointer rounded-full border px-2.5 py-1 font-mono text-[11.5px] transition-all duration-150 active:scale-[0.97] ${
                active
                  ? 'border-[#2563EB]/40 bg-[#EFF6FF] text-[#1D4ED8]'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#D1D5DB] hover:text-[#0A0A0A]'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Instant payoff */}
      <div className="mt-auto space-y-3 pt-4">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
            <span className="text-[#4B5563]">GitHub Actions</span>
            <span className="font-mono text-[13px] text-[#6B7280] tabular-nums line-through decoration-[#9CA3AF]/70">
              <AnimatedNumber value={costs.githubMonthly} format={(n) => `${usd(n)}/mo`} />
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#F1F2F4]">
            <div className="h-full w-full rounded-full bg-[#D1D5DB]" />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
            <span className="font-medium text-[#0A0A0A]">open-ci · AWS/GCP Spot</span>
            <span className="font-mono text-[15px] font-semibold text-[#1D4ED8] tabular-nums">
              ~<AnimatedNumber value={costs.openCiMonthly} format={(n) => `${usd(n)}/mo`} />
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#F1F2F4]">
            <motion.div
              initial={false}
              animate={{ width: `${openCiPct}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              className="h-full rounded-full bg-[#2563EB]"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <motion.span
            key={pulseKey}
            initial={{ scale: 0.94, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1 text-[13px] font-semibold text-[#15803D] tabular-nums"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            Save <AnimatedNumber value={costs.savingsVsGithubAnnual} format={(n) => `${usd(n)}/yr`} /> ·{' '}
            {costs.savingsVsGithubPct}% less
          </motion.span>
          <a
            href="#savings"
            className="font-mono text-[11.5px] text-[#6B7280] transition-colors hover:text-[#1D4ED8]"
          >
            Full calculator ↓
          </a>
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
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
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
      label: 'GitHub-hosted',
      spec: '2 vCPU',
      elapsed: hosted,
      done: hostedDone,
      pct: (hosted / RACE.beforeSeconds) * 100,
      bar: 'bg-[#CBD0D8]',
      text: 'text-[#4B5563]',
    },
    {
      label: 'open-ci Spot',
      spec: '4–8 vCPU',
      elapsed: openCi,
      done: openCiDone,
      pct: (openCi / RACE.beforeSeconds) * 100,
      bar: openCiDone ? 'bg-[#16A34A]' : 'bg-[#2563EB]',
      text: 'text-[#0A0A0A]',
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-left">
          <div className="text-[14px] font-medium text-[#0A0A0A]">{RACE.suite}</div>
          <div className="font-mono text-[11.5px] text-[#6B7280]">
            {RACE.shards} · measured on a production monorepo
          </div>
        </div>
        <button
          type="button"
          onClick={start}
          disabled={running}
          className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#111111] px-4 text-[12.5px] font-medium text-white transition-all duration-150 hover:bg-[#262626] active:scale-[0.97] disabled:cursor-default disabled:opacity-60"
        >
          {simSeconds > 0 && !running ? <RotateCcw className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
          {simSeconds > 0 && !running ? 'Run again' : 'Run 10-shard build →'}
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {lanes.map((lane) => (
          <div key={lane.label}>
            <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
              <span className={`font-medium ${lane.text}`}>
                {lane.label} <span className="font-mono text-[11.5px] font-normal text-[#6B7280]">· {lane.spec}</span>
              </span>
              <span className={`inline-flex items-center gap-1 font-mono text-[13px] tabular-nums ${lane.done ? 'font-semibold' : ''} ${lane.text}`}>
                {lane.done && <Check className={`h-3.5 w-3.5 ${lane.label.startsWith('open') ? 'text-[#16A34A]' : 'text-[#6B7280]'}`} />}
                {formatClock(lane.elapsed)}
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-[#F1F2F4]">
              <div
                className={`h-full rounded-full transition-colors duration-300 ${lane.bar}`}
                style={{ width: `${Math.max(1.5, lane.pct)}%` }}
              />
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
              className="inline-flex items-center gap-1.5 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1 text-[13px] font-semibold text-[#15803D]"
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
              className="font-mono text-[12px] text-[#6B7280]"
            >
              {running ? 'Shards running…' : 'Ready'}
            </motion.span>
          )}
        </AnimatePresence>
        <span className="font-mono text-[11.5px] text-[#6B7280]">
          {RACE.beforeLabel} → {RACE.afterLabel}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────────── Spot Failover ───────────────────────────── */

type FailoverPhase = 'idle' | 'preempted' | 'rerouting' | 'running' | 'done';

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
  tone: 'idle' | 'cobalt' | 'amber' | 'emerald' | 'muted';
}) {
  const toneClass = {
    idle: 'border-[#E5E7EB] bg-white',
    muted: 'border-[#E5E7EB] bg-[#F9FAFB]',
    cobalt: 'border-[#2563EB]/50 bg-white shadow-[0_6px_20px_-10px_rgba(37,99,235,0.55)]',
    amber: 'border-[#F59E0B]/60 bg-[#FFFBEB]',
    emerald: 'border-[#16A34A]/45 bg-white shadow-[0_6px_20px_-10px_rgba(22,163,74,0.5)]',
  }[tone];
  const chipClass = {
    idle: 'bg-[#F1F2F4] text-[#6B7280]',
    muted: 'bg-[#F1F2F4] text-[#9CA3AF]',
    cobalt: 'bg-[#EFF6FF] text-[#1D4ED8]',
    amber: 'bg-[#FEF3C7] text-[#B45309]',
    emerald: 'bg-[#F0FDF4] text-[#15803D]',
  }[tone];
  const dotClass = {
    idle: 'bg-[#CBD0D8]',
    muted: 'bg-[#D1D5DB]',
    cobalt: 'bg-[#2563EB]',
    amber: 'bg-[#F59E0B]',
    emerald: 'bg-[#16A34A]',
  }[tone];

  return (
    <motion.div
      layout
      animate={tone === 'amber' ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full rounded-xl border p-3 text-left transition-colors duration-300 ${toneClass}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10.5px] font-semibold tracking-[0.06em] text-[#6B7280]">{cloud}</span>
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      </div>
      <div className="mt-1 text-[14px] font-medium text-[#0A0A0A]">{region}</div>
      <div className="font-mono text-[11px] text-[#6B7280]">{machine}</div>
      <span className={`mt-2 inline-block rounded-full px-2 py-0.5 font-mono text-[10.5px] font-medium ${chipClass}`}>
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

  const gcpTone = phase === 'idle' ? 'cobalt' : phase === 'preempted' ? 'amber' : 'muted';
  const gcpStatus = phase === 'idle' ? 'Running shard 7' : phase === 'preempted' ? 'Spot preempted' : 'Reclaimed · 0 leaked';
  const awsTone = phase === 'running' ? 'cobalt' : phase === 'done' ? 'emerald' : 'idle';
  const awsStatus =
    phase === 'running' ? 'Running shard 7' : phase === 'done' ? 'Shard 7 passed ✓' : phase === 'rerouting' ? 'Booting…' : 'Standby';
  const arcActive = phase === 'rerouting' || phase === 'running' || phase === 'done';
  const ARC = 'M 36 34 C 130 2, 270 2, 364 34';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-left">
          <div className="text-[14px] font-medium text-[#0A0A0A]">Spot capacity disappears. Your build doesn’t.</div>
          <div className="font-mono text-[11.5px] text-[#6B7280]">Preempted shards reroute across clouds automatically</div>
        </div>
        <button
          type="button"
          onClick={trigger}
          disabled={phase !== 'idle' && phase !== 'done'}
          className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#111111] px-4 text-[12.5px] font-medium text-white transition-all duration-150 hover:bg-[#262626] active:scale-[0.97] disabled:cursor-default disabled:opacity-60"
        >
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
          <path d={ARC} fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
          <motion.path
            d={ARC}
            fill="none"
            stroke={phase === 'done' ? '#16A34A' : '#2563EB'}
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={false}
            animate={{ pathLength: arcActive ? 1 : 0, opacity: arcActive ? 1 : 0 }}
            transition={{ duration: arcActive ? 0.85 : 0.2, ease: EASE }}
          />
          {phase === 'rerouting' && (
            <circle r="4.5" fill="#2563EB">
              <animateMotion dur="0.9s" repeatCount="1" fill="freeze" path={ARC} />
            </circle>
          )}
        </svg>

        <div className="relative z-10 w-[44%] max-w-[230px]">
          <RegionNode cloud="GCP" region="us-central1" machine="c3-standard-4 · Spot" status={gcpStatus} tone={gcpTone} />
        </div>
        <div className="relative z-10 w-[44%] max-w-[230px]">
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
              className="inline-flex items-center gap-1.5 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1 text-[13px] font-semibold text-[#15803D]"
            >
              <Check className="h-3.5 w-3.5" />0 failed jobs · automatic fallback
            </motion.span>
          ) : (
            <motion.span
              key={phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[12px] text-[#6B7280]"
            >
              {phase === 'idle' && '22 jobs queued · GCP primary, AWS standby'}
              {phase === 'preempted' && 'GCP reclaimed the instance — requeueing shard 7…'}
              {phase === 'rerouting' && 'Rerouting to AWS us-east-1…'}
              {phase === 'running' && 'Replacement runner online in your AWS account'}
            </motion.span>
          )}
        </AnimatePresence>
        <span className="hidden font-mono text-[11.5px] text-[#6B7280] sm:inline">GitHub-hosted fallback ready</span>
      </div>
    </div>
  );
}

/* ───────────────────────────── 1-Line Switch ───────────────────────────── */

const NEW_LINE = 'runs-on: open-ci-linux-x64';

function SwitchPanel() {
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

  return (
    <div className="flex h-full flex-col">
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] text-left font-mono text-[12.5px] leading-[1.7]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F7F8FA] py-1.5 pr-1.5 pl-3.5 text-[11.5px] text-[#6B7280]">
          <span>.github/workflows/ci.yml</span>
          <div className="flex items-center gap-2">
            <span className="hidden text-[#15803D] sm:inline">1 line changed</span>
            <button
              type="button"
              onClick={copy}
              className={`inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border px-2 text-[11px] transition-colors ${
                copied
                  ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
                  : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#D1D5DB] hover:text-[#0A0A0A]'
              }`}
              aria-label="Copy runs-on line"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="bg-white py-2">
          <div className="px-3.5 text-[#6B7280]">
            <span className="mr-3 inline-block w-3 select-none" />jobs:
          </div>
          <div className="px-3.5 text-[#6B7280]">
            <span className="mr-3 inline-block w-3 select-none" />
            {'  '}test:
          </div>
          <div className="bg-[#FEF2F2] px-3.5 text-[#B91C1C]">
            <span className="mr-3 inline-block w-3 select-none text-[#EF4444]">−</span>
            <span className="whitespace-pre line-through decoration-[#EF4444]/50">{'    runs-on: ubuntu-latest'}</span>
          </div>
          <div className="border-l-2 border-[#2563EB] bg-[#EFF6FF] pr-3.5 pl-[12px] text-[#1D4ED8]">
            <span className="mr-3 inline-block w-3 select-none text-[#2563EB]">+</span>
            <span className="whitespace-pre font-medium">
              {'    '}
              {NEW_LINE.slice(0, typed)}
            </span>
            {typed < NEW_LINE.length && (
              <span className="ml-px inline-block h-[14px] w-[7px] translate-y-[2px] animate-pulse bg-[#2563EB]" />
            )}
          </div>
          <div className="px-3.5 text-[#6B7280]">
            <span className="mr-3 inline-block w-3 select-none" />
            <span className="whitespace-pre">{'    steps:'}</span>
          </div>
          <div className="flex items-center justify-between px-3.5 text-[#374151]">
            <span>
              <span className="mr-3 inline-block w-3 select-none" />
              <span className="whitespace-pre">{'      - uses: actions/cache@v4'}</span>
            </span>
            <span className="text-[10.5px] text-[#9CA3AF]">unchanged</span>
          </div>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[12.5px] text-[#4B5563]">
        <span>Same workflows, secrets and caches. Only the runner changes.</span>
        <span className="hidden font-mono text-[11.5px] text-[#6B7280] sm:inline">~5 min setup</span>
      </div>
    </div>
  );
}

/* ───────────────────────────── Shell ───────────────────────────── */

export function HeroPlayground({
  tab,
  onTabChange,
}: {
  tab: PlaygroundTab;
  onTabChange: (tab: PlaygroundTab) => void;
}) {
  return (
    <div className="cobalt-bezel relative rounded-[28px] p-3 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.32)] sm:p-4">
      {/* inner glass highlight on the bezel */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/15 ring-inset" />
      <div className="relative rounded-[18px] bg-white p-3.5 shadow-[0_1px_0_rgba(255,255,255,0.4),0_8px_24px_-12px_rgba(15,23,42,0.35)] sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Interactive demos"
            className="-mx-1 flex max-w-full overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="inline-flex rounded-xl bg-[#F4F5F7] p-1">
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onTabChange(id)}
                    className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors duration-150 sm:px-3 ${
                      active ? 'text-[#0A0A0A]' : 'text-[#6B7280] hover:text-[#0A0A0A]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="hero-tab-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-0 rounded-lg bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.04)]"
                      />
                    )}
                    <Icon className={`relative z-10 h-3.5 w-3.5 ${active ? 'text-[#2563EB]' : ''}`} />
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <span className="hidden items-center gap-1.5 font-mono text-[11px] text-[#6B7280] md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            live
          </span>
        </div>

        <div className="relative mt-3.5 h-[226px] sm:h-[214px]">
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
              {tab === 'estimate' && <EstimatePanel />}
              {tab === 'race' && <RacePanel />}
              {tab === 'failover' && <FailoverPanel />}
              {tab === 'switch' && <SwitchPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
