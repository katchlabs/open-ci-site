import { useState } from 'react';

type SimMode = 'normal' | 'stockout';

const NORMAL_SLOTS: Array<'running' | 'booting' | 'idle'> = [
  'running',
  'running',
  'running',
  'running',
  'running',
  'running',
  'running',
  'booting',
  'booting',
  'idle',
];

export function FleetVisualizer() {
  const [mode, setMode] = useState<SimMode>('normal');
  const isStockout = mode === 'stockout';

  return (
    <div className="overflow-hidden rounded-lg border border-[#E4E4DF] bg-[#FFFFFF]">
      {/* Single unified instrument header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E4DF] px-5 py-2.5">
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#555550]">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6E6E67]">
            FIG 01
          </span>
          <span className="text-[#D2D2CA]">·</span>
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full bg-[#16A34A]"
              aria-hidden="true"
            />
            <span className="font-medium text-[#111111]">Control plane</span>
          </span>
          <span className="text-[#D2D2CA]">·</span>
          <span className="tabular-nums">20 ephemeral workers</span>
          <span className="hidden text-[#D2D2CA] sm:inline">·</span>
          <span className="hidden sm:inline tabular-nums">0 cloud IAM</span>
        </div>

        <div
          className="inline-flex rounded bg-[#ECECE7] p-0.5 text-[11.5px]"
          role="tablist"
          aria-label="Fleet simulation mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isStockout}
            onClick={() => setMode('normal')}
            className={`rounded-[3px] px-2.5 py-1 font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              !isStockout
                ? 'bg-[#FFFFFF] text-[#111111] shadow-[0_1px_1px_rgba(17,17,17,0.06)]'
                : 'text-[#555550] hover:text-[#111111]'
            }`}
          >
            Normal
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isStockout}
            onClick={() => setMode('stockout')}
            className={`rounded-[3px] px-2.5 py-1 font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              isStockout
                ? 'bg-[#FFFFFF] text-[#DC2626] shadow-[0_1px_1px_rgba(17,17,17,0.06)]'
                : 'text-[#555550] hover:text-[#111111]'
            }`}
          >
            Simulate Spot stockout
          </button>
        </div>
      </div>

      {/* Architectural 4-stage schematic — top-aligned with symmetrical worker rows */}
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[2.3fr_26px_2.6fr_30px_4.8fr_26px_2.3fr] lg:gap-0">
          {/* Stage 1: GitHub Actions */}
          <div className="flex flex-col justify-between rounded border border-[#E4E4DF] bg-[#FAFAF8] p-3.5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6E6E67]">
                01 · Ingress
              </div>
              <div className="mt-1.5 text-[14px] font-medium tracking-[-0.01em] text-[#111111]">
                GitHub Actions
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t border-[#E4E4DF] pt-2.5 text-[12px] text-[#555550]">
              <div className="tabular-nums text-[#111111]">{isStockout ? "20 shards (10 rerouted)" : "20 active shards"}</div>
              <div className="text-[#6E6E67]">Webhook or RS256 OIDC</div>
            </div>
          </div>

          {/* Connector 1 -> 2 */}
          <div className="hidden lg:flex items-center justify-center" aria-hidden="true">
            <svg width="26" height="16" viewBox="0 0 26 16" fill="none">
              <line x1="0" y1="8" x2="21" y2="8" stroke="rgba(17,17,17,0.42)" strokeWidth="1" />
              <path d="M17.5 4.5L22.5 8L17.5 11.5" stroke="rgba(17,17,17,0.42)" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* Stage 2: open-ci Controller */}
          <div className="flex flex-col justify-between rounded border border-[#111111] bg-[#FFFFFF] p-3.5">
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-[#6E6E67]">
                <span>02 · Controller</span>
                <span className="text-[#111111]">Rust</span>
              </div>
              <div className="mt-1.5 text-[14px] font-medium tracking-[-0.01em] text-[#111111]">
                open-ci
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t border-[#E4E4DF] pt-2.5 text-[12px] text-[#555550]">
              <div className="text-[#111111]">SQLite WAL · 1× HMAC</div>
              <div className="text-[#6E6E67]">EC2 SigV4 &amp; GCE REST</div>
            </div>
          </div>

          {/* Connector 2 -> 3 (precision branching vector) */}
          <div className="hidden lg:flex items-center justify-center" aria-hidden="true">
            <svg width="30" height="148" viewBox="0 0 30 148" fill="none" className="h-full w-[30px]">
              <path
                d="M0 74 H11 V35 H25"
                stroke={isStockout ? '#DC2626' : 'rgba(17,17,17,0.42)'}
                strokeWidth="1"
                strokeDasharray={isStockout ? '3 3' : undefined}
              />
              <path
                d="M21.5 31.5L26.5 35L21.5 38.5"
                stroke={isStockout ? '#DC2626' : 'rgba(17,17,17,0.42)'}
                strokeWidth="1"
              />
              <path
                d="M0 74 H11 V113 H25"
                stroke={isStockout ? '#111111' : 'rgba(17,17,17,0.42)'}
                strokeWidth={isStockout ? '1.25' : '1'}
              />
              <path
                d="M21.5 109.5L26.5 113L21.5 116.5"
                stroke={isStockout ? '#111111' : 'rgba(17,17,17,0.42)'}
                strokeWidth={isStockout ? '1.25' : '1'}
              />
            </svg>
          </div>

          {/* Stage 3: Symmetrical Ephemeral Spot Worker Strips */}
          <div className="flex flex-col justify-between gap-2.5">
            {/* GCP Track */}
            <div
              className={`rounded border p-3 transition-colors duration-200 ${
                isStockout
                  ? 'border-[#FECACA] bg-[#FEF2F2]/60'
                  : 'border-[#E4E4DF] bg-[#FAFAF8]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="whitespace-nowrap font-mono text-[11.5px] font-medium text-[#111111]">
                  gcp/us-central1
                </span>
                {isStockout ? (
                  <span className="whitespace-nowrap font-mono text-[11px] font-medium text-[#DC2626] tabular-nums">
                    Backoff 90s
                  </span>
                ) : (
                  <span className="whitespace-nowrap font-mono text-[11px] text-[#555550] tabular-nums">
                    c3-standard-4
                  </span>
                )}
              </div>
              <div className="mt-2 grid grid-cols-10 gap-1.5" aria-label="GCP worker slots">
                {NORMAL_SLOTS.map((state, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-[1.5px] transition-colors duration-200 ${
                      isStockout
                        ? 'border border-dashed border-[#FCA5A5] bg-transparent'
                        : state === 'running'
                          ? 'bg-[#111111]'
                          : state === 'booting'
                            ? 'bg-[#9A9A92]'
                            : 'border border-[#B5B5AD] bg-transparent'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#6E6E67] tabular-nums">
                <span>{isStockout ? '0 active · Spot stockout' : '7 running · 2 booting · 1 idle'}</span>
                <span className="font-mono text-[10.5px]">{isStockout ? '0/10' : '10/10'}</span>
              </div>
            </div>

            {isStockout && (
              <div className="flex items-center justify-between px-0.5 font-mono text-[10.5px] text-[#DC2626]">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
                    <path
                      d="M2 1V7H14"
                      stroke="#DC2626"
                      strokeWidth="1.2"
                      strokeDasharray="2.5 2"
                    />
                    <path d="M11 4.5L14 7L11 9.5" stroke="#DC2626" strokeWidth="1.2" />
                  </svg>
                  Spilling 10 shards → aws/us-east-1c
                </span>
                <span className="tabular-nums text-[#6E6E67]">0 failed</span>
              </div>
            )}

            {/* AWS Track */}
            <div
              className={`rounded border p-3 transition-colors duration-200 ${
                isStockout
                  ? 'border-[#111111] bg-[#FFFFFF]'
                  : 'border-[#E4E4DF] bg-[#FAFAF8]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="whitespace-nowrap font-mono text-[11.5px] font-medium text-[#111111]">
                  {isStockout ? 'aws/us-east-1c' : 'aws/us-east-1'}
                </span>
                <span className="whitespace-nowrap font-mono text-[11px] text-[#555550] tabular-nums">
                  {isStockout ? 'c7a.xlarge · +10 spilled' : 'c7a.xlarge'}
                </span>
              </div>
              <div
                className="mt-2 grid gap-1.5"
                style={{
                  gridTemplateColumns: isStockout
                    ? 'repeat(20, minmax(0, 1fr))'
                    : 'repeat(10, minmax(0, 1fr))',
                }}
                aria-label="AWS worker slots"
              >
                {isStockout
                  ? Array.from({ length: 20 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 rounded-[1.5px] transition-colors duration-200 ${
                          i >= 10 ? 'bg-[#15803D]' : 'bg-[#111111]'
                        }`}
                      />
                    ))
                  : NORMAL_SLOTS.map((state, i) => (
                      <span
                        key={i}
                        className={`h-2 rounded-[1.5px] transition-colors duration-200 ${
                          state === 'running'
                            ? 'bg-[#111111]'
                            : state === 'booting'
                              ? 'bg-[#9A9A92]'
                              : 'border border-[#B5B5AD] bg-transparent'
                        }`}
                      />
                    ))}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#6E6E67] tabular-nums">
                <span>{isStockout ? '10 steady · 10 rerouted from GCP' : '7 running · 2 booting · 1 idle'}</span>
                <span className="font-mono text-[10.5px]">{isStockout ? '20/20' : '10/10'}</span>
              </div>
            </div>
          </div>

          {/* Connector 3 -> 4 */}
          <div className="hidden lg:flex items-center justify-center" aria-hidden="true">
            <svg width="26" height="16" viewBox="0 0 26 16" fill="none">
              <line x1="0" y1="8" x2="21" y2="8" stroke="rgba(17,17,17,0.42)" strokeWidth="1" />
              <path d="M17.5 4.5L22.5 8L17.5 11.5" stroke="rgba(17,17,17,0.42)" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* Stage 4: open-ci cache */}
          <div className="flex flex-col justify-between rounded border border-[#E4E4DF] bg-[#FAFAF8] p-3.5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6E6E67]">
                04 · Cache
              </div>
              <div className="mt-1.5 text-[14px] font-medium tracking-[-0.01em] text-[#111111]">
                open-ci cache
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t border-[#E4E4DF] pt-2.5 text-[12px] text-[#555550]">
              <div className="text-[#111111]">NVMe / S3 / GCS</div>
              <div className="text-[#6E6E67]">Actions v2 · ref-scoped</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ledger status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4DF] bg-[#FAFAF8] px-5 py-2.5 text-[12px]">
        <span className="text-[#555550]">
          {isStockout
            ? 'gcp/us-central1 quarantined 90s — spilled automatically to aws/us-east-1c'
            : 'Weighted 50/50 placement · outbound HTTPS only · user-data scrubbed before job'}
        </span>
        <span className="font-mono text-[11.5px] font-medium text-[#15803D] tabular-nums">
          {isStockout ? '20/20 completed · 0 failed jobs · 0 leaked VMs' : '14 running · 4 booting · 0 failed · 0 leaked VMs'}
        </span>
      </div>
    </div>
  );
}
