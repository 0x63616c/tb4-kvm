import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2] || path.join(path.dirname(new URL(import.meta.url).pathname), 'inventory.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const failures = [];
if (data.schemaVersion !== 1 || data.issue !== 6 || data.status !== 'PROPOSED_BLOCKED') failures.push('header must identify issue 6 and PROPOSED_BLOCKED status');
if (data.contract.minFrequencyGHz !== 20 || data.contract.minPorts !== 4 || !data.contract.requiresFixtureRemoval || !data.contract.requiresMixedMode || !data.contract.requiresUncertainty || !data.contract.requiresPublicRawDataTerms) failures.push('contract minimums are incomplete');
const ids = new Set();
for (const candidate of data.candidates) {
  if (ids.has(candidate.id)) failures.push(`duplicate candidate id: ${candidate.id}`);
  ids.add(candidate.id);
  if (!candidate.sourceUrl?.startsWith('https://') || candidate.accessedDate !== data.captureDate || candidate.status !== 'PROPOSED_BLOCKED') failures.push(`${candidate.id}: source/date/status invalid`);
  if (candidate.frequencyGHz !== null && candidate.frequencyGHz < data.contract.minFrequencyGHz) failures.push(`${candidate.id}: below minimum frequency`);
  if (candidate.ports !== null && candidate.ports < data.contract.minPorts) failures.push(`${candidate.id}: below minimum ports`);
  for (const key of ['calibration', 'fixtureRemoval', 'mixedMode', 'uncertainty', 'publicRawDataTerms']) if (!(key in candidate.contractFields)) failures.push(`${candidate.id}: missing contract field ${key}`);
}
if (failures.length) { console.error(`Measurement route validation failed (${failures.length})`); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log(`Measurement route inventory validated: ${data.candidates.length} candidates`);
