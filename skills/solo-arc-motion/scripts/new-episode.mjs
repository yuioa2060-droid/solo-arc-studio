#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const skillRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
let out, explicitSource;
for(let i=0;i<args.length;i+=2){
  if(!args[i+1] || !['--out','--source'].includes(args[i])) throw new Error('Usage: --out <new-directory> [--source <EP1-v11-directory>]');
  if(args[i]==='--out') out=args[i+1]; else explicitSource=args[i+1];
}
if(!out) throw new Error('Choose --out <new-directory>.');
const source=await fs.realpath(explicitSource || path.join(skillRoot,'..','..','episodes','ep1-v11'));
const target=path.resolve(out);
const contains=(parent,child)=>{
  const rel=path.relative(parent,child);
  return rel==='' || (!rel.startsWith('..'+path.sep) && !path.isAbsolute(rel));
};
for(const protectedRoot of [skillRoot,source]){
  if(contains(protectedRoot,target)||contains(target,protectedRoot)) throw new Error('Output must be independent of the skill and source episode.');
}
try { await fs.lstat(target); throw new Error('Output exists; choose a new directory.'); }
catch(error){if(error.code!=='ENOENT') throw error;}
await fs.access(path.join(source,'film','src','Film6.tsx'));
await fs.cp(source,target,{recursive:true,errorOnExist:true,force:false,filter:entry=>{
  const parts=path.relative(source,entry).split(path.sep);
  return !parts.some(p=>['node_modules','.git','.cache'].includes(p)||/^frames(?:-|$)/.test(p));
}});
await fs.writeFile(path.join(target,'NEW_EPISODE_START_RU.md'),`# Новая независимая копия SOLO ARC\n\nИсточник — текущий EP1 v11. Его сценарий и звук служат примером, это ещё не новый выпуск.\n\n1. Прочитать current-rules-ru.md и episode-workflow-ru.md в скилле.\n2. Заменить сценарий, голос/marks, тайминги, сцены, PNG и микс по новому заданию.\n3. В film выполнить npm ci, node doctor.mjs, npm run studio:audio.\n4. Проверить ключевые изображения и переходы до полного рендера.\n5. Ключи брать из окружения.\n`,'utf8');
console.log(`Created independent copy of current EP1 v11: ${target}`);
