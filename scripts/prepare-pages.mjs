import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryPath = '/monster-tech-correlation';
const outputDirectory = new URL('../dist/client/', import.meta.url);

for (const relativePath of ['index.html', '_headers']) {
  const filePath = new URL(relativePath, outputDirectory);
  let contents = await readFile(filePath, 'utf8');
  contents = contents.replaceAll('/_next/', `${repositoryPath}/_next/`);
  await writeFile(filePath, contents);
}

await writeFile(join(fileURLToPath(outputDirectory), '.nojekyll'), '');
