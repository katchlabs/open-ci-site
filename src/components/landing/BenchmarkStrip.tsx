import { MEASURED_BENCHMARKS } from '../../data/pricing';

const METRIC_CELLS = [
  { value: '−45%', label: 'wall-clock CI', detail: '4–8 vCPU Spot vs 2-vCPU baseline', highlight: true },
  { value: '−87%', label: 'per-minute compute', detail: '4-vCPU Spot vs GitHub x64', highlight: true },
  { value: '0', label: 'leaked VMs', detail: '3-layer expiry verified', highlight: false },
  { value: '0', label: 'worker cloud IAM', detail: 'serviceAccounts: [] · IMDSv2', highlight: false },
];

const SUITE_SHORT_LABELS: Record<string, string> = {
  'API Integration Tests': 'API integration',
  'Portal Integration Suite': 'Portal integration',
  'Playwright Browser E2E': 'Playwright E2E',
  'Developer API Suite': 'Developer API',
};

export function BenchmarkStrip() {
  const maxSeconds = Math.max(...MEASURED_BENCHMARKS.map((r) => r.beforeSeconds));

  return (
    <section id="benchmarks" className="scroll-mt-16 border-b border-[#E4E4DF]">
      <div className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
            02 / BENCHMARK
          </div>
          <h2 className="mt-3 font-sans text-[28px] font-medium leading-[1.12] tracking-[-0.025em] text-[#111111] sm:text-[38px]">
            Same budget, 2–4× the cores.
          </h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#555550]">
            Raw Spot pricing lets you step up from standard 2-vCPU GitHub-hosted
            runners to 4–8 vCPU machines with local NVMe and in-region cache —
            cutting wall-clock times across a sharded monorepo while spending less.
          </p>
        </div>

        {/* 4-column hairline-ruled metric strip */}
        <div className="mt-10 grid grid-cols-2 divide-y divide-[#E4E4DF] overflow-hidden rounded-lg border border-[#E4E4DF] bg-[#FFFFFF] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {METRIC_CELLS.map((cell) => (
            <div key={cell.label} className="p-5 sm:p-6">
              <div
                className={`font-mono text-[32px] font-medium leading-none tracking-[-0.03em] tabular-nums sm:text-[36px] ${
                  cell.highlight ? 'text-[#15803D]' : 'text-[#111111]'
                }`}
              >
                {cell.value}
              </div>
              <div className="mt-2.5 text-[13px] font-medium text-[#111111]">
                {cell.label}
              </div>
              <div className="mt-1 text-[12px] text-[#6E6E67]">
                {cell.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Measured suite comparison sheet */}
        <div className="mt-6 overflow-hidden rounded-lg border border-[#E4E4DF] bg-[#FFFFFF]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E4DF] bg-[#FAFAF8] px-6 py-3 text-[12px]">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
              TYPESCRIPT &amp; PLAYWRIGHT MONOREPO · WALL-CLOCK DURATION
            </span>
            <div className="flex items-center gap-4 text-[12px] text-[#555550]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[1px] bg-[#B5B5AD]" />
                GitHub-hosted 2-vCPU baseline
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[1px] bg-[#111111]" />
                open-ci Spot (4–8 vCPU)
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#E4E4DF]">
            {MEASURED_BENCHMARKS.map((row) => {
              const beforePct = Math.round((row.beforeSeconds / maxSeconds) * 100);
              const afterPct = Math.round((row.afterSeconds / maxSeconds) * 100);
              const shortName = SUITE_SHORT_LABELS[row.suite] ?? row.suite;
              return (
                <div
                  key={row.suite}
                  className="grid grid-cols-1 items-center gap-4 px-6 py-4.5 md:grid-cols-12"
                >
                  <div className="md:col-span-4">
                    <div className="text-[14px] font-medium text-[#111111]">
                      {shortName}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#6E6E67]">
                      {row.shards}
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-5">
                    <div className="h-2 w-full overflow-hidden rounded-[2px] bg-[#ECECE7]">
                      <div
                        className="h-full rounded-[2px] bg-[#B5B5AD]"
                        style={{ width: `${beforePct}%` }}
                      />
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-[2px] bg-[#ECECE7]">
                      <div
                        className="h-full rounded-[2px] bg-[#111111]"
                        style={{ width: `${afterPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between gap-3 font-mono text-[12px] tabular-nums md:col-span-3 md:justify-end">
                    <span className="text-[#6E6E67]">
                      {row.beforeLabel} <span className="mx-0.5 text-[#B5B5AD]">→</span>{' '}
                      <span className="font-medium text-[#111111]">{row.afterLabel}</span>
                    </span>
                    <span className="w-12 text-right font-medium text-[#15803D]">
                      −{row.fasterPct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#E4E4DF] bg-[#FAFAF8] px-6 py-2.5 text-[11.5px] text-[#6E6E67]">
            Measured wall-clock CI timings on a production TypeScript &amp; Playwright monorepo (gcp/us-central1, warm in-region Actions v2 cache + local NVMe scratch).
          </div>
        </div>
      </div>
    </section>
  );
}
