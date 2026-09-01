import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = path.resolve(import.meta.dirname, '..');
const model = JSON.parse(
  fs.readFileSync(
    path.join(projectRoot, 'design/control-state-machine.json'),
    'utf8',
  ),
);
const states = new Map(model.states.map((state) => [state.id, state]));
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function expectedRoute(state, source = 'commands') {
  const a =
    source === 'commands'
      ? state.commands.routeAEnable
      : state.observed.routeAActive;
  const b =
    source === 'commands'
      ? state.commands.routeBEnable
      : state.observed.routeBActive;
  if (a && !b) return 'A';
  if (!a && b) return 'B';
  if (!a && !b) return 'OFF';
  return 'INVALID_BOTH';
}

function expectedSource(state, source = 'commands') {
  const a =
    source === 'commands'
      ? state.commands.sourceAEnable
      : state.observed.sourceAConducting;
  const b =
    source === 'commands'
      ? state.commands.sourceBEnable
      : state.observed.sourceBConducting;
  if (a === 'UNKNOWN' || b === 'UNKNOWN') return 'UNKNOWN';
  if (a && !b) return 'A';
  if (!a && b) return 'B';
  if (!a && !b) return 'OFF';
  return 'INVALID_BOTH';
}

function isBoolean(value) {
  return typeof value === 'boolean';
}

function checkEnum(value, allowed, field) {
  check(allowed.includes(value), `${field} has invalid value ${String(value)}`);
}

const commandBooleanFields = [
  'routeAEnable',
  'routeBEnable',
  'sourceAEnable',
  'sourceBEnable',
  'dischargeAEnable',
  'dischargeBEnable',
];
const observedBooleanFields = ['routeAActive', 'routeBActive'];
const phases = [
  'RESET',
  'READY',
  'DETACH_REQUESTED',
  'DETACH_CONFIRMED',
  'VBUS_DISCHARGING',
  'VBUS_SAFE',
  'CC_ADVERTISEMENT',
  'ATTACHED',
  'DEFAULT_VBUS',
  'DATA_ROUTE',
  'PD_NEGOTIATING',
  'PD_CONTRACTED',
  'LINK_TRAINING',
  'FAULT',
];
const hostsOrOff = ['A', 'B', 'OFF'];
const hostsOrNone = ['A', 'B', 'NONE'];
const ccPolicies = [
  'DISABLED',
  'DETACH_REQUESTED',
  'ADVERTISE_RP',
  'ATTACHED',
  'NEGOTIATING',
  'CONTRACTED',
];
const dischargePolicies = ['HARDWARE_OWNED_CONDITIONAL'];
const orientations = ['NONE', 'A_KNOWN', 'B_KNOWN'];
const links = ['DOWN', 'TRAINING', 'READY'];

for (const state of model.states) {
  check(
    typeof state.id === 'string' && state.id.length > 0,
    'state id required',
  );
  checkEnum(state.phase, phases, `${state.id}.phase`);
  checkEnum(state.route, hostsOrOff, `${state.id}.route`);
  checkEnum(state.vbusSource, hostsOrOff, `${state.id}.vbusSource`);
  checkEnum(state.pdContract, hostsOrNone, `${state.id}.pdContract`);
  checkEnum(state.link, links, `${state.id}.link`);
  check(
    typeof state.display === 'string',
    `${state.id}.display must be a string`,
  );
  check(
    typeof state.commands === 'object' && state.commands !== null,
    `${state.id}.commands must be an object`,
  );
  check(
    typeof state.observed === 'object' && state.observed !== null,
    `${state.id}.observed must be an object`,
  );
  for (const field of commandBooleanFields) {
    check(
      isBoolean(state.commands?.[field]),
      `${state.id}.commands.${field} must be boolean`,
    );
  }
  for (const field of observedBooleanFields) {
    check(
      isBoolean(state.observed?.[field]),
      `${state.id}.observed.${field} must be boolean`,
    );
  }
  for (const field of ['sourceAConducting', 'sourceBConducting']) {
    check(
      isBoolean(state.observed?.[field]) ||
        state.observed?.[field] === 'UNKNOWN',
      `${state.id}.observed.${field} must be boolean or UNKNOWN`,
    );
    if (state.observed?.[field] === 'UNKNOWN') {
      check(
        ['RESET', 'FAULT'].includes(state.phase),
        `${state.id}.observed.${field} may be UNKNOWN only while reset/fault isolation is unconfirmed`,
      );
    }
  }
  for (const field of ['dischargeAActive', 'dischargeBActive']) {
    check(
      isBoolean(state.observed?.[field]) ||
        state.observed?.[field] === 'UNKNOWN',
      `${state.id}.observed.${field} must be boolean or UNKNOWN`,
    );
  }
  for (const field of ['vbusASafe0', 'vbusBSafe0']) {
    check(
      isBoolean(state.observed?.[field]) ||
        state.observed?.[field] === 'UNKNOWN',
      `${state.id}.observed.${field} must be boolean or UNKNOWN`,
    );
  }
  checkEnum(
    state.commands?.ccPolicyA,
    ccPolicies,
    `${state.id}.commands.ccPolicyA`,
  );
  checkEnum(
    state.commands?.ccPolicyB,
    ccPolicies,
    `${state.id}.commands.ccPolicyB`,
  );
  for (const field of ['dischargePolicyA', 'dischargePolicyB']) {
    if (field in (state.commands ?? {})) {
      checkEnum(
        state.commands[field],
        dischargePolicies,
        `${state.id}.commands.${field}`,
      );
    }
  }
  checkEnum(
    state.observed?.orientation,
    orientations,
    `${state.id}.observed.orientation`,
  );
  checkEnum(
    state.observed?.contractHost,
    hostsOrNone,
    `${state.id}.observed.contractHost`,
  );
}

check(model.version === 3, 'model must use the reviewed v3 schema');
check(states.size === model.states.length, 'state ids must be unique');
check(
  new Set(model.invariants.map(({ id }) => id)).size ===
    model.invariants.length,
  'invariant ids must be unique',
);
check(
  new Set(model.faultTransitions).size === model.faultTransitions.length,
  'fault transition sources must be unique',
);
check(states.has(model.resetState), 'reset state must exist');
check(states.has(model.faultTarget), 'fault target must exist');
check(
  model.transitionPolicy.normalEdges === 'EXACTLY_SEQUENCE_ADJACENCIES',
  'normal transitions must be restricted to declared sequence edges',
);
check(
  model.transitionPolicy.timeoutDisposition === model.faultTarget,
  'timeouts must converge on the fault target',
);

const invariantResults = new Map();
const invokedInvariantIds = new Set();
function invariant(id, condition, message) {
  check(
    model.invariants.some((item) => item.id === id),
    `missing executable invariant declaration ${id}`,
  );
  invokedInvariantIds.add(id);
  if (!invariantResults.has(id)) invariantResults.set(id, true);
  if (!condition) invariantResults.set(id, false);
  check(condition, `${id}: ${message}`);
}

for (const state of model.states) {
  invariant(
    'INV-ROUTE-EXCLUSIVE',
    !(state.commands.routeAEnable && state.commands.routeBEnable),
    `${state.id} commands both routes on`,
  );
  invariant(
    'INV-ROUTE-EXCLUSIVE',
    !(state.observed.routeAActive && state.observed.routeBActive),
    `${state.id} observes both routes active`,
  );
  invariant(
    'INV-ROUTE-EXCLUSIVE',
    expectedRoute(state, 'commands') === state.route,
    `${state.id} derived route disagrees with commands`,
  );
  invariant(
    'INV-ROUTE-EXCLUSIVE',
    expectedRoute(state, 'observed') === state.route,
    `${state.id} derived route disagrees with readback`,
  );

  invariant(
    'INV-SOURCE-EXCLUSIVE',
    !(state.commands.sourceAEnable && state.commands.sourceBEnable),
    `${state.id} commands both host sources on`,
  );
  invariant(
    'INV-SOURCE-EXCLUSIVE',
    !(
      state.observed.sourceAConducting === true &&
      state.observed.sourceBConducting === true
    ),
    `${state.id} observes both host sources conducting`,
  );
  invariant(
    'INV-SOURCE-EXCLUSIVE',
    expectedSource(state, 'commands') === state.vbusSource,
    `${state.id} derived VBUS source disagrees with commands`,
  );
  invariant(
    'INV-SOURCE-EXCLUSIVE',
    expectedSource(state, 'observed') === state.vbusSource ||
      (expectedSource(state, 'observed') === 'UNKNOWN' &&
        state.vbusSource === 'OFF' &&
        ['RESET', 'FAULT'].includes(state.phase)),
    `${state.id} derived VBUS source disagrees with readback`,
  );
  invariant(
    'INV-SOURCE-DISCHARGE-INTERLOCK',
    !(state.commands.sourceAEnable && state.commands.dischargeAEnable) &&
      !(state.commands.sourceBEnable && state.commands.dischargeBEnable),
    `${state.id} commands a host source and its discharge path together`,
  );
  invariant(
    'INV-SOURCE-DISCHARGE-INTERLOCK',
    (state.observed.sourceAConducting !== true ||
      state.observed.dischargeAActive === false) &&
      (state.observed.sourceBConducting !== true ||
        state.observed.dischargeBActive === false),
    `${state.id} source conduction lacks explicit inactive-discharge readback`,
  );

  if (state.route === 'A') {
    invariant(
      'INV-ORIENTATION-BEFORE-ROUTE',
      state.observed.orientation === 'A_KNOWN',
      `${state.id} routes A before A orientation is known`,
    );
  }
  if (state.route === 'B') {
    invariant(
      'INV-ORIENTATION-BEFORE-ROUTE',
      state.observed.orientation === 'B_KNOWN',
      `${state.id} routes B before B orientation is known`,
    );
  }

  if (state.phase === 'READY') {
    invariant(
      'INV-CONTRACT-BEFORE-READY',
      state.link === 'READY',
      `${state.id} ready phase lacks ready link evidence`,
    );
    invariant(
      'INV-CONTRACT-BEFORE-READY',
      state.route === state.pdContract,
      `${state.id} route and PD contract differ`,
    );
    invariant(
      'INV-CONTRACT-BEFORE-READY',
      state.route === state.vbusSource,
      `${state.id} route and VBUS source differ`,
    );
    invariant(
      'INV-CONTRACT-BEFORE-READY',
      state.observed.contractHost === state.route,
      `${state.id} contract readback differs from route`,
    );
    const readyPolicy =
      state.route === 'A' ? state.commands.ccPolicyA : state.commands.ccPolicyB;
    invariant(
      'INV-CONTRACT-BEFORE-READY',
      readyPolicy === 'CONTRACTED',
      `${state.id} ready state does not retain contracted PD policy`,
    );
  } else {
    invariant(
      'INV-CONTRACT-BEFORE-READY',
      !state.display.startsWith('READY'),
      `${state.id} display claims READY outside ready phase`,
    );
  }
}

const reset = states.get(model.resetState);
invariant(
  'INV-RESET-ALL-OFF',
  expectedRoute(reset, 'commands') === 'OFF',
  'reset route commands are not all off',
);
invariant(
  'INV-RESET-ALL-OFF',
  expectedSource(reset, 'commands') === 'OFF',
  'reset source commands are not all off',
);
invariant(
  'INV-RESET-ALL-OFF',
  reset.commands.ccPolicyA === 'DISABLED' &&
    reset.commands.ccPolicyB === 'DISABLED',
  'reset CC policies are not disabled',
);
invariant(
  'INV-RESET-ALL-OFF',
  !reset.commands.dischargeAEnable &&
    !reset.commands.dischargeBEnable &&
    reset.commands.dischargePolicyA === 'HARDWARE_OWNED_CONDITIONAL' &&
    reset.commands.dischargePolicyB === 'HARDWARE_OWNED_CONDITIONAL' &&
    reset.observed.dischargeAActive === 'UNKNOWN' &&
    reset.observed.dischargeBActive === 'UNKNOWN' &&
    reset.observed.sourceAConducting === 'UNKNOWN' &&
    reset.observed.sourceBConducting === 'UNKNOWN' &&
    reset.observed.vbusASafe0 === 'UNKNOWN' &&
    reset.observed.vbusBSafe0 === 'UNKNOWN',
  'reset must leave conditional discharge to hardware and claim no discharge/safe0 readback',
);

const fault = states.get(model.faultTarget);
invariant(
  'INV-FAULT-EDGE',
  model.states
    .filter((state) => state.id !== model.faultTarget)
    .every((state) => model.faultTransitions.includes(state.id)) &&
    model.faultTransitions.every(
      (id) => states.has(id) && id !== model.faultTarget,
    ),
  'explicit asynchronous fault-edge sources do not exactly cover every non-fault state',
);
invariant(
  'INV-FAULT-EDGE',
  expectedRoute(fault, 'commands') === 'OFF' &&
    expectedSource(fault, 'commands') === 'OFF',
  'fault commands are not all off',
);
invariant(
  'INV-FAULT-EDGE',
  fault.link === 'DOWN' && !fault.display.startsWith('READY'),
  'fault state claims a usable link',
);
invariant(
  'INV-FAULT-EDGE',
  !fault.commands.dischargeAEnable &&
    !fault.commands.dischargeBEnable &&
    fault.commands.dischargePolicyA === 'HARDWARE_OWNED_CONDITIONAL' &&
    fault.commands.dischargePolicyB === 'HARDWARE_OWNED_CONDITIONAL' &&
    fault.observed.dischargeAActive === 'UNKNOWN' &&
    fault.observed.dischargeBActive === 'UNKNOWN' &&
    fault.observed.sourceAConducting === 'UNKNOWN' &&
    fault.observed.sourceBConducting === 'UNKNOWN' &&
    fault.observed.vbusASafe0 === 'UNKNOWN' &&
    fault.observed.vbusBSafe0 === 'UNKNOWN',
  'fault must leave conditional discharge to hardware and claim no discharge/safe0 readback',
);

const transientPhasesRequiringTimeout = new Set([
  'DETACH_REQUESTED',
  'DETACH_CONFIRMED',
  'VBUS_DISCHARGING',
  'CC_ADVERTISEMENT',
  'ATTACHED',
  'DEFAULT_VBUS',
  'DATA_ROUTE',
  'PD_NEGOTIATING',
  'PD_CONTRACTED',
  'LINK_TRAINING',
]);
for (const state of model.states.filter((item) =>
  transientPhasesRequiringTimeout.has(item.phase),
)) {
  check(
    model.unknownVendorParameters.includes(model.timeoutTransitions[state.id]),
    `${state.id}: transient state lacks an explicit vendor-parameter timeout edge to ${model.faultTarget}`,
  );
}
for (const [stateId, parameter] of Object.entries(model.timeoutTransitions)) {
  check(states.has(stateId), `timeout map references unknown state ${stateId}`);
  check(
    model.unknownVendorParameters.includes(parameter),
    `${stateId}: timeout ${parameter} is not a declared vendor parameter`,
  );
}

const requiredPhaseEdges = new Set([
  'DETACH_REQUESTED->DETACH_CONFIRMED',
  'VBUS_DISCHARGING->VBUS_SAFE',
  'CC_ADVERTISEMENT->ATTACHED',
  'ATTACHED->DEFAULT_VBUS',
  'DEFAULT_VBUS->DATA_ROUTE',
  'PD_NEGOTIATING->PD_CONTRACTED',
  'LINK_TRAINING->READY',
]);

for (const [name, ids] of Object.entries(model.sequences)) {
  const sequence = ids
    .map((id) => {
      check(states.has(id), `${name}: unknown state ${id}`);
      return states.get(id);
    })
    .filter(Boolean);

  check(sequence.length === ids.length, `${name}: every state must resolve`);
  check(sequence[0]?.phase === 'READY', `${name}: sequence must start ready`);
  check(sequence.at(-1)?.phase === 'READY', `${name}: sequence must end ready`);

  const startHost = sequence[0]?.route;
  const endHost = sequence.at(-1)?.route;
  check(
    startHost !== endHost &&
      ['A', 'B'].includes(startHost) &&
      ['A', 'B'].includes(endHost),
    `${name}: sequence must change hosts`,
  );

  const newCcIndex = sequence.findIndex(
    (state) => state.phase === 'CC_ADVERTISEMENT',
  );
  const oldSafeIndex = sequence.findIndex(
    (state) => state.phase === 'VBUS_SAFE',
  );
  invariant(
    'INV-MEASURED-DISCHARGE',
    oldSafeIndex > 0 && newCcIndex > oldSafeIndex,
    `${name} authorizes new CC before old VBUS is measured safe`,
  );

  const safeState = sequence[oldSafeIndex];
  const safeField =
    startHost === 'A'
      ? safeState?.observed.vbusASafe0
      : safeState?.observed.vbusBSafe0;
  invariant(
    'INV-MEASURED-DISCHARGE',
    safeField === true,
    `${name} safe state lacks measured safe0 readback for old host`,
  );

  for (let index = 0; index < sequence.length - 1; index += 1) {
    const edge = `${sequence[index].phase}->${sequence[index + 1].phase}`;
    if (requiredPhaseEdges.has(edge)) {
      check(
        Array.isArray(model.transitionRequirements[edge]) &&
          model.transitionRequirements[edge].length > 0,
        `${name}: ${edge} lacks transition guards`,
      );
    }
  }
}

const dischargeGuards =
  model.transitionRequirements['VBUS_DISCHARGING->VBUS_SAFE'] ?? [];
for (const guard of [
  'SOURCE_FET_OFF_READBACK',
  'VBUS_BELOW_SAFE_THRESHOLD',
  'NO_REVERSE_CURRENT',
  'BEFORE_DISCHARGE_TIMEOUT',
]) {
  invariant(
    'INV-MEASURED-DISCHARGE',
    dischargeGuards.includes(guard),
    `discharge transition lacks ${guard}`,
  );
}

const detachConfirmedGuards =
  model.transitionRequirements['DETACH_REQUESTED->DETACH_CONFIRMED'] ?? [];
for (const guard of [
  'PD_DETACH_CONFIRMED',
  'PD_CONTRACT_NONE',
  'SOURCE_FET_OFF_READBACK',
]) {
  check(
    detachConfirmedGuards.includes(guard),
    `detach-confirmed transition lacks ${guard}`,
  );
}

check(
  model.downstreamPort.allowedStatuses.includes(model.downstreamPort.status),
  `unknown downstream status ${model.downstreamPort.status}`,
);
check(
  model.productBehaviorCoverage.allowedStatuses.includes(
    model.productBehaviorCoverage.status,
  ),
  `unknown product-behavior status ${model.productBehaviorCoverage.status}`,
);
invariant(
  'INV-DOWNSTREAM-GATE',
  model.integratedDesignAuthorized === false ||
    (model.downstreamPort.status === 'VALIDATED' &&
      model.downstreamPort.evidence.length > 0 &&
      model.productBehaviorCoverage.status === 'VALIDATED' &&
      model.productBehaviorCoverage.evidence.length > 0 &&
      model.productBehaviorCoverage.unmodeled.length === 0),
  'integrated design authorization requires validated downstream ownership and complete validated product behavior with evidence',
);

for (const { id } of model.invariants) {
  check(
    invokedInvariantIds.has(id),
    `declared invariant ${id} has no executable verifier`,
  );
}

if (failures.length) {
  console.error(`Control-model verification failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const edgeCount = Object.values(model.sequences).reduce(
  (total, ids) => total + ids.length - 1,
  0,
);
console.log(
  `Control model verified: ${model.states.length} states, ${edgeCount} allowed normal edges, ${invariantResults.size} executable invariants.`,
);
console.log(
  `Integrated design authorized: ${model.integratedDesignAuthorized}. Downstream port: ${model.downstreamPort.status}.`,
);
