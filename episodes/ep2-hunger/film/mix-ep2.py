"""Build the EP2 audio: voice stem + SFX stem (+ optional music stem) -> normalised master.

python mix-ep2.py [--music] [--ffmpeg ffmpeg]
Writes film/out/ep2/{stem-voice,stem-sfx,stem-music,audio,master}.wav, sfx-ep2.json, mix-report.json and
film/public/audio/master-ep2.wav (or master-ep2-music.wav with --music). Voice is never time-stretched; it starts at AT.
"""
import argparse, json, math, re, subprocess, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent
SR = 48000
AT = 1.0
M = json.load(open(ROOT / '../voice/marks.json'))
SECT = {s['name']: s['start'] + AT for s in json.load(open(ROOT / '../voice/sections.json'))['sections']}
nz = lambda s: re.sub(r"[^a-z0-9'\-]", '', s.lower().replace('’', "'"))
WT = [nz(m['text']) for m in M]; ST = [AT + m['start'] for m in M]; EN = [AT + m['end'] for m in M]
TOTAL = float(re.search(r'TOTAL=([\d.]+)', (ROOT / 'src/tl.ts').read_text()).group(1))

def T(p, n=1, k=0):
    q = [nz(x) for x in p.split()]; c = 0
    for i in range(len(WT) - len(q) + 1):
        if WT[i:i + len(q)] == q:
            c += 1
            if c == n: return ST[i + k]
    raise SystemExit('phrase not found: ' + p)

E = []
def add(t, a, d): E.append((round(t, 4), a, d))
def clicks(t0, n=8, gap=0.07):
    for i in range(n): add(t0 + i * gap, 'dash-click-A' if i % 2 == 0 else 'dash-click-B', 0.11)

# --- hook
add(0.33, 'slow', 0.3)
add(T('and by evening') - 0.15, 'sw', 0.17)
add(T("that's not weakness") - 0.12, 'sw', 0.12)
add(T('turns up') - 0.1, 'swf', 0.24)
for i, tt in enumerate([T('has dials'), T('has dials') + 0.28, T('four of them') - 0.05, T('four of them') + 0.35]):
    add(tt, 'dash-click-A' if i % 2 == 0 else 'dash-click-B', 0.11)
add(T('four of them') + 0.4, 'boom', 0.2)
add(T('and at the end') - 0.1, 'sw', 0.17)
# --- why it is loud
add(T('in one famous study') - 0.1, 'sw', 0.12)
add(T('lost about thirty pounds'), 'tech', 0.2); add(T('a year later'), 'tech', 0.2)
clicks(T('you can only turn it down') + 0.05)
# --- dial 1
add(T('dial number one') - 0.15, 'sw', 0.17)
add(T('four hundred and forty') - 0.1, 'tech', 0.2)
add(T('eggs') - 0.12, 'sw', 0.12)
# --- dial 2
clicks(SECT['d2'] + 0.85); add(T('dial number two') - 0.15, 'sw', 0.17)
add(T('a whole apple') - 0.15, 'sw', 0.12)
add(T('fifteen percent less') - 0.1, 'tech', 0.2)
add(T('a big bowl of vegetables') - 0.15, 'sw', 0.12)
# --- dial 3
clicks(SECT['d3'] + 1.05); add(T('dial number three') - 0.15, 'sw', 0.17)
add(T('in one hospital study') - 0.1, 'sw', 0.12)
add(T('mostly ultra-processed') - 0.2, 'swf', 0.24)
add(T('five hundred more calories') - 0.1, 'tech', 0.2)
add(T('so build most of your meals') - 0.1, 'sw', 0.12)
add(T('in a classic test') - 0.1, 'sw', 0.12)
# --- dial 4
clicks(SECT['d4'] + 0.85); add(T('dial number four') - 0.15, 'sw', 0.17)
add(T('in one study twelve young men') - 0.1, 'sw', 0.17)
add(T('almost a quarter higher') - 0.1, 'tech', 0.2)
add(T('in another trial') - 0.1, 'sw', 0.12)
add(T('two hundred and seventy') - 0.1, 'tech', 0.2)
add(T("now here's what almost nobody") - 0.1, 'sw', 0.12)
add(T('eight in the evening'), 'tech', 0.2)
add(T('make dinner your biggest protein meal') - 0.1, 'sw', 0.12)
add(T('then close the kitchen') - 0.15, 'sw', 0.17)
# --- water and plan
clicks(SECT['water'] + 0.95); add(T('one last trick'), 'sw', 0.17)
add(T('a big glass of water') - 0.1, 'sw', 0.12)
add(T('three pounds more') - 0.3, 'tech', 0.2)
add(T("so here's your day") + 0.35, 'sw', 0.12)
add(T('screenshot it'), 'shutter', 0.2)
# --- close
add(T('a little hunger is normal') - 0.1, 'sw', 0.12)
add(T('tonight do just one thing') - 0.35, 'slow', 0.3)
clicks(T("that's dial number one") + 0.25); add(T("that's dial number one") + 0.3, 'boom', 0.2)
E.sort()

PEAK_DB = {'slow': -30, 'sw': -24, 'swf': -20, 'tech': -24.5, 'shutter': -21, 'boom': -21, 'dash-click-A': -27, 'dash-click-B': -27}

def read_wav(f, want_sr=SR):
    with wave.open(str(f), 'rb') as w:
        ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        d = np.frombuffer(w.readframes(n), '<i2').reshape(-1, ch).astype(np.float32) / 32768
    if ch == 1: d = np.repeat(d, 2, axis=1)
    if sr != want_sr:  # resample via ffmpeg for the few 44.1 kHz assets
        raise ValueError(f'{f}: {sr} Hz')
    return d

def load_sfx(name, ffmpeg):
    f = ROOT / 'public/audio/sfx' / (name + '.wav')
    with wave.open(str(f), 'rb') as w: sr = w.getframerate()
    if sr == SR: return read_wav(f)
    tmp = ROOT / 'out/ep2' / ('rs-' + name + '.wav')
    subprocess.run([ffmpeg, '-y', '-v', 'error', '-i', str(f), '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s16le', str(tmp)], check=True)
    return read_wav(tmp)

def save_wav(f, x):
    if np.max(np.abs(x)) >= 1: raise ValueError('clipped')
    with wave.open(str(f), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--music', action='store_true'); ap.add_argument('--ffmpeg', default='ffmpeg')
    ap.add_argument('--music-under-voice-db', type=float, default=10.0); ap.add_argument('--tp', type=float, default=-1.5); a = ap.parse_args()
    out = ROOT / 'out/ep2'; out.mkdir(parents=True, exist_ok=True)
    n = round(TOTAL * SR)
    with wave.open(str(ROOT / '../voice/voice.wav'), 'rb') as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        v = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    voice = np.zeros((n, 2), np.float32); s0 = round(AT * SR); voice[s0:s0 + len(v)] = v[:n - s0, None]
    sfx = np.zeros((n, 2), np.float32); cache = {}
    for t, name, d in E:
        if name not in cache: cache[name] = load_sfx(name, a.ffmpeg)
        src = cache[name][:round(d * SR)].copy()
        fade = min(round(0.05 * SR), len(src) // 2)
        if fade: src[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)[:, None]
        pk = np.abs(cache[name][:round(max(d, 0.05) * SR)]).max() + 1e-9
        src *= 10 ** (PEAK_DB[name] / 20) / pk
        i = round(t * SR); sfx[i:i + len(src)] += src[:max(0, n - i)]
    save_wav(out / 'stem-voice.wav', voice); save_wav(out / 'stem-sfx.wav', sfx)
    mix = voice + sfx; label = 'master-ep2'
    if a.music:
        with wave.open(str(ROOT / 'assets/music-original.wav'), 'rb') as w: assert w.getframerate() == SR
        src = read_wav(ROOT / 'assets/music-original.wav') * (32767 / 32768)
        act = lambda x: float(np.sqrt(np.mean(x[np.abs(x).max(axis=1) > np.abs(x).max() * 0.05] ** 2))) + 1e-9
        gain = act(voice) / act(src) * 10 ** (-a.music_under_voice_db / 20)
        music = np.zeros_like(voice); L = min(len(src), n); music[:L] = src[:L] * gain
        i_, o_ = min(round(SR * 1.2), L), min(round(SR * 3), L)
        music[:i_] *= np.linspace(0, 1, i_, dtype=np.float32)[:, None]; music[L - o_:L] *= np.linspace(1, 0, o_, dtype=np.float32)[:, None]
        save_wav(out / 'stem-music.wav', music); mix = mix + music; label = 'master-ep2-music'
    save_wav(out / 'audio.wav', mix)
    p1 = subprocess.run([a.ffmpeg, '-hide_banner', '-nostats', '-i', str(out / 'audio.wav'), '-af', f'loudnorm=I=-14:TP={a.tp}:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    m = json.loads(p1.stderr[p1.stderr.rfind('{'):])
    af = f"loudnorm=I=-14:TP={a.tp}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json"
    p2 = subprocess.run([a.ffmpeg, '-hide_banner', '-nostats', '-y', '-i', str(out / 'audio.wav'), '-af', af, '-ar', str(SR), '-c:a', 'pcm_s16le', str(out / (label + '.wav'))], capture_output=True, text=True)
    m2 = json.loads(p2.stderr[p2.stderr.rfind('{'):])
    (ROOT / 'public/audio').mkdir(exist_ok=True)
    subprocess.run(['cp', str(out / (label + '.wav')), str(ROOT / 'public/audio' / (label + '.wav'))], check=True)
    json.dump([[t, n_, d] for t, n_, d in E], open(out / 'sfx-ep2.json', 'w'))
    rep = dict(label=label, duration_seconds=TOTAL, sample_rate=SR, sfx_events=len(E), music=a.music, pass1=m, pass2=m2,
               limits='Technical mix and loudness measurement only; no claim of listening or artistic approval.')
    json.dump(rep, open(out / ('mix-report-' + label + '.json'), 'w'), indent=2); print(json.dumps(rep))

if __name__ == '__main__': main()
