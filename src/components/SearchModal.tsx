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
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#0B0D0E]/30 px-4 pt-24 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-lg border border-[#D3D9D5] bg-[#FFFFFF]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#E2E7E4] px-4 py-3.5">
          <Search className="h-4 w-4 text-[#6B736E]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search docs (OIDC, NVMe, cache, AssumeRole, open-ci.toml)..."
            className="w-full bg-transparent text-sm text-[#0B0D0E] placeholder-[#6B736E] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[#E2E7E4] bg-[#F7F9F8] p-1 text-[#525A55] transition-colors hover:text-[#0B0D0E] cursor-pointer"
            aria-label="Close search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#6B736E]">
              No matches for <span className="font-mono text-[#0B0D0E]">"{query}"</span>.
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
                  className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                    active ? 'bg-[#F7F9F8]' : 'hover:bg-[#F7F9F8]/60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {item.heading ? (
                        <Hash className="h-3.5 w-3.5 shrink-0 text-[#6B736E]" />
                      ) : (
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#6B736E]" />
                      )}
                      <span className="truncate text-[13px] font-medium text-[#0B0D0E]">
                        {item.doc.title}
                      </span>
                      <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.06em] text-[#6B736E]">
                        {item.doc.section}
                      </span>
                    </div>
                    {item.heading && (
                      <div className="mt-0.5 pl-5.5 font-mono text-[11px] text-[#525A55]">
                        § {item.heading.text}
                      </div>
                    )}
                    <p className="mt-1 line-clamp-2 pl-5.5 text-xs text-[#525A55]">
                      {item.snippet}
                    </p>
                  </div>
                  <ArrowRight
                    className={`mt-1 h-3.5 w-3.5 shrink-0 transition-colors ${
                      active ? 'text-[#0B0D0E]' : 'text-[#D3D9D5]'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#E2E7E4] bg-[#F7F9F8] px-4 py-2 font-mono text-[11px] text-[#6B736E]">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span className="tabular-nums">{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
