import fs from 'node:fs';
import path from 'node:path';

const file =
  process.argv[2] ||
  path.join(path.dirname(new URL(import.meta.url).pathname), 'inventory.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const failures = [];
if (
  data.schemaVersion !== 1 ||
  data.asOf !== '2026-09-01' ||
  data.status !== 'PROPOSED'
)
  failures.push('header must be schema 1, as-of 2026-09-01, PROPOSED');
if (!Array.isArray(data.globalNonClaims) || data.globalNonClaims.length < 3)
  failures.push('global non-claims are required');
const ids = new Set();
for (const tool of data.tools ?? []) {
  if (ids.has(tool.id)) failures.push(`duplicate tool id: ${tool.id}`);
  ids.add(tool.id);
  for (const field of [
    'id',
    'class',
    'phase',
    'proves',
    'cannotProve',
    'enterWhen',
    'sourceUrls',
    'versionNote',
  ])
    if (!tool[field])
      failures.push(`${tool.id ?? '<unknown>'}: missing ${field}`);
  if (
    !Array.isArray(tool.proves) ||
    !tool.proves.length ||
    !Array.isArray(tool.cannotProve) ||
    !tool.cannotProve.length
  )
    failures.push(`${tool.id}: proves/cannotProve must be non-empty arrays`);
  if (
    !Array.isArray(tool.sourceUrls) ||
    tool.sourceUrls.some((url) => !url.startsWith('https://'))
  )
    failures.push(`${tool.id}: sourceUrls must be HTTPS`);
}
if (data.tools?.length < 10)
  failures.push('inventory must cover the ten requested tool families');
if (failures.length) {
  console.error(`Validation-tool inventory failed (${failures.length})`);
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log(`Validation-tool inventory validated: ${data.tools.length} tools`);
