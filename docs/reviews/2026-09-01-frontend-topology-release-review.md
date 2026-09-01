# Frontend and PCB-1A topology release review

Date: 2026-09-01

Reviewed staged tree: `04b778572ad233c3dc7dd3f0901075078dd43316`

Artifact authors: `/root/pico_firmware_frontier`,
`/root/controller_bench_acquisition`, and `/root/unblocked_frontier_audit`

Independent reviewer: `/root/release_gate_review`, with separate standards and
spec axes

Final result: **ACCEPT — after the initial blocked tree was corrected and independently re-reviewed**

Initial tree result: **BLOCK** for
`04b778572ad233c3dc7dd3f0901075078dd43316`

## Inputs

The review covered all 19 staged files in the null-backed Pico low-speed
frontend and proposed RF-only PCB-1A topology tranche, the canonical measurement
method, repository operating rules, evidence ledger, status integration, prior
review records, host/UBSan tests, full repository gate and target ABI/frame
inspection.

## Initial findings and final dispositions

| ID | Severity | Finding | Disposition |
| --- | --- | --- | --- |
| R-001 | P1 | `main()` reserved a 2,160-byte automatic frontend before callees/interrupts, exceeding the pinned Pico SDK's 2,048-byte default stack. | **CLOSED IN FINAL RE-REVIEW.** The inert frontend is now file-scope static/BSS storage. |
| R-002 | P1 | Review records omitted required author/reviewer/severity data while status and ledger called the work independently reviewed. | **CLOSED IN FINAL RE-REVIEW.** Both domain records now identify authors/reviewers, findings, severities and dispositions; the blocked review is retained. |
| R-003 | P2 | The claimed UBSan result lacked a reproducible retained command. | **CLOSED IN FINAL RE-REVIEW.** `test-host-ubsan.sh` retains the strict C11 sanitizer invocation and expected output. |
| R-004 | P1 | Branch roles, freeze status, review gates and compliance-like fixture prose could mutate while validation passed. | **CLOSED IN FINAL RE-REVIEW.** Exact semantic locks and adversarial mutants were added. |
| R-005 | P1 | Four generic fixture instances contradicted the canonical per-materially-distinct-launch/escape multiplicity requirement. | **CLOSED IN FINAL RE-REVIEW.** The contract now defines exact fixture classes/multiplicity rules while physical counts remain blocked and `null`. |
| R-006 | P1 | The one-path four-port campaign failed to account for every unmeasured conductor. | **CLOSED IN FINAL RE-REVIEW.** The final rule partitions all 24 ports into four measured endpoints, the eight-port inactive bundle under the selected matched/open state, and 12 other matched ports. |
| R-007 | P2 | The retained UBSan command allowed recovery, so a sanitizer diagnostic could still exit zero. | **CLOSED IN FINAL RE-REVIEW.** The script now passes `-fno-sanitize-recover=undefined`. |
| R-008 | P2 | The topology suite claimed 29 adversarial mutations while containing 28. | **CLOSED IN FINAL RE-REVIEW.** A state-applicability mutation is now the independently countable 29th case. |

## Evidence from blocked tree

`npm run check` and `git diff --cached --check` passed, including 113 core
checks, 39 frontend checks, 22 topology mutants, audit, evidence, links and site
build. The reviewer separately reproduced the 39-check UBSan pass and the
Cortex-M33 2,160-byte frame. Those green checks did not waive the findings.

At this blocked-tree stage, the record was not an acceptance. A different
independent reviewer still had to inspect the corrected exact staged tree.

## First corrected-tree re-review

Reviewer `/root/final_release_rereview` inspected exact staged tree
`64a9552e539df9ce1d5c62f6592b61218010f615`. It confirmed R-001 through R-006,
including an independent enumeration of 16 disjoint and exhaustive 4+8+12
campaign partitions, then blocked release on R-007 and R-008. Its focused tests
and full repository gate passed; those green results did not waive the two
evidence defects.

## Final corrected-tree acceptance

Independent reviewer `/root/final_release_rereview` accepted exact staged tree
`25e349a9b374f80e70b9367a8673a273270b2ddd` with no remaining findings. The
reviewer confirmed:

- all R-001 through R-008 dispositions are closed;
- the current 39-check UBSan suite passes and a deliberate signed-overflow probe
  exits `134`, proving sanitizer findings fail closed;
- exactly 29 checked-in topology mutations execute and reject;
- all 16 applicable path/state campaigns retain disjoint and exhaustive 4+8+12
  cable-end partitions; and
- `npm run check`, staged whitespace and exact-tree checks pass without changing
  the tree.

This accepts the source and proposed pre-schematic contract at the stated claim
boundaries. Exact-head GitHub Actions, Pages and Pico 2/RP2350 Arm cross-build
remain post-push gates. None proves flashing, wiring, boot, fabrication,
measurement, USB4/Thunderbolt compliance or the B1–B13 physical bench.
