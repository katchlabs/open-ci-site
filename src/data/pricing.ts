export type RunnerVcpu = 4 | 8 | 16;
export type CloudProfileId = 'gcp-x64' | 'aws-x64' | 'aws-arm64';

export interface CloudProfile {
  id: CloudProfileId;
  label: string;
  shortLabel: string;
  arch: 'x64' | 'arm64';
  provider: 'GCP' | 'AWS';
  instances: Record<RunnerVcpu, { name: string; memoryGiB: number; spotHourlyUsd: number; allInPerMinUsd: number; spotPerMinUsd: number }>;
}

export const CONTROL_PLANE_FLAT_MONTHLY_USD = 15;

/**
 * Verified 2026 per-minute runner rates (USD/min).
 *
 * GitHub Actions:
 *   4-core x64: $0.012/min ($0.72/hr) | 8-core x64: $0.022/min | 16-core x64: $0.042/min
 *   4-core ARM64: $0.008/min          | 8-core ARM64: $0.016/min | 16-core ARM64: $0.032/min
 *
 * Managed 3rd-party runner SaaS (e.g., Blacksmith):
 *   4-core x64: $0.008/min | 8-core x64: $0.016/min | 16-core x64: $0.032/min
 *   4-core ARM64: $0.005/min | 8-core ARM64: $0.010/min | 16-core ARM64: $0.020/min
 */
export const GITHUB_RATES_PER_MIN: Record<'x64' | 'arm64', Record<RunnerVcpu, number>> = {
  x64: {
    4: 0.012,
    8: 0.022,
    16: 0.042,
  },
  arm64: {
    4: 0.008,
    8: 0.016,
    16: 0.032,
  },
};

export const MANAGED_SAAS_RATES_PER_MIN: Record<'x64' | 'arm64', Record<RunnerVcpu, number>> = {
  x64: {
    4: 0.008,
    8: 0.016,
    16: 0.032,
  },
  arm64: {
    4: 0.005,
    8: 0.010,
    16: 0.020,
  },
};

export const CLOUD_PROFILES: Record<CloudProfileId, CloudProfile> = {
  'gcp-x64': {
    id: 'gcp-x64',
    label: 'GCP x64 Spot (c3-standard)',
    shortLabel: 'GCP x64 Spot',
    arch: 'x64',
    provider: 'GCP',
    instances: {
      4: {
        name: 'c3-standard-4',
        memoryGiB: 16,
        spotHourlyUsd: 0.072,
        spotPerMinUsd: 0.0012,
        // Compute ($0.0012) + ephemeral disk (~$0.0002) + boot/NAT headroom (~$0.0001)
        allInPerMinUsd: 0.0015,
      },
      8: {
        name: 'c3-standard-8',
        memoryGiB: 32,
        spotHourlyUsd: 0.144,
        spotPerMinUsd: 0.0024,
        // Compute ($0.0024) + ephemeral disk (~$0.0004) + boot/NAT headroom (~$0.00007)
        allInPerMinUsd: 0.00287,
      },
      16: {
        name: 'c3-standard-16',
        memoryGiB: 64,
        spotHourlyUsd: 0.288,
        spotPerMinUsd: 0.0048,
        allInPerMinUsd: 0.0056,
      },
    },
  },
  'aws-x64': {
    id: 'aws-x64',
    label: 'AWS x64 Spot (c7a)',
    shortLabel: 'AWS x64 Spot',
    arch: 'x64',
    provider: 'AWS',
    instances: {
      4: {
        name: 'c7a.xlarge',
        memoryGiB: 8,
        spotHourlyUsd: 0.085,
        spotPerMinUsd: 0.00142,
        allInPerMinUsd: 0.0016,
      },
      8: {
        name: 'c7a.2xlarge',
        memoryGiB: 16,
        spotHourlyUsd: 0.17,
        spotPerMinUsd: 0.00283,
        allInPerMinUsd: 0.0032,
      },
      16: {
        name: 'c7a.4xlarge',
        memoryGiB: 32,
        spotHourlyUsd: 0.34,
        spotPerMinUsd: 0.00567,
        allInPerMinUsd: 0.0064,
      },
    },
  },
  'aws-arm64': {
    id: 'aws-arm64',
    label: 'AWS Graviton ARM64 Spot (c7g)',
    shortLabel: 'AWS Graviton Spot',
    arch: 'arm64',
    provider: 'AWS',
    instances: {
      4: {
        name: 'c7g.xlarge',
        memoryGiB: 8,
        spotHourlyUsd: 0.072,
        spotPerMinUsd: 0.0012,
        allInPerMinUsd: 0.0014,
      },
      8: {
        name: 'c7g.2xlarge',
        memoryGiB: 16,
        spotHourlyUsd: 0.144,
        spotPerMinUsd: 0.0024,
        allInPerMinUsd: 0.0028,
      },
      16: {
        name: 'c7g.4xlarge',
        memoryGiB: 32,
        spotHourlyUsd: 0.288,
        spotPerMinUsd: 0.0048,
        allInPerMinUsd: 0.0056,
      },
    },
  },
};

export interface CalculatorPreset {
  id: string;
  name: string;
  subtitle: string;
  monthlyMinutes: number;
  vcpu: RunnerVcpu;
  cloudProfile: CloudProfileId;
  speedupPercent: number;
}

export const CALCULATOR_PRESETS: CalculatorPreset[] = [
  {
    id: 'startup',
    name: 'Lean Agentic Team',
    subtitle: '4 devs + agents · 40k 4-vCPU min/mo',
    monthlyMinutes: 40_000,
    vcpu: 4,
    cloudProfile: 'gcp-x64',
    speedupPercent: 0,
  },
  {
    id: 'growth',
    name: 'High-Velocity Team',
    subtitle: '12 devs + agents · 200k 4-vCPU min/mo',
    monthlyMinutes: 200_000,
    vcpu: 4,
    cloudProfile: 'gcp-x64',
    speedupPercent: 0,
  },
  {
    id: 'monorepo',
    name: 'Agent-Heavy Org',
    subtitle: '40 devs + agents · 500k 8-vCPU min/mo',
    monthlyMinutes: 500_000,
    vcpu: 8,
    cloudProfile: 'gcp-x64',
    speedupPercent: 0,
  },
];

export interface CostBreakdown {
  githubMonthly: number;
  managedSaasMonthly: number;
  openCiMonthly: number;
  openCiComputeMonthly: number;
  controlPlaneMonthly: number;
  effectiveOpenCiMinutes: number;
  githubRatePerMin: number;
  managedSaasRatePerMin: number;
  openCiAllInRatePerMin: number;
  openCiSpotHourly: number;
  instanceName: string;
  memoryGiB: number;
  savingsVsGithubMonthly: number;
  savingsVsGithubAnnual: number;
  savingsVsGithubPct: number;
  savingsVsSaasMonthly: number;
  savingsVsSaasAnnual: number;
  savingsVsSaasPct: number;
}

export function calculateCosts(
  monthlyMinutes: number,
  vcpu: RunnerVcpu,
  cloudProfileId: CloudProfileId,
  speedupPercent: number
): CostBreakdown {
  const profile = CLOUD_PROFILES[cloudProfileId];
  const instance = profile.instances[vcpu];
  const githubRatePerMin = GITHUB_RATES_PER_MIN[profile.arch][vcpu];
  const managedSaasRatePerMin = MANAGED_SAAS_RATES_PER_MIN[profile.arch][vcpu];

  // Speedup reduces billed open-ci runner minutes (e.g., 30% faster => 70% of minutes billed).
  const clampedSpeedup = Math.max(0, Math.min(50, speedupPercent));
  const effectiveOpenCiMinutes = Math.round(monthlyMinutes * (1 - clampedSpeedup / 100));

  const githubMonthly = Math.round(monthlyMinutes * githubRatePerMin);
  const managedSaasMonthly = Math.round(monthlyMinutes * managedSaasRatePerMin);
  const openCiComputeMonthly = Math.round(effectiveOpenCiMinutes * instance.allInPerMinUsd);
  const openCiMonthly = openCiComputeMonthly + CONTROL_PLANE_FLAT_MONTHLY_USD;

  const savingsVsGithubMonthly = Math.max(0, githubMonthly - openCiMonthly);
  const savingsVsGithubAnnual = savingsVsGithubMonthly * 12;
  const savingsVsGithubPct =
    githubMonthly > 0 ? Math.round((savingsVsGithubMonthly / githubMonthly) * 100) : 0;

  const savingsVsSaasMonthly = Math.max(0, managedSaasMonthly - openCiMonthly);
  const savingsVsSaasAnnual = savingsVsSaasMonthly * 12;
  const savingsVsSaasPct =
    managedSaasMonthly > 0 ? Math.round((savingsVsSaasMonthly / managedSaasMonthly) * 100) : 0;

  return {
    githubMonthly,
    managedSaasMonthly,
    openCiMonthly,
    openCiComputeMonthly,
    controlPlaneMonthly: CONTROL_PLANE_FLAT_MONTHLY_USD,
    effectiveOpenCiMinutes,
    githubRatePerMin,
    managedSaasRatePerMin,
    openCiAllInRatePerMin: instance.allInPerMinUsd,
    openCiSpotHourly: instance.spotHourlyUsd,
    instanceName: instance.name,
    memoryGiB: instance.memoryGiB,
    savingsVsGithubMonthly,
    savingsVsGithubAnnual,
    savingsVsGithubPct,
    savingsVsSaasMonthly,
    savingsVsSaasAnnual,
    savingsVsSaasPct,
  };
}

export interface BenchmarkRow {
  suite: string;
  shards: string;
  beforeLabel: string;
  afterLabel: string;
  beforeSeconds: number;
  afterSeconds: number;
  fasterPct: number;
}

export const MEASURED_BENCHMARKS: BenchmarkRow[] = [
  {
    suite: 'API Integration Tests',
    shards: '10 shards',
    beforeLabel: '10m 33s',
    afterLabel: '5m 47s',
    beforeSeconds: 633,
    afterSeconds: 347,
    fasterPct: 45,
  },
  {
    suite: 'Portal Integration Suite',
    shards: 'Full suite',
    beforeLabel: '8m 33s',
    afterLabel: '4m 41s',
    beforeSeconds: 513,
    afterSeconds: 281,
    fasterPct: 45,
  },
  {
    suite: 'Playwright Browser E2E',
    shards: '8 shards',
    beforeLabel: '8m 05s',
    afterLabel: '5m 51s',
    beforeSeconds: 485,
    afterSeconds: 351,
    fasterPct: 28,
  },
  {
    suite: 'Developer API Suite',
    shards: '2 shards',
    beforeLabel: '3m 10s',
    afterLabel: '2m 32s',
    beforeSeconds: 190,
    afterSeconds: 152,
    fasterPct: 20,
  },
];

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMinutes(minutes: number): string {
  if (minutes >= 1_000_000) {
    return `${(minutes / 1_000_000).toFixed(1)}M`;
  }
  if (minutes >= 1_000) {
    return `${Math.round(minutes / 1_000)}k`;
  }
  return `${minutes}`;
}
