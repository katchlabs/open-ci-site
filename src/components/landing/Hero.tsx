import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { HeroPerimeterCanvas } from './HeroPerimeterCanvas';
import { HeroPlayground, PlaygroundTab } from './HeroPlayground';

const EASE = [0.22, 1, 0.36, 1] as const;
const DOCKER_CMD = 'docker run -p 8080:8080 ghcr.io/katchlabs/open-ci demo';
/** What lands on the clipboard: the full, working form from the quickstart docs. */
const DOCKER_CMD_FULL = 'docker run --rm -p 8080:8080 ghcr.io/katchlabs/open-ci:latest demo --listen 0.0.0.0:8080';

function DockerCopyChip() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DOCKER_CMD_FULL);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (insecure context): leave the command selectable.
    }
  };

  return (
    <motion.button
      type="button"
      onClick={copy}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label={`Copy command: ${DOCKER_CMD_FULL}`}
      className={`group inline-flex h-12 max-w-full cursor-pointer items-center gap-3 rounded-xl border bg-white pr-2 pl-4 font-mono text-[13px] shadow-[0_1px_2px_rgba(11,13,14,0.04)] transition-colors duration-150 ${
        copied ? 'border-[#A7F3D0]' : 'border-[#E2E7E4] hover:border-[#D3D9D5]'
      }`}
    >
      <span className="min-w-0 truncate text-left text-[#0B0D0E]">
        <span className="text-[#059669] select-none">$ </span>
        {DOCKER_CMD}
      </span>
      <span
        className={`relative inline-flex h-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border px-2 text-[11.5px] font-medium transition-colors duration-150 ${
          copied
            ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]'
            : 'border-[#ECEFEA] bg-[#F7F9F8] text-[#525A55] group-hover:text-[#0B0D0E]'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="copied"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="inline-flex items-center gap-1"
            >
              Copied <Check className="h-3.5 w-3.5" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="inline-flex items-center"
            >
              <Copy className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

export function Hero() {
  const [tab, setTab] = useState<PlaygroundTab>('savings');

  return (
    <section className="relative isolate overflow-hidden bg-white">
      <HeroPerimeterCanvas />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 pt-12 pb-20 sm:px-8 sm:pt-14">
        <div className="mx-auto max-w-[860px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-lg border border-[#ECEFEA] bg-white/80 px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.08em] text-[#525A55] uppercase backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-50 motion-reduce:hidden" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            </span>
            <span>Apache-2.0 open source</span>
            <span className="text-[#C9D0CB]">·</span>
            <span className="text-[#0B0D0E]">AWS &amp; GCP Spot runners</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
            className="mt-6 text-[40px] leading-[1.04] font-medium tracking-[-0.04em] text-[#0B0D0E] sm:text-[56px] lg:text-[66px]"
          >
            GitHub Actions at raw
            <br />
            cloud{' '}
            <span className="relative inline-block text-[#059669]">
              Spot prices.
              <motion.span
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
                className="absolute inset-x-[2px] -bottom-[2px] h-[3px] origin-left rounded-full bg-[#10B981]/35"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            className="mx-auto mt-5 max-w-[540px] text-[16.5px] leading-[1.55] text-[#525A55] sm:text-[18px]"
          >
            Run builds in your own AWS and GCP accounts. Faster machines, up to 90% lower bills, zero vendor lock-in.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: EASE }}
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
              <Link
                to="/docs/quickstart"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0B0D0E] px-6 text-[15px] font-medium whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,13,14,0.16),0_8px_20px_-10px_rgba(11,13,14,0.5)] transition-colors duration-150 hover:bg-[#1F2422]"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <DockerCopyChip />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.22, ease: EASE }}
          className="mx-auto mt-10 max-w-[740px]"
        >
          <HeroPlayground tab={tab} onTabChange={setTab} />
        </motion.div>
      </div>
    </section>
  );
}
