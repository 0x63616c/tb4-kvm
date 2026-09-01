# Pico 2 cross-build correction review

Date: 2026-09-01

Reviewer: independent Pico cross-build release reviewer

Reviewed staged tree: `8afde1dcb833b8ac95f0bfc375487a4808713b7b`

Verdict: **ACCEPT — no blockers**

## Trigger

Exact-head workflow run
[`33549186026`](https://github.com/0x63616c/tb4-kvm/actions/runs/33549186026)
installed the Arm toolchain, fetched and verified the exact SDK and recursive
submodules, and configured Pico 2/RP2350A successfully. Compilation then failed
because target-wide `-Wpedantic -Werror` flags also applied to deliberate
function/object-pointer conversions in Pico SDK 2.3.0 `irq.c`.

## Disposition and review

The correction retains strict private flags on the portable controller-core
library and applies the same strict flags to this repository's `main.c` through
source-level `COMPILE_OPTIONS`. It removes the target-wide flags that were
incorrectly inherited by SDK sources.

The reviewer confirmed the exact index/tree match, correct CMake scoping and
minimum-version support, and passing `actionlint`, staged-diff, preset, evidence
and link checks. The README and status ledger preserve the failed-run evidence
and do not infer success.

## Remaining evidence boundary

A new exact-head hosted run must compile the ELF and pass the no-UF2 assertion
before cross-build evidence can be recorded. No flashing, boot, electrical or
physical bench claim follows from this correction.
