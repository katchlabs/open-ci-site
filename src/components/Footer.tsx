import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';

const linkClass = 'text-[#525A55] transition-colors duration-150 hover:text-[#0B0D0E]';

export function Footer() {
  return (
    <footer className="border-t border-[#E2E7E4] bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link to="/" aria-label="open-ci home">
            <Logo />
          </Link>
          <span className="text-[13px] text-[#6B736E]">
            © {new Date().getFullYear()} Katch Labs · Apache-2.0
          </span>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[13.5px]">
          <Link to="/docs" className={linkClass}>
            Docs
          </Link>
          <Link to="/docs/quickstart" className={linkClass}>
            Quickstart
          </Link>
          <a href="/#savings" className={linkClass}>
            Savings
          </a>
          <a href="/#compare" className={linkClass}>
            Compare
          </a>
          <a
            href="https://github.com/katchlabs/open-ci"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 ${linkClass}`}
          >
            GitHub
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
          </a>
        </nav>
      </div>
    </footer>
  );
}
