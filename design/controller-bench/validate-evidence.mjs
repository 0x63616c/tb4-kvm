import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const dir = path.dirname(new URL(import.meta.url).pathname);
const repoRoot = path.resolve(dir, '../..');
const file = process.argv[2] || path.join(dir, 'evidence.example.json');
let data;
let schema;
const failures = [];

try {
  data = JSON.parse(fs.readFileSync(file, 'utf8'));
  schema = JSON.parse(
    fs.readFileSync(path.join(dir, 'evidence-schema.json'), 'utf8'),
  );
} catch (error) {
  console.error(
    `Controller bench evidence validation failed: ${error.message}`,
  );
  process.exit(1);
}

let structureValid = false;
try {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  structureValid = ajv.validate(schema, data);
  if (!structureValid) {
    failures.push(
      ...(ajv.errors ?? []).map(
        (error) => `${error.instancePath || '/'} ${error.message}`,
      ),
    );
  }
} catch (error) {
  console.error(
    `Controller bench evidence validation failed: invalid schema or structure: ${error.message}`,
  );
  process.exit(1);
}

if (structureValid) {
  const expected = Array.from({ length: 13 }, (_, i) => `B${i + 1}`);
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
  if (JSON.stringify(data.cases.map((c) => c.id)) !== JSON.stringify(expected))
    failures.push(
      'cases must contain B1 through B13 exactly once and in order',
    );

  if (data.status === 'DRAFT') {
    if (data.review.status === 'REVIEWED')
      failures.push('DRAFT cannot be REVIEWED');
  } else if (data.status === 'COMPLETED') {
    if (data.cases.some((c) => c.result !== 'PASS'))
      failures.push('COMPLETED requires PASS for every B1-B13 case');
    if (
      Object.values(data.identity).some((value) => value === 'PLACEHOLDER') ||
      /^0+$/.test(data.identity.firmwareHash) ||
      /^0+$/.test(data.identity.firmwareCommit)
    )
      failures.push('COMPLETED cannot use placeholder or all-zero identity');
    if (
      Object.values(data.toolVersions).some(
        (value) => value === 'PLACEHOLDER',
      ) ||
      data.power.supplyDescription === 'PLACEHOLDER'
    )
      failures.push(
        'COMPLETED cannot use placeholder tools or supply description',
      );
    if (
      data.review.status !== 'REVIEWED' ||
      !data.review.independentReviewer?.trim() ||
      !data.review.attestation?.trim() ||
      !data.review.evidencePath
    )
      failures.push(
        'COMPLETED requires independent reviewer, attestation, and review evidence',
      );

    const artifacts = [
      data.identity.firmwareArtifact,
      ...data.identity.wiringPhotoPaths,
      data.power.usbVbusAbsentEvidence,
      data.power.isolationEvidence,
      ...data.cases.flatMap((testCase) => testCase.artifacts),
      data.review.evidencePath,
    ];
    const seenCasePaths = new Map();
    for (const testCase of data.cases) {
      if (testCase.notes.includes('PLACEHOLDER'))
        failures.push(`${testCase.id}: completed notes cannot be placeholder`);
      for (const artifact of testCase.artifacts) {
        if (artifact.caseId !== testCase.id)
          failures.push(
            `${testCase.id}: every case artifact must identify its owning case`,
          );
        const previousCase = seenCasePaths.get(artifact.path);
        if (previousCase && previousCase !== testCase.id)
          failures.push(
            `${testCase.id}: case evidence path is reused by ${previousCase}`,
          );
        else seenCasePaths.set(artifact.path, testCase.id);
      }
      const kinds = new Set(
        testCase.artifacts.map((artifact) => artifact.kind),
      );
      for (const requiredKind of requiredKindsByCase[testCase.id] ?? [])
        if (!kinds.has(requiredKind))
          failures.push(
            `${testCase.id}: completed evidence requires ${requiredKind}`,
          );
    }
    for (const artifact of artifacts) validateArtifact(artifact);
    if (data.identity.firmwareHash !== data.identity.firmwareArtifact.sha256)
      failures.push('firmwareHash must match firmwareArtifact.sha256');
  }
}

function validateArtifact(artifact) {
  if (
    !artifact ||
    artifact.path === 'PLACEHOLDER' ||
    !/^[a-f0-9]{64}$/.test(artifact.sha256 || '') ||
    /^0+$/.test(artifact.sha256 || '')
  ) {
    failures.push('COMPLETED requires non-placeholder hashed evidence paths');
    return;
  }
  if (path.isAbsolute(artifact.path)) {
    failures.push(`artifact path must be repo-relative: ${artifact.path}`);
    return;
  }
  const resolved = path.resolve(repoRoot, artifact.path);
  if (resolved === repoRoot || !resolved.startsWith(`${repoRoot}${path.sep}`)) {
    failures.push(`artifact path escapes repository: ${artifact.path}`);
    return;
  }
  let realPath;
  try {
    realPath = fs.realpathSync(resolved);
    if (
      realPath === repoRoot ||
      !realPath.startsWith(`${repoRoot}${path.sep}`)
    ) {
      failures.push(
        `artifact path resolves outside repository: ${artifact.path}`,
      );
      return;
    }
    if (!fs.statSync(realPath).isFile()) {
      failures.push(`artifact path is not a regular file: ${artifact.path}`);
      return;
    }
    const actualHash = crypto
      .createHash('sha256')
      .update(fs.readFileSync(realPath))
      .digest('hex');
    if (actualHash !== artifact.sha256)
      failures.push(`artifact SHA-256 mismatch: ${artifact.path}`);
  } catch {
    failures.push(`artifact file is not readable: ${artifact.path}`);
  }
}

if (failures.length) {
  console.error(
    `Controller bench evidence validation failed (${failures.length})`,
  );
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(
  `Controller bench evidence validated: ${data.status}; ${data.cases.length} cases`,
);
