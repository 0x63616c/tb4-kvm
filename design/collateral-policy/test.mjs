import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const directory = path.dirname(new URL(import.meta.url).pathname);
const source = JSON.parse(fs.readFileSync(path.join(directory, 'inventory.example.json'), 'utf8'));
const validator = path.join(directory, 'validate.mjs');
const cases = [
  ['unknown hash', (inventory) => { inventory.records.find((record) => record.classification === 'UNKNOWN').hash = { value: 'a'.repeat(64), algorithm: 'sha256', permission: 'unknown', permissionEvidence: 'none', permissionEvidenceUrl: null, basis: 'mutant' }; }],
  ['prohibited hash', (inventory) => { inventory.records[0].classification = 'PROHIBITED'; inventory.records[0].terms = { status: 'PROHIBITED', url: null, evidence: 'mutant' }; inventory.records[0].redistribution = { status: 'FORBIDDEN', evidence: 'mutant' }; inventory.records[0].hash = { value: 'b'.repeat(64), algorithm: 'sha256', permission: 'unknown', permissionEvidence: 'none', permissionEvidenceUrl: null, basis: 'mutant' }; }],
  ['unknown permitted hash', (inventory) => { const record = inventory.records.find((candidate) => candidate.classification === 'UNKNOWN'); record.hash = { value: 'c'.repeat(64), algorithm: 'sha256', permission: 'permitted', permissionEvidence: 'explicit-license', permissionEvidenceUrl: 'https://example.com/license', basis: 'mutant' }; }],
  ['prohibited permitted hash', (inventory) => { const record = inventory.records[0]; record.classification = 'PROHIBITED'; record.terms = { status: 'PROHIBITED', url: null, evidence: 'mutant' }; record.redistribution = { status: 'FORBIDDEN', evidence: 'mutant' }; record.hash = { value: 'd'.repeat(64), algorithm: 'sha256', permission: 'permitted', permissionEvidence: 'written-permission', permissionEvidenceUrl: 'https://example.com/permission', basis: 'mutant' }; }],
  ['open without exact terms URL', (inventory) => { inventory.records.find((record) => record.classification === 'OPEN_REDISTRIBUTABLE').terms.url = null; }],
  ['accepted adoption with null fields', (inventory) => { inventory.policyStatus = 'ADOPTED'; inventory.ownerAdoption = { status: 'ACCEPTED', owner: null, date: null, evidence: null }; }],
];
for (const [name, mutate] of cases) {
  const caseName = String(name);
  const inventory = structuredClone(source);
  mutate(inventory);
  const file = path.join(os.tmpdir(), `tb4-kvm-collateral-${process.pid}-${caseName.replaceAll(' ', '-')}.json`);
  fs.writeFileSync(file, JSON.stringify(inventory));
  const result = spawnSync(process.execPath, [validator, file], { encoding: 'utf8' });
  fs.rmSync(file, { force: true });
  if (result.status === 0) {
    console.error(`Adversarial mutant unexpectedly passed: ${caseName}`);
    process.exit(1);
  }
}
console.log(`Collateral adversarial tests passed: ${cases.length} rejected mutants`);
