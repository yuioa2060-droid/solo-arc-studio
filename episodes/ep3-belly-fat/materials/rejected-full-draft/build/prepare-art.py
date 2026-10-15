from pathlib import Path
from PIL import Image
import numpy as np,cv2,json
E=Path(__file__).resolve().parents[1];P=E/'film/public';A=P/'art';A.mkdir(exist_ok=True)
raws={'h-tape':'h-tape-refined','h-log':'h-log','h-open':'h-open','s-mirror':'s-mirror','s-meal':'s-meal','o-protein':'o-protein','x-hinge-a':'x-hinge-a','x-hinge-b':'x-hinge-b'}
meta={}
def export(name,im,crop=True):
 im=im.convert('RGBA')
 if crop:
  box=im.getchannel('A').getbbox()
  if box:im=im.crop((max(0,box[0]-8),max(0,box[1]-8),min(im.width,box[2]+8),min(im.height,box[3]+8)))
 im.save(A/(name+'.png'));meta[name]={'width':im.width,'height':im.height}
for f in (P/'img').glob('*.png'):
 export(f.stem,Image.open(f),crop=f.stem not in ['b-w1','b-w2','b-w3','h-crunch','h-down','x-push-a','x-push-b','x-squat-a','x-squat-b','x-row-a','x-row-b'])
for name,raw in raws.items():
 f=E/'raw'/(raw+'.png')
 if not f.exists():continue
 im=Image.open(f).convert('RGBA');a=np.array(im);alpha=a[:,:,3];rgb=a[:,:,:3]
 if alpha.min()>=250:
  # Only border-connected dark background is removed: preserve enclosed black ink.
  dark=(rgb.max(axis=2)<48).astype(np.uint8);n,lab=cv2.connectedComponents(dark,connectivity=8)
  ids=np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]]));ids=ids[ids!=0];bg=np.isin(lab,ids)
  alpha[bg]=0
  near=cv2.dilate(bg.astype(np.uint8),np.ones((3,3),np.uint8)).astype(bool)&~bg
  # Fade only a 1px background boundary; do not erase interior ink or gray anatomy.
  alpha[near]=np.minimum(alpha[near],np.clip((rgb.max(axis=2)[near].astype(float)-25)/65*255,0,255).astype(np.uint8))
  a[:,:,3]=alpha;im=Image.fromarray(a)
 export(name,im,crop=name not in ['x-hinge-a','x-hinge-b'])
(A/'meta.json').write_text(json.dumps(meta,indent=2));print('Prepared',len(meta),'alpha-aware whole-image assets')
