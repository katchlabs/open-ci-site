import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-[#E4E4DF] bg-[#F5F5F2]">
      <div className="mx-auto max-w-[1160px] px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-[#555550]">
              Ephemeral GitHub Actions runners on AWS and GCP Spot VMs. Built in
              Rust by{' '}
              <a
                href="https://github.com/katchlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#111111] underline decoration-[#D2D2CA] underline-offset-4 transition-colors hover:decoration-[#111111]"
              >
                Katch Labs
              </a>
              .
            </p>
            <div className="mt-4 font-mono text-[11px] text-[#6E6E67]">
              Apache-2.0 · unsafe_code = "forbid"
            </div>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
              Documentation
            </div>
            <ul className="mt-3 space-y-2 text-[13px] text-[#555550]">
              <li>
                <Link to="/docs" className="transition-colors hover:text-[#111111]">
                  Overview &amp; 60s demo
                </Link>
              </li>
              <li>
                <Link to="/docs/quickstart" className="transition-colors hover:text-[#111111]">
                  Deployment quickstart
                </Link>
              </li>
              <li>
                <Link to="/docs/configuration" className="transition-colors hover:text-[#111111]">
                  open-ci.toml reference
                </Link>
              </li>
              <li>
                <Link to="/docs/caching" className="transition-colors hover:text-[#111111]">
                  Actions v2 cache &amp; NVMe
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
              Reference
            </div>
            <ul className="mt-3 space-y-2 text-[13px] text-[#555550]">
              <li>
                <Link to="/docs/architecture" className="transition-colors hover:text-[#111111]">
                  Architecture &amp; HTTP API
                </Link>
              </li>
              <li>
                <Link to="/docs/security" className="transition-colors hover:text-[#111111]">
                  Security &amp; threat model
                </Link>
              </li>
              <li>
                <Link to="/docs/engineering" className="transition-colors hover:text-[#111111]">
                  7-gate proof ladder
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/katchlabs/open-ci"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#111111]"
                >
                  katchlabs/open-ci
                  <ArrowUpRight className="h-3 w-3 text-[#6E6E67]" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-[#E4E4DF] pt-6 font-mono text-[11px] text-[#6E6E67] sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Katch Labs · Apache License 2.0</span>
          <span>AWS EC2 &amp; GCP Compute Engine</span>
        </div>
      </div>
    </footer>
  );
}
