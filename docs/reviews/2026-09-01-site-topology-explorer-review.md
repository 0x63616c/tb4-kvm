# PCB-1A site topology explorer review

Date: 2026-09-01

Artifact author: `/root/site_topology_explorer`, integrated and corrected by
the primary agent.

Independent reviewer: `/root/final_release_rereview`.

Accepted staged tree: `113a2f3e750e064fdaccaf3e28526b3d83ae704b`.

Final result: **ACCEPT — no remaining P0-P3 findings**.

## Scope

The review covered the contract-driven PCB-1A explorer, shared path-selection
model, site verifier, responsive CSS, field-guide integration, evidence ledger,
project checkpoint and retained visual-QA record. It checked repository rules,
the authoritative PCB-1A topology contract, beginner-facing claim boundaries,
interaction semantics, responsive behavior and release evidence.

## Initial findings and dispositions

| ID | Severity | Finding | Disposition |
| --- | --- | --- | --- |
| SITE-001 | P2 | “Every state” overstated the 4 + 8 + 12 campaign rule because the two safe pathless states have no selected four-port path. | **CLOSED.** The UI now says every applicable selected campaign state. |
| SITE-002 | P2 | Source-substring assertions could miss a broken path lookup or removal of the mobile overflow correction. | **CLOSED.** Path selection is centralized in `lib/site-topology-model.mjs`; the verifier executes all eight lane/host mappings and all 16 applicable path/state campaigns, rejects three broken mapping/state mutations and locks responsive shrink, wrapping and 560 px stacking invariants. |

## Acceptance evidence

The reviewer independently confirmed:

- all eight D0-D3 x Host A/B mappings resolve the exact host and Common P/N
  endpoint ports;
- each selection has the two applicable matched/open states, yielding 16
  disjoint and exhaustive 4 measured + 8 inactive + 12 remaining campaigns;
- the UI remains keyboard-operable and semantically labeled with pressed-state
  buttons, fieldset legends and a live inspector;
- contract-derived `PROPOSED`/no-order boundaries do not imply a built,
  fabricated, measured, compliant or order-ready PCB;
- the website remains `MODELED`, PCB-1A remains `PROPOSED`, and manufacturing
  and measurement gates remain blocked;
- `git diff --cached --check`, focused verification and the full
  `npm run check` gate pass without changing the accepted tree.

Hosted exact-head CI, Pages, Pico cross-build and live desktop/mobile behavior
remain post-push release gates. This review accepts the website artifact only;
it is not an electrical, manufacturing or physical-hardware review.
