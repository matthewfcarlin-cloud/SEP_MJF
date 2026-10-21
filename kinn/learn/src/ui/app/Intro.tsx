import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { R, buildCoin, sharedRenderer } from './coin3d';

/**
 * Opening the app: the coin floats, turns to face you and clicks into place with a flash of its
 * light, then charge runs out along printed traces to the four corners and the app opens.
 *
 *   0.0–1.5s  float      1.5–2.0s  turn and settle      2.0s  click
 *   2.0–3.0s  traces to the corners                     3.0–3.6s  open
 */
const FLOAT = 1.5;
const CLICK = 2.0;
const TRACE_END = 3.0;
const DONE = 3.6;

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (t: number) => 1 - (1 - t) ** 3;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CAM_DIST = 5.2;
const FOV = 30;
/** Where the coin sits on the screen, as a share of its height. */
const COIN_Y = 0.4;

export function Intro({ headline, sub, onDone }: { headline: string; sub: string; onDone: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'float' | 'click' | 'traces' | 'open'>('float');
  const [box, setBox] = useState({ w: 338, h: 718 });
  const reduce = useMemo(reducedMotion, []);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const el = wrap.current;
    if (el) setBox({ w: el.clientWidth, h: el.clientHeight });
  }, []);

  useEffect(() => {
    const host = canvasHost.current;
    const el = wrap.current;
    if (!host || !el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const gl = reduce ? null : sharedRenderer();
    let raf = 0;
    const timers: number[] = [];
    if (!gl) {
      // Reduced motion (or no WebGL): the coin and the words, still, then the app.
      setPhase('click');
      timers.push(window.setTimeout(() => setPhase('open'), 1100));
      timers.push(window.setTimeout(() => done.current(), 1600));
      return () => timers.forEach(clearTimeout);
    }
    const { r, env } = gl;
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.setSize(w, h, false);
    r.setClearColor(0x000000, 0);
    host.appendChild(r.domElement);
    r.domElement.className = 'opening-canvas';
    const scene = new THREE.Scene();
    scene.environment = env;
    const coin = buildCoin({ word: true });
    scene.add(coin.group);
    const cam = new THREE.PerspectiveCamera(FOV, w / h, 0.1, 50);
    // Shift the view so the coin sits at COIN_Y of the screen height.
    const visH = 2 * CAM_DIST * Math.tan(((FOV / 2) * Math.PI) / 180);
    const offsetY = (COIN_Y - 0.5) * visH;
    cam.position.set(0, offsetY, CAM_DIST);
    cam.lookAt(0, offsetY, 0);
    r.compile(scene, cam);

    const teal = new THREE.Color(0x3ddbb8);
    const white = new THREE.Color(0xffffff);
    let start = -1;
    let last = '';
    const frame = (now: number) => {
      if (start < 0) start = now; // the clock starts on the first drawn frame, after shaders compile
      const t = (now - start) / 1000;
      const g = coin.group;
      const settle = ease(seg(t, FLOAT, CLICK));
      const bob = Math.sin(t * 2.1) * 0.05 * (1 - settle);
      // Floating: tilted to show the dome and the chrome seam, drifting and turning.
      g.rotation.x = lerp(Math.PI / 2 - 0.42 + Math.sin(t * 1.3) * 0.06, Math.PI / 2, settle);
      g.rotation.y = lerp(Math.sin(t * 0.9) * 0.45, 0, settle);
      g.rotation.z = lerp(Math.sin(t * 0.7) * 0.12, 0, settle);
      g.position.y = bob + lerp(0.08, 0, settle);
      g.position.z = lerp(0.35, 0, settle);
      // The click: a quick press and rebound.
      const k = seg(t, CLICK - 0.06, CLICK + 0.22);
      const press = k > 0 && k < 1 ? Math.sin(k * Math.PI) * 0.06 : 0;
      g.scale.setScalar(1 - press);
      // Opening: the coin backs away and shrinks as the app comes up behind it.
      const open = ease(seg(t, TRACE_END, DONE));
      g.position.z -= open * 2.5;
      g.position.y += open * 0.3;
      // Its light: white while floating, teal from the click.
      coin.ring.color.copy(white).lerp(teal, seg(t, CLICK - 0.05, CLICK + 0.1));
      r.render(scene, cam);
      const p = t < CLICK ? 'float' : t < CLICK + 0.25 ? 'click' : t < TRACE_END ? 'traces' : 'open';
      if (p !== last) {
        last = p;
        setPhase(p);
      }
      if (t < DONE) raf = requestAnimationFrame(frame);
      else done.current();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      coin.dispose();
      r.domElement.remove();
    };
  }, [reduce]);

  // The coin's radius on screen, for where the traces start.
  const visH = 2 * CAM_DIST * Math.tan(((FOV / 2) * Math.PI) / 180);
  const rPx = (R / visH) * box.h;
  const cx = box.w / 2;
  const cy = box.h * COIN_Y;
  const traces = useMemo(() => tracesToCorners(cx, cy, rPx, box.w, box.h), [cx, cy, rPx, box.w, box.h]);

  return (
    <div ref={wrap} className={`opening phase-${phase}${reduce ? ' reduced' : ''}`} onClick={() => done.current()} role="presentation">
      <svg className="opening-traces" width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="corner">
            <stop offset="0" stopColor="#3ddbb8" stopOpacity=".55" />
            <stop offset="1" stopColor="#3ddbb8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="shock" cx={cx} cy={cy} r={rPx} fill="none" stroke="#3ddbb8" strokeWidth="2" />
        {traces.map((t, i) => (
          <g key={i} style={{ ['--d' as string]: `${t.delay}s`, ['--len' as string]: t.len }}>
            <path className={`trace${t.thin ? ' thin' : ''}`} d={t.d} />
            <path className="pulse" d={t.d} filter="url(#glow)" />
          </g>
        ))}
        {[
          [0, 0],
          [box.w, 0],
          [0, box.h],
          [box.w, box.h],
        ].map(([x, y], i) => (
          <circle key={i} className="corner" cx={x} cy={y} r={90} fill="url(#corner)" />
        ))}
      </svg>
      <div ref={canvasHost} className="opening-canvas-host" />
      {reduce && <div className="opening-static-coin" aria-hidden="true" />}
      <div className="opening-words">
        <p className="opening-headline">{headline}</p>
        <p className="opening-sub">{sub}</p>
      </div>
      <span className="opening-skip">Tap to skip</span>
    </div>
  );
}

type Trace = { d: string; len: number; delay: number; thin: boolean };

/**
 * Printed-trace paths from the coin's edge to each corner: out from the rim, a 45° jog, then
 * a serpentine run (like the silver traces printed on the tape) to the corner.
 */
function tracesToCorners(cx: number, cy: number, r: number, w: number, h: number): Trace[] {
  const out: Trace[] = [];
  const corners = [
    [0, 0],
    [w, 0],
    [0, h],
    [w, h],
  ];
  corners.forEach(([X, Y], ci) => {
    [-1, 0, 1].forEach((lane) => {
      const ang = Math.atan2(Y - cy, X - cx) + lane * 0.16;
      const sx = cx + Math.cos(ang) * (r + 4);
      const sy = cy + Math.sin(ang) * (r + 4);
      const ox = sx + Math.cos(ang) * 22;
      const oy = sy + Math.sin(ang) * 22;
      // Jog to a vertical run, then a serpentine toward the corner.
      const tx = X === 0 ? 14 + lane * 9 + 9 : w - 14 - lane * 9 - 9;
      const pts: [number, number][] = [
        [sx, sy],
        [ox, oy],
      ];
      const jog = Math.abs(tx - ox);
      pts.push([tx, oy + Math.sign(Y - oy) * jog]);
      const y0 = oy + Math.sign(Y - oy) * jog;
      const y1 = Y === 0 ? 10 : h - 10;
      const n = Math.max(2, Math.floor(Math.abs(y1 - y0) / 16));
      for (let i = 1; i <= n; i++) {
        const y = y0 + ((y1 - y0) * i) / n;
        pts.push([tx + (i % 2 ? 5 : -5) * (lane === 0 ? 1 : 0.6), y]);
      }
      pts.push([X === 0 ? 2 : w - 2, Y === 0 ? 2 : h - 2]);
      let len = 0;
      for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      out.push({
        d: pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' '),
        len: Math.round(len),
        delay: 0.04 * ci + 0.05 * Math.abs(lane),
        thin: lane !== 0,
      });
    });
  });
  return out;
}
