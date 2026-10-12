"""Tighten pauses of the single ElevenLabs take and insert authored chapter pauses.

Input : full.mp3 + full.words.json (ElevenLabs word alignment, seconds)
Output: voice.wav (48 kHz mono) + marks.json (word times in the final voice track) + sections.json
Speech is never stretched or re-timed: only silences between words are shortened or lengthened.
Phrases below are matched on normalised words; the LAST word of the phrase carries the pause after it.
"""
import json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / 'full.mp3'
W = json.load(open(HERE / 'full.words.json'))
CFG = json.load(open(HERE / 'pauses.json'))   # {"chapters":[[phrase,name,sec]],"lull":[[phrase,sec]],"default_sentence":0.3,"default_clause":0.16}

nz = lambda s: re.sub(r"[^a-z0-9'\-]", '', s.lower().replace('’', "'"))
txt = [nz(w['text']) for w in W]

def last_index(phrase, nth=1):
    q = [nz(x) for x in phrase.split()]
    n = 0
    for i in range(len(txt) - len(q) + 1):
        if txt[i:i + len(q)] == q:
            n += 1
            if n == nth:
                return i + len(q) - 1
    raise SystemExit('phrase not found: ' + phrase)

o = subprocess.run(['ffmpeg', '-i', str(SRC), '-af', 'silencedetect=noise=-42dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
S = list(zip([float(x) for x in re.findall(r'silence_start: ([\d.]+)', o)], [float(x) for x in re.findall(r'silence_end: ([\d.]+)', o)]))
D = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(SRC)], capture_output=True, text=True).stdout)

CH = {last_index(p): (name, sec) for p, name, sec in CFG['chapters']}
LULL = {last_index(p): sec for p, sec in CFG['lull']}
DS, DC = CFG.get('default_sentence', 0.30), CFG.get('default_clause', 0.16)
prevword = lambda t: max([i for i, w in enumerate(W) if w['start'] < t], default=-1)

parts, cur, sil_after, chapters = [], 0.0, {}, []
for a, b in S:
    if a < 0.05:
        cur = max(0, b - 0.05); continue
    if b > D - 0.05:
        break
    k = prevword(a); w = W[k]['text'] if k >= 0 else ''
    if k in CH:
        parts.append((cur, a + 0.08)); sil_after[len(parts) - 1] = CH[k][1]; chapters.append((CH[k][0], len(parts) - 1)); cur = b - 0.06; continue
    tgt = LULL.get(k, DS if w.endswith(('.', '?', '!', ':', '…')) else DC)
    if b - a > tgt + 0.02:
        parts.append((cur, a + tgt / 2)); cur = b - tgt / 2
parts.append((cur, D))
segs, off = [], 0
for i, (a, b) in enumerate(parts):
    segs.append((a, b, off)); off += b - a + sil_after.get(i, 0)
def mp(x):
    for a, b, o_ in segs:
        if x < a: return o_
        if x <= b + 1e-6: return o_ + x - a
    return segs[-1][2] + segs[-1][1] - segs[-1][0]
marks = [dict(i=i, text=w['text'], start=round(mp(w['start']), 3), end=round(mp(w['end']), 3)) for i, w in enumerate(W)]
filt = ''
for i, (a, b) in enumerate(parts):
    filt += f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={max(0, b - a - 0.012):.3f}:d=0.012[s{i}];"
    if i in sil_after:
        filt += f"anullsrc=r=44100:cl=mono,atrim=0:{sil_after[i]}[z{i}];"
filt += ''.join(f'[s{i}]' + (f'[z{i}]' if i in sil_after else '') for i in range(len(parts))) + f'concat=n={len(parts) + len(sil_after)}:v=0:a=1[o]'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(SRC), '-filter_complex', filt, '-map', '[o]', '-ar', '48000', '-ac', '1', str(HERE / 'voice.wav')], check=True)
sec = [dict(name='hook', start=0.0)]
for name, pi in chapters:
    a, b, o_ = segs[pi]; sec.append(dict(name=name, start=round(o_ + b - a, 3)))
json.dump(marks, open(HERE / 'marks.json', 'w'))
json.dump(dict(sections=sec, total=round(off, 3), chapters={n: s for n, s in [(c[0], c[2]) for c in CFG['chapters']]}), open(HERE / 'sections.json', 'w'), indent=1)
print('raw', round(D, 2), '->', round(off, 2), 's; parts', len(parts)); print(sec)
