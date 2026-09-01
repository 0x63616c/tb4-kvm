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
  if (a && !b) return 'A';
  if (!a && b) return 'B';
  if (!a && !b) return 'OFF';
  return 'INVALID_BOTH';
}

check(model.version === 2, 'model must use the reviewed v2 schema');
check(states.size === model.states.length, 'state ids must be unique');
check(states.has(model.resetState), 'reset state must exist');
check(states.has(model.faultTarget), 'fault target must exist');
check(
  model.transitionPolicy.normalEdges === 'EXACTLY_SEQUENCE_ADJACENCIES',
  'normal transitions must be restricted to declared sequence edges',
);
check(
  model.transitionPolicy.asynchronousFaultEdgeFromEveryNonFaultState === true,
  'every non-fault state must declare an asynchronous fault edge',
);
check(
  model.transitionPolicy.timeoutDisposition === model.faultTarget,
  'timeouts must converge on the fault target',
);

const invariantResults = new Map(model.invariants.map(({ id }) => [id, true]));
function invariant(id, condition, message) {
  check(
    model.invariants.some((item) => item.id === id),
    `missing executable invariant declaration ${id}`,
  );
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
    !(state.observed.sourceAConducting && state.observed.sourceBConducting),
    `${state.id} observes both host sources conducting`,
  );
  invariant(
    'INV-SOURCE-EXCLUSIVE',
    expectedSource(state, 'commands') === state.vbusSource,
    `${state.id} derived VBUS source disagrees with commands`,
  );
  invariant(
    'INV-SOURCE-EXCLUSIVE',
    expectedSource(state, 'observed') === state.vbusSource,
    `${state.id} derived VBUS source disagrees with readback`,
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

const fault = states.get(model.faultTarget);
invariant(
  'INV-FAULT-EDGE',
  model.states
    .filter((state) => state.id !== model.faultTarget)
    .every(
      () => model.transitionPolicy.asynchronousFaultEdgeFromEveryNonFaultState,
    ),
  'not every non-fault state has the declared asynchronous fault edge',
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

invariant(
  'INV-DOWNSTREAM-GATE',
  model.downstreamPort.status !== 'UNRESOLVED_BLOCKER' ||
    model.integratedDesignAuthorized === false,
  'integrated design is authorized while downstream ownership is unresolved',
);

for (const { id } of model.invariants) {
  check(
    invariantResults.has(id),
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
