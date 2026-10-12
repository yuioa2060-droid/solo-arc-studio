"""EP3 mix: voice (+ gentle comp) + SFX [+ music (EQ, ducked by the voice)] -> loudness-normalised masters.
python music/mix.py [--music-db -16]
  film/public/audio/master-ep3.wav        primary: voice + SFX, no music (music only on request)
  film/public/audio/master-ep3-music.wav  alternative with the score
  film/out/ep3/{stem-*.flac,mix-report.json}"""
import json, os, re, subprocess, sys, wave
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
from engine import SR, Pedalboard, Compressor, HighpassFilter, LowShelfFilter, HighShelfFilter, PeakFilter, Limiter, fx
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'out'); FILM = os.path.join(HERE, '../film')

def limiter(x, thr_db, look_ms=5.0, rel_ms=160.0):
    """linked-stereo look-ahead peak limiter at 1 ms resolution (numpy only)"""
    from scipy.ndimage import minimum_filter1d
    hop = SR // 1000; thr = 10 ** (thr_db / 20); nfr = len(x) // hop
    pk = np.abs(x[:nfr * hop]).max(axis=1).reshape(nfr, hop).max(axis=1)
    g = np.minimum(1.0, thr / np.maximum(pk, 1e-9)); g = minimum_filter1d(g, size=int(look_ms) * 2 + 1, mode='nearest')
    out = np.empty_like(g); cur = 1.0; rel = float(np.exp(-1.0 / rel_ms))
    for i in range(nfr):
        cur = g[i] if g[i] < cur else cur + (min(1.0, g[i]) - cur) * (1 - rel)
        out[i] = min(cur, g[i]) if g[i] < 1 else cur
    gain = np.interp(np.arange(len(x)) / hop - 0.5, np.arange(nfr), out).astype(np.float32)
    return x * gain[:, None], float(20 * np.log10(max(1e-6, float(out.min()))))
args = sys.argv[1:]; opt = lambda k, d: float(args[args.index(k) + 1]) if k in args else d
MUSIC_DB = opt('--music-db', -16.0); DUCK = opt('--duck', 0.42)
TOTAL = float(re.search(r'TOTAL=([\d.]+)', open(os.path.join(FILM, 'src/tl.ts')).read()).group(1)); n = int(round(TOTAL * SR)); AT = 1.0
v, sr = sf.read(os.path.join(HERE, '../voice/voice.wav'), dtype='float32'); assert sr == SR and v.ndim == 1
voice = np.zeros((n, 2), np.float32); i0 = int(AT * SR); voice[i0:i0 + len(v)] = v[:n - i0, None]
voice = fx(voice, Pedalboard([HighpassFilter(70), PeakFilter(250, -1.5, 0.9), Compressor(-26, 2.2, 18, 220)]))
voice, gr_v = limiter(voice, -12.5)
sfx, _ = sf.read(os.path.join(OUT, 'stem-sfx.wav'), dtype='float32'); sfx = sfx[:n]
mus, _ = sf.read(os.path.join(OUT, 'stem-music.wav'), dtype='float32'); mus = mus[:n]
mus = fx(mus, Pedalboard([HighpassFilter(70), PeakFilter(280, -2.5, 0.8), PeakFilter(1800, -1.5, 0.9), HighShelfFilter(4500, 1.5, 0.7)]))
# voice envelope (30 ms RMS) -> smoothed gain for the music
hop = int(0.01 * SR); fr = n // hop
e = np.sqrt(np.convolve((voice.mean(1) ** 2), np.ones(int(0.03 * SR)) / int(0.03 * SR), 'same'))[::hop][:fr]; edb = 20 * np.log10(e + 1e-6)
open_ = np.clip((edb + 46) / 12, 0, 1); g = np.ones(fr, np.float32); cur = 1.0
for k in range(fr):
    tgt = 1 - DUCK * open_[k]; coef = 0.55 if tgt < cur else 0.045        # fast attack, slow release (10 ms frames)
    cur += (tgt - cur) * coef; g[k] = cur
gain = np.interp(np.arange(n) / SR, np.arange(fr) * 0.01, g).astype(np.float32); mus_d = mus * gain[:, None]
# set the music level relative to the voice where both are present
vm = voice.mean(1); active = np.abs(vm) > 0.02
rv = float(np.sqrt(np.mean(vm[active] ** 2))); rm = float(np.sqrt(np.mean(mus_d.mean(1)[active] ** 2))) + 1e-9
k = rv / rm * 10 ** (MUSIC_DB / 20); mus_d *= k; mus_raw = mus * k

def finish(mix, name, thr=-11.8):
    """peak-limit, then two-pass linear loudnorm (-14 LUFS, TP -1.5) -> out/{name}.wav"""
    mix, gr = limiter(mix, thr); peak = float(np.abs(mix).max()); mix = mix / max(1.0, peak / 0.95)
    pre = os.path.join(OUT, f'pre-{name}.wav'); sf.write(pre, mix, SR)
    p1 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', pre, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    m1 = json.loads(p1.stderr[p1.stderr.rfind('{'):])
    af = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m1['input_i']}:measured_TP={m1['input_tp']}:measured_LRA={m1['input_lra']}:measured_thresh={m1['input_thresh']}:offset={m1['target_offset']}:linear=true:print_format=json"
    dst = os.path.join(OUT, f'{name}.wav')
    p2 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-y', '-i', pre, '-af', af, '-ar', str(SR), '-c:a', 'pcm_s16le', dst], capture_output=True, text=True)
    m2 = json.loads(p2.stderr[p2.stderr.rfind('{'):]); os.remove(pre)
    return dst, dict(pass1=m1, pass2=m2, limiter_max_reduction_db=round(gr, 1), pre_limit_peak=round(peak, 3))

os.makedirs(os.path.join(FILM, 'out/ep3'), exist_ok=True); os.makedirs(os.path.join(FILM, 'public/audio'), exist_ok=True)
mix_m = voice + sfx + mus_d
pk = float(np.abs(limiter(mix_m, -11.8)[0]).max()); sc = 1.0 / max(1.0, pk / 0.95)
for name, x in (('voice', voice), ('sfx', sfx), ('music', mus_d)): sf.write(os.path.join(FILM, f'out/ep3/stem-{name}.flac'), x * sc, SR, format='FLAC')
rep = dict(duration_seconds=TOTAL, sample_rate=SR, music_under_voice_db_target=MUSIC_DB, duck_depth=DUCK, voice_active_rms_dbfs=round(20 * np.log10(rv), 1), voice_limiter_max_reduction_db=round(gr_v, 1), variants={})
for name, x, pub, thr in (('master-nomusic', voice + sfx, 'master-ep3.wav', -12.4), ('master-music', mix_m, 'master-ep3-music.wav', -12.4)):   # lower ceiling keeps loudnorm linear without the music's extra RMS
    dst, r = finish(x, name, thr); subprocess.run(['cp', dst, os.path.join(FILM, 'public/audio', pub)], check=True); r['public_file'] = 'film/public/audio/' + pub; rep['variants'][name] = r
    print(name, 'in', r['pass1']['input_i'], 'tp', r['pass1']['input_tp'], '-> out', r['pass2']['output_i'], r['pass2']['output_tp'], r['pass2']['normalization_type'])
rep['limits'] = 'Technical mix and loudness measurement only. No listening was done; no claim of artistic approval.'
json.dump(rep, open(os.path.join(FILM, 'out/ep3/mix-report.json'), 'w'), indent=2); print('voice active rms dBFS', rep['voice_active_rms_dbfs'], 'duration', TOTAL)
