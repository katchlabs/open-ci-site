import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const WHEN_OPEN_CI: ReactNode[] = [
  'Monthly CI spend exceeds $400 and you want 84–87% lower Linux runner costs.',
  'You have AWS or GCP credits, EDP commitments, or private VPC targets to reach.',
  <>
    Your Rust, TypeScript, Playwright, or BuildKit jobs benefit from{' '}
    <span className="whitespace-nowrap">4–16 vCPU</span> and local NVMe.
  </>,
  'Security policy requires source code, secrets, and build caches to stay inside your own cloud account.',
];

const WHEN_GITHUB_HOSTED: ReactNode[] = [
  'Your CI bill is under $150/month and 2-core GitHub-hosted VMs are already fast enough.',
  'You need macOS (Xcode) or Windows runners — open-ci targets Linux x86_64 and aarch64 VMs.',
  'You prefer zero cloud infrastructure to maintain, even a single Terraform-managed controller VM.',
  'You require active-active multi-node control-plane HA today (SQLite WAL handles hundreds of concurrent runners per node).',
];

export function TradeoffsSection() {
  return (
    <>
      <section className="border-b border-[#E4E4DF]">
        <div className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
              05 / HONEST TRADEOFFS
            </div>
            <h2 className="mt-3 font-sans text-[28px] font-medium leading-[1.12] tracking-[-0.025em] text-[#111111] sm:text-[38px]">
              Where it pays off, and where it does not.
            </h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-lg border border-[#E4E4DF] bg-[#FFFFFF]">
            <div className="grid grid-cols-1 divide-y divide-[#E4E4DF] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <div className="p-6 sm:p-8">
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#15803D]">
                  When open-ci pays off
                </div>
                <ul className="mt-5 divide-y divide-[#E4E4DF]">
                  {WHEN_OPEN_CI.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0 text-[14px] leading-[1.6] text-[#111111]"
                    >
                      <span className="mt-0.5 font-mono text-[11px] text-[#15803D] tabular-nums">
                        +0{idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 sm:p-8">
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
                  When GitHub-hosted is simpler
                </div>
                <ul className="mt-5 divide-y divide-[#E4E4DF]">
                  {WHEN_GITHUB_HOSTED.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0 text-[14px] leading-[1.6] text-[#555550]"
                    >
                      <span className="mt-0.5 font-mono text-[11px] text-[#6E6E67] tabular-nums">
                        −0{idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet closing CTA band */}
      <section>
        <div className="mx-auto max-w-[1160px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
                LOCAL SANDBOX · ZERO CLOUD CREDENTIALS
              </div>
              <h2 className="mt-3 font-sans text-[28px] font-medium leading-[1.12] tracking-[-0.025em] text-[#111111] sm:text-[40px]">
                Try it locally in 30 seconds.
              </h2>
              <p className="mt-3 text-[15px] leading-[1.6] text-[#555550]">
                Boot the full control plane against the built-in MockProvider on
                localhost, or deploy turnkey AWS and GCP Terraform modules when
                you are ready.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/katchlabs/open-ci"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded bg-[#111111] px-5 text-[13px] font-medium text-[#FFFFFF] transition-all duration-150 hover:bg-[#262624] active:scale-[0.98]"
              >
                <span>Star on GitHub</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <Link
                to="/docs/quickstart"
                className="inline-flex h-10 items-center rounded border border-[#E4E4DF] bg-[#FFFFFF] px-5 text-[13px] font-medium text-[#111111] transition-all duration-150 hover:border-[#D2D2CA] hover:bg-[#FAFAF8] active:scale-[0.98]"
              >
                Read quickstart
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
