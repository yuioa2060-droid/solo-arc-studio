import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const film=path.join(root,'episodes','ep1-v11','film');
if(fs.existsSync(path.join(root,'.env'))) process.loadEnvFile(path.join(root,'.env'));
const require=createRequire(import.meta.url);
const [task,...extra]=process.argv.slice(2);
let args;
if(task==='doctor') args=[path.join(film,'doctor.mjs')];
else if(task==='studio'||task==='browser'){
 const cli=path.join(path.dirname(require.resolve('@remotion/cli/package.json')),'remotion-cli.js');
 args=task==='studio'?[cli,'studio','src/index-audio.ts','--public-dir=public',...extra]:[cli,'browser','ensure'];
}else if(task==='preview'||task==='render'){
 const out=path.join(root,'outputs',task==='preview'?'ep1-preview.mp4':'ep1-v11.mp4');
 fs.mkdirSync(path.dirname(out),{recursive:true});
 args=[path.join(film,'render-portable.mjs'),'--out',out];
 if(task==='preview') args.push('--from','0','--to','4','--scale','0.5');
 args.push(...extra);
}else throw new Error('Usage: node scripts/run.mjs doctor|studio|browser|preview|render');
const child=spawn(process.execPath,args,{cwd:film,stdio:'inherit',env:process.env,windowsHide:true});
child.on('error',()=>{console.error('Unable to start project command');process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
