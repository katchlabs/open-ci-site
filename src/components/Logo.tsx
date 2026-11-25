interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className = '', showWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#111520" />
        <rect
          x="0.75"
          y="0.75"
          width="30.5"
          height="30.5"
          rx="7.25"
          stroke="#1E2636"
          strokeWidth="1.5"
        />
        <path
          d="M16 6.2L24.5 11.1V20.9L16 25.8L7.5 20.9V11.1L16 6.2Z"
          stroke="#F97316"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M16 11L20.4 13.55V18.65L16 21.2L11.6 18.65V13.55L16 11Z"
          fill="#F97316"
          fillOpacity="0.18"
          stroke="#F8FAFC"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="16.1" r="2" fill="#10B981" />
      </svg>
      {showWordmark && (
        <span className="font-display text-[17px] font-bold tracking-tight text-[#F8FAFC]">
          open<span className="text-[#F97316]">-</span>ci
        </span>
      )}
    </span>
  );
}
