import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  ExternalLink,
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

export function DocsPage({ onOpenSearch }: DocsPageProps) {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const doc = getDocBySlug(slug);
  const currentIndex = DOC_PAGES.findIndex((d) => d.slug === doc.slug);
  const prevDoc = currentIndex > 0 ? DOC_PAGES[currentIndex - 1] : null;
  const nextDoc =
    currentIndex < DOC_PAGES.length - 1 ? DOC_PAGES[currentIndex + 1] : null;

  useEffect(() => {
    setDrawerOpen(false);
    if (location.hash) {
      const targetId = location.hash.slice(1);
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [doc.slug, location.hash]);

  const SidebarNav = () => (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex w-full items-center justify-between rounded-xl border border-[#1E2636] bg-[#111520] px-3 py-2 text-xs text-[#94A3B8] transition hover:border-[#2A354B] hover:text-[#F8FAFC] cursor-pointer"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-[#F97316]" />
          Search docs...
        </span>
        <kbd className="rounded border border-[#2A354B] bg-[#090B10] px-1.5 py-0.5 font-mono text-[10px] text-[#64748B]">
          ⌘K
        </kbd>
      </button>

      {SECTIONS.map((section) => (
        <div key={section}>
          <div className="px-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            {section}
          </div>
          <ul className="mt-2 space-y-1">
            {DOC_PAGES.filter((d) => d.section === section).map((item) => {
              const active = item.slug === doc.slug;
              return (
                <li key={item.slug}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition ${
                      active
                        ? 'bg-[#F97316]/12 font-semibold text-[#FB923C] border border-[#F97316]/30'
                        : 'text-[#94A3B8] hover:bg-[#111520] hover:text-[#F8FAFC] border border-transparent'
                    }`}
                  >
                    <span>{item.shortTitle}</span>
                    {active && <ChevronRight className="h-3.5 w-3.5" />}
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Mobile Docs Toolbar */}
      <div className="flex items-center justify-between border-b border-[#1E2636] py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#1E2636] bg-[#111520] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] cursor-pointer"
        >
          <List className="h-3.5 w-3.5 text-[#F97316]" />
          Docs Menu
        </button>
        <span className="truncate font-mono text-xs text-[#94A3B8]">
          {doc.shortTitle}
        </span>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="h-full w-72 overflow-y-auto border-r border-[#1E2636] bg-[#090B10] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-display text-sm font-bold text-[#F8FAFC]">
                <BookOpen className="h-4 w-4 text-[#F97316]" />
                Documentation
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg border border-[#1E2636] bg-[#111520] p-1.5 text-[#94A3B8] cursor-pointer"
                aria-label="Close docs menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarNav />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 py-8 lg:grid-cols-12 lg:py-12">
        {/* Left Sidebar */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <SidebarNav />
          </div>
        </aside>

        {/* Main Content */}
        <article className="min-w-0 lg:col-span-7">
          <div className="mb-6 flex items-center gap-2 font-mono text-xs text-[#64748B]">
            <Link to="/docs" className="hover:text-[#F8FAFC]">
              Docs
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#F97316]">{doc.section}</span>
          </div>

          <div className="docs-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={{
                h1: ({ children }) => (
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-4xl">
                    {children}
                  </h1>
                ),
                h2: ({ id, children }) => (
                  <h2
                    id={id}
                    className="mt-12 mb-4 scroll-mt-24 border-b border-[#1E2636] pb-2.5 font-display text-2xl font-bold text-[#F8FAFC]"
                  >
                    {children}
                  </h2>
                ),
                h3: ({ id, children }) => (
                  <h3
                    id={id}
                    className="mt-8 mb-3 scroll-mt-24 font-display text-lg font-bold text-[#F8FAFC]"
                  >
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="my-4 text-[15px] leading-7 text-[#CBD5E1]">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="my-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-[#CBD5E1] marker:text-[#F97316]">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-4 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-[#CBD5E1] marker:font-mono marker:text-xs marker:text-[#F97316]">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="pl-1">{children}</li>,
                hr: () => <hr className="my-8 border-[#1E2636]" />,
                blockquote: ({ children }) => (
                  <blockquote className="my-5 rounded-xl border border-[#F97316]/30 bg-[#F97316]/[0.07] px-4 py-3 text-sm text-[#E2E8F0] [&>p]:my-1">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => {
                  const url = href ?? '#';
                  if (url.startsWith('/')) {
                    return (
                      <Link
                        to={url}
                        className="font-medium text-[#FB923C] underline decoration-[#F97316]/40 underline-offset-4 transition hover:text-[#F97316]"
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
                      className="font-medium text-[#FB923C] underline decoration-[#F97316]/40 underline-offset-4 transition hover:text-[#F97316]"
                    >
                      {children}
                    </a>
                  );
                },
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#F8FAFC]">
                    {children}
                  </strong>
                ),
                table: ({ children }) => (
                  <div className="my-6 overflow-x-auto rounded-xl border border-[#1E2636]">
                    <table className="w-full border-collapse text-left text-sm">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="border-b border-[#1E2636] bg-[#111520] font-mono text-xs uppercase tracking-wider text-[#94A3B8]">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-[#1E2636] bg-[#0B0E16]">
                    {children}
                  </tbody>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 font-semibold text-[#F8FAFC]">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 align-top text-[13px] leading-relaxed text-[#CBD5E1]">
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
                      <code className="rounded-md border border-[#1E2636] bg-[#111520] px-1.5 py-0.5 font-mono text-[13px] text-[#F8FAFC]">
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
          <div className="mt-14 grid grid-cols-1 gap-4 border-t border-[#1E2636] pt-8 sm:grid-cols-2">
            {prevDoc ? (
              <Link
                to={prevDoc.path}
                className="group flex flex-col rounded-xl border border-[#1E2636] bg-[#111520] p-4 transition hover:border-[#2A354B]"
              >
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#64748B]">
                  <ArrowLeft className="h-3 w-3" />
                  Previous
                </span>
                <span className="mt-1 font-display text-sm font-bold text-[#F8FAFC] group-hover:text-[#F97316]">
                  {prevDoc.shortTitle}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextDoc && (
              <Link
                to={nextDoc.path}
                className="group flex flex-col items-end rounded-xl border border-[#1E2636] bg-[#111520] p-4 text-right transition hover:border-[#2A354B]"
              >
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#64748B]">
                  Next
                  <ArrowRight className="h-3 w-3" />
                </span>
                <span className="mt-1 font-display text-sm font-bold text-[#F8FAFC] group-hover:text-[#F97316]">
                  {nextDoc.shortTitle}
                </span>
              </Link>
            )}
          </div>
        </article>

        {/* Right Table of Contents */}
        <aside className="hidden lg:col-span-2 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              On this page
            </div>
            <ul className="mt-3 space-y-2 border-l border-[#1E2636] pl-3 text-xs">
              {doc.headings.map((h) => (
                <li
                  key={h.id}
                  className={h.level === 3 ? 'pl-2.5' : ''}
                >
                  <a
                    href={`#${h.id}`}
                    className="block leading-snug text-[#94A3B8] transition hover:text-[#F97316]"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-[#1E2636] pt-4">
              <a
                href="https://github.com/katchlabs/open-ci"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#64748B] transition hover:text-[#F8FAFC]"
              >
                View source on GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
