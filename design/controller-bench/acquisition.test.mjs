import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const here = path.dirname(new URL(import.meta.url).pathname);
const validator = path.join(here, 'acquisition.validate.mjs');
const base = JSON.parse(
  fs.readFileSync(path.join(here, 'acquisition.inventory.json'), 'utf8'),
);
const files = [];

function run(data, name) {
  const file = path.join(
    os.tmpdir(),
    `tb4-kvm-acquisition-${process.pid}-${name}.json`,
  );
  files.push(file);
  fs.writeFileSync(file, JSON.stringify(data));
  return spawnSync(process.execPath, [validator, file], { encoding: 'utf8' });
}

const baseline = run(base, 'baseline');
if (baseline.status !== 0) {
  console.error(baseline.stderr || baseline.stdout);
  console.error('Baseline acquisition inventory unexpectedly failed');
  process.exitCode = 1;
} else {
  const mutants = [
    ['usb-c-in-scope', (data) => (data.boundary.usbC = true)],
    [
      'excess-current',
      (data) => (data.boundary.maximumBenchSupplyCurrentMilliamp = 251),
    ],
    [
      'simultaneous-usb-vsys',
      (data) => (data.boundary.simultaneousUsbAndVsys = true),
    ],
    ['ordered', (data) => (data.acquisitionStatus = 'ORDERED')],
    [
      'wrong-controller',
      (data) =>
        (data.items.find((item) => item.id === 'pico2-board').mpn = 'OTHER'),
    ],
    [
      'uart-powers-target',
      (data) =>
        (data.items.find((item) => item.id === 'uart-cable').specification =
          'connect UART VCC'),
    ],
    [
      'optional-esd-authorized',
      (data) =>
        (data.items.find((item) => item.id === 'remote-esd').buyAction =
          'BUY_IF_MISSING'),
    ],
    [
      'stale-short-cable-esd-claim',
      (data) =>
        (data.items.find(
          (item) => item.id === 'remote-esd',
        ).distributorSnapshots[0].notes =
          'optional ESD does not block a short-cable base bench'),
    ],
    ['duplicate-item', (data) => (data.items[1].id = data.items[0].id)],
    ['unsafe-power-order', (data) => data.power.workflow.reverse()],
    [
      'missing-distributor-snapshot',
      (data) => (data.items[0].distributorSnapshots = []),
    ],
    [
      'inverted-price',
      (data) =>
        (data.items[0].distributorSnapshots[0].unitPriceUsd = {
          min: 7,
          max: 6,
        }),
    ],
    [
      'incorrect-cost-rollup',
      (data) =>
        (data.costSummary.requiredElectronicsIfNothingIsOnHandUsd.max = 70),
    ],
    [
      'remote-cable-without-protection-review',
      (data) => {
        const entry = data.wiring.find(
          (candidate) => candidate.signal === 'GP3 second request input',
        );
        entry.connect = 'GP3 -> unprotected remote cable';
        entry.limit = 'short cable';
      },
    ],
    ['checklist-preapproved', (data) => (data.ownerChecklist[0].done = true)],
    ['missing-mpn', (data) => (data.items[0].mpn = '')],
  ];

  for (const [name, mutate] of mutants) {
    const data = structuredClone(base);
    mutate(data);
    const result = run(data, String(name));
    if (result.status === 0) {
      console.error(`Acquisition mutant unexpectedly passed: ${String(name)}`);
      process.exitCode = 1;
      break;
    }
  }
  if (process.exitCode !== 1)
    console.log(
      `Controller-bench acquisition adversarial tests passed: ${mutants.length} rejected mutants`,
    );
}

for (const file of files) fs.rmSync(file, { force: true });
process.exit(process.exitCode ?? 0);
