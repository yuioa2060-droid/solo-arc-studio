#!/usr/bin/env node
// Review stills of the current montage: node tools/stills.mjs <outDir> <seconds>[:label] ...
// One bundle + one browser for all frames. Filenames: s-<frame>-<label>.png (see stills_sheet.py).
import path from 'node:path';
import fsp from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../film');
const require = createRequire(path.join(root, 'package.json'));
const {bundle} = require('@remotion/bundler');
const {renderStill, selectComposition, openBrowser} = require('@remotion/renderer');
const {fixTs} = await import(path.join(root, 'fixts.mjs'));
const [outDir, ...specs] = process.argv.slice(2);
if (!outDir || !specs.length) throw new Error('usage: stills.mjs <outDir> <seconds>[:label] ...');
await fsp.mkdir(outDir, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public'), webpackOverride: fixTs});
const browser = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id: 'Ep3', puppeteerInstance: browser});
for (const spec of specs) {
  const [sec, label = ''] = spec.split(':');
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(sec) * composition.fps));
  const output = path.join(outDir, `s-${frame}-${label || sec}.png`);
  await renderStill({serveUrl, composition, frame, output, puppeteerInstance: browser, imageFormat: 'png'});
  console.log(output);
}
await browser.close(true);
