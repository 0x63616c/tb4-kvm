'use client';

import { Check, Clipboard, Download, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import catalog from '@/design/product-decisions/catalog.json';
import responseSchema from '@/design/product-decisions/response.schema.json';

const storageKey = 'tb4-kvm-v1-owner-decisions';
const decisions = catalog.decisions;
type Decision = (typeof decisions)[number];
const ownerAcknowledgement =
  responseSchema.$defs.ownerAcceptance.properties.acknowledgement.anyOf[1]
    .const;

const defaultAnswers = () =>
  Object.fromEntries(
    decisions.map((decision) => [decision.id, decision.defaultValue]),
  );

const labelFor = (decision: Decision, value: string) =>
  decision.options.find((option) => option.value === value)?.label ?? value;

function download(contents: string, type: string, filename: string) {
  const blob = new Blob([contents], { type });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(href);
  }, 0);
}

export function OwnerDecisionWorkbench() {
  const [answers, setAnswers] =
    useState<Record<string, string>>(defaultAnswers);
  const [notes, setNotes] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [textCopyState, setTextCopyState] = useState<
    'idle' | 'copied' | 'unavailable'
  >('idle');
  const [jsonCopyState, setJsonCopyState] = useState<
    'idle' | 'copied' | 'unavailable'
  >('idle');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            answers?: Record<string, string>;
            notes?: string;
          };
          if (parsed.answers) {
            setAnswers(
              Object.fromEntries(
                decisions.map((decision) => {
                  const savedValue = parsed.answers?.[decision.id];
                  const allowed = decision.options.some(
                    (option) => option.value === savedValue,
                  );
                  return [
                    decision.id,
                    allowed
                      ? (savedValue ?? decision.defaultValue)
                      : decision.defaultValue,
                  ];
                }),
              ),
            );
          }
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

  const jsonDraft = useMemo(
    () =>
      JSON.stringify(
        {
          schemaVersion: 1,
          catalogIssue: catalog.issue,
          responseStatus: 'DRAFT',
          answers: decisions.map((decision) => ({
            decisionId: decision.id,
            value: answers[decision.id],
          })),
          notes,
          ownerAcceptance: {
            owner: null,
            date: null,
            evidence: null,
            acknowledgement: null,
          },
        },
        null,
        2,
      ),
    [answers, notes],
  );

  const notesRequired = decisions.some((decision) =>
    decision.options.some(
      (option) =>
        option.value === answers[decision.id] && option.requiresNotes === true,
    ),
  );
  const canExport = hydrated && (!notesRequired || Boolean(notes.trim()));

  const reset = () => {
    setAnswers(defaultAnswers());
    setNotes('');
    setTextCopyState('idle');
    setJsonCopyState('idle');
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setTextCopyState('copied');
    } catch {
      setTextCopyState('unavailable');
    }
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonDraft);
      setJsonCopyState('copied');
    } catch {
      setJsonCopyState('unavailable');
    }
  };

  return (
    <section
      className="module-surface owner-decisions"
      aria-labelledby="decide-heading"
    >
      <div className="module-heading">
        <p className="eyebrow">Accepted owner contract · option explorer</p>
        <h2 id="decide-heading">
          The eight v1 choices are accepted; explore what each option would have
          changed.
        </h2>
        <p>
          The authoritative response prefers Host A, promises up to 60 W only to
          the selected host, waits for a button after active-host removal, and
          validates the named OWC dock first. This browser-only form creates a
          draft for comparison; it cannot replace the accepted repository
          contract or prove that hardware can deliver it.
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
                {decision.options.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name={decision.id}
                      value={option.value}
                      checked={answers[decision.id] === option.value}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [decision.id]: option.value,
                        }))
                      }
                    />
                    <span>
                      {option.label}
                      {option.requiresNotes && ' — notes required'}
                    </span>
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
        {notesRequired && !notes.trim() && (
          <output className="owner-copy-warning">
            Add notes before exporting: the selected choice needs an
            explanation.
          </output>
        )}

        <div className="owner-response" aria-live="polite">
          <div>
            <p className="eyebrow">Copyable response</p>
            <p>This does not submit anything or adopt a choice.</p>
          </div>
          <pre>{response}</pre>
          <p className="owner-boundary">
            A separately recorded owner acceptance must use this exact
            acknowledgement: “{ownerAcknowledgement}”
          </p>
        </div>
        <div className="owner-actions">
          <Button type="button" onClick={copyText} disabled={!canExport}>
            <Clipboard />{' '}
            {textCopyState === 'copied' ? 'Copied' : 'Copy response'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              download(
                response,
                'text/plain;charset=utf-8',
                'tb4-kvm-v1-owner-decisions.txt',
              )
            }
            disabled={!canExport}
          >
            <Download /> Download text
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={copyJson}
            disabled={!canExport}
          >
            <Clipboard />{' '}
            {jsonCopyState === 'copied' ? 'Copied' : 'Copy JSON draft (local)'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              download(
                jsonDraft,
                'application/json;charset=utf-8',
                'tb4-kvm-v1-owner-decisions-draft.json',
              )
            }
            disabled={!canExport}
          >
            <Download /> Download JSON draft
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={reset}
            disabled={!hydrated}
          >
            <RotateCcw /> Reset to defaults
          </Button>
          {textCopyState === 'unavailable' && (
            <span className="owner-copy-warning">
              Text copy was unavailable; select the text or download it instead.
            </span>
          )}
          {jsonCopyState === 'unavailable' && (
            <span className="owner-copy-warning">
              JSON copy was unavailable; download it instead.
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
