const fs=require('node:fs/promises');
const path=require('node:path');
const base=path.dirname(require.resolve('@remotion/renderer'));
const {HeadlessBrowser}=require(path.join(base,'browser/Browser.js'));
const original=HeadlessBrowser.prototype.newPage;
let bundleRoot;
exports.mountBundle=dir=>{bundleRoot=path.resolve(dir);};
HeadlessBrowser.prototype.newPage=async function(...args){
 const page=await original.apply(this,args),client=page._client();
 client.on('Fetch.requestPaused',async e=>{try{
  const u=new URL(e.request.url);if(u.hostname!=='localhost'){await client.send('Fetch.continueRequest',{requestId:e.requestId});return;}
  const relative=decodeURIComponent(u.pathname).replace(/^\/+/,''),file=path.resolve(bundleRoot,relative||'index.html');
  if(!file.startsWith(bundleRoot+path.sep))throw new Error('Asset outside bundle');
  const body=await fs.readFile(file),ext=path.extname(file);const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.ttf':'font/ttf','.wav':'audio/wav','.mp3':'audio/mpeg'}[ext]||'application/octet-stream';
  await client.send('Fetch.fulfillRequest',{requestId:e.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:mime},{name:'Access-Control-Allow-Origin',value:'*'}],body:body.toString('base64')});
 }catch(err){console.log('Bundle asset failed '+new URL(e.request.url).pathname+': '+err.message);await client.send('Fetch.fulfillRequest',{requestId:e.requestId,responseCode:404,body:''}).catch(()=>{});}});
 await client.send('Fetch.enable',{patterns:[{urlPattern:'http://localhost:*/*',requestStage:'Request'}]});
 return page;
};
