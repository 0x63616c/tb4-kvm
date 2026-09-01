# Pico 2 cross-build workflow review

Date: 2026-09-01

Reviewer: independent release-review agent with separate standards-axis review

Reviewed staged tree: `a5bd7575e5f05e85bb8d239927939843ee4010fb`

Verdict: **ACCEPT — no P0–P3 findings**

## Scope and evidence

The review covered workflow syntax and GitHub semantics, action and SDK pins,
recursive SDK submodules, Ubuntu 24.04 compiler/Newlib availability, Pico 2 and
RP2350A selectors, configure/build paths, expected ELF and no-UF2 assertions,
the absence of flashing and artifact upload, and the status/README claim
boundary.

The reviewer confirmed:

- the staged index exactly matched the named tree and contained only the new
  workflow plus its README/status updates;
- `actionlint` and `git diff --check` passed;
- a fresh SDK checkout resolved exact commit
  `98a542c1a62fb549ffb5d66a3e5892b06276b670`, its recorded recursive gitlinks,
  and the Pico 2/RP2350A identity verifier;
- the pinned `actions/checkout` commit resolves to v7;
- Ubuntu 24.04 exposes the named `gcc-arm-none-eabi` and
  `libnewlib-arm-none-eabi` packages, which are sufficient for this C-linked
  target; and
- the workflow contains no flash or artifact-upload operation.

## Evidence boundary

The review proves that the workflow is coherent and ready to run. It does not
prove the hosted cross-build result. ELF creation and absence of UF2 remain
pending until the workflow succeeds against the exact committed `main` head.
Even a successful run will be compile evidence only, not flashing, boot,
electrical or physical B1–B13 evidence.
