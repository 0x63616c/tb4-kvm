import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const scaffoldPath = path.join(root, 'hardware/kicad/scaffold.json');
const requiredDocs = [
  'hardware/README.md',
  'hardware/kicad/README.md',
  'hardware/releases/README.md',
];
const requiredBlockers = [
  'GATE-INT-001',
  'GATE-DS-001',
  'GATE-PD-001',
  'GATE-SI-001',
  'GATE-FAB-001',
  'GATE-PCB1-PARTS-001',
  'GATE-COLLATERAL-ADOPTION-001',
];
const requiredSourceKeys = ['bom', 'pcb', 'schematic', 'stackup'];
const requiredOutputKeys = [
  'drills',
  'gerbers',
  'manifest',
  'netlist',
  'placement',
];
const allowedBlockedHardwareFiles = [
  'hardware/README.md',
  'hardware/kicad/README.md',
  'hardware/kicad/scaffold.json',
  'hardware/releases/README.md',
];

const isSafeRelative = (value) =>
  typeof value === 'string' &&
  value.length > 0 &&
  !path.isAbsolute(value) &&
  !value.split('/').includes('..') &&
  !value.includes('\\') &&
  !value.startsWith('./');

export function validateScaffold({
  scaffold,
  ledger,
  hardwareFiles,
  pagesAssemblerSource,
}) {
  const failures = [];
  const check = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const records = new Map(
    (ledger?.records ?? []).map((record) => [record.id, record]),
  );
  check(scaffold?.schemaVersion === 1, 'schemaVersion must be 1');
  check(scaffold?.status === 'BLOCKED', 'scaffold status must remain BLOCKED');
  check(scaffold?.orderReady === false, 'scaffold must not be order-ready');
  for (const section of ['source', 'outputs']) {
    check(
      scaffold?.[section] && typeof scaffold[section] === 'object',
      `${section} section missing`,
    );
    for (const [name, value] of Object.entries(scaffold?.[section] ?? {})) {
      check(
        value === null,
        `${section}.${name} must be null until a real revision exists`,
      );
      if (value !== null)
        check(isSafeRelative(value), `unsafe ${section} path: ${value}`);
    }
  }
  check(
    JSON.stringify(
      Object.keys(scaffold?.source ?? {}).sort((a, b) => a.localeCompare(b)),
    ) === JSON.stringify(requiredSourceKeys),
    `source keys must be exactly ${requiredSourceKeys.join(', ')}`,
  );
  check(
    JSON.stringify(
      Object.keys(scaffold?.outputs ?? {}).sort((a, b) => a.localeCompare(b)),
    ) === JSON.stringify(requiredOutputKeys),
    `output keys must be exactly ${requiredOutputKeys.join(', ')}`,
  );
  check(
    JSON.stringify(scaffold?.blockers) === JSON.stringify(requiredBlockers),
    'scaffold blockers must match the real release gates',
  );
  check(
    JSON.stringify(scaffold?.blockingIssueNumbers) ===
      JSON.stringify([19, 20, 21, 22, 53]),
    'blockingIssueNumbers must be [19, 20, 21, 22, 53]',
  );
  for (const blocker of scaffold?.blockers ?? []) {
    const record = records.get(blocker);
    check(record?.kind === 'gate', `blocker is not a ledger gate: ${blocker}`);
    check(
      record?.status === 'BLOCKED',
      `blocker is not currently blocked: ${blocker}`,
    );
  }
  check(
    scaffold?.toolchain?.observedLocal?.version === '10.0.4',
    'observed KiCad version must be 10.0.4',
  );
  check(
    scaffold?.toolchain?.observedLocal?.executable ===
      '/Applications/KiCad.app/Contents/MacOS/kicad-cli',
    'observed KiCad executable changed',
  );
  check(
    scaffold?.toolchain?.documentedReference?.version === '9.0.9',
    'documented KiCad reference must remain 9.0.9',
  );
  check(
    scaffold?.toolchain?.compatibilityClaim === false,
    'KiCad compatibility must not be claimed',
  );
  check(
    scaffold?.pagesExposure?.indexed === false,
    'scaffold must not be Pages-indexed',
  );
  check(
    Array.isArray(scaffold?.pagesExposure?.artifacts) &&
      scaffold.pagesExposure.artifacts.length === 0,
    'scaffold Pages artifacts must be empty',
  );
  check(
    /artifacts\s*:\s*\[\s*\]/.test(pagesAssemblerSource ?? ''),
    'Pages assembler must retain artifacts: []',
  );
  check(
    !/["'`]hardware(?:[\\/]|["'`])/.test(pagesAssemblerSource ?? ''),
    'Pages assembler must not scan or copy hardware',
  );

  check(
    JSON.stringify([...hardwareFiles].sort((a, b) => a.localeCompare(b))) ===
      JSON.stringify(
        [...allowedBlockedHardwareFiles].sort((a, b) => a.localeCompare(b)),
      ),
    'blocked hardware workspace must contain exactly the four policy/scaffold files',
  );
  return failures;
}

const walk = (directory) => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const failures = [];
  for (const file of requiredDocs.concat('hardware/kicad/scaffold.json'))
    if (!fs.existsSync(path.join(root, file)))
      failures.push(`missing required file: ${file}`);
  let scaffold;
  let ledger;
  try {
    scaffold = JSON.parse(fs.readFileSync(scaffoldPath, 'utf8'));
    ledger = JSON.parse(
      fs.readFileSync(path.join(root, 'evidence/ledger.json'), 'utf8'),
    );
  } catch (error) {
    failures.push(`required JSON is unreadable: ${error.message}`);
  }
  const files = walk(path.join(root, 'hardware')).map((file) =>
    path.relative(root, file).split(path.sep).join('/'),
  );
  const pagesAssemblerSource = fs.readFileSync(
    path.join(root, 'scripts/assemble-pages-hub.mjs'),
    'utf8',
  );
  failures.push(
    ...validateScaffold({
      scaffold,
      ledger,
      hardwareFiles: files,
      pagesAssemblerSource,
    }),
  );
  if (failures.length) {
    console.error(`Hardware scaffold verification failed (${failures.length})`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(
    'Hardware scaffold verified: BLOCKED, non-electrical, non-orderable, and not Pages-indexed.',
  );
}
