import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {validateDocument} from './validate.mjs';

const directory = path.resolve(import.meta.dirname);
const root = path.resolve(directory, '..', '..');
const base = JSON.parse(fs.readFileSync(path.join(directory, 'contract.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, 'evidence/ledger.json'), 'utf8'));
const clone = () => structuredClone(base);
const rejects = (mutate, description) => {
  const candidate = clone(); mutate(candidate);
  const errors = validateDocument(candidate);
  if (!errors.length) throw new Error(`Adversarial mutant passed: ${description}`);
};

if (validateDocument(base).length) throw new Error('base contract must validate');
rejects((doc) => doc.portDomains.pop(), 'missing Type-C domain');
rejects((doc) => doc.futureSheets.pop(), 'missing future schematic sheet');
rejects((doc) => { doc.portDomains[0].sharesCcOrVbusWith = ['UPSTREAM_B']; }, 'joined host CC/VBUS');
rejects((doc) => { doc.controlledFacts[0].blockedAcceptance.review = 'accepted'; }, 'non-null unaccepted fact');
rejects((doc) => { doc.controlledFacts[0].selectedCandidate = 'Intel JHL9440'; }, 'candidate frozen as selected');
rejects((doc) => { doc.controlledFacts[1].issueIds = [19]; }, 'incorrect PD issue mapping');
rejects((doc) => { doc.controlledFacts[2].gateIds = ['GATE-PD-001']; }, 'incorrect power gate mapping');
rejects((doc) => { doc.controlledFacts[3].candidateIdentities = ['unreviewed substitute mux']; }, 'candidate replacement');
rejects((doc) => { doc.controlledFacts[4].collateralClass = 'PUBLIC'; }, 'incorrect recovery collateral class');
rejects((doc) => { doc.controlledFacts[5].permittedPublicMetadata.pop(); }, 'permitted public metadata drift');
rejects((doc) => { doc.controlledFacts[0].requiredSourceRevision = 'ANY_REVISION'; }, 'required source revision drift');
rejects((doc) => { doc.controlledFacts[3].requiredReviewTestModel.pop(); }, 'required SI evidence drift');
rejects((doc) => { doc.captureAuthorized = true; }, 'capture enabled');
rejects((doc) => { doc.orderReady = true; }, 'order enabled');
rejects((doc) => { delete doc.controlledFacts[5].collateralClass; }, 'missing collateral evidence');
rejects((doc) => { doc.controlledFacts[5].requiredReviewTestModel = []; }, 'missing redistribution evidence');
rejects((doc) => { doc.controlledFacts[4].requiredReviewTestModel = []; }, 'missing recovery evidence');
rejects((doc) => { doc.controlledFacts[3].requiredReviewTestModel = []; }, 'missing SI evidence');
rejects((doc) => { doc.controlledFacts[2].requiredReviewTestModel = []; }, 'missing power evidence');
rejects((doc) => { doc.safeDefaults.onMcuReset = 'HOST_A_ENABLED'; }, 'unsafe reset default');
rejects((doc) => { doc.safeDefaults.hostAVbusSource = 'ENABLED'; }, 'unsafe VBUS default');
rejects((doc) => { doc.integratedGates[0].status = 'REVIEWED'; }, 'unblocked integrated gate');
rejects((doc) => { doc.claimBoundary.schematicEntryAcceptance = 'accepted'; }, 'schematic entry acceptance');

const ledgerWithUnblockedGate = structuredClone(ledger);
ledgerWithUnblockedGate.records.find((record) => record.id === 'GATE-INT-001').status = 'REVIEWED';
if (!validateDocument(base, {ledger:ledgerWithUnblockedGate}).some((error) => error.includes('GATE-INT-001'))) throw new Error('ledger gate drift unexpectedly passed');
const ledgerWithoutGate = structuredClone(ledger);
ledgerWithoutGate.records = ledgerWithoutGate.records.filter((record) => record.id !== 'GATE-SI-001');
if (!validateDocument(base, {ledger:ledgerWithoutGate}).some((error) => error.includes('GATE-SI-001'))) throw new Error('missing ledger gate unexpectedly passed');
const ledgerWithoutPrototypeBlocker = structuredClone(ledger);
ledgerWithoutPrototypeBlocker.records.find((record) => record.id === 'ART-INT-PROTOTYPE-001').blockers = ['GATE-INT-001'];
if (!validateDocument(base, {ledger:ledgerWithoutPrototypeBlocker}).some((error) => error.includes('ART-INT-PROTOTYPE-001'))) throw new Error('ledger prototype blocker drift unexpectedly passed');

const malformed = path.join(os.tmpdir(), `tb4-kvm-integrated-${process.pid}.json`);
fs.writeFileSync(malformed, '{');
const result = spawnSync(process.execPath, [path.join(directory, 'validate.mjs'), malformed], {encoding:'utf8'});
fs.rmSync(malformed, {force:true});
if (result.status === 0) throw new Error('malformed input unexpectedly passed');
console.log('Integrated schematic-entry adversarial tests passed: 23 rejected contract mutants, 3 injected ledger drifts, plus malformed input.');
