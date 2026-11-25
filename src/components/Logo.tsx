interface LogoProps {
  className?: string;
  inverted?: boolean;
}

/** Cobalt geometric mark: a runner bracket + launch chevron, set in a soft square. */
export function Logo({ className = '', inverted = false }: LogoProps) {
  const tile = inverted ? '#FFFFFF' : '#2563EB';
  const glyph = inverted ? '#2563EB' : '#FFFFFF';
  const textClass = inverted ? 'text-[#FFFFFF]' : 'text-[#0A0A0A]';

  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="8" fill={tile} />
        <path
          d="M10 10.5H13.75V21.5H10"
          stroke={glyph}
          strokeWidth="2.4"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          d="M17 11.5L22.25 16L17 20.5"
          stroke={glyph}
          strokeWidth="2.4"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
      <span
        className={`font-sans text-[16px] font-semibold tracking-[-0.03em] ${textClass}`}
      >
        open-ci
      </span>
    </span>
  );
}
