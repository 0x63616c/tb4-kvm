import { readFileSync } from 'node:fs';
import { createState, displayState, transition } from './model.mjs';

const scenarios = JSON.parse(
  readFileSync(
    new URL(
      '../../design/controller-prototype/scenarios.json',
      import.meta.url,
    ),
  ),
).scenarios;
const requestedId = process.argv[2] ?? 'switch-with-hold';
const scenario = scenarios.find(({ id }) => id === requestedId);

if (!scenario) {
  console.error(`Unknown scenario: ${requestedId}`);
  console.error(`Available: ${scenarios.map(({ id }) => id).join(', ')}`);
  process.exitCode = 2;
} else {
  let state = createState(scenario.initial);
  console.log(
    JSON.stringify(
      {
        step: 'initial',
        mode: state.mode,
        status: displayState(state),
        intents: state.intents,
      },
      null,
      2,
    ),
  );
  for (const [index, event] of scenario.events.entries()) {
    state = transition(state, event);
    console.log(
      JSON.stringify(
        {
          step: index + 1,
          event,
          mode: state.mode,
          status: displayState(state),
          intents: state.intents,
        },
        null,
        2,
      ),
    );
  }
}
