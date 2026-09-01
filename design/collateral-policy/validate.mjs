import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const directory = path.dirname(new URL(import.meta.url).pathname);
const schema = JSON.parse(fs.readFileSync(path.join(directory, 'schema.json'), 'utf8'));
const inventoryPath = process.argv[2] || path.join(directory, 'inventory.example.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const valid = ajv.validate(schema, inventory);
const failures = valid ? [] : ajv.errors.map((error) => `${error.instancePath || '/'} ${error.message}`);

const adoption = inventory.ownerAdoption;
if (adoption) {
  if (adoption.status === 'PENDING' && (adoption.owner !== null || adoption.date !== null || adoption.evidence !== null)) failures.push('/ownerAdoption: PENDING requires null owner, date, and evidence');
  if (adoption.status === 'ACCEPTED' && (!adoption.owner?.trim() || adoption.date === null || !adoption.evidence?.trim() || inventory.policyStatus !== 'ADOPTED')) failures.push('/ownerAdoption: ACCEPTED requires owner, date, evidence, and ADOPTED policyStatus');
}

const restricted = new Set(['REGISTRATION_GATED', 'NDA_CONFIDENTIAL', 'OWNER_PRIVATE_METADATA_ONLY', 'PROHIBITED', 'UNKNOWN']);
const consistency = {
  PUBLIC_LINK_ONLY: [['UNKNOWN'], ['UNKNOWN']],
  OPEN_REDISTRIBUTABLE: [['PUBLIC_LICENSE', 'PROJECT_LICENSE', 'WRITTEN_PERMISSION'], ['PERMITTED']],
  REGISTRATION_GATED: [['GATED'], ['FORBIDDEN_UNTIL_CONFIRMED']],
  NDA_CONFIDENTIAL: [['NDA'], ['FORBIDDEN', 'FORBIDDEN_UNTIL_CONFIRMED']],
  OWNER_PRIVATE_METADATA_ONLY: [['PRIVATE'], ['FORBIDDEN']],
  PROHIBITED: [['PROHIBITED'], ['FORBIDDEN']],
  UNKNOWN: [['UNKNOWN'], ['UNKNOWN']],
};
for (const [index, record] of inventory.records.entries()) {
  const label = `/records/${index} (${record.id})`;
  const hasArtifact = record.repository.artifactPath !== null;
  if (restricted.has(record.classification) && hasArtifact) failures.push(`${label}: restricted classification cannot have repository.artifactPath`);
  if (record.classification === 'OPEN_REDISTRIBUTABLE' && (record.redistribution.status !== 'PERMITTED' || !['PUBLIC_LICENSE', 'PROJECT_LICENSE', 'WRITTEN_PERMISSION'].includes(record.terms.status))) failures.push(`${label}: open redistribution requires explicit license or written permission`);
  if (record.classification === 'PUBLIC_LINK_ONLY' && (record.redistribution.status !== 'UNKNOWN' || hasArtifact)) failures.push(`${label}: link-only records must have unknown redistribution and no artifact`);
  const [termStatuses, redistributionStatuses] = consistency[record.classification];
  if (!termStatuses.includes(record.terms.status) || !redistributionStatuses.includes(record.redistribution.status)) failures.push(`${label}: classification, terms, and redistribution status are inconsistent`);
  if (record.classification === 'OPEN_REDISTRIBUTABLE' && (record.terms.url === null || record.redistribution.status !== 'PERMITTED')) failures.push(`${label}: open redistribution requires a non-null exact terms URL and permitted status`);
  if (record.hash.value !== null && (record.hash.algorithm !== 'sha256' || record.hash.permission !== 'permitted' || !['explicit-license', 'written-permission'].includes(record.hash.permissionEvidence) || record.hash.permissionEvidenceUrl === null)) failures.push(`${label}: a hash requires sha256, explicit permission, and governing evidence URL`);
  if (record.hash.permission === 'permitted' && (record.hash.permissionEvidence === 'none' || record.hash.permissionEvidence === 'not-applicable')) failures.push(`${label}: permitted hash cannot use absent evidence`);
  if (['UNKNOWN', 'PROHIBITED'].includes(record.classification) && record.hash.value !== null) failures.push(`${label}: UNKNOWN and PROHIBITED records must never retain a hash`);
  if (record.hash.value === null && record.hash.permission === 'permitted') failures.push(`${label}: permitted hash must include a value`);
  if (record.review.status === 'REVIEWED' && (!record.review.independentReviewer || !record.review.attestation)) failures.push(`${label}: reviewed record requires independent reviewer and attestation`);
  if (record.review.independentReviewer === record.review.author && record.review.independentReviewer !== null) failures.push(`${label}: author cannot be independent reviewer`);
  if (!['OWNER_PRIVATE_METADATA_ONLY', 'UNKNOWN'].includes(record.classification) && record.sourceUrl === null) failures.push(`${label}: sourceUrl is required unless owner-private or unresolved`);
}
if (new Set(inventory.records.map((record) => record.id)).size !== inventory.records.length) failures.push('/records: ids must be unique');
if (failures.length) { console.error(`Collateral inventory validation failed (${failures.length})`); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`Collateral inventory validated: ${inventory.records.length} records`);
