import { Clock, DollarSign, ShieldCheck, Trash2 } from 'lucide-react';
import { MEASURED_BENCHMARKS } from '../../data/pricing';

const PROOF_STATS = [
  {
    value: '45%',
    label: 'Faster heavy test suites',
    detail: 'Measured across 20-shard TS + Playwright monorepo',
    icon: Clock,
    accent: 'text-[#F97316]',
  },
  {
    value: '87%',
    label: 'Lower CI compute spend',
    detail: 'Spot AWS/GCP VMs + burn your own cloud credits',
    icon: DollarSign,
    accent: 'text-[#10B981]',
  },
  {
    value: '0',
    label: 'Leaked VMs after runs',
    detail: 'Reconciler + maxRunDuration / AWS Lambda janitor',
    icon: Trash2,
    accent: 'text-[#10B981]',
  },
  {
    value: '0',
    label: 'Cloud IAM on workers',
    detail: 'serviceAccounts: [] · IMDSv2 required · no keys',
    icon: ShieldCheck,
    accent: 'text-[#F8FAFC]',
  },
];

export function BenchmarkStrip() {
  const maxSeconds = Math.max(...MEASURED_BENCHMARKS.map((b) => b.beforeSeconds));

  return (
    <section className="border-b border-[#1E2636] bg-[#0B0E16]/60 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 4 proof cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROOF_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#1E2636] bg-[#111520] p-5 transition hover:border-[#2A354B]"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-display text-3xl font-extrabold ${stat.accent}`}>
                    {stat.value}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E2636] bg-[#090B10]">
                    <Icon className={`h-4 w-4 ${stat.accent}`} />
                  </div>
                </div>
                <div className="mt-3 text-sm font-semibold text-[#F8FAFC]">
                  {stat.label}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
                  {stat.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Measured 20-shard monorepo benchmark */}
        <div className="mt-10 rounded-2xl border border-[#1E2636] bg-[#111520] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[#1E2636] pb-6 md:flex-row md:items-end">
            <div>
              <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#F97316]">
                Real-World Measured Benchmark
              </div>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-[#F8FAFC]">
                20-Shard TypeScript &amp; Playwright Monorepo
              </h2>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Wall-clock job duration comparing standard GitHub-hosted runners
                against <code className="text-[#F8FAFC]">open-ci</code> ephemeral
                Spot runners with auto-NVMe scratch and transparent Actions v2
                caching.
              </p>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs">
              <span className="inline-flex items-center gap-2 text-[#94A3B8]">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#2A354B]" />
                GitHub-hosted
              </span>
              <span className="inline-flex items-center gap-2 text-[#10B981]">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#10B981]" />
                open-ci Spot + NVMe
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {MEASURED_BENCHMARKS.map((row) => {
              const beforePct = (row.beforeSeconds / maxSeconds) * 100;
              const afterPct = (row.afterSeconds / maxSeconds) * 100;

              return (
                <div key={row.suite} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-[#F8FAFC]">
                        {row.suite}
                      </span>
                      <span className="rounded border border-[#1E2636] bg-[#090B10] px-2 py-0.5 font-mono text-[11px] text-[#94A3B8]">
                        {row.shards}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-[#94A3B8] line-through decoration-[#64748B]">
                        {row.beforeLabel}
                      </span>
                      <span className="font-semibold text-[#F8FAFC]">
                        {row.afterLabel}
                      </span>
                      <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-0.5 font-semibold text-[#10B981]">
                        {row.fasterPct}% faster
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#090B10]">
                      <div
                        className="h-full rounded-full bg-[#2A354B]"
                        style={{ width: `${beforePct}%` }}
                      />
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#090B10]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399]"
                        style={{ width: `${afterPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
