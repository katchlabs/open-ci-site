import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Grid2x2, Menu, Search, X } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenSearch: () => void;
  gridVisible: boolean;
  onToggleGrid: () => void;
}

export function Navbar({
  onOpenSearch,
  gridVisible,
  onToggleGrid,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDocs = location.pathname.startsWith('/docs');

  const navLinks = [
    { label: 'savings', href: '/#savings', isRoute: false },
    { label: 'benchmarks', href: '/#benchmarks', isRoute: false },
    { label: 'workflow', href: '/#workflow', isRoute: false },
    { label: 'docs', href: '/docs', isRoute: true },
  ];

  return (
    <header className="sticky top-0 z-50 h-[52px] border-b border-[#E4E4DF] bg-[#F5F5F2]/92 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1160px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="transition-opacity duration-150 hover:opacity-75"
            aria-label="open-ci home"
          >
            <Logo />
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {navLinks.map((item) => {
              const active = item.isRoute && isDocs;
              return item.isRoute ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-[13px] transition-colors duration-150 ${
                    active
                      ? 'font-medium text-[#111111]'
                      : 'text-[#555550] hover:text-[#111111]'
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[13px] text-[#555550] transition-colors duration-150 hover:text-[#111111]"
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={onToggleGrid}
            title="Toggle 12-column blueprint grid (G)"
            aria-pressed={gridVisible}
            className={`inline-flex h-8 items-center gap-1.5 rounded px-2 text-[12px] transition-colors duration-150 active:scale-[0.98] cursor-pointer ${
              gridVisible
                ? 'bg-[#ECECE7] text-[#111111]'
                : 'text-[#6E6E67] hover:bg-[#ECECE7]/70 hover:text-[#111111]'
            }`}
          >
            <Grid2x2 className="h-3.5 w-3.5" />
            <span className="font-mono text-[10px]">G</span>
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex h-8 items-center gap-2 rounded border border-[#E4E4DF] bg-[#FFFFFF] px-2.5 text-[12px] text-[#555550] transition-all duration-150 hover:border-[#D2D2CA] hover:text-[#111111] active:scale-[0.98] cursor-pointer"
            aria-label="Search documentation"
          >
            <Search className="h-3.5 w-3.5 text-[#6E6E67]" />
            <kbd className="font-mono text-[10.5px] text-[#6E6E67]">⌘K</kbd>
          </button>

          <a
            href="https://github.com/katchlabs/open-ci"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1 rounded bg-[#111111] px-3 text-[12px] font-medium text-[#FFFFFF] transition-all duration-150 hover:bg-[#262624] active:scale-[0.98]"
          >
            <span>GitHub</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#E4E4DF] bg-[#FFFFFF] text-[#555550] cursor-pointer"
            aria-label="Search documentation"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#E4E4DF] bg-[#FFFFFF] text-[#111111] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-b border-[#E4E4DF] bg-[#F5F5F2] px-5 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded px-2 py-2 text-sm text-[#111111] hover:bg-[#ECECE7]"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded px-2 py-2 text-sm text-[#111111] hover:bg-[#ECECE7]"
                >
                  {item.label}
                </a>
              )
            )}
            <div className="mt-2 flex items-center gap-2 border-t border-[#E4E4DF] pt-3">
              <a
                href="https://github.com/katchlabs/open-ci"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-1 rounded bg-[#111111] px-3 py-2 text-xs font-medium text-[#FFFFFF]"
              >
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
