import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
);

const raw = execFileSync(
  'npm',
  ['sbom', '--omit=dev', '--sbom-format=cyclonedx'],
  { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
);
const sbom = JSON.parse(raw);
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

check(sbom.bomFormat === 'CycloneDX', 'SBOM must be CycloneDX');
check(typeof sbom.specVersion === 'string', 'SBOM spec version is missing');
check(
  sbom.metadata?.component?.purl ===
    `pkg:npm/${packageJson.name}@${packageJson.version}`,
  'SBOM root package URL does not match package name/version',
);
check(
  Array.isArray(sbom.components) && sbom.components.length > 0,
  'SBOM contains no dependency components',
);
check(
  Array.isArray(sbom.dependencies) && sbom.dependencies.length > 0,
  'SBOM contains no dependency graph',
);

if (failures.length) {
  console.error(`SBOM verification failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `CycloneDX ${sbom.specVersion} SBOM generated and parsed: ${sbom.components.length} runtime components.`,
);
