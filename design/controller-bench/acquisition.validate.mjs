import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const here = path.dirname(new URL(import.meta.url).pathname);
const inventoryPath =
  process.argv[2] || path.join(here, 'acquisition.inventory.json');
const schemaPath = path.join(here, 'acquisition.schema.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const failures = [];

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validSchema = ajv.compile(schema);
if (!validSchema(inventory)) {
  for (const error of validSchema.errors || [])
    failures.push(`schema ${error.instancePath || '/'} ${error.message}`);
}

const expectedWorkflow = [
  'program-over-Pico-micro-USB',
  'disconnect-USB-at-both-ends',
  'verify-disconnected-USB-VBUS-is-0V-with-DMM',
  'set-current-limited-supply-to-3.3V-and-100mA',
  'connect-only-VSYS-and-GND',
  'increase-limit-no-higher-than-250mA-if-needed',
  'test-and-log',
];
if (
  JSON.stringify(inventory.power?.workflow) !== JSON.stringify(expectedWorkflow)
)
  failures.push(
    'power workflow must disconnect and verify USB before direct VSYS',
  );
if (inventory.boundary?.maximumBenchVoltageVolts !== 5.5)
  failures.push('maximum bench voltage must remain 5.5V');
if (inventory.boundary?.maximumBenchSupplyCurrentMilliamp !== 250)
  failures.push('maximum bench supply current must remain 250mA');
if (inventory.power?.initialCurrentLimitMilliamp !== 100)
  failures.push('initial supply current limit must remain 100mA');

const ids = new Set();
for (const item of inventory.items || []) {
  if (ids.has(item.id)) failures.push(`duplicate item id: ${item.id}`);
  ids.add(item.id);
  if (item.quantity < 1) failures.push(`${item.id}: quantity must be positive`);
  if (!item.mpn || !item.orderCode)
    failures.push(`${item.id}: exact MPN and order code are required`);
  if (item.manufacturerSource?.accessedDate !== inventory.captureDate)
    failures.push(
      `${item.id}: manufacturer source date must match capture date`,
    );
  if (!item.distributorSnapshots?.length)
    failures.push(
      `${item.id}: a dated distributor snapshot is required, even if unavailable`,
    );
  for (const snapshot of item.distributorSnapshots || []) {
    if (snapshot.accessedDate !== inventory.captureDate)
      failures.push(`${item.id}: distributor snapshot date mismatch`);
    if (
      snapshot.unitPriceUsd &&
      snapshot.unitPriceUsd.max < snapshot.unitPriceUsd.min
    )
      failures.push(`${item.id}: distributor price range is inverted`);
  }
}

const sc1631 = inventory.items?.find((item) => item.id === 'pico2-board');
if (sc1631?.mpn !== 'SC1631' || sc1631?.orderCode !== 'SC1631')
  failures.push('recommended controller must be Raspberry Pi Pico 2 SC1631');
const esd = inventory.items?.find((item) => item.id === 'remote-esd');
if (esd?.buyAction !== 'DO_NOT_BUY_UNTIL_REVIEWED')
  failures.push('remote ESD must remain optional and review-gated');
if (
  !esd?.distributorSnapshots?.[0]?.notes?.includes(
    'base bench has no remote cable',
  ) ||
  !inventory.unresolvedAvailability?.some((entry) =>
    entry.includes('base bench has no remote cable'),
  )
)
  failures.push(
    'all remote-ESD availability text must preserve the no-cable base boundary',
  );
const uart = inventory.items?.find((item) => item.id === 'uart-cable');
if (!uart?.specification?.includes('leave VCC disconnected'))
  failures.push('UART cable must explicitly leave VCC disconnected');
if (
  !inventory.evidenceCapture?.directVsysCases?.includes(
    'unplug Pico USB and the FTDI USB cable',
  )
)
  failures.push(
    'B9/B10 direct-VSYS evidence must explicitly unplug both USB cables',
  );
if (
  !inventory.evidenceCapture?.requiredSeparation?.includes(
    'separate sequential evidence',
  )
)
  failures.push(
    'serial logs and direct-VSYS waveforms must be recorded as separate sequential evidence',
  );

const requiredCost =
  inventory.costSummary?.requiredElectronicsIfNothingIsOnHandUsd;
const cents = (value) => Math.round(Number(value) * 100);
let computedMinCents = 0;
let computedMaxCents = 0;
for (const id of requiredCost?.itemIds || []) {
  const item = inventory.items?.find((candidate) => candidate.id === id);
  const price = item?.distributorSnapshots?.[0]?.unitPriceUsd;
  if (!item || !price) {
    failures.push(`cost roll-up item ${id} needs a captured USD price`);
    continue;
  }
  computedMinCents += cents(price.min) * item.quantity;
  computedMaxCents += cents(price.max) * item.quantity;
}
if (computedMinCents !== cents(requiredCost?.min))
  failures.push('required-electronics minimum must equal the item roll-up');
if (computedMaxCents !== cents(requiredCost?.max))
  failures.push('required-electronics maximum must equal the item roll-up');
if (
  cents(inventory.costSummary?.likelyMinimumOwnerPurchaseUsd?.max) !==
  computedMaxCents
)
  failures.push('likely owner-purchase maximum must equal the required roll-up');

const remoteWiring = inventory.wiring?.find(
  (entry) => entry.signal === 'GP3 second request input',
);
if (
  !remoteWiring?.connect?.includes('adjacent breadboard') ||
  !remoteWiring?.limit?.includes('no exposed remote cable')
)
  failures.push(
    'base bench must keep GP3 local until remote entry protection is independently reviewed',
  );

for (const [key, value] of Object.entries(inventory.boundary || {})) {
  if (
    typeof value === 'boolean' &&
    [
      'usbC',
      'pd',
      'vbus',
      'thunderbolt',
      'highSpeed',
      'targetMacBooks',
      'dock',
      'productPowerDomain',
      'valuableEquipment',
      'simultaneousUsbAndVsys',
    ].includes(key) &&
    value !== false
  )
    failures.push(`boundary.${key} must be false`);
}
if (inventory.acquisitionStatus !== 'PREPARED_NOT_ORDERED')
  failures.push('acquisition must remain prepared, not ordered');

if (failures.length) {
  console.error(
    `Controller-bench acquisition validation failed (${failures.length})`,
  );
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(
  `Controller-bench acquisition validated: ${inventory.items.length} item lines, ${inventory.ownerChecklist.length} owner checks, $${(computedMinCents / 100).toFixed(2)}-$${(computedMaxCents / 100).toFixed(2)} required roll-up, no order action`,
);
