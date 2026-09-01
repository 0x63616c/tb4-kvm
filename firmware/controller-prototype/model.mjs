// PD-free controller prototype: tests only user-facing intent and fail-closed
// supervision. It has no Type-C/PD, VBUS, high-speed or hardware control.

export const CONFIG = Object.freeze({
  debounceMs: 30,
  confirmHoldMs: 900,
  confirmTimeoutMs: 5000,
  eventLogLimit: 32,
  intentHistoryLimit: 64,
});

const CONFIG_LIMITS = Object.freeze({
  debounceMs: [0, 1000],
  confirmHoldMs: [1, 10000],
  confirmTimeoutMs: [1, 60000],
  eventLogLimit: [1, 1024],
  intentHistoryLimit: [1, 4096],
});

function validatedConfig(overrides) {
  if (
    overrides === null ||
    typeof overrides !== 'object' ||
    Array.isArray(overrides)
  )
    throw new TypeError('config must be an object');
  const unknown = Object.keys(overrides).filter((key) => !(key in CONFIG));
  if (unknown.length) throw new TypeError(`unknown config key: ${unknown[0]}`);
  const config = { ...CONFIG, ...overrides };
  for (const [key, [minimum, maximum]] of Object.entries(CONFIG_LIMITS)) {
    if (
      !Number.isSafeInteger(config[key]) ||
      config[key] < minimum ||
      config[key] > maximum
    )
      throw new RangeError(
        `${key} must be an integer from ${minimum} through ${maximum}`,
      );
  }
  if (config.confirmHoldMs > config.confirmTimeoutMs)
    throw new RangeError('confirmHoldMs must not exceed confirmTimeoutMs');
  return config;
}

const modes = new Set([
  'SELECTED_A',
  'SELECTED_B',
  'AWAIT_EJECT_A',
  'AWAIT_EJECT_B',
  'WAIT_BUTTON_A',
  'WAIT_BUTTON_B',
  'NO_HOSTS',
  'POWER_LOSS',
  'FAULT_LATCHED',
  'RESET_ISOLATED',
]);

const other = (host) => (host === 'A' ? 'B' : 'A');
const selectedMode = (host) => `SELECTED_${host}`;
const awaitMode = (host) => `AWAIT_EJECT_${host}`;
const waitMode = (host) => `WAIT_BUTTON_${host}`;

export function createState({ hostA = true, hostB = true, config = {} } = {}) {
  const state = {
    now: 0,
    config: validatedConfig(config),
    externalPower: true,
    hosts: { A: Boolean(hostA), B: Boolean(hostB) },
    podPresent: false,
    mode: 'RESET_ISOLATED',
    selected: null,
    pendingTarget: null,
    confirmDeadline: null,
    buttonDownAt: null,
    intents: [],
    log: [],
  };
  return transition(state, { type: 'STARTUP' });
}

export function transition(state, event) {
  const next = structuredClone(state);
  if (!event || typeof event.type !== 'string')
    return record(next, 'INVALID_EVENT', 'ignored malformed event');
  if (Number.isFinite(event.at) && event.at >= next.now) next.now = event.at;

  if (next.mode === 'FAULT_LATCHED') return faultLatchedEvent(next, event);

  if (event.type === 'TICK') return tick(next, event.ms ?? 0);
  if (event.type === 'HOST')
    return hostEvent(next, event.host, Boolean(event.present));
  if (event.type === 'POWER_LOSS')
    return powerLoss(next, 'external power lost');
  if (event.type === 'BROWNOUT') return brownout(next);
  if (event.type === 'WATCHDOG_RESET')
    return isolate(next, 'RESET_ISOLATED', 'watchdog reset');
  if (event.type === 'FAULT')
    return isolate(next, 'FAULT_LATCHED', 'fault latched');
  if (event.type === 'FAULT_CLEAR')
    return record(
      next,
      'FAULT_CLEAR',
      'fault clear observed; no controller state is changed',
    );
  if (event.type === 'POWER_RESTORED') {
    next.externalPower = true;
    return record(
      next,
      'POWER_RESTORED',
      'external power restored; explicit startup required',
    );
  }
  if (event.type === 'STARTUP') return startup(next);
  if (event.type === 'POD_PRESENT') {
    next.podPresent = Boolean(event.present);
    return record(
      next,
      next.podPresent ? 'POD_PRESENT' : 'POD_REMOVED',
      'remote pod is request-only; onboard control remains available',
    );
  }
  if (event.type === 'POD_REQUEST') {
    if (!next.podPresent)
      return record(next, 'POD_REQUEST_IGNORED', 'pod is absent');
    return requestSwitch(next, 'remote pod request');
  }
  if (event.type === 'BUTTON_DOWN') return buttonDown(next);
  if (event.type === 'BUTTON_UP') return buttonUp(next);
  return record(next, 'UNKNOWN_EVENT', event.type);
}

function startup(state) {
  if (!state.externalPower)
    return isolate(
      state,
      'POWER_LOSS',
      'startup denied: external power absent',
    );
  if (state.hosts.A) return select(state, 'A', 'startup preference');
  if (state.hosts.B) return select(state, 'B', 'sole host at startup');
  return isolate(state, 'NO_HOSTS', 'startup: no host present');
}

function faultLatchedEvent(state, event) {
  if (event.type === 'HOST' && ['A', 'B'].includes(event.host)) {
    state.hosts[event.host] = Boolean(event.present);
    return record(
      state,
      'FAULT_OBSERVATION',
      `host ${event.host} observation retained while fault is latched`,
    );
  }
  if (event.type === 'POD_PRESENT') {
    state.podPresent = Boolean(event.present);
    return record(
      state,
      'FAULT_OBSERVATION',
      'pod observation retained while fault is latched',
    );
  }
  if (event.type === 'POWER_LOSS') {
    state.externalPower = false;
    return record(
      state,
      'FAULT_OBSERVATION',
      'external power loss retained while fault is latched',
    );
  }
  if (event.type === 'BROWNOUT') {
    state.externalPower = false;
    return record(
      state,
      'FAULT_OBSERVATION',
      'brownout retained while fault is latched',
    );
  }
  if (event.type === 'POWER_RESTORED') {
    state.externalPower = true;
    return record(
      state,
      'FAULT_OBSERVATION',
      'external power restoration retained while fault is latched',
    );
  }
  if (event.type === 'TICK' && Number.isFinite(event.ms) && event.ms >= 0)
    state.now += event.ms;
  return record(
    state,
    'FAULT_LATCHED_IGNORED',
    `${event.type} cannot clear a latched fault`,
  );
}

function powerLoss(state, reason) {
  state.externalPower = false;
  return isolate(state, 'POWER_LOSS', reason);
}

function brownout(state) {
  state.externalPower = false;
  return isolate(
    state,
    'RESET_ISOLATED',
    'brownout reset; await external power restoration',
  );
}

function hostEvent(state, host, present) {
  if (!['A', 'B'].includes(host))
    return record(state, 'HOST_IGNORED', 'invalid host');
  state.hosts[host] = present;
  if (!present && state.selected === host) {
    state.selected = host;
    state.pendingTarget = null;
    state.confirmDeadline = null;
    if (state.hosts[other(host)]) {
      state.mode = waitMode(host);
      return record(
        state,
        'ACTIVE_REMOVED_WAIT_BUTTON',
        `active ${host} removed; no automatic failover`,
      );
    }
    return isolate(state, 'NO_HOSTS', 'active host removed; no host remains');
  }
  return record(
    state,
    present ? 'HOST_PRESENT' : 'HOST_REMOVED',
    `${host} ${present ? 'present' : 'removed'}; current selection is unchanged`,
  );
}

function buttonDown(state) {
  if (state.buttonDownAt !== null)
    return record(state, 'BUTTON_BOUNCE', 'duplicate button down ignored');
  state.buttonDownAt = state.now;
  return record(state, 'BUTTON_DOWN', 'button down');
}

function buttonUp(state) {
  if (state.buttonDownAt === null)
    return record(
      state,
      'BUTTON_BOUNCE',
      'button up without stable down ignored',
    );
  const duration = state.now - state.buttonDownAt;
  state.buttonDownAt = null;
  if (duration < state.config.debounceMs)
    return record(
      state,
      'BUTTON_BOUNCE',
      'press shorter than debounce ignored',
    );
  if (state.mode.startsWith('AWAIT_EJECT_')) {
    if (duration < state.config.confirmHoldMs)
      return record(
        state,
        'CONFIRM_HOLD_TOO_SHORT',
        'continue holding to confirm storage-stop acknowledgement',
      );
    return confirmSwitch(state);
  }
  return requestSwitch(state, 'onboard button request');
}

function requestSwitch(state, source) {
  if (
    !state.externalPower ||
    ['POWER_LOSS', 'FAULT_LATCHED', 'RESET_ISOLATED'].includes(state.mode)
  )
    return record(state, 'REQUEST_REFUSED', 'control state is isolated');
  if (state.mode === 'NO_HOSTS')
    return record(state, 'REQUEST_REFUSED', 'no host is present');
  if (state.mode.startsWith('AWAIT_EJECT_'))
    return record(
      state,
      'REQUEST_REFUSED',
      'storage-stop acknowledgement is already pending',
    );
  const current = state.selected;
  const target = state.mode.startsWith('WAIT_BUTTON_')
    ? startupCandidate(state)
    : current
      ? other(current)
      : null;
  if (!target || !state.hosts[target])
    return record(
      state,
      'REQUEST_REFUSED',
      'requested target is unavailable; no detach intent',
    );
  state.pendingTarget = target;
  state.confirmDeadline = state.now + state.config.confirmTimeoutMs;
  state.mode = awaitMode(target);
  emitIntent(state, {
    type: 'REQUEST_STORAGE_STOP_EJECT',
    target,
    source,
    at: state.now,
  });
  return record(
    state,
    'AWAIT_EJECT',
    `${source}; hold onboard button to acknowledge storage stop/eject`,
  );
}

function confirmSwitch(state) {
  const target = state.pendingTarget;
  if (!target || state.now > state.confirmDeadline)
    return cancelPending(state, 'confirmation expired');
  if (!state.externalPower || !state.hosts[target]) {
    if (!state.hosts.A && !state.hosts.B)
      return isolate(state, 'NO_HOSTS', 'target stale and no host remains');
    state.pendingTarget = null;
    state.confirmDeadline = null;
    state.mode =
      state.selected && state.hosts[state.selected]
        ? selectedMode(state.selected)
        : waitMode(other(target));
    return record(
      state,
      'STALE_TARGET_REFUSED',
      'target disappeared before confirmation; no switch intent emitted',
    );
  }
  return select(state, target, 'storage-stop acknowledgement held');
}

function tick(state, ms) {
  if (!Number.isFinite(ms) || ms < 0)
    return record(state, 'TICK_IGNORED', 'invalid tick');
  state.now += ms;
  if (
    state.mode.startsWith('AWAIT_EJECT_') &&
    state.now > state.confirmDeadline
  )
    return cancelPending(state, 'storage-stop acknowledgement timed out');
  return record(state, 'TICK', `${ms} ms`);
}

function cancelPending(state, message) {
  const current = state.selected;
  state.pendingTarget = null;
  state.confirmDeadline = null;
  if (current && state.hosts[current]) state.mode = selectedMode(current);
  else if (state.hosts.A || state.hosts.B)
    state.mode = waitMode(current ?? 'A');
  else state.mode = 'NO_HOSTS';
  return record(state, 'SWITCH_CANCELLED', message);
}

function select(state, host, reason) {
  state.selected = host;
  state.pendingTarget = null;
  state.confirmDeadline = null;
  state.mode = selectedMode(host);
  emitIntent(state, {
    type: 'SELECT_HOST_INTENT',
    host,
    reason,
    at: state.now,
  });
  return record(state, 'SELECT_HOST_INTENT', `${host}: ${reason}`);
}

function isolate(state, mode, reason) {
  state.selected = null;
  state.pendingTarget = null;
  state.confirmDeadline = null;
  state.buttonDownAt = null;
  state.mode = mode;
  emitIntent(state, { type: 'ISOLATE_INTENT', reason, at: state.now });
  return record(state, 'ISOLATE_INTENT', reason);
}

function startupCandidate(state) {
  if (state.hosts.A) return 'A';
  if (state.hosts.B) return 'B';
  return null;
}

function emitIntent(state, intent) {
  state.intents.push(intent);
  if (state.intents.length > state.config.intentHistoryLimit)
    state.intents.splice(
      0,
      state.intents.length - state.config.intentHistoryLimit,
    );
}

function record(state, code, detail) {
  state.log.push({ at: state.now, code, detail, mode: state.mode });
  if (state.log.length > state.config.eventLogLimit)
    state.log.splice(0, state.log.length - state.config.eventLogLimit);
  return state;
}

export function displayState(state) {
  if (state.mode === 'FAULT_LATCHED')
    return { led: 'FAULT', display: 'FAULT · CONTROL ISOLATED' };
  if (state.mode === 'POWER_LOSS')
    return { led: 'OFF', display: 'EXTERNAL POWER UNAVAILABLE' };
  if (state.mode === 'NO_HOSTS')
    return { led: 'OFF', display: 'NO HOST SELECTED' };
  if (state.mode.startsWith('AWAIT_EJECT_'))
    return { led: 'AMBER', display: 'STOP / EJECT STORAGE · HOLD BUTTON' };
  if (state.mode.startsWith('WAIT_BUTTON_'))
    return { led: 'AMBER', display: 'ACTIVE HOST REMOVED · PRESS BUTTON' };
  if (state.mode === 'SELECTED_A')
    return { led: 'A', display: 'HOST A SELECTED' };
  if (state.mode === 'SELECTED_B')
    return { led: 'B', display: 'HOST B SELECTED' };
  return { led: 'OFF', display: 'CONTROL ISOLATED' };
}

export function assertInvariants(state) {
  if (!modes.has(state.mode)) throw new Error(`unknown mode ${state.mode}`);
  if (state.selected !== null && !['A', 'B'].includes(state.selected))
    throw new Error('invalid selected host');
  if (
    ['POWER_LOSS', 'FAULT_LATCHED', 'RESET_ISOLATED', 'NO_HOSTS'].includes(
      state.mode,
    ) &&
    state.selected !== null
  )
    throw new Error('fail-closed mode retains selection');
  if (
    state.mode.startsWith('SELECTED_') &&
    state.selected !== state.mode.at(-1)
  )
    throw new Error('selected mode mismatch');
  if (
    state.mode.startsWith('AWAIT_EJECT_') &&
    (!state.pendingTarget || !state.confirmDeadline)
  )
    throw new Error('pending confirmation incomplete');
  if (state.log.length > state.config.eventLogLimit)
    throw new Error('event log is unbounded');
  if (state.intents.length > state.config.intentHistoryLimit)
    throw new Error('intent history is unbounded');
  if (
    state.intents.some(
      (intent) =>
        ![
          'SELECT_HOST_INTENT',
          'ISOLATE_INTENT',
          'REQUEST_STORAGE_STOP_EJECT',
        ].includes(intent.type),
    )
  )
    throw new Error('non-abstract intent emitted');
}
