# Independent electrical and safety audit

- Date: 2026-09-01
- Reviewer role: independent architecture/electrical-safety subagent
- Source state: pre-Git working tree before control-model v2
- Disposition: **rejected as schematic or firmware input**

## P0 findings

1. Downstream dock CC/PD/VBUS/VCONN ownership was absent. The self-powered dock can source charging power, so this is a complete power-role domain and a blocker.
2. The documented sequence applied host VBUS before legal attach ordering.
3. Attach, default VBUS and negotiated PD contract were collapsed into one state.
4. Orientation-aware routing occurred before orientation was known.
5. Discharge completion was not guarded by measured VBUS, FET readback, reverse-current check and timeout.
6. The verifier counted prose invariants without executing them or representing independent physical A/B enables.

## P1 findings

- Detach semantics contradicted the retained PD contract.
- Fault convergence, reset and recovery were prose-only.
- Wrong-port safety relied on labels.
- Evidence status overstated the model.
- Signal ground and shell/chassis were conflated.
- Downstream power behavior lacked owner acceptance.

## P2 findings

- Quantitative PD timing/voltage thresholds are missing pending vendor/spec evidence.
- Thermal fault loading and printed-enclosure material safety requirements are incomplete.
- Exact fabrication-release traceability is not yet implemented.

## Disposition and required re-review

The selectable-upstream/router direction is conditionally accepted. Signal coupons and isolated evaluation work are allowed. An integrated schematic/layout is not authorized. Re-review is required after downstream ownership, the v2 state model and the evidence claims are corrected.

## Author response

- Control model replaced with v2 independent command/readback fields, ordered attach phases, guarded measured discharge, reset/fault policy and executable checks.
- Downstream port added as an explicit unresolved ownership blocker.
- Ground and shell/chassis separated.
- Evidence claims downgraded.
- Wrong-role test requirements added.

These changes are responses, not closure. Closure requires independent re-review of the committed revision.
