import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  Minus,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ComparisonRow {
  feature: string;
  openCi: string;
  github: string;
  managedSaas: string;
  k8sArc: string;
  highlightOpenCi?: boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: '4-vCPU Linux rate',
    openCi: '~$0.0012/min',
    github: '$0.012/min',
    managedSaas: '$0.008/min',
    k8sArc: 'Cloud + K8s ops',
    highlightOpenCi: true,
  },
  {
    feature: 'Burns AWS / GCP credits',
    openCi: 'Yes',
    github: 'No',
    managedSaas: 'No',
    k8sArc: 'Yes',
  },
  {
    feature: 'Code stays in your VPC',
    openCi: 'Yes',
    github: 'No',
    managedSaas: 'No',
    k8sArc: 'Yes',
  },
  {
    feature: 'Multi-cloud Spot failover',
    openCi: 'Built-in',
    github: 'N/A',
    managedSaas: 'No',
    k8sArc: 'DIY',
  },
  {
    feature: 'Auto fallback to GitHub',
    openCi: 'Built-in',
    github: 'N/A',
    managedSaas: 'Manual',
    k8sArc: 'Manual',
  },
  {
    feature: 'Fast built-in cache',
    openCi: 'Included (unlimited)',
    github: '10 GB cap',
    managedSaas: 'Paid add-on',
    k8sArc: 'DIY',
  },
  {
    feature: 'Infrastructure overhead',
    openCi: '1 tiny VM (~$15/mo)',
    github: 'None',
    managedSaas: 'None',
    k8sArc: 'Full K8s cluster',
  },
  {
    feature: 'License & pricing',
    openCi: 'Apache-2.0 · $0',
    github: 'Proprietary',
    managedSaas: 'Proprietary',
    k8sArc: 'Apache-2.0',
    highlightOpenCi: true,
  },
];

function CellValue({ value, isOpenCi = false }: { value: string; isOpenCi?: boolean }) {
  if (value === 'Yes' || value === 'Built-in') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium ${
          isOpenCi ? 'text-[#15803D]' : 'text-[#4B5563]'
        }`}
      >
        <Check
          className={`h-3.5 w-3.5 ${
            isOpenCi ? 'text-[#16A34A] stroke-[2.5]' : 'text-[#6B7280]'
          }`}
        />
        <span>{value}</span>
      </span>
    );
  }
  if (value === 'No' || value === 'N/A') {
    return (
      <span className="inline-flex items-center gap-1 text-[#9CA3AF]">
        <Minus className="h-3.5 w-3.5 opacity-60" />
        <span>{value}</span>
      </span>
    );
  }
  return (
    <span className={isOpenCi ? 'font-medium text-[#0A0A0A]' : 'text-[#4B5563]'}>
      {value}
    </span>
  );
}

/* ==================== DEMO 1: INTERACTIVE FAILOVER ROUTER ==================== */
function InteractiveFailoverDemo() {
  // 0 = GCP active, 1 = GCP interrupted -> AWS active, 2 = Both Spot interrupted -> GitHub fallback
  const [outageLevel, setOutageLevel] = useState<0 | 1 | 2>(0);

  const gcpDown = outageLevel >= 1;
  const awsDown = outageLevel >= 2;
  const activeRoute: 'gcp' | 'aws' | 'github' =
    outageLevel === 0 ? 'gcp' : outageLevel === 1 ? 'aws' : 'github';

  const statusMessage =
    outageLevel === 0
      ? 'Routing to GCP Spot · $0.0012/min'
      : outageLevel === 1
      ? 'GCP Spot interrupted → rerouted to AWS Spot automatically'
      : 'Spot capacity dry → fell back to GitHub-hosted automatically';

  const handleAction = () => {
    setOutageLevel((prev) => (prev === 2 ? 0 : ((prev + 1) as 0 | 1 | 2)));
  };

  const buttonLabel =
    outageLevel === 0
      ? 'Trigger Spot interruption'
      : outageLevel === 1
      ? 'Interrupt AWS Spot too'
      : 'Restore Spot regions';

  return (
    <div className="studio-card overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[20px] font-medium tracking-[-0.02em] text-[#0A0A0A]">
              Zero failed builds
            </h3>
            <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-0.5 font-mono text-[10.5px] font-medium text-[#15803D]">
              0 failed jobs
            </span>
          </div>
          <p className="mt-1.5 max-w-[540px] text-[14.5px] leading-[1.55] text-[#4B5563]">
            If Spot capacity dries up in one zone or cloud, jobs seamlessly
            reroute to your next cloud — or fall back to GitHub-hosted runners.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAction}
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer ${
            outageLevel === 2
              ? 'border border-[#D1D5DB] bg-[#FFFFFF] text-[#0A0A0A] hover:bg-[#F7F8FA]'
              : 'bg-[#0A0A0A] text-[#FFFFFF] hover:bg-[#262624]'
          }`}
        >
          {outageLevel === 2 ? (
            <RotateCcw className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-[#FBBF24]" />
          )}
          <span>{buttonLabel}</span>
        </button>
      </div>

      {/* Animated SVG Routing Stage */}
      <div className="mt-6 rounded-xl border border-[#F1F2F4] bg-[#F9FAFB] p-4 sm:p-6">
        <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-12">
          {/* Source Node: GitHub Workflow */}
          <div className="md:col-span-3">
            <div className="rounded-xl border border-[#D1D5DB] bg-[#FFFFFF] p-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0A0A0A]" />
                <span className="text-[13px] font-medium text-[#0A0A0A]">
                  GitHub Actions
                </span>
              </div>
              <div className="mt-1.5 font-mono text-[11px] text-[#6B7280]">
                22 build jobs queued
              </div>
              <div className="mt-2 inline-flex items-center gap-1 rounded bg-[#F0FDF4] px-2 py-0.5 font-mono text-[10px] font-medium text-[#15803D]">
                <Check className="h-3 w-3" />
                100% completion
              </div>
            </div>
          </div>

          {/* Center SVG Bézier Routing Lines with Flowing Packets */}
          <div className="hidden md:col-span-4 md:block">
            <svg
              viewBox="0 0 240 180"
              className="h-[180px] w-full overflow-visible"
              aria-hidden="true"
            >
              {/* Path 1: to GCP Spot (top) */}
              <path
                d="M 4 90 C 80 90, 120 30, 236 30"
                fill="none"
                stroke={
                  gcpDown
                    ? '#FCA5A5'
                    : activeRoute === 'gcp'
                    ? '#16A34A'
                    : '#E5E7EB'
                }
                strokeWidth={activeRoute === 'gcp' ? 2.5 : 1.5}
                strokeDasharray={gcpDown ? '5 5' : undefined}
              />

              {/* Path 2: to AWS Spot (middle) */}
              <path
                d="M 4 90 C 80 90, 140 90, 236 90"
                fill="none"
                stroke={
                  awsDown
                    ? '#FCA5A5'
                    : activeRoute === 'aws'
                    ? '#16A34A'
                    : '#E5E7EB'
                }
                strokeWidth={activeRoute === 'aws' ? 2.5 : 1.5}
                strokeDasharray={awsDown ? '5 5' : undefined}
              />

              {/* Path 3: to GitHub Fallback (bottom) */}
              <path
                d="M 4 90 C 80 90, 120 150, 236 150"
                fill="none"
                stroke={activeRoute === 'github' ? '#0A0A0A' : '#E5E7EB'}
                strokeWidth={activeRoute === 'github' ? 2.5 : 1.5}
              />

              {/* Animated Flowing Packets on the active route */}
              {activeRoute === 'gcp' && (
                <>
                  <circle r="4.5" fill="#16A34A">
                    <animateMotion
                      dur="1.5s"
                      repeatCount="indefinite"
                      path="M 4 90 C 80 90, 120 30, 236 30"
                    />
                  </circle>
                  <circle r="4.5" fill="#16A34A" opacity="0.55">
                    <animateMotion
                      dur="1.5s"
                      begin="0.75s"
                      repeatCount="indefinite"
                      path="M 4 90 C 80 90, 120 30, 236 30"
                    />
                  </circle>
                </>
              )}

              {activeRoute === 'aws' && (
                <>
                  <circle r="4.5" fill="#16A34A">
                    <animateMotion
                      dur="1.35s"
                      repeatCount="indefinite"
                      path="M 4 90 C 80 90, 140 90, 236 90"
                    />
                  </circle>
                  <circle r="4.5" fill="#16A34A" opacity="0.55">
                    <animateMotion
                      dur="1.35s"
                      begin="0.67s"
                      repeatCount="indefinite"
                      path="M 4 90 C 80 90, 140 90, 236 90"
                    />
                  </circle>
                </>
              )}

              {activeRoute === 'github' && (
                <>
                  <circle r="4.5" fill="#0A0A0A">
                    <animateMotion
                      dur="1.5s"
                      repeatCount="indefinite"
                      path="M 4 90 C 80 90, 120 150, 236 150"
                    />
                  </circle>
                  <circle r="4.5" fill="#0A0A0A" opacity="0.5">
                    <animateMotion
                      dur="1.5s"
                      begin="0.75s"
                      repeatCount="indefinite"
                      path="M 4 90 C 80 90, 120 150, 236 150"
                    />
                  </circle>
                </>
              )}
            </svg>
          </div>

          {/* Right Cloud Destination Nodes */}
          <div className="space-y-2.5 md:col-span-5">
            {/* Node 1: GCP Spot */}
            <div
              className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 ${
                gcpDown
                  ? 'border-[#FECACA] bg-[#FEF2F2]'
                  : activeRoute === 'gcp'
                  ? 'border-[#86EFAC] bg-[#FFFFFF] shadow-xs'
                  : 'border-[#E5E7EB] bg-[#FFFFFF]/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    gcpDown
                      ? 'bg-[#DC2626]'
                      : activeRoute === 'gcp'
                      ? 'bg-[#16A34A]'
                      : 'bg-[#CBD0D8]'
                  }`}
                />
                <div>
                  <div className="text-[13px] font-medium text-[#0A0A0A]">
                    GCP Spot · us-central1
                  </div>
                  <div className="font-mono text-[10.5px] text-[#6B7280]">
                    $0.0012/min · Primary
                  </div>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
                  gcpDown
                    ? 'bg-[#FEE2E2] text-[#DC2626]'
                    : 'bg-[#F0FDF4] text-[#15803D]'
                }`}
              >
                {gcpDown ? 'Interrupted' : 'Active'}
              </span>
            </div>

            {/* Node 2: AWS Spot */}
            <div
              className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 ${
                awsDown
                  ? 'border-[#FECACA] bg-[#FEF2F2]'
                  : activeRoute === 'aws'
                  ? 'border-[#86EFAC] bg-[#FFFFFF] shadow-xs'
                  : 'border-[#E5E7EB] bg-[#FFFFFF]/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    awsDown
                      ? 'bg-[#DC2626]'
                      : activeRoute === 'aws'
                      ? 'bg-[#16A34A]'
                      : 'bg-[#CBD0D8]'
                  }`}
                />
                <div>
                  <div className="text-[13px] font-medium text-[#0A0A0A]">
                    AWS Spot · us-east-1
                  </div>
                  <div className="font-mono text-[10.5px] text-[#6B7280]">
                    $0.0014/min · Secondary
                  </div>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
                  awsDown
                    ? 'bg-[#FEE2E2] text-[#DC2626]'
                    : activeRoute === 'aws'
                    ? 'bg-[#F0FDF4] text-[#15803D]'
                    : 'bg-[#F1F2F4] text-[#6B7280]'
                }`}
              >
                {awsDown ? 'Interrupted' : activeRoute === 'aws' ? 'Active' : 'Standby'}
              </span>
            </div>

            {/* Node 3: GitHub Fallback */}
            <div
              className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 ${
                activeRoute === 'github'
                  ? 'border-[#0A0A0A] bg-[#FFFFFF] shadow-xs'
                  : 'border-[#E5E7EB] bg-[#FFFFFF]/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    activeRoute === 'github' ? 'bg-[#0A0A0A]' : 'bg-[#CBD0D8]'
                  }`}
                />
                <div>
                  <div className="text-[13px] font-medium text-[#0A0A0A]">
                    GitHub-Hosted Fallback
                  </div>
                  <div className="font-mono text-[10.5px] text-[#6B7280]">
                    Safety net · Zero downtime
                  </div>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
                  activeRoute === 'github'
                    ? 'bg-[#0A0A0A] text-[#FFFFFF]'
                    : 'bg-[#F1F2F4] text-[#6B7280]'
                }`}
              >
                {activeRoute === 'github' ? 'Active' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E7EB] pt-3.5 font-mono text-[11.5px]">
          <span className="flex items-center gap-2 text-[#0A0A0A]">
            <Zap className="h-3.5 w-3.5 text-[#15803D]" />
            {statusMessage}
          </span>
          <span className="text-[#15803D]">Build queue healthy</span>
        </div>
      </div>
    </div>
  );
}

/* ==================== DEMO 2: INTERACTIVE MORPHING WORKFLOW DIFF ==================== */
function InteractiveDiffDemo() {
  const [mode, setMode] = useState<'dropin' | 'fallback'>('dropin');

  return (
    <div className="studio-card flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 sm:p-7">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[20px] font-medium tracking-[-0.02em] text-[#0A0A0A]">
            Switch in one line
          </h3>

          {/* Morphing Toggle */}
          <div className="inline-flex rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-0.5">
            {(
              [
                { id: 'dropin', label: '1-line drop-in' },
                { id: 'fallback', label: 'Auto-fallback' },
              ] as const
            ).map((tab) => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  className={`relative rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors cursor-pointer ${
                    active ? 'text-[#0A0A0A]' : 'text-[#6B7280] hover:text-[#0A0A0A]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="workflow-diff-tab"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-2 text-[14px] leading-[1.55] text-[#4B5563]">
          Keep your existing workflows, secrets, and{' '}
          <code className="rounded bg-[#F1F2F4] px-1.5 py-0.5 text-[12.5px] text-[#0A0A0A]">
            actions/cache
          </code>
          . Only the runner line changes.
        </p>
      </div>

      {/* Animated YAML Code Sheet */}
      <div className="mt-5 overflow-hidden rounded-xl border border-[#262624] bg-[#141413] font-mono text-[12px] leading-[1.7] text-[#E8E8E3]">
        <div className="flex items-center justify-between border-b border-[#242422] px-4 py-2 text-[11px] text-[#8E8E86]">
          <span>.github/workflows/ci.yml</span>
          <span className="text-[#4ADE80]">
            {mode === 'dropin' ? '1 line changed' : 'automatic safety net'}
          </span>
        </div>

        <div className="p-4">
          <div className="text-[#A1A19A]">jobs:</div>
          <div className="pl-3 text-[#A1A19A]">test:</div>

          <AnimatePresence mode="wait">
            {mode === 'dropin' ? (
              <motion.div
                key="dropin-diff"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="my-1"
              >
                <div className="-mx-4 bg-[#3B1717]/60 px-4 text-[#FCA5A5] line-through decoration-[#EF4444]/60">
                  <span className="mr-2 select-none text-[#F87171]">-</span>
                  {'    runs-on: ubuntu-latest'}
                </div>
                <div className="-mx-4 border-l-2 border-[#22C55E] bg-[#143321]/75 px-4 text-[#86EFAC]">
                  <span className="mr-2 select-none text-[#4ADE80]">+</span>
                  {'    runs-on: open-ci-linux-x64'}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="fallback-diff"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="my-1"
              >
                <div className="-mx-4 border-l-2 border-[#22C55E] bg-[#143321]/75 px-4 text-[#86EFAC]">
                  <span className="mr-2 select-none text-[#4ADE80]">+</span>
                  {'    needs: route'}
                </div>
                <div className="-mx-4 border-l-2 border-[#22C55E] bg-[#143321]/75 px-4 text-[#86EFAC]">
                  <span className="mr-2 select-none text-[#4ADE80]">+</span>
                  {'    runs-on: ${{ needs.route.outputs.runner }}'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-1 pl-6 text-[#A1A19A]">steps:</div>
          <div className="flex items-center justify-between pl-9 text-[#D4D4CE]">
            <span>- uses: actions/checkout@v4</span>
            <span className="text-[10px] text-[#6B7280]">unchanged</span>
          </div>
          <div className="flex items-center justify-between pl-9 text-[#D4D4CE]">
            <span>- uses: actions/cache@v4</span>
            <span className="text-[10px] text-[#4ADE80]">instant NVMe</span>
          </div>
          <div className="pl-9 text-[#D4D4CE]">- run: npm test</div>
        </div>
      </div>
    </div>
  );
}

/* ==================== DEMO 3: INTERACTIVE EPHEMERAL LIFECYCLE ==================== */
const LIFECYCLE_STEPS = [
  {
    num: '01',
    title: 'Fresh VM boots in your VPC',
    detail: 'Dedicated clean machine launched inside your own AWS or GCP subnet.',
    tag: 'Isolated',
  },
  {
    num: '02',
    title: 'Job runs with zero cloud credentials',
    detail: 'Untrusted PR code never gets access to AWS, GCP, or production keys.',
    tag: 'Least privilege',
  },
  {
    num: '03',
    title: 'Disk wiped & VM destroyed',
    detail: 'The instance and local scratch disk are terminated the moment the job exits.',
    tag: 'Zero residue',
  },
] as const;

function InteractiveLifecycleDemo() {
  const [stepIndex, setStepIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LIFECYCLE_STEPS.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="studio-card flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 sm:p-7"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[20px] font-medium tracking-[-0.02em] text-[#0A0A0A]">
            Ephemeral &amp; private by default
          </h3>
          <ShieldCheck className="h-5 w-5 text-[#15803D]" />
        </div>
        <p className="mt-2 text-[14px] leading-[1.55] text-[#4B5563]">
          Your source code never leaves your cloud account. Every build gets a
          single-use VM that vanishes when finished.
        </p>
      </div>

      {/* 3-Step Animated Lifecycle Strip */}
      <div className="mt-5 space-y-2.5">
        {LIFECYCLE_STEPS.map((step, idx) => {
          const active = idx === stepIndex;
          return (
            <button
              key={step.num}
              type="button"
              onClick={() => {
                setPaused(true);
                setStepIndex(idx);
              }}
              className={`relative w-full overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                active
                  ? 'border-[#0A0A0A] bg-[#F9FAFB]'
                  : 'border-[#F1F2F4] bg-[#FFFFFF] hover:border-[#D1D5DB]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-[11px] font-medium ${
                      active
                        ? 'bg-[#0A0A0A] text-[#FFFFFF]'
                        : 'bg-[#F1F2F4] text-[#6B7280]'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span
                    className={`text-[13.5px] font-medium ${
                      active ? 'text-[#0A0A0A]' : 'text-[#4B5563]'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                    active
                      ? 'bg-[#F0FDF4] font-medium text-[#15803D]'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}
                >
                  {step.tag}
                </span>
              </div>
              <p className="mt-1.5 pl-8.5 text-[12.5px] leading-[1.45] text-[#6B7280]">
                {step.detail}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#F1F2F4] pt-3.5 font-mono text-[11px] text-[#6B7280]">
        <span className="font-medium text-[#15803D]">
          0 leaked VMs · 0 shared state
        </span>
        <span>100% inside your VPC</span>
      </div>
    </div>
  );
}

export function ProviderComparison() {
  return (
    <section
      id="compare"
      className="border-t border-[#E5E7EB] px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-[1120px]">
        {/* Part A: Side-by-Side Comparison Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="max-w-[660px] text-[34px] leading-[1.1] font-medium tracking-[-0.035em] text-[#0A0A0A] sm:text-[44px]">
            Raw cloud economics. Without the Kubernetes tax.
          </h2>
          <p className="mt-3 max-w-[560px] text-[16px] leading-[1.55] text-[#4B5563]">
            Hosted runners charge 8× markup. Managed SaaS locks you into their
            network. DIY Kubernetes costs an engineering team to maintain.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="studio-stage mt-9 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF]"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="w-[26%] px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.07em] text-[#6B7280]">
                    Capability
                  </th>
                  <th className="w-[22%] border-x border-[#E5E7EB] bg-[#FFFFFF] px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[14.5px] font-semibold text-[#0A0A0A]">
                        open-ci
                      </span>
                      <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 font-mono text-[10px] font-medium text-[#15803D]">
                        Your cloud
                      </span>
                    </div>
                  </th>
                  <th className="w-[17%] px-5 py-4 font-medium text-[#4B5563]">
                    GitHub-Hosted
                  </th>
                  <th className="w-[18%] px-5 py-4 font-medium text-[#4B5563]">
                    Managed SaaS
                  </th>
                  <th className="w-[17%] px-5 py-4 font-medium text-[#4B5563]">
                    Kubernetes ARC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F1F3]">
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.feature}
                    className="transition-colors hover:bg-[#F9FAFB]/60"
                  >
                    <td className="px-6 py-3.5 font-medium text-[#1F2937]">
                      {row.feature}
                    </td>
                    <td
                      className={`border-x border-[#E5E7EB] bg-[#FFFFFF] px-6 py-3.5 ${
                        row.highlightOpenCi ? 'font-mono text-[#15803D]' : ''
                      }`}
                    >
                      {row.highlightOpenCi ? (
                        <span className="font-semibold text-[#15803D]">
                          {row.openCi}
                        </span>
                      ) : (
                        <CellValue value={row.openCi} isOpenCi />
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <CellValue value={row.github} />
                    </td>
                    <td className="px-5 py-3.5">
                      <CellValue value={row.managedSaas} />
                    </td>
                    <td className="px-5 py-3.5">
                      <CellValue value={row.k8sArc} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Part B: 3 Alive Interactive Outcome Demos */}
        <div className="mt-16 space-y-6">
          <InteractiveFailoverDemo />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InteractiveDiffDemo />
            <InteractiveLifecycleDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
