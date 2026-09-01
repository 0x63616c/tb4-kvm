import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const ledger = JSON.parse(
  fs.readFileSync(path.join(root, 'evidence/ledger.json'), 'utf8'),
);
const failures = [];
const ids = new Set();
const allowedKinds = new Set([
  'objective',
  'requirement',
  'decision',
  'gate',
  'test',
  'evidence',
  'artifact',
]);
const allowedStatuses = new Set(ledger.statusVocabulary);

function check(condition, message) {
  if (!condition) failures.push(message);
}

check(ledger.schemaVersion === 1, 'unsupported ledger schema');
for (const record of ledger.records) {
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
    check(
      fs.existsSync(path.join(root, evidencePath)),
      `${record.id}: missing evidence file ${evidencePath}`,
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
