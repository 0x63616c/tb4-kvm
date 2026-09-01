'use client';

import {
  AlertTriangle,
  Cable,
  CircleAlert,
  Power,
  RotateCcw,
  ShieldCheck,
  TimerReset,
  Unplug,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  CONFIG,
  createState,
  displayState,
  transition,
  type ControllerEvent,
  type ControllerState,
} from '@/firmware/controller-prototype/model.mjs';

const initialState = () => createState();

export function ControllerPrototypeLab() {
  const [state, setState] = useState<ControllerState>(initialState);
  const status = displayState(state);
  const awaitingAcknowledgement = state.mode.startsWith('AWAIT_EJECT_');
  const isolated = ['POWER_LOSS', 'RESET_ISOLATED', 'FAULT_LATCHED'].includes(
    state.mode,
  );

  const apply = (...events: ControllerEvent[]) => {
    setState((current) => events.reduce(transition, current));
  };

  const deliberatePress = () =>
    apply(
      { type: 'BUTTON_DOWN' },
      { type: 'TICK', ms: CONFIG.debounceMs + 1 },
      { type: 'BUTTON_UP' },
    );

  const confirmationHold = () =>
    apply(
      { type: 'BUTTON_DOWN' },
      { type: 'TICK', ms: CONFIG.confirmHoldMs + 1 },
      { type: 'BUTTON_UP' },
    );

  return (
    <section
      className="module-surface controller-prototype-lab"
      aria-labelledby="controller-prototype-heading"
    >
      <div className="module-heading">
        <p className="eyebrow">Issue #18 · executable software model</p>
        <h2 id="controller-prototype-heading">
          Try the controller&apos;s conservative decision rules.
        </h2>
        <p>
          This panel drives the same deterministic model as the command-line
          tests. It emits only local, abstract intent; it does not control
          Type-C, PD, VBUS, Thunderbolt, storage, or any physical hardware.
        </p>
      </div>

      <div className="controller-lab-summary" aria-live="polite">
        <div>
          <span
            className={`controller-status-dot controller-status-${status.led.toLowerCase()}`}
            aria-hidden="true"
          />
          <div>
            <p className="eyebrow">Truthful model status</p>
            <strong>{status.display}</strong>
          </div>
        </div>
        <dl>
          <div>
            <dt>Mode</dt>
            <dd>{state.mode}</dd>
          </div>
          <div>
            <dt>External power</dt>
            <dd>
              {state.externalPower ? 'observed available' : 'unavailable'}
            </dd>
          </div>
          <div>
            <dt>Selected intent</dt>
            <dd>{state.selected ? `Host ${state.selected}` : 'none'}</dd>
          </div>
        </dl>
      </div>

      <div className="controller-lab-grid">
        <div className="controller-lab-controls">
          <fieldset>
            <legend>Observed connections</legend>
            {(['A', 'B'] as const).map((host) => (
              <label key={host}>
                <input
                  type="checkbox"
                  checked={state.hosts[host]}
                  onChange={(event) =>
                    apply({ type: 'HOST', host, present: event.target.checked })
                  }
                />
                Host {host} attached
              </label>
            ))}
            <label>
              <input
                type="checkbox"
                checked={state.podPresent}
                onChange={(event) =>
                  apply({ type: 'POD_PRESENT', present: event.target.checked })
                }
              />
              Optional request-only pod attached
            </label>
          </fieldset>

          <fieldset>
            <legend>One-button interaction</legend>
            <p>
              A deliberate press requests a change. It never proves storage is
              stopped.
            </p>
            <Button type="button" variant="outline" onClick={deliberatePress}>
              <Cable /> Request with onboard press
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => apply({ type: 'POD_REQUEST' })}
            >
              Pod request
            </Button>
            <Button
              type="button"
              onClick={confirmationHold}
              disabled={!awaitingAcknowledgement}
            >
              <AlertTriangle /> Hold to acknowledge stop/eject
            </Button>
            {!awaitingAcknowledgement && (
              <small>
                Confirmation is available only after a current request.
              </small>
            )}
          </fieldset>

          <fieldset>
            <legend>Conservative failure simulations</legend>
            <div className="controller-lab-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => apply({ type: 'STARTUP' })}
              >
                <Power /> Run startup rule
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => apply({ type: 'POWER_LOSS' })}
              >
                <Unplug /> External-power loss
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => apply({ type: 'POWER_RESTORED' })}
              >
                <Power /> Power restored
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => apply({ type: 'BROWNOUT' })}
              >
                <TimerReset /> Brownout
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => apply({ type: 'WATCHDOG_RESET' })}
              >
                <TimerReset /> Watchdog reset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => apply({ type: 'FAULT' })}
              >
                <CircleAlert /> Latch fault
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setState(initialState)}
              >
                <RotateCcw /> Fresh model scenario
              </Button>
            </div>
          </fieldset>
        </div>

        <aside
          className="controller-lab-observations"
          aria-label="Model activity"
        >
          <div>
            <p className="eyebrow">Bounded abstract intents</p>
            <ol>
              {state.intents
                .slice(-5)
                .reverse()
                .map((intent, index) => (
                  <li key={`${intent.at}-${intent.type}-${index}`}>
                    <code>{intent.type}</code>
                    <span>
                      {intent.host ??
                        intent.target ??
                        intent.reason ??
                        'controller isolation'}
                    </span>
                  </li>
                ))}
            </ol>
          </div>
          <div>
            <p className="eyebrow">Recent event log</p>
            <ol>
              {state.log
                .slice(-6)
                .reverse()
                .map((entry, index) => (
                  <li key={`${entry.at}-${entry.code}-${index}`}>
                    <code>{entry.code}</code>
                    <span>{entry.detail}</span>
                  </li>
                ))}
            </ol>
          </div>
        </aside>
      </div>

      <p className="controller-lab-boundary">
        <ShieldCheck /> <strong>Boundary:</strong> “selected” is a software
        intent label only. No link, power, safety, storage, compliance, or
        readiness condition is implied.{' '}
        {isolated
          ? 'This model is presently isolated.'
          : 'Use the controls to explore only the decision logic.'}
      </p>
    </section>
  );
}
