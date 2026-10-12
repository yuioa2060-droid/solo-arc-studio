import React from 'react';
import {Img, staticFile, useCurrentFrame, continueRender, delayRender} from 'remotion';

// EP3 library: a camera-driven "plate" system (full-bleed illustrated shots), hero cutouts, kinetic type,
// and a few code-drawn visualisations. Everything is a pure function of the current frame.
export const W = 1920, H = 1080;
export const useT = () => useCurrentFrame() / 30;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ease = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeOut = (x: number) => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
export const easeIn = (x: number) => { x = clamp(x); return x * x * x; };
export const easeIO = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const back = (x: number) => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const EM = '#0B8371', EM2 = '#1fbf9f', INK = '#F2F0EA', RED = '#d4574c', GREY = '#8d8a82', BG = '#060606', FROST = '#9fb3c8';

export const useFonts = () => {
  const [h] = React.useState(() => delayRender('font'));
  React.useEffect(() => {
    const f = new FontFace('Jost', `url(${staticFile('fonts/Jost.ttf')})`, {weight: '100 900'});
    f.load().then(x => { (document as any).fonts.add(x); continueRender(h); });
  }, []);
};
export const swim = (t: number, s: number) => { const P = Math.PI * 2; return {x: 12 * Math.sin(P * t / 7.3 + s) + 4 * Math.sin(P * t / 3.1 + s * 2.1), y: 9 * Math.sin(P * t / 5.2 + s * 1.3), r: 0.6 * Math.sin(P * t / 8.6 + s * 0.7)}; };

// ---------------------------------------------------------------- camera plates
export type Cam = {x: number; y: number; z: number; r?: number};
const camAt = (a: Cam, b: Cam | undefined, k: number): Cam => b ? {x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k), r: lerp(a.r ?? 0, b.r ?? 0, k)} : a;
const prof = (m: string | undefined, k: number) => m === 'lin' ? clamp(k) : m === 'out' ? easeOut(k) : m === 'in' ? easeIn(k) : easeIO(k);

const CamImg: React.FC<{src: string; ar: number; cam: Cam; fw: number; fh: number; kids?: (g: {wd: number; hd: number; cam: Cam}) => React.ReactNode; style?: React.CSSProperties}> = ({src, ar, cam, fw, fh, kids, style}) => {
  const hd = Math.max(fw / ar, fh), wd = hd * ar, z = cam.z;
  const cx = clamp(cam.x, fw / 2 / (wd * z), 1 - fw / 2 / (wd * z)), cy = clamp(cam.y, fh / 2 / (hd * z), 1 - fh / 2 / (hd * z));
  const tx = fw / 2 - cx * wd * z, ty = fh / 2 - cy * hd * z;
  return <div style={{position: 'absolute', left: 0, top: 0, width: wd, height: hd, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${z}) rotate(${cam.r ?? 0}deg)`, ...style}}>
    <Img src={staticFile('img/' + src)} style={{position: 'absolute', left: 0, top: 0, width: wd, height: hd, display: 'block'}} />
    {kids ? kids({wd, hd, cam}) : null}
  </div>;
};

const RMAX = 2400;
export type PlateP = {src: string; ar?: number; t0: number; t1: number; a: Cam; b?: Cam; mode?: 'io' | 'out' | 'lin' | 'in'; inD?: number; outD?: number; z?: number;
  fw?: number; fh?: number; ox?: number; oy?: number; shake?: [number, number, number]; whip?: 'l' | 'r'; wipe?: 'l' | 'r' | 'u' | 'd'; iris?: {x: number; y: number; d?: number};
  dim?: number; dimIv?: [number, number, number][]; gray?: string; fz?: {t: number; d: number; cx: number; cy: number}; uf?: {t: number; d: number; cx: number; cy: number};
  kids?: (g: {wd: number; hd: number; cam: Cam}) => React.ReactNode};
export const Plate: React.FC<PlateP> = (p) => {
  const t = useT(); const {t0, t1, a, b} = p; const inD = p.inD ?? 0, outD = p.outD ?? 0;
  if (t < t0 - 0.001 || t > t1 + outD + 0.001) return null;
  const ar = p.ar ?? 16 / 9, fw = p.fw ?? W, fh = p.fh ?? H;
  const k = prof(p.mode, (t - t0) / Math.max(0.001, t1 - t0));
  let cam = camAt(a, b, k);
  if (p.shake) { const [ts, amp, dur] = p.shake; const u = (t - ts) / dur; if (u > 0 && u < 1) { const d = (1 - u) * (1 - u); cam = {...cam, x: cam.x + amp * 0.0004 * Math.sin(t * 83) * d, y: cam.y + amp * 0.0004 * Math.cos(t * 71) * d}; } }
  let opacity = (inD ? clamp((t - t0) / inD) : 1) * (outD ? 1 - clamp((t - t1) / outD) : 1);
  const st: React.CSSProperties = {position: 'absolute', left: p.ox ?? 0, top: p.oy ?? 0, width: fw, height: fh, overflow: 'hidden', zIndex: p.z ?? 1, opacity};
  if (p.whip) { const u = easeOut((t - t0) / 0.28); const sgn = p.whip === 'l' ? -1 : 1; st.transform = `translateX(${sgn * (1 - u) * fw * 0.55}px)`; if (u < 1) st.filter = `blur(${(1 - u) * 22}px)`; st.opacity = opacity * clamp((t - t0) / 0.06); }
  if (p.wipe) { const e = easeOut((t - t0) / 0.5); const r = (1 - e) * 100; st.clipPath = p.wipe === 'l' ? `inset(0 ${r}% 0 0)` : p.wipe === 'r' ? `inset(0 0 0 ${r}%)` : p.wipe === 'u' ? `inset(0 0 ${r}% 0)` : `inset(${r}% 0 0 0)`; }
  if (p.iris) { const e = easeOut((t - t0) / (p.iris.d ?? 0.7)); st.clipPath = `circle(${RMAX * e}px at ${p.iris.x}px ${p.iris.y}px)`; }
  const L = (src: string) => <CamImg src={src} ar={ar} cam={cam} fw={fw} fh={fh} kids={p.kids} />;
  let layers: React.ReactNode = L(p.src), ring: React.ReactNode = null;
  if (p.gray && p.fz) {
    const kf = clamp((t - p.fz.t) / p.fz.d), ku = p.uf ? clamp((t - p.uf.t) / p.uf.d) : 0;
    const circ = (src: string, c: {cx: number; cy: number}, kk: number) => <div style={{position: 'absolute', left: 0, top: 0, width: fw, height: fh, clipPath: `circle(${RMAX * easeOut(kk)}px at ${c.cx}px ${c.cy}px)`}}>{L(src)}</div>;
    if (p.uf && t >= p.uf.t) layers = ku >= 1 ? L(p.src) : <>{L(p.gray)}{circ(p.src, p.uf, ku)}</>;
    else if (t >= p.fz.t) layers = kf >= 1 ? L(p.gray) : <>{L(p.src)}{circ(p.gray, p.fz, kf)}</>;
    const rg = (c: {cx: number; cy: number}, kk: number, w0: number, delay: number) => { const e = clamp(kk - delay); if (e <= 0 || e >= 1) return null; return <circle cx={c.cx} cy={c.cy} r={RMAX * easeOut(e)} fill="none" stroke="#dfe9f2" strokeWidth={w0 * (1 - e) + 1} opacity={0.85 * (1 - Math.pow(e, 0.6))} />; };
    const active = p.uf && t >= p.uf.t ? {c: p.uf, kk: ku} : {c: p.fz, kk: kf};
    ring = <svg width={fw} height={fh} style={{position: 'absolute', left: 0, top: 0}}>{rg(active.c, active.kk, 14, 0)}{rg(active.c, active.kk, 6, 0.06)}</svg>;
  }
  let dm = p.dim ?? 0; (p.dimIv ?? []).forEach(([a0, a1, lv]) => { dm = Math.max(dm, lv * clamp((t - a0) / 0.3) * (1 - clamp((t - a1) / 0.3))); });
  return <div style={st}>{layers}{ring}{dm > 0.001 ? <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${dm})`}} /> : null}</div>;
};

// ---------------------------------------------------------------- cutouts (heroes / objects with alpha)
export const Cut: React.FC<{src: string; x: number; y: number; h: number; t0: number; t1: number; enter?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'pop'; exit?: 'fade' | 'left' | 'right' | 'down';
  outD?: number; seed?: number; alive?: boolean; flip?: boolean; z?: number; opacity?: number; rot?: number; anchor?: 'c' | 'b'; dur?: number; bright?: number; pivot?: string;
  moveTo?: {t: number; x: number; y: number; h: number; d?: number}; spin?: (t: number) => number}> = (p) => {
  const t = useT(); const outD = p.outD ?? 0.4; if (t < p.t0 - 0.01 || t > p.t1 + outD + 0.05) return null;
  const D = p.dur ?? ({up: 0.9, down: 0.8, left: 0.8, right: 0.8, fade: 0.5, pop: 0.5}[p.enter ?? 'up']);
  const e = easeOut((t - p.t0) / D), q = ease((t - p.t1) / outD);
  let dx = 0, dy = 0, sc = 1, op = clamp((t - p.t0) / (D * 0.55)) * (1 - q) * (p.opacity ?? 1);
  const en = p.enter ?? 'up';
  if (en === 'up') dy = (1 - e) * 220; if (en === 'down') dy = -(1 - e) * 220; if (en === 'left') dx = -(1 - e) * 360; if (en === 'right') dx = (1 - e) * 360; if (en === 'pop') sc = 0.7 + 0.3 * back((t - p.t0) / D);
  const ex = p.exit ?? 'fade'; if (ex === 'left') dx -= q * 420; if (ex === 'right') dx += q * 420; if (ex === 'down') dy += q * 260;
  let X = p.x, Y = p.y, Hh = p.h;
  if (p.moveTo) { const m = ease((t - p.moveTo.t) / (p.moveTo.d ?? 0.8)); X += (p.moveTo.x - p.x) * m; Y += (p.moveTo.y - p.y) * m; Hh += (p.moveTo.h - p.h) * m; }
  const f = p.alive === false ? {x: 0, y: 0, r: 0} : swim(t, p.seed ?? 1);
  const ty = p.anchor === 'b' ? '-100%' : '-50%';
  const rot = (p.rot ?? 0) + f.r + (p.spin ? p.spin(t) : 0);
  return <div style={{position: 'absolute', left: X + dx + f.x, top: Y + dy + f.y, height: Hh, zIndex: p.z ?? 5, transform: `translate(-50%, ${ty}) rotate(${rot}deg) scale(${sc * (p.flip ? -1 : 1)}, ${sc})`, transformOrigin: p.pivot ?? '50% 50%', opacity: op, filter: p.bright !== undefined ? `brightness(${p.bright})` : undefined, clipPath: 'inset(2px)'}}>
    <Img src={staticFile('img/' + p.src)} style={{height: Hh, display: 'block'}} /></div>;
};

// ---------------------------------------------------------------- kinetic type
export type Tok = {w: string; at: number; c?: string; s?: number; b?: number; i?: boolean; strike?: number; nl?: boolean};
export const Words: React.FC<{toks: Tok[]; x: number; y: number; size?: number; t1: number; align?: 'c' | 'l' | 'r'; weight?: number; enter?: 'rise' | 'pop' | 'fade' | 'type' | 'slide'; z?: number;
  track?: number; upper?: boolean; scrim?: number; c?: string; skew?: number; shake?: number; outD?: number; lh?: number; gap?: number; glow?: string}> = (p) => {
  const t = useT(); const size = p.size ?? 64, outD = p.outD ?? 0.3, first = p.toks[0].at;
  if (t < first - 0.25 || t > p.t1 + outD + 0.05) return null;
  const q = ease((t - p.t1) / outD), al = p.align ?? 'c', en = p.enter ?? 'rise';
  const lines: Tok[][] = [[]]; p.toks.forEach(k => { if (k.nl && lines[lines.length - 1].length) lines.push([]); lines[lines.length - 1].push(k); });
  const sh = p.shake ? {x: p.shake * Math.sin(t * 43), y: p.shake * Math.cos(t * 37)} : {x: 0, y: 0};
  const tf = al === 'c' ? '-50%' : al === 'r' ? '-100%' : '0';
  const rise = (at: number) => easeOut((t - at + 0.03) / 0.34);
  return <div style={{position: 'absolute', left: p.x + sh.x, top: p.y + sh.y, zIndex: p.z ?? 8, transform: `translate(${tf}, -50%)`, opacity: 1 - q, fontFamily: 'Jost', textAlign: al === 'c' ? 'center' : al === 'r' ? 'right' : 'left', whiteSpace: 'nowrap', textShadow: p.glow ? `0 0 28px ${p.glow}` : '0 2px 22px rgba(0,0,0,.92), 0 0 3px rgba(0,0,0,.6)'}}>
    {p.scrim ? <div style={{position: 'absolute', left: '-8%', right: '-8%', top: '-30%', bottom: '-30%', background: `radial-gradient(ellipse at center, rgba(0,0,0,${p.scrim}) 0%, rgba(0,0,0,0) 70%)`, zIndex: -1}} /> : null}
    {lines.map((ln, li) => <div key={li} style={{display: 'flex', justifyContent: al === 'c' ? 'center' : al === 'r' ? 'flex-end' : 'flex-start', alignItems: 'baseline', gap: size * (p.gap ?? 0.28), lineHeight: p.lh ?? 1.12}}>
      {ln.map((k, i) => {
        const fs = size * (k.s ?? 1); const e = rise(k.at); const col = k.c ?? p.c ?? INK; const wt = k.b ?? p.weight ?? 600;
        let txt = k.w, tr = '', op = e;
        if (en === 'pop') { tr = `scale(${0.55 + 0.45 * back((t - k.at + 0.03) / 0.42)})`; op = clamp((t - k.at + 0.03) / 0.12); }
        else if (en === 'fade') { op = clamp((t - k.at + 0.03) / 0.4); }
        else if (en === 'slide') { tr = `translateX(${(1 - e) * -size * 0.7}px)`; }
        else if (en === 'type') { const n = Math.floor(clamp((t - k.at) / (k.w.length * 0.04)) * k.w.length); txt = k.w.slice(0, n); op = n > 0 ? 1 : 0; }
        else { tr = `translateY(${(1 - e) * size * 0.45}px)`; }
        if (p.upper) txt = txt.toUpperCase();
        const sk = k.i || p.skew ? `skewX(${p.skew ?? -10}deg)` : '';
        return <span key={i} style={{position: 'relative', display: 'inline-block', fontSize: fs, fontWeight: wt, color: col, letterSpacing: p.track ?? 0, opacity: op, transform: `${tr} ${sk}`, minWidth: en === 'type' ? undefined : undefined}}>
          {txt}
          {k.strike !== undefined && t > k.strike ? <span style={{position: 'absolute', left: -4, top: '54%', height: Math.max(5, fs * 0.09), width: `${easeOut((t - k.strike) / 0.28) * 108}%`, background: RED, borderRadius: 3}} /> : null}
        </span>;
      })}
    </div>)}
  </div>;
};

// small grey caption (sources, qualifiers)
export const Cap: React.FC<{x: number; y: number; text: string; t0: number; t1: number; size?: number; c?: string; align?: 'c' | 'l' | 'r'; w?: number; z?: number; track?: number}> = ({x, y, text, t0, t1, size = 34, c = GREY, align = 'c', w = 500, z = 9, track = 2}) => {
  const t = useT(); if (t < t0 - 0.01 || t > t1 + 0.5) return null;
  const p = easeOut((t - t0) / 0.45), q = ease((t - t1) / 0.35);
  return <div style={{position: 'absolute', left: x, top: y + (1 - p) * 12, zIndex: z, transform: `translate(${align === 'c' ? '-50%' : align === 'r' ? '-100%' : '0'}, -50%)`, fontFamily: 'Jost', fontWeight: w, fontSize: size, color: c, letterSpacing: track, opacity: p * (1 - q), whiteSpace: 'pre', textAlign: align === 'c' ? 'center' : align === 'r' ? 'right' : 'left', lineHeight: 1.25, textShadow: '0 2px 16px rgba(0,0,0,.95)'}}>{text}</div>;
};

// ---------------------------------------------------------------- HUD: time of day + freeze indicator
export const Hud: React.FC<{states: {t: number; day: string; time: string}[]; frozen: [number, number][]; x?: number; y?: number; t0?: number; t1: number}> = ({states, frozen, x = 84, y = 986, t0 = 0, t1}) => {
  const t = useT(); if (t < t0 || t > t1 + 0.4) return null;
  let i = 0; states.forEach((s, k) => { if (t >= s.t) i = k; });
  const s = states[i], u = easeOut((t - s.t) / 0.35), prev = i > 0 ? states[i - 1] : null;
  const fz = frozen.some(([a, b]) => t >= a && t < b);
  const col = fz ? FROST : INK; const o = clamp((t - t0) / 0.5) * (1 - ease((t - t1) / 0.4));
  const txt = (d: string, tm: string, dy: number, op: number) => <div style={{position: 'absolute', left: 0, top: dy, opacity: op, whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', gap: 16}}>
    <span style={{fontSize: 36, fontWeight: 600, letterSpacing: 8, color: col}}>{d}</span><span style={{fontSize: 36, fontWeight: 400, letterSpacing: 5, color: col, opacity: 0.85}}>{tm}</span></div>;
  return <div style={{position: 'absolute', left: x, top: y, height: 40, width: 520, zIndex: 30, fontFamily: 'Jost', opacity: o, textShadow: '0 2px 14px rgba(0,0,0,.9)'}}>
    {fz ? <svg width={26} height={30} style={{position: 'absolute', left: -44, top: 3}}><rect x={2} y={2} width={7} height={24} fill={FROST} /><rect x={16} y={2} width={7} height={24} fill={FROST} /></svg> : null}
    {prev && u < 1 ? txt(prev.day, prev.time, -u * 22, 1 - u) : null}
    {txt(s.day, s.time, prev ? (1 - u) * 22 : 0, prev ? u : 1)}
  </div>;
};

// ---------------------------------------------------------------- cinematic helpers
export const Bars: React.FC<{t0: number; t1: number; h?: number}> = ({t0, t1, h = 120}) => {
  const t = useT(); if (t < t0 - 0.01 || t > t1 + 0.7) return null;
  const e = easeOut((t - t0) / 0.6) * (1 - easeIn((t - t1) / 0.55)); const hh = h * e;
  return <><div style={{position: 'absolute', left: 0, top: 0, width: W, height: hh, background: '#000', zIndex: 40}} /><div style={{position: 'absolute', left: 0, bottom: 0, width: W, height: hh, background: '#000', zIndex: 40}} /></>;
};
export const Vignette: React.FC<{k?: number}> = ({k = 0.42}) => <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${k}) 100%)`}} />;
export const Flash: React.FC<{at: number; peak?: number; c?: string; len?: number}> = ({at, peak = 0.7, c = '#fff', len = 0.4}) => { const t = useT(); const u = t - at; if (u < 0 || u > len) return null; return <div style={{position: 'absolute', inset: 0, zIndex: 45, background: c, opacity: peak * (u < 0.03 ? u / 0.03 : 1 - ease((u - 0.03) / (len - 0.03)))}} />; };
export const FadeBlack: React.FC<{at: number; d: number}> = ({at, d}) => { const t = useT(); if (t < at) return null; return <div style={{position: 'absolute', inset: 0, background: '#000', zIndex: 60, opacity: ease((t - at) / d)}} />; };
export const Dip: React.FC<{t0: number; t1: number; c?: string; peak?: number}> = ({t0, t1, c = '#000', peak = 1}) => { const t = useT(); if (t < t0 || t > t1) return null; const m = (t0 + t1) / 2; const o = peak * (t < m ? ease((t - t0) / (m - t0)) : 1 - ease((t - m) / (t1 - m))); return <div style={{position: 'absolute', inset: 0, background: c, zIndex: 50, opacity: o}} />; };
export const Glow: React.FC<{x: number; y: number; t0: number; t1: number; r: number; c?: string}> = ({x, y, t0, t1, r, c = '255,110,40'}) => {
  const t = useT(); if (t < t0 || t > t1 + 0.8) return null; const e = easeOut((t - t0) / 1.4), q = ease((t - t1) / 0.7);
  return <div style={{position: 'absolute', left: x - r * e, top: y - r * e, width: 2 * r * e, height: 2 * r * e, borderRadius: '50%', zIndex: 12, opacity: (1 - q) * 0.9, background: `radial-gradient(circle, rgba(${c},.75) 0%, rgba(${c},.35) 38%, rgba(${c},0) 70%)`}} />;
};
export const CountUp: React.FC<{x: number; y: number; from: number; to: number; t0: number; d: number; t1: number; size?: number; c?: string; suffix?: string; z?: number}> = ({x, y, from, to, t0, d, t1, size = 150, c = INK, suffix = '', z = 9}) => {
  const t = useT(); if (t < t0 - 0.01 || t > t1 + 0.5) return null; const v = Math.round(lerp(from, to, easeOut((t - t0) / d)));
  const p = easeOut((t - t0) / 0.3), q = ease((t - t1) / 0.4);
  return <div style={{position: 'absolute', left: x, top: y, zIndex: z, transform: 'translate(-50%,-50%)', fontFamily: 'Jost', fontWeight: 700, fontSize: size, color: c, opacity: p * (1 - q), fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 24px rgba(0,0,0,.9)'}}>{v}{suffix}</div>;
};

export const Tick: React.FC<{x: number; y: number; s?: number; t0: number; t1: number; c?: string; z?: number}> = ({x, y, s = 70, t0, t1, c = EM2, z = 9}) => {
  const t = useT(); if (t < t0 || t > t1 + 0.4) return null; const p = easeOut((t - t0) / 0.4), q = ease((t - t1) / 0.3);
  return <svg width={s} height={s} viewBox="0 0 60 60" style={{position: 'absolute', left: x - s / 2, top: y - s / 2, zIndex: z, opacity: 1 - q, overflow: 'visible', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.8))'}}><path d="M6 32 L24 50 L56 8" fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 * (1 - p)} /></svg>;
};

// ---------------------------------------------------------------- analogue clock (hands drawn in code over a handless clock face)
export const ClockHands: React.FC<{cx: number; cy: number; r: number; from: number; to: number; t0: number; d: number; t1: number; z?: number}> = ({cx, cy, r, from, to, t0, d, t1, z = 6}) => {
  const t = useT(); if (t > t1 + 0.4) return null; const m = lerp(from, to, easeIO((t - t0) / d)); // minutes after 12:00
  const ma = (m % 60) * 6, ha = (m / 60) * 30; const o = 1 - ease((t - t1) / 0.4);
  const hand = (deg: number, len: number, w: number, c: string) => { const a = (deg - 90) * Math.PI / 180; return <line x1={cx - Math.cos(a) * len * 0.12} y1={cy - Math.sin(a) * len * 0.12} x2={cx + Math.cos(a) * len} y2={cy + Math.sin(a) * len} stroke={c} strokeWidth={w} strokeLinecap="round" />; };
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, zIndex: z, opacity: o}}>{hand(ha, r * 0.5, r * 0.055, '#111')}{hand(ma, r * 0.78, r * 0.035, '#111')}<circle cx={cx} cy={cy} r={r * 0.045} fill={EM} /></svg>;
};

// ---------------------------------------------------------------- 1975: two arrows (direction only, no invented data)
export const Arrows2: React.FC<{t0: number; t1: number; aT: number; bT: number; aL?: number; bL?: number}> = ({t0, t1, aT, bT, aL, bL}) => {
  const t = useT(); if (t < t0 - 0.01 || t > t1 + 0.5) return null; const o = easeOut((t - t0) / 0.5) * (1 - ease((t - t1) / 0.4));
  const arrow = (x: number, up: boolean, at: number, c: string) => { const p = easeOut((t - at) / 0.8); const y0 = up ? 760 : 380, y1 = up ? 380 : 760; const yy = lerp(y0, y1, p);
    const dir = up ? -1 : 1; return <g opacity={clamp((t - at + 0.1) / 0.2)}>
      <line x1={x} y1={y0} x2={x} y2={yy - dir * 36} stroke={c} strokeWidth={30} strokeLinecap="round" />
      {p > 0.9 ? <polygon points={`${x - 60},${y1 - dir * 80} ${x + 60},${y1 - dir * 80} ${x},${y1}`} fill={c} opacity={clamp((p - 0.9) / 0.1)} /> : null}</g>; };
  const lab = (x: number, l1: string, l2: string, c: string, at: number) => <div style={{position: 'absolute', left: x, top: 232, transform: 'translate(-50%,-50%)', textAlign: 'center', fontFamily: 'Jost', fontWeight: 600, fontSize: 44, letterSpacing: 6, color: c, lineHeight: 1.2, opacity: clamp((t - at + 0.3) / 0.4), whiteSpace: 'pre', textShadow: '0 2px 18px rgba(0,0,0,.9)'}}>{l1}{'\n'}{l2}</div>;
  const big = (x: number, s: string, c: string, at: number, y: number) => <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', fontFamily: 'Jost', fontWeight: 700, fontSize: 84, color: c, opacity: clamp((t - at - 0.5) / 0.4), textShadow: '0 2px 24px rgba(0,0,0,.9)', letterSpacing: 4}}>{s}</div>;
  return <div style={{position: 'absolute', inset: 0, zIndex: 10, opacity: o}}>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{arrow(520, false, aT, INK)}{arrow(1400, true, bT, RED)}</svg>
    {lab(520, 'NON-DIETERS', '', INK, aL ?? aT)}{lab(1400, 'DIETERS', '', RED, bL ?? bT)}
    {big(520, 'ATE LESS', INK, aT, 850)}{big(1400, 'ATE MORE', RED, bT, 322)}
  </div>;
};

// ---------------------------------------------------------------- the rule that breaks
export const RuleBreak: React.FC<{t0: number; t1: number; breakAt: number; fadeAt: number; y?: number}> = ({t0, t1, breakAt, fadeAt, y = 540}) => {
  const t = useT(); if (t < t0 - 0.01 || t > t1 + 0.6) return null;
  const o = easeOut((t - t0) / 0.5) * (1 - ease((t - t1) / 0.5)); const e = back((t - breakAt) / 0.45) * (t >= breakAt ? 1 : 0), dim = 1 - 0.72 * ease((t - fadeAt) / 0.8), sink = ease((t - fadeAt) / 1.0) * 46;
  const draw = easeOut((t - t0) / 0.7);
  const lx = 360, rx = 1560, mid = 960;
  const left = `M${lx} ${y} L${lx + (mid - lx) * draw - 36} ${y} L${lx + (mid - lx) * draw - 20} ${y - 18} L${lx + (mid - lx) * draw - 30} ${y + 14} L${lx + (mid - lx) * draw - 6} ${y - 4}`;
  const right = `M${rx} ${y} L${rx - (rx - mid) * draw + 36} ${y} L${rx - (rx - mid) * draw + 20} ${y + 18} L${rx - (rx - mid) * draw + 30} ${y - 14} L${rx - (rx - mid) * draw + 6} ${y + 4}`;
  const piece = (d: string, dx: number, dy: number, rot: number, ox: number) => <g style={{transform: `translate(${dx * e}px, ${dy * e + sink * (t >= breakAt ? 1 : 0)}px) rotate(${rot * e}deg)`, transformOrigin: `${ox}px ${y}px`}} opacity={t >= breakAt ? dim : 1}><path d={d} fill="none" stroke={INK} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" /></g>;
  return <div style={{position: 'absolute', inset: 0, zIndex: 10, opacity: o}}>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{piece(left, -34, 28, -5, lx + 560)}{piece(right, 36, 36, 6, rx - 560)}</svg>
    <div style={{position: 'absolute', left: 560, top: y - 78, transform: `translate(${-34 * e}px, ${28 * e + sink * (t >= breakAt ? 1 : 0)}px) rotate(${-5 * e}deg)`, fontFamily: 'Jost', fontWeight: 600, fontSize: 66, letterSpacing: 14, color: INK, opacity: dim, textShadow: '0 2px 20px #000'}}>THE</div>
    <div style={{position: 'absolute', left: 1180, top: y - 78, transform: `translate(${36 * e}px, ${36 * e + sink * (t >= breakAt ? 1 : 0)}px) rotate(${6 * e}deg)`, fontFamily: 'Jost', fontWeight: 600, fontSize: 66, letterSpacing: 14, color: INK, opacity: dim, textShadow: '0 2px 20px #000'}}>RULE</div>
  </div>;
};

// ---------------------------------------------------------------- the week's calorie gap as a budget bar
export const WeekGap: React.FC<{t0: number; t1: number; seg: number[]; totalAt: number; sliceAt: number; guessAt: number; revealAt: number; revealEnd: number; bigAt: number; leftAt: number; y?: number}> = (p) => {
  const t = useT(); if (t < p.t0 - 0.01 || t > p.t1 + 0.6) return null;
  const o = easeOut((t - p.t0) / 0.5) * (1 - ease((t - p.t1) / 0.5)); const x0 = 240, w = 1440, bh = 120, y = p.y ?? 560, gap = 8, sw = (w - gap * 6) / 7;
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const spent = 500 / 3500 * ease((t - p.sliceAt) / 0.4) + (2000 / 3500) * easeIO((t - p.bigAt) / 1.1);
  const redW = w * spent, fillRight = x0 + w * (1 - spent);
  const total = easeOut((t - p.totalAt) / 0.6);
  const q = clamp((t - p.guessAt) / 0.3) * (1 - clamp((t - p.revealAt + 0.05) / 0.2));
  return <div style={{position: 'absolute', inset: 0, zIndex: 9, opacity: o, fontFamily: 'Jost', textShadow: '0 2px 20px rgba(0,0,0,.9)'}}>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {days.map((d, i) => { const fx = x0 + i * (sw + gap); const f = easeOut((t - p.seg[i]) / 0.3); return <g key={d}><rect x={fx} y={y} width={sw} height={bh} fill="#151515" /><rect x={fx} y={y} width={sw * f} height={bh} fill={EM} /></g>; })}
      <rect x={fillRight} y={y - 6} width={Math.max(0, x0 + w - fillRight)} height={bh + 12} fill="#060606" />
      {spent > 0.001 ? <rect x={fillRight} y={y} width={redW} height={bh} fill={RED} /> : null}
      {total > 0 ? <path d={`M${x0} ${y - 40} L${x0} ${y - 62} L${x0 + w * total} ${y - 62} L${x0 + w * total} ${y - 40}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null}
      {t > p.revealAt ? <rect x={x0 + w * (1 - 500 / 3500) - 6} y={y - 12} width={w * 500 / 3500 + 12} height={bh + 24} fill="none" stroke={INK} strokeWidth={5} opacity={clamp((t - p.revealAt) / 0.3) * (1 - clamp((t - p.revealEnd) / 0.4))} /> : null}
    </svg>
    {days.map((d, i) => <div key={d} style={{position: 'absolute', left: x0 + i * (sw + gap) + sw / 2, top: y + bh + 40, transform: 'translate(-50%,-50%)', fontSize: 32, letterSpacing: 5, fontWeight: 600, color: GREY, opacity: clamp((t - p.seg[i]) / 0.3)}}>{d}</div>)}
    <div style={{position: 'absolute', left: x0 + w / 2, top: y - 108, transform: 'translate(-50%,-50%)', fontSize: 56, fontWeight: 600, letterSpacing: 3, color: INK, opacity: total, whiteSpace: 'nowrap'}}>a 500-calorie gap a day  =  3,500 a week</div>
    <div style={{position: 'absolute', left: x0 + w - w * 250 / 3500, top: y + bh + 118, transform: 'translate(-50%,-50%)', fontSize: 46, fontWeight: 600, color: RED, opacity: clamp((t - p.sliceAt - 0.3) / 0.4) * (1 - clamp((t - p.bigAt) / 0.3))}}>slice ≈ 500</div>
    <div style={{position: 'absolute', left: x0 + w - w * 1500 / 3500, top: y + bh + 118, transform: 'translate(-50%,-50%)', fontSize: 46, fontWeight: 600, color: RED, opacity: clamp((t - p.bigAt - 0.9) / 0.4)}}>the “might as well” evening ≈ 2,000</div>
    <div style={{position: 'absolute', left: x0 + w * 0.16, top: y + bh + 118, transform: 'translate(-50%,-50%)', fontSize: 46, fontWeight: 600, color: EM2, opacity: clamp((t - p.leftAt) / 0.4)}}>gap left ≈ 1,000</div>
    <div style={{position: 'absolute', left: 960, top: 235, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: q}}>
      <div style={{fontSize: 40, letterSpacing: 6, color: GREY, fontWeight: 600}}>WHAT FRACTION OF YOUR WEEK?</div><div style={{fontSize: 220, fontWeight: 700, color: INK, lineHeight: 1}}>?</div></div>
    <div style={{position: 'absolute', left: 960, top: 245, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * back((t - p.revealAt) / 0.5)})`, textAlign: 'center', opacity: clamp((t - p.revealAt) / 0.2) * (1 - clamp((t - p.revealEnd) / 0.3))}}>
      <div style={{fontSize: 40, letterSpacing: 6, color: GREY, fontWeight: 600}}>ONE DAY OF SEVEN</div><div style={{fontSize: 200, fontWeight: 700, color: EM2, lineHeight: 1}}>1 / 7</div></div>
  </div>;
};

// ---------------------------------------------------------------- Monday that keeps moving
export const MondayStrip: React.FC<{t0: number; t1: number; y?: number}> = ({t0, t1, y = 540}) => {
  const t = useT(); if (t < t0 - 0.01 || t > t1 + 0.6) return null; const d = t1 - t0;
  const o = easeOut((t - t0) / 0.4) * (1 - ease((t - t1) / 0.5)); const cw = 170, names = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const scroll = (t - t0) / d * cw * 9.6, headX = 560;
  // "START" ring sits on the next Monday; whenever the playhead gets close it hops one week further
  const mondays = [5, 12, 19, 26]; const px = headX + scroll; // playhead in strip coordinates (strip starts at index 0 = WED)
  let target = mondays[mondays.length - 1]; for (const m of mondays) { const mx = m * cw + cw / 2; if (px < mx - cw * 1.4) { target = m; break; } }
  const hop = (m: number) => m * cw + cw / 2;
  return <div style={{position: 'absolute', inset: 0, zIndex: 9, opacity: o, fontFamily: 'Jost', textShadow: '0 2px 18px rgba(0,0,0,.9)'}}>
    <div style={{position: 'absolute', left: headX - scroll, top: y - 60, width: cw * 30, height: 120}}>
      {Array.from({length: 28}).map((_, i) => { const nm = names[(i + 2) % 7]; const mon = nm === 'MON'; return <div key={i} style={{position: 'absolute', left: i * cw, top: 0, width: cw - 10, height: 120, border: `3px solid ${mon ? EM2 : 'rgba(242,240,234,.28)'}`, borderRadius: 14, background: mon ? 'rgba(11,131,113,.16)' : 'rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 600, letterSpacing: 5, color: mon ? EM2 : INK}}>{nm}</div>; })}
      <div style={{position: 'absolute', left: hop(target) - 120, top: -120, width: 240, textAlign: 'center', fontSize: 40, fontWeight: 700, letterSpacing: 8, color: EM2, transition: 'none'}}>START</div>
    </div>
    <div style={{position: 'absolute', left: headX - 6, top: y - 100, width: 12, height: 200, background: INK, borderRadius: 6, boxShadow: '0 0 24px rgba(242,240,234,.5)'}} />
  </div>;
};

// ---------------------------------------------------------------- 84 days (habit study): one missed cell, the grid keeps filling
export const HabitGrid: React.FC<{t0: number; t1: number; fillAt: number; fillD: number; missIdx: number; missAt: number; y?: number}> = (p) => {
  const t = useT(); if (t < p.t0 - 0.01 || t > p.t1 + 0.6) return null; const o = easeOut((t - p.t0) / 0.5) * (1 - ease((t - p.t1) / 0.5));
  const cols = 14, rows = 6, cs = 74, g = 12, gw = cols * cs + (cols - 1) * g, gx = 960 - gw / 2, gy = (p.y ?? 520) - (rows * cs + (rows - 1) * g) / 2;
  const prog = clamp((t - p.fillAt) / p.fillD) * 84; const missK = easeOut((t - p.missAt) / 0.4);
  return <div style={{position: 'absolute', inset: 0, zIndex: 9, opacity: o, fontFamily: 'Jost'}}>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {Array.from({length: 84}).map((_, i) => { const c = i % cols, r = Math.floor(i / cols); const x = gx + c * (cs + g), y = gy + r * (cs + g); const f = easeOut(prog - i); const miss = i === p.missIdx;
        return <g key={i}><rect x={x} y={y} width={cs} height={cs} rx={12} fill="#141414" stroke="rgba(242,240,234,.14)" strokeWidth={2} />
          {miss ? (f > 0 ? <rect x={x + 4} y={y + 4} width={cs - 8} height={cs - 8} rx={10} fill="none" stroke={RED} strokeWidth={5} opacity={f} /> : null) : <rect x={x + cs / 2 - (cs / 2) * f} y={y + cs / 2 - (cs / 2) * f} width={cs * f} height={cs * f} rx={12} fill={EM} />}</g>; })}
    </svg>
    <div style={{position: 'absolute', left: gx + (p.missIdx % cols) * (cs + g) + cs / 2, top: gy + Math.floor(p.missIdx / cols) * (cs + g) - 64, transform: 'translate(-50%,-50%)', fontSize: 44, fontWeight: 700, letterSpacing: 6, color: RED, opacity: missK, whiteSpace: 'nowrap', background: '#060606', padding: '4px 26px 6px', borderRadius: 16, border: `2px solid ${RED}`}}>1 MISSED DAY</div>
  </div>;
};

// ---------------------------------------------------------------- typed text on a phone screen (image-space overlay)
export const PhoneType: React.FC<{lines: {w: string; at: number; c?: string}[]; sx: number; sy: number; sw: number; sh: number; size: number; t0: number}> = ({lines, sx, sy, sw, sh, size, t0}) => {
  const t = useT(); const cur = Math.floor(t * 2) % 2 === 0;
  return <div style={{position: 'absolute', left: sx, top: sy, width: sw, height: sh, padding: `${size * 0.9}px ${size * 0.5}px`, boxSizing: 'border-box', overflow: 'hidden', background: '#f4f3ee', borderRadius: size * 0.35, opacity: clamp((t - t0) / 0.3), fontFamily: 'Jost', color: '#141414', fontSize: size, fontWeight: 500, lineHeight: 1.22}}>
    {lines.map((l, i) => { const n = Math.floor(clamp((t - l.at) / (l.w.length * 0.045)) * l.w.length); const last = n < l.w.length && n > 0;
      return <span key={i} style={{color: l.c ?? '#141414', fontWeight: l.c ? 700 : 500}}>{l.w.slice(0, n)}{last && cur ? <span style={{display: 'inline-block', width: size * 0.07, height: size * 0.95, background: EM, verticalAlign: 'text-bottom', marginLeft: 2}} /> : null}{n >= l.w.length ? ' ' : ''}</span>; })}
  </div>;
};

// split-screen labels / divider / per-half time chips
export const SplitUI: React.FC<{t0: number; t1: number; la: string; lb: string; laAt: number; lbAt: number; ta: {t: number; s: string}[]; tb: {t: number; s: string}[]}> = ({t0, t1, la, lb, laAt, lbAt, ta, tb}) => {
  const t = useT(); if (t < t0 - 0.01 || t > t1 + 0.4) return null; const o = easeOut((t - t0) / 0.4) * (1 - ease((t - t1) / 0.35));
  const cur = (arr: {t: number; s: string}[]) => { let c: {t: number; s: string} | null = null; arr.forEach(x => { if (t >= x.t) c = x; }); return c; };
  const chip = (x: number, c: {t: number; s: string} | null, col: string) => c ? <div style={{position: 'absolute', left: x, top: 986, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * back((t - c.t) / 0.35)})`, background: 'rgba(6,6,6,.88)', border: `2px solid ${col}`, borderRadius: 40, padding: '10px 34px', fontSize: 36, fontWeight: 600, letterSpacing: 6, color: INK, whiteSpace: 'nowrap'}}>{c.s}</div> : null;
  const tag = (x: number, s: string, col: string, at: number) => <div style={{position: 'absolute', left: x, top: 62, fontSize: 54, fontWeight: 700, letterSpacing: 6, color: col, opacity: clamp((t - at) / 0.3), transform: `translateY(${(1 - easeOut((t - at) / 0.4)) * 14}px)`}}>{s}</div>;
  return <div style={{position: 'absolute', inset: 0, zIndex: 35, opacity: o, fontFamily: 'Jost', textShadow: '0 2px 18px rgba(0,0,0,.95)'}}>
    <div style={{position: 'absolute', left: 958, top: 0, width: 4, height: H, background: BG}} />
    {tag(60, la, RED, laAt)}{tag(1020, lb, EM2, lbAt)}{chip(480, cur(ta), RED)}{chip(1440, cur(tb), EM2)}
  </div>;
};
