interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="1"
          y="1"
          width="22"
          height="22"
          rx="4"
          stroke="#111111"
          strokeWidth="1.5"
        />
        <path
          d="M7 7.5H10V16.5H7"
          stroke="#111111"
          strokeWidth="1.6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          d="M12.5 8.5L16.75 12L12.5 15.5"
          stroke="#111111"
          strokeWidth="1.6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
      <span className="font-sans text-[15px] font-medium tracking-[-0.02em] text-[#111111]">
        open-ci
      </span>
    </span>
  );
}
