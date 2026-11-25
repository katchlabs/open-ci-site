import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Github, Menu, Search, X } from 'lucide-react';
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

function AnnouncementBar() {
  return (
    <div className="relative z-[51] flex h-[34px] items-center justify-center border-b border-[#E5E7EB] bg-[#F7F8FA] px-4">
      <Link
        to="/docs/quickstart"
        className="group inline-flex min-w-0 items-center gap-2 text-[12.5px] text-[#4B5563] transition-colors hover:text-[#0A0A0A]"
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2563EB] opacity-40 motion-reduce:hidden" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
        </span>
        <span className="truncate">
          <span className="font-medium text-[#0A0A0A]">open-ci v0.1.1</span>
          <span className="hidden sm:inline"> — Free, open-source Spot runners for AWS &amp; GCP</span>
          <span className="sm:hidden"> — Free Spot runners for AWS &amp; GCP</span>
        </span>
        <ArrowRight className="h-3 w-3 shrink-0 text-[#2563EB] transition-transform duration-150 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

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
    `rounded-full px-3 py-1.5 text-[14px] whitespace-nowrap transition-colors duration-150 ${
      active ? 'font-medium text-[#0A0A0A]' : 'text-[#4B5563] hover:text-[#0A0A0A]'
    }`;

  return (
    <>
      <AnnouncementBar />
      <header
        className={`sticky top-0 z-50 h-16 border-b bg-white/90 backdrop-blur-xl transition-[border-color,box-shadow] duration-200 ${
          scrolled
            ? 'border-[#E5E7EB] shadow-[0_1px_0_rgba(15,23,42,0.02),0_8px_24px_-18px_rgba(15,23,42,0.18)]'
            : 'border-transparent'
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
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#4B5563] transition-colors duration-150 hover:bg-[#F7F8FA] hover:text-[#0A0A0A] active:scale-[0.96]"
              aria-label="Search documentation (Command K)"
            >
              <Search className="h-[17px] w-[17px]" />
            </button>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center gap-2 rounded-full border border-[#E2E4E9] bg-white px-4 text-[13.5px] font-medium text-[#0A0A0A] transition-all duration-150 hover:bg-[#F7F8FA] active:scale-[0.97] lg:inline-flex"
            >
              <Github className="h-4 w-4" />
              <span>Star on GitHub</span>
            </a>

            <Link
              to="/docs/quickstart"
              className="inline-flex h-9 items-center rounded-full bg-[#111111] px-4 text-[13.5px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-all duration-150 hover:bg-[#262626] active:scale-[0.97]"
            >
              Get started
            </Link>
          </div>

          <div className="flex items-center justify-end gap-1 md:hidden">
            <button
              type="button"
              onClick={onOpenSearch}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#374151] hover:bg-[#F7F8FA]"
              aria-label="Search documentation"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#E2E4E9] text-[#0A0A0A]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-b border-[#E5E7EB] bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((item) =>
                item.isRoute ? (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-2.5 py-2 text-[15px] text-[#0A0A0A] hover:bg-[#F7F8FA]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-2.5 py-2 text-[15px] text-[#0A0A0A] hover:bg-[#F7F8FA]"
                  >
                    {item.label}
                  </a>
                )
              )}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E5E7EB] pt-4">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#E2E4E9] text-[13.5px] font-medium text-[#0A0A0A]"
                >
                  <Github className="h-4 w-4" />
                  Star on GitHub
                </a>
                <Link
                  to="/docs/quickstart"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#111111] text-[13.5px] font-medium text-white"
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
