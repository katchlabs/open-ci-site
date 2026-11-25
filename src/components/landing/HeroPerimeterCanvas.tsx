import { useEffect, useRef } from 'react';

/**
 * Ephemeral Spot Runner dot-matrix field.
 *
 * A retina-crisp grid of tiny rings sculpted into organic diagonal ribbons that
 * frame the left and right edges of the hero (the center stays pure white).
 *
 * Product-native behaviour:
 *  - Spot runner waves: rings fill cobalt as VMs boot, flash emerald as the job
 *    completes, then dissolve back to hollow rings (0 leaked VMs).
 *  - Preemption: a cluster flashes amber, then a glowing arc carries the work to
 *    an adjacent cluster where replacement runners boot.
 *  - Cursor: nearby dots wake into a gentle ripple. Clicking an empty edge area
 *    boots a fresh wave of runners.
 *  - prefers-reduced-motion: a calm static ribbon pattern, no animation loop.
 */

const SPACING = 14;
const RADIUS = 2.6;
const MAX_DPR = 2;

type RGB = readonly [number, number, number];
const MIST: RGB = [191, 219, 254]; // #BFDBFE
const MIST_DEEP: RGB = [147, 187, 248];
const COBALT: RGB = [37, 99, 235]; // #2563EB
const EMERALD: RGB = [16, 185, 129]; // #10B981
const AMBER: RGB = [245, 158, 11]; // #F59E0B

// Boot timeline (seconds, relative to when the wavefront reaches a dot)
const BOOT_FILL = 0.45;
const BOOT_RUN_END = 1.9;
const BOOT_DONE_END = 2.55;
const BOOT_TOTAL = 3.3;
const PREEMPT_TOTAL = 1.35;
const ARC_DURATION = 0.85;

interface Dot {
  x: number;
  y: number;
  seed: number;
  edge: number; // 0 (center, never drawn) .. 1 (outer edge)
  presence: number; // recomputed every frame
}

interface Pulse {
  kind: 'boot' | 'preempt';
  x: number;
  y: number;
  t0: number;
  radius: number;
  speed: number;
}

interface Arc {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  t0: number;
  landed: boolean;
}

interface Ripple {
  x: number;
  y: number;
  t0: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Compact seeded 2D gradient noise, returns roughly [-1, 1]. */
function createNoise2D(seed: number) {
  const rand = mulberry32(seed);
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const grad = (h: number, x: number, y: number) => {
    switch (h & 7) {
      case 0: return x + y;
      case 1: return -x + y;
      case 2: return x - y;
      case 3: return -x - y;
      case 4: return x;
      case 5: return -x;
      case 6: return y;
      default: return -y;
    }
  };
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    const x1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
    const x2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
    return (x1 + v * (x2 - x1)) * 0.95;
  };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const mix = (a: RGB, b: RGB, t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const rgba = (c: readonly number[], a: number) =>
  `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

export function HeroPerimeterCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const noise = createNoise2D(7);
    const grain = createNoise2D(19);
    const rand = mulberry32(42);

    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    let pulses: Pulse[] = [];
    let arcs: Arc[] = [];
    let ripples: Ripple[] = [];
    let raf = 0;
    let running = false;
    let inView = true;
    let lastNow = performance.now() / 1000;
    let nextBoot = 0.35;
    let nextPreempt = 3.2;
    const start = performance.now() / 1000;

    const mouse = { x: -9999, y: -9999, energy: 0, target: 0 };

    const zoneFor = (w: number) => (w >= 1180 ? 0.28 : w >= 900 ? 0.22 : w >= 640 ? 0.14 : 0.1);

    const build = () => {
      const rect = host.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const zone = zoneFor(width);
      const next: Dot[] = [];
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      const offsetX = (width - (cols - 1) * SPACING) / 2;
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * SPACING;
        const xn = x / width;
        const left = smoothstep(zone, zone * 0.18, xn);
        const right = smoothstep(1 - zone, 1 - zone * 0.18, xn);
        const horiz = Math.max(left, right);
        if (horiz <= 0.001) continue;
        for (let r = 0; r < rows; r++) {
          const y = 7 + r * SPACING;
          const yn = y / height;
          const vert = smoothstep(1, 0.86, yn) * smoothstep(0, 0.035, yn);
          const edge = horiz * vert;
          if (edge <= 0.001) continue;
          next.push({ x, y, seed: rand(), edge, presence: 0 });
        }
      }
      dots = next;
    };

    /** Organic diagonal ribbons, mirrored per side and drifting slowly over time. */
    const presenceAt = (d: Dot, t: number) => {
      const mirroredX = d.x < width / 2 ? d.x : width - d.x;
      const diag = mirroredX * 0.85 + d.y;
      const warp = noise(mirroredX * 0.0038 + 3.1, d.y * 0.0038 + t * 0.026) * 2.6;
      const wave = Math.sin(diag * 0.0185 - t * 0.34 + warp) * 0.5 + 0.5;
      const band = wave * wave * (3 - 2 * wave);
      const g = grain(d.x * 0.009 + t * 0.035, d.y * 0.009) * 0.5 + 0.5;
      const field = band * 0.74 + g * 0.26;
      const shaped = field * Math.pow(d.edge, 0.55) + d.edge * 0.1;
      return clamp01((shaped - 0.54) / 0.24);
    };

    const pickVisibleDot = (minPresence: number, avoid?: { x: number; y: number }) => {
      for (let i = 0; i < 40; i++) {
        const d = dots[Math.floor(rand() * dots.length)];
        if (!d || d.presence < minPresence || d.edge < 0.45) continue;
        if (avoid && Math.hypot(d.x - avoid.x, d.y - avoid.y) < 80) continue;
        return d;
      }
      return undefined;
    };

    const spawnBoot = (x: number, y: number, t: number, radius = 34 + rand() * 30) => {
      pulses.push({ kind: 'boot', x, y, t0: t, radius, speed: 150 + rand() * 60 });
    };

    const spawnPreempt = (t: number) => {
      const src = pickVisibleDot(0.55);
      if (!src) return;
      pulses.push({ kind: 'preempt', x: src.x, y: src.y, t0: t, radius: 30, speed: 260 });
      // Replacement cluster: same side, 110–220px away vertically
      const dir = src.y > height * 0.5 ? -1 : 1;
      const ty = Math.max(30, Math.min(height * 0.85, src.y + dir * (110 + rand() * 110)));
      let target: Dot | undefined;
      let best = Infinity;
      for (const d of dots) {
        if ((d.x < width / 2) !== (src.x < width / 2) || d.edge < 0.5) continue;
        const score = Math.abs(d.y - ty) + Math.abs(d.x - src.x) * 0.4 - d.presence * 40;
        if (score < best) {
          best = score;
          target = d;
        }
      }
      if (!target) return;
      const mx = (src.x + target.x) / 2;
      const my = (src.y + target.y) / 2;
      const bulge = (src.x < width / 2 ? 1 : -1) * (50 + rand() * 30);
      arcs.push({
        x0: src.x,
        y0: src.y,
        x1: target.x,
        y1: target.y,
        cx: mx + bulge,
        cy: my,
        t0: t + 0.5,
        landed: false,
      });
    };

    /** Returns activation for a dot: color, fill alpha, scale and boost to presence. */
    const activationFor = (d: Dot, t: number) => {
      let bestWeight = 0;
      let color: [number, number, number] = [COBALT[0], COBALT[1], COBALT[2]];
      let fill = 0;
      let scale = 1;
      for (const p of pulses) {
        const dist = Math.hypot(d.x - p.x, d.y - p.y);
        if (dist > p.radius) continue;
        const falloff = 1 - (dist / p.radius) ** 2;
        // Per-dot jitter so clusters ignite organically, not as perfect discs
        const lt = t - p.t0 - dist / p.speed - d.seed * 0.18;
        if (lt < 0) continue;
        if (p.kind === 'boot') {
          if (lt > BOOT_TOTAL) continue;
          let c: [number, number, number];
          let f: number;
          let s = 1;
          let w: number;
          if (lt < BOOT_FILL) {
            const k = easeOut(lt / BOOT_FILL);
            c = mix(MIST, COBALT, k);
            f = k;
            w = k;
          } else if (lt < BOOT_RUN_END) {
            c = [COBALT[0], COBALT[1], COBALT[2]];
            f = 0.88 + 0.12 * Math.sin(lt * 9 + d.seed * 20);
            w = 1;
          } else if (lt < BOOT_DONE_END) {
            const k = (lt - BOOT_RUN_END) / (BOOT_DONE_END - BOOT_RUN_END);
            c = mix(COBALT, EMERALD, Math.min(1, k * 2.4));
            f = 1;
            s = 1 + 0.32 * Math.sin(Math.PI * k);
            w = 1;
          } else {
            const k = (lt - BOOT_DONE_END) / (BOOT_TOTAL - BOOT_DONE_END);
            c = mix(EMERALD, MIST, easeOut(k));
            f = 1 - easeOut(k);
            w = 1 - k;
          }
          const weight = w * falloff;
          if (weight > bestWeight) {
            bestWeight = weight;
            color = c;
            fill = f * Math.min(1, falloff * 1.6);
            scale = 1 + (s - 1) * falloff;
          }
        } else {
          if (lt > PREEMPT_TOTAL) continue;
          const blink = lt < 0.22 ? 1 : lt < 0.34 ? 0.35 : lt < 0.9 ? 1 : 1 - (lt - 0.9) / (PREEMPT_TOTAL - 0.9);
          const weight = blink * falloff * 1.2;
          if (weight > bestWeight) {
            bestWeight = weight;
            color = [AMBER[0], AMBER[1], AMBER[2]];
            fill = blink;
            scale = 1 + 0.18 * blink;
          }
        }
      }
      return { weight: Math.min(1, bestWeight), color, fill, scale };
    };

    const draw = (now: number, animate: boolean) => {
      const t = now - start;
      const dt = Math.min(0.05, now - lastNow);
      lastNow = now;

      if (animate) {
        // Schedule product-native events
        if (t >= nextBoot && dots.length) {
          const d = pickVisibleDot(0.6);
          if (d) spawnBoot(d.x, d.y, t);
          nextBoot = t + 0.75 + rand() * 1.05;
        }
        if (t >= nextPreempt && dots.length) {
          spawnPreempt(t);
          nextPreempt = t + 5.5 + rand() * 3.5;
        }
        pulses = pulses.filter((p) => t - p.t0 < (p.kind === 'boot' ? BOOT_TOTAL : PREEMPT_TOTAL) + p.radius / p.speed + 0.3);
        ripples = ripples.filter((r) => t - r.t0 < 0.9);
        mouse.energy += (mouse.target - mouse.energy) * Math.min(1, dt * 5);
      }

      ctx.clearRect(0, 0, width, height);

      // Pass 1: base field (batched by alpha bucket), collect active dots
      const BUCKETS = 4;
      const ringPaths: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
      const fillPaths: Path2D[] = Array.from({ length: BUCKETS }, () => new Path2D());
      const active: { d: Dot; r: number; color: readonly number[]; fill: number; ring: number }[] = [];

      for (const d of dots) {
        const base = presenceAt(d, animate ? t : 0);
        d.presence = base;
        const act = animate ? activationFor(d, t) : null;

        let wake = 0;
        if (animate && mouse.energy > 0.01) {
          const dist = Math.hypot(d.x - mouse.x, d.y - mouse.y);
          if (dist < 220) {
            const fall = Math.exp(-((dist / 135) ** 2));
            const ripple = 0.5 + 0.5 * Math.sin(dist * 0.075 - t * 5.2);
            wake = fall * (0.3 + 0.7 * ripple) * mouse.energy * Math.min(1, d.edge * 2.2);
          }
        }

        const actWeight = act ? act.weight : 0;
        const presence = Math.max(base, actWeight * d.edge * 0.95, wake * 0.9);
        if (presence < 0.04) continue;

        const r = RADIUS * (0.34 + 0.66 * Math.sqrt(presence));

        if (actWeight > 0.02 || wake > 0.04) {
          let color: readonly number[] = MIST_DEEP;
          let fill = 0;
          let scale = 1;
          if (act && actWeight > 0.02) {
            color = act.color;
            fill = act.fill;
            scale = act.scale;
          }
          if (wake > 0.04) {
            const wakeColor = mix(MIST_DEEP, COBALT, Math.min(1, wake * 1.1));
            if (actWeight < wake) {
              color = wakeColor;
              fill = Math.max(fill, wake * 0.8);
            }
            scale *= 1 + wake * 0.3;
          }
          active.push({ d, r: r * scale, color, fill, ring: 0.55 + 0.45 * presence });
          continue;
        }

        const bucket = Math.min(BUCKETS - 1, Math.floor(presence * BUCKETS));
        if (presence > 0.8 && d.seed < 0.42) {
          fillPaths[bucket].moveTo(d.x + r, d.y);
          fillPaths[bucket].arc(d.x, d.y, r, 0, Math.PI * 2);
        } else {
          ringPaths[bucket].moveTo(d.x + r, d.y);
          ringPaths[bucket].arc(d.x, d.y, r, 0, Math.PI * 2);
        }
      }

      ctx.lineWidth = 1.15;
      for (let b = 0; b < BUCKETS; b++) {
        const a = 0.38 + (b / (BUCKETS - 1)) * 0.62;
        ctx.strokeStyle = rgba(MIST_DEEP, a);
        ctx.stroke(ringPaths[b]);
        ctx.fillStyle = rgba(MIST_DEEP, a * 0.85);
        ctx.fill(fillPaths[b]);
      }

      // Pass 2: active runners
      for (const a of active) {
        if (a.fill > 0.02) {
          ctx.beginPath();
          ctx.arc(a.d.x, a.d.y, a.r, 0, Math.PI * 2);
          ctx.fillStyle = rgba(a.color, Math.min(1, a.fill));
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(a.d.x, a.d.y, a.r, 0, Math.PI * 2);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = rgba(a.color, Math.min(1, a.ring));
        ctx.stroke();
      }

      if (!animate) return;

      // Pass 3: preemption arcs carrying work to replacement clusters
      for (const arc of arcs) {
        const k = (t - arc.t0) / ARC_DURATION;
        if (k < 0) continue;
        const p = easeOut(Math.min(1, k));
        const tail = Math.max(0, p - 0.38);
        const fadeOut = k > 1 ? Math.max(0, 1 - (k - 1) * 3) : 1;
        if (fadeOut <= 0) continue;
        const at = (s: number) => {
          const u = 1 - s;
          return [
            u * u * arc.x0 + 2 * u * s * arc.cx + s * s * arc.x1,
            u * u * arc.y0 + 2 * u * s * arc.cy + s * s * arc.y1,
          ] as const;
        };
        const steps = 22;
        for (let i = 0; i < steps; i++) {
          const s0 = tail + ((p - tail) * i) / steps;
          const s1 = tail + ((p - tail) * (i + 1)) / steps;
          const [ax, ay] = at(s0);
          const [bx, by] = at(s1);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.lineWidth = 1.6;
          ctx.lineCap = 'round';
          ctx.strokeStyle = rgba(COBALT, ((i + 1) / steps) * 0.85 * fadeOut);
          ctx.stroke();
        }
        if (k <= 1) {
          const [hx, hy] = at(p);
          const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 11);
          glow.addColorStop(0, rgba(COBALT, 0.45));
          glow.addColorStop(1, rgba(COBALT, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(hx, hy, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(hx, hy, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = rgba(COBALT, 1);
          ctx.fill();
        }
        if (k >= 1 && !arc.landed) {
          arc.landed = true;
          spawnBoot(arc.x1, arc.y1, t, 46);
          ripples.push({ x: arc.x1, y: arc.y1, t0: t });
        }
      }
      arcs = arcs.filter((a) => t - a.t0 < ARC_DURATION + 0.5);

      // Pass 4: landing ripples
      for (const r of ripples) {
        const k = (t - r.t0) / 0.9;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 6 + easeOut(k) * 42, 0, Math.PI * 2);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = rgba(COBALT, (1 - k) * 0.5);
        ctx.stroke();
      }
    };

    const loop = () => {
      draw(performance.now() / 1000, true);
      raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (running || reducedMotion.matches || !inView || document.hidden) return;
      running = true;
      lastNow = performance.now() / 1000;
      raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const renderStatic = () => draw(performance.now() / 1000, false);

    const refresh = () => {
      build();
      if (reducedMotion.matches) {
        stopLoop();
        renderStatic();
      } else if (!running) {
        renderStatic();
        startLoop();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.x = x;
      mouse.y = y;
      mouse.target = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height ? 1 : 0;
    };
    const onPointerLeave = () => {
      mouse.target = 0;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!running) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('a,button,input,textarea,select,[data-no-spawn]')) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xn = x / width;
      const zone = zoneFor(width);
      if (xn > zone && xn < 1 - zone) return;
      const t = performance.now() / 1000 - start;
      spawnBoot(x, y, t, 70);
      ripples.push({ x, y, t0: t });
    };

    const resizeObserver = new ResizeObserver(() => refresh());
    resizeObserver.observe(host);

    const intersection = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) startLoop();
        else stopLoop();
      },
      { threshold: 0 }
    );
    intersection.observe(host);

    const onVisibility = () => (document.hidden ? stopLoop() : startLoop());
    const onMotionChange = () => refresh();

    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerleave', onPointerLeave);
    host.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener('change', onMotionChange);

    refresh();

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersection.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      host.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
