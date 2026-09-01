import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'dist', 'client');
const hubRoot = path.join(outputRoot, 'project');
const revision = process.env.VITE_GIT_COMMIT?.trim();
const pagesBasePath = (process.env.PAGES_BASE_PATH ?? '').replace(/\/$/, '');
const pagesOrigin = (
  process.env.PAGES_ORIGIN ?? 'https://0x63616c.github.io'
).replace(/\/$/, '');

if (!revision || !/^[0-9a-f]{40}$/i.test(revision)) {
  throw new Error('VITE_GIT_COMMIT must be a full 40-character Git commit SHA');
}
if (!/^\/[a-z0-9._-]+$/i.test(pagesBasePath)) {
  throw new Error('PAGES_BASE_PATH must be one safe repository path segment');
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await filesBelow(entryPath)));
    } else if (entry.isFile()) {
      paths.push(entryPath);
    }
  }

  return paths;
}

function displayTitle(relativePath) {
  return path
    .basename(relativePath, path.extname(relativePath))
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

async function indexedEntry(sourcePath, publishedPath, kind, mediaType) {
  const content = await readFile(sourcePath);
  return {
    id: publishedPath.replaceAll('/', ':'),
    title: displayTitle(publishedPath),
    kind,
    revision,
    revisionLabel: revision.slice(0, 12),
    evidenceState: null,
    evidenceLabel: 'Repository source; inspect the file for claim states',
    path: publishedPath,
    sha256: createHash('sha256').update(content).digest('hex'),
    mediaType,
    viewer: {
      mode: mediaType === 'text/markdown' ? 'browser-text' : 'download',
      status: 'available',
    },
  };
}

await mkdir(hubRoot, { recursive: true });
await cp(path.join(root, 'docs'), path.join(hubRoot, 'docs'), {
  recursive: true,
});
await cp(path.join(root, 'evidence'), path.join(hubRoot, 'evidence'), {
  recursive: true,
});

// Vinext's Vite base covers application assets, but its generated font preload
// and metadata URLs currently retain development-root values. Normalize those
// in every exported HTML document before it becomes a Pages artifact.
for (const htmlPath of (await filesBelow(outputRoot)).filter((file) =>
  file.endsWith('.html'),
)) {
  const html = await readFile(htmlPath, 'utf8');
  const normalized = html
    .replaceAll('href="/_next/', `href="${pagesBasePath}/_next/`)
    .replaceAll('src="/_next/', `src="${pagesBasePath}/_next/`)
    .replaceAll('url(/_next/', `url(${pagesBasePath}/_next/`)
    .replaceAll(
      'http://localhost:3000/og.png',
      `${pagesOrigin}${pagesBasePath}/og.png`,
    );
  await writeFile(htmlPath, normalized);
}

const documents = await Promise.all(
  (await filesBelow(path.join(root, 'docs')))
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const relative = path.relative(path.join(root, 'docs'), file);
      return indexedEntry(
        file,
        path.posix.join('docs', relative.split(path.sep).join('/')),
        'document',
        'text/markdown',
      );
    }),
);

const evidence = await Promise.all(
  (await filesBelow(path.join(root, 'evidence'))).map((file) => {
    const relative = path.relative(path.join(root, 'evidence'), file);
    return indexedEntry(
      file,
      path.posix.join('evidence', relative.split(path.sep).join('/')),
      'evidence-ledger',
      file.endsWith('.json') ? 'application/json' : 'application/octet-stream',
    );
  }),
);

const manifest = {
  schemaVersion: 1,
  project: 'TB4 KVM',
  revision,
  revisionLabel: revision.slice(0, 12),
  documents,
  evidence,
  artifacts: [],
  viewerCapabilities: {
    markdown: { status: 'available', mode: 'browser-text' },
    json: { status: 'available', mode: 'download' },
    pcbRender: { status: 'no-artifact', mode: 'image' },
    gerber: { status: 'not-implemented', mode: 'download' },
    step: { status: 'not-implemented', mode: 'download' },
    stl: { status: 'not-implemented', mode: 'download' },
    threeMf: { status: 'not-implemented', mode: 'download' },
  },
};

await writeFile(
  path.join(hubRoot, 'index.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
await writeFile(path.join(outputRoot, '.nojekyll'), '');

console.log(
  `Project hub assembled for ${revision}: ${documents.length} documents, ${evidence.length} evidence files, 0 hardware artifacts.`,
);
