import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

// Audio changes can reuse pictures; source/art/font changes must invalidate them.
export async function visualCacheKey(root){
  const hash=createHash('sha256');
  hash.update('Ep3;scale=1;image=jpeg;quality=94;visual-cache-v1');
  async function visit(folder){
    for(const item of (await fs.readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name,'en'))){
      const file=path.join(folder,item.name),relative=path.relative(root,file).split(path.sep).join('/');
      if(relative==='public/audio')continue;
      if(item.isDirectory())await visit(file);
      else if(item.isFile()){hash.update(relative);hash.update(await fs.readFile(file));}
    }
  }
  await visit(path.join(root,'src'));await visit(path.join(root,'public'));
  for(const name of ['package.json','package-lock.json']){hash.update(name);hash.update(await fs.readFile(path.join(root,name)));}
  return hash.digest('hex');
}
