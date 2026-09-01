import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const ledger = JSON.parse(
  fs.readFileSync(path.join(root, 'evidence/ledger.json'), 'utf8'),
);
const failures = [];
const ids = new Set();
const canonicalStatuses = [
  'PROPOSED',
  'MODELED',
  'REVIEWED',
  'FABRICATED',
  'MEASURED',
  'VALIDATED',
  'BLOCKED',
];
const kindPrefixes = {
  objective: 'OBJ-',
  requirement: 'REQ-',
  decision: 'DEC-',
  gate: 'GATE-',
  test: 'TEST-',
  evidence: 'EVD-',
  artifact: 'ART-',
};
const allowedKinds = new Set(Object.keys(kindPrefixes));
const allowedStatuses = new Set(canonicalStatuses);
const allowedTopLevelFields = new Set([
  'schemaVersion',
  'project',
  'updated',
  'statusVocabulary',
  'records',
]);
const allowedRecordFields = new Set([
  'id',
  'kind',
  'title',
  'status',
  'owner',
  'evidence',
  'blockers',
]);
const trackedFiles = new Set(
  execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean),
);

function check(condition, message) {
  if (!condition) failures.push(message);
}

check(ledger.schemaVersion === 1, 'unsupported ledger schema');
check(
  JSON.stringify(ledger.statusVocabulary) === JSON.stringify(canonicalStatuses),
  'ledger status vocabulary must exactly match the canonical evidence-state enum',
);
for (const key of Object.keys(ledger)) {
  check(allowedTopLevelFields.has(key), `unknown top-level field ${key}`);
}
for (const record of ledger.records) {
  for (const key of Object.keys(record)) {
    check(allowedRecordFields.has(key), `${record.id}: unknown field ${key}`);
  }
  check(!ids.has(record.id), `duplicate id ${record.id}`);
  ids.add(record.id);
  check(
    allowedKinds.has(record.kind),
    `${record.id}: unknown kind ${record.kind}`,
  );
  check(
    allowedStatuses.has(record.status),
    `${record.id}: unknown status ${record.status}`,
  );
  check(
    record.id.startsWith(kindPrefixes[record.kind] ?? 'INVALID-'),
    `${record.id}: id prefix does not match kind ${record.kind}`,
  );
  check(record.owner?.length > 0, `${record.id}: owner is required`);
  check(
    Array.isArray(record.evidence),
    `${record.id}: evidence must be an array`,
  );
  check(
    Array.isArray(record.blockers),
    `${record.id}: blockers must be an array`,
  );
  for (const evidencePath of record.evidence ?? []) {
    const normalized = path.posix.normalize(evidencePath.replaceAll('\\', '/'));
    const absolute = path.resolve(root, normalized);
    const insideRoot = absolute.startsWith(`${root}${path.sep}`);
    check(
      !path.isAbsolute(evidencePath),
      `${record.id}: absolute evidence path is forbidden: ${evidencePath}`,
    );
    check(
      normalized === evidencePath && !normalized.startsWith('../'),
      `${record.id}: non-normalized or traversing evidence path ${evidencePath}`,
    );
    check(
      insideRoot,
      `${record.id}: evidence path escapes repository: ${evidencePath}`,
    );
    check(
      insideRoot && fs.existsSync(absolute) && fs.statSync(absolute).isFile(),
      `${record.id}: missing evidence file ${evidencePath}`,
    );
    if (insideRoot && fs.existsSync(absolute)) {
      check(
        fs.realpathSync(absolute).startsWith(`${root}${path.sep}`),
        `${record.id}: evidence symlink escapes repository: ${evidencePath}`,
      );
    }
    check(
      trackedFiles.has(normalized),
      `${record.id}: evidence file is not Git-tracked: ${evidencePath}`,
    );
  }
  if (record.status === 'VALIDATED') {
    check(
      record.evidence.length > 0,
      `${record.id}: validated record lacks evidence`,
    );
    check(
      record.blockers.length === 0,
      `${record.id}: validated record still has blockers`,
    );
  }
}

for (const record of ledger.records) {
  for (const blocker of record.blockers) {
    check(ids.has(blocker), `${record.id}: unknown blocker ${blocker}`);
    const blockerRecord = ledger.records.find((item) => item.id === blocker);
    check(
      blockerRecord?.status !== 'VALIDATED',
      `${record.id}: resolved blocker ${blocker} should be removed`,
    );
  }
}

if (failures.length) {
  console.error(`Evidence-ledger verification failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const counts = Object.fromEntries(
  ledger.statusVocabulary.map((status) => [
    status,
    ledger.records.filter((record) => record.status === status).length,
  ]),
);
console.log(
  `Evidence ledger verified: ${ledger.records.length} records. ${JSON.stringify(counts)}`,
);
