import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const here = path.dirname(new URL(import.meta.url).pathname);
const validator = path.join(here, 'validate-owner-inventory-response.mjs');
const base = JSON.parse(
  fs.readFileSync(path.join(here, 'owner-inventory.response.json'), 'utf8'),
);

const mutations = [
  ['purchase-authorized', (data) => (data.purchaseAuthorization = true)],
  ['cart-authorized', (data) => (data.cartAuthorization = true)],
  [
    'contact-authorized',
    (data) => (data.externalContactAuthorization = true),
  ],
  ['inventory-unclear', (data) => (data.ownerInventoryStatus = 'UNKNOWN')],
  [
    'unauthorized-prose',
    (data) =>
      (data.nextAuthorizedPreparation =
        'Create a cart, contact vendors, and place the order immediately without further approval.'),
  ],
];

for (const [name, mutate] of mutations) {
  const candidate = structuredClone(base);
  mutate(candidate);
  const file = path.join(
    os.tmpdir(),
    `tb4-kvm-owner-inventory-${process.pid}-${String(name)}.json`,
  );
  fs.writeFileSync(file, JSON.stringify(candidate));
  const result = spawnSync(process.execPath, [validator, file], {
    encoding: 'utf8',
  });
  fs.rmSync(file, { force: true });
  if (result.status === 0) {
    console.error(
      `Owner-inventory mutant unexpectedly passed: ${String(name)}`,
    );
    process.exit(1);
  }
}

console.log(
  `Owner inventory response adversarial tests passed: ${mutations.length} rejected mutants`,
);
