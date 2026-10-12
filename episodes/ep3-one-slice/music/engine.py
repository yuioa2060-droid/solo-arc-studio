"""Small music engine for EP3: MIDI -> FluidSynth (FluidR3_GM) stems, numpy pads and SFX, pedalboard FX.
No drums, no noise risers, no LFO flutter: only tonal material. Everything is deterministic (fixed seeds).
Install on a fresh box:  apt-get install -y fluidsynth fluid-soundfont-gm   and   pip install mido pedalboard soundfile numpy scipy
"""
import os, subprocess, tempfile, math
import numpy as np
import mido, soundfile as sf
from pedalboard import Pedalboard, Reverb, Compressor, HighpassFilter, LowpassFilter, LowShelfFilter, HighShelfFilter, Gain, Limiter, Chorus, PeakFilter

SR = 48000
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
PROG = dict(piano=0, rhodes=4, celesta=8, glock=9, vibes=11, harp=46, cello=42, strings=48, strings2=49, warm=89, choir=91, bowed=92, halo=94, bass=32)
rng = np.random.default_rng(7)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

class Track:
    def __init__(self, name, prog, gain=0.8):
        self.name, self.prog, self.gain = name, PROG[prog] if isinstance(prog, str) else prog, gain
        self.notes, self.pedal, self.ccs = [], [], []
    def n(self, t, dur, pitch, vel=64):
        self.notes.append((float(t), float(dur), int(pitch), int(vel))); return self
    def chord(self, t, dur, pitches, vel=60, spread=0.0, jitter=0.0):
        for k, p in enumerate(pitches): self.n(t + k * spread + (rng.random() - 0.5) * jitter, dur - k * spread, p, int(vel + (rng.random() - 0.5) * 8))
        return self
    def ped(self, t0, t1): self.pedal.append((float(t0), float(t1))); return self
    def cc(self, t, ctl, val): self.ccs.append((float(t), int(ctl), int(max(0, min(127, val))))); return self
    def ramp(self, t0, t1, ctl, v0, v1, step=0.25):
        n = max(1, int((t1 - t0) / step))
        for i in range(n + 1): self.cc(t0 + (t1 - t0) * i / n, ctl, v0 + (v1 - v0) * i / n)
        return self

def render_track(tr, length, tmp=None):
    """Render one track through FluidSynth, returns float32 (n,2) at 48 kHz, exactly `length` seconds."""
    tmp = tmp or tempfile.mkdtemp(prefix='mus-')
    mid = mido.MidiFile(ticks_per_beat=480); trk = mido.MidiTrack(); mid.tracks.append(trk)
    trk.append(mido.MetaMessage('set_tempo', tempo=1000000))      # 60 bpm: 480 ticks == 1 second
    trk.append(mido.Message('program_change', program=tr.prog, channel=0, time=0))
    ev = []
    for t, d, p, v in tr.notes:
        ev.append((int(round(t * 480)), 1, 'note_on', p, max(1, min(127, v)))); ev.append((int(round((t + d) * 480)), 0, 'note_off', p, 0))
    for a, b in tr.pedal:
        ev.append((int(round(a * 480)), 2, 'cc', 64, 127)); ev.append((int(round(b * 480)), 0, 'cc', 64, 0))
    for tc, ctl, val in tr.ccs: ev.append((int(round(tc * 480)), 2, 'cc', ctl, val))
    ev.append((int(round((length + 2) * 480)), 3, 'cc', 7, 100))      # keeps the render running to the end
    ev.sort(key=lambda e: (e[0], e[1])); last = 0
    for tk, _, typ, a, b in ev:
        if typ == 'cc': trk.append(mido.Message('control_change', control=a, value=b, channel=0, time=tk - last))
        else: trk.append(mido.Message(typ, note=a, velocity=b, channel=0, time=tk - last))
        last = tk
    mp = os.path.join(tmp, tr.name + '.mid'); wp = os.path.join(tmp, tr.name + '.wav'); mid.save(mp)
    subprocess.run(['fluidsynth', '-ni', '-r', str(SR), '-R', '0', '-C', '0', '-g', str(tr.gain), '-F', wp, SF2, mp], check=True, capture_output=True)
    x, sr = sf.read(wp, dtype='float32'); assert sr == SR
    n = int(length * SR); out = np.zeros((n, 2), np.float32); out[:min(n, len(x))] = x[:n]
    return out

def fx(x, board): return board(x.T.astype(np.float32), SR).T

def piano_fx(x, wet=0.30, room=0.82):
    return fx(x, Pedalboard([HighpassFilter(55), LowShelfFilter(180, 0.0, 0.7), PeakFilter(3200, -2.0, 0.8), LowpassFilter(9500), Reverb(room_size=room, damping=0.5, wet_level=wet, dry_level=0.85, width=1.0)]))
def strings_fx(x, wet=0.35):
    return fx(x, Pedalboard([HighpassFilter(70), LowpassFilter(5200), Compressor(-24, 2.0, 30, 300), Reverb(room_size=0.9, damping=0.45, wet_level=wet, dry_level=0.75, width=1.0)]))

# ---------- numpy synths
def env_adsr(n, a, d, s, r, sr=SR):
    e = np.ones(n, np.float32); ia, idc, ir = int(a * sr), int(d * sr), int(r * sr)
    ia = min(ia, n); e[:ia] = np.linspace(0, 1, ia, dtype=np.float32) ** 1.5
    if ia < n:
        idd = min(idc, n - ia); e[ia:ia + idd] = np.linspace(1, s, idd, dtype=np.float32); e[ia + idd:] = s
    if ir and ir < n: e[-ir:] *= np.linspace(1, 0, ir, dtype=np.float32) ** 1.5
    return e

def pad_note(m, dur, a=2.5, r=3.5, vel=0.2, voices=3, bright=1500, pan=0.0):
    n = int((dur + r) * SR); t = np.arange(n) / SR; y = np.zeros(n, np.float32)
    for v in range(voices):
        det = (v - (voices - 1) / 2) * 0.0035; f0 = hz(m) * (1 + det)
        for k in range(1, 11):
            y += np.sin(2 * np.pi * f0 * k * t + rng.random() * 6.28).astype(np.float32) / (k ** 1.25)
    y *= env_adsr(n, a, 0.5, 0.85, r) * vel / voices
    from scipy.signal import butter, sosfilt
    y = sosfilt(butter(2, bright, 'low', fs=SR, output='sos'), y).astype(np.float32)
    l, rr = (1 - pan) / 2 + 0.5, (1 + pan) / 2 + 0.5
    return np.stack([y * l * 0.7, y * rr * 0.7], 1)

def pad_chord(out, t, dur, pitches, **kw):
    for k, p in enumerate(pitches):
        s = pad_note(p, dur, pan=(k - len(pitches) / 2) * 0.12, **kw); i = int(t * SR); j = min(len(out), i + len(s))
        if i < len(out): out[i:j] += s[:j - i]
    return out

def sub_drone(out, t, dur, m=26, vel=0.22, a=3.0, r=4.0):
    n = int((dur + r) * SR); tt = np.arange(n) / SR
    y = (np.sin(2 * np.pi * hz(m) * tt) + 0.35 * np.sin(2 * np.pi * hz(m + 12) * tt) + 0.12 * np.sin(2 * np.pi * hz(m + 19) * tt)).astype(np.float32)
    y *= env_adsr(n, a, 0.5, 0.9, r) * vel
    i = int(t * SR); j = min(len(out), i + n)
    if i < len(out): out[i:j] += np.stack([y, y], 1)[:j - i]
    return out

def reverse_swell(chord_audio, length_s):
    """tonal reverse swell: reverse a (reverb-tailed) chord so it builds into its attack"""
    n = int(length_s * SR); x = chord_audio[:n][::-1].copy(); x *= np.linspace(0, 1, len(x), dtype=np.float32)[:, None] ** 2
    return x

def normalise_to(x, lufs_like_rms_db):
    r = np.sqrt(np.mean(x ** 2)) + 1e-9; return x * (10 ** (lufs_like_rms_db / 20) / r)
