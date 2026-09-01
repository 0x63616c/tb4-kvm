import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CONFIG,
  assertInvariants,
  createState,
  displayState,
  transition,
} from './model.mjs';

const scenarios = JSON.parse(
  readFileSync(
    new URL(
      '../../design/controller-prototype/scenarios.json',
      import.meta.url,
    ),
  ),
).scenarios;

let checks = 0;

function check(condition, message) {
  checks += 1;
  assert.ok(condition, message);
}

function step(state, event) {
  const next = transition(state, event);
  assertInvariants(next);
  return next;
}

function hasIntent(state, type, host) {
  return state.intents.some(
    (intent) =>
      intent.type === type && (host === undefined || intent.host === host),
  );
}

function onboardPress(state, duration) {
  let next = step(state, { type: 'BUTTON_DOWN' });
  next = step(next, { type: 'TICK', ms: duration });
  return step(next, { type: 'BUTTON_UP' });
}

for (const scenario of scenarios) {
  let state = createState(scenario.initial);
  for (const event of scenario.events) state = step(state, event);
  check(
    state.mode === scenario.expectMode,
    `${scenario.id}: expected ${scenario.expectMode}, got ${state.mode}`,
  );
}

{
  let state = createState();
  state = onboardPress(state, CONFIG.debounceMs - 1);
  check(state.mode === 'SELECTED_A', 'bounce must not start a switch request');
  check(
    !hasIntent(state, 'REQUEST_STORAGE_STOP_EJECT'),
    'bounce must emit no storage request',
  );
}

{
  let state = createState();
  state = step(state, { type: 'HOST', host: 'A', present: false });
  state = step(state, { type: 'TICK', ms: CONFIG.confirmTimeoutMs * 2 });
  check(
    state.mode === 'WAIT_BUTTON_A',
    'active removal must wait for a button, not fail over',
  );
  check(
    state.selected === 'A',
    'active removal must retain the previous abstract selection',
  );
  check(
    !hasIntent(state, 'SELECT_HOST_INTENT', 'B') ||
      state.intents.filter(
        (intent) => intent.type === 'SELECT_HOST_INTENT' && intent.host === 'B',
      ).length === 0,
    'active removal must not select B',
  );
  check(
    displayState(state).display.includes('ACTIVE HOST REMOVED'),
    'removal status must identify the observed condition',
  );

  state = onboardPress(state, CONFIG.debounceMs + 1);
  check(
    state.mode === 'AWAIT_EJECT_B',
    'a deliberate request after removal must choose the sole attached B candidate',
  );
  state = onboardPress(state, CONFIG.confirmHoldMs + 1);
  check(
    state.mode === 'SELECTED_B',
    'the onboard acknowledgement may select B only after the deliberate request',
  );
}

{
  let state = createState();
  state = step(state, { type: 'HOST', host: 'A', present: false });
  state = step(state, { type: 'HOST', host: 'A', present: true });
  check(
    state.mode === 'WAIT_BUTTON_A',
    'same-host reattachment must not automatically leave the waiting state',
  );
  state = onboardPress(state, CONFIG.debounceMs + 1);
  check(
    state.mode === 'AWAIT_EJECT_A',
    'waiting-state request must apply A preference when both hosts are attached',
  );
  state = onboardPress(state, CONFIG.confirmHoldMs + 1);
  check(
    state.mode === 'SELECTED_A',
    'deliberate acknowledgement may restore the A-preferred candidate',
  );
}

{
  let state = createState();
  state = onboardPress(state, CONFIG.debounceMs + 1);
  check(
    state.mode === 'AWAIT_EJECT_B',
    'first deliberate press must request acknowledgement',
  );
  state = step(state, { type: 'HOST', host: 'B', present: false });
  state = onboardPress(state, CONFIG.confirmHoldMs + 1);
  check(
    state.mode === 'SELECTED_A',
    'stale target must leave attached current host selected',
  );
  check(
    !state.intents.some(
      (intent) => intent.type === 'SELECT_HOST_INTENT' && intent.host === 'B',
    ),
    'stale target must never emit B selection intent',
  );
  check(
    state.log.at(-1).code === 'STALE_TARGET_REFUSED',
    'stale target must have an honest refusal record',
  );
}

{
  let state = createState();
  state = onboardPress(state, CONFIG.debounceMs + 1);
  state = step(state, { type: 'TICK', ms: CONFIG.confirmTimeoutMs + 1 });
  check(
    state.mode === 'SELECTED_A',
    'confirmation timeout must cancel to the attached current host',
  );
  check(
    state.log.at(-1).code === 'SWITCH_CANCELLED',
    'timeout must be recorded as cancelled',
  );
}

{
  let state = createState();
  state = step(state, { type: 'POD_PRESENT', present: true });
  state = step(state, { type: 'POD_REQUEST' });
  check(state.mode === 'AWAIT_EJECT_B', 'present pod may make a request only');
  state = step(state, { type: 'POD_PRESENT', present: false });
  check(
    state.mode === 'AWAIT_EJECT_B',
    'pod removal must not conceal an already-visible acknowledgement request',
  );
  state = onboardPress(state, CONFIG.confirmHoldMs + 1);
  check(
    state.mode === 'SELECTED_B',
    'only the onboard hold confirms a pod-originated request',
  );
}

{
  let state = step(createState(), { type: 'POWER_LOSS' });
  check(
    state.mode === 'POWER_LOSS' &&
      !state.externalPower &&
      state.selected === null,
    'external power loss must isolate and update power bookkeeping',
  );
  state = step(state, { type: 'STARTUP' });
  check(
    state.mode === 'POWER_LOSS' && state.selected === null,
    'startup must stay denied until power restoration',
  );
  state = step(state, { type: 'POWER_RESTORED' });
  state = step(state, { type: 'STARTUP' });
  check(
    state.mode === 'SELECTED_A',
    'power restoration plus explicit startup may restart the model',
  );
}

{
  let state = step(createState(), { type: 'BROWNOUT' });
  check(
    state.mode === 'RESET_ISOLATED' &&
      !state.externalPower &&
      state.selected === null,
    'brownout must isolate and require observed power restoration',
  );
  state = step(state, { type: 'STARTUP' });
  check(
    state.mode === 'POWER_LOSS',
    'brownout startup is denied before power restoration',
  );
  state = step(state, { type: 'POWER_RESTORED' });
  state = step(state, { type: 'STARTUP' });
  check(
    state.mode === 'SELECTED_A',
    'brownout recovery requires restored power then explicit startup',
  );
}

{
  let state = step(createState(), { type: 'WATCHDOG_RESET' });
  check(
    state.mode === 'RESET_ISOLATED' &&
      state.externalPower &&
      state.selected === null,
    'watchdog reset must isolate while retaining the observed external-power state',
  );
  state = step(state, { type: 'STARTUP' });
  check(
    state.mode === 'SELECTED_A',
    'watchdog recovery still requires explicit startup',
  );
}

{
  let state = step(createState(), { type: 'FAULT' });
  for (const event of [
    { type: 'POWER_LOSS' },
    { type: 'BROWNOUT' },
    { type: 'WATCHDOG_RESET' },
    { type: 'POWER_RESTORED' },
    { type: 'STARTUP' },
    { type: 'BUTTON_DOWN' },
    { type: 'BUTTON_UP' },
    { type: 'POD_PRESENT', present: true },
    { type: 'POD_REQUEST' },
    { type: 'FAULT_CLEAR' },
    { type: 'HOST', host: 'A', present: false },
  ]) {
    state = step(state, event);
    check(
      state.mode === 'FAULT_LATCHED' && state.selected === null,
      `${event.type} cannot unlatch or select while fault is latched`,
    );
  }
  check(
    state.buttonDownAt === null,
    'buttons remain ignored while fault is latched',
  );
}

{
  let state = step(createState(), { type: 'FAULT' });
  state = step(state, { type: 'BROWNOUT' });
  check(
    state.mode === 'FAULT_LATCHED' && !state.externalPower,
    'brownout must retain unavailable-power bookkeeping while fault remains dominant',
  );
  state = step(state, { type: 'POWER_RESTORED' });
  check(
    state.mode === 'FAULT_LATCHED' && state.externalPower,
    'power restoration may update bookkeeping but cannot clear a latched fault',
  );
}

{
  let state = createState({
    config: { eventLogLimit: 4, intentHistoryLimit: 4 },
  });
  for (let index = 0; index < 20; index += 1)
    state = step(state, { type: 'TICK', ms: 1 });
  check(state.log.length === 4, 'event log must remain bounded');
  for (let index = 0; index < 20; index += 1)
    state = step(state, { type: 'STARTUP' });
  check(
    state.intents.length === 4,
    'abstract intent history must remain bounded',
  );
}

{
  const invalidConfigs = [
    { eventLogLimit: Infinity },
    { eventLogLimit: 0 },
    { intentHistoryLimit: -1 },
    { confirmTimeoutMs: Number.NaN },
    { confirmHoldMs: 5001, confirmTimeoutMs: 5000 },
    { unknownLimit: 4 },
  ];
  for (const config of invalidConfigs) {
    let rejected = false;
    try {
      createState({ config });
    } catch (error) {
      rejected = error instanceof RangeError || error instanceof TypeError;
    }
    check(rejected, `invalid config must be rejected: ${JSON.stringify(config)}`);
  }
}

{
  let seed = 0x18c0ffee;
  const nextRandom = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed;
  };
  let state = createState({ config: { intentHistoryLimit: 5 } });
  const events = [
    () => ({ type: 'TICK', ms: nextRandom() % 2000 }),
    () => ({
      type: 'HOST',
      host: nextRandom() & 1 ? 'A' : 'B',
      present: Boolean(nextRandom() & 1),
    }),
    () => ({ type: 'BUTTON_DOWN' }),
    () => ({ type: 'BUTTON_UP' }),
    () => ({ type: 'POD_PRESENT', present: Boolean(nextRandom() & 1) }),
    () => ({ type: 'POD_REQUEST' }),
    () => ({ type: 'POWER_LOSS' }),
    () => ({ type: 'POWER_RESTORED' }),
    () => ({ type: 'BROWNOUT' }),
    () => ({ type: 'WATCHDOG_RESET' }),
    () => ({ type: 'FAULT' }),
    () => ({ type: 'FAULT_CLEAR' }),
    () => ({ type: 'STARTUP' }),
  ];
  for (let index = 0; index < 2000; index += 1)
    state = step(state, events[nextRandom() % events.length]());
  check(
    state.intents.every((intent) =>
      Object.keys(intent).every((key) =>
        ['type', 'host', 'target', 'source', 'reason', 'at'].includes(key),
      ),
    ),
    'random stream must retain abstract intent shape',
  );
  check(
    state.intents.length <= 5,
    'random stream must preserve the configured intent-history cap',
  );
}

{
  const malformed = transition(createState(), null);
  assertInvariants(malformed);
  check(
    malformed.log.at(-1).code === 'INVALID_EVENT',
    'malformed input must be controlled and fail closed',
  );
}

console.log(`controller-prototype: ${checks} checks passed`);
