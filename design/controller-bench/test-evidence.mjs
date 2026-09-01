import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const dir = path.dirname(new URL(import.meta.url).pathname);
const repoRoot = path.resolve(dir, '../..');
const base = JSON.parse(
  fs.readFileSync(path.join(dir, 'evidence.example.json'), 'utf8'),
);
const validator = path.join(dir, 'validate-evidence.mjs');
const evidenceRoot = fs.mkdtempSync(
  path.join(repoRoot, `.tmp-controller-bench-evidence-${process.pid}-`),
);
const jsonFiles = [];
const requiredKindsByCase = {
  B1: ['serial-log'],
  B2: ['serial-log'],
  B3: ['serial-log'],
  B4: ['serial-log'],
  B5: ['serial-log'],
  B6: ['serial-log'],
  B7: ['serial-log', 'supply-record'],
  B8: ['serial-log'],
  B9: ['serial-log', 'waveform'],
  B10: ['serial-log', 'waveform'],
  B11: ['serial-log'],
  B12: ['other'],
  B13: ['serial-log', 'photo'],
};

function artifact(kind, relativePath, content) {
  const absolutePath = path.join(evidenceRoot, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
  return {
    kind,
    path: path.relative(repoRoot, absolutePath),
    sha256: crypto.createHash('sha256').update(content).digest('hex'),
  };
}

function completedFixture() {
  const d = structuredClone(base);
  d.status = 'COMPLETED';
  d.identity = {
    boardOrderCode: 'SC1631',
    serialOrLocalId: 'bench-001',
    firmwareCommit: '1'.repeat(40),
    firmwareHash: null,
    firmwareArtifact: artifact('other', 'firmware.bin', 'firmware fixture'),
    wiringRevision: 'W1',
    wiringPhotoPaths: [artifact('photo', 'wiring.jpg', 'wiring fixture')],
  };
  d.identity.firmwareHash = d.identity.firmwareArtifact.sha256;
  d.toolVersions = { firmwareTool: 'pico-sdk-1', serialLogger: 'screen-1' };
  d.power.supplyDescription = '3.3 V current-limited bench supply';
  d.power.usbVbusAbsentEvidence = artifact(
    'supply-record',
    'usb-vbus.txt',
    'VBUS absent fixture',
  );
  d.power.isolationEvidence = artifact(
    'supply-record',
    'isolation.txt',
    'isolation fixture',
  );
  d.cases.forEach((testCase) => {
    testCase.result = 'PASS';
    testCase.notes = `${testCase.id} passed`;
    testCase.artifacts = requiredKindsByCase[testCase.id].map((kind) => ({
      ...artifact(
        kind,
        `${testCase.id}-${kind}.evidence`,
        `${testCase.id} ${kind} evidence`,
      ),
      caseId: testCase.id,
    }));
  });
  d.review = {
    status: 'REVIEWED',
    independentReviewer: 'independent-reviewer',
    attestation: 'reviewed exact record',
    evidencePath: artifact('other', 'review.md', 'review fixture'),
  };
  return d;
}

function run(data, name) {
  const file = path.join(
    os.tmpdir(),
    `tb4-kvm-evidence-${process.pid}-${name}.json`,
  );
  jsonFiles.push(file);
  fs.writeFileSync(file, JSON.stringify(data));
  return spawnSync(process.execPath, [validator, file], {
    encoding: 'utf8',
  });
}

const complete = completedFixture();
const valid = run(complete, 'valid');
if (valid.status !== 0) {
  console.error(valid.stderr || valid.stdout);
  console.error('Synthetic COMPLETED fixture unexpectedly failed');
  process.exitCode = 1;
} else {
  const mutants = [
    [
      'draft-reviewed',
      (d) => {
        d.status = 'DRAFT';
        d.review.status = 'REVIEWED';
      },
    ],
    [
      'extra-property',
      (d) => {
        d.extra = true;
      },
    ],
    [
      'boundary-true',
      (d) => {
        d.boundary.pd = true;
      },
    ],
    [
      'duplicate-case',
      (d) => {
        d.cases[1].id = d.cases[0].id;
      },
    ],
    [
      'missing-case',
      (d) => {
        d.cases.pop();
      },
    ],
    [
      'reordered-case',
      (d) => {
        [d.cases[0], d.cases[1]] = [d.cases[1], d.cases[0]];
      },
    ],
    [
      'completed-blocked-case',
      (d) => {
        d.cases[6].result = 'BLOCKED';
      },
    ],
    [
      'placeholder-tools',
      (d) => {
        d.toolVersions.serialLogger = 'PLACEHOLDER';
      },
    ],
    [
      'placeholder-power',
      (d) => {
        d.power.supplyDescription = 'PLACEHOLDER';
      },
    ],
    [
      'placeholder-photo',
      (d) => {
        d.identity.wiringPhotoPaths[0].path = 'PLACEHOLDER';
      },
    ],
    [
      'zero-firmware-hash',
      (d) => {
        d.identity.firmwareHash = '0'.repeat(64);
      },
    ],
    [
      'zero-artifact-hash',
      (d) => {
        d.cases[0].artifacts[0].sha256 = '0'.repeat(64);
      },
    ],
    [
      'missing-review',
      (d) => {
        d.review = {
          status: 'UNREVIEWED',
          independentReviewer: null,
          attestation: null,
          evidencePath: null,
        };
      },
    ],
    [
      'missing-artifact',
      (d) => {
        d.cases[0].artifacts[0].path = 'evidence/does-not-exist.log';
      },
    ],
    [
      'hash-mismatch',
      (d) => {
        d.cases[0].artifacts[0].sha256 = 'a'.repeat(64);
      },
    ],
    [
      'absolute-artifact-path',
      (d) => {
        d.cases[0].artifacts[0].path = path.join(evidenceRoot, 'B1.log');
      },
    ],
    [
      'traversal-artifact-path',
      (d) => {
        d.cases[0].artifacts[0].path = '../outside.log';
      },
    ],
    [
      'wrong-case-reuse',
      (d) => {
        d.cases[1].artifacts[0].path = d.cases[0].artifacts[0].path;
        d.cases[1].artifacts[0].sha256 = d.cases[0].artifacts[0].sha256;
        d.cases[1].artifacts[0].caseId = 'B2';
      },
    ],
    [
      'wrong-case-id',
      (d) => {
        d.cases[0].artifacts[0].caseId = 'B2';
      },
    ],
    [
      'wrong-evidence-kind',
      (d) => {
        d.cases.find((testCase) => testCase.id === 'B9').artifacts = [
          d.cases
            .find((testCase) => testCase.id === 'B9')
            .artifacts.find((artifact) => artifact.kind === 'serial-log'),
        ];
      },
    ],
  ];
  for (const [name, mutate] of mutants) {
    const data = structuredClone(name === 'draft-reviewed' ? base : complete);
    mutate(data);
    const result = run(data, String(name));
    if (result.status === 0) {
      console.error(`Mutant unexpectedly passed: ${String(name)}`);
      process.exitCode = 1;
      break;
    }
  }
  if (process.exitCode !== 1)
    console.log(
      `Controller bench evidence adversarial tests passed: ${mutants.length} rejected mutants`,
    );
}

for (const file of jsonFiles) fs.rmSync(file, { force: true });
fs.rmSync(evidenceRoot, { recursive: true, force: true });
process.exit(process.exitCode ?? 0);
