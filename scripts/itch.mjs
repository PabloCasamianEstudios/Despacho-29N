import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const dist = join(root, 'dist');
const zip = join(root, 'despacho-29n-itch.zip');

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(relative(dist, p).replaceAll('\\', '/'));
  }
};
walk(dist);

const leaks = files.filter((f) => f.endsWith('.js') && /__game|runDemo|demo=/.test(readFileSync(join(dist, f), 'utf8')));
if (leaks.length) throw new Error(`Código de desarrollo en el build: ${leaks.join(', ')}`);
if (!files.includes('index.html')) throw new Error('Falta index.html en dist');

rmSync(zip, { force: true });
const tar = process.platform === 'win32' && existsSync('C:\\Windows\\System32\\tar.exe') ? 'C:\\Windows\\System32\\tar.exe' : 'tar';
execFileSync(tar, ['-a', '-c', '-f', zip, '-C', dist, ...files]);
console.log(`${zip} (${files.length} archivos)`);
