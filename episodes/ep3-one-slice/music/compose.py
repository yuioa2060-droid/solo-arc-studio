"""EP3 score: tonal only (piano, strings, rhodes, harp, celesta, numpy pad). No drums, no noise, no flutter.
Timed to the real word times (voice/marks.json). Run: python music/compose.py  ->  music/out/stem-music.wav (+ per-instrument stems)
"""
import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from engine import *

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
M = json.load(open(os.path.join(HERE, '../voice/marks.json'))); AT = 1.0
nz = lambda s: re.sub(r"[^a-z0-9'\-]", '', s.lower().replace('’', "'"))
WT = [nz(m['text']) for m in M]; ST = [AT + m['start'] for m in M]; EN = [AT + m['end'] for m in M]
TOTAL = float(re.search(r'TOTAL=([\d.]+)', open(os.path.join(HERE, '../film/src/tl.ts')).read()).group(1))
VEND = EN[-1]
def T(p, n=1, k=0):
    q = [nz(x) for x in p.split()]; c = 0
    for i in range(len(WT) - len(q) + 1):
        if WT[i:i + len(q)] == q:
            c += 1
            if c == n: return ST[i + k]
    raise SystemExit('phrase not found: ' + p)
A = dict(open=1.0, cake=T('and then someone'), stop=T('stop'), freeze=T("i'm freezing time"), sentence=T('you know the one'), inner=T("well i've already blown it"),
         today=T('today'), oneslice=T('what it is one slice', 1, 3), flash=T("let's go back to the 1980s"), arrows=T("the people who weren't dieting") - 0.05, rule=T('the classic explanation') - 0.04, wth=T('psychologists call it'),
         math=T("now here's the math"), wrecks=T('what breaks it is everything after'), match=T('the slice was the match'), fire=T('is the fire'),
         why=T('so why do we do it'), verdict=T('it treats it like a verdict', 1, 5), story=T("but that's a story"), rewrite=T('a story can be rewritten'),
         two=T('same slice'), first=T('in the first one'), second=T('in the second'), kinder=T('does a kinder sentence'), moves=T("so here's what to do"),
         tm2=T('two make the next meal'), three=T('three decide before it happens'), never=T('and one rule on top'), honest=T('one honest note'),
         move=T("so here's your move"), done=T('done good'), unfreeze=T("let's unfreeze this room"), slice2=T("somebody's still holding out a slice"), sure=T('sure'))
json.dump(A, open(os.path.join(OUT, 'anchors.json'), 'w'), indent=1)
L = TOTAL + 1.0   # render length (a little extra, trimmed at the end)

# ------------------------------------------------------------------ chords (MIDI)
Dm   = [38, 45, 50, 53, 57, 64]      # Dm(add9)
Bb   = [46, 53, 58, 62, 69]          # Bbmaj7
Gm   = [43, 50, 55, 58, 62, 69]      # Gm(add9)
A7s  = [33, 45, 52, 55, 57, 62]      # A7sus4
A7   = [45, 52, 55, 61, 64]          # A7 (C#)
F    = [41, 48, 53, 57, 60, 64]      # Fmaj7
Fadd = [41, 48, 53, 57, 60, 67]
C    = [48, 55, 60, 64, 67]
Am7  = [45, 52, 55, 60, 64]
Dm7  = [38, 45, 50, 53, 57, 60]
Bb11 = [46, 53, 58, 62, 69, 76]      # Bbmaj7#11 (the "oh" chord)
Csus = [48, 53, 55, 60, 65, 67]
Bbs2 = [46, 48, 53, 58, 60, 65]
Gm7  = [43, 50, 53, 58, 62]
Edim = [40, 46, 52, 55, 58]          # tension colour (E half-dim)

pn = Track('piano', 'piano', 0.9); ce = Track('cello', 'cello', 0.8); st = Track('strings', 'strings', 0.75)
rh = Track('rhodes', 'rhodes', 0.75); hp = Track('harp', 'harp', 0.8); cl = Track('celesta', 'celesta', 0.6)
st.cc(0, 11, 0); ce.cc(0, 11, 105)

def roll(tr, t, chord, dur, step=0.5, vel=50, jit=0.05, lift=0):
    for k, p in enumerate(chord):
        tr.n(t + k * step + (rng.random() - 0.5) * jit * 2, max(0.6, dur - k * step), p + (lift if k >= 3 else 0), int(vel + (rng.random() - 0.5) * 8))
def hold(tr, t, dur, chord, vel=48, a=1.5, peak=96, floor=24):
    """sustained chord on strings with an expression swell (CC11)"""
    for p in chord: tr.n(t, dur, p, vel)
    tr.ramp(t - 0.2, t + a, 11, floor, peak); tr.ramp(t + dur - 2.2, t + dur, 11, peak, floor)
def pn_loop(t0, t1, chords, bar=8.0, vel=50, step=0.55, lift=0, pedal=True):
    t = t0; i = 0
    while t < t1 - 1.0:
        ch = chords[i % len(chords)]; roll(pn, t, ch, min(bar + 1.2, t1 - t), step, vel, 0.07, lift)
        if pedal: pn.ped(t - 0.05, min(t + bar - 0.15, t1)); 
        t += bar; i += 1
def motif(tr, t, key='d', vel=56, slow=1.0):
    n = ([(0, 57, 3.2), (1.1, 62, 3.0), (2.2, 65, 2.8), (3.4, 69, 3.8), (5.0, 67, 2.2), (6.0, 65, 2.2), (7.0, 62, 6.0)] if key == 'd' else
         [(0, 60, 3.2), (1.1, 65, 3.0), (2.2, 69, 2.8), (3.4, 72, 3.8), (5.0, 70, 2.2), (6.0, 69, 2.2), (7.0, 65, 6.0)])   # D minor / F major (same scale, brighter centre)
    for dt, p, d in n: tr.n(t + dt * slow, d * slow, p, int(vel + (rng.random() - 0.5) * 6))

# ================================================================== A. cold open (0 - Stop)
pn.n(A['open'] + 0.1, 5.0, 57, 40).n(A['open'] + 1.8, 5.0, 62, 38).n(A['open'] + 3.4, 5.0, 65, 36)
pn.ped(0.9, 6.5)
roll(pn, 6.6, Dm, 8.0, 0.62, 46, 0.06, 12); pn.ped(6.5, 14.2)
roll(pn, 11.2, Bb, 4.2, 0.45, 50, 0.05, 12)
st.cc(0, 11, 0); hold(st, A['cake'] - 0.4, A['stop'] - A['cake'] + 0.3, Bb[1:], 44, a=1.8, peak=82, floor=10)
ce.n(A['cake'] - 0.2, A['stop'] - A['cake'] + 0.2, 38, 50)

# ================================================================== B. frozen (Stop -> You know the one)
t = A['stop'] + 2.6
for dt, p in [(0, 69), (4.8, 65), (9.2, 62), (13.4, 69)]:
    pn.n(t + dt, 6.0, p, 36)
pn.ped(t - 0.1, A['sentence'])
cl.n(A['freeze'] + 0.5, 6, 93, 28).n(A['freeze'] + 7.2, 6, 86, 24)

# ================================================================== C. the sentence (inner voice) - darker
hold(st, A['sentence'] - 0.3, 3.2, Gm[1:], 40, a=1.4, peak=78, floor=16)
ce.n(A['inner'] - 0.1, 2.6, 38, 58).n(A['inner'] + 1.95, 2.6, 36, 58).n(A['inner'] + 3.75, 3.8, 40, 60)       # low tones of dread, no pulse grid
hold(st, A['inner'] + 1.9, 3.4, Dm[1:], 40, a=1.2, peak=84, floor=18)
roll(pn, A['inner'] + 0.1, [38, 50, 57], 4.0, 0.7, 50, 0.05); pn.ped(A['inner'], A['today'] - 0.3)

# ================================================================== D. promise: the motif (D minor), then ONE SLICE
motif(pn, A['today'] + 0.2, 'd', 54); pn.ped(A['today'], A['today'] + 9.5)
hold(st, A['today'] + 0.6, 9.0, Dm[1:], 42, a=2.5, peak=76, floor=20)
motif(pn, A['oneslice'] - 0.4, 'd', 60, 0.8); pn.ped(A['oneslice'] - 0.5, A['flash'] - 0.1)
hold(st, A['oneslice'] - 0.4, A['flash'] - A['oneslice'] + 0.3, Bb[1:], 46, a=1.2, peak=90, floor=16)

# ================================================================== E. flashback (rhodes / vibes-like, F major, warm retro)
FB = [F, Am7, Dm7, Bb, F, Am7]
t = A['flash'] + 0.2; i = 0
while t < A['rule'] - 0.5:
    ch = FB[i % len(FB)]; roll(rh, t, ch, 9.5, 0.7, 46, 0.1, 12); rh.ped(t, t + 9.2); t += 9.6; i += 1
pn.n(A['flash'] + 0.2, 6, 53 - 12, 44)
cl.n(A['flash'] + 3.0, 5, 84, 24).n(A['flash'] + 15.0, 5, 81, 22).n(A['flash'] + 27.0, 5, 88, 22)
# arrows: the dieters turn - darker (Gm / Dm)
roll(rh, A['arrows'], Gm7, 7.0, 0.7, 44, 0.1, 12); hold(st, A['arrows'] + 4.0, 8.0, Gm[1:], 36, a=3.0, peak=70, floor=14)
# the rule breaks: a low piano note and a half-diminished colour, then the "oh" chord on the effect's name
roll(pn, A['rule'] + 0.2, [38, 45, 53], 7.5, 0.9, 52); pn.ped(A['rule'], A['wth'])
hold(st, A['rule'] + 1.0, 5.4, Edim, 38, a=2.5, peak=72, floor=12)
hold(st, A['wth'] + 0.6, 4.4, Bb11[1:], 50, a=1.4, peak=100, floor=10)
roll(pn, A['wth'] + 0.7, Bb11, 5.0, 0.35, 56, 0.02, 0); pn.ped(A['wth'] + 0.6, A['math'] - 0.4)

# ================================================================== F. the math (clean, harp)
HM = [Dm7, Bb, Gm7, F]
t = A['math'] + 0.6; i = 0
while t < A['wrecks'] - 0.8:
    ch = HM[i % len(HM)]
    for k, p in enumerate(ch[1:] + [ch[-1] + 12]): hp.n(t + k * 0.55 + rng.random() * 0.12, 5.0, p + 12, int(58 + rng.random() * 10))
    t += 6.2; i += 1
hold(st, A['math'] + 2.0, 20.0, Dm7[1:], 34, a=6.0, peak=60, floor=14)
roll(pn, A['math'] + 17.1, F, 6.0, 0.5, 48, 0.05, 12); pn.ped(A['math'] + 17, A['wrecks'])        # "1/7" lifts, "It did not break"

# ================================================================== G. the spiral (tension, no pulse)
ce.n(A['wrecks'] - 0.2, A['fire'] - A['wrecks'] + 0.5, 38, 70)                           # D pedal (the sub drone carries D1)
for dt, p in [(0, 38), (4.6, 38), (8.9, 36), (12.5, 38)]: pn.n(A['wrecks'] + dt, 5.0, p, 66)
pn.ped(A['wrecks'], A['fire'])
st.ramp(A['wrecks'] - 0.2, A['fire'] + 0.5, 11, 14, 120)
for k, p in enumerate([57, 58, 59, 60, 61, 62, 63]):                               # slow chromatic climb, one voice at a time
    tt = A['wrecks'] + k * 2.6
    st.n(tt, 3.4, p + 12, 52 + k * 3); st.n(tt, 3.4, p, 46 + k * 3)
for p in [62, 63, 69, 74, 75]: st.n(A['match'] - 0.3, A['fire'] - A['match'] + 1.5, p, 78)    # cluster D-Eb-A-D-Eb as the match is struck, peak at "is the fire"

# ================================================================== H. why / verdict / rewrite
roll(pn, A['why'] + 1.2, Dm, 8.0, 0.7, 44, 0.07, 12); pn.ped(A['why'] + 1.0, A['story'] - 0.2)
ce.n(A['verdict'] - 0.05, 4.5, 38, 82); pn.n(A['verdict'] - 0.05, 4.0, 38, 80)         # the gavel: one low note, no more
roll(pn, A['story'], Gm, 6.0, 0.6, 44, 0.05, 12); pn.ped(A['story'] - 0.1, A['rewrite'])
hold(st, A['rewrite'] - 0.5, 5.0, Bb[1:], 46, a=1.8, peak=96, floor=14)
motif(pn, A['rewrite'] + 0.2, 'f', 56, 0.85); pn.ped(A['rewrite'], A['two'] + 3.0)    # relative major: the story can be rewritten
hold(st, A['two'] - 0.4, 8.0, F[1:], 46, a=2.0, peak=90, floor=22)

# ================================================================== I. two Wednesdays: A cold, B warm
hold(st, A['first'] - 0.3, A['second'] - A['first'] + 0.2, Gm[1:], 38, a=1.5, peak=76, floor=16)
ce.n(A['first'], A['second'] - A['first'], 31, 56)
roll(pn, A['first'] + 0.3, [38, 45, 50, 53], 8.0, 0.8, 42, 0.05); pn.ped(A['first'], A['second'])
pad_t = A['second'] - 0.3
for k, (ch, d) in enumerate([(F, 3.8), (C, 3.5), (Dm, 3.6)]):
    roll(pn, pad_t + k * 3.7, ch, d + 1.0, 0.4, 56, 0.04, 12)
pn.ped(A['second'] - 0.2, A['kinder'] - 0.1)
hold(st, A['second'] - 0.2, A['kinder'] - A['second'] + 0.3, Fadd[1:], 50, a=1.4, peak=98, floor=24)

# ================================================================== J. the donut study (light, curious)
for k, (dt, p) in enumerate([(0.3, 84), (2.6, 88), (5.1, 81), (8.0, 91), (11.0, 86)]): cl.n(A['kinder'] + dt, 3.0, p, 34)
roll(pn, A['kinder'] + 0.5, Fadd, 7.5, 0.55, 46, 0.06, 12); pn.ped(A['kinder'], A['moves'] - 0.3)
roll(pn, A['kinder'] + 8.2, C, 7.0, 0.5, 48, 0.06, 12)
hold(st, A['kinder'] + 5.0, 11.0, Am7[1:], 40, a=3.0, peak=84, floor=22)

# ================================================================== K. what to do (hopeful, forward - still not a beat)
PM = [F, C, Dm, Bb, F, C, Gm, A7s]
pn_loop(A['moves'] + 0.3, A['honest'] - 0.8, PM[:7], bar=7.6, vel=52, step=0.5, lift=12)
hold(st, A['moves'] + 0.5, A['honest'] - A['moves'] - 1.5, F[1:], 40, a=6.0, peak=84, floor=26)
for dt, p in ((0.1, 41), (12.6, 36), (25.4, 38), (38.0, 46)): ce.n(A['moves'] + dt, 12.0, p, 56)
# "don't slip twice": the lift
roll(pn, A['honest'] - 3.4, Bb, 3.4, 0.28, 62, 0.02, 12); roll(pn, A['honest'] - 1.8, F, 3.0, 0.28, 66, 0.02, 12)
hold(st, A['honest'] - 3.6, 4.3, Bb[1:], 56, a=1.4, peak=108, floor=20)

# ================================================================== L. honest note (nearly bare)
for dt, p in [(0.5, 69), (5.6, 65), (10.4, 72)]: pn.n(A['honest'] + dt, 6.0, p, 34)
pn.ped(A['honest'], A['move'] - 0.3)
hold(st, A['honest'] + 0.6, A['move'] - A['honest'] - 0.4, Bb[1:], 34, a=3.5, peak=62, floor=16)

# ================================================================== M. your move -> unfreeze -> resolution
hold(st, A['move'] - 0.2, A['unfreeze'] - A['move'] + 0.2, Csus[1:], 36, a=2.0, peak=70, floor=18)
cl.n(A['done'] + 0.1, 5.0, 96, 36)                                                       # the tick on "Done?"
UF = A['unfreeze'] + 0.12
hold(st, UF, 14.0, F[1:], 54, a=1.2, peak=112, floor=24); ce.n(UF, 12.0, 41, 66)
roll(pn, UF + 0.05, F, 8.0, 0.32, 62, 0.02, 12); pn.ped(UF, UF + 16)
motif(pn, UF + 1.8, 'f', 60, 0.95)
roll(pn, A['sure'] - 1.8, Fadd, 8.0, 0.4, 50, 0.04, 12)
pn.n(A['sure'] + 0.7, 8.0, 65, 54).n(A['sure'] + 0.7, 8.0, 53, 50).n(A['sure'] + 0.7, 8.0, 41, 48)    # final F: the room is warm again
pn.ped(A['sure'] - 1.8, TOTAL - 0.4)

# ================================================================== render
tracks = {'piano': (pn, lambda x: piano_fx(x, 0.30, 0.84), 1.00), 'cello': (ce, lambda x: strings_fx(x, 0.30), 0.70), 'strings': (st, lambda x: strings_fx(x, 0.38), 0.62),
          'rhodes': (rh, lambda x: piano_fx(x, 0.34, 0.82), 0.80), 'harp': (hp, lambda x: piano_fx(x, 0.32, 0.80), 0.80), 'celesta': (cl, lambda x: piano_fx(x, 0.40, 0.88), 0.55)}
stems = {}
for name, (tr, f, g) in tracks.items():
    x = f(render_track(tr, L)) * g; stems[name] = x; sf.write(os.path.join(OUT, f'stem-{name}.wav'), x, SR)
    print(name, len(tr.notes), 'notes  rms', round(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9), 1))
# numpy pad (warmth) - long, slow chords under the main sections
pad = np.zeros((int(L * SR), 2), np.float32)
def padc(t, d, ch, vel=0.10): pad_chord(pad, t, d, ch, vel=vel, a=3.0, r=4.0, bright=1100)
padc(A['cake'] - 0.5, A['stop'] - A['cake'] + 0.7, Bb[:4], 0.06)
padc(A['stop'] + 1.8, 12.0, [38, 45, 62, 69], 0.05)                       # frozen
padc(A['inner'], 12.0, Dm[:4], 0.07)
padc(A['flash'] + 3, 38.0, [41, 48, 60, 65], 0.045)                       # flashback bed
padc(A['math'], 20.0, [38, 45, 57, 65], 0.045)
padc(A['why'] + 1, 16.0, [43, 50, 58, 62], 0.05)
padc(A['rewrite'] - 0.5, 12.0, [41, 48, 57, 65], 0.07)
padc(A['kinder'], 16.0, [41, 48, 60, 69], 0.055)
padc(A['moves'] + 1, 52.0, [41, 48, 57, 65], 0.06)
padc(A['honest'], 15.0, [46, 53, 58, 65], 0.06)
padc(UF, 18.0, [41, 48, 57, 65, 72], 0.085)
pad = fx(pad, Pedalboard([HighpassFilter(60), Reverb(room_size=0.92, damping=0.45, wet_level=0.35, dry_level=0.7)])); stems['pad'] = pad; sf.write(os.path.join(OUT, 'stem-pad.wav'), pad, SR)
sub = np.zeros((int(L * SR), 2), np.float32)
sub_drone(sub, A['stop'] + 1.2, 14.0, 26, 0.10)                          # frozen drone D1
sub_drone(sub, A['wrecks'] - 0.5, A['fire'] - A['wrecks'] + 1.0, 26, 0.16, a=6.0, r=0.8)
sub_drone(sub, UF, 10.0, 29, 0.10, a=0.5, r=5.0)
stems['sub'] = sub; sf.write(os.path.join(OUT, 'stem-sub.wav'), sub, SR)

mix = sum(stems.values())
# moments: hard silence at STOP, after "is the fire", and a dip before the flashback chord resolves
def env(points, n):
    ts = np.array([p[0] for p in points]); gs = np.array([p[1] for p in points]); return np.interp(np.arange(n) / SR, ts, gs).astype(np.float32)
g = env([(0, 1), (A['stop'] - 0.06, 1), (A['stop'] + 0.01, 0), (A['stop'] + 1.5, 0), (A['stop'] + 3.4, 1),
         (A['fire'] + 0.72, 1), (A['fire'] + 0.78, 0), (A['why'] + 0.9, 0), (A['why'] + 1.4, 1),
         (VEND + 0.5, 1), (TOTAL - 0.2, 0), (L, 0)], len(mix))
mix = mix * g[:, None]
peak = float(np.abs(mix).max()); print('music bus peak', round(peak, 3), 'rms dB', round(20 * np.log10(np.sqrt(np.mean(mix ** 2))), 1))
mix = mix[:int(TOTAL * SR)] / max(1.0, peak / 0.9)
sf.write(os.path.join(OUT, 'stem-music.wav'), mix, SR); print('music written', mix.shape)
