import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const projectRoot = resolve(import.meta.dirname, '..');
const sourceFont = resolve(
  process.env.FONT_SOURCE ?? '/home/Juliet/tmp/fonts/LXGWWenKai-Light.ttf',
);
const existingText = resolve(
  process.env.FONT_TEXT ?? '/home/Juliet/tmp/all_text.txt',
);
const outputFont = resolve(
  process.env.FONT_OUTPUT ?? join(projectRoot, 'public/fonts/LXGWWenKai-Regular-subset.woff2'),
);

if (!existsSync(sourceFont)) {
  console.warn(`Font source not found; keeping the existing subset font: ${sourceFont}`);
  process.exit(0);
}

const textExtensions = new Set([
  '.astro', '.css', '.html', '.js', '.jsx', '.json', '.md', '.mdx',
  '.mjs', '.ts', '.tsx', '.txt', '.yaml', '.yml',
]);
const ignoredDirectories = new Set(['.astro', 'dist', 'node_modules', '.git']);

function collectText(directory) {
  let text = '';
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        text += collectText(join(directory, entry.name));
      }
      continue;
    }
    if (textExtensions.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
      const file = join(directory, entry.name);
      text += `\n${relative(projectRoot, file)}\n`;
      text += readFileSync(file, 'utf8');
    }
  }
  return text;
}

// Keep common browser/UI characters even if they are generated at runtime.
const runtimeCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?()[]{}<>+-=*/_%&#@|\\\'"`~\n';
let text = runtimeCharacters + collectText(join(projectRoot, 'src'));
if (existsSync(existingText)) {
  text += `\n${readFileSync(existingText, 'utf8')}`;
}

const tempDirectory = mkdtempSync(join(tmpdir(), 'neojuliet-font-'));
const textFile = join(tempDirectory, 'characters.txt');
writeFileSync(textFile, text, 'utf8');

const result = spawnSync('pyftsubset', [
  sourceFont,
  `--text-file=${textFile}`,
  `--output-file=${outputFont}`,
  '--flavor=woff2',
  '--layout-features=*',
  '--name-IDs=*',
  '--glyph-names',
  '--symbol-cmap',
  '--legacy-cmap',
  '--notdef-glyph',
  '--notdef-outline',
  '--recommended-glyphs',
], { encoding: 'utf8' });

rmSync(tempDirectory, { recursive: true, force: true });

if (result.status !== 0) {
  process.stderr.write(result.stderr || 'pyftsubset failed\n');
  process.exit(result.status ?? 1);
}

console.log(`Subset font generated: ${outputFont}`);
