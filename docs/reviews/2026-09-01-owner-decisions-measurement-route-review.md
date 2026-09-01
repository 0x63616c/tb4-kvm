# Owner decisions and measurement-route review — 2026-09-01

## Scope

Independent review of the exact staged tree after `5f88842`, covering:

- the issue-#3 owner decision packet and browser-local workbench;
- the issue-#6 optional measurement-route report, inventory and validator;
- package-gate, evidence-ledger and project-status integration; and
- local rendered behavior for the interactive workbench.

The two implementation workers were separate from the reviewer. A lower-cost
reviewer was appropriate because this checkpoint does not accept a schematic,
power design, signal-integrity model or manufacturing release.

## Findings and dispositions

The first review reported two P2 findings:

1. The packet omitted the mechanical-envelope question required by issue #3.
   An eighth decision now records either a deferred measured envelope, a stated
   planning maximum or an owner-supplied alternative. The copyable response and
   durable project status were updated consistently.
2. The download handler revoked its object URL immediately. It now appends the
   temporary anchor and defers anchor removal and URL revocation until after the
   click task.

Browser testing also exposed an early-interaction race: a choice made during
the first hydration tick could be replaced by the saved/default draft. The
form now reports `aria-busy` and disables its controls until local state has
loaded.

## Verification

The complete repository gate passed after remediation, including formatting,
lint, type checking, the control/PCB-1A/channel-budget/collateral/measurement-
route/evidence/link validators, dependency audit, SBOM generation and the
production build.

A fresh local browser tab rendered eight decision cards with `aria-busy=false`.
A changed host choice and note appeared in copied text, survived a page reload,
and the reset control restored defaults. There was no console error. The
browser harness did not emit a blob-download event, so download behavior is
code-reviewed but not browser-proven; copy remains the verified export path.

The issue-#6 claims were checked against their linked current official sources
and the accepted PCB-1A measurement contract. The candidates remain
`PROPOSED_BLOCKED`; neither marketing bandwidth nor a rental listing is treated
as proof of calibration, uncertainty, raw-data delivery or publication terms.
The validator proves record structure only, not candidate capability.

## Result

The rereview found no remaining P0–P3 issue in scope. The owner-decision
workbench is independently review-complete and may be published as `REVIEWED`.
It does not adopt choices or close issue #3. The optional measurement route is
publishable as blocked research and does not block Prototype A.
