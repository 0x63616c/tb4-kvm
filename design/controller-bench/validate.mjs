import fs from 'node:fs';
import path from 'node:path';
const file =
  process.argv[2] ||
  path.join(path.dirname(new URL(import.meta.url).pathname), 'inventory.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const failures = [];
if (data.schemaVersion !== 1 || data.issue !== 18 || data.status !== 'PROPOSED')
  failures.push('header must identify issue 18 and PROPOSED status');
for (const boundary of [
  'usbC',
  'pd',
  'vbus',
  'thunderbolt',
  'highSpeed',
  'valuableEquipment',
])
  if (data.boundary[boundary] !== false)
    failures.push(`boundary.${boundary} must remain false`);
if (
  data.boundary.simultaneousUsbAndVsys !== false ||
  data.boundary.documentedOringRequiredForSimultaneous !== true
)
  failures.push(
    'USB and direct VSYS simultaneous power must be prohibited absent documented OR-ing',
  );
if (
  JSON.stringify(data.powerWorkflow) !==
  JSON.stringify([
    'program-over-USB',
    'disconnect-USB',
    'verify-USB-VBUS-absent',
    'connect-current-limited-3.3V-to-VSYS',
    'test',
  ])
)
  failures.push(
    'power workflow must program over USB, disconnect/verify VBUS, then test on current-limited VSYS',
  );
const monitor = data.adcMonitor;
const expectedMaxAdc =
  (monitor?.maxVsysVolts *
    (monitor?.bottomResistorOhms *
      (1 + monitor?.resistorTolerancePercent / 100))) /
  (monitor?.topResistorOhms * (1 - monitor?.resistorTolerancePercent / 100) +
    monitor?.bottomResistorOhms *
      (1 + monitor?.resistorTolerancePercent / 100));
if (
  !monitor ||
  monitor.externalPin !== 'GP26' ||
  monitor.internalVsysMonitor !== 'ADC3/GP29' ||
  monitor.topResistorOhms !== 100000 ||
  monitor.bottomResistorOhms !== 100000 ||
  monitor.resistorTolerancePercent !== 1 ||
  monitor.capacitorFarads !== 1e-7 ||
  monitor.maxVsysVolts !== 5.5 ||
  monitor.adcLimitVolts !== 3.3 ||
  monitor.maxAdcVoltsWorstCase < expectedMaxAdc ||
  monitor.maxAdcVoltsWorstCase >= monitor.adcLimitVolts
)
  failures.push(
    'GP26 divider and GP29 internal VSYS monitor policy is incomplete or exceeds ADC limit',
  );
if (!data.candidates.some((candidate) => candidate.id === data.recommended))
  failures.push('recommended candidate must exist');
const ids = new Set();
for (const candidate of data.candidates) {
  if (ids.has(candidate.id))
    failures.push(`duplicate candidate id: ${candidate.id}`);
  ids.add(candidate.id);
  if (
    !candidate.sourceUrl?.startsWith('https://') ||
    candidate.accessedDate !== '2026-09-01' ||
    candidate.status !== 'PROPOSED'
  )
    failures.push(`${candidate.id}: source/date/status invalid`);
  if (
    !candidate.partNumber ||
    !candidate.logicVoltage ||
    !candidate.watchdog ||
    !candidate.brownout
  )
    failures.push(`${candidate.id}: incomplete capability record`);
}
if (failures.length) {
  console.error(`Controller bench validation failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(
  `Controller bench inventory validated: ${data.candidates.length} candidates`,
);
