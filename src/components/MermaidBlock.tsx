import { ArrowDown, ArrowRight, Cpu, Database, HardDrive, KeyRound, Layers, Lock, Server, ShieldCheck } from 'lucide-react';

interface MermaidBlockProps {
  chart: string;
}

function SystemOverviewDiagram() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[#1E2636] bg-[#111520] p-4">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Ingress
          </div>
          <div className="mt-1 font-display text-sm font-bold text-[#F8FAFC]">
            GitHub Actions
          </div>
          <p className="mt-1 font-mono text-[11px] text-[#94A3B8]">
            workflow_job webhook or RS256 OIDC JWT
          </p>
        </div>

        <div className="rounded-xl border border-[#F97316]/50 bg-[#F97316]/10 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#FB923C]">
              Control Plane
            </span>
            <Server className="h-4 w-4 text-[#F97316]" />
          </div>
          <div className="mt-1 font-display text-sm font-bold text-[#F8FAFC]">
            open-ci (Rust / Axum / SQLite)
          </div>
          <p className="mt-1 font-mono text-[11px] text-[#CBD5E1]">
            EC2 SigV4 · GCE REST · Single-use HMAC
          </p>
        </div>

        <div className="rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#10B981]">
              Ephemeral Compute
            </span>
            <Cpu className="h-4 w-4 text-[#10B981]" />
          </div>
          <div className="mt-1 font-display text-sm font-bold text-[#F8FAFC]">
            Spot / On-Demand VMs
          </div>
          <p className="mt-1 font-mono text-[11px] text-[#CBD5E1]">
            Zero Cloud IAM · Auto-NVMe · Outbound HTTPS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-[#1E2636] bg-[#111520] px-4 py-3">
          <HardDrive className="h-4 w-4 shrink-0 text-[#10B981]" />
          <div>
            <div className="font-mono text-xs font-semibold text-[#F8FAFC]">
              open-ci cache (Actions Cache v2 Twirp + Blob)
            </div>
            <div className="font-mono text-[11px] text-[#94A3B8]">
              Local NVMe · S3 / R2 / MinIO · Native GCS
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#1E2636] bg-[#111520] px-4 py-3">
          <Database className="h-4 w-4 shrink-0 text-[#F97316]" />
          <div>
            <div className="font-mono text-xs font-semibold text-[#F8FAFC]">
              Operator CLI · Prometheus /metrics · SSE /api/v1/events
            </div>
            <div className="font-mono text-[11px] text-[#94A3B8]">
              Private loopback or VPN + Constant-Time Bearer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HexagonalArchitectureDiagram() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#1E2636] bg-[#111520] p-4">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
          Edge Binaries &amp; Routing
        </div>
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            ['open-ci-cli', 'serve · cache · demo · validate · ctl · backup · agent bootstrap'],
            ['open-ci-aws-janitor', 'Independent CLI / AWS Lambda (provided.al2023) expiry guard'],
            ['actions/route', 'Zero-dependency TypeScript OIDC fail-closed router'],
          ].map(([name, desc]) => (
            <div key={name} className="rounded-lg border border-[#1E2636] bg-[#090B10] p-3">
              <div className="font-mono text-xs font-semibold text-[#FB923C]">{name}</div>
              <div className="mt-1 text-[11px] text-[#94A3B8]">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <ArrowDown className="h-4 w-4 text-[#64748B]" />
      </div>

      <div className="rounded-xl border border-[#1E2636] bg-[#111520] p-4">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
          Application &amp; I/O Adapters
        </div>
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['open-ci-server', 'ControlPlane, Reconciler, Axum HTTP, SSE, Prometheus'],
            ['open-ci-cache', 'Actions v2 Twirp + Azure Blob + S3/GCS/Local'],
            ['open-ci-github', 'REST Client, HMAC Webhook, OIDC RS256, Broker'],
            ['open-ci-store', 'Async Store trait + SqliteStore WAL + fs2 lock'],
          ].map(([name, desc]) => (
            <div key={name} className="rounded-lg border border-[#1E2636] bg-[#090B10] p-3">
              <div className="font-mono text-xs font-semibold text-[#F8FAFC]">{name}</div>
              <div className="mt-1 text-[11px] text-[#94A3B8]">{desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            ['open-ci-provider-aws', 'Pure-Rust EC2 SigV4 XML + STS AssumeRole / WebIdentity'],
            ['open-ci-provider-gcp', 'Compute Engine REST + maxRunDuration + IAM Impersonation'],
            ['open-ci-provider-mock', 'Deterministic fault-injecting provider (demo & tests)'],
          ].map(([name, desc]) => (
            <div key={name} className="rounded-lg border border-[#2A354B] bg-[#090B10] p-3">
              <div className="font-mono text-xs font-semibold text-[#10B981]">{name}</div>
              <div className="mt-1 text-[11px] text-[#94A3B8]">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <ArrowDown className="h-4 w-4 text-[#F97316]" />
      </div>

      <div className="rounded-xl border border-[#F97316]/50 bg-[#F97316]/10 p-4 text-center">
        <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#F8FAFC]">
          <Layers className="h-4 w-4 text-[#F97316]" />
          open-ci-core (Zero-I/O Domain Core)
        </div>
        <div className="mt-1 font-mono text-[11px] text-[#CBD5E1]">
          Typed Config · Worker State Machine · Admission Math · Placement Backoff · SecretString · Clock
        </div>
      </div>
    </div>
  );
}

function WorkerStateDiagram() {
  const states = [
    { name: 'Planned', tone: 'border-[#2A354B] text-[#CBD5E1]', note: 'UUID request_id persisted before cloud launch' },
    { name: 'Creating', tone: 'border-sky-500/40 text-sky-300', note: 'Async cloud operation (GCP)' },
    { name: 'Live', tone: 'border-[#10B981]/50 text-[#10B981] bg-[#10B981]/10', note: 'Sync receipt (AWS) or op DONE · burns 1x HMAC' },
    { name: 'Retiring', tone: 'border-[#F97316]/50 text-[#FB923C] bg-[#F97316]/10', note: 'Job done / idle or lifetime expired / draining' },
    { name: 'Gone', tone: 'border-[#1E2636] text-[#94A3B8]', note: 'Cloud VM deleted or confirmed absent' },
  ];

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
        Monotonic Worker Phase State Machine
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {states.map((st, idx) => (
          <div key={st.name} className="flex items-center gap-2">
            <div className={`rounded-xl border bg-[#090B10] px-3.5 py-2.5 ${st.tone}`}>
              <div className="font-mono text-xs font-bold">{st.name}</div>
              <div className="mt-0.5 max-w-[140px] text-[10px] leading-snug text-[#94A3B8]">
                {st.note}
              </div>
            </div>
            {idx < states.length - 1 && (
              <ArrowRight className="h-4 w-4 shrink-0 text-[#475569]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustBoundariesDiagram() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-[#F97316]/40 bg-[#F97316]/[0.06] p-4">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#FB923C]">
          <Lock className="h-4 w-4" />
          1. Untrusted Job Zone
        </div>
        <p className="mt-2 text-xs text-[#CBD5E1]">
          Ephemeral Runner VM running as non-root <code className="text-[#F8FAFC]">runner</code>
        </p>
        <ul className="mt-2.5 space-y-1 font-mono text-[11px] text-[#94A3B8]">
          <li>• Zero Cloud IAM attached</li>
          <li>• Zero inbound ports</li>
          <li>• User-data scrubbed before job</li>
          <li>• 1x HMAC bootstrap + 512B usage</li>
        </ul>
      </div>

      <div className="rounded-xl border border-[#2A354B] bg-[#111520] p-4">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#F8FAFC]">
          <ShieldCheck className="h-4 w-4 text-[#10B981]" />
          2. Public TLS Edge (Caddy)
        </div>
        <p className="mt-2 text-xs text-[#CBD5E1]">
          Strict 6-path public allowlist — blocks <code className="text-[#F8FAFC]">/api/v1/*</code> and{' '}
          <code className="text-[#F8FAFC]">/metrics</code> with 404.
        </p>
        <div className="mt-2.5 rounded-lg border border-[#1E2636] bg-[#090B10] p-2.5 font-mono text-[11px] text-[#10B981]">
          /healthz · /readyz · /v1/ingress/* · /v1/workers/*
        </div>
      </div>

      <div className="rounded-xl border border-[#10B981]/40 bg-[#10B981]/[0.06] p-4">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#10B981]">
          <KeyRound className="h-4 w-4" />
          3. Hardened Controller Host
        </div>
        <ul className="mt-2 space-y-1.5 font-mono text-[11px] text-[#CBD5E1]">
          <li>• <span className="text-[#F8FAFC]">open-ci serve</span> (User=open-ci, RO /etc/open-ci)</li>
          <li>• <span className="text-[#F8FAFC]">SQLite WAL</span> + fs2 lock (0600)</li>
          <li>• <span className="text-[#F8FAFC]">open-ci-broker</span> owns github-app.pem (0600)</li>
          <li>• <span className="text-[#F8FAFC]">open-ci cache</span> (Private VPC, Ref-Scoped)</li>
        </ul>
      </div>
    </div>
  );
}

function PyramidOfTrustDiagram() {
  const levels = [
    {
      num: 'L1',
      title: 'Codebase (API & Data Structures)',
      detail: 'Zero-I/O open-ci-core, SecretString, GitHubScope, deny_unknown_fields',
      tone: 'border-[#10B981]/50 bg-[#10B981]/10 text-[#10B981]',
    },
    {
      num: 'L2',
      title: 'Static Analysis (Lints, Types, CI)',
      detail: 'unsafe_code=forbid, unwrap/expect/panic=deny, zero #[allow(, hexagonal purity, IMDSv2/zero-IAM checks',
      tone: 'border-[#F97316]/50 bg-[#F97316]/10 text-[#FB923C]',
    },
    {
      num: 'L3',
      title: 'Verification (Empirical, Property, Formal)',
      detail: 'Compiled-binary driver (HTTP + SQLite DB), proptest invariants, SQLite WAL races, loopback wire contracts',
      tone: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    },
    {
      num: 'L4',
      title: 'Prose (AGENTS.md & Focused Skills)',
      detail: 'Minimal operating manual; only what cannot be checked mechanically',
      tone: 'border-[#2A354B] bg-[#111520] text-[#CBD5E1]',
    },
    {
      num: 'L5',
      title: 'Human Review',
      detail: 'Inspect empirical proof artifacts first, then skim diff for threat-model alignment',
      tone: 'border-[#1E2636] bg-[#090B10] text-[#94A3B8]',
    },
  ];

  return (
    <div className="space-y-2.5">
      {levels.map((lvl) => (
        <div
          key={lvl.num}
          className={`flex flex-col gap-1 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:gap-4 ${lvl.tone}`}
        >
          <span className="font-mono text-xs font-bold shrink-0">{lvl.num}</span>
          <div className="min-w-0">
            <div className="font-display text-sm font-bold text-[#F8FAFC]">
              {lvl.title}
            </div>
            <div className="font-mono text-[11px] text-[#CBD5E1]">{lvl.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MermaidBlock({ chart }: MermaidBlockProps) {
  let content;
  if (chart.includes('Hexagonal') || chart.includes('subgraph Edge')) {
    content = <HexagonalArchitectureDiagram />;
  } else if (chart.includes('stateDiagram')) {
    content = <WorkerStateDiagram />;
  } else if (chart.includes('Untrusted')) {
    content = <TrustBoundariesDiagram />;
  } else if (chart.includes('L1[')) {
    content = <PyramidOfTrustDiagram />;
  } else if (chart.includes('open-ci Control Plane')) {
    content = <SystemOverviewDiagram />;
  } else {
    content = (
      <pre className="overflow-x-auto font-mono text-xs text-[#94A3B8]">
        {chart}
      </pre>
    );
  }

  return (
    <div className="my-6 rounded-2xl border border-[#1E2636] bg-[#0B0E16] p-5">
      {content}
    </div>
  );
}
