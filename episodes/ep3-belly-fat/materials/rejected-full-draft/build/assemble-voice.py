import json,subprocess,wave,numpy as np
from pathlib import Path
E=Path(__file__).resolve().parents[1];v=E/'voice';audio=E/'film/public/audio';audio.mkdir(exist_ok=True)
segments=[];words=[];offset=.55
segments.append(np.zeros((round(offset*48000),2),dtype=np.float32));parts=[]
for i in range(1,4):
 data=subprocess.check_output(['ffmpeg','-v','error','-i',str(v/f'take{i}.mp3'),'-f','f32le','-ar','48000','-ac','2','-'])
 a=np.frombuffer(data,dtype=np.float32).reshape(-1,2).copy();duration=len(a)/48000
 for w in json.loads((v/f'take{i}.words.json').read_text()): words.append({**w,'start':w['start']+offset,'end':w['end']+offset})
 parts.append({'part':i,'offset':offset,'duration':duration});segments.append(a);offset+=duration
 if i<3:segments.append(np.zeros((19200,2),dtype=np.float32));offset+=.4
segments.append(np.zeros((96000,2),dtype=np.float32));a=np.concatenate(segments);total=len(a)/48000
with wave.open(str(audio/'voice.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(48000);f.writeframes((np.clip(a,-1,1)*32767).astype(np.int16).tobytes())
(v/'words.json').write_text(json.dumps(words,indent=2));(v/'assembly.json').write_text(json.dumps({'parts':parts,'duration':total,'speed':1.0,'leading_silence':.55,'between_takes':.4,'tail':2.0},indent=2));print('EP3 duration',round(total,3),'seconds; words',len(words))
