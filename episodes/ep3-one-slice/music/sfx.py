"""EP3 sound design: a handful of physical, quiet sounds (no UI blips, no whooshes, no noise risers).
python music/sfx.py -> music/out/stem-sfx.wav + sfx-events.json"""
import json, os, re, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
sys.path.insert(0, os.path.dirname(__file__))
from engine import SR, hz, fx, Pedalboard, Reverb, HighpassFilter, LowpassFilter

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'out')
A = json.load(open(os.path.join(OUT, 'anchors.json')))
M = json.load(open(os.path.join(HERE, '../voice/marks.json'))); AT = 1.0
nz = lambda s: re.sub(r"[^a-z0-9'\-]", '', s.lower().replace('’', "'"))
WT = [nz(m['text']) for m in M]; ST = [AT + m['start'] for m in M]
def T(p, n=1, k=0):
    q = [nz(x) for x in p.split()]; c = 0
    for i in range(len(WT) - len(q) + 1):
        if WT[i:i + len(q)] == q:
            c += 1
            if c == n: return ST[i + k]
    raise SystemExit('phrase not found: ' + p)
TOTAL = float(re.search(r'TOTAL=([\d.]+)', open(os.path.join(HERE, '../film/src/tl.ts')).read()).group(1))
rng = np.random.default_rng(11)
t_ = lambda d: np.arange(int(d * SR)) / SR
db = lambda x: 10 ** (x / 20)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def norm(x, peak_db): return x / (np.abs(x).max() + 1e-9) * db(peak_db)
def st2(x, w=0.0): return np.stack([x * (1 - w), x * (1 + w)], 1).astype(np.float32)

def tick(): t = t_(0.12); x = np.exp(-t * 260) * np.sin(2 * np.pi * 2200 * t) * 0.6 + np.exp(-t * 110) * np.sin(2 * np.pi * 780 * t) * 0.8 + np.exp(-t * 400) * hp(rng.standard_normal(len(t)), 3000) * 0.08; return norm(x, -31)
def thud(f0=78, f1=46, d=0.5, lvl=-22, knock=0.15):
    t = t_(d); f = f1 + (f0 - f1) * np.exp(-t * 14); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 7.5) + knock * np.sin(2 * np.pi * 170 * t) * np.exp(-t * 40); x[:int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR)); return norm(x, lvl)
def glass(freqs, d=5.5, a=0.18, lvl=-30, rev=False):
    t = t_(d); x = sum(np.sin(2 * np.pi * f * t + i) * amp for i, (f, amp) in enumerate(freqs)) * np.exp(-t * 0.85)
    x *= np.minimum(1, t / a) ** 1.6; x = norm(x, lvl)
    return x[::-1].copy() if rev else x
def crack(lvl=-23):
    t = t_(0.3); x = hp(rng.standard_normal(len(t)), 1400) * np.exp(-t * 150) * 0.7 + np.sin(2 * np.pi * 150 * t) * np.exp(-t * 30) * 0.8 + np.sin(2 * np.pi * 420 * t) * np.exp(-t * 60) * 0.4; return norm(x, lvl)
def gavel(lvl=-18):
    t = t_(0.6); x = (np.sin(2 * np.pi * 530 * t) * np.exp(-t * 38) * 0.7 + np.sin(2 * np.pi * 1310 * t) * np.exp(-t * 55) * 0.35 + np.sin(2 * np.pi * 105 * t) * np.exp(-t * 16) * 0.9
                       + hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 300) * 0.35); return norm(x, lvl)
def strike(lvl=-29):
    t = t_(0.28); x = bp(rng.standard_normal(len(t)), 1800, 7000) * np.exp(-t * 16) * (1 - np.exp(-t * 90)); return norm(x, lvl)
def subglide(d=1.3, f0=30, f1=58, lvl=-24):
    t = t_(d); f = f0 + (f1 - f0) * (t / d) ** 2; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 2; return norm(x, lvl)

ev = []   # (time, array(mono), stereo width, reverb wet)
def add(t, x, w=0.0): ev.append((t, x, w))
tt = [1.97, 2.43, 2.85]                                  # the clock hands move: three dry ticks, uneven on purpose
for x in tt: add(x, tick(), 0.1)
D6 = [(1174.7, 1.0), (1760.0, 0.5), (2349.3, 0.32), (3520.0, 0.14)]
add(A['stop'] - 0.9, glass(D6, 0.9, 0.5, -34, rev=True), 0.2)                                    # a short inhale into the cut
add(A['stop'], thud(70, 34, 1.6, -19, 0.0), 0.0); add(A['stop'] + 0.02, glass(D6, 6.0, 0.2, -33), 0.25)              # time stops: sub drop + glass ring
add(T('once the rule was broken', 1, 4) + 0.45, crack(), 0.1)
add(T('a generous slice') + 0.1, thud(80, 52, 0.45, -23), 0.0)                                                      # the slice lands on the week
add(T('say that evening costs two thousand') + 0.9, thud(60, 36, 1.0, -20, 0.25), 0.0)                              # the evening: heavier
add(A['match'] - 0.02, strike(), 0.15)
add(A['verdict'], gavel(), 0.0)
F6 = [(698.5, 1.0), (880.0, 0.6), (1046.5, 0.45), (1396.9, 0.25), (1760.0, 0.12)]
UF = A['unfreeze'] + 0.12
add(UF - 1.5, glass(F6, 1.5, 0.9, -29, rev=True), 0.25)                                               # reverse bloom into the release
add(UF - 1.3, subglide(1.3, 30, 58, -26), 0.0); add(UF, thud(58, 41, 1.4, -23, 0.0), 0.0)                           # release
sfx = np.zeros((int(TOTAL * SR), 2), np.float32)
for t0, x, w in ev:
    i = int(t0 * SR); y = st2(x, w); j = min(len(sfx), i + len(y)); sfx[i:j] += y[:j - i]
sfx = fx(sfx, Pedalboard([HighpassFilter(30), Reverb(room_size=0.45, damping=0.55, wet_level=0.14, dry_level=0.9, width=1.0)]))
sf.write(os.path.join(OUT, 'stem-sfx.wav'), sfx, SR)
json.dump([[round(t0, 3), len(x) / SR] for t0, x, w in ev], open(os.path.join(OUT, 'sfx-events.json'), 'w'))
print(len(ev), 'events; peak', round(float(np.abs(sfx).max()), 3), 'rms dB', round(20 * np.log10(np.sqrt(np.mean(sfx ** 2)) + 1e-9), 1))
