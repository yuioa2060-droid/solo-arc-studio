import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const out=path.join(root,'out/redo/Rendo-EP3-New-Direction-60s.mp4');
const r=spawnSync('ffmpeg',['-y','-i',path.join(root,'out/redo/redo-preview-silent.mp4'),'-i',path.join(root,'public/audio/preview-master.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-ar','48000','-t','60.3','-movflags','+faststart',out],{stdio:'inherit'});
if(r.status!==0)process.exit(r.status??1);console.log('Exported',out);
