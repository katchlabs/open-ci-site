import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CALCULATOR_PRESETS,
  CLOUD_PROFILES,
  CloudProfileId,
  RunnerVcpu,
  calculateCosts,
  formatMinutes,
  formatUsd,
} from '../../data/pricing';
import { AnimatedNumber } from './AnimatedNumber';

const TEAM_PRESETS = [
  { id: 'startup', label: '10 devs', sublabel: 'Startup' },
  { id: 'growth', label: '40 devs', sublabel: 'Growth' },
  { id: 'monorepo', label: '150 devs', sublabel: 'Scale' },
] as const;

const VCPU_OPTIONS: RunnerVcpu[] = [4, 8, 16];

const CLOUD_OPTIONS: { id: CloudProfileId; label: string }[] = [
  { id: 'gcp-x64', label: 'GCP Spot' },
  { id: 'aws-x64', label: 'AWS Spot' },
  { id: 'aws-arm64', label: 'AWS Graviton' },
];

const MIN_MINUTES = 10_000;
const MAX_MINUTES = 1_500_000;

export function SavingsCalculator() {
  const [activePresetId, setActivePresetId] = useState<string>('growth');
  const [monthlyMinutes, setMonthlyMinutes] = useState<number>(200_000);
  const [vcpu, setVcpu] = useState<RunnerVcpu>(4);
  const [cloudProfile, setCloudProfile] = useState<CloudProfileId>('gcp-x64');

  const applyPreset = (presetId: string) => {
    const preset = CALCULATOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setMonthlyMinutes(preset.monthlyMinutes);
    setVcpu(preset.vcpu);
    setCloudProfile(preset.cloudProfile);
  };

  const costs = useMemo(
    () => calculateCosts(monthlyMinutes, vcpu, cloudProfile, 0),
    [monthlyMinutes, vcpu, cloudProfile]
  );

  const sliderPct =
    ((monthlyMinutes - MIN_MINUTES) / (MAX_MINUTES - MIN_MINUTES)) * 100;

  const maxMonthly = Math.max(costs.githubMonthly, 1);
  const saasBarPct = Math.min(100, (costs.managedSaasMonthly / maxMonthly) * 100);
  const openCiBarPct = Math.max(
    4,
    Math.min(100, (costs.openCiMonthly / maxMonthly) * 100)
  );

  const profile = CLOUD_PROFILES[cloudProfile];

  return (
    <section
      id="savings"
      className="border-t border-[#E5E7EB] px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-[1120px]">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <h2 className="text-[34px] leading-[1.1] font-medium tracking-[-0.035em] text-[#0A0A0A] sm:text-[44px]">
              Run the numbers for your team.
            </h2>
            <p className="mt-3 max-w-[520px] text-[16px] leading-[1.55] text-[#4B5563]">
              Plug in your monthly GitHub Actions usage. Compare hosted rates,
              managed runner SaaS, and raw Spot compute in your own cloud.
            </p>
          </div>

          {/* Sliding Preset Pill Selector */}
          <div className="inline-flex self-start rounded-xl border border-[#E5E7EB] bg-[#F1F2F4] p-1 md:self-auto">
            {TEAM_PRESETS.map((preset) => {
              const active = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={`relative rounded-lg px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
                    active ? 'text-[#FFFFFF]' : 'text-[#4B5563] hover:text-[#0A0A0A]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="preset-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-lg bg-[#0A0A0A]"
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Interactive Studio Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="studio-stage mt-9 grid grid-cols-1 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] lg:grid-cols-12"
        >
          {/* Left Controls Column */}
          <div className="flex flex-col justify-between gap-8 border-b border-[#E5E7EB] p-6 sm:p-8 lg:col-span-6 lg:border-r lg:border-b-0">
            {/* Monthly Minutes Slider with Floating Tooltip */}
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <label
                  htmlFor="monthly-minutes-slider"
                  className="text-[13.5px] font-medium text-[#0A0A0A]"
                >
                  Monthly build minutes
                </label>
                <span className="font-mono text-[13px] text-[#4B5563] tabular-nums">
                  {monthlyMinutes.toLocaleString('en-US')} min / mo
                </span>
              </div>

              <div className="relative mt-9 mb-2">
                {/* Floating Animated Tooltip Pill */}
                <div
                  className="pointer-events-none absolute -top-8 -translate-x-1/2"
                  style={{
                    left: `clamp(34px, ${sliderPct}%, calc(100% - 34px))`,
                  }}
                >
                  <div className="rounded-md bg-[#0A0A0A] px-2.5 py-1 font-mono text-[11px] font-medium text-[#FFFFFF] shadow-sm whitespace-nowrap tabular-nums">
                    {formatMinutes(monthlyMinutes)} min
                  </div>
                </div>

                {/* Progress Fill Track Overlay */}
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-0 h-[4px] rounded-full bg-[#0A0A0A]" style={{ width: `${sliderPct}%` }} />
                  <input
                    id="monthly-minutes-slider"
                    type="range"
                    min={MIN_MINUTES}
                    max={MAX_MINUTES}
                    step={10_000}
                    value={monthlyMinutes}
                    onChange={(e) => {
                      setActivePresetId('custom');
                      setMonthlyMinutes(Number(e.target.value));
                    }}
                    className="ledger-slider relative z-10 w-full"
                  />
                </div>

                <div className="mt-2.5 flex justify-between font-mono text-[11px] text-[#6B7280]">
                  <span>10k</span>
                  <span>250k</span>
                  <span>750k</span>
                  <span>1.5M</span>
                </div>
              </div>
            </div>

            {/* Runner Size Segmented Control */}
            <div>
              <div className="mb-2.5 flex items-baseline justify-between">
                <span className="text-[13.5px] font-medium text-[#0A0A0A]">
                  Machine size
                </span>
                <span className="font-mono text-[11.5px] text-[#6B7280]">
                  {costs.instanceName} · {costs.memoryGiB} GB RAM
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-1">
                {VCPU_OPTIONS.map((option) => {
                  const active = vcpu === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setActivePresetId('custom');
                        setVcpu(option);
                      }}
                      className={`relative rounded-lg py-2.5 text-[13px] font-medium transition-colors cursor-pointer ${
                        active ? 'text-[#0A0A0A]' : 'text-[#6B7280] hover:text-[#0A0A0A]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="vcpu-pill"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          className="absolute inset-0 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] shadow-xs"
                        />
                      )}
                      <span className="relative z-10 font-mono">{option} vCPU</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cloud Provider Segmented Control */}
            <div>
              <div className="mb-2.5 flex items-baseline justify-between">
                <span className="text-[13.5px] font-medium text-[#0A0A0A]">
                  Your cloud account
                </span>
                <span className="font-mono text-[11.5px] text-[#6B7280]">
                  ${costs.openCiSpotHourly.toFixed(3)}/hr Spot
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-1">
                {CLOUD_OPTIONS.map((option) => {
                  const active = cloudProfile === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setActivePresetId('custom');
                        setCloudProfile(option.id);
                      }}
                      className={`relative rounded-lg py-2.5 text-[12.5px] font-medium transition-colors cursor-pointer ${
                        active ? 'text-[#0A0A0A]' : 'text-[#6B7280] hover:text-[#0A0A0A]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="cloud-pill"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          className="absolute inset-0 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] shadow-xs"
                        />
                      )}
                      <span className="relative z-10">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Live Savings Output Column */}
          <div className="flex flex-col justify-between bg-[#F9FAFB] p-6 sm:p-8 lg:col-span-6">
            {/* Big Rolling Annual Savings Hero */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6B7280]">
                  Estimated annual savings
                </span>
                <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-0.5 font-mono text-[11.5px] font-medium text-[#15803D] tabular-nums">
                  <AnimatedNumber
                    value={costs.savingsVsGithubPct}
                    format={(n) => `${Math.round(n)}% lower`}
                  />
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <AnimatedNumber
                  value={costs.savingsVsGithubAnnual}
                  format={(n) => formatUsd(Math.round(n))}
                  className="text-[48px] leading-none font-semibold tracking-[-0.04em] text-[#15803D] sm:text-[58px]"
                />
                <span className="text-[18px] text-[#4B5563]">/ year</span>
              </div>

              <div className="mt-2 text-[13.5px] text-[#4B5563]">
                Saving{' '}
                <strong className="font-medium text-[#0A0A0A]">
                  <AnimatedNumber
                    value={costs.savingsVsGithubMonthly}
                    format={(n) => formatUsd(Math.round(n))}
                  />
                  /mo
                </strong>{' '}
                vs. GitHub Actions, or{' '}
                <strong className="font-medium text-[#0A0A0A]">
                  <AnimatedNumber
                    value={costs.savingsVsSaasAnnual}
                    format={(n) => formatUsd(Math.round(n))}
                  />
                  /yr
                </strong>{' '}
                vs. managed runner SaaS.
              </div>
            </div>

            {/* 3-Row Spring Comparison Bars */}
            <div className="mt-8 space-y-5">
              {/* Row 1: GitHub Actions */}
              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-[13.5px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#4B5563]">GitHub Actions</span>
                    <span className="font-mono text-[11px] text-[#6B7280]">
                      ${costs.githubRatePerMin.toFixed(3)}/min
                    </span>
                  </div>
                  <AnimatedNumber
                    value={costs.githubMonthly}
                    format={(n) => `${formatUsd(Math.round(n))}/mo`}
                    className="font-mono text-[14px] font-medium text-[#4B5563]"
                  />
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#F1F2F4]">
                  <motion.div
                    initial={false}
                    animate={{ width: '100%' }}
                    transition={{ type: 'spring', stiffness: 160, damping: 24 }}
                    className="h-full rounded-full bg-[#CBD0D8]"
                  />
                </div>
              </div>

              {/* Row 2: Managed SaaS */}
              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-[13.5px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#4B5563]">
                      Managed SaaS (Blacksmith, etc.)
                    </span>
                    <span className="font-mono text-[11px] text-[#6B7280]">
                      ${costs.managedSaasRatePerMin.toFixed(3)}/min
                    </span>
                  </div>
                  <AnimatedNumber
                    value={costs.managedSaasMonthly}
                    format={(n) => `${formatUsd(Math.round(n))}/mo`}
                    className="font-mono text-[14px] font-medium text-[#4B5563]"
                  />
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#F1F2F4]">
                  <motion.div
                    initial={false}
                    animate={{ width: `${saasBarPct}%` }}
                    transition={{ type: 'spring', stiffness: 160, damping: 24 }}
                    className="h-full rounded-full bg-[#DDE1E7]"
                  />
                </div>
              </div>

              {/* Row 3: open-ci */}
              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-[13.5px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#0A0A0A]">
                      open-ci ({profile.provider} Spot)
                    </span>
                    <span className="font-mono text-[11px] font-medium text-[#15803D]">
                      ~${costs.openCiAllInRatePerMin.toFixed(4)}/min
                    </span>
                  </div>
                  <AnimatedNumber
                    value={costs.openCiMonthly}
                    format={(n) => `${formatUsd(Math.round(n))}/mo`}
                    className="font-mono text-[15px] font-semibold text-[#15803D]"
                  />
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#F1F2F4]">
                  <motion.div
                    initial={false}
                    animate={{ width: `${openCiBarPct}%` }}
                    transition={{ type: 'spring', stiffness: 160, damping: 24 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#15803D]"
                  />
                </div>
              </div>
            </div>

            {/* Quiet All-In Footnote */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E7EB] pt-4 text-[12px] text-[#6B7280]">
              <span>Includes ~$15/mo always-on host + ephemeral disks.</span>
              <span className="font-mono text-[11px] text-[#15803D]">
                $0 paid to open-ci
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
