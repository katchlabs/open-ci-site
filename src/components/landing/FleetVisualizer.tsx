import { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Cpu,
  HardDrive,
  RefreshCw,
  Shield,
  Zap,
} from 'lucide-react';

interface RunnerNode {
  id: string;
  provider: 'GCP' | 'AWS';
  zone: string;
  machine: string;
  phase: 'Live' | 'Creating' | 'Retiring';
  job: string;
  cacheHit: string;
  nvme: string;
  costPerHr: string;
}

interface StreamEvent {
  ts: string;
  kind: 'admit' | 'bootstrap' | 'cache' | 'backoff' | 'retire';
  text: string;
}

const BASE_RUNNERS: RunnerNode[] = [
  {
    id: 'oci-7f2a',
    provider: 'GCP',
    zone: 'us-west1-a',
    machine: 'c3-standard-4',
    phase: 'Live',
    job: 'api-integration (shard 4/10)',
    cacheHit: 'HIT · 1.4 GiB (2.1s)',
    nvme: '/mnt/nvme ext4',
    costPerHr: '$0.072/hr',
  },
  {
    id: 'oci-9c1e',
    provider: 'AWS',
    zone: 'us-east-1b',
    machine: 'c7a.xlarge',
    phase: 'Live',
    job: 'playwright-e2e (shard 2/8)',
    cacheHit: 'HIT · 890 MiB (1.4s)',
    nvme: '/mnt/nvme RAID0',
    costPerHr: '$0.085/hr',
  },
  {
    id: 'oci-4b8d',
    provider: 'AWS',
    zone: 'us-east-1a',
    machine: 'c7g.xlarge',
    phase: 'Creating',
    job: 'rust-clippy-workspace',
    cacheHit: 'Twirp v2 ready',
    nvme: 'Mounting NVMe...',
    costPerHr: '$0.072/hr',
  },
];

const INITIAL_EVENTS: StreamEvent[] = [
  {
    ts: '14:02:11',
    kind: 'admit',
    text: 'POST /v1/ingress/admit · RS256 OIDC verified · reserved 3x 4-vCPU',
  },
  {
    ts: '14:02:18',
    kind: 'bootstrap',
    text: 'oci-7f2a burned 1x HMAC token (bootstrap_used 0→1) · IAM=none',
  },
  {
    ts: '14:02:21',
    kind: 'cache',
    text: 'open-ci cache · ref=refs/pull/418/merge · restored pnpm-store (1.4 GiB)',
  },
  {
    ts: '14:02:29',
    kind: 'retire',
    text: 'oci-3a19 completed · guest poweroff + VM deleted · leaked=0',
  },
];

export function FleetVisualizer() {
  const [tick, setTick] = useState(0);
  const [stockoutActive, setStockoutActive] = useState(false);
  const [events, setEvents] = useState<StreamEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 4);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const runners: RunnerNode[] = BASE_RUNNERS.map((r, idx) => {
    if (stockoutActive && idx === 0) {
      return {
        ...r,
        id: 'oci-8e4c',
        provider: 'AWS',
        zone: 'us-east-1c',
        machine: 'c7a.xlarge',
        phase: 'Live',
        costPerHr: '$0.085/hr',
      };
    }
    if (idx === 2) {
      return {
        ...r,
        phase: tick >= 1 ? 'Live' : 'Creating',
        nvme: tick >= 1 ? '/mnt/nvme ext4' : 'Mounting NVMe...',
        cacheHit: tick >= 2 ? 'HIT · 2.1 GiB (2.8s)' : 'Twirp v2 ready',
      };
    }
    return r;
  });

  const triggerStockout = () => {
    const next = !stockoutActive;
    setStockoutActive(next);
    const now = new Date();
    const ts = now.toTimeString().slice(0, 8);
    if (next) {
      setEvents((prev) => [
        {
          ts,
          kind: 'backoff',
          text: 'GCP us-west1-a ZONE_RESOURCE_POOL_EXHAUSTED → 90s backoff → spilled to AWS us-east-1c',
        },
        ...prev.slice(0, 3),
      ]);
    } else {
      setEvents((prev) => [
        {
          ts,
          kind: 'admit',
          text: 'GCP us-west1-a backoff cleared · multi-cloud weighted routing restored',
        },
        ...prev.slice(0, 3),
      ]);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1E2636] bg-[#111520]/90 shadow-2xl shadow-black/50 backdrop-blur">
      {/* Window chrome */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2636] bg-[#0B0E16] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#10B981]" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#10B981]" />
          </div>
          <span className="font-mono text-xs font-semibold text-[#F8FAFC]">
            open-ci control plane
          </span>
          <span className="rounded border border-[#10B981]/30 bg-[#10B981]/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#10B981]">
            mode=active
          </span>
        </div>

        <button
          type="button"
          onClick={triggerStockout}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] font-medium transition cursor-pointer ${
            stockoutActive
              ? 'border-[#F97316]/60 bg-[#F97316]/15 text-[#FB923C]'
              : 'border-[#1E2636] bg-[#111520] text-[#94A3B8] hover:border-[#F97316]/50 hover:text-[#F8FAFC]'
          }`}
        >
          <RefreshCw className="h-3 w-3" />
          {stockoutActive ? 'Reset GCP Zone' : 'Simulate Spot Stockout'}
        </button>
      </div>

      {/* Telemetry summary bar */}
      <div className="grid grid-cols-3 divide-x divide-[#1E2636] border-b border-[#1E2636] bg-[#0D111A] text-center">
        <div className="px-3 py-2.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
            Worker Cloud IAM
          </div>
          <div className="mt-0.5 flex items-center justify-center gap-1 font-mono text-xs font-semibold text-[#10B981]">
            <Shield className="h-3.5 w-3.5" />
            Zero Attached
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
            Backoffs
          </div>
          <div
            className={`mt-0.5 font-mono text-xs font-semibold ${
              stockoutActive ? 'text-[#F97316]' : 'text-[#F8FAFC]'
            }`}
          >
            {stockoutActive ? '1 (90s TTL)' : '0 active'}
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
            Leaked VMs
          </div>
          <div className="mt-0.5 flex items-center justify-center gap-1 font-mono text-xs font-semibold text-[#10B981]">
            <CheckCircle2 className="h-3.5 w-3.5" />0
          </div>
        </div>
      </div>

      {/* Active runner fleet */}
      <div className="space-y-2.5 p-4">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
          <span>EPHEMERAL SPOT FLEET (SQLITE WAL)</span>
          <span>12 / 64 vCPU RESERVED</span>
        </div>

        {runners.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-[#1E2636] bg-[#090B10]/85 p-3 transition hover:border-[#2A354B]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                    r.provider === 'GCP'
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      : 'bg-[#F97316]/15 text-[#FB923C] border border-[#F97316]/30'
                  }`}
                >
                  {r.provider}
                </span>
                <span className="font-mono text-xs font-semibold text-[#F8FAFC]">
                  {r.id}
                </span>
                <span className="hidden sm:inline font-mono text-[11px] text-[#64748B]">
                  {r.machine} · {r.zone}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-[#10B981]">
                  {r.costPerHr}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
                    r.phase === 'Live'
                      ? 'bg-[#10B981]/15 text-[#10B981]'
                      : 'bg-[#F97316]/15 text-[#FB923C]'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      r.phase === 'Live' ? 'bg-[#10B981]' : 'bg-[#F97316]'
                    }`}
                  />
                  {r.phase}
                </span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5 font-mono text-[#CBD5E1]">
                <Cpu className="h-3 w-3 text-[#64748B]" />
                {r.job}
              </span>
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span className="inline-flex items-center gap-1 text-[#94A3B8]">
                  <HardDrive className="h-3 w-3 text-[#F97316]" />
                  {r.nvme}
                </span>
                <span className="inline-flex items-center gap-1 text-[#10B981]">
                  <Zap className="h-3 w-3" />
                  {r.cacheHit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live SSE stream */}
      <div className="border-t border-[#1E2636] bg-[#07090D] px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
          <Activity className="h-3 w-3 text-[#F97316]" />
          GET /api/v1/events (SSE)
        </div>
        <div className="space-y-1.5 font-mono text-[11px] leading-snug">
          {events.map((ev, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="shrink-0 text-[#475569]">{ev.ts}</span>
              <span
                className={
                  ev.kind === 'backoff'
                    ? 'text-[#FB923C]'
                    : ev.kind === 'cache' || ev.kind === 'retire'
                      ? 'text-[#10B981]'
                      : 'text-[#CBD5E1]'
                }
              >
                {ev.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
