"""Rebuild current EP2 from its flattened video fixture and separated audio stems."""
from pathlib import Path
import argparse,subprocess,tempfile,json,os
p=argparse.ArgumentParser();p.add_argument('--out',required=True);p.add_argument('--ending-video');a=p.parse_args()
e=Path(__file__).resolve().parents[1];out=Path(a.out).resolve();fixture=e/'final/rendo-ep2-hunger-v6.mp4'
if out==fixture:raise SystemExit('Choose a different output; do not overwrite the only video fixture.')
out.parent.mkdir(parents=True,exist_ok=True)
ffmpeg=os.environ.get('SOLO_ARC_FFMPEG','ffmpeg')
ffprobe=os.environ.get('SOLO_ARC_FFPROBE',str(Path(ffmpeg).with_name('ffprobe.exe' if Path(ffmpeg).suffix=='.exe' else 'ffprobe')))
try:
 filters=subprocess.check_output([ffmpeg,'-hide_banner','-filters'],stderr=subprocess.DEVNULL,text=True)
except (OSError,subprocess.CalledProcessError):
 raise SystemExit('Install full FFmpeg and set SOLO_ARC_FFMPEG if it is not on PATH.')
if not any(' alimiter ' in line for line in filters.splitlines()):
 raise SystemExit('Full FFmpeg with alimiter is required. Remotion mini-FFmpeg cannot rebuild this audio mix; set SOLO_ARC_FFMPEG to a full build.')
def run(x):subprocess.run([ffmpeg,'-v','error','-y']+[str(i) for i in x],check=True)
with tempfile.TemporaryDirectory() as td:
 t=Path(td);master=t/'master.flac';args=[]
 for name in ['voice','music','sfx']:args+=['-i',e/'audio/stems'/f'{name}.flac']
 run(args+['-filter_complex','[0:a][1:a][2:a]amix=inputs=3:duration=longest:normalize=0,volume=0.7dB,alimiter=limit=0.82:attack=5:release=80:level=false:latency=true,volume=-0.22dB[out]','-map','[out]','-c:a','flac',master])
 video=fixture
 if a.ending_video:
  end=Path(a.ending_video).resolve();cfg=json.loads(subprocess.check_output([ffprobe,'-v','error','-select_streams','v:0','-show_streams','-of','json',str(end)]))['streams'][0]
  if cfg.get('width')!=1920 or cfg.get('height')!=1080 or cfg.get('r_frame_rate')!='30/1' or abs(float(cfg.get('duration',0))-15.6)>.02 or cfg.get('color_range')!='pc':raise SystemExit('Ending must be 1920x1080,30fps,15.6sec,full-range PC. Inspect source range; never blindly convert TV→PC.')
  run(['-i',fixture,'-frames:v','11148','-an','-c:v','copy',t/'body.mp4'])
  run(['-i',end,'-vf',"lutyuv=y=0:u=128:v=128:enable='gte(n,467)'",'-an','-c:v','libx264','-crf','18','-preset','fast','-pix_fmt','yuvj420p','-color_range','pc',t/'end.mp4'])
  (t/'join.txt').write_text("file 'body.mp4'\nfile 'end.mp4'\n")
  run(['-f','concat','-safe','0','-i',t/'join.txt','-an','-c:v','copy',t/'video.mp4']);video=t/'video.mp4'
 run(['-i',video,'-i',master,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-ar','48000','-t','387.2','-movflags','+faststart',out])
print('Rebuilt current video:',out)
