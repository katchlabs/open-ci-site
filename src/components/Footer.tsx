import { Link } from 'react-router-dom';
import { Github, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-[#1E2636] bg-[#07090D]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#94A3B8]">
              Your cloud. Spot prices. Zero markup. Ephemeral GitHub Actions
              runners on AWS and GCP, built in Rust by{' '}
              <a
                href="https://github.com/katchlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F8FAFC] underline decoration-[#1E2636] underline-offset-4 hover:decoration-[#F97316]"
              >
                Katch Labs
              </a>
              .
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1E2636] bg-[#111520] px-2.5 py-1 font-mono text-[#94A3B8]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                Apache-2.0
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1E2636] bg-[#111520] px-2.5 py-1 font-mono text-[#94A3B8]">
                unsafe_code = "forbid"
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#F8FAFC]">
              Documentation
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#94A3B8]">
              <li>
                <Link to="/docs" className="transition hover:text-[#F8FAFC]">
                  Overview &amp; 60s Demo
                </Link>
              </li>
              <li>
                <Link to="/docs/quickstart" className="transition hover:text-[#F8FAFC]">
                  Deployment Quickstart
                </Link>
              </li>
              <li>
                <Link to="/docs/configuration" className="transition hover:text-[#F8FAFC]">
                  open-ci.toml Reference
                </Link>
              </li>
              <li>
                <Link to="/docs/caching" className="transition hover:text-[#F8FAFC]">
                  Actions v2 Cache &amp; NVMe
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#F8FAFC]">
              Engineering
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#94A3B8]">
              <li>
                <Link to="/docs/architecture" className="transition hover:text-[#F8FAFC]">
                  Architecture &amp; HTTP API
                </Link>
              </li>
              <li>
                <Link to="/docs/security" className="transition hover:text-[#F8FAFC]">
                  Security &amp; Threat Model
                </Link>
              </li>
              <li>
                <Link to="/docs/engineering" className="transition hover:text-[#F8FAFC]">
                  7-Gate Proof Ladder
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/katchlabs/open-ci"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition hover:text-[#F8FAFC]"
                >
                  <Github className="h-3.5 w-3.5" />
                  katchlabs/open-ci
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-[#1E2636] pt-6 text-xs text-[#64748B] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Katch Labs. Released under the Apache License, Version 2.0.</p>
          <p className="font-mono">Single Rust binary · Zero vendor lock-in</p>
        </div>
      </div>
    </footer>
  );
}
