import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const here = path.dirname(new URL(import.meta.url).pathname);
const validator = path.join(here, 'validate-acquisition-approval-packet.mjs');
const base = JSON.parse(
  fs.readFileSync(path.join(here, 'acquisition.approval.json'), 'utf8'),
);
const mutations = [
  ['purchase', (data) => (data.authorisation.purchaseAuthorised = true)],
  ['cart', (data) => (data.authorisation.cartAuthorised = true)],
  [
    'contact',
    (data) => (data.authorisation.externalContactAuthorised = true),
  ],
  ['wrong-total', (data) => (data.costSummary.merchandiseSubtotalUsd = 1)],
  [
    'missing-supply',
    (data) =>
      (data.items = data.items.filter((item) => item.mpn !== 'KD3005D')),
  ],
  [
    'unsafe-current-prose',
    (data) => (data.trapdoors.currentLimit = 'Raise the limit to 5A.'),
  ],
  [
    'unsafe-mains-prose',
    (data) => (data.trapdoors.mains = 'Plug it in without checking.'),
  ],
  ['duplicate-item', (data) => (data.items[1].id = data.items[0].id)],
  [
    'broker-url',
    (data) =>
      (data.items[0].distributorSourceUrl =
        'https://example.invalid/broker'),
  ],
  [
    'fake-breadboard-identity',
    (data) => {
      const item = data.items.find((candidate) => candidate.id === 'breadboard');
      item.manufacturer = 'Fake Parts Ltd';
      item.mpn = 'NOT-BB830';
      item.stock = 'made-up shown';
      item.manufacturerSourceUrl = 'https://example.invalid/fake-maker';
      item.distributorSourceUrl =
        'https://www.digikey.com/en/products/detail/example/fake/1';
    },
  ],
  [
    'quantity-price-substitution',
    (data) => {
      const item = data.items.find((candidate) => candidate.id === 'breadboard');
      item.quantity = 895;
      item.unitPriceUsd = 0.01;
    },
  ],
  [
    'excluded-usb-c-line',
    (data) => {
      data.items.find((candidate) => candidate.id === 'display').unitPriceUsd -= 1;
      data.items.push({
        id: 'usb-c-cable',
        manufacturer: 'Example',
        mpn: 'USB-C',
        quantity: 1,
        unitPriceUsd: 1,
        stock: '1 shown',
        vendor: 'DigiKey',
        sourceDate: '2026-09-01',
        manufacturerSourceUrl: 'https://example.invalid/usb-c',
        distributorSourceUrl:
          'https://www.digikey.com/en/products/detail/example/usb-c/1',
        exactItem: true,
      });
    },
  ],
];

for (const [name, mutate] of mutations) {
  const candidate = structuredClone(base);
  mutate(candidate);
  const file = path.join(
    os.tmpdir(),
    `tb4-kvm-approval-${process.pid}-${String(name)}.json`,
  );
  fs.writeFileSync(file, JSON.stringify(candidate));
  const result = spawnSync(process.execPath, [validator, file], {
    encoding: 'utf8',
  });
  fs.rmSync(file, { force: true });
  if (result.status === 0) {
    console.error(`Approval-packet mutant unexpectedly passed: ${String(name)}`);
    process.exit(1);
  }
}
console.log(
  `Acquisition approval packet adversarial tests passed: ${mutations.length} rejected mutants`,
);
