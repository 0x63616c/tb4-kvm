'use client';

import { Check, Clipboard, Download, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type Choice = { value: string; label: string };
type Decision = {
  id: string;
  title: string;
  question: string;
  defaultValue: string;
  rationale: string;
  boundary: string;
  choices: Choice[];
};

const storageKey = 'tb4-kvm-v1-owner-decisions';

const decisions: Decision[] = [
  {
    id: 'startup',
    title: '1. Start-up selection',
    question: 'When both hosts are attached at power-up, what should happen?',
    defaultValue: 'restore-last-safe',
    rationale:
      'Default: restore the last safe host; otherwise select HOST A. It avoids a surprise desk change after a power event.',
    boundary:
      'This still waits for supported Type-C/PD discovery. It cannot energise both hosts.',
    choices: [
      {
        value: 'restore-last-safe',
        label: 'Restore the last safe host; otherwise HOST A',
      },
      { value: 'always-host-a', label: 'Always choose HOST A' },
      { value: 'other', label: 'Other (explain below)' },
    ],
  },
  {
    id: 'charging',
    title: '2. Selected-host charging',
    question: 'What charging promise should v1 make to the selected host?',
    defaultValue: 'up-to-60w',
    rationale:
      'Default: up to 60 W for the selected host, with no promised charging for the unselected host.',
    boundary:
      'The supply budget, dock power ownership and reverse-current protection still need reference-backed proof.',
    choices: [
      {
        value: 'up-to-60w',
        label: 'Up to 60 W selected host; none promised to the other',
      },
      { value: 'lower-target', label: 'Choose a lower charging target' },
      { value: 'other', label: 'Other (explain below)' },
    ],
  },
  {
    id: 'failover',
    title: '3. Active-host removal',
    question:
      'When the selected host disconnects, should the dock move automatically?',
    defaultValue: 'wait-for-button',
    rationale:
      'Default: show the loss and wait for a button press. It avoids an unexpected desktop change.',
    boundary:
      'Automatic failover needs a reference-supported discovery and guard sequence before it can be promised.',
    choices: [
      { value: 'wait-for-button', label: 'Wait for a button press' },
      {
        value: 'auto-after-validated-guard',
        label: 'Auto-fail over only after a validated guard sequence',
      },
      { value: 'other', label: 'Other (explain below)' },
    ],
  },
  {
    id: 'compatibility',
    title: '4. Downstream compatibility',
    question: 'What should v1 promise downstream?',
    defaultValue: 'named-owc-first',
    rationale:
      'Default: validate the named OWC Thunderbolt Dock 96W first, rather than claiming arbitrary-dock support.',
    boundary:
      'The named dock still needs recorded cable, display, firmware and functional validation evidence.',
    choices: [
      {
        value: 'named-owc-first',
        label: 'Named OWC Thunderbolt Dock 96W first',
      },
      {
        value: 'broader-after-validation',
        label: 'Broader devices only after separate validation',
      },
      { value: 'other', label: 'Other (explain below)' },
    ],
  },
  {
    id: 'power-loss',
    title: '5. External-power loss',
    question:
      'What should the KVM do if its external supply is absent or fails?',
    defaultValue: 'isolate-no-pass-through',
    rationale:
      'Default: isolate both hosts and do not promise dock-powered pass-through.',
    boundary:
      'The detailed VBUS, VCONN and discharge policy must come from the accepted reference design.',
    choices: [
      {
        value: 'isolate-no-pass-through',
        label: 'Isolate both hosts; no pass-through promise',
      },
      { value: 'other', label: 'Other (explain below)' },
    ],
  },
  {
    id: 'switching',
    title: '6. Switching experience',
    question: 'What should the v1 validation plan target for switching?',
    defaultValue: 'record-before-promise',
    rationale:
      'Default: record each switching stage first; do not promise a time until the supported path is measured.',
    boundary:
      'The owner can set a desired experience, but vendor/reference timing and safety checks control the actual sequence.',
    choices: [
      {
        value: 'record-before-promise',
        label: 'Record before making a time promise',
      },
      {
        value: 'target-under-10-seconds',
        label: 'Aim for under 10 seconds, subject to validation',
      },
      { value: 'other', label: 'Other (explain below)' },
    ],
  },
  {
    id: 'status',
    title: '7. Status surface',
    question: 'What should the indicator or optional display communicate?',
    defaultValue: 'truthful-minimal',
    rationale:
      'Default: selected host plus switching, waiting and fault state. Add PD/link facts only when the controller supports them.',
    boundary:
      'It must not imply live throughput, compliance or host activity without named evidence.',
    choices: [
      {
        value: 'truthful-minimal',
        label: 'Selected host and truthful state only',
      },
      {
        value: 'supported-pd-link',
        label: 'Also show controller-supported PD/link facts',
      },
      { value: 'other', label: 'Other (explain below)' },
    ],
  },
  {
    id: 'mechanical-envelope',
    title: '8. Mechanical envelope',
    question: 'What physical-size boundary should define a successful v1?',
    defaultValue: 'defer-until-measured',
    rationale:
      'Default: keep the three-port main unit, onboard control and protected remote-pod connector minimal, but defer a hard size promise until the released PCB and thermal map are measured.',
    boundary:
      'A compact intention is not a dimension. Choose a maximum below only as an owner target; PCB clearances, cable bend space, insulation and cooling can require a reviewed change.',
    choices: [
      {
        value: 'defer-until-measured',
        label: 'Defer exact size until PCB and thermal measurements',
      },
      {
        value: 'target-180x120x45',
        label:
          'Target at most 180 × 120 × 45 mm, excluding power brick and cables',
      },
      { value: 'other', label: 'Other maximum (explain below)' },
    ],
  },
];

const labelFor = (decision: Decision, value: string) =>
  decision.choices.find((choice) => choice.value === value)?.label ?? value;

export function OwnerDecisionWorkbench() {
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      decisions.map((decision) => [decision.id, decision.defaultValue]),
    ),
  );
  const [notes, setNotes] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'unavailable'>(
    'idle',
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            answers?: Record<string, string>;
            notes?: string;
          };
          if (parsed.answers)
            setAnswers((current) => ({ ...current, ...parsed.answers }));
          if (typeof parsed.notes === 'string') setNotes(parsed.notes);
        }
      } catch {
        // Local storage is optional; the form remains usable when it is unavailable.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ answers, notes }),
      );
    } catch {
      // A privacy mode may deny storage; do not interrupt the decision flow.
    }
  }, [answers, hydrated, notes]);

  const response = useMemo(
    () =>
      [
        'TB4 KVM v1 owner decision response',
        '',
        ...decisions.map(
          (decision) =>
            `${decision.title.replace(/^\d+\. /, '')}: ${labelFor(decision, answers[decision.id])}`,
        ),
        '',
        `Notes or constraints: ${notes.trim() || '(none)'}`,
        '',
        'I understand these are product choices, not electrical evidence, vendor-terms acceptance, purchase authorization, or closure of issue #3.',
      ].join('\n'),
    [answers, notes],
  );

  const reset = () => {
    setAnswers(
      Object.fromEntries(
        decisions.map((decision) => [decision.id, decision.defaultValue]),
      ),
    );
    setNotes('');
    setCopyState('idle');
  };

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopyState('copied');
    } catch {
      setCopyState('unavailable');
    }
  };

  const downloadResponse = () => {
    const blob = new Blob([response], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'tb4-kvm-v1-owner-decisions.txt';
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(href);
    }, 0);
  };

  return (
    <section
      className="module-surface owner-decisions"
      aria-labelledby="decide-heading"
    >
      <div className="module-heading">
        <p className="eyebrow">Owner decision packet · local only</p>
        <h2 id="decide-heading">
          Choose the desk behaviour before engineering turns it into a testable
          requirement.
        </h2>
        <p>
          These are product choices, not proof that a controller, power path or
          dock can safely deliver them. Your draft stays in this browser; copy
          or download it when ready.
        </p>
      </div>

      <form aria-busy={!hydrated} onSubmit={(event) => event.preventDefault()}>
        <div className="owner-decision-list">
          {decisions.map((decision) => (
            <fieldset
              key={decision.id}
              className="owner-decision-card"
              disabled={!hydrated}
            >
              <legend>{decision.title}</legend>
              <p className="owner-question">{decision.question}</p>
              <p className="owner-default">
                <Check size={16} /> {decision.rationale}
              </p>
              <p className="owner-boundary">
                Engineering boundary: {decision.boundary}
              </p>
              <div className="owner-choices">
                {decision.choices.map((choice) => (
                  <label key={choice.value}>
                    <input
                      type="radio"
                      name={decision.id}
                      value={choice.value}
                      checked={answers[decision.id] === choice.value}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [decision.id]: choice.value,
                        }))
                      }
                    />
                    <span>{choice.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <label className="owner-notes" htmlFor="owner-decision-notes">
          <span>Notes or constraints</span>
          <textarea
            id="owner-decision-notes"
            disabled={!hydrated}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="For example: HOST A is the work laptop; prefer no automatic failover during a video call."
            rows={4}
          />
        </label>

        <div className="owner-response" aria-live="polite">
          <div>
            <p className="eyebrow">Copyable response</p>
            <p>This does not submit anything or adopt a choice.</p>
          </div>
          <pre>{response}</pre>
        </div>
        <div className="owner-actions">
          <Button type="button" onClick={copyResponse} disabled={!hydrated}>
            <Clipboard /> {copyState === 'copied' ? 'Copied' : 'Copy response'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={downloadResponse}
            disabled={!hydrated}
          >
            <Download /> Download text
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={reset}
            disabled={!hydrated}
          >
            <RotateCcw /> Reset to defaults
          </Button>
          {copyState === 'unavailable' && (
            <span className="owner-copy-warning">
              Copy was unavailable; select the text or download it instead.
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
