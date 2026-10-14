import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const requireFile=p=>{const full=path.join(root,p);if(!fs.existsSync(full))throw Error('Missing '+p);return full;};
const digest=async file=>{const hash=createHash('sha256');for await(const bytes of fs.createReadStream(file))hash.update(bytes);return hash.digest('hex');};
const expected=['START_CLAUDE_RU.md','CLAUDE.md','AGENTS.md','context/SOURCE_SCOPE_RU.md','episodes/ep1-v11/film/src/index.ts','episodes/ep1-v11/solo-arc-ep1-v11.mp4','episodes/ep2-hunger/final/rendo-ep2-hunger-v6.mp4','episodes/ep2-hunger/film/src/index.tsx','episodes/ep2-hunger/audio/stems/voice.flac','episodes/ep2-hunger/audio/stems/music.flac','episodes/ep2-hunger/audio/stems/sfx.flac'];
for(const p of expected)requireFile(p);
for(const name of ['solo-arc-motion','motion-graphics','youtube-script-writer','writers-room-story-engine']) {
 requireFile('skills/'+name+'/SKILL.md');requireFile('.claude/skills/'+name+'/SKILL.md');
}
const meta=JSON.parse(fs.readFileSync(requireFile('episodes/ep2-hunger/upload-metadata.json'),'utf8'));
const video=requireFile('episodes/ep2-hunger/'+meta.video);
if(fs.statSync(video).size<1000)throw Error('MP4 is probably a Git LFS pointer: git lfs pull first.');
if(await digest(video)!==meta.video_sha256)throw Error('EP2 movie differs from the delivered final.');
if(meta.title!=='How I Lost Fat Without Starving Myself')throw Error('Unexpected current title');
const description=fs.readFileSync(requireFile('episodes/ep2-hunger/description.txt'),'utf8').trim();
if(description!==meta.description || /https?:\/\//i.test(description)||description.includes('Research mentioned'))throw Error('Public description must match metadata and omit research links.');
const chapters=meta.chapters;
if(chapters.length!==8||chapters[0].seconds!==0||chapters.some((c,i)=>c.seconds>=meta.duration_seconds || (i>0&&c.seconds-chapters[i-1].seconds<10)))throw Error('Invalid chapter positions.');
const cost=meta.tags.reduce((n,t)=>n+t.length+(t.includes(' ')?2:0),0)+meta.tags.length-1;
if(cost!==500||new Set(meta.tags).size!==meta.tags.length)throw Error('Tags must fit the requested 500-character budget without duplicates.');
for(const ref of meta.thumbnail_proposals)requireFile('episodes/ep2-hunger/'+ref);
const report={current_title:meta.title,ep2_video_sha256:meta.video_sha256,chapters:chapters.length,tag_characters:cost,skill_entry_points:4,main_ep2_layers_available:false,checks:'Current files, final hash, metadata, chapter positions, tag budget, skill entry points. Not a full creative/audio review.'};
console.log(JSON.stringify(report,null,2));
