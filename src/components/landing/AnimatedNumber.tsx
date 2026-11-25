import { useEffect, useState } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString('en-US'),
  className = '',
}: AnimatedNumberProps) {
  const motionVal = useMotionValue(value);
  const springVal = useSpring(motionVal, {
    stiffness: 240,
    damping: 28,
    mass: 0.55,
    restDelta: 0.4,
    restSpeed: 0.4,
  });
  const [display, setDisplay] = useState(() => format(value));

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    const unsubscribe = springVal.on('change', (latest) => {
      if (Math.abs(latest - value) < 1) {
        setDisplay(format(value));
      } else {
        setDisplay(format(latest));
      }
    });
    return unsubscribe;
  }, [springVal, value, format]);

  return <span className={`tabular-nums ${className}`}>{display}</span>;
}
