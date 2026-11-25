import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Check, Copy, Github, Terminal } from 'lucide-react';
import { FleetVisualizer } from './FleetVisualizer';

type InstallMethod = 'docker' | 'binary' | 'cargo';

const INSTALL_COMMANDS: Record<
  InstallMethod,
  { label: string; cmd: string; note: string }
> = {
  docker: {
    label: 'Docker',
    cmd: 'docker run --rm -p 8080:8080 ghcr.io/katchlabs/open-ci:latest demo --listen 0.0.0.0:8080',
    note: 'Multi-arch container (linux/amd64, linux/arm64) · zero cloud account needed for demo',
  },
  binary: {
    label: 'Linux Binary',
    cmd: 'curl -fsSL https://github.com/katchlabs/open-ci/releases/latest/download/open-ci-x86_64-unknown-linux-gnu.tar.gz | tar -xz -C /usr/local/bin && open-ci demo',
    note: 'Static-friendly Rust release binary for x86_64 and aarch64',
  },
  cargo: {
    label: 'Cargo',
    cmd: 'cargo run --bin open-ci -- demo --listen 127.0.0.1:8080',
    note: 'Build from source with Rust 1.89+ under unsafe_code = "forbid"',
  },
};

export function Hero() {
  const [method, setMethod] = useState<InstallMethod>('docker');
  const [copied, setCopied] = useState(false);

  const current = INSTALL_COMMANDS[method];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(current.cmd);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = current.cmd;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="relative overflow-hidden border-b border-[#1E2636]">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-45" />
      <div className="pointer-events-none absolute inset-0 bg-radial-forge" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left column: positioning, copy, install snippet, CTAs */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-3 py-1 font-mono text-xs font-medium text-[#FB923C]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
              Apache-2.0 · Single Rust Binary · AWS + GCP Spot
            </div>

            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-5xl lg:text-[54px] lg:leading-[1.06]">
              Your cloud.{' '}
              <span className="text-[#F97316]">Spot prices.</span>{' '}
              Zero markup.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
              Stop paying <span className="font-mono text-[#F8FAFC]">5×–8×</span>{' '}
              marked-up third-party runner SaaS or waiting on sluggish 2-core
              GitHub VMs. <code className="text-[#F8FAFC]">open-ci</code> runs in
              your own AWS or GCP account, launches ephemeral Spot runners with
              auto-NVMe scratch and built-in Actions v2 caching, attaches{' '}
              <span className="text-[#F8FAFC] font-medium">zero cloud IAM</span>{' '}
              to workers, and fails closed to GitHub-hosted runners automatically.
            </p>

            {/* Interactive 1-line install snippet */}
            <div className="mt-7 overflow-hidden rounded-xl border border-[#1E2636] bg-[#0B0E16]">
              <div className="flex items-center justify-between border-b border-[#1E2636] bg-[#111520]/80 px-3 py-2">
                <div className="flex items-center gap-1">
                  {(['docker', 'binary', 'cargo'] as InstallMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition cursor-pointer ${
                        method === m
                          ? 'bg-[#1E2636] text-[#F8FAFC]'
                          : 'text-[#64748B] hover:text-[#CBD5E1]'
                      }`}
                    >
                      {INSTALL_COMMANDS[m].label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#1E2636] bg-[#090B10] px-2.5 py-1 font-mono text-[11px] text-[#94A3B8] transition hover:border-[#2A354B] hover:text-[#F8FAFC] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#10B981]" />
                      <span className="text-[#10B981]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto px-3.5 py-3 font-mono text-xs text-[#E2E8F0]">
                <Terminal className="h-3.5 w-3.5 shrink-0 text-[#F97316]" />
                <code className="whitespace-nowrap">{current.cmd}</code>
              </div>
              <div className="border-t border-[#1E2636]/70 bg-[#090B10]/60 px-3.5 py-1.5 font-mono text-[11px] text-[#64748B]">
                {current.note}
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 text-sm font-semibold text-[#090B10] shadow-lg shadow-[#F97316]/20 transition hover:bg-[#FB923C]"
              >
                Get Started in 60s
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#savings"
                className="inline-flex items-center gap-2 rounded-xl border border-[#1E2636] bg-[#111520] px-5 py-3 text-sm font-semibold text-[#F8FAFC] transition hover:border-[#2A354B] hover:bg-[#161C2B]"
              >
                <Calculator className="h-4 w-4 text-[#10B981]" />
                Calculate Your Savings
              </a>
              <a
                href="https://github.com/katchlabs/open-ci"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[#1E2636] bg-transparent px-4 py-3 text-sm font-medium text-[#CBD5E1] transition hover:border-[#2A354B] hover:bg-[#111520] hover:text-[#F8FAFC]"
              >
                <Github className="h-4 w-4" />
                GitHub ★
              </a>
            </div>
          </div>

          {/* Right column: Live Fleet Visualizer */}
          <div className="lg:col-span-6">
            <FleetVisualizer />
          </div>
        </div>
      </div>
    </section>
  );
}
