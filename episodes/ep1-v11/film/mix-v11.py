"""Rebuild the current EP1 mix from its accepted stems into a separate folder.

The delivered master and MP4 are preserved. Edit the SFX stem separately when
changing SFX; out/v11/sfx-v11.json documents its existing event schedule.
"""
import argparse
import json
import math
from pathlib import Path
import re
import subprocess
import wave
import numpy as np

ROOT = Path(__file__).resolve().parent
SR = 48000

def read_wav(file):
    with wave.open(str(file), 'rb') as stream:
        if (stream.getnchannels(),stream.getsampwidth(),stream.getframerate()) != (2,2,SR):
            raise ValueError('Expected 48 kHz stereo 16-bit PCM: '+str(file))
        return np.frombuffer(stream.readframes(stream.getnframes()),dtype='<i2').reshape(-1,2).astype(np.float32)/32767

def active_rms(samples):
    level=np.abs(samples).max(axis=1)
    active=samples[level>level.max()*0.05]
    if not len(active): raise ValueError('Silent input cannot set music level')
    return float(np.sqrt(np.mean(active**2)))+1e-9

def save_wav(file,samples):
    if np.max(np.abs(samples))>=1: raise ValueError('Unclipped mix required')
    with wave.open(str(file),'wb') as stream:
        stream.setnchannels(2);stream.setsampwidth(2);stream.setframerate(SR)
        stream.writeframes((samples*32767).astype('<i2').tobytes())

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--ffmpeg',default='ffmpeg')
    parser.add_argument('--out',default=str(ROOT/'out/rebuild-v11'))
    parser.add_argument('--music-under-voice-db',type=float,default=10.0)
    args=parser.parse_args()
    output=Path(args.out).resolve()
    if output.exists(): raise ValueError('Output exists; choose a new --out folder')
    total=float(re.search(r'TOTAL=([\d.]+)',(ROOT/'src/tl6.ts').read_text(encoding='utf-8')).group(1))
    voice=read_wav(ROOT/'out/v11/stem-voice.wav')
    sfx=read_wav(ROOT/'out/v11/stem-sfx.wav')
    if len(voice)!=round(total*SR) or sfx.shape!=voice.shape: raise ValueError('Stem durations differ from current timeline')
    source=read_wav(ROOT/'public/audio/music-original.wav')*(32767/32768)
    gain=active_rms(voice)/active_rms(source)*10**(-args.music_under_voice_db/20)
    music=np.zeros_like(voice);length=min(len(source),len(voice))
    music[:length]=source[:length]*gain
    intro=min(round(SR*1.2),length);outro=min(round(SR*3),length)
    music[:intro]*=np.linspace(0,1,intro,dtype=np.float32)[:,None]
    music[length-outro:length]*=np.linspace(1,0,outro,dtype=np.float32)[:,None]
    output.mkdir(parents=True)
    save_wav(output/'stem-music.wav',music)
    save_wav(output/'audio.wav',voice+sfx+music)
    normalization=subprocess.run([args.ffmpeg,'-hide_banner','-nostats','-y','-i',str(output/'audio.wav'),
        '-af','loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-ar',str(SR),
        '-c:a','pcm_s16le',str(output/'master.wav')],capture_output=True,check=True,encoding='utf-8',errors='replace')
    metrics=json.loads(normalization.stderr[normalization.stderr.rfind('{'):])
    report={'duration_seconds':total,'sample_rate':SR,'source':'current accepted EP1 v11 voice/SFX stems',
        'music_active_rms_below_voice_db':args.music_under_voice_db,'music_gain_db':20*math.log10(gain),
        'normalization':metrics,'delivered_master_preserved':True,
        'limits':'Technical rebuild from current quantized stems; no claim of byte identity or artistic approval.'}
    (output/'mix-report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report))

if __name__=='__main__':main()
