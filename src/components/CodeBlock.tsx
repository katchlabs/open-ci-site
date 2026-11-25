import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  diffHighlights?: Record<number, 'add' | 'remove'>;
  compact?: boolean;
  className?: string;
}

function highlightLine(line: string, lang: string): ReactNode {
  const trimmed = line.trimStart();

  if (trimmed.startsWith('#') || (lang === 'sql' && trimmed.startsWith('--'))) {
    return <span className="text-[#9CA3AF]">{line}</span>;
  }

  if ((lang === 'toml' || lang === 'ini') && /^\[+[^\]]+\]+/.test(trimmed)) {
    return <span className="text-[#E4BE80]">{line}</span>;
  }

  if (lang === 'yaml' || lang === 'yml') {
    const match = line.match(/^(\s*-?\s*)([a-zA-Z0-9_.-]+)(:)(\s*)(.*)$/);
    if (match) {
      const [, indent, key, colon, space, rest] = match;
      return (
        <>
          <span className="text-[#9CA3AF]">{indent}</span>
          <span className="text-[#F7F8FA]">{key}</span>
          <span className="text-[#9CA3AF]">{colon}</span>
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
          <span className="text-[#F7F8FA]">{key}</span>
          <span className="text-[#9CA3AF]">{eq}</span>
          {highlightValue(rest)}
        </>
      );
    }
  }

  if (lang === 'json') {
    const match = line.match(/^(\s*)("[^"]+")(:\s*)(.*)$/);
    if (match) {
      const [, indent, key, colon, rest] = match;
      return (
        <>
          {indent}
          <span className="text-[#F7F8FA]">{key}</span>
          <span className="text-[#9CA3AF]">{colon}</span>
          {highlightValue(rest)}
        </>
      );
    }
  }

  if (lang === 'sql') {
    const parts = line.split(/(\b(?:PRAGMA|SELECT|UPDATE|WHERE|FROM|AND|ON|FULL|WAL)\b)/g);
    return parts.map((part, i) =>
      /^(?:PRAGMA|SELECT|UPDATE|WHERE|FROM|AND|ON|FULL|WAL)$/.test(part) ? (
        <span key={i} className="text-[#E4BE80]">
          {part}
        </span>
      ) : (
        <span key={i} className="text-[#E5E7EB]">
          {part}
        </span>
      )
    );
  }

  if (lang === 'bash' || lang === 'sh' || lang === 'shell') {
    const parts = line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g);
    return parts.map((part, i) => {
      if (
        (part.startsWith('"') && part.endsWith('"')) ||
        (part.startsWith("'") && part.endsWith("'"))
      ) {
        return (
          <span key={i} className="text-[#93C5A3]">
            {part}
          </span>
        );
      }
      const subParts = part.split(/(\s--?[a-zA-Z0-9_-]+)/g);
      return (
        <span key={i}>
          {subParts.map((sp, j) => {
            if (/^\s--?[a-zA-Z0-9_-]+$/.test(sp)) {
              return (
                <span key={j} className="text-[#C5CAD3]">
                  {sp}
                </span>
              );
            }
            if (i === 0 && j === 0) {
              const cmdMatch = sp.match(
                /^(\s*)(docker|curl|open-ci|cargo|terraform|packer|sudo|export|sha256sum|tar|mkdir|printf|gh|node|bash)(\b.*)$/
              );
              if (cmdMatch) {
                return (
                  <span key={j}>
                    {cmdMatch[1]}
                    <span className="text-[#F7F8FA]">{cmdMatch[2]}</span>
                    <span className="text-[#D1D5DB]">{cmdMatch[3]}</span>
                  </span>
                );
              }
            }
            return (
              <span key={j} className="text-[#D1D5DB]">
                {sp}
              </span>
            );
          })}
        </span>
      );
    });
  }

  return <span className="text-[#E5E7EB]">{line}</span>;
}

function highlightValue(val: string): ReactNode {
  if (!val) return null;
  const commentIdx = val.search(/\s+#\s/);
  const main = commentIdx >= 0 ? val.slice(0, commentIdx) : val;
  const comment = commentIdx >= 0 ? val.slice(commentIdx) : '';

  let rendered: ReactNode;
  const mTrim = main.trim();

  if (/^(true|false|null),?$/.test(mTrim)) {
    rendered = <span className="text-[#E4BE80]">{main}</span>;
  } else if (/^-?\d+(\.\d+)?,?$/.test(mTrim)) {
    rendered = <span className="text-[#E4BE80]">{main}</span>;
  } else if (main.includes('${{')) {
    rendered = <span className="text-[#E4BE80]">{main}</span>;
  } else {
    rendered = <span className="text-[#93C5A3]">{main}</span>;
  }

  return (
    <>
      {rendered}
      {comment && <span className="text-[#9CA3AF]">{comment}</span>}
    </>
  );
}

export function CodeBlock({
  code,
  language = 'bash',
  filename,
  showLineNumbers = false,
  diffHighlights,
  compact = false,
  className = '',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const normalized = code.replace(/\n$/, '');
  const lang = language.toLowerCase();
  const lines = normalized.split('\n');

  const handleCopy = async () => {
    const cleanCopy = lines
      .filter((_, idx) => diffHighlights?.[idx + 1] !== 'remove')
      .join('\n');
    try {
      await navigator.clipboard.writeText(cleanCopy);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = cleanCopy;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={`overflow-hidden rounded-lg border border-[#262624] bg-[#141413] text-[#F7F8FA] ${className}`}
    >
      {!compact && (
        <div className="flex items-center justify-between border-b border-[#262624] px-4 py-2.5">
          <span className="font-mono text-[11px] text-[#9CA3AF]">
            {filename ?? lang}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded border border-[#2E2E2B] bg-[#1C1C1A] px-2 py-0.5 font-mono text-[11px] text-[#C5CAD3] transition-colors duration-150 hover:border-[#374151] hover:text-[#F7F8FA] active:scale-[0.98] cursor-pointer"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[#93C5A3]" />
                <span className="text-[#93C5A3]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
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
            className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded border border-[#2E2E2B] bg-[#1C1C1A] px-2 py-1 font-mono text-[11px] text-[#C5CAD3] transition-colors hover:text-[#F7F8FA] cursor-pointer"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <Check className="h-3 w-3 text-[#93C5A3]" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        )}

        <pre
          className={`font-mono text-[12.5px] leading-[1.65] ${
            compact ? 'px-4 py-3 pr-12' : 'py-3.5'
          }`}
        >
          <code>
            {lines.map((line, idx) => {
              const lineNo = idx + 1;
              const diff = diffHighlights?.[lineNo];
              const rowClass =
                diff === 'add'
                  ? 'bg-[#15803D]/18 border-l-2 border-[#4ADE80]'
                  : diff === 'remove'
                    ? 'bg-[#DC2626]/14 border-l-2 border-[#F87171] opacity-65'
                    : 'border-l-2 border-transparent';

              return (
                <div
                  key={idx}
                  className={`flex min-h-[1.35rem] ${compact ? '' : 'px-4'} ${rowClass}`}
                >
                  {showLineNumbers && (
                    <span className="mr-3 inline-block w-5 shrink-0 select-none text-right text-[#5B6472] tabular-nums">
                      {lineNo}
                    </span>
                  )}
                  {diffHighlights && (
                    <span
                      className={`mr-2 inline-block w-3 shrink-0 select-none text-center ${
                        diff === 'add'
                          ? 'text-[#4ADE80]'
                          : diff === 'remove'
                            ? 'text-[#F87171]'
                            : 'text-transparent'
                      }`}
                    >
                      {diff === 'add' ? '+' : diff === 'remove' ? '−' : ' '}
                    </span>
                  )}
                  <span className="flex-1">{highlightLine(line, lang)}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
