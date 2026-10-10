import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const skill=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2),outAt=args.indexOf('--out'),out=outAt>=0?path.resolve(args[outAt+1]):null;
if(!out)throw Error('Provide --out <new production directory>; add --demo for the silent original study.');
if(await fs.stat(out).catch(()=>null))throw Error('Output exists; choose a new folder. Existing projects are never overwritten.');
if(args.includes('--elements')&&args.includes('--demo'))throw Error('Choose --elements or --demo, not both.');
await fs.mkdir(out,{recursive:true});
if(args.includes('--elements')){await fs.cp(skill+'/assets/elements-study',out,{recursive:true});console.log(JSON.stringify({created:out,elements:true,next:['node '+out+'/render-elements.mjs --stills','node '+out+'/render-elements.mjs'],apiRequests:0}));process.exit(0);}
await fs.cp(skill+'/assets/runtime',out,{recursive:true});await fs.mkdir(out+'/public/assets',{recursive:true});
for(const font of ['comic.ttf','comic-bold.ttf'])await fs.copyFile(skill+'/assets/demo/'+font,out+'/public/'+font);
if(args.includes('--demo')){await fs.cp(skill+'/assets/demo',out+'/public',{recursive:true});await fs.copyFile(skill+'/references/original-demo.json',out+'/motion-plan.json');}
else{await fs.writeFile(out+'/public/assets/meta.json','{}\n');await fs.writeFile(out+'/motion-plan.json',JSON.stringify({version:1,fps:60,duration:10,persistent:[],scenes:[{id:'first-beat',a:0,b:10,purpose:'Replace this with the first original visual thought',layers:[]}]},null,2));}
console.log(JSON.stringify({created:out,demo:args.includes('--demo'),next:['node '+out+'/plan-check.mjs','node '+out+'/render.mjs --stills','node '+out+'/render.mjs'],apiRequests:0}));
