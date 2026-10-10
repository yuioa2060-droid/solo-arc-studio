// Process-local adaptation: Chromium CDP over anonymous pipes, no shared package edits.
const {spawn}=require('node:child_process');
const path=require('node:path');
const base=path.dirname(require.resolve('@remotion/renderer'));
const runner=require(path.join(base,'browser/BrowserRunner.js'));
const {Connection}=require(path.join(base,'browser/Connection.js'));
runner.makeBrowserRunner=async({executablePath,processArguments,userDataDir})=>{
 const args=processArguments.filter(a=>!a.startsWith('--remote-debugging-port'));
 args.push('--remote-debugging-pipe');
 const proc=spawn(executablePath,args,{windowsHide:true,stdio:['ignore','ignore','pipe','pipe','pipe']});
 let pending=Buffer.alloc(0),closed=false;
 const transport={onmessage:null,onclose:null,send(message){proc.stdio[3].write(message+'\0');},close(){proc.kill();},forgetEventLoop(){proc.unref();proc.stdio[3].unref?.();proc.stdio[4].unref?.();},rememberEventLoop(){proc.ref();proc.stdio[3].ref?.();proc.stdio[4].ref?.();}};
 proc.stdio[4].on('data',chunk=>{pending=Buffer.concat([pending,chunk]);let idx;while((idx=pending.indexOf(0))!==-1){const str=pending.subarray(0,idx).toString('utf8');pending=pending.subarray(idx+1);if(str)transport.onmessage?.(str);}});
 proc.on('exit',()=>{closed=true;transport.onclose?.();});
 proc.stderr.on('data',d=>{const s=String(d).trim();if(/ERROR|DevTools/.test(s))console.log(s);});
 const connection=new Connection(transport);
 const stop=async()=>{if(closed)return;try{await Promise.race([connection.send('Browser.close'),new Promise(r=>setTimeout(r,2000))]);}finally{if(!closed)proc.kill();}};
 process.once('exit',()=>{if(!closed)proc.kill();});
 console.log('Owned Chromium CDP pipe PID '+proc.pid);
 return {listeners:[],deleteBrowserCaches(){},forgetEventLoop:()=>transport.forgetEventLoop(),rememberEventLoop:()=>transport.rememberEventLoop(),connection,closeProcess:stop,killProcess:()=>proc.kill(),process:proc,userDataDir};
};
