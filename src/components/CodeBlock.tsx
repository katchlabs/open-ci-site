import { useState, type ReactNode } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  compact?: boolean;
  className?: string;
}

function highlightLine(line: string, lang: string): ReactNode {
  const trimmed = line.trimStart();

  // Comment lines
  if (
    trimmed.startsWith('#') ||
    (lang === 'sql' && trimmed.startsWith('--'))
  ) {
    return <span className="text-[#64748B] italic">{line}</span>;
  }

  // TOML / INI section headers
  if ((lang === 'toml' || lang === 'ini') && /^\[+[^\]]+\]+/.test(trimmed)) {
    return <span className="text-[#F97316] font-semibold">{line}</span>;
  }

  // YAML or TOML key: value / key = value
  if (lang === 'yaml' || lang === 'yml') {
    const match = line.match(/^(\s*-?\s*)([a-zA-Z0-9_.-]+)(:)(\s*)(.*)$/);
    if (match) {
      const [, indent, key, colon, space, rest] = match;
      return (
        <>
          <span className="text-[#94A3B8]">{indent}</span>
          <span className="text-[#FB923C]">{key}</span>
          <span className="text-[#64748B]">{colon}</span>
          {space}
          {highlightValue(rest)}
        </>
      );
    }
  }

  if (lang === 'toml' || lang === 'ini') {
    const match = line.match(/^(\s*)([a-zA-Z0-9_."/-]+)(\s*=\s*)(.*)$/);
    if (match) {
      const [, indent, key, eq, rest] = match;
      return (
        <>
          {indent}
          <span className="text-[#38BDF8]">{key}</span>
          <span className="text-[#64748B]">{eq}</span>
          {highlightValue(rest)}
        </>
      );
    }
  }

  // JSON key-value lines
  if (lang === 'json') {
    const match = line.match(/^(\s*)("[^"]+")(:\s*)(.*)$/);
    if (match) {
      const [, indent, key, colon, rest] = match;
      return (
        <>
          {indent}
          <span className="text-[#38BDF8]">{key}</span>
          <span className="text-[#64748B]">{colon}</span>
          {highlightValue(rest)}
        </>
      );
    }
  }

  // SQL keywords
  if (lang === 'sql') {
    const parts = line.split(/(\b(?:PRAGMA|SELECT|UPDATE|WHERE|FROM|AND|ON|FULL|WAL)\b)/g);
    return parts.map((part, i) =>
      /^(?:PRAGMA|SELECT|UPDATE|WHERE|FROM|AND|ON|FULL|WAL)$/.test(part) ? (
        <span key={i} className="text-[#F97316] font-medium">
          {part}
        </span>
      ) : (
        <span key={i} className="text-[#E2E8F0]">
          {part}
        </span>
      )
    );
  }

  // Shell commands
  if (lang === 'bash' || lang === 'sh' || lang === 'shell') {
    const parts = line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g);
    return parts.map((part, i) => {
      if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
        return (
          <span key={i} className="text-[#10B981]">
            {part}
          </span>
        );
      }
      // Highlight flags like --config or -var
      const subParts = part.split(/(\s--?[a-zA-Z0-9_-]+)/g);
      return (
        <span key={i}>
          {subParts.map((sp, j) => {
            if (/^\s--?[a-zA-Z0-9_-]+$/.test(sp)) {
              return (
                <span key={j} className="text-[#FB923C]">
                  {sp}
                </span>
              );
            }
            if (i === 0 && j === 0) {
              const cmdMatch = sp.match(/^(\s*)(docker|curl|open-ci|cargo|terraform|packer|sudo|export|sha256sum|tar|mkdir|printf|gh|node|bash)(\b.*)$/);
              if (cmdMatch) {
                return (
                  <span key={j}>
                    {cmdMatch[1]}
                    <span className="text-[#38BDF8] font-medium">{cmdMatch[2]}</span>
                    <span className="text-[#E2E8F0]">{cmdMatch[3]}</span>
                  </span>
                );
              }
            }
            return (
              <span key={j} className="text-[#E2E8F0]">
                {sp}
              </span>
            );
          })}
        </span>
      );
    });
  }

  return <span className="text-[#E2E8F0]">{line}</span>;
}

function highlightValue(val: string): ReactNode {
  if (!val) return null;
  // Split inline trailing comment
  const commentIdx = val.search(/\s+#\s/);
  const main = commentIdx >= 0 ? val.slice(0, commentIdx) : val;
  const comment = commentIdx >= 0 ? val.slice(commentIdx) : '';

  let rendered: ReactNode;
  const mTrim = main.trim();

  if (/^(true|false|null),?$/.test(mTrim)) {
    rendered = <span className="text-[#F472B6]">{main}</span>;
  } else if (/^-?\d+(\.\d+)?,?$/.test(mTrim)) {
    rendered = <span className="text-[#A78BFA]">{main}</span>;
  } else if (main.includes('${{')) {
    rendered = <span className="text-[#FBBF24]">{main}</span>;
  } else if (/^["'].*["'],?$/.test(mTrim)) {
    rendered = <span className="text-[#10B981]">{main}</span>;
  } else {
    rendered = <span className="text-[#10B981]">{main}</span>;
  }

  return (
    <>
      {rendered}
      {comment && <span className="text-[#64748B] italic">{comment}</span>}
    </>
  );
}

export function CodeBlock({
  code,
  language = 'bash',
  filename,
  compact = false,
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const normalized = code.replace(/\n$/, '');
  const lang = language.toLowerCase();
  const lines = normalized.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(normalized);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for non-HTTPS clipboard contexts
      const textarea = document.createElement('textarea');
      textarea.value = normalized;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-[#1E2636] bg-[#0B0E16] ${className}`}
    >
      {!compact && (
        <div className="flex items-center justify-between border-b border-[#1E2636] bg-[#111520]/80 px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <Terminal className="h-3.5 w-3.5 text-[#F97316]" />
            <span className="font-mono font-medium text-[#CBD5E1]">
              {filename ?? lang}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#1E2636] bg-[#090B10] px-2.5 py-1 text-[11px] font-medium text-[#94A3B8] transition hover:border-[#2A354B] hover:text-[#F8FAFC] cursor-pointer"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                <span className="text-[#10B981]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="relative overflow-x-auto">
        {compact && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-md border border-[#1E2636] bg-[#111520]/90 px-2 py-1 text-[11px] font-medium text-[#94A3B8] backdrop-blur transition hover:border-[#2A354B] hover:text-[#F8FAFC] cursor-pointer"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[#10B981]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        <pre
          className={`font-mono text-[13px] leading-relaxed ${
            compact ? 'px-4 py-3 pr-12' : 'p-4'
          }`}
        >
          <code>
            {lines.map((line, idx) => (
              <div key={idx} className="min-h-[1.35rem]">
                {highlightLine(line, lang)}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
