// A6API job queue: one controlled paid request per job (helper from the repo skill), N at a time.
//   node --env-file=<credentials.env> tools/a6queue.mjs jobs.json [--conc 3] [--send]
// jobs.json: [{ "name":"s-office", "mode":"scene|hero|obj", "refs":["raw/x.png"], "size":"1536x1024", "suffix":"" }]
// The prompt of a job is prompts/<name>.txt. Dry run by default. Auto-retry ONLY on HTTP 429 (never billed);
// timeouts / 5xx / quota errors are recorded and left for a human decision (they can be billed).
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ep = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(ep, '..', '..');
const helper = path.join(repo, 'skills/solo-arc-motion/scripts/a6api-reference.mjs');
const args = process.argv.slice(2);
const jobsFile = args.find(a => !a.startsWith('--') && a.endsWith('.json'));
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const send = args.includes('--send');
const conc = Number(val('--conc', 3));
if (!jobsFile) throw new Error('Usage: a6queue.mjs jobs.json [--conc N] [--send]');
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));

const REFS = {
  hero: [path.join(ep, 'ref/style-ref.png'), path.join(repo, 'skills/solo-arc-motion/assets/channel/APPROVED-h3-hero-waist.png')],
  obj: [path.join(ep, 'ref/o-style-anchor.png')],
  scene: [path.join(ep, 'ref/style-ref.png'), path.join(ep, 'ref/o-style-anchor.png')],
};
const usage = async () => {
  try {
    const r = await fetch('https://a6.a6api.com/v1/dashboard/billing/usage', { headers: { Authorization: 'Bearer ' + process.env.A6API_KEY }, signal: AbortSignal.timeout(30000) });
    return Math.round((await r.json()).total_usage * 5000);
  } catch { return null; }
};
const run = (cmd) => new Promise(res => {
  const p = spawn(process.execPath, cmd, { env: process.env }); let o = '', e = '';
  p.stdout.on('data', d => o += d); p.stderr.on('data', d => e += d); p.on('close', code => res({ code, o, e }));
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const exists = f => { try { return fs.statSync(f).size > 0; } catch { return false; } };

async function doJob(job) {
  const out = path.join(ep, 'raw', `${job.name}${job.suffix ? '-' + job.suffix : ''}.png`);
  const promptFile = path.join(ep, 'prompts', `${job.name}.txt`);
  if (exists(out)) { console.log(`skip ${job.name}: output exists`); return; }
  const refs = [...(job.refsFirst ?? []), ...(REFS[job.mode ?? 'scene']), ...(job.refs ?? [])].map(r => path.resolve(ep, r));
  const hargs = [helper, ...refs.flatMap(r => ['--ref', r]), '--prompt-file', promptFile, '--out', out,
    '--route-id', '4995', '--expected-price', '0.0012', '--size', job.size ?? '1536x1024', '--timeout-ms', '240000'];
  if (send) hargs.push('--send');
  const t0 = Date.now();
  for (let attempt = 1; attempt <= 4; attempt++) {
    const r = await run(hargs);
    let audit = null; try { audit = JSON.parse(fs.readFileSync(out + '.audit.json', 'utf8')); } catch {}
    const status = audit?.status ?? (send ? 'unknown' : 'dry-run');
    const err = audit?.error ?? '';
    if (send && status !== 'saved-unreviewed' && /429|rate|too many/i.test(err + r.e + r.o) && attempt < 4) { console.log(`429 on ${job.name}, retry ${attempt} in ${15 * attempt}s`); await sleep(15000 * attempt); continue; }
    results.push({ name: job.name, status, err: err.slice(0, 120), sec: Math.round((Date.now() - t0) / 1000), http: audit?.httpStatus });
    console.log(`${send ? '' : '[dry] '}${job.name}: ${status} http=${audit?.httpStatus ?? '-'} ${Math.round((Date.now() - t0) / 1000)}s ${err.slice(0, 100)}`);
    return;
  }
}
const before = send ? await usage() : null;
const queue = [...jobs];
await Promise.all(Array.from({ length: Math.min(conc, queue.length) }, async () => { while (queue.length) await doJob(queue.shift()); }));
if (send) {
  const after = await usage();
  const ok = results.filter(r => r.status === 'saved-unreviewed').length;
  console.log(JSON.stringify({ batch: path.basename(jobsFile), jobs: jobs.length, saved: ok, failed: results.length - ok, usageBefore: before, usageAfter: after, billedUnits: before != null && after != null ? after - before : null, note: 'batch delta may include unrelated use of the same key', failedNames: results.filter(r => r.status !== 'saved-unreviewed').map(r => r.name) }));
  fs.appendFileSync(path.join(ep, 'notes/a6api-batches.jsonl'), JSON.stringify({ at: new Date().toISOString(), batch: path.basename(jobsFile), results, usageBefore: before, usageAfter: after }) + '\n');
}
