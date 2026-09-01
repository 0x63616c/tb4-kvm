import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';

const here = path.dirname(new URL(import.meta.url).pathname);
const packetPath =
  process.argv[2] || path.join(here, 'acquisition.approval.json');
const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
const schema = JSON.parse(
  fs.readFileSync(path.join(here, 'acquisition.approval.schema.json'), 'utf8'),
);
const valid = new Ajv2020({ allErrors: true }).compile(schema);
const failures = [];
const expectedItemsSha256 =
  'a54c1e123294855d096e4c9324dd22255b9536ac1c8d7e1f22ab11f9f7b86f36';

if (!valid(packet))
  for (const error of valid.errors || [])
    failures.push(`schema ${error.instancePath || '/'} ${error.message}`);

const actualItemsSha256 = createHash('sha256')
  .update(JSON.stringify(packet.items || []))
  .digest('hex');
if (actualItemsSha256 !== expectedItemsSha256)
  failures.push(
    'the complete ordered 16-line item snapshot must remain exact (all identities, quantities, prices, stock strings, sources and notes)',
  );

const cents = (value) => Math.round(Number(value) * 100);
const totalCents = (packet.items || []).reduce(
  (sum, item) => sum + cents(item.unitPriceUsd) * item.quantity,
  0,
);
if (totalCents !== cents(packet.costSummary?.merchandiseSubtotalUsd))
  failures.push('merchandise subtotal must equal quantity-extended item prices');
if (
  totalCents + cents(packet.route?.publishedSitewideShippingStartingUsd) !==
  cents(packet.costSummary?.arithmeticStartingTotalBeforeTaxTariffUsd)
)
  failures.push(
    'arithmetic starting total must equal merchandise plus the sitewide shipping starting rate',
  );

const ids = new Set();
const requiredMpns = new Set([
  'SC1631',
  'KD3005D',
  'MM325',
  '3782-24-0',
  '3782-24-2',
]);
for (const item of packet.items || []) {
  if (ids.has(item.id)) failures.push(`duplicate item id: ${item.id}`);
  ids.add(item.id);
  requiredMpns.delete(item.mpn);
  if (!item.stock.includes('shown'))
    failures.push(`${item.id}: stock snapshot missing`);
}
if (requiredMpns.size)
  failures.push(`missing preferred MPNs: ${[...requiredMpns].join(', ')}`);

const exactTrapdoors = {
  currentLimit:
    'KD3005D has 1mA setting/readback resolution, but 100mA is only a nominal procedural setpoint; regulation/accuracy terms include approximately 10mA. Verify CC at 100mA with a known load and DMM, start output off, and never raise the supply above the 250mA bench ceiling. OCP is not a substitute for that procedure.',
  mains:
    'Before energising the received KD3005D, inspect the rear selector and set 110/120V for US mains, confirm protective earth, and verify the T5A/250V 110/120V fuse. The official family manual proves a power cord but does not prove output leads; the packet supplies separate banana-to-Minigrabber leads. Do not infer selector position from the listing.',
  dmm:
    'MM325 is the exact identified instrument and includes test leads; Klein requires a known-voltage/current operation check before each use. Its 20.00V range resolves 0.01V, adequate for coarse 3.3V-present and below-5.5V acceptance, not for a millivolt or +/-5mV limit. Traceability here means exact MPN plus that pre-use check, not an ISO-17025 certificate.',
  leads:
    'The two exact Pomona leads are separate line items: 3782-24-0 black and 3782-24-2 red, each 24in, banana-to-Minigrabber, 300VDC/5A. Verify color/MPN on receipt before connecting the supply.',
  shipping:
    "The $4.99 amount is only DigiKey's published US USPS Ground Advantage starting rate observed on the capture date, not a guaranteed shipping quote for this route. Marketplace items may add shipping. Address eligibility, split shipments, tariff and tax can change the delivered total; there is no finite landed upper bound without a separately owner-authorised cart/address calculation.",
};
for (const [key, value] of Object.entries(exactTrapdoors))
  if (packet.trapdoors?.[key] !== value)
    failures.push(`trapdoors.${key} must remain exact and fail closed`);

if (failures.length) {
  console.error(`Acquisition approval packet failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(
  `Acquisition approval packet validated: ${packet.items.length} lines, $${packet.costSummary.merchandiseSubtotalUsd.toFixed(2)} merchandise, no authorization`,
);
