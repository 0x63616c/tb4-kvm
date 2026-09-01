# Channel-budget contract review — 2026-09-01

## Scope

Independent high-consequence signal-integrity review of the issue #4 allocation method, schema, fixtures and deterministic validator.

Reviewed artifacts include:

- `docs/research/pcb1a-channel-budget-method.md`
- `design/channel-budget/schema.json`
- `design/channel-budget/prototype-a-example.json`
- `design/channel-budget/test-only-closed-fixture.json`
- `design/channel-budget/validate.mjs`
- `docs/PCB-1A-MEASUREMENT-METHOD.md`
- `design/pcb1a-measurement-matrix.json`
- `scripts/verify-pcb1a-plan.mjs`

## Review separation and economy

A lower-cost agent authored the initial method. A balanced implementation agent performed the substantive machine-contract remediations. A frontier SI reviewer remained independent throughout and repeatedly attacked the exact current tree. This use of a frontier reviewer was justified because a false channel-budget closure could authorize a costly high-speed PCB on invalid evidence.

## Review rounds

The first review rejected a static guard script that could close an empty allocation. It required real Draft 2020-12 validation, computed closure, coupled scenarios, frequency/reference-plane coverage, uncertainty/covariance semantics, delay/skew, mixed-mode mappings and mutation tests.

The second review found uncovered scenario/observable combinations, ignored GE return-loss logic, cosmetic covariance, incomplete topology/termination semantics and a validator absent from the repository gate.

The third review found validated-band reduction, comparable-condition skew, path/plane/termination traceability and synthetic-to-production relabeling gaps.

The fourth review reduced the remaining defect to differential-pair integrity: one inactive conductor or one selected measurement-path endpoint could be mislabeled while closure still passed.

All blocking findings were implemented and independently rerun. Findings were not waived.

## Final verified behavior

- The real Prototype-A example is `BLOCKED`, retains TBDs and cannot authorize a product/compliance claim.
- The only closed fixture is explicitly synthetic and test-only; it cannot be relabeled into production closure.
- Closure computes exact applicable scenario × required-observable coverage, multi-term allocation, in-band frequency reducers, LE/GE limits and nonnegative remaining margin.
- Signed coupling, return loss, group delay and comparable-condition four-lane skew are represented and checked.
- RSS, conservative-sum and covariance uncertainty models are recomputed and validated.
- Lanes, branches, P/N pairs, mixed-mode ordering, reference planes, termination networks, Hi-Z authority and selected measurement paths are cross-bound.
- Both conductors of an inactive differential pair require the declared termination; every selected endpoint and P/N partner requires measurement-port status.
- `npm run check` invokes `verify:channel-budget`.
- The validator passes the blocked real example and synthetic closure and rejects 24 adversarial false-closure mutations.

## Final result

The independent frontier rereview found no blocking Standards or Spec issue and judged GitHub issue #4 positively closable.

One nonblocking maintainability observation remains: lane identity is partly inferred from a pair-ID prefix. It does not create a demonstrated closure defect, but a future schema revision should replace prefix parsing with explicit typed lane references.

This review accepts the method/data contract only. It does not close the numeric allocation in issue #34, freeze a component, make PCB-1A or Prototype A order-ready, or prove USB4/Thunderbolt compliance.
