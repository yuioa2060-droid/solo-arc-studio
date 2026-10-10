# Tighten pauses of the single full ElevenLabs take; insert authored chapter rituals.
# Output: voice.wav (48k) + marks.json (global word times in the final voice track) + sections.json
import json,subprocess,re
f='full.mp3';W=json.load(open('full.words.json'))
o=subprocess.run(['ffmpeg','-i',f,'-af','silencedetect=noise=-42dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
S=list(zip([float(x) for x in re.findall(r'silence_start: ([\d.]+)',o)],[float(x) for x in re.findall(r'silence_end: ([\d.]+)',o)]))
D=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f],capture_output=True,text=True).stdout)
txt=[w['text'] for w in W]
def idx_after(seq):
    for i in range(len(txt)-len(seq)+1):
        if txt[i:i+len(seq)]==seq: return i+len(seq)-1
    raise Exception(seq)
RIT=1.8
def I(*seq): return idx_after(list(seq))
CH={I("Let's",'get','started.'):('plate',RIT),I('the','whole','trick.'):('muscle',RIT),I('reason','to','stay.'):('recovery',RIT),
    I("don't",'let','it.'):('progress',1.5),I('not','a','deadline.'):('recap',1.2),I('Screenshot','it.'):('ending',3.2),I('stay','close.'):('final',3.5)}
XP={I('drop','onto','it.'):0.9,I('Push','back','up.'):1.3,I('No','swinging.'):0.9}   # extra authored pauses (seconds of silence)
LULL={I("you're",'lazy.'):0.6,I('three','signals.'):0.6,I('nothing','at','all.'):0.9,I('to','let','go.'):0.5,I('do','tomorrow.'):0.5,
 I('already','knew','that.'):0.4,I('lie','to','you.'):0.7,I('water','and','food.'):0.5,I('see','it','yet.'):0.7,I('and','you','quit.'):0.5,
 I('with','the','fat.'):0.6,I('it','goes','first.'):0.6,I('comes','off.'):0.6,I('actually','go?'):1.0,I('carbon','dioxide.'):0.7,
 I('times','a','week.'):0.5,I('drop','onto','it.'):0.6,I('Push','back','up.'):0.6,I('No','swinging.'):0.6,I('stays','clean.'):0.4,
 I('getting','it','wrong.'):0.6,I('and','a','half.'):0.4,I('Same','calories.'):0.7,I('hungrier,','too.'):0.7,I('every','night.'):0.5,
 I("it's",'working?'):0.5,I('carried','away.'):0.4,I('bad','news.'):0.6,I('Watching.'):0.5,I('actually','starting.'):0.6,I('by','tomorrow.'):0.6,I('Start','tonight.'):0.8}
def prevword(t): return max([i for i,w in enumerate(W) if w['start']<t],default=-1)
parts=[];cur=0.0;sil_after={}   # sil_after[part_index]=extra silence seconds
chapters=[]
first=True
for a,b in S:
    if a<0.05: cur=max(0,b-0.05);continue
    if b>D-0.05: break
    k=prevword(a);w=txt[k] if k>=0 else ''
    if k in XP:
        parts.append((cur,a+0.1));sil_after[len(parts)-1]=XP[k];cur=b-0.06;continue
    if k in CH:
        parts.append((cur,a+0.08));sil_after[len(parts)-1]=CH[k][1];chapters.append((CH[k][0],len(parts)-1));cur=b-0.06;continue
    tgt=LULL.get(k, 0.30 if w.endswith(('.','?','!',':','…')) else 0.16)
    if b-a>tgt+0.02: parts.append((cur,a+tgt/2));cur=b-tgt/2
parts.append((cur,D))
if len(parts)-1 not in sil_after: pass
# build map
segs=[];off=0
for i,(a,b) in enumerate(parts):
    segs.append((a,b,off));off+=b-a+sil_after.get(i,0)
def mp(x):
    for a,b,o in segs:
        if x<a: return o
        if x<=b+1e-6: return o+x-a
    return segs[-1][2]+segs[-1][1]-segs[-1][0]
marks=[dict(i=i,text=w['text'],start=round(mp(w['start']),3),end=round(mp(w['end']),3)) for i,w in enumerate(W)]
filt=''
for i,(a,b) in enumerate(parts):
    filt+=f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={max(0,b-a-0.012):.3f}:d=0.012[s{i}];"
    if i in sil_after: filt+=f"anullsrc=r=44100:cl=mono,atrim=0:{sil_after[i]}[z{i}];"
seq=''.join(f'[s{i}]'+(f'[z{i}]' if i in sil_after else '') for i in range(len(parts)))
n=len(parts)+len(sil_after)
filt+=seq+f'concat=n={n}:v=0:a=1[o]'
subprocess.run(['ffmpeg','-y','-v','error','-i',f,'-filter_complex',filt,'-map','[o]','-ar','48000','-ac','1','voice.wav'],check=True)
sec=[dict(name='hook',start=0.0)]
for name,pi in chapters:
    a,b,o=segs[pi]; sec.append(dict(name=name,start=round(o+b-a,3)))  # silence starts here
json.dump(marks,open('marks.json','w'));json.dump(dict(sections=sec,total=round(off,3),ritual=RIT),open('sections.json','w'),indent=1)
print('raw',D,'->',round(off,2),'s; parts',len(parts));print(sec)
