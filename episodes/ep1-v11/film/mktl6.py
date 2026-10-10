# regenerate src/tl6.ts arrays/SEC/VEND/TOTAL from ../voice/marks.json + sections.json (keeps helper functions)
import json,re
M=json.load(open('../voice/marks.json'));S=json.load(open('../voice/sections.json'));AT=1.0
nz=lambda s: re.sub(r"[^a-z0-9'\-]","",s.lower().replace('’',"'"))
src=open('src/tl6.ts').read().split('\n')
WT=[nz(m['text']) for m in M];ST=[round(AT+m['start'],3) for m in M];EN=[round(AT+m['end'],3) for m in M]
SEC={s['name']:round(AT+s['start'],3) for s in S['sections'] if s['name']!='final'};SEC['hook']=AT
VEND=EN[-1];TOTAL=round(VEND+4.0,2)
rep={'export const WT':f'export const WT:string[]={json.dumps(WT)};','export const ST':f'export const ST:number[]={json.dumps(ST)};','export const EN':f'export const EN:number[]={json.dumps(EN)};',
 'export const SEC':f'export const SEC:Record<string,number>={json.dumps(SEC)};','export const VEND':f'export const VEND={VEND};','export const TOTAL':f'export const TOTAL={TOTAL};'}
out=[next((v for k,v in rep.items() if l.startswith(k)),l) for l in src]
open('src/tl6.ts','w').write('\n'.join(out));print(SEC,VEND,TOTAL)
