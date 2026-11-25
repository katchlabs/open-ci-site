import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, Copy, Terminal } from 'lucide-react';

const DEMO_COMMAND =
  'docker run --rm -p 8080:8080 ghcr.io/katchlabs/open-ci:latest demo';

export function ClosingCta() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_COMMAND);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <section className="bg-[#0B0D0E] px-5 py-24 text-[#FFFFFF] sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[820px] text-center">
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[38px] leading-[1.08] font-medium tracking-[-0.035em] text-[#FFFFFF] sm:text-[52px]"
        >
          Let your agents ship nonstop.
          <br />
          <span className="text-[#34D399]">Stop paying 8× to test it.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-5 max-w-[540px] text-[16px] leading-[1.6] text-[#9AA39E]"
        >
          Keep your workflows, keep your cloud, burn your existing AWS &amp; GCP
          credits. Try a local demo in 30 seconds or deploy in 5 minutes.
        </motion.p>

        {/* Copyable 30-Second Local Demo Command */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-9 max-w-[680px]"
        >
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#262C2A] bg-[#151918] px-4 py-3 text-left">
            <div className="flex min-w-0 items-center gap-3 overflow-x-auto">
              <Terminal className="h-4 w-4 shrink-0 text-[#6B736E]" />
              <code className="font-mono text-[12.5px] text-[#E6EBE8] whitespace-nowrap sm:text-[13px]">
                {DEMO_COMMAND}
              </code>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11.5px] transition-all duration-150 cursor-pointer ${
                copied
                  ? 'border-[#10B981]/40 bg-[#143321] text-[#34D399]'
                  : 'border-[#2F3633] bg-[#1F2422] text-[#D3D9D5] hover:border-[#525A55] hover:text-[#FFFFFF]'
              }`}
              aria-label="Copy demo command"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Primary & Secondary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="https://github.com/katchlabs/open-ci"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#FFFFFF] px-5 text-[14px] font-medium text-[#0B0D0E] transition-all duration-150 hover:bg-[#E6EBE8] active:scale-[0.98]"
          >
            <span>Star on GitHub</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>

          <Link
            to="/docs/quickstart"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#2E3532] bg-transparent px-5 text-[14px] font-medium text-[#FFFFFF] transition-all duration-150 hover:border-[#4A524E] hover:bg-[#151918] active:scale-[0.98]"
          >
            <span>Read quickstart</span>
            <ArrowRight className="h-4 w-4 text-[#9AA39E]" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
