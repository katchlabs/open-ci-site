import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Github } from 'lucide-react';
import { HeroPerimeterCanvas } from './HeroPerimeterCanvas';
import { HeroPlayground, PlaygroundTab } from './HeroPlayground';

const EASE = [0.22, 1, 0.36, 1] as const;

function AwsBadge() {
  return (
    <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#232F3E] ring-2 ring-white">
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <text x="12" y="12.5" textAnchor="middle" fontSize="7.4" fontWeight="700" fill="#FFFFFF" fontFamily="Inter, sans-serif">
          aws
        </text>
        <path d="M6.2 15.2c3.6 2 8 2 11.6 0" stroke="#FF9900" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M16.4 14.3l1.5.8-.4 1.6" stroke="#FF9900" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function GcpBadge() {
  return (
    <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-white shadow-[inset_0_0_0_1px_#E5E7EB]">
      <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" aria-hidden="true">
        <path d="M14.6 8.6l1.5-1.5.1-.6A6.6 6.6 0 005.5 9.8l.5-.1 3-.5.2-.2a3.7 3.7 0 015.4-.4z" fill="#EA4335" />
        <path d="M18.8 9.8a6.7 6.7 0 00-2-3.2l-2.1 2.1a3.7 3.7 0 011.4 2.9v.4a1.8 1.8 0 010 3.7h-3.7l-.4.4v2.2l.4.4h3.7a4.8 4.8 0 002.7-8.9z" fill="#4285F4" />
        <path d="M8.3 18.7H12v-3H8.3a1.8 1.8 0 01-.8-.2l-.5.2-1.5 1.5-.1.5a4.8 4.8 0 002.9 1z" fill="#34A853" />
        <path d="M8.3 9a4.8 4.8 0 00-2.9 8.6l2.1-2.1a1.8 1.8 0 112.4-2.4l2.1-2.1A4.8 4.8 0 008.3 9z" fill="#FBBC05" />
      </svg>
    </span>
  );
}

function GithubBadge() {
  return (
    <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#0A0A0A] ring-2 ring-white">
      <Github className="h-3.5 w-3.5 text-white" />
    </span>
  );
}

export function Hero() {
  const [tab, setTab] = useState<PlaygroundTab>('estimate');
  const playgroundRef = useRef<HTMLDivElement | null>(null);

  const connectClouds = () => {
    setTab('switch');
    const el = playgroundRef.current;
    if (el && el.getBoundingClientRect().bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-white">
      <HeroPerimeterCanvas />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 pt-12 pb-20 sm:px-8 sm:pt-14">
        <div className="mx-auto max-w-[860px] text-center">
          <motion.a
            href="#savings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="group inline-flex items-center gap-1.5 text-[13.5px] text-[#4B5563] transition-colors hover:text-[#0A0A0A]"
          >
            <span>Apache-2.0 open source</span>
            <span className="text-[#D1D5DB]">·</span>
            <span className="font-medium text-[#1D4ED8]">Up to 90% lower GitHub Actions bills</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#1D4ED8] transition-transform duration-150 group-hover:translate-x-0.5" />
          </motion.a>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
            className="mt-5 text-[40px] leading-[1.06] font-medium tracking-[-0.04em] text-[#0A0A0A] sm:text-[56px] lg:text-[68px]"
          >
            GitHub Actions runners
            <br />
            on your own Spot cloud
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            className="mx-auto mt-5 max-w-[580px] text-[16.5px] leading-[1.55] text-[#4B5563] sm:text-[18px]"
          >
            Change one line. Jobs run on faster Spot machines in your AWS or GCP
            account — for ~87% less than GitHub-hosted runners.
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111111] px-6 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.16),0_8px_20px_-10px_rgba(0,0,0,0.45)] transition-colors duration-150 hover:bg-[#262626]"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.button
              type="button"
              onClick={connectClouds}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-3 rounded-full border border-[#2563EB]/45 bg-white pr-6 pl-2.5 text-[15px] font-medium text-[#1D4ED8] shadow-[0_6px_18px_-12px_rgba(37,99,235,0.6)] transition-colors duration-150 hover:border-[#2563EB]/70 hover:bg-[#F5F9FF]"
            >
              <span className="flex -space-x-1.5">
                <GithubBadge />
                <AwsBadge />
                <GcpBadge />
              </span>
              Connect AWS &amp; GCP
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          ref={playgroundRef}
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.22, ease: EASE }}
          className="mx-auto mt-10 max-w-[700px]"
        >
          <HeroPlayground tab={tab} onTabChange={setTab} />
        </motion.div>
      </div>
    </section>
  );
}
