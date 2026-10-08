import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const assets=['/','/index.html','/icon.svg','/manifest.webmanifest','/licenses.txt',...(await readdir('dist/assets')).map(f=>'/assets/'+f)];
const index=await readFile('dist/index.html','utf8');
const version=createHash('sha256').update(index).digest('hex').slice(0,12);
const source=(await readFile('public/sw.js','utf8')).replace("const CACHE='hue-dev';",`const CACHE='hue-${version}';`).replace(/const ASSETS=\[.*?\];/,`const ASSETS=${JSON.stringify(assets)};`);
await writeFile('dist/sw.js',source);console.log(`Offline cache prepared: ${assets.length} assets.`);
