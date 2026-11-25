import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Cloud,
  Cpu,
  HardDrive,
  KeyRound,
  Lock,
} from 'lucide-react';

export function FeatureBento() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-b border-[#1E2636] bg-[#0B0E16]/50 py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#F97316]">
            Engineered From First Principles
          </div>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-[#F8FAFC] sm:text-4xl">
            Every layer built for Spot resilience, speed, and hostile CI workloads.
          </h2>
          <p className="mt-3 text-base text-[#94A3B8]">
            No brittle shell wrappers around cloud CLIs. No third-party control
            planes holding your GitHub tokens. One modular Rust workspace with
            hexagonal boundaries.
          </p>
        </div>

        {/* 5-card precision Bento Grid */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-6">
          {/* Card 1: Multi-cloud pure-Rust (span 3) */}
          <div className="group flex flex-col justify-between rounded-2xl border border-[#1E2636] bg-[#111520] p-6 transition hover:border-[#2A354B] md:col-span-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316]">
                  <Cloud className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-[#1E2636] bg-[#090B10] px-2.5 py-0.5 font-mono text-[11px] text-[#94A3B8]">
                  EC2 SigV4 + GCE REST
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-[#F8FAFC]">
                Multi-Cloud Pure-Rust Provisioning
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#94A3B8]">
                Direct AWS EC2/STS SigV4 XML and GCP Compute Engine REST adapters
                with zero <code className="text-[#CBD5E1]">aws</code> or{' '}
                <code className="text-[#CBD5E1]">gcloud</code> subprocesses.
                Weighted multi-cloud placement automatically backs off stocked-out
                Spot zones (90s) or quotas (300s) and spills cleanly across AZs,
                machine families, or clouds.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 font-mono text-[11px] text-[#CBD5E1]">
              <span className="rounded-md border border-[#1E2636] bg-[#090B10] px-2.5 py-1">
                x86_64 &amp; ARM64 Graviton
              </span>
              <span className="rounded-md border border-[#1E2636] bg-[#090B10] px-2.5 py-1">
                Spot + On-Demand mix
              </span>
              <span className="rounded-md border border-[#1E2636] bg-[#090B10] px-2.5 py-1">
                Idempotent ClientToken
              </span>
            </div>
          </div>

          {/* Card 2: Transparent Actions v2 Cache + Auto-NVMe (span 3) */}
          <div className="group flex flex-col justify-between rounded-2xl border border-[#1E2636] bg-[#111520] p-6 transition hover:border-[#2A354B] md:col-span-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]">
                  <HardDrive className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-0.5 font-mono text-[11px] text-[#10B981]">
                  open-ci cache + RAID0
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-[#F8FAFC]">
                Transparent Actions v2 Cache &amp; Auto-NVMe
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#94A3B8]">
                Built-in Twirp + Azure blob cache server verified against the
                official <code className="text-[#CBD5E1]">@actions/cache</code>{' '}
                client. Authorizes each job with its own{' '}
                <code className="text-[#CBD5E1]">ACTIONS_RUNTIME_TOKEN</code>,
                isolates entries per repo &amp; Git ref, streams to local NVMe,
                S3/R2/MinIO, or native GCS, and auto-stripes local NVMe SSDs into
                RAID0 for Docker layers, <code className="text-[#CBD5E1]">RUNNER_WORKDIR</code>,
                and <code className="text-[#CBD5E1]">TMPDIR</code>.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#1E2636] pt-4">
              <span className="font-mono text-[11px] text-[#94A3B8]">
                Works with actions/cache, setup-*, rust-cache, BuildKit
              </span>
              <Link
                to="/docs/caching"
                className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#10B981] hover:underline"
              >
                Caching docs
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Zero-IAM Defense-in-Depth (span 2) */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#1E2636] bg-[#111520] p-6 transition hover:border-[#2A354B] md:col-span-2">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316]">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-[#F8FAFC]">
                Zero-IAM Defense-in-Depth
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                Assumes CI jobs are hostile. Workers boot with{' '}
                <code className="text-[#CBD5E1]">serviceAccounts: []</code> on
                GCP, no instance profile + IMDSv2 enforced on AWS, zero inbound
                ports, scrubbed user-data, single-use atomic SQLite HMAC
                bootstrap, and triple-layer expiry (reconciler +{' '}
                <code className="text-[#CBD5E1]">maxRunDuration</code> / AWS
                Lambda janitor + guest poweroff).
              </p>
            </div>
            <Link
              to="/docs/security"
              className="mt-5 inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#F97316] hover:text-[#FB923C]"
            >
              Read Threat Model
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 4: Org-Wide & BYOC Keyless Identity (span 2) */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#1E2636] bg-[#111520] p-6 transition hover:border-[#2A354B] md:col-span-2">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-[#F8FAFC]">
                Org-Wide &amp; Keyless BYOC
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                Serve one repo or an entire GitHub organization with{' '}
                <code className="text-[#CBD5E1]">allowed_repositories</code> and{' '}
                <code className="text-[#CBD5E1]">runner_group_id</code>. Supports
                cross-account AWS <code className="text-[#CBD5E1]">AssumeRole</code>{' '}
                + <code className="text-[#CBD5E1]">ExternalId</code>, GCP SA
                impersonation, and keyless GCP→AWS web identity federation — zero
                static cloud keys on disk.
              </p>
            </div>
            <Link
              to="/docs/quickstart"
              className="mt-5 inline-flex items-center gap-1 font-mono text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              Terraform Modules
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 5: Strict Rust Engineering (span 2) */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#1E2636] bg-[#111520] p-6 transition hover:border-[#2A354B] md:col-span-2">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-[#F8FAFC]">
                Strict Rust Engineering
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                Compiles under <code className="text-[#CBD5E1]">unsafe_code = "forbid"</code>,{' '}
                <code className="text-[#CBD5E1]">unwrap_used = "deny"</code>,{' '}
                <code className="text-[#CBD5E1]">expect_used = "deny"</code>, and{' '}
                <code className="text-[#CBD5E1]">panic = "deny"</code>. Verified
                by a 7-gate proof ladder including <code className="text-[#CBD5E1]">proptest</code>{' '}
                invariants, SQLite WAL races, and real compiled-binary HTTP + DB
                assertions.
              </p>
            </div>
            <Link
              to="/docs/engineering"
              className="mt-5 inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#10B981] hover:underline"
            >
              7-Gate Proof Ladder
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
