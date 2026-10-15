from pathlib import Path
import subprocess,json,wave,re
import numpy as np
E=Path(__file__).resolve().parents[1];P=E/'film/public/audio';sr=48000;D=60.3;N=round(D*sr)
def read(p,af=None):
 cmd=['ffmpeg','-v','error','-i',str(p)]
 if af:cmd+=['-af',af]
 return np.frombuffer(subprocess.check_output(cmd+['-ar',str(sr),'-ac','2','-f','f32le','-']),np.float32).reshape(-1,2).copy()
def save(n,a):
 with wave.open(str(P/n),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((np.clip(a,-1,1)*32767).astype(np.int16).tobytes())
v=read(P/'voice-full.wav')[:N];v[round(58.97*sr):]=0
# Full last word ends at 58.87. No next sentence; native speed unchanged.
v[round(58.93*sr):round(58.97*sr)]*=np.linspace(1,0,round(.04*sr))[:,None]
t=np.arange(N)/sr
raw=read(P/'approved-ep2-ambient.mp3','highpass=f=135,lowpass=f=9000')
m=raw[22*sr:22*sr+N];m/=np.sqrt(np.mean(m*m))
# An envelope per story beat; broad rises, never a beat-grid or hard audio gating.
env=np.full(N,.0038,dtype=np.float32)
for c,width,gain in [(19.65,1.1,1.8),(29.95,1.0,1.65),(43.05,1.0,1.8),(59.45,1.1,2.25)]:env*=1+(gain-1)*np.exp(-.5*((t-c)/width)**2)
env*=np.minimum(1,t/2.0)*np.minimum(1,(D-t)/1.2)
# Slow smooth automatic protection of speech, not music pumping on syllables.
block=int(.25*sr);rms=np.array([np.sqrt(np.mean(v[i:i+block]**2)) for i in range(0,N,block)])
speech=np.interp(t,np.arange(len(rms))*.25+.125,rms)
duck=1-.20*np.minimum(1,speech/.055)
m*= (env*duck)[:,None]
sfx=np.zeros_like(v)
source=P/'sfx'
events=[('sw',3.48,.018),('shutter',11.857,.035),('sw',30.09,.018)]
for name,a,g in events:
 q=read(source/(name+'.wav'));q=q[:int(.8*sr)]*g;i=round(a*sr);sfx[i:i+len(q)]+=q
save('preview-voice.wav',v);save('preview-music.wav',m);save('preview-sfx.wav',sfx);save('preview-premix.wav',v+m+sfx)
cmd=['ffmpeg','-hide_banner','-i',str(P/'preview-premix.wav'),'-af','loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json','-f','null','-']
r=subprocess.run(cmd,capture_output=True,text=True,check=True);j=json.loads(re.search(r'\{\s*"input_i"[\s\S]*?\}',r.stderr).group())
af='loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:measured_thresh={input_thresh}:offset={target_offset}:linear=true:print_format=json'.format(**j)
r=subprocess.run(['ffmpeg','-y','-i',str(P/'preview-premix.wav'),'-af',af,'-ar',str(sr),'-ac','2','-c:a','pcm_s24le',str(P/'preview-master.wav')],capture_output=True,text=True,check=True)
(E/'qa/music-preview.json').write_text(json.dumps({'source':'approved EP2 organic ambient, raw 22..82.3 seconds','temporary_for_direction_test':True,'rejected_EP3_track_used':False,'base_music_rms':.0038,'swells':[19.65,29.95,43.05,59.45],'voice_speed':1.0,'last_word_end':58.87,'voice_trim':58.97,'sfx':events,'premix_loudness':j},indent=2))
(E/'qa/master-normalization.log').write_text(r.stderr)
print('Preview audio and separate stems complete',D,'seconds')
