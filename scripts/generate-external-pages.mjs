import { readdir, writeFile } from 'node:fs/promises';
import { join, relative, extname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/external-pages', import.meta.url));
const output = fileURLToPath(new URL('../public/external-pages.json', import.meta.url));

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectHtmlFiles(path));
    } else if (entry.isFile() && ['.html', '.htm'].includes(extname(entry.name).toLowerCase())) {
      files.push(path);
    }
  }
  return files;
}

const files = await collectHtmlFiles(root).catch((error) => {
  if (error.code === 'ENOENT') return [];
  throw error;
});
const pages = files
  .map((file) => `/external-pages/${posix.join(...relative(root, file).split('\\'))}`)
  .sort((a, b) => a.localeCompare(b));

await writeFile(output, `${JSON.stringify(pages, null, 2)}\n`, 'utf8');
console.log(`Generated ${pages.length} external HTML page path(s).`);
