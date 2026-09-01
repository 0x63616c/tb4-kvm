import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildTopologySelection } from '../lib/site-topology-model.mjs';

const contract = JSON.parse(
  fs.readFileSync('design/pcb1a/topology.contract.json', 'utf8'),
);
const source = fs.readFileSync('components/site-topology-explorer.tsx', 'utf8');
const fieldGuide = fs.readFileSync('app/field-guide.tsx', 'utf8');
const css = fs.readFileSync('app/globals.css', 'utf8');

assert.equal(contract.status, 'PROPOSED');
assert.equal(contract.orderReady, false);
assert.equal(contract.claimBoundary.purpose, 'RF_ONLY_MUX_COUPON');
assert.equal(contract.topology.laneIds.length, 4);
assert.equal(contract.topology.branches.length, 3);
assert.equal(contract.topology.ports.length, 24);
assert.equal(contract.topology.paths.length, 8);
assert.equal(contract.pathCampaignRule.expectedMeasuredPortCount, 4);
assert.equal(contract.pathCampaignRule.expectedInactiveBundlePortCount, 8);
assert.equal(
  contract.pathCampaignRule.expectedRemainingUnmeasuredPortCount,
  12,
);

const allPortIds = new Set(contract.topology.ports.map((port) => port.id));
let checkedCampaigns = 0;
for (const lane of contract.topology.laneIds) {
  for (const branch of ['HOST_A', 'HOST_B']) {
    const selection = buildTopologySelection(contract, lane, branch);
    assert.equal(selection.selectedPath.id, `${lane}_${branch}_TO_COMMON`);
    assert.deepEqual(selection.selectedPath.endpointPortIds, [
      `${lane}_${branch === 'HOST_A' ? 'A' : 'B'}_P`,
      `${lane}_${branch === 'HOST_A' ? 'A' : 'B'}_N`,
      `${lane}_C_P`,
      `${lane}_C_N`,
    ]);
    assert.equal(selection.applicableStates.length, 2);

    for (const state of selection.applicableStates) {
      assert.ok(
        contract.pathCampaignRule.applicableStateIds.includes(state.id),
      );
      assert.equal(state.activeBranch, branch);
      const measured = new Set(selection.selectedPath.endpointPortIds);
      const inactive = new Set(state.inactiveTermination.portIds);
      const remaining = new Set(
        [...allPortIds].filter(
          (portId) => !measured.has(portId) && !inactive.has(portId),
        ),
      );
      assert.equal(measured.size, 4);
      assert.equal(inactive.size, 8);
      assert.equal(remaining.size, 12);
      assert.equal(
        new Set([...measured, ...inactive, ...remaining]).size,
        allPortIds.size,
      );
      checkedCampaigns += 1;
    }
  }
}
assert.equal(checkedCampaigns, 16);

for (const mutate of [
  (candidate) => {
    candidate.topology.paths[0].id = 'D0_HOST_A_TO_COMMON_BROKEN';
  },
  (candidate) => {
    candidate.pathCampaignRule.applicableStateIds[0] = 'MISSING_STATE';
  },
  (candidate) => {
    candidate.measurementStates = candidate.measurementStates.filter(
      (state) => state.activeBranch !== 'HOST_B',
    );
  },
]) {
  const candidate = structuredClone(contract);
  mutate(candidate);
  assert.throws(() => {
    for (const lane of candidate.topology.laneIds) {
      for (const branch of ['HOST_A', 'HOST_B']) {
        buildTopologySelection(candidate, lane, branch);
      }
    }
  });
}

for (const field of [
  'usb4OrThunderboltComplianceClaimAuthorized',
  'containsUsbC',
  'containsCc',
  'containsPd',
  'containsVbus',
  'containsVconn',
  'containsRouter',
  'containsMcu',
  'containsProductPower',
]) {
  assert.equal(
    contract.claimBoundary[field],
    false,
    `${field} must remain false`,
  );
}

for (const requiredSource of [
  "import topologyContract from '@/design/pcb1a/topology.contract.json'",
  'contract.status',
  'contract.orderReady',
  'contract.claimBoundary.prohibitedDomains',
  'contract.reviewInputs.notClaimedByThisContract',
  'campaign.expectedMeasuredPortCount',
  'campaign.expectedInactiveBundlePortCount',
  'campaign.expectedRemainingUnmeasuredPortCount',
  'campaign.measurementPlane',
  'buildTopologySelection(contract, lane, branch)',
]) {
  assert.ok(
    source.includes(requiredSource),
    `topology UI must derive ${requiredSource} from the contract`,
  );
}

assert.ok(fieldGuide.includes('href="#pcb1a"'));
assert.ok(fieldGuide.includes('<SiteTopologyExplorer />'));
assert.ok(!source.includes('<span style={styles.badge}>PROPOSED</span>'));
assert.ok(!source.includes('<span style={styles.badgeMuted}>NO ORDER</span>'));
assert.ok(
  source.includes('Every applicable selected campaign state accounts for'),
);
assert.match(
  css,
  /\.site-topology-explorer\s*\{[^}]*min-width:\s*0;[^}]*overflow:\s*hidden;/s,
);
assert.match(
  css,
  /\.site-topology-explorer > \*,[\s\S]*?\.site-topology-frontend > \*\s*\{\s*min-width:\s*0;/,
);
assert.match(
  css,
  /\.site-topology-diagram small,[\s\S]*?\.site-topology-frontend code\s*\{\s*overflow-wrap:\s*anywhere;/,
);
assert.match(
  css,
  /@media \(max-width: 560px\)[\s\S]*?\.site-topology-diagram,[\s\S]*?\.site-topology-metrics\s*\{\s*grid-template-columns:\s*1fr;/,
);

console.log(
  `Site topology contract verified: 4 lanes, 24 ports, 8 paths, ${checkedCampaigns} applicable 4+8+12 campaigns, proposed/no-order claims and mobile shrink invariants.`,
);
