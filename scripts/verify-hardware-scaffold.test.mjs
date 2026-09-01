import assert from 'node:assert/strict';
import { validateScaffold } from './verify-hardware-scaffold.mjs';

const blockerIds = [
  'GATE-INT-001',
  'GATE-DS-001',
  'GATE-PD-001',
  'GATE-SI-001',
  'GATE-FAB-001',
  'GATE-PCB1-PARTS-001',
  'GATE-COLLATERAL-ADOPTION-001',
];
const base = {
  scaffold: {
    schemaVersion: 1,
    status: 'BLOCKED',
    orderReady: false,
    source: { schematic: null, pcb: null, bom: null, stackup: null },
    outputs: {
      gerbers: null,
      drills: null,
      placement: null,
      netlist: null,
      manifest: null,
    },
    blockers: blockerIds,
    blockingIssueNumbers: [19, 20, 21, 22, 53],
    toolchain: {
      observedLocal: {
        version: '10.0.4',
        executable: '/Applications/KiCad.app/Contents/MacOS/kicad-cli',
      },
      documentedReference: { version: '9.0.9' },
      compatibilityClaim: false,
    },
    pagesExposure: { indexed: false, artifacts: [] },
  },
  ledger: {
    records: blockerIds.map((id) => ({ id, kind: 'gate', status: 'BLOCKED' })),
  },
  hardwareFiles: [
    'hardware/README.md',
    'hardware/kicad/README.md',
    'hardware/kicad/scaffold.json',
    'hardware/releases/README.md',
  ],
  pagesAssemblerSource: 'const manifest = { artifacts: [] };',
};
const passes = (mutate = () => {}) => {
  const input = structuredClone(base);
  mutate(input);
  return validateScaffold(input).length === 0;
};
assert.equal(passes(), true);
for (const mutation of [
  (x) => {
    x.scaffold.orderReady = true;
  },
  (x) => {
    x.scaffold.source.pcb = '../board.kicad_pcb';
  },
  (x) => {
    delete x.scaffold.source.schematic;
  },
  (x) => {
    delete x.scaffold.outputs.manifest;
  },
  (x) => {
    x.scaffold.blockers[0] = 'GATE-UNKNOWN-001';
  },
  (x) => {
    x.scaffold.blockers.pop();
  },
  (x) => {
    x.ledger.records[0].status = 'REVIEWED';
  },
  (x) => {
    x.scaffold.toolchain.compatibilityClaim = true;
  },
  (x) => {
    x.scaffold.pagesExposure.indexed = true;
  },
  (x) => {
    x.scaffold.pagesExposure.artifacts = ['fake'];
  },
  (x) => {
    x.hardwareFiles.push('hardware/kicad/fake.kicad_pcb');
  },
  (x) => {
    x.hardwareFiles.push('hardware/kicad/bom.csv');
  },
  (x) => {
    x.hardwareFiles.push('hardware/kicad/front-copper.gbr');
  },
  (x) => {
    x.hardwareFiles.push('hardware/kicad/board.brd');
  },
  (x) => {
    x.hardwareFiles.push('hardware/kicad/board.sch');
  },
  (x) => {
    x.hardwareFiles.push('hardware/kicad/front-copper.gtl');
  },
  (x) => {
    x.hardwareFiles.push('hardware/kicad/back-copper.gbl');
  },
  (x) => {
    x.hardwareFiles.push('hardware/kicad/edge-cuts.gko');
  },
  (x) => {
    x.hardwareFiles.push('hardware/kicad/drill.txt');
  },
  (x) => {
    x.hardwareFiles.push('hardware/kicad/order-package.zip');
  },
  (x) => {
    x.hardwareFiles.push('hardware/releases/rev-a/manifest.json');
  },
  (x) => {
    x.pagesAssemblerSource = 'const manifest = scanHardware();';
  },
])
  assert.equal(passes(mutation), false);
console.log(
  'Hardware scaffold adversarial tests passed: 22 rejected mutations',
);
