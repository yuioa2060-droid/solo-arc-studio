import subprocess,numpy as np,json
from scipy.ndimage import uniform_filter1d,gaussian_filter1d
from pathlib import Path
SR=48000
src=Path('../revision4')
def read(p):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-f','f32le','-ar',str(SR),'-ac','2','-']),np.float32).reshape(-1,2).copy()
def save(p,a):
 subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-c:a','flac',str(p)],input=a.astype(np.float32).tobytes(),check=True)
m=read(src/'stems/music.flac');n=len(m)
# Two-second stereo RMS on a 100Hz control grid; soft-knee compression
# reduces musical swells without changing notes or introducing abrupt cuts.
frame=480;pad=(-n)%frame;x=np.pad(m,((0,pad),(0,0)))
e=np.sqrt(uniform_filter1d(np.mean(x.reshape(-1,frame,2)**2,axis=(1,2)),size=200,mode='nearest')+1e-12)
level=20*np.log10(e);threshold=-40.4;knee=6.;over=level-threshold
reduction=np.where(over<=-knee/2,0,np.where(over>=knee/2,.75*over,.75*(over+knee/2)**2/(2*knee)))
reduction=gaussian_filter1d(reduction,100,mode='nearest')
t=np.arange(len(e))/100
u=np.clip((t-25)/20,0,1);early=2*(1-u*u*(3-2*u))
gain_db=-.6-reduction-early
g=np.interp(np.arange(n)/SR,t,10**(gain_db/20)).astype(np.float32)
new=m*g[:,None];save('music-v5.flac',new)
v=read(src/'stems/voice.flac');s=read(src/'stems/sfx.flac');save('premix-v5.flac',v+s+new)
report={'change':'Only music attenuated; voice and SFX stems unchanged; video stream copied','music_base_reduction_db':.6,'additional_initial_reduction_db':2,'music_compression_threshold_dbfs':threshold,'music_compression_ratio':'4:1, 6dB soft knee, 2sec RMS, 1sec smoothing','max_music_reduction_db':float(-gain_db.min()),'median_music_reduction_db':float(-np.median(gain_db)),'duration_seconds':n/SR,'full_human_audio_listen':False}
json.dump(report,open('audio-change.json','w'),indent=2);print(json.dumps(report))
