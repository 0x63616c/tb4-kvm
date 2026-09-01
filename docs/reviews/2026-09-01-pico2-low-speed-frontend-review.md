# Pico 2 low-speed frontend review

Date: 2026-09-01

Issue: [#18](https://github.com/0x63616c/tb4-kvm/issues/18)

Artifact authors: initial implementation task (`/root/pico_firmware_frontier`);
timestamp and static-storage correction task (`/root/controller_bench_acquisition`)

Reviewers: initial cross-review (`/root/controller_bench_acquisition`); blocked
combined exact-tree release review (`/root/release_gate_review`); final
independent re-review (`/root/final_release_rereview`)

Result: **ACCEPT — source reviewed; exact-head cross-build remains pending**

## Scope

Independent firmware review of the portable, null-backed low-speed frontend,
its deterministic host tests, the inert Pico target binding, documentation and
evidence boundary. The review did not cover GPIO wiring, a display protocol,
USB-C/PD, Thunderbolt, mux control, flashing or physical bench behaviour because
none of those implementations exists in this tranche.

## Finding resolved before acceptance

The initial implementation advanced very large `uint64_t` timestamp gaps using
repeated `uint32_t` ticks. That made one malformed sample capable of causing an
unbounded loop. The corrected API accepts at most `UINT32_MAX` milliseconds of
forward progress per sample and rejects a larger gap before mutating frontend or
controller state. Tests cover the exact accepted boundary, the first rejected
value and a byte-for-byte unchanged-state assertion.

## Findings and dispositions

| ID | Severity | Finding | Disposition |
| --- | --- | --- | --- |
| F-001 | P2 | Repeated 32-bit ticks could make a huge forward timestamp gap unbounded. | **FIXED** in `low_speed_frontend.c`; one `UINT32_MAX`-bounded tick is accepted and larger gaps reject before mutation. |
| F-002 | P1 | The inert binding placed the approximately 2.1 KiB frontend object in automatic `main()` stack storage, exceeding the pinned Pico SDK's default 2,048-byte reserved stack before callees or interrupts. | **CORRECTED AND ACCEPTED IN FINAL REVIEW**: `main.c` now uses file-scope static/BSS storage; `test-host.sh` verifies the source declaration, without claiming runtime stack proof. |
| F-003 | P1 | No ARM/Pico cross-build evidence exists for the current staged tree. | **OPEN POST-PUSH GATE**: the recorded CI build is compile-only evidence for its recorded commit. The source evidence state may remain `REVIEWED` only after the corrected exact staged tree passes independent review; release still requires a new exact-head hosted build. |
| F-004 | P2 | The first retained UBSan command allowed sanitizer recovery, so a diagnostic could still exit zero. | **CORRECTED AND ACCEPTED IN FINAL REVIEW**: `test-host-ubsan.sh` now uses `-fno-sanitize-recover=undefined`; a sanitizer finding is fail-closed. |

## Independent acceptance evidence

The reviewer accepted staged tree
`daccf37ed07ae3ba71637d90c1d7f41957949133` and confirmed:

- the portable controller core passes 113 host checks;
- the frontend passes 39 host checks and the same 39 checks under UBSan;
- oversized gaps are rejected before time, input, record or controller mutation;
- the frontend contains no GPIO, display, transport, PD, Thunderbolt, VBUS or
  power-path implementation;
- the inert Pico target disables USB and UART stdio and exposes no intent-output
  callback; and
- diagnostics remain abstract controller modes, not electrical or link-status
  claims.

The earlier acceptance applied to the previously reviewed frontend source. The
final review below covers the file-scope static-storage and fail-closed UBSan
corrections. The exact new `main` commit must also pass the hosted Pico 2/RP2350
Arm build. That is compile evidence only and will not prove flashing, wiring,
boot or the B1–B13 physical bench contract.

## Reproducible commands and evidence

Commands run for the corrected source:

```text
firmware/controller-pico2/test-host.sh
firmware/controller-pico2/test-host-ubsan.sh
```

Observed output:

```text
controller-pico2-main-storage: static/BSS frontend declaration verified (source-level only)
controller-pico2-core: 113 checks passed
controller-pico2-low-speed-frontend: 39 checks passed
controller-pico2-low-speed-frontend: 39 checks passed
```

The first frontend line is from the mandatory host test; the second is its
opt-in UBSan run. Neither is Pico runtime or stack-usage evidence.

## Final independent acceptance

Reviewer `/root/final_release_rereview` accepted exact staged tree
`25e349a9b374f80e70b9367a8673a273270b2ddd`. It confirmed the static/BSS
correction, fail-closed UBSan behaviour, 113 core checks, 39 frontend checks,
review metadata and retained no-hardware claim boundary. The hosted exact-head
Pico 2/RP2350 build remains required after push and remains compile evidence
only.
