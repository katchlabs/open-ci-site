import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Calculator, Github, Menu, Search, X } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenSearch: () => void;
}

export function Navbar({ onOpenSearch }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDocs = location.pathname.startsWith('/docs');

  return (
    <header className="sticky top-0 z-40 border-b border-[#1E2636]/90 bg-[#090B10]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-7">
          <Link to="/" className="flex items-center gap-2 focus:outline-none">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <a
              href="/#savings"
              className="rounded-lg px-3 py-1.5 font-medium text-[#94A3B8] transition hover:bg-[#111520] hover:text-[#F8FAFC]"
            >
              Savings Calculator
            </a>
            <a
              href="/#wiring"
              className="rounded-lg px-3 py-1.5 font-medium text-[#94A3B8] transition hover:bg-[#111520] hover:text-[#F8FAFC]"
            >
              How It Works
            </a>
            <a
              href="/#features"
              className="rounded-lg px-3 py-1.5 font-medium text-[#94A3B8] transition hover:bg-[#111520] hover:text-[#F8FAFC]"
            >
              Architecture
            </a>
            <Link
              to="/docs"
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                isDocs
                  ? 'bg-[#111520] text-[#F97316]'
                  : 'text-[#94A3B8] hover:bg-[#111520] hover:text-[#F8FAFC]'
              }`}
            >
              Docs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-[#1E2636] bg-[#111520] px-3 py-1.5 text-xs text-[#94A3B8] transition hover:border-[#2A354B] hover:text-[#F8FAFC] cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search docs...</span>
            <kbd className="ml-2 rounded border border-[#2A354B] bg-[#090B10] px-1.5 py-0.5 font-mono text-[10px] text-[#64748B]">
              ⌘K
            </kbd>
          </button>

          <a
            href="https://github.com/katchlabs/open-ci"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2636] bg-[#111520] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] transition hover:border-[#2A354B] hover:bg-[#161C2B]"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <Link
            to="/docs/quickstart"
            className="hidden sm:inline-flex items-center rounded-lg bg-[#F97316] px-3.5 py-1.5 text-xs font-semibold text-[#090B10] shadow-sm shadow-[#F97316]/20 transition hover:bg-[#FB923C]"
          >
            Deploy Now
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex md:hidden items-center justify-center rounded-lg border border-[#1E2636] bg-[#111520] p-2 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#1E2636] bg-[#090B10] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1.5 text-sm">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenSearch();
              }}
              className="flex items-center gap-2 rounded-lg border border-[#1E2636] bg-[#111520] px-3 py-2 text-left text-xs text-[#94A3B8] cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              Search documentation...
            </button>
            <a
              href="/#savings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-[#CBD5E1] hover:bg-[#111520]"
            >
              <Calculator className="h-4 w-4 text-[#F97316]" />
              Savings Calculator
            </a>
            <Link
              to="/docs"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-[#CBD5E1] hover:bg-[#111520]"
            >
              <BookOpen className="h-4 w-4 text-[#F97316]" />
              Documentation
            </Link>
            <Link
              to="/docs/quickstart"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg bg-[#F97316] px-3 py-2 text-center font-semibold text-[#090B10]"
            >
              Deploy in 60s
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
