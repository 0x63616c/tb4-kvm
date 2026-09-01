# PD-free controller prototype review

Date: 2026-09-01

Review author: Pauli (`/root/controller_release_review`), independent of the
implementation agents.

Integration/disposition author: primary agent (`/root`).

Scope: issue #18's host-executable JavaScript model, interactive model lab,
portable C11 core, isolated low-value bench plan and physical evidence contract.

## Exact review inputs

The review input is identified by Git blob ID, so later changes cannot be
silently treated as reviewed content.

| Git blob | Input |
|---|---|
| `a0dc2a898ce606e73e49f4de907e31c698292ced` | `firmware/controller-prototype/model.mjs` |
| `cd19b1be4ebf9c1ac384edb0466d7415aa404197` | `firmware/controller-prototype/test.mjs` |
| `2825e84b713f5a6cb368fadaf18d159840103c5f` | `firmware/controller-pico2/controller_core.h` |
| `df3c6d8f548f370945d7e43d9ad9ac9412b9d6f3` | `firmware/controller-pico2/controller_core.c` |
| `9d332e2fdd6e8394385396a7177025823b6a5239` | `firmware/controller-pico2/test_controller_core.c` |
| `21a2440929da11222611de0d29783a4589145e77` | `design/controller-bench/evidence-schema.json` |
| `2d2634f39da7ea3e2d0b0f3c14d861d47e70b42b` | `design/controller-bench/evidence.example.json` |
| `e826895b4fcdd2fc5e8ac6392e7b6c9a2aec288b` | `design/controller-bench/validate-evidence.mjs` |
| `575855cadcd2993727b108932db30f586edcd7b4` | `design/controller-bench/test-evidence.mjs` |
| `42a5a38dad74a2250255451fa7c5ab3bae691797` | `components/controller-prototype-lab.tsx` |
| `2778b5c51f344973bfef62172630aad991678a1f` | `docs/research/issue-18-controller-bench/README.md` |
| `4def6e5e9afdec9c246f054eaab10b84ebaebe61` | retained check/browser evidence |

## Initial result

**BLOCKED.** The independent reviewer found two P1 and two P2 release findings.

| Severity | Finding | Disposition |
|---|---|---|
| P1 | A `COMPLETED` bench record accepted nonexistent files and invented hashes, and did not bind evidence to its B-case. | Resolved: every physical artifact is repo-relative, in-root, a regular readable file and content-hash verified; firmware, wiring, power, all B1–B13 cases and review evidence are covered; case ownership/reuse and per-case required evidence kinds are checked; twenty adversarial mutants pass. |
| P1 | The review/ledger claim lacked named authorship, exact inputs, findings, severity, dispositions and retained evidence. | Resolved by this record, its blob-identified inputs and the retained evidence linked below. |
| P2 | The DRAFT example visually presented unrun placeholder cases as `PASS`. | Resolved: every unrun DRAFT case is `BLOCKED`; DRAFT cannot be reviewed or accepted. |
| P2 | Unchecked JavaScript config could set a history limit to `Infinity`, bypassing the bounded-log promise. | Resolved: config keys and finite safe-integer ranges are fail-closed; six invalid configurations are rejected. |

The reviewer found no defect in startup A/B/neither, no-auto-failover, storage
acknowledgement, pod restrictions, failure ordering, actual-model browser import,
Pico 2 isolation/ADC wording, package integration, links/accessibility or claim
boundaries. The new portable C core requires the exact-input re-review before
release.

## Verification evidence

- [`evidence/2026-09-01-controller-prototype-checks.md`](evidence/2026-09-01-controller-prototype-checks.md)
  records the passing mandatory gate, check counts and local browser scenarios.
- JavaScript model: 57 deterministic/adversarial checks.
- Portable C11 core: 113 host checks with warnings treated as errors.
- Bench evidence: synthetic completion passed with real retained temporary
  files; twenty malformed, semantically insufficient or unauthorized
  completion attempts were rejected.

## Claim boundary

The software model, portable core and proposed bench/evidence method remain
PD-free. No Pico has been acquired, flashed or wired. No target laptop, dock,
USB-C receptacle, VBUS, CC/PD, Thunderbolt or high-speed path has been tested.
The physical B1–B13 gate remains `BLOCKED`; this record cannot establish
electrical safety, USB4/TB4 operation, compliance or PCB order readiness.

## Exact-tree re-review

Result: **ACCEPT**.

Reviewer: Pauli (`/root/controller_release_review`).

Reviewed staged Git tree: `fbbf737fd0cec4ebafd76500d1dc03a43417ae04`.

The reviewer verified that the requested tree matched the index with no
unstaged changes; the full repository gate and staged whitespace check passed.
The re-review accepted the per-case evidence-kind enforcement and wrong-kind
mutant, the JavaScript and C11 controller implementations, the bench contract,
review metadata, package integration and the conservative proposed
validation-tool matrix. No P0–P3 findings remained.
