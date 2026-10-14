import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(fs.existsSync(path.join(root,'.env')))process.loadEnvFile(path.join(root,'.env'));
const [task,...extra]=process.argv.slice(2);
let command,args;
if(task==='check'||task==='ending'){
 command=process.execPath;args=[path.join(root,'episodes/ep2-hunger/render.mjs'),'--out',path.join(root,'outputs/ep2-ending.mp4'),'--review-dir',path.join(root,'outputs/ep2-review'),...extra];
 if(task==='check')args.push('--check');
}else if(task==='rebuild'){
 command=process.env.SOLO_ARC_PYTHON || (process.platform==='win32'?'python':'python3');
 args=[path.join(root,'episodes/ep2-hunger/build/rebuild-current.py'),...extra];
}else throw new Error('Usage: node scripts/ep2.mjs check|ending|rebuild');
const child=spawn(command,args,{cwd:root,env:process.env,stdio:'inherit',windowsHide:true});
child.on('error',()=>{console.error('EP2 tool unavailable; inspect installed Python/Node/FFmpeg paths.');process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
