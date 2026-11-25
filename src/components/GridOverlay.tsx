interface GridOverlayProps {
  visible: boolean;
}

export function GridOverlay({ visible }: GridOverlayProps) {
  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      <div className="mx-auto grid h-full max-w-[1160px] grid-cols-12 gap-4 px-5 sm:px-8 border-x border-[rgba(17,17,17,0.09)]">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="h-full border-x border-[rgba(17,17,17,0.045)] bg-[rgba(17,17,17,0.015)]"
          >
            <div className="mt-14 text-center font-mono text-[9px] text-[rgba(17,17,17,0.28)] tabular-nums">
              {String(idx + 1).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 right-5 border border-[#D2D2CA] bg-[#F5F5F2]/95 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#555550] backdrop-blur-sm">
        SHEET 01 · SCALE 1:1 · 12-COL · 1160PX
      </div>
    </div>
  );
}
