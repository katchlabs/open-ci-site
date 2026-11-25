import { ArrowDown, ArrowRight } from 'lucide-react';

interface MermaidBlockProps {
  chart: string;
}

function SystemOverviewDiagram() {
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6B7280]">
        FIG · SYSTEM OVERVIEW
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded border border-[#E5E7EB] bg-[#FFFFFF] p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6B7280]">
            01 · Ingress
          </div>
          <div className="mt-1.5 text-[14px] font-medium text-[#0A0A0A]">
            GitHub Actions
          </div>
          <p className="mt-1.5 text-[12px] text-[#4B5563]">
            <code className="font-mono text-[11.5px] text-[#0A0A0A]">workflow_job</code> webhook or RS256 OIDC JWT
          </p>
        </div>

        <div className="rounded border border-[#0A0A0A] bg-[#FFFFFF] p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6B7280]">
            02 · Control Plane
          </div>
          <div className="mt-1.5 text-[14px] font-medium text-[#0A0A0A]">
            open-ci (Rust / Axum / SQLite)
          </div>
          <p className="mt-1.5 text-[12px] text-[#4B5563]">
            EC2 SigV4 · GCE REST · Single-use HMAC
          </p>
        </div>

        <div className="rounded border border-[#E5E7EB] bg-[#FFFFFF] p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6B7280]">
            03 · Ephemeral Compute
          </div>
          <div className="mt-1.5 text-[14px] font-medium text-[#0A0A0A]">
            Spot / On-Demand VMs
          </div>
          <p className="mt-1.5 text-[12px] text-[#4B5563]">
            Zero Cloud IAM · Auto-NVMe · Outbound HTTPS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3">
          <div className="font-mono text-[12px] font-medium text-[#0A0A0A]">
            open-ci cache (Actions v2 Twirp + Blob)
          </div>
          <div className="mt-0.5 text-[12px] text-[#4B5563]">
            Local NVMe · S3 / R2 / MinIO · Native GCS
          </div>
        </div>
        <div className="rounded border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3">
          <div className="font-mono text-[12px] font-medium text-[#0A0A0A]">
            CLI · Prometheus /metrics · SSE /api/v1/events
          </div>
          <div className="mt-0.5 text-[12px] text-[#4B5563]">
            Private loopback or VPN + Constant-Time Bearer
          </div>
        </div>
      </div>
    </div>
  );
}

function CrateLayerTable({
  label,
  rows,
}: {
  label: string;
  rows: Array<[string, string]>;
}) {
  return (
    <div className="overflow-hidden rounded border border-[#E5E7EB] bg-[#FFFFFF]">
      <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6B7280]">
        {label}
      </div>
      <div className="divide-y divide-[#E5E7EB]">
        {rows.map(([name, desc]) => (
          <div
            key={name}
            className="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-[164px_1fr] sm:items-baseline sm:gap-4"
          >
            <div className="whitespace-nowrap font-mono text-[12px] font-medium text-[#0A0A0A]">
              {name}
            </div>
            <div className="text-[12.5px] leading-snug text-pretty text-[#4B5563]">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HexagonalArchitectureDiagram() {
  const coreModules = [
    'Typed Config',
    'Worker State Machine',
    'Admission Math',
    'Placement Backoff',
    'SecretString',
    'Clock',
  ];

  return (
    <div className="space-y-2.5">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6B7280]">
        FIG · HEXAGONAL RUST WORKSPACE
      </div>

      <CrateLayerTable
        label="01 · Edge Binaries & Routing"
        rows={[
          ['open-ci-cli', 'serve · cache · demo · validate · ctl · backup · agent bootstrap'],
          ['open-ci-aws-janitor', 'Independent CLI / AWS Lambda (provided.al2023) expiry guard'],
          ['actions/route', 'Zero-dependency TypeScript OIDC fail-closed router'],
        ]}
      />

      <div className="flex justify-center py-0.5">
        <ArrowDown className="h-3.5 w-3.5 text-[#6B7280]" />
      </div>

      <CrateLayerTable
        label="02 · Application & I/O Adapters"
        rows={[
          ['open-ci-server', 'ControlPlane, Reconciler, Axum HTTP, SSE, Prometheus'],
          ['open-ci-cache', 'Actions v2 Twirp + Azure Blob + S3 / GCS / Local'],
          ['open-ci-github', 'REST Client, HMAC Webhook, OIDC RS256, Credential Broker'],
          ['open-ci-store', 'Async Store trait + SqliteStore WAL + fs2 file lock'],
        ]}
      />

      <div className="flex justify-center py-0.5">
        <ArrowDown className="h-3.5 w-3.5 text-[#6B7280]" />
      </div>

      <CrateLayerTable
        label="03 · Cloud Compute Providers"
        rows={[
          ['open-ci-provider-aws', 'Pure-Rust EC2 SigV4 XML + STS AssumeRole / WebIdentity'],
          ['open-ci-provider-gcp', 'Compute Engine REST + maxRunDuration + IAM Impersonation'],
          ['open-ci-provider-mock', 'Deterministic fault-injecting provider for demo & tests'],
        ]}
      />

      <div className="flex justify-center py-0.5">
        <ArrowDown className="h-3.5 w-3.5 text-[#0A0A0A]" />
      </div>

      <div className="rounded border border-[#0A0A0A] bg-[#FFFFFF] p-4 text-left">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="whitespace-nowrap font-mono text-[12.5px] font-medium text-[#0A0A0A]">
            open-ci-core
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6B7280]">
            Zero-I/O Domain Core
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {coreModules.map((mod) => (
            <span
              key={mod}
              className="rounded border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 font-mono text-[11px] text-[#4B5563]"
            >
              {mod}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkerStateDiagram() {
  const states = [
    { name: 'Planned', emphasized: false, accent: false, note: 'UUID request_id persisted before launch' },
    { name: 'Creating', emphasized: false, accent: false, note: 'Async cloud operation (GCP)' },
    { name: 'Live', emphasized: true, accent: true, note: 'Sync receipt or op DONE · burns 1× HMAC' },
    { name: 'Retiring', emphasized: false, accent: false, note: 'Job done / idle / lifetime expired' },
    { name: 'Gone', emphasized: false, accent: false, note: 'Cloud VM deleted or confirmed absent' },
  ];

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6B7280]">
        FIG · MONOTONIC WORKER PHASE STATE MACHINE
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {states.map((st, idx) => (
          <div key={st.name} className="flex items-center gap-2">
            <div
              className={`rounded border bg-[#FFFFFF] px-3 py-2.5 ${
                st.emphasized ? 'border-[#0A0A0A]' : 'border-[#E5E7EB]'
              }`}
            >
              <div
                className={`font-mono text-[12px] font-medium ${
                  st.accent ? 'text-[#15803D]' : 'text-[#0A0A0A]'
                }`}
              >
                {st.name}
              </div>
              <div className="mt-0.5 max-w-[132px] text-[11px] leading-snug text-[#4B5563]">
                {st.note}
              </div>
            </div>
            {idx < states.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#6B7280]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustBoundariesDiagram() {
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6B7280]">
        FIG · SECURITY TRUST BOUNDARIES
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded border border-[#E5E7EB] bg-[#FFFFFF] p-4">
          <div className="font-mono text-[11px] font-medium text-[#0A0A0A]">
            01 · Untrusted Job Zone
          </div>
          <p className="mt-1.5 text-[12px] text-[#4B5563]">
            Ephemeral Runner VM running as non-root{' '}
            <code className="font-mono text-[#0A0A0A]">runner</code>
          </p>
          <ul className="mt-2.5 space-y-1 text-[12px] text-[#4B5563]">
            <li>· Zero Cloud IAM attached</li>
            <li>· Zero inbound ports</li>
            <li>· User-data scrubbed before job</li>
            <li>· 1× HMAC bootstrap + 512B usage</li>
          </ul>
        </div>

        <div className="rounded border border-[#E5E7EB] bg-[#FFFFFF] p-4">
          <div className="font-mono text-[11px] font-medium text-[#0A0A0A]">
            02 · Public TLS Edge (Caddy)
          </div>
          <p className="mt-1.5 text-[12px] text-[#4B5563]">
            Strict 6-path allowlist — blocks{' '}
            <code className="font-mono text-[#0A0A0A]">/api/v1/*</code> and{' '}
            <code className="font-mono text-[#0A0A0A]">/metrics</code> with 404.
          </p>
          <div className="mt-2.5 rounded border border-[#E5E7EB] bg-[#F9FAFB] p-2 font-mono text-[10.5px] text-[#0A0A0A]">
            /healthz · /readyz · /v1/ingress/* · /v1/workers/*
          </div>
        </div>

        <div className="rounded border border-[#0A0A0A] bg-[#FFFFFF] p-4">
          <div className="font-mono text-[11px] font-medium text-[#0A0A0A]">
            03 · Hardened Controller Host
          </div>
          <ul className="mt-2 space-y-1.5 text-[12px] text-[#4B5563]">
            <li>· open-ci serve (RO /etc/open-ci)</li>
            <li>· SQLite WAL + fs2 lock (0600)</li>
            <li>· open-ci-broker owns github-app.pem</li>
            <li>· open-ci cache (Private VPC)</li>
          </ul>
        </div>
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
      verified: true,
    },
    {
      num: 'L2',
      title: 'Static Analysis (Lints, Types, CI)',
      detail: 'unsafe_code=forbid, unwrap/expect/panic=deny, zero #[allow(, hexagonal purity, IMDSv2/zero-IAM checks',
      verified: true,
    },
    {
      num: 'L3',
      title: 'Verification (Empirical, Property, Formal)',
      detail: 'Compiled-binary driver (HTTP + SQLite DB), proptest invariants, SQLite WAL races, loopback wire contracts',
      verified: true,
    },
    {
      num: 'L4',
      title: 'Prose (AGENTS.md & Focused Skills)',
      detail: 'Minimal operating manual; only what cannot be checked mechanically',
      verified: false,
    },
    {
      num: 'L5',
      title: 'Human Review',
      detail: 'Inspect empirical proof artifacts first, then skim diff for threat-model alignment',
      verified: false,
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6B7280]">
        FIG · PYRAMID OF TRUST
      </div>
      <div className="divide-y divide-[#E5E7EB] overflow-hidden rounded border border-[#E5E7EB] bg-[#FFFFFF]">
        {levels.map((lvl) => (
          <div
            key={lvl.num}
            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <span
              className={`w-8 shrink-0 font-mono text-[11px] font-medium ${
                lvl.verified ? 'text-[#15803D]' : 'text-[#6B7280]'
              }`}
            >
              {lvl.num}
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-[#0A0A0A]">
                {lvl.title}
              </div>
              <div className="mt-0.5 text-[12px] text-[#4B5563]">
                {lvl.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
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
      <pre className="overflow-x-auto font-mono text-xs text-[#4B5563]">
        {chart}
      </pre>
    );
  }

  return (
    <div className="my-6 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-5">
      {content}
    </div>
  );
}
