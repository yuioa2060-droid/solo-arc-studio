"""Technical QA of the delivered EP2 MP4. Records only checks that were actually run.
python qa-ep2.py <mp4> [--expected-frames N] [--out out/ep2/qa-<name>.json]
Checks: ffprobe streams, frame count, full decode of both streams, EBU R128 loudness + true peak of the AAC audio,
last frame is black, background colour in empty regions of sampled frames, review frames extracted for visual inspection."""
import json, re, subprocess, sys, os
from pathlib import Path
import numpy as np
from PIL import Image

mp4 = Path(sys.argv[1]); args = sys.argv[2:]
get = lambda k, d=None: args[args.index(k) + 1] if k in args else d
exp_frames = int(get('--expected-frames', 0)) or None
out = Path(get('--out', f'out/ep2/qa-{mp4.stem}.json')); out.parent.mkdir(parents=True, exist_ok=True)
rev = out.parent / ('review-' + mp4.stem); rev.mkdir(exist_ok=True)
run = lambda cmd: subprocess.run(cmd, capture_output=True, text=True)
rep = {'file': str(mp4), 'bytes': mp4.stat().st_size}

pr = json.loads(run(['ffprobe', '-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', str(mp4)]).stdout)
v = next(s for s in pr['streams'] if s['codec_type'] == 'video'); a = next(s for s in pr['streams'] if s['codec_type'] == 'audio')
rep['video'] = {k: v.get(k) for k in ('codec_name', 'width', 'height', 'pix_fmt', 'r_frame_rate', 'nb_read_frames', 'duration')}
rep['audio'] = {k: a.get(k) for k in ('codec_name', 'sample_rate', 'channels', 'duration', 'bit_rate')}
rep['format_duration'] = pr['format']['duration']
rep['frames_match_expected'] = (int(v['nb_read_frames']) == exp_frames) if exp_frames else None
rep['av_duration_delta_s'] = round(abs(float(v['duration']) - float(a['duration'])), 3)

dec = run(['ffmpeg', '-v', 'error', '-i', str(mp4), '-f', 'null', '-'])
rep['full_decode_errors'] = dec.stderr.strip()[:500] or None

ebu = run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(mp4), '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'])
tail = ebu.stderr[ebu.stderr.rfind('Summary:'):]
rep['loudness_aac'] = {'integrated_lufs': float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1)),
                       'true_peak_dbtp': float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', tail).group(1)),
                       'lra': float(re.search(r'LRA:\s+([\d.]+) LU', tail).group(1))}

dur = float(v['duration']); fps = 30
def frame(t, name):
    f = rev / f'{name}.png'
    run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.3f}', '-i', str(mp4), '-frames:v', '1', str(f)]); return f
last = frame(dur - 1 / fps * 1.5, 'last')
rep['last_frame_mean_luma'] = float(np.asarray(Image.open(last).convert('L')).mean())

# background sampling: empty corner patches of sampled frames must stay the film background (#060606)
bg = []
for t in [2.0, 12.0, 45.0, 100.0, 150.0, 200.0, 240.0, 262.0, 290.0]:
    im = np.asarray(Image.open(frame(t, f'bg-{int(t)}')).convert('RGB')).astype(int)
    patch = np.concatenate([im[10:60, 1860:1910].reshape(-1, 3), im[1020:1070, 1860:1910].reshape(-1, 3)])
    bg.append({'t': t, 'mean_rgb': patch.mean(0).round(2).tolist(), 'max_dev': int(np.abs(patch - 6).max())})
rep['background_patches'] = bg
json.dump(rep, open(out, 'w'), indent=2); print(json.dumps(rep, indent=2))
