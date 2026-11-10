// uso: node scripts/stills.mjs <pasta> <t1> <t2> ...  (tempos em segundos; um bundle só)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [dir, ...ts] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Airbnb', chromiumOptions: {gl: 'angle'}});
for (const t of ts) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(parseFloat(t) * 24));
  await renderStill({serveUrl, composition, frame, output: path.join(dir, `t${t}.png`), chromiumOptions: {gl: 'angle'}});
  console.log('ok', t);
}
