import { Link } from 'react-router-dom';
import { ArrowRight, Check, Github, Minus, Scale } from 'lucide-react';

const USE_OPEN_CI = [
  'You spend $400–$12,000+/month on GitHub Actions or third-party runner SaaS and want 84–87% lower compute bills.',
  'You have AWS or GCP credits, EDP commitments, or private VPC services your CI jobs need to reach securely.',
  'You run heavy Rust, TypeScript, Playwright, or Docker BuildKit suites that benefit from 4–16 vCPU + local NVMe + fast Actions v2 caching.',
  'Your security bar requires keeping source code, secrets, and build artifacts strictly inside your own cloud account.',
];

const USE_GITHUB_HOSTED = [
  'Your monthly CI bill is under ~$150 and standard 2–4 core runners already finish fast enough.',
  'You need macOS (Xcode/iOS) or Windows runners — open-ci targets x86_64 and aarch64 Ubuntu Linux VMs today.',
  'You want zero infrastructure to provision (even a single $15/mo Terraform-managed controller VM).',
  'You require active-active multi-node control plane HA today (SQLite WAL handles hundreds of concurrent runners per node; PostgresStore is on the roadmap).',
];

export function TradeoffsSection() {
  return (
    <>
      <section className="border-b border-[#1E2636] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              <Scale className="h-3.5 w-3.5 text-[#F97316]" />
              Transparent Engineering Tradeoffs
            </div>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-[#F8FAFC] sm:text-4xl">
              Honest boundaries over marketing hype.
            </h2>
            <p className="mt-3 text-base text-[#94A3B8]">
              Every architecture has tradeoffs. Here is when{' '}
              <code className="text-[#F8FAFC]">open-ci</code> pays off immediately
              — and when sticking with standard GitHub-hosted runners is the
              smarter engineering call.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* When open-ci shines */}
            <div className="rounded-2xl border border-[#10B981]/30 bg-[#111520] p-6 sm:p-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 font-mono text-xs font-semibold text-[#10B981]">
                Use open-ci when
              </div>
              <ul className="mt-5 space-y-4">
                {USE_OPEN_CI.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-[#E2E8F0]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* When GitHub-hosted is simpler */}
            <div className="rounded-2xl border border-[#1E2636] bg-[#111520] p-6 sm:p-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2A354B] bg-[#090B10] px-3 py-1 font-mono text-xs font-semibold text-[#94A3B8]">
                GitHub-hosted is simpler when
              </div>
              <ul className="mt-5 space-y-4">
                {USE_GITHUB_HOSTED.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-[#94A3B8]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1E2636] text-[#94A3B8]">
                      <Minus className="h-3.5 w-3.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final Launch CTA */}
      <section className="relative overflow-hidden py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-radial-forge opacity-70" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1E2636] bg-[#111520] px-3.5 py-1 font-mono text-xs text-[#CBD5E1]">
            Ready in 60 seconds locally · 15 minutes with Terraform
          </div>
          <h2 className="mt-5 font-display text-3xl font-extrabold text-[#F8FAFC] sm:text-5xl">
            Take back your CI bill and your security perimeter.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#94A3B8] sm:text-lg">
            Spin up the local sandbox right now with zero cloud credentials, or
            deploy turnkey AWS, GCP, or multi-cloud Terraform modules in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/docs/quickstart"
              className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-6 py-3.5 text-sm font-semibold text-[#090B10] shadow-lg shadow-[#F97316]/25 transition hover:bg-[#FB923C]"
            >
              Deploy with Terraform
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1E2636] bg-[#111520] px-6 py-3.5 text-sm font-semibold text-[#F8FAFC] transition hover:border-[#2A354B] hover:bg-[#161C2B]"
            >
              Read the Documentation
            </Link>
            <a
              href="https://github.com/katchlabs/open-ci"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1E2636] bg-transparent px-5 py-3.5 text-sm font-medium text-[#CBD5E1] transition hover:border-[#2A354B] hover:bg-[#111520] hover:text-[#F8FAFC]"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
