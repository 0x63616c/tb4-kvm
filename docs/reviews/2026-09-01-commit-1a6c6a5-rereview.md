# Independent re-review of commit 1a6c6a5

- Date: 2026-09-01
- Reviewed revision: `1a6c6a5b05ae3e7a8e51b66b225961e7024ae9c7`
- Reviewers: independent electrical/safety, PCB-1/manufacturing, and repository/release subagents
- Overall disposition: **accepted as a research baseline; rejected for PCB layout, fabrication or production firmware**

## Electrical findings

- P0: detach-confirmed states retained an active host source after loss of contract.
- P0: no executable interlock prevented a host source and its discharge network from being active together.
- P1: reset/fault labels overclaimed safety while safe0 was unknown and discharge was off.
- P1: fault and timeout edges were global assertions rather than explicit per-state structure.
- P1: the verifier pre-populated invariant IDs, so an unimplemented invariant could be counted.
- P1: READY regressed the selected PD policy from contracted to attached.
- P1: startup, idle, absent-host and failover behavior remained unmodeled.
- P2: downstream authorization depended on one magic status string.

## PCB-1/manufacturing findings

- P1: the validation plan asked the RF-only coupon to train a live 40 Gb/s link and test USB-C orientations/cables, which it cannot do.
- P1: the readiness checklist still permitted USB-C receptacles on PCB-1A.
- P1: “VNA/TDR” did not specify the calibrated mixed-mode measurement capability actually required.
- P2: PCB-1A criteria mixed unrelated firmware/PD gates and lacked operational PCBWay construction/traceability evidence.

## Repository/release findings

- P1: main was unprotected and sole-owner CODEOWNERS did not enforce independent review.
- P1: CI ignored 11 dependency advisories, including eight high severity.
- P1: the ledger trusted its own vocabulary and permitted unsafe/external evidence paths.
- P1: the baseline was labeled `MEASURED` without retained raw evidence.
- P2: dashboard counts omitted `PROPOSED`; evidence/blocker links were hidden; link/UI tests were absent; directory policy contradicted the tree; CAD schemas remain future work.

## Author response in progress

The follow-up working tree moves to control model v3, explicitly models source/discharge interlock and fault/timeout edges, downgrades the baseline, freezes PCB-1A as RF-only, clarifies VNA evidence, hardens ledger validation, updates/audits dependencies, adds SBOM verification and improves the dashboard. These are not closed until a new exact commit passes CI and independent re-review.
