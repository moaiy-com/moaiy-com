import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

const FORBIDDEN_FILES = [
  'src/pages/debug.astro',
  'public/diagnostic.html',
  'public/test-r3f.html',
  'public/test-threejs.html',
];

const SCAN_ROOTS = ['src'];
const SCAN_EXTENSIONS = new Set([
  '.astro',
  '.html',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
]);

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

async function walkFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(absolutePath)));
      continue;
    }

    if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function checkBlankTargets(content, relativePath, issues) {
  const anchorTags = content.match(/<a\b[^>]*target="_blank"[^>]*>/g) || [];
  for (const tag of anchorTags) {
    const hasNoopener = /rel\s*=\s*["'][^"']*\bnoopener\b[^"']*["']/.test(tag);
    const hasNoreferrer = /rel\s*=\s*["'][^"']*\bnoreferrer\b[^"']*["']/.test(tag);
    if (!hasNoopener || !hasNoreferrer) {
      issues.push(
        `${relativePath}: target="_blank" anchor missing rel="noopener noreferrer"`,
      );
    }
  }
}

async function main() {
  const issues = [];

  for (const relativePath of FORBIDDEN_FILES) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (existsSync(absolutePath)) {
      issues.push(`${relativePath}: forbidden debug/diagnostic file exists`);
    }
  }

  for (const scanRoot of SCAN_ROOTS) {
    const scanRootPath = path.join(repoRoot, scanRoot);
    if (!existsSync(scanRootPath)) {
      continue;
    }

    const files = await walkFiles(scanRootPath);
    for (const absolutePath of files) {
      const relativePath = toPosixPath(path.relative(repoRoot, absolutePath));
      const content = await readFile(absolutePath, 'utf8');

      if (content.includes('href="#"')) {
        issues.push(`${relativePath}: contains placeholder link href="#"`);
      }

      checkBlankTargets(content, relativePath, issues);

      if (relativePath.startsWith('src/components/') && content.includes('console.log(')) {
        issues.push(`${relativePath}: console.log found in production component code`);
      }
    }
  }

  if (issues.length > 0) {
    console.error('Quality gate failed with the following issues:');
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log('Quality gate passed.');
}

main().catch((error) => {
  console.error('Quality gate execution failed:', error);
  process.exit(1);
});
