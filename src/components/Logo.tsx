interface LogoProps {
  className?: string;
  inverted?: boolean;
}

/**
 * open-ci mark: two parallel runner chevrons (one shard done, one shard live)
 * set in a crisp obsidian tile, with an emerald status spark.
 */
export function LogoMark({ size = 24, inverted = false }: { size?: number; inverted?: boolean }) {
  const tile = inverted ? '#FFFFFF' : '#0B0D0E';
  const glyph = inverted ? '#0B0D0E' : '#FFFFFF';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="8" fill={tile} />
      <path d="M8.5 10L14 16L8.5 22" stroke={glyph} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 10L21 16L15.5 22" stroke="#10B981" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24.75" cy="16" r="1.75" fill="#10B981" />
    </svg>
  );
}

export function Logo({ className = '', inverted = false }: LogoProps) {
  const textClass = inverted ? 'text-[#FFFFFF]' : 'text-[#0B0D0E]';

  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <LogoMark inverted={inverted} />
      <span className={`font-sans text-[16px] font-semibold tracking-[-0.03em] ${textClass}`}>open-ci</span>
    </span>
  );
}
