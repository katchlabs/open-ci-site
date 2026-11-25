import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy } from 'lucide-react';
import { FleetVisualizer } from './FleetVisualizer';

type InstallMethod = 'docker' | 'binary' | 'cargo';

const INSTALL_COMMANDS: Record<InstallMethod, { label: string; cmd: string }> = {
  docker: {
    label: 'Docker',
    cmd: 'docker run --rm -p 8080:8080 ghcr.io/katchlabs/open-ci demo',
  },
  binary: {
    label: 'Binary',
    cmd: 'curl -fsSL https://github.com/katchlabs/open-ci/releases/latest/download/open-ci-x86_64-unknown-linux-gnu.tar.gz | tar -xz && ./open-ci demo',
  },
  cargo: {
    label: 'Cargo',
    cmd: 'cargo run --bin open-ci -- demo --listen 127.0.0.1:8080',
  },
};

export function Hero() {
  const [method, setMethod] = useState<InstallMethod>('docker');
  const [copied, setCopied] = useState(false);

  const current = INSTALL_COMMANDS[method];
  const needsFade = method === 'binary';

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
    <section className="border-b border-[#E4E4DF]">
      <div className="mx-auto max-w-[1160px] px-5 pt-10 pb-12 sm:px-8 sm:pt-12 lg:pt-12 lg:pb-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
          OPEN-CI · V0.1.1 · APACHE-2.0 · SELF-HOSTED
        </p>

        <h1 className="mt-3.5 font-sans text-[34px] font-medium leading-[1.06] tracking-[-0.035em] text-[#111111] sm:text-[48px] lg:text-[56px]">
          GitHub Actions at raw Spot prices.
          <span className="mt-1.5 block font-normal text-[24px] leading-[1.15] tracking-[-0.025em] text-[#6E6E67] sm:text-[34px] lg:text-[40px]">
            Your AWS and GCP accounts. Zero markup.
          </span>
        </h1>

        <p className="mt-4 max-w-[600px] text-[15.5px] leading-[1.6] text-[#555550] sm:text-[16.5px]">
          A single Rust binary that provisions ephemeral Spot runners inside
          your own cloud account, with built-in Actions v2 caching and auto-NVMe
          scratch. Zero cloud IAM on workers, automatic failover across zones,
          and fail-closed fallback to GitHub-hosted runners.
        </p>

        {/* Action bar + matched-height command strip */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="#savings"
              className="inline-flex h-10 items-center justify-center rounded bg-[#111111] px-4.5 text-[13px] font-medium text-[#FFFFFF] transition-all duration-150 hover:bg-[#262624] active:scale-[0.98]"
            >
              Calculate your savings
            </a>
            <Link
              to="/docs"
              className="inline-flex h-10 items-center justify-center rounded border border-[#E4E4DF] bg-[#FFFFFF] px-4.5 text-[13px] font-medium text-[#111111] transition-all duration-150 hover:border-[#D2D2CA] hover:bg-[#FAFAF8] active:scale-[0.98]"
            >
              Read the docs
            </Link>
          </div>

          <div className="flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded border border-[#E4E4DF] bg-[#FFFFFF]">
            <div className="flex h-full shrink-0 items-center gap-0.5 border-r border-[#E4E4DF] bg-[#FAFAF8] px-1.5 font-mono text-[11px]">
              {(['docker', 'binary', 'cargo'] as InstallMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`rounded-[3px] px-2 py-1 transition-colors duration-150 cursor-pointer ${
                    method === m
                      ? 'bg-[#ECECE7] font-medium text-[#111111]'
                      : 'text-[#6E6E67] hover:text-[#111111]'
                  }`}
                >
                  {INSTALL_COMMANDS[m].label}
                </button>
              ))}
            </div>
            <div
              className={`min-w-0 flex-1 overflow-x-auto px-3 font-mono text-[12px] text-[#111111] ${
                needsFade ? 'cmd-fade-mask' : ''
              }`}
            >
              <code className="whitespace-nowrap">{current.cmd}</code>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy quickstart command"
              className="inline-flex h-full shrink-0 items-center gap-1.5 border-l border-[#E4E4DF] px-3 font-mono text-[11px] text-[#555550] transition-colors duration-150 hover:bg-[#FAFAF8] hover:text-[#111111] active:scale-[0.98] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#15803D]" />
                  <span className="text-[#15803D]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product-first instrument panel — sits cleanly above the fold */}
        <div className="mt-7">
          <FleetVisualizer />
        </div>
      </div>
    </section>
  );
}
