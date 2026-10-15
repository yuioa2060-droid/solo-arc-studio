from pathlib import Path
from PIL import Image
import cv2,numpy as np,json
E=Path(__file__).resolve().parents[1];P=E/'film/public/art'
# Only native alpha cleanup: no new linework or body redraw.
for name in ['x-hinge-b','x-crunch-low','o-protein']:
 im=Image.open(E/'raw'/(name+'.png')).convert('RGBA');a=np.array(im);alpha=a[:,:,3];alpha[alpha<205]=0;n,lab,stats,_=cv2.connectedComponentsWithStats((alpha>0).astype(np.uint8),8);keep=np.zeros_like(alpha,dtype=bool)
 for i in range(1,n):
  if stats[i,cv2.CC_STAT_AREA]>60:keep|=lab==i
 alpha[~keep]=0;a[:,:,3]=alpha;Image.fromarray(a).save(P/(name+'.png'))
# Whole-image uniform registration based on a foot-region template; no XY deformation.
high=Image.open(P/'h-crunch.png').convert('RGBA');low=Image.open(P/'x-crunch-low.png').convert('RGBA');hg=cv2.cvtColor(np.array(high)[:,:,:3],cv2.COLOR_RGB2GRAY);lg=cv2.cvtColor(np.array(low)[:,:,:3],cv2.COLOR_RGB2GRAY);templ=hg[620:765,5:300];best=None
for scale in np.linspace(.88,1.05,35):
 scaled=cv2.resize(lg,(round(lg.shape[1]*scale),round(lg.shape[0]*scale)));roi=scaled[500:850,:500]
 if roi.shape[0]<templ.shape[0]:continue
 mat=cv2.matchTemplate(roi,templ,cv2.TM_CCOEFF_NORMED);_,score,_,loc=cv2.minMaxLoc(mat)
 if best is None or score>best[0]:best=(score,scale,5-loc[0],620-(loc[1]+500))
score,sc,dx,dy=best;size=(1800,1100);offset=(110,170)
for name,im,k,tx,ty in [('x-crunch-high',high,1,0,0),('x-crunch-low',low,sc,dx,dy)]:
 out=Image.new('RGBA',size,(0,0,0,0));im=im.resize((round(im.width*k),round(im.height*k)),Image.Resampling.LANCZOS);out.alpha_composite(im,(offset[0]+round(tx),offset[1]+round(ty)));out.save(P/(name+'.png'))
# Align whole hip-hinge B to planted-foot anchors; lower-body residual is explicitly reviewed.
im=Image.open(P/'x-hinge-b.png');out=Image.new('RGBA',im.size,(0,0,0,0));out.alpha_composite(im,(-18,4));out.save(P/'x-hinge-b.png')
m=json.loads((P/'meta.json').read_text())
for name in ['x-crunch-high','x-crunch-low','x-hinge-b','o-protein']:
 im=Image.open(P/(name+'.png'));m[name]={'width':im.width,'height':im.height}
(P/'meta.json').write_text(json.dumps(m,indent=2));(E/'qa/pose-registration.json').write_text(json.dumps({'crunch':{'scale':sc,'translation':[dx,dy],'template_match_score':score,'canvas':size,'whole_image_only':True},'hinge_B':{'translation':[-18,4],'whole_image_only':True,'residual_registration_not_pixel_identical':True}},indent=2))
for n in ['x-crunch','x-hinge']:
 a=Image.open(P/(n+('-high' if n=='x-crunch' else '-a')+'.png')).convert('RGBA');b=Image.open(P/(n+('-low' if n=='x-crunch' else '-b')+'.png')).convert('RGBA')
 for k in [.25,.5,.75]:
  c=Image.blend(a,b,k);bg=Image.new('RGBA',c.size,'#060606');bg.alpha_composite(c);bg.convert('RGB').save(E/'qa'/f'{n}-blend-{k}.png')
print('Whole-pose registration',best)
