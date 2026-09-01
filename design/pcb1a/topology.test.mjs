import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {validateDocument} from './validate-topology.mjs';

const root = path.resolve(import.meta.dirname, '..', '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const base = read('design/pcb1a/topology.contract.json');
const references = {
  schema: read('design/pcb1a/topology.schema.json'),
  matrix: read('design/pcb1a-measurement-matrix.json'),
  prototype: read('design/channel-budget/prototype-a-example.json'),
  parts: read('design/parts-evidence/issue-5-inventory.json'),
};

function clone() {
  return structuredClone(base);
}

function rejects(mutator, text) {
  const candidate = clone();
  mutator(candidate);
  const errors = validateDocument(candidate, references);
  assert.ok(errors.some((error) => error.includes(text)), `expected rejection containing ${text}; got ${errors.join('; ')}`);
}

assert.deepEqual(validateDocument(base, references), []);
rejects((doc) => { delete doc.sourceContracts; }, "must have required property 'sourceContracts'");
rejects((doc) => { doc.orderReady = true; }, 'orderReady must remain false');
rejects((doc) => { doc.topology.ports.pop(); }, 'exactly 24 RF');
rejects((doc) => { doc.topology.ports[0].branch = 'HOST_B'; }, 'does not match');
rejects((doc) => { doc.measurementStates[2].id = 'B_SELECTED_A_OPEN'; }, 'exactly lock active branch');
rejects((doc) => { doc.measurementStates[2].activeBranch = 'HOST_B'; }, 'exactly lock active branch');
rejects((doc) => { doc.measurementStates[2].inactiveTermination.kind = 'open'; }, 'exactly lock active branch');
rejects((doc) => { doc.measurementStates[2].inactiveTermination.portIds.pop(); }, 'exactly lock active branch');
rejects((doc) => { doc.structureClasses[0].kind = '2X_THRU'; }, 'structure classes and unresolved instance rules');
rejects((doc) => { doc.componentSlots[0].modelStatus = 'AVAILABLE'; }, 'component slots must exactly');
rejects((doc) => { doc.componentSlots[0].id = 'UNRELATED_SLOT'; }, 'component slots must exactly');
rejects((doc) => { doc.claimBoundary.containsVbus = true; }, 'claim boundary containsVbus must be false');
rejects((doc) => { doc.topology.pathTemplates.hostToCommon[3] = 'MUX_COMMON_SLOT'; }, 'host-to-common path template');
rejects((doc) => { doc.topology.pathTemplates.hostBranchIsolation.directHostAToHostBNetAllowed = true; }, 'host branch isolation invariant');
rejects((doc) => { doc.structureClasses.push({...doc.structureClasses[0], id: 'EXTRA'}); }, 'structure classes and unresolved instance rules');
rejects((doc) => { doc.topology.paths = Array(8).fill(structuredClone(doc.topology.paths[0])); }, 'paths must exactly');
rejects((doc) => { doc.topology.referencePlanes[1].id = 'CABLE_END'; }, 'reference planes must exactly');
rejects((doc) => { doc.sourceContracts[2].path = 'missing.json'; }, 'source contracts must exactly');
rejects((doc) => { doc.controlAndPower.controls[0].safeDefault = 'ENABLED'; }, 'safe mux controls must exactly');
rejects((doc) => { doc.controlAndPower.allPathsDisabledByDefault = false; }, 'all paths must be disabled');
rejects((doc) => { doc.controlAndPower.noHostPowerPath = false; }, 'no host power path');
rejects((doc) => { doc.topology.branches[0].role = 'USB4_COMPLIANT_INPUT'; }, 'branch roles');
rejects((doc) => { doc.componentSlots[0].freezeStatus = 'FROZEN_FOR_ORDER'; }, 'freeze semantics');
rejects((doc) => { doc.reviewInputs.requiredBeforeOrder.pop(); }, 'review input gate requiredBeforeOrder');
rejects((doc) => { doc.structureClasses[0].notes = 'USB4 COMPLIANT AND ORDER READY'; }, 'structure classes and unresolved instance rules');
rejects((doc) => { doc.pathCampaignRule.expectedRemainingUnmeasuredPortCount = 11; }, 'one-path-at-a-time 4-port campaign rule');
rejects((doc) => { doc.pathCampaignRule.remainingUnmeasuredTerminationKind = 'open'; }, 'one-path-at-a-time 4-port campaign rule');
rejects((doc) => { doc.pathCampaignRule.inactiveBundlePortRule = 'ALL_OTHER_20_SINGLE_ENDED_CABLE_END_PORTS'; }, 'one-path-at-a-time 4-port campaign rule');
rejects((doc) => { doc.pathCampaignRule.stateApplicabilityRule = 'ALL_STATES'; }, 'one-path-at-a-time 4-port campaign rule');
assert.doesNotThrow(() => validateDocument(null, references));
assert.ok(validateDocument(null, references).length > 0, 'invalid documents return errors rather than throw');

console.log('PCB-1A topology tests passed: base contract plus 29 adversarial mutations rejected.');
