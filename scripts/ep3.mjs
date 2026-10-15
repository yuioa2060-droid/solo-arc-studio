import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const film=path.join(root,'episodes/ep3-belly-fat/approved-direction/film');
const require=createRequire(import.meta.url);
const [task,...extra]=process.argv.slice(2);
let args;
if(task==='studio') {
 const cli=path.join(path.dirname(require.resolve('@remotion/cli/package.json')),'remotion-cli.js');
 args=[cli,'studio','src/index.ts','--public-dir=public',...extra];
} else if(task==='check'||task==='sample') {
 args=[path.join(root,'episodes/ep3-belly-fat/render.mjs'),...(task==='check'?['--check']:[]),...extra];
} else throw Error('Usage: node scripts/ep3.mjs check|studio|sample');
const child=spawn(process.execPath,args,{cwd:film,stdio:'inherit',env:process.env,windowsHide:true});
child.on('error',()=>{console.error('Unable to start EP3 command');process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
