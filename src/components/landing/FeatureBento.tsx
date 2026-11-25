import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface SpecCell {
  index: string;
  title: string;
  body: string;
  spec: string;
  href: string;
}

const SPEC_CELLS: SpecCell[] = [
  {
    index: '01',
    title: 'Direct cloud provisioning',
    body: 'Pure-Rust EC2 SigV4 XML and Compute Engine REST adapters with zero CLI subprocesses. Weighted placement backs off stocked-out zones for 90s and spills across AZs or clouds.',
    spec: 'EC2 SigV4 · GCE REST · Idempotent ClientToken',
    href: '/docs/architecture',
  },
  {
    index: '02',
    title: 'Built-in Actions v2 cache',
    body: 'Twirp and blob cache server verified against the official @actions/cache client. Authorizes jobs with ACTIONS_RUNTIME_TOKEN and scopes entries per repository and Git ref.',
    spec: 'Local NVMe · S3 / R2 / MinIO · Native GCS',
    href: '/docs/caching',
  },
  {
    index: '03',
    title: 'Auto-NVMe scratch striping',
    body: 'Boot-time discovery formats and stripes attached local NVMe devices into RAID0 automatically. Routes Docker layers, RUNNER_WORKDIR, and TMPDIR onto fast ephemeral storage.',
    spec: 'EXT4 / RAID0 /mnt/nvme · zero workflow edits',
    href: '/docs/caching',
  },
  {
    index: '04',
    title: 'Zero-IAM ephemeral workers',
    body: 'Treats every CI job as untrusted code. Workers boot without cloud credentials or inbound ports, scrub user-data prior to job start, and burn a single-use HMAC bootstrap token.',
    spec: 'serviceAccounts: [] · IMDSv2 · 1× HMAC',
    href: '/docs/security',
  },
  {
    index: '05',
    title: 'Keyless org-wide BYOC',
    body: 'Serve one repository or an entire GitHub organization with repository allowlists and runner groups. Authenticates via cross-account AssumeRole, SA impersonation, or web identity.',
    spec: 'AssumeRole + ExternalId · zero static keys',
    href: '/docs/quickstart',
  },
  {
    index: '06',
    title: 'Strict Rust & 7-gate proof',
    body: 'Zero-I/O hexagonal core backed by SQLite WAL with fs2 file locking. Verified on every commit by proptest state invariants, concurrency races, and compiled-binary HTTP assertions.',
    spec: 'unsafe_code = "forbid" · unwrap_used = "deny"',
    href: '/docs/engineering',
  },
];

export function FeatureBento() {
  return (
    <section id="architecture" className="scroll-mt-16 border-b border-[#E4E4DF]">
      <div className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
            04 / ARCHITECTURE
          </div>
          <h2 className="mt-3 font-sans text-[28px] font-medium leading-[1.12] tracking-[-0.025em] text-[#111111] sm:text-[38px]">
            Built as one modular system.
          </h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#555550]">
            No third-party control plane holding your GitHub tokens. No shell
            wrappers around cloud CLIs.
          </p>
        </div>

        {/* Flat 3x2 hairline-ruled specification grid — every cell links directly to its docs */}
        <div className="mt-10 overflow-hidden rounded-lg border border-[#E4E4DF] bg-[#FFFFFF]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {SPEC_CELLS.map((cell, idx) => (
              <Link
                key={cell.index}
                to={cell.href}
                className={`group flex flex-col justify-between p-6 transition-colors duration-150 hover:bg-[#FAFAF8] sm:p-7 ${
                  idx > 0 ? 'border-t border-[#E4E4DF]' : ''
                } ${
                  idx === 1 ? 'md:border-t-0' : ''
                } ${
                  idx === 2 ? 'lg:border-t-0' : ''
                } ${
                  idx % 2 === 1 ? 'md:border-l md:border-[#E4E4DF]' : ''
                } ${
                  idx % 3 !== 0 ? 'lg:border-l lg:border-[#E4E4DF]' : 'lg:border-l-0'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#6E6E67] tabular-nums">
                      {cell.index}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[#B5B5AD] transition-colors duration-150 group-hover:text-[#111111]" />
                  </div>

                  <h3 className="mt-4 font-sans text-[16px] font-medium tracking-[-0.015em] text-[#111111]">
                    {cell.title}
                  </h3>

                  <p className="mt-2 text-[13.5px] leading-[1.6] text-[#555550]">
                    {cell.body}
                  </p>
                </div>

                <div className="mt-6 border-t border-[#E4E4DF] pt-3.5 font-mono text-[11px] text-[#6E6E67]">
                  {cell.spec}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
