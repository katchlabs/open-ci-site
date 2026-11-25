import { useMemo, useState } from 'react';
import { Calculator, Info, Sparkles, TrendingDown } from 'lucide-react';
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
const CLOUD_OPTIONS: CloudProfileId[] = ['gcp-x64', 'aws-x64', 'aws-arm64'];

export function SavingsCalculator() {
  const [activePreset, setActivePreset] = useState<string>('growth');
  const [monthlyMinutes, setMonthlyMinutes] = useState<number>(200_000);
  const [vcpu, setVcpu] = useState<RunnerVcpu>(4);
  const [cloudProfile, setCloudProfile] = useState<CloudProfileId>('gcp-x64');
  const [speedupPercent, setSpeedupPercent] = useState<number>(0);

  const applyPreset = (presetId: string) => {
    const preset = CALCULATOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePreset(preset.id);
    setMonthlyMinutes(preset.monthlyMinutes);
    setVcpu(preset.vcpu);
    setCloudProfile(preset.cloudProfile);
    setSpeedupPercent(preset.speedupPercent);
  };

  const result = useMemo(
    () => calculateCosts(monthlyMinutes, vcpu, cloudProfile, speedupPercent),
    [monthlyMinutes, vcpu, cloudProfile, speedupPercent]
  );

  const maxCost = Math.max(result.githubMonthly, result.managedSaasMonthly, result.openCiMonthly, 1);

  return (
    <section
      id="savings"
      className="relative scroll-mt-20 border-b border-[#1E2636] py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-radial-emerald opacity-55" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#10B981]">
            <Calculator className="h-3.5 w-3.5" />
            Interactive CI Savings Calculator
          </div>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-[#F8FAFC] sm:text-4xl">
            Stop paying 5×–8× markup on cloud compute.
          </h2>
          <p className="mt-3 text-base text-[#94A3B8]">
            Compare verified 2026 per-minute rates for GitHub Actions and
            managed third-party runner SaaS against running{' '}
            <code className="text-[#F8FAFC]">open-ci</code> directly on Spot
            instances in your own AWS or GCP account.
          </p>
        </div>

        {/* Preset pills */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CALCULATOR_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            const preview = calculateCosts(
              preset.monthlyMinutes,
              preset.vcpu,
              preset.cloudProfile,
              0
            );
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition cursor-pointer ${
                  isSelected
                    ? 'border-[#F97316] bg-[#F97316]/10 shadow-lg shadow-[#F97316]/5'
                    : 'border-[#1E2636] bg-[#111520] hover:border-[#2A354B]'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-display text-sm font-bold text-[#F8FAFC]">
                    {preset.name}
                  </span>
                  <span className="rounded-full bg-[#10B981]/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#10B981]">
                    Save {preview.savingsVsGithubPct}%
                  </span>
                </div>
                <span className="mt-1 font-mono text-xs text-[#94A3B8]">
                  {preset.subtitle}
                </span>
                <span className="mt-2 font-mono text-xs text-[#CBD5E1]">
                  {formatUsd(preview.githubMonthly)} →{' '}
                  <strong className="text-[#10B981]">
                    {formatUsd(preview.openCiMonthly)}/mo
                  </strong>
                </span>
              </button>
            );
          })}
        </div>

        {/* Calculator Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Controls */}
          <div className="space-y-6 rounded-2xl border border-[#1E2636] bg-[#111520] p-6 lg:col-span-5">
            {/* Monthly minutes slider */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="minutes-slider"
                  className="text-sm font-semibold text-[#F8FAFC]"
                >
                  Monthly Runner Minutes
                </label>
                <span className="rounded-lg border border-[#1E2636] bg-[#090B10] px-2.5 py-1 font-mono text-sm font-bold text-[#F97316]">
                  {monthlyMinutes.toLocaleString()} min
                </span>
              </div>
              <input
                id="minutes-slider"
                type="range"
                min={10_000}
                max={1_000_000}
                step={10_000}
                value={monthlyMinutes}
                onChange={(e) => {
                  setActivePreset('custom');
                  setMonthlyMinutes(Number(e.target.value));
                }}
                className="forge-slider mt-3 w-full"
              />
              <div className="mt-1.5 flex justify-between font-mono text-[11px] text-[#64748B]">
                <span>10k min</span>
                <span>200k min</span>
                <span>500k min</span>
                <span>1M min</span>
              </div>
            </div>

            {/* Runner Size */}
            <div>
              <div className="text-sm font-semibold text-[#F8FAFC]">
                Runner Size
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {VCPU_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setActivePreset('custom');
                      setVcpu(size);
                    }}
                    className={`rounded-xl border px-3 py-2.5 font-mono text-xs font-semibold transition cursor-pointer ${
                      vcpu === size
                        ? 'border-[#F97316] bg-[#F97316]/15 text-[#F8FAFC]'
                        : 'border-[#1E2636] bg-[#090B10] text-[#94A3B8] hover:border-[#2A354B] hover:text-[#F8FAFC]'
                    }`}
                  >
                    <div>{size} vCPU</div>
                    <div className="mt-0.5 text-[10px] font-normal text-[#64748B]">
                      {CLOUD_PROFILES[cloudProfile].instances[size].memoryGiB} GiB RAM
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cloud & Architecture */}
            <div>
              <div className="text-sm font-semibold text-[#F8FAFC]">
                Your Cloud &amp; Architecture
              </div>
              <div className="mt-2.5 space-y-2">
                {CLOUD_OPTIONS.map((profileId) => {
                  const prof = CLOUD_PROFILES[profileId];
                  const inst = prof.instances[vcpu];
                  const selected = cloudProfile === profileId;
                  return (
                    <button
                      key={profileId}
                      type="button"
                      onClick={() => {
                        setActivePreset('custom');
                        setCloudProfile(profileId);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition cursor-pointer ${
                        selected
                          ? 'border-[#F97316] bg-[#F97316]/12 text-[#F8FAFC]'
                          : 'border-[#1E2636] bg-[#090B10] text-[#94A3B8] hover:border-[#2A354B] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{prof.label}</div>
                        <div className="font-mono text-[11px] text-[#64748B]">
                          {inst.name} · {vcpu} vCPU / {inst.memoryGiB} GiB
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#10B981]">
                        ~${inst.spotHourlyUsd.toFixed(3)}/hr
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Speedup Multiplier */}
            <div className="rounded-xl border border-[#1E2636] bg-[#090B10] p-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="speedup-slider"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F8FAFC]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#F97316]" />
                  NVMe + Cache Speedup Factor
                </label>
                <span className="font-mono text-xs font-bold text-[#10B981]">
                  {speedupPercent === 0 ? 'Off (1.0× raw)' : `${speedupPercent}% faster`}
                </span>
              </div>
              <input
                id="speedup-slider"
                type="range"
                min={0}
                max={45}
                step={5}
                value={speedupPercent}
                onChange={(e) => {
                  setActivePreset('custom');
                  setSpeedupPercent(Number(e.target.value));
                }}
                className="forge-slider mt-3 w-full"
              />
              <p className="mt-2 text-[11px] leading-relaxed text-[#64748B]">
                Optional: faster NVMe + local Actions v2 cache runners finish jobs
                20–45% sooner, billing even fewer minutes. Set to{' '}
                <span className="font-mono text-[#94A3B8]">0%</span> for pure
                apple-to-apple per-minute pricing.
              </p>
            </div>
          </div>

          {/* Results & Visual Comparison */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#1E2636] bg-[#111520] p-6 lg:col-span-7">
            <div>
              {/* Big Savings Banner */}
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#10B981]/30 bg-[#10B981]/[0.07] p-5 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#10B981]">
                    <TrendingDown className="h-3.5 w-3.5" />
                    Annual Savings vs GitHub Actions
                  </div>
                  <div className="mt-1.5 font-display text-4xl font-extrabold text-[#F8FAFC]">
                    {formatUsd(result.savingsVsGithubAnnual)}
                    <span className="text-lg font-medium text-[#94A3B8]">/yr</span>
                  </div>
                  <div className="mt-1 font-mono text-xs text-[#10B981]">
                    {formatUsd(result.savingsVsGithubMonthly)}/mo saved ·{' '}
                    <strong>{result.savingsVsGithubPct}% cheaper</strong>
                  </div>
                </div>

                <div className="border-t border-[#10B981]/20 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                  <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                    Savings vs Managed Runner SaaS
                  </div>
                  <div className="mt-1.5 font-display text-3xl font-extrabold text-[#F8FAFC]">
                    {formatUsd(result.savingsVsSaasAnnual)}
                    <span className="text-base font-medium text-[#94A3B8]">/yr</span>
                  </div>
                  <div className="mt-1 font-mono text-xs text-[#CBD5E1]">
                    {formatUsd(result.savingsVsSaasMonthly)}/mo saved ·{' '}
                    <span className="text-[#10B981] font-semibold">
                      {result.savingsVsSaasPct}% cheaper
                    </span>
                  </div>
                </div>
              </div>

              {/* Animated Horizontal Bar Comparison */}
              <div className="mt-7 space-y-5">
                {/* GitHub Actions */}
                <div>
                  <div className="flex items-baseline justify-between text-sm">
                    <div>
                      <span className="font-semibold text-[#F8FAFC]">
                        GitHub Actions
                      </span>
                      <span className="ml-2 font-mono text-xs text-[#64748B]">
                        ${result.githubRatePerMin.toFixed(3)}/min ·{' '}
                        {vcpu}-core {CLOUD_PROFILES[cloudProfile].arch}
                      </span>
                    </div>
                    <span className="font-mono text-base font-bold text-[#CBD5E1]">
                      {formatUsd(result.githubMonthly)}/mo
                    </span>
                  </div>
                  <div className="mt-2 h-3.5 w-full overflow-hidden rounded-full bg-[#090B10]">
                    <div
                      className="h-full rounded-full bg-[#334155] transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(4, (result.githubMonthly / maxCost) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Managed 3rd-party Runner SaaS */}
                <div>
                  <div className="flex items-baseline justify-between text-sm">
                    <div>
                      <span className="font-semibold text-[#F8FAFC]">
                        Managed Runner SaaS
                      </span>
                      <span className="ml-2 font-mono text-xs text-[#64748B]">
                        e.g. Blacksmith · ${result.managedSaasRatePerMin.toFixed(3)}/min
                      </span>
                    </div>
                    <span className="font-mono text-base font-bold text-[#FB923C]">
                      {formatUsd(result.managedSaasMonthly)}/mo
                    </span>
                  </div>
                  <div className="mt-2 h-3.5 w-full overflow-hidden rounded-full bg-[#090B10]">
                    <div
                      className="h-full rounded-full bg-[#F97316]/70 transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(4, (result.managedSaasMonthly / maxCost) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* open-ci */}
                <div>
                  <div className="flex items-baseline justify-between text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#10B981]">
                        open-ci ({CLOUD_PROFILES[cloudProfile].shortLabel})
                      </span>
                      <span className="rounded border border-[#10B981]/30 bg-[#10B981]/10 px-1.5 py-0.5 font-mono text-[11px] text-[#10B981]">
                        {result.instanceName} · ${result.openCiAllInRatePerMin.toFixed(4)}/min all-in
                      </span>
                    </div>
                    <span className="font-mono text-lg font-extrabold text-[#10B981]">
                      ~{formatUsd(result.openCiMonthly)}/mo
                    </span>
                  </div>
                  <div className="mt-2 h-3.5 w-full overflow-hidden rounded-full bg-[#090B10]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399] shadow-[0_0_16px_rgba(16,185,129,0.45)] transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(3.5, (result.openCiMonthly / maxCost) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transparent Math Breakdown */}
            <div className="mt-8 rounded-xl border border-[#1E2636] bg-[#090B10] p-4">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                <Info className="h-3.5 w-3.5 text-[#F97316]" />
                Transparent Cost Math (Zero Hidden SaaS Tax)
              </div>
              <div className="mt-2.5 grid grid-cols-1 gap-2 font-mono text-xs text-[#94A3B8] sm:grid-cols-2">
                <div>
                  Spot compute + ephemeral disk:{' '}
                  <span className="text-[#F8FAFC]">
                    {formatMinutes(result.effectiveOpenCiMinutes)} min × $
                    {result.openCiAllInRatePerMin.toFixed(4)} ={' '}
                    {formatUsd(result.openCiComputeMonthly)}/mo
                  </span>
                </div>
                <div>
                  Control plane (e2-small / t4g.small):{' '}
                  <span className="text-[#F8FAFC]">
                    +${result.controlPlaneMonthly}/mo flat
                  </span>
                </div>
              </div>
              <p className="mt-2.5 text-xs text-[#64748B]">
                Billed directly by AWS or GCP inside your own account — eligible
                for startup credits, EDP discounts, and Savings Plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
