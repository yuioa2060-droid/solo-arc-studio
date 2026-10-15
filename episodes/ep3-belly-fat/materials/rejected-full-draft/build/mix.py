from pathlib import Path
import json,subprocess,numpy as np,wave,re
E=Path(__file__).resolve().parents[1];P=E/'film/public/audio';N=round(json.loads((E/'voice/assembly.json').read_text())['duration']*48000);sr=48000
read=lambda p:np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-ar','48000','-ac','2','-f','f32le','-']),dtype=np.float32).reshape(-1,2).copy()
def save(name,a):
 with wave.open(str(P/name),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((np.clip(a,-1,1)*32767).astype(np.int16).tobytes())
voice=read(P/'voice.wav')[:N]
# Organic generated music, no synthesis; remove low-frequency rumble, preserve upper textures.
raw=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(E/'raw/ambient-ep3.mp3'),'-af','highpass=f=170,lowpass=f=9500','-ar',str(sr),'-ac','2','-f','f32le','-']),dtype=np.float32).reshape(-1,2).copy()
core=raw[10*sr:110*sr];core/=max(.0001,float(np.sqrt(np.mean(core**2))))
music=np.zeros((N,2),dtype=np.float32);length=len(core);overlap=20*sr;step=length-overlap
for pos in range(0,N,step):
 m=core.copy();r=np.linspace(0,1,overlap,dtype=np.float32);m[:overlap]*=r[:,None];m[-overlap:]*=r[::-1,None];end=min(N,pos+length);music[pos:end]+=m[:end-pos]
# Restrained scene-linked rises: smooth continuous envelopes, never beat-gated.
t=np.arange(N)/sr;base=.0058*(.85+.10*np.sin(t*2*np.pi/79)+.06*np.sin(t*2*np.pi/113))
scenes=json.loads((E/'film/src/timeline.json').read_text())['scenes'];peaks=[s['a']+2 for s in scenes if s['kind'] in ['session','measurement','plan','signals']]
for c in peaks:base*=1+.13*np.exp(-((t-c)/6.5)**2)
for c in [20,140,219,399]:base*=1-.25*np.exp(-((t-c)/4.8)**2)
base*=np.minimum(1,t/5)*np.minimum(1,(N/sr-t)/4)
music*=base[:,None]
# Slow safety compression on organic swells, never a rhythmic pulse.
window=sr;vol=np.sqrt(np.mean(music[:len(music)//window*window].reshape(-1,window,2)**2,axis=(1,2)));red=np.minimum(1,.0075/np.maximum(vol,.00001));g=np.interp(t,np.arange(len(red))+.5,red);music*=g[:,None]
sfx=np.zeros_like(music);events=[]
for kind,at,level in [('sw',30.25,.045),('shutter',149.8,.11),('tech',252.5,.08),('shutter',273.0,.08),('sw',355.0,.035),('swf',423.7,.025)]:
 src=E/'film/public/audio/sfx'/f'{kind}.wav';a=read(src);a=a[:min(len(a),round(1.3*sr))];a*=level;start=round(at*sr);end=min(N,start+len(a));sfx[start:end]+=a[:end-start];events.append({'asset':kind,'time':at,'gain':level})
# Preserve the native take and its exact timeline. One global gain, no speech speed change.
voice*=1.15
save('stem-voice.wav',voice);save('stem-music.wav',music);save('stem-sfx.wav',sfx);save('premix.wav',voice+music+sfx)
(E/'qa/sfx-events.json').write_text(json.dumps(events,indent=2));(E/'qa/music-envelope.json').write_text(json.dumps({'source':'new organic ElevenLabs Music music_v1','highpass_hz':170,'core_seconds':[10,110],'crossfade_seconds':20,'scene_swells':peaks,'peak_rms_ceiling':.0075,'synthetic_instruments':False},indent=2))
r=subprocess.run(['ffmpeg','-hide_banner','-i',str(P/'premix.wav'),'-af','loudnorm=I=-14:TP=-1.6:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True,check=True);m=re.search(r'\{\s*"input_i"[\s\S]*?\}',r.stderr);j=json.loads(m.group());(E/'qa/premix-loudness.json').write_text(json.dumps(j,indent=2))
f='loudnorm=I=-14:TP=-1.6:LRA=9:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:measured_thresh={input_thresh}:offset={target_offset}:linear=true:print_format=json'.format(**j)
r=subprocess.run(['ffmpeg','-v','info','-y','-i',str(P/'premix.wav'),'-af',f,'-ar','48000','-ac','2','-c:a','pcm_s24le',str(P/'master.wav')],capture_output=True,text=True,check=True);(E/'qa/master-normalization.log').write_text(r.stderr)
print('Separate stems and final master saved;',N/sr,'seconds')
