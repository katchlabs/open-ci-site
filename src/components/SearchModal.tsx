import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Hash, Search, X } from 'lucide-react';
import { searchDocs } from '../data/docs';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => searchDocs(query), [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(results.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        const item = results[selectedIndex];
        const target = item.heading
          ? `${item.doc.path}#${item.heading.id}`
          : item.doc.path;
        navigate(target);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, results, selectedIndex, navigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 px-4 pt-20 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#2A354B] bg-[#111520] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#1E2636] px-4 py-3.5">
          <Search className="h-4 w-4 text-[#F97316]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search docs (e.g. OIDC, NVMe, cache, AssumeRole, janitor, open-ci.toml)..."
            className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#1E2636] bg-[#090B10] p-1 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
            aria-label="Close search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#64748B]">
              No documentation matches for <span className="font-mono text-[#CBD5E1]">"{query}"</span>.
            </div>
          ) : (
            results.map((item, idx) => {
              const active = idx === selectedIndex;
              const target = item.heading
                ? `${item.doc.path}#${item.heading.id}`
                : item.doc.path;
              return (
                <button
                  key={`${item.doc.slug}-${item.heading?.id ?? 'page'}`}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    navigate(target);
                    onClose();
                  }}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition cursor-pointer ${
                    active ? 'bg-[#161C2B]' : 'hover:bg-[#161C2B]/60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {item.heading ? (
                        <Hash className="h-3.5 w-3.5 shrink-0 text-[#F97316]" />
                      ) : (
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#F97316]" />
                      )}
                      <span className="truncate text-sm font-semibold text-[#F8FAFC]">
                        {item.doc.title}
                      </span>
                      <span className="hidden sm:inline rounded bg-[#090B10] px-1.5 py-0.5 font-mono text-[10px] text-[#64748B]">
                        {item.doc.section}
                      </span>
                    </div>
                    {item.heading && (
                      <div className="mt-0.5 pl-5.5 font-mono text-xs text-[#FB923C]">
                        § {item.heading.text}
                      </div>
                    )}
                    <p className="mt-1 line-clamp-2 pl-5.5 text-xs text-[#94A3B8]">
                      {item.snippet}
                    </p>
                  </div>
                  <ArrowRight
                    className={`mt-1 h-4 w-4 shrink-0 transition ${
                      active ? 'text-[#F97316]' : 'text-[#334155]'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#1E2636] bg-[#0B0E16] px-4 py-2 font-mono text-[11px] text-[#64748B]">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
