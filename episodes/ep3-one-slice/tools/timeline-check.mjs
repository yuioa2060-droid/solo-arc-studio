// Static timeline audit for the montage: node tools/timeline-check.mjs [--list]
// Bundles src/FilmS.tsx against a recording mock of libS, walks the element tree and reports
//  - text blocks (Words/Cap/CountUp) whose estimated boxes overlap while both are visible
//  - the on-screen text list with the word being spoken when each block starts (--list)
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../film');
const require = createRequire(path.join(root, 'package.json'));
const esbuild = require('esbuild');
const out = path.join(root, 'out/timeline-check.bundle.mjs');
const mock = `
const mk = (n) => { const f = () => null; f.displayName = n; return f; };
export const Plate = mk('Plate'), PlateP = mk('PlateP'), Cut = mk('Cut'), Words = mk('Words'), Cap = mk('Cap'), Hud = mk('Hud'), Bars = mk('Bars'), Vignette = mk('Vignette'), Flash = mk('Flash'),
  FadeBlack = mk('FadeBlack'), Dip = mk('Dip'), Glow = mk('Glow'), CountUp = mk('CountUp'), ClockHands = mk('ClockHands'), Arrows2 = mk('Arrows2'), RuleBreak = mk('RuleBreak'), WeekGap = mk('WeekGap'),
  MondayStrip = mk('MondayStrip'), HabitGrid = mk('HabitGrid'), PhoneType = mk('PhoneType'), SplitUI = mk('SplitUI'), Tick = mk('Tick');
export const useFonts = () => {}; export const useT = () => 0; export const easeOut = (x) => x; export const ease = (x) => x;
export const EM2 = '#0B8371', INK = '#fff', RED = '#c0392b', GREY = '#999', BG = '#060606', W = 1920, H = 1080;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));`;
const mockPath = path.join(root, 'out/libS.mock.mjs'); fs.mkdirSync(path.dirname(mockPath), {recursive: true}); fs.writeFileSync(mockPath, mock);
await esbuild.build({entryPoints: [path.join(root, 'src/FilmS.tsx')], bundle: true, platform: 'node', format: 'esm', outfile: out, jsx: 'automatic', logLevel: 'error',
  plugins: [{name: 'mock-lib', setup(b) { b.onResolve({filter: /^\.\/libS$/}, () => ({path: mockPath})); }}], external: ['react', 'react-dom', 'remotion', 'react/jsx-runtime']});
const {FilmS} = await import(out);
const tl = await esbuild.build({entryPoints: [path.join(root, 'src/tl.ts')], bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'error'});
const tlm = await import('data:text/javascript;base64,' + Buffer.from(tl.outputFiles[0].text).toString('base64'));
const tree = FilmS({});
const items = [];
const walk = (el) => {
  if (!el || typeof el !== 'object') return;
  if (Array.isArray(el)) return el.forEach(walk);
  const n = el.type?.displayName, p = el.props || {};
  if (n === 'Words' || n === 'Cap' || n === 'CountUp') items.push({n, p});
  walk(p.children);
};
walk(tree);
const cw = (ch) => /[A-Z]/.test(ch) ? 0.66 : /[0-9]/.test(ch) ? 0.58 : ch === ' ' ? 0.25 : /[.,;:'!"\u2019\u201c\u201d|]/.test(ch) ? 0.28 : /[mwMW]/.test(ch) ? 0.8 : /[ilj1tf]/.test(ch) ? 0.3 : 0.5;
const tw = (s, size, track = 0, upper = false, bold = 1.04) => [...(upper ? s.toUpperCase() : s)].reduce((a, ch) => a + cw(ch) * size * bold + track, 0);
const boxes = (it, tau) => {   // visible token/line boxes at time tau -> {alpha, rects[]}
  const {n, p} = it;
  if (n === 'Cap') {
    const size = p.size ?? 34, lines = String(p.text).split('\n'); const w = Math.max(...lines.map((l) => tw(l, size, p.track ?? 2, false, 1)));
    const a = Math.max(0, Math.min(1, (tau - p.t0) / 0.45)) * (1 - Math.max(0, Math.min(1, (tau - p.t1) / 0.35)));
    if (tau < p.t0 || tau > p.t1 + 0.5) return {alpha: 0, rects: []};
    const h = lines.length * size * 1.25, al = p.align ?? 'c', x0 = al === 'c' ? p.x - w / 2 : al === 'r' ? p.x - w : p.x;
    return {alpha: a, rects: [[x0, p.y - h / 2, x0 + w, p.y + h / 2]]};
  }
  if (n === 'CountUp') {
    const size = p.size ?? 150, w = String(Math.round(p.to)).length * 0.58 * size;
    const a = Math.max(0, Math.min(1, (tau - p.t0) / 0.3)) * (1 - Math.max(0, Math.min(1, (tau - p.t1) / 0.4)));
    if (tau < p.t0 || tau > p.t1 + 0.5) return {alpha: 0, rects: []};
    return {alpha: a, rects: [[p.x - w / 2, p.y - size * 0.55, p.x + w / 2, p.y + size * 0.55]]};
  }
  const size = p.size ?? 64, outD = p.outD ?? 0.3, toks = p.toks, first = toks[0].at;
  if (tau < first - 0.25 || tau > p.t1 + outD + 0.05) return {alpha: 0, rects: []};
  const q = Math.max(0, Math.min(1, (tau - p.t1) / outD)), gap = size * (p.gap ?? 0.28), lh = size * (p.lh ?? 1.12);
  const lines = [[]]; toks.forEach((k) => { if (k.nl && lines[lines.length - 1].length) lines.push([]); lines[lines.length - 1].push(k); });
  const widths = lines.map((ln) => ln.reduce((a, k, i) => a + tw(k.w, size * (k.s ?? 1), p.track ?? 0, !!p.upper) + (i ? gap : 0), 0)), W = Math.max(...widths), Hh = lines.length * lh;
  const al = p.align ?? 'c', bx = al === 'c' ? p.x - W / 2 : al === 'r' ? p.x - W : p.x, rects = []; let amax = 0;
  lines.forEach((ln, li) => {
    let x = (al === 'c' ? bx + (W - widths[li]) / 2 : al === 'r' ? bx + W - widths[li] : bx);
    ln.forEach((k) => {
      const kw = tw(k.w, size * (k.s ?? 1), p.track ?? 0, !!p.upper), a = Math.max(0, Math.min(1, (tau - k.at + 0.03) / 0.34)) * (1 - q);
      if (a > 0.2) rects.push([x, p.y - Hh / 2 + li * lh, x + kw, p.y - Hh / 2 + (li + 1) * lh]); amax = Math.max(amax, a); x += kw + gap;
    });
  });
  return {alpha: amax, rects};
};
const label = (it) => it.n === 'Cap' ? `Cap"${String(it.p.text).replace(/\n/g, '/').slice(0, 40)}"` : it.n === 'CountUp' ? `CountUp(${it.p.to})` : `Words"${it.p.toks.map((k) => k.w).join(' ').slice(0, 40)}"`;
const inter = (a, b) => { const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]), h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]); if (w <= 0 || h <= 0) return 0; return (w * h) / Math.min((a[2] - a[0]) * (a[3] - a[1]), (b[2] - b[0]) * (b[3] - b[1])); };
const events = new Map();
for (let tau = 0; tau < tlm.TOTAL; tau += 1 / 30) {
  const bs = items.map((it) => boxes(it, tau));
  for (let i = 0; i < items.length; i++) { if (!bs[i].rects.length) continue;
    for (let j = i + 1; j < items.length; j++) { if (!bs[j].rects.length) continue;
      let m = 0; for (const a of bs[i].rects) for (const b of bs[j].rects) m = Math.max(m, inter(a, b));
      if (m > 0.2) { const key = i + '|' + j, e = events.get(key) || {i, j, t0: tau, t1: tau, m: 0}; e.t1 = tau; e.m = Math.max(e.m, m); events.set(key, e); } } }
}
const near = (t) => { let k = 0; for (let i = 0; i < tlm.ST.length; i++) if (tlm.ST[i] <= t + 1e-6) k = i; return tlm.WT.slice(Math.max(0, k - 1), k + 3).join(' '); };
console.log(`text items: ${items.length}; overlapping pairs: ${events.size}`);
for (const e of [...events.values()].sort((a, b) => a.t0 - b.t0)) console.log(`OVERLAP ${e.t0.toFixed(2)}-${e.t1.toFixed(2)}s (${((e.t1 - e.t0) * 30 + 1) | 0} fr, ${(e.m * 100) | 0}%)  ${label(items[e.i])}  x  ${label(items[e.j])}   ~ "${near(e.t0)}"`);
if (process.argv.includes('--list')) for (const it of items.sort((a, b) => (a.p.toks?.[0].at ?? a.p.t0) - (b.p.toks?.[0].at ?? b.p.t0))) {
  const s = it.p.toks?.[0].at ?? it.p.t0; console.log(`${s.toFixed(2).padStart(7)}-${(it.p.t1).toFixed(2).padStart(7)}  ${label(it).padEnd(60)} | at: ${near(s)}`);
}
