import { useEffect, useRef } from 'react';

/**
 * Ephemeral Compute Rails.
 *
 * Parallel build lanes frame the outer left and right margins of the hero while
 * the center stays pure white. Each lane is a hairline track; ephemeral runner
 * capsules boot on it, fill with CI Emerald left-to-right like a shard
 * executing, flash a check on completion, then dissolve back to an empty rail
 * (0 leaked VMs).
 *
 *  - Spot preemption (~1 in 12): a capsule flashes amber and a curved transfer
 *    arc carries its work to an adjacent rail, where it finishes in green.
 *  - Cursor: moving near either edge speeds up nearby runners and sends an
 *    emerald ripple across the adjacent rails. Clicking an edge boots runners.
 *  - prefers-reduced-motion: a calm static frame, no animation loop.
 */

const MAX_DPR = 2;
const RAIL_GAP = 22;
const CAP_H = 6;
const EDGE_PAD = 10;

type RGB = readonly [number, number, number];
const INK: RGB = [11, 13, 14]; // #0B0D0E
const TINT: RGB = [209, 250, 229]; // #D1FAE5
const EMERALD: RGB = [16, 185, 129]; // #10B981
const EMERALD_DEEP: RGB = [5, 150, 105]; // #059669
const AMBER: RGB = [245, 158, 11]; // #F59E0B

// Phase durations (seconds, scaled by local speed)
const BOOT = 0.38;
const DONE = 0.55;
const FADE = 0.5;
const PREEMPT_HOLD = 0.42;
const ARC_TIME = 0.62;

type Side = 0 | 1; // 0 = left, 1 = right
type Phase = 'boot' | 'run' | 'preempt' | 'incoming' | 'done' | 'fade';

interface Rail {
  side: Side;
  index: number;
  y: number;
  len: number;
}

interface Capsule {
  rail: Rail;
  x: number; // left edge (px)
  w: number;
  phase: Phase;
  age: number;
  fill: number; // 0..1
  runDur: number;
  preemptAt: number; // fill fraction at which it is preempted, or -1
  rescued: boolean; // landed via a transfer arc
}

interface Arc {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  age: number;
  target: Capsule;
}

interface Burst {
  x: number;
  y: number;
  age: number;
}

interface Wave {
  side: Side;
  x: number;
  y: number;
  age: number;
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

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOut = (t: number) => {
  const k = clamp01(t);
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
};
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${clamp01(a).toFixed(3)})`;

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = Math.min(h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + r, r, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.closePath();
}

export function HeroPerimeterCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const railLayer = document.createElement('canvas');
    const railCtx = railLayer.getContext('2d');

    let width = 0;
    let height = 0;
    let zone = 0;
    let rails: Rail[][] = [[], []];
    let capsules: Capsule[] = [];
    let arcs: Arc[] = [];
    let bursts: Burst[] = [];
    let waves: Wave[] = [];
    let raf = 0;
    let running = false;
    let inView = true;
    let last = performance.now() / 1000;
    let spawnClock = 0;
    let lastWave = 0;
    let spawnCount = 0;
    let rand = mulberry32(42);

    const mouse = { x: -9999, y: -9999, active: 0, target: 0 };

    const zoneFor = (w: number) => (w >= 1180 ? 0.23 : w >= 900 ? 0.17 : w >= 640 ? 0.1 : 0.07);

    /* ── Layout ─────────────────────────────────────────── */

    const build = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      for (const c of [canvas, railLayer]) {
        c.width = Math.round(width * dpr);
        c.height = Math.round(height * dpr);
      }
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      railCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      zone = width * zoneFor(width);
      rand = mulberry32(42);
      rails = [[], []];
      capsules = [];
      arcs = [];
      bursts = [];
      waves = [];

      const top = 26;
      const count = Math.max(4, Math.floor((height - top * 2) / RAIL_GAP) + 1);
      const cy = height * 0.48;
      const half = Math.max(1, height / 2);
      const STEPS = 8;
      for (const side of [0, 1] as Side[]) {
        for (let i = 0; i < count; i++) {
          const y = Math.round(top + i * RAIL_GAP) + 0.5;
          const t = Math.min(1, Math.abs(y - cy) / half);
          // Shorter near the vertical center, longer toward the corners, in clean steps.
          const base = 0.46 + 0.54 * Math.pow(t, 1.25);
          const jitter = (rand() - 0.5) * 2.2;
          const steps = Math.max(2, Math.min(STEPS, Math.round(base * STEPS + jitter)));
          rails[side].push({ side, index: i, y, len: (steps / STEPS) * zone });
        }
      }
      drawRails();
    };

    const edgeFade = (x: number) => {
      const d = x < width / 2 ? x : width - x;
      return 1 - smoothstep(zone * 0.62, zone * 1.02, d);
    };

    const drawRails = () => {
      if (!railCtx) return;
      railCtx.clearRect(0, 0, width, height);
      for (const side of [0, 1] as Side[]) {
        for (const r of rails[side]) {
          const x0 = side === 0 ? 0 : width;
          const x1 = side === 0 ? r.len : width - r.len;
          const g = railCtx.createLinearGradient(x0, 0, x1, 0);
          g.addColorStop(0, rgba(INK, 0.06));
          g.addColorStop(0.7, rgba(INK, 0.05));
          g.addColorStop(1, rgba(INK, 0));
          railCtx.strokeStyle = g;
          railCtx.lineWidth = 1;
          railCtx.beginPath();
          railCtx.moveTo(x0, r.y);
          railCtx.lineTo(x1, r.y);
          railCtx.stroke();
          // Architectural end tick where the lane stops
          const tickX = side === 0 ? r.len * 0.82 : width - r.len * 0.82;
          railCtx.fillStyle = rgba(INK, 0.07 * edgeFade(tickX));
          railCtx.fillRect(Math.round(tickX) - 0.5, r.y - 2, 1, 4);
        }
      }
    };

    /* ── Simulation ─────────────────────────────────────── */

    const overlaps = (rail: Rail, x: number, w: number) =>
      capsules.some((c) => c.rail === rail && x < c.x + c.w + 12 && x + w + 12 > c.x);

    const placeOn = (rail: Rail, w: number): number | null => {
      const usable = rail.len * 0.9 - w - EDGE_PAD;
      if (usable < 4) return null;
      for (let tries = 0; tries < 4; tries++) {
        const offset = EDGE_PAD + rand() * usable;
        const x = rail.side === 0 ? offset : width - offset - w;
        if (!overlaps(rail, x, w)) return x;
      }
      return null;
    };

    const spawn = (rail: Rail, opts: Partial<Capsule> = {}): Capsule | null => {
      const w = opts.w ?? 26 + Math.round(rand() * 48);
      const x = opts.x ?? placeOn(rail, w);
      if (x === null || x === undefined) return null;
      spawnCount += 1;
      const cap: Capsule = {
        rail,
        x,
        w,
        phase: 'boot',
        age: 0,
        fill: 0,
        runDur: 1.1 + rand() * 1.6,
        preemptAt: spawnCount % 12 === 7 ? 0.32 + rand() * 0.3 : -1,
        rescued: false,
        ...opts,
      };
      capsules.push(cap);
      return cap;
    };

    const spawnRandom = () => {
      const side: Side = rand() < 0.5 ? 0 : 1;
      const list = rails[side];
      if (!list.length) return;
      // Favor longer rails (corners) a little
      for (let tries = 0; tries < 3; tries++) {
        const rail = list[Math.floor(rand() * list.length)];
        if (rand() < 0.35 + 0.65 * (rail.len / Math.max(1, zone)) && spawn(rail)) return;
      }
    };

    const preempt = (c: Capsule) => {
      c.phase = 'preempt';
      c.age = 0;
      const list = rails[c.rail.side];
      const dirs = [1, -1, 2, -2, 3, -3].sort(() => rand() - 0.5);
      for (const d of dirs) {
        const rail = list[c.rail.index + d];
        if (!rail) continue;
        const w = c.w;
        const x = placeOn(rail, w);
        if (x === null) continue;
        const target = spawn(rail, { x, w, phase: 'incoming', fill: c.fill, preemptAt: -1, runDur: 0.75, rescued: true });
        if (!target) continue;
        const x0 = c.x + c.w * c.fill;
        const x1 = x + 3;
        const bow = c.rail.side === 0 ? -1 : 1;
        arcs.push({
          x0,
          y0: c.rail.y,
          x1,
          y1: rail.y,
          cx: (x0 + x1) / 2 + bow * (26 + Math.abs(rail.y - c.rail.y) * 0.6),
          cy: (c.rail.y + rail.y) / 2,
          age: -PREEMPT_HOLD * 0.6,
          target,
        });
        return;
      }
    };

    const speedAt = (c: Capsule) => {
      if (mouse.active <= 0.01) return 1;
      const dy = Math.abs(c.rail.y - mouse.y);
      const dx = Math.abs(c.x + c.w / 2 - mouse.x);
      const k = (1 - smoothstep(0, 120, dy)) * (1 - smoothstep(60, 260, dx));
      return 1 + 1.6 * k * mouse.active;
    };

    const step = (dt: number) => {
      mouse.active += (mouse.target - mouse.active) * Math.min(1, dt * 5);

      spawnClock += dt;
      const interval = width >= 900 ? 0.11 : 0.2;
      while (spawnClock > interval) {
        spawnClock -= interval;
        spawnRandom();
      }

      for (const c of capsules) {
        const s = speedAt(c);
        c.age += dt * s;
        switch (c.phase) {
          case 'boot':
            if (c.age >= BOOT) {
              c.phase = 'run';
              c.age = 0;
            }
            break;
          case 'run':
            c.fill = Math.min(1, c.fill + (dt * s) / c.runDur);
            if (c.preemptAt > 0 && c.fill >= c.preemptAt) preempt(c);
            else if (c.fill >= 1) {
              c.phase = 'done';
              c.age = 0;
              bursts.push({ x: c.x + c.w, y: c.rail.y, age: 0 });
            }
            break;
          case 'preempt':
            if (c.age >= PREEMPT_HOLD + FADE) c.phase = 'fade';
            break;
          case 'incoming':
            break;
          case 'done':
            if (c.age >= DONE) {
              c.phase = 'fade';
              c.age = 0;
            }
            break;
          case 'fade':
            break;
        }
      }
      capsules = capsules.filter(
        (c) => !(c.phase === 'fade' && c.age >= FADE) && !(c.phase === 'preempt' && c.age >= PREEMPT_HOLD + FADE)
      );

      for (const a of arcs) {
        a.age += dt;
        if (a.age >= ARC_TIME && a.target.phase === 'incoming') {
          a.target.phase = 'run';
          a.target.age = 0;
          bursts.push({ x: a.x1, y: a.y1, age: 0 });
        }
      }
      arcs = arcs.filter((a) => a.age < ARC_TIME + 0.4);
      for (const b of bursts) b.age += dt;
      bursts = bursts.filter((b) => b.age < 0.7);
      for (const w of waves) w.age += dt;
      waves = waves.filter((w) => w.age < 1.1);
    };

    /* ── Rendering ──────────────────────────────────────── */

    const drawCapsule = (c: Capsule) => {
      const y = c.rail.y - CAP_H / 2;
      const fade = edgeFade(c.x + c.w / 2);
      if (fade <= 0.01) return;

      let bodyAlpha = 1;
      let fillColor: RGB = EMERALD;
      let fillAlpha = 1;
      let fill = c.fill;

      switch (c.phase) {
        case 'boot':
          bodyAlpha = easeOut(c.age / BOOT);
          fill = 0;
          break;
        case 'incoming':
          bodyAlpha = 0.55;
          break;
        case 'preempt': {
          fillColor = AMBER;
          const flash = 0.65 + 0.35 * Math.sin(c.age * 34);
          const out = c.age > PREEMPT_HOLD ? 1 - (c.age - PREEMPT_HOLD) / FADE : 1;
          fillAlpha = flash * out;
          bodyAlpha = out;
          break;
        }
        case 'done':
          fill = 1;
          fillColor = EMERALD;
          break;
        case 'fade': {
          const k = easeInOut(c.age / FADE);
          fill = 1;
          fillAlpha = 1 - k;
          bodyAlpha = 1 - k;
          break;
        }
      }

      // Empty capsule (booted VM, waiting for work)
      ctx.fillStyle = rgba(c.phase === 'preempt' ? [254, 243, 199] : TINT, bodyAlpha * fade);
      pill(ctx, c.x, y, c.w, CAP_H);
      ctx.fill();

      // Executing shard
      if (fill > 0) {
        const fw = Math.max(CAP_H, c.w * fill);
        ctx.fillStyle = rgba(fillColor, fillAlpha * fade);
        pill(ctx, c.x, y, fw, CAP_H);
        ctx.fill();
        if (c.phase === 'run') {
          const hx = c.x + fw - CAP_H / 2;
          const glow = ctx.createRadialGradient(hx, c.rail.y, 0, hx, c.rail.y, 9);
          glow.addColorStop(0, rgba(EMERALD, 0.35 * fade));
          glow.addColorStop(1, rgba(EMERALD, 0));
          ctx.fillStyle = glow;
          ctx.fillRect(hx - 9, c.rail.y - 9, 18, 18);
        }
      }

      // Completion check, just past the capsule head
      if (c.phase === 'done' || (c.phase === 'fade' && c.age < FADE * 0.6)) {
        const k = c.phase === 'done' ? c.age / DONE : 1;
        const a = (c.phase === 'done' ? 1 : 1 - c.age / (FADE * 0.6)) * fade;
        const s = 0.6 + 0.4 * easeOut(k * 2.5);
        const cx = c.x + c.w + 9;
        const cy = c.rail.y;
        ctx.strokeStyle = rgba(EMERALD_DEEP, a);
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 3.2 * s, cy + 0.2 * s);
        ctx.lineTo(cx - 1 * s, cy + 2.4 * s);
        ctx.lineTo(cx + 3.4 * s, cy - 2.6 * s);
        ctx.stroke();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(railLayer, 0, 0, width, height);

      // Cursor ripple: rails light up outward from the pointer row
      for (const w of waves) {
        for (const r of rails[w.side]) {
          const rows = Math.abs(r.y - w.y) / RAIL_GAP;
          if (rows > 6) continue;
          const local = w.age - rows * 0.055;
          if (local <= 0 || local > 0.7) continue;
          const a = Math.sin((local / 0.7) * Math.PI) * (1 - rows / 7) * 0.55;
          const spread = 34 + local * 120;
          const x0 = Math.max(w.side === 0 ? 0 : width - r.len, w.x - spread);
          const x1 = Math.min(w.side === 0 ? r.len : width, w.x + spread);
          if (x1 <= x0) continue;
          const g = ctx.createLinearGradient(x0, 0, x1, 0);
          g.addColorStop(0, rgba(EMERALD, 0));
          g.addColorStop(0.5, rgba(EMERALD, a * edgeFade(w.x)));
          g.addColorStop(1, rgba(EMERALD, 0));
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(x0, r.y);
          ctx.lineTo(x1, r.y);
          ctx.stroke();
        }
      }

      for (const c of capsules) drawCapsule(c);

      // Spot transfer arcs: amber at the source, emerald on landing
      for (const a of arcs) {
        if (a.age <= 0) continue;
        const p = easeInOut(Math.min(1, a.age / ARC_TIME));
        const tail = Math.max(0, p - 0.45);
        const out = a.age > ARC_TIME ? 1 - (a.age - ARC_TIME) / 0.4 : 1;
        const at = (s: number) => {
          const u = 1 - s;
          return [u * u * a.x0 + 2 * u * s * a.cx + s * s * a.x1, u * u * a.y0 + 2 * u * s * a.cy + s * s * a.y1] as const;
        };
        const fade = edgeFade((a.x0 + a.x1) / 2);
        const segs = 18;
        ctx.lineCap = 'round';
        ctx.lineWidth = 1.4;
        for (let i = 0; i < segs; i++) {
          const s0 = tail + ((p - tail) * i) / segs;
          const s1 = tail + ((p - tail) * (i + 1)) / segs;
          const [ax, ay] = at(s0);
          const [bx, by] = at(s1);
          const mixK = s1;
          const col: RGB = [
            Math.round(AMBER[0] + (EMERALD[0] - AMBER[0]) * mixK),
            Math.round(AMBER[1] + (EMERALD[1] - AMBER[1]) * mixK),
            Math.round(AMBER[2] + (EMERALD[2] - AMBER[2]) * mixK),
          ];
          ctx.strokeStyle = rgba(col, ((i + 1) / segs) * 0.9 * out * fade);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
        if (a.age < ARC_TIME) {
          const [hx, hy] = at(p);
          ctx.fillStyle = rgba(p < 0.5 ? AMBER : EMERALD, fade);
          ctx.beginPath();
          ctx.arc(hx, hy, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Completion ring bursts
      for (const b of bursts) {
        const k = b.age / 0.7;
        const fade = edgeFade(b.x);
        ctx.strokeStyle = rgba(EMERALD, (1 - k) * 0.55 * fade);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3 + easeOut(k) * 11, 0, Math.PI * 2);
        ctx.stroke();
      }

    };

    /* ── Loop & lifecycle ───────────────────────────────── */

    const loop = () => {
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, now - last);
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (running || reducedMotion.matches || !inView || document.hidden) return;
      running = true;
      last = performance.now() / 1000;
      raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /** Deterministic still frame: a few runners mid-flight, a few complete. */
    const renderStatic = () => {
      for (let i = 0; i < 26; i++) spawnRandom();
      capsules.forEach((c, i) => {
        c.phase = i % 4 === 0 ? 'done' : 'run';
        c.age = i % 4 === 0 ? DONE * 0.9 : 0;
        c.fill = i % 4 === 0 ? 1 : 0.2 + ((i * 37) % 70) / 100;
      });
      draw();
    };

    const warmStart = () => {
      // Pre-roll the simulation so the first painted frame already looks alive.
      for (let i = 0; i < 90; i++) step(1 / 30);
      draw();
    };

    const refresh = () => {
      build();
      if (reducedMotion.matches) {
        stopLoop();
        renderStatic();
      } else {
        warmStart();
        startLoop();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.x = x;
      mouse.y = y;
      const d = x < width / 2 ? x : width - x;
      const nearEdge = d < zone * 1.15 && y >= 0 && y <= height;
      mouse.target = nearEdge ? 1 : 0;
      const t = performance.now() / 1000;
      if (nearEdge && running && t - lastWave > 0.32) {
        lastWave = t;
        waves.push({ side: x < width / 2 ? 0 : 1, x, y, age: 0 });
      }
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
      const d = x < width / 2 ? x : width - x;
      if (d > zone) return;
      const side: Side = x < width / 2 ? 0 : 1;
      const nearest = Math.round((y - (rails[side][0]?.y ?? 0)) / RAIL_GAP);
      for (const off of [0, -1, 1, -2, 2]) {
        const rail = rails[side][nearest + off];
        if (rail) spawn(rail, { runDur: 0.7 + rand() * 0.6, preemptAt: -1 });
      }
      waves.push({ side, x, y, age: 0 });
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
      className={`pointer-events-none absolute inset-0 [mask-image:linear-gradient(90deg,#000_0%,#000_16%,transparent_27%,transparent_73%,#000_84%,#000_100%)] ${className}`}
    />
  );
}
