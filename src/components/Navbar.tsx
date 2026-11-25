import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Github, Menu, Search, Star, X } from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  onOpenSearch: () => void;
}

const GITHUB_URL = 'https://github.com/katchlabs/open-ci';

const NAV_LINKS = [
  { label: 'How it works', href: '/#how-it-works', isRoute: false },
  { label: 'Savings', href: '/#savings', isRoute: false },
  { label: 'Compare', href: '/#compare', isRoute: false },
  { label: 'Docs', href: '/docs', isRoute: true },
] as const;

export function Navbar({ onOpenSearch }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isDocs = location.pathname.startsWith('/docs');

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-[14px] whitespace-nowrap transition-colors duration-150 ${
      active ? 'font-medium text-[#0B0D0E]' : 'text-[#525A55] hover:text-[#0B0D0E]'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-50 h-16 border-b border-[#ECEFEA] bg-white/90 backdrop-blur-xl transition-shadow duration-200 ${
          scrolled ? 'shadow-[0_8px_24px_-18px_rgba(11,13,14,0.18)]' : ''
        }`}
      >
        <div className="mx-auto grid h-full max-w-[1200px] grid-cols-[1fr_auto] items-center px-5 sm:px-8 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center">
            <Link
              to="/"
              className="rounded-md transition-opacity duration-150 hover:opacity-80"
              aria-label="open-ci home"
            >
              <Logo />
            </Link>
          </div>

          <nav className="hidden items-center justify-center gap-1 md:flex" aria-label="Primary">
            {NAV_LINKS.map((item) =>
              item.isRoute ? (
                <Link key={item.label} to={item.href} className={linkClass(isDocs)}>
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} className={linkClass(false)}>
                  {item.label}
                </a>
              )
            )}
          </nav>

          <div className="hidden items-center justify-end gap-2 md:flex">
            <button
              type="button"
              onClick={onOpenSearch}
              title="Search docs (⌘K)"
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-[#E2E7E4] bg-white pr-1.5 pl-2.5 text-[#525A55] transition-colors duration-150 hover:border-[#D3D9D5] hover:text-[#0B0D0E] active:scale-[0.97]"
              aria-label="Search documentation (Command K)"
            >
              <Search className="h-[15px] w-[15px]" />
              <kbd className="rounded-md border border-[#E2E7E4] bg-[#F7F9F8] px-1.5 py-px font-mono text-[11px] text-[#6B736E]">⌘K</kbd>
            </button>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center gap-2 rounded-xl px-3 text-[13.5px] font-medium text-[#0B0D0E] transition-colors duration-150 hover:bg-[#F7F9F8] active:scale-[0.97] lg:inline-flex"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
              <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            </a>

            <Link
              to="/docs/quickstart"
              className="inline-flex h-9 items-center rounded-xl bg-[#0B0D0E] px-4 text-[13.5px] font-medium text-white shadow-[0_1px_2px_rgba(11,13,14,0.14)] transition-all duration-150 hover:bg-[#1F2422] active:scale-[0.97]"
            >
              Get started
            </Link>
          </div>

          <div className="flex items-center justify-end gap-1 md:hidden">
            <button
              type="button"
              onClick={onOpenSearch}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[#3A423D] hover:bg-[#F7F9F8]"
              aria-label="Search documentation"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E2E7E4] text-[#0B0D0E]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-b border-[#E2E7E4] bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((item) =>
                item.isRoute ? (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-2.5 py-2 text-[15px] text-[#0B0D0E] hover:bg-[#F7F9F8]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-2.5 py-2 text-[15px] text-[#0B0D0E] hover:bg-[#F7F9F8]"
                  >
                    {item.label}
                  </a>
                )
              )}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E2E7E4] pt-4">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E2E7E4] text-[13.5px] font-medium text-[#0B0D0E]"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <Link
                  to="/docs/quickstart"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0B0D0E] text-[13.5px] font-medium text-white"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
