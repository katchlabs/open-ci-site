import { useMemo, useState } from 'react';
import {
  CALCULATOR_PRESETS,
  CLOUD_PROFILES,
  calculateCosts,
  formatMinutes,
  formatUsd,
  type CloudProfileId,
  type RunnerVcpu,
} from '../../data/pricing';

const VCPU_OPTIONS: RunnerVcpu[] = [4, 8, 16];
const CLOUD_OPTIONS: { id: CloudProfileId; label: string }[] = [
  { id: 'gcp-x64', label: 'GCP Spot x64' },
  { id: 'aws-x64', label: 'AWS Spot x64' },
  { id: 'aws-arm64', label: 'AWS Graviton ARM64' },
];

const PRESET_LABELS: Record<string, { name: string; meta: string }> = {
  startup: { name: 'Startup', meta: '10 devs' },
  growth: { name: 'Growth', meta: '40 devs' },
  monorepo: { name: 'Scale', meta: '150 devs' },
};

export function SavingsCalculator() {
  const defaultPreset = CALCULATOR_PRESETS[1];
  const [activePresetId, setActivePresetId] = useState<string | null>(defaultPreset.id);
  const [monthlyMinutes, setMonthlyMinutes] = useState<number>(defaultPreset.monthlyMinutes);
  const [vcpu, setVcpu] = useState<RunnerVcpu>(defaultPreset.vcpu);
  const [cloudProfile, setCloudProfile] = useState<CloudProfileId>(defaultPreset.cloudProfile);
  const [speedupPercent, setSpeedupPercent] = useState<number>(defaultPreset.speedupPercent);

  const costs = useMemo(
    () => calculateCosts(monthlyMinutes, vcpu, cloudProfile, speedupPercent),
    [monthlyMinutes, vcpu, cloudProfile, speedupPercent]
  );

  const applyPreset = (presetId: string) => {
    const preset = CALCULATOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setMonthlyMinutes(preset.monthlyMinutes);
    setVcpu(preset.vcpu);
    setCloudProfile(preset.cloudProfile);
    setSpeedupPercent(preset.speedupPercent);
  };

  const githubAnnual = costs.githubMonthly * 12;
  const saasAnnual = costs.managedSaasMonthly * 12;
  const openCiAnnual = costs.openCiMonthly * 12;
  const saasDeltaAnnual = Math.max(0, githubAnnual - saasAnnual);

  const maxAnnual = Math.max(githubAnnual, saasAnnual, openCiAnnual, 1);
  const githubWidth = Math.max(4, Math.round((githubAnnual / maxAnnual) * 100));
  const saasWidth = Math.max(4, Math.round((saasAnnual / maxAnnual) * 100));
  const openCiWidth = Math.max(3, Math.round((openCiAnnual / maxAnnual) * 100));

  const activeProfile = CLOUD_PROFILES[cloudProfile];

  return (
    <section id="savings" className="scroll-mt-16 border-b border-[#E4E4DF]">
      <div className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
            01 / SAVINGS
          </div>
          <h2 className="mt-3 font-sans text-[28px] font-medium leading-[1.12] tracking-[-0.025em] text-[#111111] sm:text-[38px]">
            What your CI bill actually costs.
          </h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#555550]">
            Compare published GitHub Actions and managed runner SaaS rates
            against raw AWS and GCP Spot compute plus one control-plane VM.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-lg border border-[#E4E4DF] bg-[#FFFFFF]">
          <div className="grid grid-cols-1 divide-y divide-[#E4E4DF] lg:grid-cols-12 lg:divide-x lg:divide-y-0">
            {/* Left: Inputs (5 cols) */}
            <div className="space-y-5 bg-[#FFFFFF] p-6 sm:p-7 lg:col-span-5">
              {/* Presets */}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
                  Team profile
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 rounded bg-[#ECECE7] p-1">
                  {CALCULATOR_PRESETS.map((preset) => {
                    const meta = PRESET_LABELS[preset.id];
                    const selected = activePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset.id)}
                        className={`rounded-[3px] px-2.5 py-1.5 text-left transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                          selected
                            ? 'bg-[#FFFFFF] text-[#111111] shadow-[0_1px_1px_rgba(17,17,17,0.06)]'
                            : 'text-[#555550] hover:text-[#111111]'
                        }`}
                      >
                        <div className="text-[12.5px] font-medium leading-tight">
                          {meta?.name ?? preset.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#6E6E67]">
                          {meta?.meta}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly minutes slider */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor="monthly-minutes-slider"
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]"
                  >
                    Monthly runner minutes
                  </label>
                  <span className="font-mono text-[13px] font-medium text-[#111111] tabular-nums">
                    {monthlyMinutes.toLocaleString('en-US')} min
                  </span>
                </div>
                <input
                  id="monthly-minutes-slider"
                  type="range"
                  min={10_000}
                  max={1_000_000}
                  step={10_000}
                  value={monthlyMinutes}
                  onChange={(e) => {
                    setActivePresetId(null);
                    setMonthlyMinutes(Number(e.target.value));
                  }}
                  className="ledger-slider mt-2.5 w-full"
                />
                <div className="mt-1 flex justify-between font-mono text-[11px] text-[#6E6E67] tabular-nums">
                  <span>10k</span>
                  <span>250k</span>
                  <span>500k</span>
                  <span>1M</span>
                </div>
              </div>

              {/* vCPU segmented picker */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
                    Runner size
                  </span>
                  <span className="font-mono text-[11.5px] text-[#555550] tabular-nums">
                    {costs.instanceName} · {costs.memoryGiB} GiB
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 rounded bg-[#ECECE7] p-1">
                  {VCPU_OPTIONS.map((size) => {
                    const selected = vcpu === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setActivePresetId(null);
                          setVcpu(size);
                        }}
                        className={`rounded-[3px] py-1.5 font-mono text-[12px] transition-all duration-150 active:scale-[0.98] cursor-pointer tabular-nums ${
                          selected
                            ? 'bg-[#FFFFFF] font-medium text-[#111111] shadow-[0_1px_1px_rgba(17,17,17,0.06)]'
                            : 'text-[#555550] hover:text-[#111111]'
                        }`}
                      >
                        {size} vCPU
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cloud profile selector */}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
                  Cloud &amp; architecture
                </div>
                <div className="mt-2 space-y-1.5">
                  {CLOUD_OPTIONS.map((opt) => {
                    const selected = cloudProfile === opt.id;
                    const inst = CLOUD_PROFILES[opt.id].instances[vcpu];
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setActivePresetId(null);
                          setCloudProfile(opt.id);
                        }}
                        className={`flex w-full items-center justify-between rounded border px-3 py-1.5 text-left transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                          selected
                            ? 'border-[#111111] bg-[#FAFAF8] text-[#111111]'
                            : 'border-[#E4E4DF] bg-[#FFFFFF] text-[#555550] hover:border-[#D2D2CA] hover:text-[#111111]'
                        }`}
                      >
                        <span className="text-[12.5px] font-medium">{opt.label}</span>
                        <span className="font-mono text-[11.5px] text-[#6E6E67] tabular-nums">
                          ${inst.spotHourlyUsd.toFixed(3)}/hr
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional speedup slider */}
              <div className="border-t border-[#E4E4DF] pt-4">
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor="speedup-slider"
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]"
                  >
                    NVMe + cache speedup
                  </label>
                  <span className="font-mono text-[12px] text-[#111111] tabular-nums">
                    {speedupPercent === 0 ? '0% (baseline)' : `−${speedupPercent}% runtime`}
                  </span>
                </div>
                <input
                  id="speedup-slider"
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={speedupPercent}
                  onChange={(e) => {
                    setActivePresetId(null);
                    setSpeedupPercent(Number(e.target.value));
                  }}
                  className="ledger-slider mt-2.5 w-full"
                />
              </div>
            </div>

            {/* Right: Architectural Cost Ledger (7 cols) */}
            <div className="flex flex-col justify-between gap-6 p-6 sm:p-7 lg:col-span-7">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
                  <span>ANNUAL SAVINGS LEDGER</span>
                  <span className="tabular-nums">
                    {activeProfile.provider} · {activeProfile.arch.toUpperCase()} · {formatMinutes(costs.effectiveOpenCiMinutes)} MIN/MO
                  </span>
                </div>

                {/* Primary savings figure */}
                <div className="mt-4 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
                  <span className="font-mono text-[44px] font-medium leading-none tracking-[-0.04em] text-[#111111] tabular-nums sm:text-[54px]">
                    {formatUsd(costs.savingsVsGithubAnnual)}
                  </span>
                  <span className="font-mono text-[14px] text-[#6E6E67]">
                    / yr saved vs GitHub
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] tabular-nums">
                  <span className="font-medium text-[#15803D]">
                    {costs.savingsVsGithubPct}% lower than GitHub Actions
                  </span>
                  <span className="text-[#D2D2CA]">·</span>
                  <span className="text-[#555550]">
                    {costs.savingsVsSaasPct}% lower than managed SaaS ({formatUsd(costs.savingsVsSaasAnnual)}/yr)
                  </span>
                </div>

                {/* Annualized comparison ledger with aligned Δ column */}
                <div className="mt-7">
                  <div className="mb-3 grid grid-cols-[1fr_auto_auto] gap-4 border-b border-[#E4E4DF] pb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6E6E67]">
                    <span>Provider</span>
                    <span className="w-24 text-right">Annual</span>
                    <span className="w-28 text-right">Δ vs GitHub</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 text-[13px]">
                        <span className="text-[#555550]">
                          GitHub Actions{' '}
                          <span className="font-mono text-[11.5px] text-[#6E6E67] tabular-nums">
                            (${costs.githubRatePerMin.toFixed(3)}/min)
                          </span>
                        </span>
                        <span className="w-24 text-right font-mono font-medium text-[#111111] tabular-nums">
                          {formatUsd(githubAnnual)}
                        </span>
                        <span className="w-28 text-right font-mono text-[12px] text-[#6E6E67] tabular-nums">
                          Baseline
                        </span>
                      </div>
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-[2px] bg-[#ECECE7]">
                        <div
                          className="h-full rounded-[2px] bg-[#C4C4BC] transition-all duration-200"
                          style={{ width: `${githubWidth}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 text-[13px]">
                        <span className="text-[#555550]">
                          Managed runner SaaS{' '}
                          <span className="font-mono text-[11.5px] text-[#6E6E67] tabular-nums">
                            (${costs.managedSaasRatePerMin.toFixed(3)}/min)
                          </span>
                        </span>
                        <span className="w-24 text-right font-mono font-medium text-[#111111] tabular-nums">
                          {formatUsd(saasAnnual)}
                        </span>
                        <span className="w-28 text-right font-mono text-[12px] text-[#555550] tabular-nums">
                          −{formatUsd(saasDeltaAnnual)}
                        </span>
                      </div>
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-[2px] bg-[#ECECE7]">
                        <div
                          className="h-full rounded-[2px] bg-[#C4C4BC] transition-all duration-200"
                          style={{ width: `${saasWidth}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 text-[13px]">
                        <span className="font-medium text-[#111111]">
                          open-ci{' '}
                          <span className="font-mono text-[11.5px] font-normal text-[#6E6E67] tabular-nums">
                            (${costs.openCiAllInRatePerMin.toFixed(4)}/min incl. disk + $15/mo VM)
                          </span>
                        </span>
                        <span className="w-24 text-right font-mono font-medium text-[#111111] tabular-nums">
                          {formatUsd(openCiAnnual)}
                        </span>
                        <span className="w-28 text-right font-mono text-[12px] font-medium text-[#15803D] tabular-nums">
                          −{formatUsd(costs.savingsVsGithubAnnual)}
                        </span>
                      </div>
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-[2px] bg-[#ECECE7]">
                        <div
                          className="h-full rounded-[2px] bg-[#111111] transition-all duration-200"
                          style={{ width: `${openCiWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tight monthly line-item breakdown */}
              <div className="border-t border-[#E4E4DF] pt-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 tabular-nums">
                  <div>
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#6E6E67]">
                      Monthly open-ci bill
                    </div>
                    <div className="mt-1 font-mono text-[14px] font-medium text-[#111111]">
                      {formatUsd(costs.openCiMonthly)}/mo
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-[#6E6E67]">
                      vs {formatUsd(costs.githubMonthly)}/mo on GitHub
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#6E6E67]">
                      Spot compute + disks
                    </div>
                    <div className="mt-1 font-mono text-[14px] font-medium text-[#111111]">
                      {formatUsd(costs.openCiComputeMonthly)}/mo
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-[#6E6E67]">
                      + ~{formatUsd(costs.controlPlaneMonthly)}/mo controller VM
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#6E6E67]">
                      Markup &amp; credits
                    </div>
                    <div className="mt-1 font-mono text-[14px] font-medium text-[#15803D]">
                      0% markup
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-[#6E6E67]">
                      Burns AWS/GCP credits
                    </div>
                  </div>
                </div>
                <p className="mt-4 border-t border-[#E4E4DF] pt-3 text-[11.5px] text-[#6E6E67]">
                  Includes raw Spot compute, ephemeral boot disks, and one ~$15/mo controller VM. Zero per-seat fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
