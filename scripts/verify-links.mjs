import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function headingSlug(text) {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

for (const relative of files.filter((file) => file.endsWith('.md'))) {
  const absolute = path.join(root, relative);
  const source = fs.readFileSync(absolute, 'utf8');
  const links = [...source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(
    (match) => match[1],
  );

  for (const target of links) {
    if (/^(https?:|mailto:)/.test(target)) continue;
    const [filePart, fragment] = target.split('#');
    const targetPath = filePart
      ? path.resolve(path.dirname(absolute), filePart)
      : absolute;
    check(
      targetPath.startsWith(`${root}${path.sep}`),
      `${relative}: link escapes repository: ${target}`,
    );
    check(
      fs.existsSync(targetPath) && fs.statSync(targetPath).isFile(),
      `${relative}: missing link target ${target}`,
    );
    if (fragment && fs.existsSync(targetPath)) {
      const targetSource = fs.readFileSync(targetPath, 'utf8');
      const slugs = new Set(
        [...targetSource.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) =>
          headingSlug(match[1]),
        ),
      );
      check(
        slugs.has(fragment),
        `${relative}: missing heading #${fragment} in ${filePart || relative}`,
      );
    }
  }
}

const appSource = fs.readFileSync(
  path.join(root, 'app/field-guide.tsx'),
  'utf8',
);
const ids = new Set(
  [...appSource.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]),
);
for (const [, fragment] of appSource.matchAll(/href="#([^"]+)"/g)) {
  check(
    ids.has(fragment),
    `app/field-guide.tsx: navigation target #${fragment} does not exist`,
  );
}

if (failures.length) {
  console.error(`Link verification failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Links verified across ${files.filter((file) => file.endsWith('.md')).length} Markdown files and the interactive page.`,
);
