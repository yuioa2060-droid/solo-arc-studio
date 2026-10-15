// One controlled A6API image request per call, via the repository helper.
// node --env-file=<credentials.env> tools/a6gen.mjs <name> --hero|--obj [--ref file]... [--size 1536x1024] [--suffix b] [--send]
// Dry run by default. Reconciles billing from the token usage counter (units / 500000 = USD).
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ep = path.resolve(here, '..');
const repo = path.resolve(ep, '..', '..');
const helper = path.join(repo, 'skills/solo-arc-motion/scripts/a6api-reference.mjs');
const args = process.argv.slice(2);
const name = args.find(a => !a.startsWith('--'));
const flag = f => args.includes(f);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const extraRefs = args.flatMap((a, i) => (a === '--ref' ? [args[i + 1]] : []));
if (!name) throw new Error('Usage: a6gen.mjs <name> --hero|--obj [--ref f] [--size WxH] [--suffix s] [--send]');

const heroRefs = [path.join(ep, 'ref/style-ref.png'), path.join(repo, 'skills/solo-arc-motion/assets/channel/APPROVED-h3-hero-waist.png')];
const objRefs = [path.join(ep, 'ref/o-style-anchor.png')];
const refs = [...(flag('--hero') ? heroRefs : objRefs), ...extraRefs.map(r => path.resolve(r))];
const suffix = val('--suffix', '');
const out = path.join(ep, 'raw', `${name}${suffix ? '-' + suffix : ''}.png`);
const promptFile = path.join(ep, 'prompts', `${name}.txt`);
const size = val('--size', flag('--hero') ? '1536x1024' : '1024x1024');

const usage = async () => {
  // dashboard usage is reported in cents (units / 5000); the token counter endpoint is rate limited
  try {
    const r = await fetch('https://a6.a6api.com/v1/dashboard/billing/usage', { headers: { Authorization: 'Bearer ' + process.env.A6API_KEY }, signal: AbortSignal.timeout(30000) });
    return Math.round((await r.json()).total_usage * 5000);
  } catch { return null; }
};

const helperArgs = [helper, ...refs.flatMap(r => ['--ref', r]), '--prompt-file', promptFile, '--out', out,
  '--route-id', '4995', '--expected-price', '0.0012', '--size', size, '--timeout-ms', '420000'];
if (!flag('--send')) {
  const r = spawnSync(process.execPath, helperArgs, { env: process.env, encoding: 'utf8' });
  process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || ''); process.exit(r.status ?? 1);
}
const before = await usage();
const r = spawnSync(process.execPath, [...helperArgs, '--send'], { env: process.env, encoding: 'utf8' });
const after = await usage();
const audit = out + '.audit.json';
let note = { name, billedUnits: after - before, billedUsdEstimate: (after - before) / 500000, usageBefore: before, usageAfter: after, exit: r.status };
if (fs.existsSync(audit)) {
  const a = JSON.parse(fs.readFileSync(audit, 'utf8'));
  Object.assign(a, { billedUnits: note.billedUnits, billedCostUsd: note.billedUsdEstimate, billingSource: 'token usage counter delta (500000 units = 1 USD); concurrent requests would blur this', promptFile: path.relative(repo, promptFile), size });
  fs.writeFileSync(audit, JSON.stringify(a, null, 2));
}
console.log(JSON.stringify(note));
console.log((r.stdout || '').trim().split('\n').pop());
if (r.stderr) console.error(r.stderr.slice(0, 600));
process.exit(r.status ?? 1);
