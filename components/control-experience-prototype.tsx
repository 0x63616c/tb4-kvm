'use client';

import {
  AlertTriangle,
  Cable,
  CircleAlert,
  MonitorSmartphone,
  Power,
  RotateCcw,
  ShieldCheck,
  Unplug,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type Host = 'A' | 'B';
type Surface = 'led' | 'display';
type Mode =
  | 'selected'
  | 'confirm-switch'
  | 'waiting-for-button'
  | 'no-hosts'
  | 'isolated'
  | 'fault';

const label = (host: Host) => `HOST ${host}`;

export function ControlExperiencePrototype() {
  const [hostA, setHostA] = useState(true);
  const [hostB, setHostB] = useState(true);
  const [podAttached, setPodAttached] = useState(false);
  const [surface, setSurface] = useState<Surface>('display');
  const [selected, setSelected] = useState<Host>('A');
  const [mode, setMode] = useState<Mode>('selected');
  const [notice, setNotice] = useState(
    'Startup: both hosts attached, so this UX prototype prefers HOST A.',
  );

  const attached = { A: hostA, B: hostB };
  const other = selected === 'A' ? 'B' : 'A';
  const otherAvailable = attached[other];
  const isolated = mode === 'isolated' || mode === 'fault';
  const noHostSelected = mode === 'no-hosts';
  const pathsOff = isolated || noHostSelected;

  const truthfulStatus = useMemo(() => {
    if (mode === 'fault') return 'FAULT · paths isolated';
    if (mode === 'isolated') return 'EXTERNAL POWER UNAVAILABLE · isolated';
    if (mode === 'no-hosts') return 'NO HOST ATTACHED · no selection';
    if (mode === 'confirm-switch')
      return 'STOP / EJECT STORAGE BEFORE SWITCHING';
    if (mode === 'waiting-for-button')
      return `${label(selected)} REMOVED · press switch to choose again`;
    return `${label(selected)} SELECTED`;
  }, [mode, selected]);

  const startup = () => {
    if (hostA) {
      setSelected('A');
      setMode('selected');
      setNotice(
        hostB
          ? 'Startup prefers HOST A when both hosts are attached.'
          : 'Only HOST A is attached, so it is selected.',
      );
    } else if (hostB) {
      setSelected('B');
      setMode('selected');
      setNotice('Only HOST B is attached, so it is selected.');
    } else {
      setMode('no-hosts');
      setNotice(
        'Neither host is attached: there is no host selection. This is not an external-power fault.',
      );
    }
  };

  const setAttachment = (host: Host, next: boolean) => {
    if (host === 'A') setHostA(next);
    else setHostB(next);
    if (!next && host === selected && mode === 'selected') {
      setMode('waiting-for-button');
      setNotice(
        `${label(host)} was removed. The dock does not move automatically; it waits for a button request.`,
      );
    }
  };

  const requestSwitch = () => {
    if (mode === 'no-hosts') {
      setNotice(
        'No host is attached. Attach a host and run the startup rule before requesting a switch.',
      );
      return;
    }
    if (isolated) {
      setNotice(
        'Controls are isolated until external power is restored and startup is run again.',
      );
      return;
    }
    if (mode === 'waiting-for-button') {
      if (otherAvailable) {
        setMode('confirm-switch');
        setNotice(
          `Button request can select ${label(other)} after the storage warning is acknowledged.`,
        );
      } else {
        setMode('no-hosts');
        setNotice(
          'No host remains after the button request, so there is no host selection.',
        );
      }
      return;
    }
    if (!otherAvailable) {
      setNotice(
        `${label(other)} is not attached. The active host stays selected; no pointless detach is requested.`,
      );
      return;
    }
    setMode('confirm-switch');
    setNotice(
      'Stop writes and eject removable storage before confirming the host switch.',
    );
  };

  const confirmSwitch = () => {
    if (mode !== 'confirm-switch' || isolated) {
      setNotice(
        'The switch confirmation no longer applies. No host selection was changed.',
      );
      return;
    }
    if (!otherAvailable) {
      if (attached[selected]) {
        setMode('selected');
        setNotice(
          `${label(other)} is no longer attached. ${label(selected)} remains selected; no switch was requested.`,
        );
      } else {
        setMode('no-hosts');
        setNotice(
          'The requested host is no longer attached and no selected host remains. There is no host selection.',
        );
      }
      return;
    }
    setSelected(other);
    setMode('selected');
    setNotice(
      `Storage warning acknowledged. ${label(other)} is now selected in this UX/control prototype.`,
    );
  };

  const losePower = () => {
    setMode('isolated');
    setNotice(
      'External power loss: both host paths are represented as isolated. No pass-through is implied.',
    );
  };

  const injectFault = () => {
    setMode('fault');
    setNotice(
      'Fault injected: the prototype latches an isolated control state. It does not retry automatically.',
    );
  };

  const reset = () => {
    setHostA(true);
    setHostB(true);
    setPodAttached(false);
    setSelected('A');
    setMode('selected');
    setNotice('Reset: both hosts attached; startup preference is HOST A.');
  };

  return (
    <section
      className="module-surface control-experience"
      aria-labelledby="control-experience-heading"
    >
      <div className="module-heading">
        <p className="eyebrow">UX/control prototype · not electrical proof</p>
        <h2 id="control-experience-heading">
          What should a whole-desk switch feel like when it tells the truth?
        </h2>
        <p>
          Try the physical controls and connection changes below. This explores
          labels, warnings and control intent—not PD timing, VBUS ownership,
          link training, throughput, compliance or readiness.
        </p>
      </div>

      <div className="control-prototype-layout">
        <div
          className={`main-unit ${pathsOff ? 'main-unit-isolated' : ''}`}
          aria-label="Conceptual TB4 KVM main unit"
        >
          <div className="main-unit-topline">
            <span>TB4 KVM · CONTROL EXPERIENCE</span>
            <span>PROTOTYPE</span>
          </div>
          <div className="port-row">
            <Port
              label="HOST A"
              active={!pathsOff && selected === 'A'}
              attached={hostA}
            />
            <Port
              label="DOCK"
              active={!pathsOff && mode === 'selected'}
              attached
            />
            <Port
              label="HOST B"
              active={!pathsOff && selected === 'B'}
              attached={hostB}
            />
          </div>
          <div className="main-unit-controls">
            <div className="protected-pod-port">
              <Cable size={17} />
              <span>
                <b>REMOTE POD</b>
                <small>keyed · low speed only</small>
              </span>
            </div>
            <button
              className="main-unit-button"
              type="button"
              onClick={requestSwitch}
              aria-describedby="switch-help"
            >
              <span aria-hidden="true" />
              Switch host
            </button>
            <div
              className="unit-status-lights"
              aria-label={`Current indicator: ${truthfulStatus}`}
            >
              <i className={selected === 'A' && !pathsOff ? 'light-on' : ''}>
                A
              </i>
              <i className={selected === 'B' && !pathsOff ? 'light-on' : ''}>
                B
              </i>
              <i className={mode === 'fault' ? 'light-fault' : ''}>!</i>
            </div>
          </div>
        </div>

        <aside className="control-status-panel" aria-live="polite">
          <p className="eyebrow">Truthful status</p>
          <strong>{truthfulStatus}</strong>
          <p id="switch-help">{notice}</p>
          <dl>
            <div>
              <dt>Host A</dt>
              <dd>{hostA ? 'attached' : 'not attached'}</dd>
            </div>
            <div>
              <dt>Host B</dt>
              <dd>{hostB ? 'attached' : 'not attached'}</dd>
            </div>
            <div>
              <dt>Dock</dt>
              <dd>shown connected</dd>
            </div>
          </dl>
        </aside>
      </div>

      {mode === 'confirm-switch' && (
        <div className="storage-warning" role="alert">
          <AlertTriangle />
          <div>
            <b>Before switching, stop writes and eject removable storage.</b>
            <p>
              Switching hosts interrupts the dock. This prototype requires a
              deliberate confirmation; it does not claim a safe electrical
              sequence.
            </p>
          </div>
          <Button onClick={confirmSwitch}>
            I stopped/ejected storage · switch
          </Button>
        </div>
      )}

      <div className="control-prototype-controls">
        <fieldset>
          <legend>Connected hosts</legend>
          <label>
            <input
              type="checkbox"
              checked={hostA}
              onChange={(event) => setAttachment('A', event.target.checked)}
            />{' '}
            HOST A attached
          </label>
          <label>
            <input
              type="checkbox"
              checked={hostB}
              onChange={(event) => setAttachment('B', event.target.checked)}
            />{' '}
            HOST B attached
          </label>
          <Button type="button" variant="outline" onClick={startup}>
            <Power /> Run startup rule
          </Button>
        </fieldset>
        <fieldset>
          <legend>Control surface</legend>
          <label>
            <input
              type="radio"
              name="surface"
              checked={surface === 'led'}
              onChange={() => setSurface('led')}
            />{' '}
            LED-minimal
          </label>
          <label>
            <input
              type="radio"
              name="surface"
              checked={surface === 'display'}
              onChange={() => setSurface('display')}
            />{' '}
            Small display
          </label>
          <label>
            <input
              type="checkbox"
              checked={podAttached}
              onChange={(event) => setPodAttached(event.target.checked)}
            />{' '}
            Optional pod attached
          </label>
        </fieldset>
        <div className="control-fault-actions">
          <Button type="button" variant="outline" onClick={losePower}>
            <Unplug /> Simulate power loss
          </Button>
          <Button type="button" variant="outline" onClick={injectFault}>
            <CircleAlert /> Inject fault
          </Button>
          <Button type="button" variant="ghost" onClick={reset}>
            <RotateCcw /> Reset scenario
          </Button>
        </div>
      </div>

      <div
        className="surface-comparison"
        aria-label="LED and small display comparison"
      >
        <article className={surface === 'led' ? 'surface-selected' : ''}>
          <p className="eyebrow">LED-minimal</p>
          <div className="led-face">
            <i className={selected === 'A' && !pathsOff ? 'light-on' : ''} /> A{' '}
            <i className={selected === 'B' && !pathsOff ? 'light-on' : ''} /> B{' '}
            <i className={mode === 'fault' ? 'light-fault' : ''} /> fault
          </div>
          <p>
            Fast to scan, but the storage warning and unavailable-host reason
            need a separate label or blink pattern.
          </p>
        </article>
        <article className={surface === 'display' ? 'surface-selected' : ''}>
          <p className="eyebrow">Small display</p>
          <div className="small-display">
            <MonitorSmartphone size={17} />
            <span>{truthfulStatus}</span>
          </div>
          <p>
            Can show the selected host, a waiting state and the explicit storage
            warning without inventing speed or compliance facts.
          </p>
        </article>
      </div>

      {podAttached && (
        <div className="remote-pod">
          <div>
            <Cable />
            <span>
              <b>DETACHABLE POD</b>
              <small>
                request button only · main unit retains safety decisions
              </small>
            </span>
          </div>
          <Button type="button" variant="outline" onClick={requestSwitch}>
            Pod switch request
          </Button>
        </div>
      )}

      <p className="model-note">
        <ShieldCheck /> This is a throwaway control-experience prototype for
        issue #17. It deliberately keeps automatic failover off and makes no
        electrical, throughput, compliance or readiness claim.
      </p>
    </section>
  );
}

function Port({
  label,
  active,
  attached,
}: {
  label: string;
  active: boolean;
  attached: boolean;
}) {
  return (
    <div
      className={`concept-port ${active ? 'concept-port-active' : ''} ${attached ? '' : 'concept-port-empty'}`}
    >
      <span>{label}</span>
      <i aria-hidden="true" />
      <small>{attached ? 'TB4 / USB-C' : 'nothing attached'}</small>
    </div>
  );
}
