import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  List,
  Search,
  X,
} from 'lucide-react';
import { DOC_PAGES, getDocBySlug, type DocPage } from '../data/docs';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidBlock } from '../components/MermaidBlock';

interface DocsPageProps {
  onOpenSearch: () => void;
}

const SECTIONS: DocPage['section'][] = [
  'Getting Started',
  'Core Guides',
  'Reference & Security',
];

function compactTocLabel(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

export function DocsPage({ onOpenSearch }: DocsPageProps) {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const doc = getDocBySlug(slug);
  const [activeHeadingId, setActiveHeadingId] = useState<string>(
    doc.headings[0]?.id ?? ''
  );

  const currentIndex = DOC_PAGES.findIndex((d) => d.slug === doc.slug);
  const prevDoc = currentIndex > 0 ? DOC_PAGES[currentIndex - 1] : null;
  const nextDoc =
    currentIndex < DOC_PAGES.length - 1 ? DOC_PAGES[currentIndex + 1] : null;

  useEffect(() => {
    setDrawerOpen(false);
    setActiveHeadingId(doc.headings[0]?.id ?? '');
    if (location.hash) {
      const targetId = location.hash.slice(1);
      setActiveHeadingId(targetId);
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [doc.slug, doc.headings, location.hash]);

  useEffect(() => {
    if (doc.headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target.id) {
          setActiveHeadingId(visible.target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    for (const h of doc.headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [doc.slug, doc.headings]);

  const SidebarNav = () => (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex h-9 w-full items-center justify-between rounded border border-[#E4E4DF] bg-[#FFFFFF] px-3 text-[12px] text-[#555550] transition-colors duration-150 hover:border-[#D2D2CA] hover:text-[#111111] cursor-pointer"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-[#6E6E67]" />
          Search docs...
        </span>
        <kbd className="font-mono text-[10.5px] text-[#6E6E67]">⌘K</kbd>
      </button>

      {SECTIONS.map((section) => (
        <div key={section}>
          <div className="px-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6E6E67]">
            {section}
          </div>
          <ul className="mt-2 space-y-0.5">
            {DOC_PAGES.filter((d) => d.section === section).map((item) => {
              const active = item.slug === doc.slug;
              return (
                <li key={item.slug}>
                  <Link
                    to={item.path}
                    className={`block rounded px-2.5 py-1.5 text-[13px] transition-colors duration-150 ${
                      active
                        ? 'bg-[#ECECE7] font-medium text-[#111111]'
                        : 'text-[#555550] hover:bg-[#ECECE7]/60 hover:text-[#111111]'
                    }`}
                  >
                    {item.shortTitle}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
      {/* Mobile Docs Toolbar */}
      <div className="flex items-center justify-between border-b border-[#E4E4DF] py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded border border-[#E4E4DF] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#111111] cursor-pointer"
        >
          <List className="h-3.5 w-3.5 text-[#555550]" />
          Docs menu
        </button>
        <span className="truncate font-mono text-[11px] text-[#6E6E67]">
          {doc.shortTitle}
        </span>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#111111]/25 backdrop-blur-[2px] lg:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="h-full w-72 overflow-y-auto border-r border-[#E4E4DF] bg-[#F5F5F2] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#555550]">
                Documentation
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded border border-[#E4E4DF] bg-[#FFFFFF] p-1 text-[#555550] cursor-pointer"
                aria-label="Close docs menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarNav />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-8 py-8 lg:grid-cols-12 lg:py-10">
        {/* Left Sidebar — aligned cleanly to top edge */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-[76px] max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <SidebarNav />
          </div>
        </aside>

        {/* Main Flat Paper Reading Sheet (zero corner radius) */}
        <article className="min-w-0 lg:col-span-7">
          <div className="border border-[#E4E4DF] bg-[#FFFFFF] px-6 py-7 sm:px-10 sm:py-9">
            <div className="mb-5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#6E6E67]">
              <Link to="/docs" className="transition-colors hover:text-[#111111]">
                Docs
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#555550]">{doc.section}</span>
            </div>

            <div className="docs-prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="font-sans text-[28px] font-medium leading-[1.12] tracking-[-0.03em] text-[#111111] sm:text-[34px]">
                      {children}
                    </h1>
                  ),
                  h2: ({ id, children }) => (
                    <h2
                      id={id}
                      className="mt-10 mb-3.5 scroll-mt-20 font-sans text-[20px] font-medium tracking-[-0.02em] text-[#111111]"
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ id, children }) => (
                    <h3
                      id={id}
                      className="mt-7 mb-2.5 scroll-mt-20 font-sans text-[15.5px] font-medium tracking-[-0.015em] text-[#111111]"
                    >
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="my-4 text-[14.5px] leading-[1.7] text-[#555550]">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-4 list-disc space-y-2 pl-5 text-[14.5px] leading-[1.7] text-[#555550] marker:text-[#6E6E67]">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-4 list-decimal space-y-2 pl-5 text-[14.5px] leading-[1.7] text-[#555550] marker:font-mono marker:text-xs marker:text-[#6E6E67]">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="pl-1">{children}</li>,
                  hr: () => <hr className="my-8 border-[#E4E4DF]" />,
                  blockquote: ({ children }) => (
                    <blockquote className="my-5 border-l-2 border-[#111111] bg-[#FAFAF8] px-4 py-3 text-[13.5px] text-[#555550] [&>p]:my-1">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => {
                    const url = href ?? '#';
                    if (url.startsWith('/')) {
                      return (
                        <Link
                          to={url}
                          className="font-medium text-[#111111] underline decoration-[#D2D2CA] underline-offset-4 transition-colors hover:decoration-[#111111]"
                        >
                          {children}
                        </Link>
                      );
                    }
                    return (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#111111] underline decoration-[#D2D2CA] underline-offset-4 transition-colors hover:decoration-[#111111]"
                      >
                        {children}
                      </a>
                    );
                  },
                  strong: ({ children }) => (
                    <strong className="font-medium text-[#111111]">
                      {children}
                    </strong>
                  ),
                  table: ({ children }) => (
                    <div className="my-6 overflow-x-auto rounded border border-[#E4E4DF]">
                      <table className="w-full border-collapse text-left text-[13px]">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="border-b border-[#E4E4DF] bg-[#FAFAF8] font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#6E6E67]">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-[#E4E4DF] bg-[#FFFFFF]">
                      {children}
                    </tbody>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2.5 font-medium text-[#111111]">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 align-top text-[13px] leading-relaxed text-[#555550]">
                      {children}
                    </td>
                  ),
                  pre: ({ children }) => <>{children}</>,
                  code: ({ className, children }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const raw = String(children).replace(/\n$/, '');
                    const isBlock = Boolean(match) || raw.includes('\n');

                    if (!isBlock) {
                      return (
                        <code className="rounded bg-[#ECECE7]/85 px-1.5 py-0.5 font-mono text-[12.5px] text-[#111111]">
                          {children}
                        </code>
                      );
                    }

                    const lang = match?.[1] ?? 'text';
                    if (lang === 'mermaid') {
                      return <MermaidBlock chart={raw} />;
                    }

                    return (
                      <CodeBlock
                        code={raw}
                        language={lang}
                        className="my-5"
                      />
                    );
                  },
                }}
              >
                {doc.content}
              </ReactMarkdown>
            </div>

            {/* Prev / Next Footer */}
            <div className="mt-12 grid grid-cols-1 gap-3 border-t border-[#E4E4DF] pt-7 sm:grid-cols-2">
              {prevDoc ? (
                <Link
                  to={prevDoc.path}
                  className="group flex flex-col rounded border border-[#E4E4DF] bg-[#FAFAF8] p-4 transition-colors duration-150 hover:border-[#D2D2CA] hover:bg-[#F5F5F2]"
                >
                  <span className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6E6E67]">
                    <ArrowLeft className="h-3 w-3" />
                    Previous
                  </span>
                  <span className="mt-1 text-[13.5px] font-medium text-[#111111]">
                    {prevDoc.shortTitle}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextDoc && (
                <Link
                  to={nextDoc.path}
                  className="group flex flex-col items-end rounded border border-[#E4E4DF] bg-[#FAFAF8] p-4 text-right transition-colors duration-150 hover:border-[#D2D2CA] hover:bg-[#F5F5F2]"
                >
                  <span className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#6E6E67]">
                    Next
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  <span className="mt-1 text-[13.5px] font-medium text-[#111111]">
                    {nextDoc.shortTitle}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </article>

        {/* Right Table of Contents — top-aligned to exact same y coordinate */}
        <aside className="hidden lg:col-span-2 lg:block">
          <div className="sticky top-[76px] max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="font-mono text-[10.5px] leading-none uppercase tracking-[0.08em] text-[#6E6E67]">
              On this page
            </div>
            <ul className="mt-3.5 border-l border-[#E4E4DF] text-[12px]">
              {doc.headings.map((h) => {
                const isActive = h.id === activeHeadingId;
                return (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      onClick={() => setActiveHeadingId(h.id)}
                      className={`-ml-px block border-l-2 py-1.5 leading-snug transition-colors ${
                        h.level === 3 ? 'pl-6' : 'pl-3'
                      } ${
                        isActive
                          ? 'border-[#111111] font-medium text-[#111111]'
                          : 'border-transparent text-[#555550] hover:text-[#111111]'
                      }`}
                    >
                      {compactTocLabel(h.text)}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="mt-7 border-t border-[#E4E4DF] pt-4">
              <a
                href="https://github.com/katchlabs/open-ci"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-[#6E6E67] transition-colors hover:text-[#111111]"
              >
                Source on GitHub
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
